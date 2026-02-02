import {
    createContext,
    useContext,
    useCallback,
    useMemo,
    useRef,
    useState,
    useEffect,
    type HTMLAttributes,
    type KeyboardEvent,
    type RefObject,
} from "react";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/cn";

// ---------------------------------------------------------------------------------------------------- //

interface ControllableStateProps<T> {
    onChange?: (next: T) => void;
    defaultValue: T;
    value?: T;
}

type ControllableStateReturn<T> = [T, (next: T) => void];

function useControllableState<T>({
    defaultValue,
    onChange,
    value,
}: ControllableStateProps<T>): ControllableStateReturn<T> {
    const [internal, setInternal] = useState<T>(defaultValue);
    const isControlled = value !== undefined;
    const state = isControlled ? value : internal;

    const setState = useCallback((next: T) => {
        if (!isControlled) setInternal(next);
        onChange?.(next);
    }, [isControlled, onChange]);

    return [state, setState] as const;
}

// ---------------------------------------------------------------------------------------------------- //

const ToggleGroupActions = {
    None: -1,
    Toggle: 0,
    Next: 1,
    Previous: 2,
    First: 3,
    Last: 4,
} as const;

type ToggleGroupAction = typeof ToggleGroupActions[keyof typeof ToggleGroupActions];

const getToggleGroupAction = (
    event: KeyboardEvent<HTMLButtonElement>,
    orientation: 'horizontal' | 'vertical',
): ToggleGroupAction => {
    const {
        Toggle,
        Next,
        Previous,
        First,
        Last,
        None,
    } = ToggleGroupActions;

    switch (event.key) {
        case 'Enter': case ' ': return Toggle;

        case 'ArrowRight':
            if (orientation === 'horizontal') return Next;
            return None;

        case 'ArrowLeft':
            if (orientation === 'horizontal') return Previous;
            return None;

        case 'ArrowDown':
            if (orientation === 'vertical') return Next;
            return None;

        case 'ArrowUp':
            if (orientation === 'vertical') return Previous;
            return None;

        case 'Home': return First;
        case 'End': return Last;

        default: return None;
    }
}

// ---------------------------------------------------------------------------------------------------- //

type ItemRef = RefObject<HTMLButtonElement | null>;

interface ToggleGroupContextBaseState {
    disabled: boolean;
    orientation: 'horizontal' | 'vertical';
    itemRefs: Map<string, ItemRef>;
    rovingFocus: boolean;
    loop: boolean;
}

interface SingleToggleGroupContextState extends ToggleGroupContextBaseState {
    type: 'single';
    value?: string;
    onValueChange: (value?: string) => void;
}

interface MultipleToggleGroupContextState extends ToggleGroupContextBaseState {
    type: 'multiple';
    value: string[];
    onValueChange: (value: string[]) => void;
}

type ToggleGroupContextState = SingleToggleGroupContextState | MultipleToggleGroupContextState;

const ToggleGroupContext = createContext<ToggleGroupContextState | null>(null);

function useToggleGroupContext(): ToggleGroupContextState {
    const context = useContext(ToggleGroupContext);
    if (!context) throw new Error("useToggleGroupContext must be used within a ToggleGroup component");

    return context;
}

// ---------------------------------------------------------------------------------------------------- //

