import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useId,
    useRef,
    useState,
    type HTMLAttributes,
    type KeyboardEvent,
    type ReactNode,
    type RefObject,
} from "react";

import { createPortal } from "react-dom";

import { cn } from "../../cn";

// ---------------------------------------------------------------------------------------------------- //

interface ControllableStateProps<T> {
    onChange?: (next: T) => void;
    defaultValue: T;
    value?: T;
}

type ControllableStateReturn<T> = [T, (next: T) => void];

export function useControllableState<T>({
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

const SelectActions = {
    None: -1,
    Open: 0,
    OpenFirst: 1,
    OpenCurrent: 2,
    OpenLast: 3,
    OpenTypeahead: 4,
    Select: 5,
    Previous: 6,
    Next: 7,
    First: 8,
    Last: 9,
    PageUp: 10,
    PageDown: 11,
    Typeahead: 12,
    Close: 13,
    CloseSelect: 14,
} as const;

type SelectAction = typeof SelectActions[keyof typeof SelectActions];

export const getSelectAction = (key: string, isOpen: boolean, hasAltKey = false): SelectAction => {
    if (!isOpen) switch (key) {
        case 'Enter': case ' ': case 'ArrowDown': return SelectActions.Open;
        case 'ArrowUp':
            return hasAltKey ? SelectActions.Open : SelectActions.OpenFirst;
        case 'Home': return SelectActions.OpenFirst;
        case 'End': return SelectActions.OpenLast;
    }

    if (/^[a-zA-Z0-9 ]$/.test(key)) return SelectActions.OpenTypeahead;

    else switch (key) {
        case 'ArrowUp': return hasAltKey ? SelectActions.CloseSelect : SelectActions.Previous;
        case 'ArrowDown': return SelectActions.Next;

        case 'Enter': case ' ': return SelectActions.Select;
        case 'Tab': return SelectActions.CloseSelect;
        case 'Escape': return SelectActions.Close;

        case 'PageDown': return SelectActions.PageDown;
        case 'PageUp': return SelectActions.PageUp;

        case 'Home': return SelectActions.First;
        case 'End': return SelectActions.Last;
    }

    if (/^[a-zA-Z0-9 ]$/.test(key)) return SelectActions.Typeahead;

    return SelectActions.None;
}

// ---------------------------------------------------------------------------------------------------- //

function findLastIndex<T>(array: T[], predicate: (item: T) => boolean): number {
    for (let i = array.length - 1; i >= 0; i--) if (predicate(array[i])) return i;
    return -1;
}

// ---------------------------------------------------------------------------------------------------- //

interface SelectItemEntry {
    id: string;
    value: string;
    textValue: string;
    disabled: boolean;
    element: HTMLElement | null;
}

interface SelectContextState {
    value: string;
    setValue: (value: string) => void;

    open: boolean;
    setOpen: (open: boolean) => void;

    textValue: string | null;
    setTextValue: (textValue: string | null) => void;

    cursor: number;
    setCursor: (cursor: number) => void;

    items: SelectItemEntry[];
    registerItem: (item: SelectItemEntry) => void;
    unregisterItem: (id: string) => void;

    typeaheadValue: string;
    setTypeaheadValue: (value: string) => void;
    typeaheadTimeout: number | null;
    setTypeaheadTimeout: (timeout: number | null) => void;

    activeDescendant: string | null;
}

const SelectContext = createContext<SelectContextState | null>(null);

function useSelectContext(): SelectContextState {
    const context = useContext(SelectContext);
    if (!context) throw new Error("useSelectContext must be used within a <Select> component");
    return context;
}

// ---------------------------------------------------------------------------------------------------- //

interface SelectProps extends HTMLAttributes<HTMLElement> {
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;

    defaultOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;

    dir?: "ltr" | "rtl";

    name?: string;
    disabled?: boolean;
    required?: boolean;

    children?: ReactNode;
}

// ---------------------------------------------------------------------------------------------------- //

function Select({
    defaultValue, onValueChange, value,
    defaultOpen, onOpenChange, open,
    children, className, ...props
}: SelectProps) {

    const [valueState, setValue] = useControllableState({
        defaultValue: defaultValue ?? '',
        onChange: onValueChange,
        value,
    });

    const [openState, setOpen] = useControllableState({
        defaultValue: defaultOpen ?? false,
        onChange: onOpenChange,
        value: open,
    });

    const [typeaheadTimeout, setTypeaheadTimeout] = useState<number | null>(null);
    const [textValue, setTextValue] = useState<string | null>(null);
    const [items, setItems] = useState<SelectItemEntry[]>([]);
    const [typeaheadValue, setTypeaheadValue] = useState('');
    const [cursor, setCursor] = useState(-1);
    const ref = useRef<HTMLDivElement>(null);

    const activeDescendant = cursor >= 0 && cursor < items.length ? items[cursor].id : null;

    const registerItem = useCallback((item: SelectItemEntry) => {
        setItems(prev => {
            const filtered = prev.filter(existingItem => existingItem.id !== item.id);

            const newItems = [...filtered, item].sort((a, b) => {
                if (!a.element || !b.element) return 0;
                const position = a.element.compareDocumentPosition(b.element);
                return position & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
            });

            return newItems;
        });
    }, []);

    const unregisterItem = useCallback((id: string) => {
        setItems(prev => prev.filter(item => item.id !== id));
    }, []);

    useEffect(() => {
        const handler = (event: MouseEvent) => {
            if (ref.current?.contains(event.target as Node)) return;
            if (openState) setOpen(false);
        }

        document.addEventListener('click', handler);
        return () => document.removeEventListener('click', handler);
    }, [openState, setOpen, ref])

    useEffect(() => {
        if (openState) return;
        setTypeaheadValue('');

        if (typeaheadTimeout) {
            clearTimeout(typeaheadTimeout);
            setTypeaheadTimeout(null);
        }
    }, [openState, typeaheadTimeout]);

    const context: SelectContextState = {
        value: valueState,
        setValue,

        open: openState,
        setOpen,

        textValue,
        setTextValue,

        cursor,
        setCursor,

        items,
        registerItem,
        unregisterItem,

        typeaheadValue,
        setTypeaheadValue,
        typeaheadTimeout,
        setTypeaheadTimeout,

        activeDescendant,
    }

    return (
        <SelectContext.Provider value={context}>
            <div data-ui="select" ref={ref} {...props} className={cn("relative w-fit", className)}>
                {children}
            </div>
        </SelectContext.Provider>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface SelectTriggerProps extends HTMLAttributes<HTMLElement> { }

function SelectTrigger({ className, children, ...props }: SelectTriggerProps) {
    const {
        open, setOpen, items, cursor, setCursor, setValue, setTextValue, value,
        typeaheadValue, setTypeaheadValue, typeaheadTimeout, setTypeaheadTimeout,
        activeDescendant
    } = useSelectContext();

    const clickHandler = () => setOpen(!open);

    const performTypeahead = useCallback((char: string) => {
        const newTypeaheadValue = typeaheadValue + char.toLowerCase();
        setTypeaheadValue(newTypeaheadValue);
        if (typeaheadTimeout) clearTimeout(typeaheadTimeout);

        const matchingIndex = items.findIndex(item =>
            !item.disabled && item.textValue.toLowerCase().startsWith(newTypeaheadValue)
        );

        if (matchingIndex >= 0) {
            setCursor(matchingIndex);
            const item = items[matchingIndex];
            if (item.element) item.element.scrollIntoView({ block: 'nearest' });
        }

        const timeout = window.setTimeout(() => {
            setTypeaheadValue('');
            setTypeaheadTimeout(null);
        }, 1000);

        setTypeaheadTimeout(timeout);
    }, [typeaheadValue, typeaheadTimeout, items, setCursor, setTypeaheadValue, setTypeaheadTimeout]);

    const keyDownHandler = (event: KeyboardEvent<HTMLButtonElement>) => {
        const action = getSelectAction(event.key, open, event.altKey);
        if (action !== SelectActions.None) event.preventDefault();

        switch (action) {
            case SelectActions.Open:
                setOpen(true);
                const selectedIndex = items.findIndex(item => item.value === value);
                setCursor(selectedIndex >= 0 ? selectedIndex : -1);
                break;

            case SelectActions.OpenFirst:
                setOpen(true);
                const firstEnabledIndex = items.findIndex(item => !item.disabled);
                setCursor(firstEnabledIndex >= 0 ? firstEnabledIndex : -1);
                break;

            case SelectActions.OpenLast:
                setOpen(true);
                const lastEnabledIndex = findLastIndex(items, (item: SelectItemEntry) => !item.disabled);
                setCursor(lastEnabledIndex >= 0 ? lastEnabledIndex : -1);
                break;

            case SelectActions.OpenCurrent:
                setOpen(true);
                const currentIndex = items.findIndex(item => item.value === value);
                setCursor(currentIndex >= 0 ? currentIndex : -1);
                break;

            case SelectActions.OpenTypeahead:
                setOpen(true);
                performTypeahead(event.key);
                break;

            case SelectActions.Select:
            case SelectActions.CloseSelect:
                if (cursor >= 0 && cursor < items.length) {
                    const selectedItem = items[cursor];
                    if (!selectedItem.disabled) {
                        setValue(selectedItem.value);
                        setTextValue(selectedItem.textValue);
                    }
                }

                setOpen(false);
                setCursor(-1);
                break;

            case SelectActions.Previous:
                if (cursor > 0) {
                    for (let i = cursor - 1; i >= 0; i--) if (!items[i].disabled) {
                        setCursor(i);
                        items[i].element?.scrollIntoView({ block: 'nearest' });
                        break;
                    }
                }

                else if (cursor === -1 && items.length > 0) {
                    const lastEnabledIndex = findLastIndex(items, (item: SelectItemEntry) => !item.disabled);

                    if (lastEnabledIndex >= 0) {
                        setCursor(lastEnabledIndex);
                        items[lastEnabledIndex].element?.scrollIntoView({ block: 'nearest' });
                    }
                }

                break;

            case SelectActions.Next:
                if (cursor < items.length - 1) for (let i = cursor + 1; i < items.length; i++) {
                    if (!items[i].disabled) {
                        setCursor(i);
                        items[i].element?.scrollIntoView({ block: 'nearest' });
                        break;
                    }
                }

                else if (cursor === -1 && items.length > 0) {
                    const firstEnabledIndex = items.findIndex(item => !item.disabled);

                    if (firstEnabledIndex >= 0) {
                        setCursor(firstEnabledIndex);
                        items[firstEnabledIndex].element?.scrollIntoView({ block: 'nearest' });
                    }
                }

                break;

            case SelectActions.First:
                if (items.length > 0) {
                    const firstEnabledIndex = items.findIndex(item => !item.disabled);

                    if (firstEnabledIndex >= 0) {
                        setCursor(firstEnabledIndex);
                        items[firstEnabledIndex].element?.scrollIntoView({ block: 'nearest' });
                    }
                }

                break;

            case SelectActions.Last:
                if (items.length > 0) {
                    const lastEnabledIndex = findLastIndex(items, (item: SelectItemEntry) => !item.disabled);

                    if (lastEnabledIndex >= 0) {
                        setCursor(lastEnabledIndex);
                        items[lastEnabledIndex].element?.scrollIntoView({ block: 'nearest' });
                    }
                }

                break;

            case SelectActions.PageUp:
                if (items.length > 0 && cursor >= 0) {
                    const targetIndex = Math.max(0, cursor - 10);

                    for (let i = targetIndex; i >= 0; i--) if (!items[i].disabled) {
                        setCursor(i);
                        items[i].element?.scrollIntoView({ block: 'nearest' });
                        break;
                    }
                }

                break;

            case SelectActions.PageDown:
                if (items.length > 0 && cursor >= 0) {
                    const targetIndex = Math.min(items.length - 1, cursor + 10);

                    for (let i = targetIndex; i < items.length; i++) if (!items[i].disabled) {
                        setCursor(i);
                        items[i].element?.scrollIntoView({ block: 'nearest' });
                        break;
                    }
                }

                break;

            case SelectActions.Typeahead:
                performTypeahead(event.key);
                break;

            case SelectActions.Close:
                setOpen(false);
                setCursor(-1);
                break;

            default: break;
        }
    }

    return (
        <button
            data-ui="select-trigger"
            type="button"
            onClick={clickHandler}
            onKeyDown={keyDownHandler}
            aria-expanded={open}
            aria-haspopup="listbox"
            aria-activedescendant={activeDescendant || undefined}
            role="combobox"
            {...props}
            data-state={open ? "open" : "closed"}
            className={cn(
                "w-fit min-w-xs min-h-9 inline-flex items-center justify-between gap-2 px-3 py-2 rounded text-write border border-bound bg-weak-surface transition-colors",
                "focus:bg-surface focus:outline-none focus:ring-2 focus:ring-bound focus:ring-offset-1",
                "hover:bg-surface",
                className
            )}
        >
            {children}
        </button>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface SelectValueProps extends HTMLAttributes<HTMLElement> {
    placeholder?: ReactNode;
}

function SelectValue({ className, children, placeholder, ...props }: SelectValueProps) {
    const { textValue } = useSelectContext();

    const displayed = children ?? textValue ?? placeholder ?? '';

    return (
        <span data-ui="select-value" {...props} className={cn("text-sm font-medium text-write overflow-hidden truncate", className)}>
            {displayed}
        </span>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface SelectTriggerIndicatorProps extends HTMLAttributes<HTMLElement> { }

function SelectTriggerIndicator({ className, ...props }: SelectTriggerIndicatorProps) {
    const Icon = () => {
        return (
            <svg data-ui="select-trigger-indicator-icon"
                aria-hidden

                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
            >
                <path
                    d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                    fill="currentColor"
                    fillRule="evenodd"
                    clipRule="evenodd"
                />
            </svg>
        );
    }

    return (
        <span data-ui="select-trigger-indicator" aria-hidden {...props}
            className={cn("w-fit [&>svg]:size-4 text-write shrink-0", className)}
        >
            <Icon />
        </span>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface SelectPortalProps { container?: HTMLElement, children?: ReactNode }

export function SelectPortal({ container, children }: SelectPortalProps) {
    return createPortal(children, container || document.body);
}

// ---------------------------------------------------------------------------------------------------- //

interface SelectContentProps extends HTMLAttributes<HTMLElement> { }

export function SelectContent({
    children, className, ...props
}: SelectContentProps) {
    const { open } = useSelectContext();

    if (!open) return null;

    return (
        <div data-ui="select-content"
            data-state={open ? "open" : "closed"}
            role="listbox"
            className={cn(
                "absolute left-0 top-full z-10 mt-1 min-w-xs p-1.5 rounded-md shadow-lg border border-muted-bound bg-muted-surface",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface SelectViewportProps extends HTMLAttributes<HTMLElement> { }

export function SelectViewport({ children, className, ...props }: SelectViewportProps) {
    return (
        <div tabIndex={-1} data-ui="select-viewport" {...props} className={cn("[scrollbar-width:none] w-full max-h-96 overflow-y-auto", className)}>
            {children}
        </div>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface SelectItemContextState {
    textElementRef: RefObject<HTMLElement | null>;
    selected: boolean;
}

const SelectItemContext = createContext<SelectItemContextState | null>(null);

function useSelectItemContext(): SelectItemContextState {
    const context = useContext(SelectItemContext);
    if (!context) throw new Error("useSelectItemContext must be used within a <SelectItem> component");
    return context;
}

// ---------------------------------------------------------------------------------------------------- //

interface SelectItemProps extends HTMLAttributes<HTMLElement> {
    value?: string;
    disabled?: boolean;
    textValue?: string;
}

export function SelectItem({ children, className, value, disabled, textValue, ...props }: SelectItemProps) {
    const {
        setOpen, setValue, value: currentValue, setTextValue,
        registerItem, unregisterItem, cursor, items, setCursor
    } = useSelectContext();

    const ref = useRef<HTMLDivElement>(null);
    const textElementRef = useRef<HTMLElement>(null);
    const fallbackId = useId();
    const itemId = props.id ?? fallbackId;
    const selected = value === currentValue;
    const itemIndex = items.findIndex(item => item.id === itemId);
    const highlighted = itemIndex >= 0 && cursor === itemIndex;

    const context: SelectItemContextState = { textElementRef, selected }

    useEffect(() => {
        if (!value) return;

        const resolvedTextValue = textValue ??
            textElementRef?.current?.textContent ??
            ref?.current?.textContent ??
            value ??
            '';

        const item: SelectItemEntry = {
            id: itemId,
            value,
            textValue: resolvedTextValue,
            disabled: disabled ?? false,
            element: ref.current,
        };

        registerItem(item);
        return () => unregisterItem(itemId);

    }, [itemId, value, textValue, disabled, registerItem, unregisterItem]);

    const clickHandler = () => {
        if (disabled) return;
        if (value) setValue(value);
        setOpen(false);

        const resolvedTextValue = textValue ??
            textElementRef?.current?.textContent ??
            ref?.current?.textContent ??
            value ??
            '';

        setTextValue(resolvedTextValue);
    }

    const mouseEnterHandler = () => {
        if (disabled) return;
        if (itemIndex >= 0) setCursor(itemIndex);
    }

    return (
        <SelectItemContext.Provider value={context}>
            <div data-ui="select-item"
                
                aria-selected={selected}
                aria-disabled={disabled}
                role="option"
                id={itemId}
                ref={ref}
                
                onMouseEnter={mouseEnterHandler}
                onClick={clickHandler}
                
                data-state={selected ? 'checked' : 'unchecked'}
                data-highlighted={highlighted}
                data-disabled={disabled}

                className={cn(
                    "flex items-center justify-between w-full text-sm text-write py-2.5 px-1.5 rounded transition-colors cursor-pointer relative",
                    "data-[disabled='true']:opacity-50 data-[disabled='true']:cursor-not-allowed data-[disabled='true']:hover:bg-transparent",
                    "data-[highlighted='true']:bg-surface data-[highlighted='true']:ring-2 data-[highlighted='true']:ring-[red]",
                    "data-[state='checked']:font-medium",
                    className
                )}

                {...props}
            >
                {children}
            </div>
        </SelectItemContext.Provider>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface SelectItemTextProps extends HTMLAttributes<HTMLElement> { children?: string }

export function SelectItemText({ className, children, ...props }: SelectItemTextProps) {
    const { textElementRef } = useSelectItemContext();

    return (
        <span ref={textElementRef} data-ui="select-item-text" className={cn("flex-1 truncate", className)} {...props}>
            {children}
        </span>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface SelectItemIndicatorProps extends HTMLAttributes<HTMLElement> { }

export function SelectItemIndicator({ className, ...props }: SelectItemIndicatorProps) {
    const Icon = () => {
        return (
            <svg data-ui="select-item-indicator-icon"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
            >
                <path
                    d="M20.7071 5.29289C21.0976 5.68342 21.0976 6.31658 20.7071 6.70711L9.70711 17.7071C9.31658 18.0976 8.68342 18.0976 8.29289 17.7071L3.29289 12.7071C2.90237 12.3166 2.90237 11.6834 3.29289 11.2929C3.68342 10.9024 4.31658 10.9024 4.70711 11.2929L9 15.5858L19.2929 5.29289C19.6834 4.90237 20.3166 4.90237 20.7071 5.29289Z"
                    fill="currentColor"
                    fillRule="evenodd"
                    clipRule="evenodd"
                />
            </svg>
        );
    }

    const { selected } = useSelectItemContext();
    if (!selected) return null;

    return (
        <span data-ui="select-item-indicator" className={cn("w-fit [&>svg]:size-4 text-write shrink-0", className)} {...props}>
            <Icon />
        </span>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface SelectGroupContextState {
    groupId: string;
    labelElementRef: RefObject<HTMLElement | null>;
}

const SelectGroupContext = createContext<SelectGroupContextState | null>(null);

function useSelectGroupContext(): SelectGroupContextState {
    const context = useContext(SelectGroupContext);
    if (!context) throw new Error("useSelectGroupContext must be used within a <SelectGroup> component");
    return context;
}

// ---------------------------------------------------------------------------------------------------- //

interface SelectGroupProps extends HTMLAttributes<HTMLElement> { }

export function SelectGroup({ children, className, ...props }: SelectGroupProps) {
    const fallbackId = useId();
    const groupId = props.id ?? fallbackId;
    const labelElementRef = useRef<HTMLElement>(null);
    const labeledBy = labelElementRef?.current?.id ?? `${groupId}-label`;

    const context: SelectGroupContextState = { groupId, labelElementRef }

    return (
        <SelectGroupContext.Provider value={context}>
            <div data-ui="select-group"
                className={cn("w-full space-y-px py-1 px-1.5", className)}
                aria-labelledby={labeledBy}
                id={groupId}
                role="group"
                {...props}
            >
                {children}
            </div>
        </SelectGroupContext.Provider>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface SelectLabelProps extends HTMLAttributes<HTMLElement> { }

export function SelectLabel({ children, className, ...props }: SelectLabelProps) {
    const { groupId, labelElementRef } = useSelectGroupContext();
    const labelId = props.id ?? `${groupId}-label`;

    return (
        <span data-ui="select-label"
            className={cn("text-sm font-medium text-write", className)}
            ref={labelElementRef}
            id={labelId}
            {...props}
        >
            {children}
        </span>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface SelectSeparatorProps extends HTMLAttributes<HTMLElement> { }

export function SelectSeparator({ className, children, ...props }: SelectSeparatorProps) {
    return (
        <hr data-ui="select-separator"
            className={cn("w-full h-px text-muted-bound", className)}
            aria-orientation="horizontal"
            role="separator"
            {...props}
        >
            {children}
        </hr>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface ScrollUpButtonProps extends HTMLAttributes<HTMLElement> { }

export function SelectScrollUpButton({ className, ...props }: ScrollUpButtonProps) {
    const Icon = () => {
        return (
            <svg data-ui="select-scroll-up-icon"
                className="size-4 text-write shrink-0"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
            >
                <path
                    d="M11.2929 8.29289C11.6834 7.90237 12.3166 7.90237 12.7071 8.29289L18.7071 14.2929C19.0976 14.6834 19.0976 15.3166 18.7071 15.7071C18.3166 16.0976 17.6834 16.0976 17.2929 15.7071L12 10.4142L6.70711 15.7071C6.31658 16.0976 5.68342 16.0976 5.29289 15.7071C4.90237 15.3166 4.90237 14.6834 5.29289 14.2929L11.2929 8.29289Z"
                    fill="currentColor"
                    fillRule="evenodd"
                    clipRule="evenodd"
                />
            </svg>
        );
    }

    return (
        <button data-ui="select-scroll-up-button" type="button" {...props}
            className={cn("w-full flex justify-center py-1 hover:bg-surface transition-colors focus:bg-surface focus:outline-none", className)}
        >
            <Icon />
        </button>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface ScrollDownButtonProps extends HTMLAttributes<HTMLElement> { }

export function SelectScrollDownButton({ className, ...props }: ScrollDownButtonProps) {
    const Icon = () => {
        return (
            <svg data-ui="select-scroll-down-icon"
                className="size-4 text-write shrink-0"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
            >
                <path
                    d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                    fill="currentColor"
                    fillRule="evenodd"
                    clipRule="evenodd"
                />
            </svg>
        );
    }

    return (
        <button data-ui="select-scroll-down-button" type="button" {...props}
            className={cn("w-full flex justify-center py-1 hover:bg-surface transition-colors focus:bg-surface focus:outline-none", className)}
        >
            <Icon />
        </button>
    );
}

// ---------------------------------------------------------------------------------------------------- //



export const Test = () => {
    return (
        <Select>
            <SelectTrigger>
                <SelectValue placeholder="Select an option" />
                <SelectTriggerIndicator />
            </SelectTrigger>

            <SelectContent>
                <SelectScrollUpButton />

                <SelectViewport>
                    <SelectGroup>
                        <SelectLabel>Group 1</SelectLabel>
                        <SelectItem value="A"><SelectItemText>Orange</SelectItemText> <SelectItemIndicator /></SelectItem>
                        <SelectItem value="B"><SelectItemText>Apple</SelectItemText> <SelectItemIndicator /></SelectItem>
                        <SelectItem value="C"><SelectItemText>Peach</SelectItemText> <SelectItemIndicator /></SelectItem>
                    </SelectGroup>

                    <SelectSeparator />

                    <SelectGroup>
                        <SelectLabel>Group 2</SelectLabel>
                        <SelectItem disabled value="D"><SelectItemText>Carrot</SelectItemText> <SelectItemIndicator /></SelectItem>
                        <SelectItem textValue="Inner Potato Text Value" value="E"><SelectItemText>Potato</SelectItemText> <SelectItemIndicator /></SelectItem>
                        <SelectItem value="F"><SelectItemText>Tomato</SelectItemText> <SelectItemIndicator /></SelectItem>
                    </SelectGroup>

                    <SelectSeparator />

                    <SelectGroup>
                        <SelectLabel>Group 3</SelectLabel>
                        <SelectItem value="G"><SelectItemText>Mayo</SelectItemText> <SelectItemIndicator /></SelectItem>
                        <SelectItem value="H"><SelectItemText>Mustard</SelectItemText> <SelectItemIndicator /></SelectItem>
                        <SelectItem value="I"><SelectItemText>Ketchup</SelectItemText> <SelectItemIndicator /></SelectItem>
                    </SelectGroup>
                </SelectViewport>

                <SelectScrollDownButton />
            </SelectContent>
        </Select>
    );
}