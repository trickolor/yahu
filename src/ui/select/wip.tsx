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

const SelectActions = {
    None: -1,
    Close: 0,
    Open: 1,
    Select: 2,
    First: 3,
    Last: 4,
    Previous: 5,
    Next: 6,
    PageUp: 7,
    PageDown: 8,
    Type: 9,
    FocusMove: 10,
} as const;

type SelectAction = typeof SelectActions[keyof typeof SelectActions];

const getSelectAction = (event: KeyboardEvent<HTMLButtonElement>, open: boolean): SelectAction => {
    const { key, altKey, ctrlKey, metaKey } = event;

    const openKeys = ['ArrowDown', 'ArrowUp', 'Enter', ' '];
    if (!open && openKeys.includes(key)) return SelectActions.Open;

    if (key === 'Home') return SelectActions.First;
    if (key === 'End') return SelectActions.Last;

    if (
        key === 'Backspace' ||
        key === 'Clear' ||
        key.length === 1 && key !== ' ' && !altKey && !ctrlKey && !metaKey
    ) return SelectActions.Type;

    if (open) switch (key) {
        case 'ArrowUp': return altKey ? SelectActions.Select : SelectActions.Previous;
        case 'ArrowDown': return altKey ? SelectActions.None : SelectActions.Next;
        case 'PageUp': return SelectActions.PageUp;
        case 'PageDown': return SelectActions.PageDown;
        case 'Escape': return SelectActions.Close;
        case 'Enter': case ' ': return SelectActions.Select;
        case 'Tab': return SelectActions.FocusMove;
    }

    return SelectActions.None;
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

    viewportRef: RefObject<HTMLDivElement | null>;
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

    const viewportRef = useRef<HTMLDivElement>(null);
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

    // Handle cursor positioning when select opens
    useEffect(() => {
        if (!openState) return;
        
        // Find the currently selected item and position cursor there
        const currentIndex = items.findIndex(item => item.value === valueState);
        if (currentIndex >= 0) {
            setCursor(currentIndex);
            // Scroll to the selected item when opening
            setTimeout(() => {
                if (!(currentIndex >= 0 && currentIndex < items.length)) return;
                const { element } = items[currentIndex];
                const viewport = viewportRef.current;
                if (element && viewport) {
                    const elementRect = element.getBoundingClientRect();
                    const viewportRect = viewport.getBoundingClientRect();
                    const elementTop = elementRect.top - viewportRect.top + viewport.scrollTop;
                    const elementHeight = elementRect.height;
                    const viewportHeight = viewport.clientHeight;
                    const scrollTop = elementTop - (viewportHeight / 2) + (elementHeight / 2);
                    viewport.scrollTo({ top: scrollTop, behavior: 'smooth' });
                }
            }, 0);
        } else {
            // If no item is selected, position cursor at first item
            setCursor(items.length > 0 ? 0 : -1);
        }
    }, [openState, items, valueState, viewportRef]);

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
        viewportRef,
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
        open, setOpen, items, cursor, setCursor, setValue, setTextValue,
        typeaheadValue, setTypeaheadValue, typeaheadTimeout, setTypeaheadTimeout,
        activeDescendant, viewportRef,
    } = useSelectContext();

    const clickHandler = () => setOpen(!open);

    const typeahead = useCallback((character: string) => {
        if (typeaheadTimeout) clearTimeout(typeaheadTimeout);

        const newTypeaheadValue = typeaheadValue + character;
        setTypeaheadValue(newTypeaheadValue);

        const enabledItems = items.filter(item => !item.disabled);

        if (character === typeaheadValue && typeaheadValue.length === 1) {
            const currentIndex = cursor >= 0 ? cursor : -1;
            const matchingItems = enabledItems.filter(item =>
                item.textValue.toLowerCase().startsWith(character.toLowerCase())
            );

            if (matchingItems.length > 0) {
                const currentMatchIndex = matchingItems.findIndex(item => items.indexOf(item) === currentIndex);
                const nextMatchIndex = (currentMatchIndex + 1) % matchingItems.length;
                const nextMatch = matchingItems[nextMatchIndex];
                const nextCursor = items.indexOf(nextMatch);
                setCursor(nextCursor);
            }
        }

        else {
            const matchingItem = enabledItems.find(item => item.textValue.toLowerCase().startsWith(newTypeaheadValue.toLowerCase()));

            if (matchingItem) {
                const matchingIndex = items.indexOf(matchingItem);
                setCursor(matchingIndex);
            }
        }

        const timeout = window.setTimeout(() => {
            setTypeaheadValue('');
            setTypeaheadTimeout(null);
        }, 1000);

        setTypeaheadTimeout(timeout);
    }, [
        open,
        setOpen,
        typeaheadTimeout,
        setTypeaheadTimeout,
        typeaheadValue,
        setTypeaheadValue,
        items,
        cursor,
        setCursor,
    ]);

    const keyDownHandler = (event: KeyboardEvent<HTMLButtonElement>) => {
        const action = getSelectAction(event, open);
        if (action !== SelectActions.None) event.preventDefault();

        const scroll = (index: number) => {
            if (!(index >= 0 && index < items.length)) return;

            const { element } = items[index];
            const viewport = viewportRef.current;

            if (element && viewport) {
                const elementRect = element.getBoundingClientRect();
                const viewportRect = viewport.getBoundingClientRect();

                const elementTop = elementRect.top - viewportRect.top + viewport.scrollTop;
                const elementHeight = elementRect.height;
                const viewportHeight = viewport.clientHeight;

                const scrollTop = elementTop - (viewportHeight / 2) + (elementHeight / 2);

                viewport.scrollTo({
                    top: scrollTop,
                    behavior: 'smooth'
                });
            }
        };

        switch (action) {
            case SelectActions.Open:
                if (!open) {
                    setOpen(true);
                    // Cursor positioning is handled by useEffect when openState changes
                }
                break;

            case SelectActions.First:
                if (!open) setOpen(true);
                setCursor(0);

                scroll(0);
                break;

            case SelectActions.Last:
                if (!open) setOpen(true);
                const lastIndex = items.length - 1;
                setCursor(lastIndex);

                scroll(lastIndex);
                break;

            case SelectActions.Previous:
                if (cursor > 0) {
                    const newCursor = cursor - 1;
                    setCursor(newCursor);
                    scroll(newCursor);
                }
                break;

            case SelectActions.Next:
                if (cursor < items.length - 1) {
                    const newCursor = cursor + 1;
                    setCursor(newCursor);
                    scroll(newCursor);
                }
                break;

            case SelectActions.PageUp:
                const pageUpCursor = Math.max(0, cursor - 10);
                setCursor(pageUpCursor);

                scroll(pageUpCursor);
                break;

            case SelectActions.PageDown:
                const pageDownCursor = Math.min(items.length - 1, cursor + 10);
                setCursor(pageDownCursor);

                scroll(pageDownCursor);
                break;

            case SelectActions.Type:
                if (!open) setOpen(true);
                typeahead(event.key);
                // The typeahead function handles cursor changes internally
                break;

            case SelectActions.Select:
                if (cursor >= 0 && cursor < items.length) {
                    setValue(items[cursor].value);
                    setTextValue(items[cursor].textValue);
                    if (open) setOpen(false);
                }

                break;

            case SelectActions.FocusMove:
                if (cursor >= 0 && cursor < items.length) {
                    setValue(items[cursor].value);
                    setTextValue(items[cursor].textValue);
                    if (open) setOpen(false);

                    const focusables = (Array.from(document.querySelectorAll('*')) as HTMLElement[])
                        .filter(i => i.tabIndex >= 0 && ('disabled' in i ? !i.disabled : true) && i.offsetParent !== null)

                    const nextFocusable = focusables[focusables.indexOf(event.target as HTMLButtonElement) + 1]
                    if (nextFocusable) nextFocusable.focus();
                }
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

function SelectPortal({ container, children }: SelectPortalProps) {
    return createPortal(children, container || document.body);
}

// ---------------------------------------------------------------------------------------------------- //

interface SelectContentProps extends HTMLAttributes<HTMLElement> { }

function SelectContent({
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

function SelectViewport({ children, className, ...props }: SelectViewportProps) {
    const { viewportRef } = useSelectContext();

    return (
        <div ref={viewportRef} tabIndex={-1} data-ui="select-viewport" {...props} className={cn("[scrollbar-width:none] w-full max-h-96 overflow-y-auto", className)}>
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

function SelectItem({ children, className, value, disabled, textValue, ...props }: SelectItemProps) {
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
        if (!value || disabled) return;

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

function SelectItemText({ className, children, ...props }: SelectItemTextProps) {
    const { textElementRef } = useSelectItemContext();

    return (
        <span ref={textElementRef} data-ui="select-item-text" className={cn("flex-1 truncate", className)} {...props}>
            {children}
        </span>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface SelectItemIndicatorProps extends HTMLAttributes<HTMLElement> { }

function SelectItemIndicator({ className, ...props }: SelectItemIndicatorProps) {
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

function SelectGroup({ children, className, ...props }: SelectGroupProps) {
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

function SelectLabel({ children, className, ...props }: SelectLabelProps) {
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

function SelectSeparator({ className, children, ...props }: SelectSeparatorProps) {
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

function SelectScrollUpButton({ className, ...props }: ScrollUpButtonProps) {
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

function SelectScrollDownButton({ className, ...props }: ScrollDownButtonProps) {
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



export function Test() {
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