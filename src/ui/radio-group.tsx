import {
    createContext,
    useCallback,
    useState,
    useContext,
    useRef,
    useEffect,
    useId,
    type HTMLAttributes,
    type KeyboardEvent,
    type RefObject,
} from "react";

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

const RadioGroupActions = {
    None: -1,
    Next: 0,
    Previous: 1,
    First: 4,
    Last: 5,
    Select: 6,
} as const;

type RadioGroupAction = typeof RadioGroupActions[keyof typeof RadioGroupActions];

function getRadioGroupAction(
    event: KeyboardEvent<HTMLButtonElement>,
    orientation: 'horizontal' | 'vertical'
): RadioGroupAction {
    const {
        None,
        Next,
        Previous,
        First,
        Last,
        Select,
    } = RadioGroupActions;

    switch (event.key) {
        case 'Enter': case ' ': return Select;

        case 'ArrowDown':
            if (orientation === 'vertical') return Next;
            return None;

        case 'ArrowUp':
            if (orientation === 'vertical') return Previous;
            return None;

        case 'ArrowRight':
            if (orientation === 'horizontal') return Next;
            return None;

        case 'ArrowLeft':
            if (orientation === 'horizontal') return Previous;
            return None;

        case 'Home': return First;
        case 'End': return Last;

        default: return None;
    }
}

// ---------------------------------------------------------------------------------------------------- //

type RadioItemRef = RefObject<HTMLButtonElement | null>;

interface RadioGroupContextState {
    value: string;
    onValueChange: (value: string) => void;
    disabled: boolean;
    required: boolean;
    name?: string;
    orientation: 'horizontal' | 'vertical';
    loop: boolean;
    dir: 'ltr' | 'rtl';
    itemRefs: Map<string, RadioItemRef>;
}

const RadioGroupContext = createContext<RadioGroupContextState | null>(null);

function useRadioGroupContext(): RadioGroupContextState {
    const context = useContext(RadioGroupContext);
    if (!context) throw new Error('useRadioGroupContext must be used within a RadioGroup');

    return context;
}

// ---------------------------------------------------------------------------------------------------- //

interface RadioGroupProps extends
    Omit<HTMLAttributes<HTMLElement>, 'onChange' | 'dir'> {
    defaultValue?: string;
    value?: string;
    onValueChange?: (value: string) => void;
    disabled?: boolean;
    name?: string;
    required?: boolean;
    orientation?: 'horizontal' | 'vertical';
    loop?: boolean;
    dir?: 'ltr' | 'rtl';
}