const toggleGroupItemVariants = cva(
    cn(
        'w-fit inline-flex items-center justify-center gap-2 rounded shrink-0 font-medium whitespace-nowrap cursor-pointer ring-offset-2 transition-all',
        '[&_svg]:pointer-events-none [&_svg:not([class*="size-"])]:size-4 [&_svg]:shrink-0',
        'focus-visible:outline-none focus-visible:ring-offset-muted-bound focus-visible:ring-outer-bound focus-visible:ring-2',
        'disabled:cursor-not-allowed disabled:opacity-70 disabled:pointer-events-none',
        'aria-invalid:ring-danger aria-invalid:border-danger',
    ),
    {
        variants: {
            variant: {
                default: cn(
                    'text-write hover:bg-muted-surface',
                    'data-[state=on]:bg-muted-surface'
                ),
                outline: cn(
                    'border border-bound text-write bg-surface hover:bg-muted-surface',
                    'data-[state=on]:bg-muted-surface'
                ),
            },
            size: {
                default: 'px-4 h-8 text-sm',
                sm: 'px-3 h-7 text-xs',
                lg: 'px-5 h-9 text-sm',
                'icon-sm': 'size-7',
                icon: 'size-8',
                'icon-lg': 'size-9',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    }
);

// ---------------------------------------------------------------------------------------------------- //

interface ToggleGroupBaseProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
    disabled?: boolean;
    orientation?: 'horizontal' | 'vertical';
    rovingFocus?: boolean;
    loop?: boolean;
}

// ---------------------------------------------------------------------------------------------------- //

interface ToggleGroupSingleProps extends ToggleGroupBaseProps {
    type?: 'single';
    value?: string;
    defaultValue?: string;
    onValueChange?: (value?: string) => void;
}

function ToggleGroupSingle({
    value,
    defaultValue,
    onValueChange,
    disabled = false,
    orientation = 'horizontal',
    rovingFocus = true,
    loop = true,
    children,
    className,
    ...props
}: ToggleGroupSingleProps) {
    const [currentValue, setCurrentValue] = useControllableState({
        value,
        defaultValue,
        onChange: onValueChange,
    });

    const itemRefs = useRef(new Map<string, ItemRef>()).current;

    const handleValueChange = useCallback((newValue?: string) => {
        setCurrentValue(newValue);
    }, [setCurrentValue]);

    const contextValue = useMemo<SingleToggleGroupContextState>(() => ({
        type: 'single',
        value: currentValue,
        onValueChange: handleValueChange,
        disabled,
        orientation,
        itemRefs,
        rovingFocus,
        loop,
    }), [
        currentValue,
        handleValueChange,
        disabled,
        orientation,
        itemRefs,
        rovingFocus,
        loop,
    ]);

    const isSplit = className?.includes('gap-');

    return (
        <ToggleGroupContext.Provider value={contextValue}>
            <div
                data-ui="toggle-group"
                data-orientation={orientation}
                data-type="single"
                data-disabled={disabled || undefined}
                data-split={isSplit ? 'true' : 'false'}
                role="group"
                className={cn(
                    'group/toggle-group rounded flex w-fit flex-row items-center',
                    'data-[orientation=horizontal]:flex-row data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch',
                    className
                )}
                {...props}
            >
                {children}
            </div>
        </ToggleGroupContext.Provider>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface ToggleGroupMultipleProps extends ToggleGroupBaseProps {
    type: 'multiple';
    value?: string[];
    defaultValue?: string[];
    onValueChange?: (value: string[]) => void;
}

function ToggleGroupMultiple({
    value,
    defaultValue,
    onValueChange,
    disabled = false,
    orientation = 'horizontal',
    rovingFocus = true,
    loop = true,
    children,
    className,
    ...props
}: ToggleGroupMultipleProps) {
    const [currentValue, setCurrentValue] = useControllableState({
        value,
        defaultValue: defaultValue ?? [],
        onChange: onValueChange,
    });

    const itemRefs = useRef(new Map<string, ItemRef>()).current;

    const handleValueChange = useCallback((newValue: string[]) => {
        setCurrentValue(newValue);
    }, [setCurrentValue]);

    const contextValue: MultipleToggleGroupContextState = {
        type: 'multiple',
        value: currentValue,
        onValueChange: handleValueChange,
        disabled,
        orientation,
        itemRefs,
        rovingFocus,
        loop,
    }

    const isSplit = className?.includes('gap-');

    return (
        <ToggleGroupContext.Provider value={contextValue}>
            <div
                data-ui="toggle-group"
                data-orientation={orientation}
                data-type="multiple"
                data-disabled={disabled || undefined}
                data-split={isSplit ? 'true' : 'false'}
                role="group"
                className={cn(
                    'group/toggle-group rounded flex w-fit flex-row items-center',
                    'data-[orientation=horizontal]:flex-row data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch',
                    className
                )}
                {...props}
            >
                {children}
            </div>
        </ToggleGroupContext.Provider>
    );
}

// ---------------------------------------------------------------------------------------------------- //

type ToggleGroupProps = ToggleGroupSingleProps | ToggleGroupMultipleProps;

function ToggleGroup(props: ToggleGroupProps) {
    const { type } = props;
    if (type === 'single') return <ToggleGroupSingle {...props} />;
    return <ToggleGroupMultiple {...props as ToggleGroupMultipleProps} />;
}

// ---------------------------------------------------------------------------------------------------- //

interface ToggleGroupItemProps extends
    VariantProps<typeof toggleGroupItemVariants>,
    Omit<HTMLAttributes<HTMLButtonElement>, 'onChange'> {
    value: string;
    disabled?: boolean;
}

function ToggleGroupItem({
    value,
    disabled = false,
    variant,
    size,
    className,
    children,
    onKeyDown,
    onClick,
    ...props
}: ToggleGroupItemProps) {
    const toggleGroupContext = useToggleGroupContext();

    const {
        type,
        value: groupValue,
        onValueChange,
        disabled: groupDisabled,
        itemRefs,
        orientation,
        rovingFocus,
        loop,
    } = toggleGroupContext;

    const itemRef = useRef<HTMLButtonElement>(null);

    const itemDisabled = disabled || groupDisabled;

    const pressed = useMemo<boolean>(() => {
        if (type === 'single') return groupValue === value;
        return groupValue.includes(value);
    }, [type, groupValue, value]);

    const clickHandler = useCallback(() => {
        if (itemDisabled) return;

        if (type === 'single') {
            onValueChange(groupValue === value ? undefined : value);
        } else {
            onValueChange(groupValue.includes(value)
                ? groupValue.filter(item => item !== value)
                : [...groupValue, value]
            );
        }
    }, [type, groupValue, value, itemDisabled, onValueChange]);

    useEffect(() => {
        itemRefs.set(value, itemRef);
        return () => { itemRefs.delete(value) }
    }, [value, itemRefs]);

    const getTabIndex = useCallback(() => {
        if (!rovingFocus) return itemDisabled ? -1 : 0;

        const enabledItems = Array.from(itemRefs.entries())
            .filter(([_, ref]) => !ref.current?.disabled)
            .map(([itemValue]) => itemValue);

        if (enabledItems.length === 0) return -1;

        if (type === 'single') {
            if (groupValue && enabledItems.includes(groupValue)) {
                return enabledItems.indexOf(groupValue) === enabledItems.indexOf(value) ? 0 : -1;
            }
        } else {
            const pressedItems = enabledItems.filter(item => groupValue.includes(item));
            if (pressedItems.length > 0) {
                return pressedItems[0] === value ? 0 : -1;
            }
        }

        return enabledItems[0] === value ? 0 : -1;
    }, [rovingFocus, itemDisabled, itemRefs, type, groupValue, value]);

    const handleKeyDown = useCallback((event: KeyboardEvent<HTMLButtonElement>) => {
        if (itemDisabled) return;

        const action = getToggleGroupAction(event, orientation);
        const { None, Toggle, Next, Previous, First, Last } = ToggleGroupActions;

        if (action === None) {
            onKeyDown?.(event);
            return;
        }

        event.preventDefault();

        if (action === Toggle) {
            clickHandler();
            onKeyDown?.(event);
            return;
        }

        const enabledItemRefs = Array.from(itemRefs.entries())
            .filter(([_, ref]) => !ref.current?.disabled)
            .map(([itemValue]) => itemValue);

        const currentIndex = enabledItemRefs.indexOf(value);
        if (currentIndex === -1) return;

        const getNextIndex = (direction: 1 | -1): number => {
            const nextIndex = currentIndex + direction;

            if (loop) return (nextIndex + enabledItemRefs.length) % enabledItemRefs.length;
            return Math.max(0, Math.min(enabledItemRefs.length - 1, nextIndex));
        }

        const focusItem = (index: number) => {
            const nextValue = enabledItemRefs[index];
            const nextRef = itemRefs.get(nextValue);
            nextRef?.current?.focus();
        }

        switch (action) {
            case Next:
                focusItem(getNextIndex(1));
                break;

            case Previous:
                focusItem(getNextIndex(-1));
                break;

            case First:
                focusItem(0);
                break;

            case Last:
                focusItem(enabledItemRefs.length - 1);
                break;
        }

        onKeyDown?.(event);
    }, [itemDisabled, orientation, itemRefs, value, loop, clickHandler, onKeyDown]);

    const handleClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
        clickHandler();
        onClick?.(event);
    }, [clickHandler, onClick]);

    const itemVariant = variant || 'default';
    const itemSize = size || 'default';

    return (
        <button
            ref={itemRef}
            data-ui="toggle-group-item"
            data-state={pressed ? 'on' : 'off'}
            data-disabled={itemDisabled || undefined}
            data-value={value}
            data-orientation={orientation}
            data-variant={itemVariant}
            data-size={itemSize}

            role="button"
            aria-pressed={pressed}

            type="button"
            disabled={itemDisabled}
            tabIndex={getTabIndex()}
            className={cn(
                toggleGroupItemVariants({ variant: itemVariant, size: itemSize }),
                'shrink-0 focus:z-10 focus-visible:z-10',
                'group-data-[split=false]/toggle-group:rounded-none',
                'group-data-[split=false]/toggle-group:data-[orientation=horizontal]:first:rounded-l',
                'group-data-[split=false]/toggle-group:data-[orientation=vertical]:first:rounded-t',
                'group-data-[split=false]/toggle-group:data-[orientation=horizontal]:last:rounded-r',
                'group-data-[split=false]/toggle-group:data-[orientation=vertical]:last:rounded-b',
                'group-data-[split=false]/toggle-group:data-[orientation=horizontal]:data-[variant=outline]:border-l-0',
                'group-data-[split=false]/toggle-group:data-[orientation=vertical]:data-[variant=outline]:border-t-0',
                'group-data-[split=false]/toggle-group:data-[orientation=horizontal]:data-[variant=outline]:first:border-l',
                'group-data-[split=false]/toggle-group:data-[orientation=vertical]:data-[variant=outline]:first:border-t',
                className
            )}
            onKeyDown={handleKeyDown}
            onClick={handleClick}
            {...props}
        >
            {children}
        </button>
    );
}

// ---------------------------------------------------------------------------------------------------- //

export {
    ToggleGroup,
    ToggleGroupItem,
    type ToggleGroupProps,
    type ToggleGroupItemProps,
}

// ---------------------------------------------------------------------------------------------------- //