function RadioGroup({
    defaultValue = '',
    value,
    onValueChange,
    disabled = false,
    name,
    required = false,
    orientation = 'vertical',
    loop = true,
    dir = 'ltr',
    children,
    className,
    ...props
}: RadioGroupProps) {
    const [currentValue, setCurrentValue] = useControllableState({
        value,
        defaultValue,
        onChange: onValueChange,
    });

    const itemRefs = useRef(new Map<string, RadioItemRef>()).current;

    const contextValue: RadioGroupContextState = {
        value: currentValue,
        onValueChange: setCurrentValue,
        disabled,
        required,
        name,
        orientation,
        loop,
        dir,
        itemRefs,
    }

    return (
        <RadioGroupContext.Provider value={contextValue}>
            <div
                data-ui="radio-group"
                data-disabled={disabled || undefined}
                data-orientation={orientation}

                role="radiogroup"
                aria-required={required || undefined}
                aria-orientation={orientation}

                className={cn(
                    'flex',
                    'data-[orientation=vertical]:flex-col data-[orientation=vertical]:gap-2',
                    'data-[orientation=horizontal]:flex-row data-[orientation=horizontal]:gap-4',
                    className
                )}

                {...props}
            >
                {children}
            </div>
        </RadioGroupContext.Provider>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface RadioGroupItemContextState {
    checked: boolean;
    disabled: boolean;
}

const RadioGroupItemContext = createContext<RadioGroupItemContextState | null>(null);

function useRadioGroupItemContext(): RadioGroupItemContextState {
    const context = useContext(RadioGroupItemContext);
    if (!context) throw new Error('useRadioGroupItemContext must be used within a RadioGroupItem');

    return context;
}

// ---------------------------------------------------------------------------------------------------- //

interface RadioGroupItemProps extends
    Omit<HTMLAttributes<HTMLButtonElement>, 'onChange'> {
    value: string;
    disabled?: boolean;
}

function RadioGroupItem({
    value,
    disabled = false,
    children,
    className,
    onKeyDown,
    onFocus,
    ...props
}: RadioGroupItemProps) {
    const {
        value: groupValue,
        onValueChange,
        disabled: groupDisabled,
        required,
        name,
        orientation,
        loop,
        itemRefs,
    } = useRadioGroupContext();

    const itemRef = useRef<HTMLButtonElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const itemId = useId();

    const itemDisabled = disabled || groupDisabled;
    const checked = groupValue === value;

    useEffect(() => {
        itemRefs.set(value, itemRef);
        return () => { itemRefs.delete(value) }
    }, [value, itemRefs]);

    const focusHandler = useCallback((event: React.FocusEvent<HTMLButtonElement>) => {
        onFocus?.(event);
    }, [onFocus]);

    const clickHandler = useCallback(() => {
        if (!itemDisabled) onValueChange(value);
    }, [itemDisabled, value, onValueChange]);

    const getTabIndex = useCallback(() => {
        if (checked) return 0;

        const enabledItems = Array.from(itemRefs.entries())
            .filter(([_, ref]) => !ref.current?.disabled)
            .map(([itemValue]) => itemValue);

        return enabledItems[0] === value ? 0 : -1;
    }, [checked, value, itemRefs]);

    const handleKeyDown = useCallback((event: KeyboardEvent<HTMLButtonElement>) => {
        if (itemDisabled) return;

        const action = getRadioGroupAction(event, orientation);
        const { None, Next, Previous, First, Last, Select } = RadioGroupActions;

        if (action === None) {
            onKeyDown?.(event);
            return;
        }

        event.preventDefault();

        if (action === Select) {
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

        const focusAndSelect = (index: number) => {
            const nextValue = enabledItemRefs[index];
            const nextRef = itemRefs.get(nextValue);

            if (nextRef?.current) {
                nextRef.current.focus();
                onValueChange(nextValue);
            }
        }

        switch (action) {
            case Next:
                focusAndSelect(getNextIndex(1));
                break;

            case Previous:
                focusAndSelect(getNextIndex(-1));
                break;

            case First:
                focusAndSelect(0);
                break;

            case Last:
                focusAndSelect(enabledItemRefs.length - 1);
                break;
        }

        onKeyDown?.(event);
    }, [itemDisabled, value, itemRefs, orientation, loop, onValueChange, clickHandler, onKeyDown]);

    const itemContextValue: RadioGroupItemContextState = {
        checked,
        disabled: itemDisabled,
    }

    return (
        <RadioGroupItemContext.Provider value={itemContextValue}>
            <button
                data-ui="radio-group-item"
                data-state={checked ? 'checked' : 'unchecked'}
                data-disabled={itemDisabled || undefined}

                role="radio"
                aria-checked={checked}

                ref={itemRef}
                id={itemId}
                type="button"
                tabIndex={getTabIndex()}
                disabled={itemDisabled}

                onClick={clickHandler}
                onKeyDown={handleKeyDown}
                onFocus={focusHandler}

                className={cn(
                    'inline-flex items-center justify-center size-4 rounded-full border border-bound cursor-pointer',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-outer-bound',
                    'data-[state=checked]:border-primary-surface',
                    'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
                    'hover:border-primary-surface',
                    className
                )}

                {...props}
            >
                {children}
            </button>

            {name && checked && (
                <input
                    ref={inputRef}
                    type="radio"
                    name={name}
                    value={value}
                    checked={checked}
                    required={required}
                    disabled={itemDisabled}
                    onChange={() => { }}
                    aria-hidden="true"
                    tabIndex={-1}
                    style={{
                        position: 'absolute',
                        pointerEvents: 'none',
                        opacity: 0,
                        margin: 0,
                        width: 0,
                        height: 0,
                    }}
                />
            )}
        </RadioGroupItemContext.Provider>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface RadioGroupItemIndicatorProps extends HTMLAttributes<HTMLElement> {
    forceMount?: boolean;
}

function RadioGroupItemIndicator({
    forceMount = false,
    className,
    ...props
}: RadioGroupItemIndicatorProps) {
    const { checked, disabled } = useRadioGroupItemContext();
    const shouldShow = forceMount || checked;

    if (!shouldShow) return null;

    return (
        <span
            data-ui="radio-group-item-indicator"
            data-disabled={disabled || undefined}
            data-state={checked ? 'checked' : 'unchecked'}

            aria-hidden="true"

            className={cn(
                'size-2 rounded-full transition-all duration-150 bg-primary-surface',
                'data-[disabled]:opacity-50',
                className
            )}

            {...props}
        />
    );
}

// ---------------------------------------------------------------------------------------------------- //

export {
    RadioGroup,
    RadioGroupItem,
    RadioGroupItemIndicator,
}

export type {
    RadioGroupProps,
    RadioGroupItemProps,
    RadioGroupItemIndicatorProps,
}

// ---------------------------------------------------------------------------------------------------- //