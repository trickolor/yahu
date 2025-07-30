import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
    useRef,

    type SetStateAction,
    type HTMLAttributes,
    type KeyboardEvent,
    type ReactElement,
    type ReactNode,
    type Dispatch,

} from "react"

import { useOutsideClick } from "./hooks/use-outside-click";
import { Slot } from "./slot";
import { cn } from "../cn";

interface SelectItemData {
    ref: React.RefObject<HTMLDivElement | null>;
    index: number;
    value: string;
    label: string;
}

interface SelectContextState {
    contentViewRef: React.RefObject<HTMLDivElement | null>;
    triggerRef: React.RefObject<HTMLButtonElement | null>;
    contentRef: React.RefObject<HTMLDivElement | null>;

    setCursor: Dispatch<SetStateAction<number>>;
    cursor: number;

    valueToLabel: Record<string, string>;
    addItem(item: SelectItemData): void;
    removeItem(value: string): void;
    items: SelectItemData[];

    setValue(value: string): void;
    setOpen(open: boolean): void;

    placeholder?: string;
    dir: "ltr" | "rtl";
    value: string;
    open: boolean;
    
    // Typeahead state
    typeaheadQuery: string;
    setTypeaheadQuery: Dispatch<SetStateAction<string>>;
    
    // Helper functions
    getActiveOptionId(): string | undefined;
    scrollOptionIntoView(index: number): void;
}

const SelectActions = {
    None: -1,
    Open: 0,
    OpenFirst: 1,
    OpenCurrent: 2,
    OpenLast: 3,
    Select: 4,
    Previous: 5,
    Next: 6,
    First: 7,
    Last: 8,
    PageUp: 9,
    PageDown: 10,
    Typeahead: 11,
    Close: 12,
    CloseSelect: 13,
} as const;

const getActionFromKey = (key: string, isOpen: boolean, hasAltKey = false): typeof SelectActions[keyof typeof SelectActions] => {
    // Closed combobox actions
    if (!isOpen) {
        switch (key) {
            case 'ArrowDown':
                return hasAltKey ? SelectActions.Open : SelectActions.Open;
            case 'ArrowUp':
                return SelectActions.OpenFirst;
            case 'Enter':
            case ' ':
                return SelectActions.Open;
            case 'Home':
                return SelectActions.OpenFirst;
            case 'End':
                return SelectActions.OpenLast;
        }
        
        // Printable characters when closed
        if (/^[a-zA-Z0-9]$/.test(key)) {
            return SelectActions.OpenFirst;
        }
    }
    // Open combobox actions
    else {
        switch (key) {
            case 'Enter':
            case ' ':
                return SelectActions.Select;
            case 'Tab':
                return SelectActions.CloseSelect;
            case 'Escape':
                return SelectActions.Close;
            case 'ArrowUp':
                return hasAltKey ? SelectActions.CloseSelect : SelectActions.Previous;
            case 'ArrowDown':
                return SelectActions.Next;
            case 'Home':
                return SelectActions.First;
            case 'End':
                return SelectActions.Last;
            case 'PageUp':
                return SelectActions.PageUp;
            case 'PageDown':
                return SelectActions.PageDown;
        }
        
        // Printable characters when open
        if (/^[a-zA-Z0-9]$/.test(key)) {
            return SelectActions.Typeahead;
        }
    }

    return SelectActions.None;
}

const SelectContext = createContext<SelectContextState | null>(null);

const useSelect = (): SelectContextState => {
    const context = useContext(SelectContext);
    if (!context) throw new Error("useSelect must be used within a <Select> component");

    return context;
}

export interface SelectProps extends HTMLAttributes<HTMLElement> {
    onValueChange?: (value: string) => void;
    onOpenChange?: (open: boolean) => void;

    defaultValue?: string;
    defaultOpen?: boolean;
    value?: string;
    open?: boolean;

    placeholder?: string;
    children: ReactNode;
    dir?: "ltr" | "rtl";

}

export function Select({
    defaultValue,
    defaultOpen,
    value,
    open,

    onValueChange,
    onOpenChange,

    placeholder,
    dir = 'ltr',
    className,
    children,

    ...props
}: SelectProps) {

    // value state management
    const [internalValue, setInternalValue] = useState<string>(defaultValue ?? '');
    const isControlled = value !== undefined;
    const selectValue = isControlled ? value! : internalValue;
    const setSelectValue = useCallback((targetValue: string) => {
        if (!isControlled) setInternalValue(targetValue);
        onValueChange?.(targetValue);
    }, []);

    // open state management
    const [isInternalOpen, setIsInternalOpen] = useState(!!defaultOpen);
    const isOpenControlled = open !== undefined;
    const selectOpen = isOpenControlled ? open! : isInternalOpen;
    const setSelectOpen = useCallback((to: boolean) => {
        if (!isOpenControlled) setIsInternalOpen(to);
        onOpenChange?.(to);
    }, []);

    // refs
    const contentViewRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    // outside click case
    useOutsideClick(
        () => { selectOpen && setSelectOpen(false) },
        contentRef, triggerRef,
    );

    // items
    const [items, setItems] = useState<SelectItemData[]>([]);
    const [valueToLabel, setValueToLabel] = useState<Record<string, string>>({});

    const addItem = useCallback((item: SelectItemData) => {
        setItems(prev => [...prev, item]);
        setValueToLabel(prev => ({ ...prev, [item.value]: item.label }));
    }, []);

    const removeItem = useCallback((value: string) => {
        setItems(prev => prev.filter(item => item.value !== value));
    }, []);

    // cursor
    const [cursor, setCursor] = useState<number>(-1);
    
    // typeahead
    const [typeaheadQuery, setTypeaheadQuery] = useState<string>('');
    const typeaheadTimeoutRef = useRef<number | null>(null);
    
    // Helper functions
    const getActiveOptionId = useCallback(() => {
        if (cursor >= 0 && cursor < items.length) {
            return `select-option-${items[cursor].value}`;
        }
        return undefined;
    }, [cursor, items]);
    
    const scrollOptionIntoView = useCallback((index: number) => {
        const item = items[index];
        if (item?.ref.current && contentViewRef.current) {
            const option = item.ref.current;
            const container = contentViewRef.current;
            
            const optionRect = option.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            
            const isAbove = optionRect.top < containerRect.top;
            const isBelow = optionRect.bottom > containerRect.bottom;
            
            if (isAbove || isBelow) {
                option.scrollIntoView({
                    block: 'nearest',
                    behavior: 'smooth'
                });
            }
        }
    }, [items, contentViewRef]);
    
    // Reset typeahead after timeout
    useEffect(() => {
        if (typeaheadQuery) {
            if (typeaheadTimeoutRef.current) {
                clearTimeout(typeaheadTimeoutRef.current);
            }
            
            typeaheadTimeoutRef.current = window.setTimeout(() => {
                setTypeaheadQuery('');
            }, 500);
        }
        
        return () => {
            if (typeaheadTimeoutRef.current) {
                clearTimeout(typeaheadTimeoutRef.current);
            }
        };
    }, [typeaheadQuery]);

    // context
    const context: SelectContextState = {
        value: selectValue,
        open: selectOpen,
        placeholder,
        dir,

        setCursor,
        cursor,

        valueToLabel,
        removeItem,
        addItem,
        items,

        contentViewRef,
        triggerRef,
        contentRef,

        setValue: setSelectValue,
        setOpen: setSelectOpen,
        
        typeaheadQuery,
        setTypeaheadQuery,
        
        getActiveOptionId,
        scrollOptionIntoView,
    }

    return (
        <SelectContext.Provider value={context}>
            <div data-ui="select"
                className={cn('relative', className)}
                dir={dir}

                {...props}
            >
                {children}
            </div>
        </SelectContext.Provider>
    )
}

export interface SelectTriggerProps {
    children?: ReactNode;
    className?: string;
    asChild?: boolean;
}

export function SelectTrigger({ children, className, asChild }: SelectTriggerProps) {
    const Element = asChild ? Slot : 'button';
    const { 
        open, setOpen, triggerRef, dir, cursor, setCursor, items, setValue, 
        typeaheadQuery, setTypeaheadQuery, getActiveOptionId, scrollOptionIntoView 
    } = useSelect();

    const clickHandler = () => setOpen(!open);
    
    // Helper function to find cursor position for current value
    const getCurrentValueIndex = useCallback(() => {
        return items.findIndex(item => item.value === useSelect().value);
    }, [items]);
    
    // Helper function for typeahead matching
    const findMatchingOption = useCallback((query: string, startIndex = 0) => {
        const normalizedQuery = query.toLowerCase();
        
        // First try to find exact match from startIndex
        for (let i = startIndex; i < items.length; i++) {
            if (items[i].label.toLowerCase().startsWith(normalizedQuery)) {
                return i;
            }
        }
        
        // If no match found, search from beginning
        for (let i = 0; i < startIndex; i++) {
            if (items[i].label.toLowerCase().startsWith(normalizedQuery)) {
                return i;
            }
        }
        
        return -1;
    }, [items]);
    
    // Helper function to constrain cursor within bounds
    const constrainCursor = useCallback((newCursor: number) => {
        return Math.max(0, Math.min(items.length - 1, newCursor));
    }, [items.length]);

    const keyDownHandler = (event: KeyboardEvent) => {
        const action = getActionFromKey(event.key, open, event.altKey);
        
        // Prevent default for most navigation keys
        if (action !== SelectActions.None) {
            event.preventDefault();
        }

        switch (action) {
            case SelectActions.Open:
                setOpen(true);
                setCursor(-1);
                break;

            case SelectActions.OpenFirst:
                setOpen(true);
                if (items.length > 0) {
                    setCursor(0);
                    scrollOptionIntoView(0);
                }
                break;
                
            case SelectActions.OpenLast:
                setOpen(true);
                if (items.length > 0) {
                    const lastIndex = items.length - 1;
                    setCursor(lastIndex);
                    scrollOptionIntoView(lastIndex);
                }
                break;

            case SelectActions.OpenCurrent: {
                setOpen(true);
                const currentIndex = getCurrentValueIndex();
                if (currentIndex >= 0) {
                    setCursor(currentIndex);
                    scrollOptionIntoView(currentIndex);
                } else {
                    setCursor(-1);
                }
                break;
            }

            case SelectActions.Select:
            case SelectActions.CloseSelect: {
                if (cursor >= 0 && cursor < items.length) {
                    setValue(items[cursor].value);
                }
                setOpen(false);
                setCursor(-1);
                
                // For Tab, we want to move focus to next element
                if (action === SelectActions.CloseSelect && event.key === 'Tab') {
                    // Let the default tab behavior happen
                    event.preventDefault();
                    // Focus next focusable element
                    const focusableElements = document.querySelectorAll(
                        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                    );
                    const currentIndex = Array.from(focusableElements).indexOf(triggerRef.current!);
                    const nextElement = focusableElements[currentIndex + 1] as HTMLElement;
                    if (nextElement) {
                        nextElement.focus();
                    }
                }
                break;
            }

            case SelectActions.Previous: {
                if (cursor > 0) {
                    const newCursor = cursor - 1;
                    setCursor(newCursor);
                    scrollOptionIntoView(newCursor);
                }
                break;
            }

            case SelectActions.Next: {
                if (cursor < items.length - 1) {
                    const newCursor = cursor + 1;
                    setCursor(newCursor);
                    scrollOptionIntoView(newCursor);
                }
                break;
            }
            
            case SelectActions.First: {
                if (items.length > 0) {
                    setCursor(0);
                    scrollOptionIntoView(0);
                }
                break;
            }
            
            case SelectActions.Last: {
                if (items.length > 0) {
                    const lastIndex = items.length - 1;
                    setCursor(lastIndex);
                    scrollOptionIntoView(lastIndex);
                }
                break;
            }
            
            case SelectActions.PageUp: {
                if (items.length > 0) {
                    const newCursor = constrainCursor(cursor - 10);
                    setCursor(newCursor);
                    scrollOptionIntoView(newCursor);
                }
                break;
            }
            
            case SelectActions.PageDown: {
                if (items.length > 0) {
                    const newCursor = constrainCursor(cursor + 10);
                    setCursor(newCursor);
                    scrollOptionIntoView(newCursor);
                }
                break;
            }

            case SelectActions.Typeahead: {
                const char = event.key;
                const newQuery = typeaheadQuery + char;
                setTypeaheadQuery(newQuery);
                
                // Find matching option
                let matchIndex = -1;
                
                if (newQuery.length === 1 && newQuery === typeaheadQuery) {
                    // Same character repeated - cycle through options starting with this character
                    const currentMatchIndex = cursor >= 0 ? cursor : -1;
                    matchIndex = findMatchingOption(char, currentMatchIndex + 1);
                } else {
                    // Multi-character search or first character
                    matchIndex = findMatchingOption(newQuery);
                }
                
                if (matchIndex >= 0) {
                    if (!open) {
                        setOpen(true);
                    }
                    setCursor(matchIndex);
                    scrollOptionIntoView(matchIndex);
                }
                break;
            }

            case SelectActions.Close:
                setOpen(false);
                setCursor(-1);
                break;

            case SelectActions.None:
                break;

            default: throw new Error(`Unregistered action detected: ${action}`);
        }
    }

    return (
        <Element 
            data-ui="select-trigger"
            ref={triggerRef}
            
            role="combobox"
            aria-expanded={open}
            aria-activedescendant={open ? getActiveOptionId() : undefined}
            aria-haspopup="listbox"
            tabIndex={0}

            onKeyDown={keyDownHandler}
            onClick={clickHandler}

            className={cn(
                "w-fit min-w-xs min-h-8 inline-flex items-center justify-between gap-2 px-3 py-2 rounded text-write border border-bound bg-weak-surface",
                dir === "rtl" && "flex-row-reverse",
                className
            )}
        >
            {children}
        </Element>
    );
}


export interface SelectValueProps {
    children?: ReactElement;
    className?: string;
    asChild?: boolean;
}

export function SelectValue({ children, className, asChild }: SelectValueProps) {
    const { value, placeholder, valueToLabel } = useSelect();

    const Element = asChild ? Slot : 'span';
    
    const displayValue = value ? (valueToLabel[value] || value) : placeholder;
    const hasValue = Boolean(value);

    if (asChild) return (
        <Slot data-ui="select-value"
            className={className}
        >
            {children}
        </Slot>
    );

    return (
        <Element data-ui="select-value"
            className={cn(
                "text-sm font-medium overflow-hidden",
                hasValue ? "text-write" : "text-muted-foreground",
                className
            )}
        >
            {displayValue}
        </Element>
    );
}

export interface SelectIconProps {
    children?: ReactElement;
    className?: string;
    asChild?: boolean;
}

export function SelectIcon({ className, asChild, children }: SelectIconProps) {
    if (asChild) return (
        <Slot
            data-ui="select-icon"
            className={cn('size-4 text-write shrink-0 transition-transform', className)}
        >
            {children}
        </Slot>
    );

    return (
        <svg data-ui="select-icon"
            className={cn('size-4 text-write shrink-0 transition-transform', className)}
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

export interface SelectContentProps {
    children?: ReactNode;
    className?: string;
    asChild?: boolean;
}

export function SelectContent({ children, className, asChild }: SelectContentProps) {
    const Element = asChild ? Slot : 'div';

    const { contentRef, open, dir } = useSelect();

    if (!open) return null;

    return (
        <Element 
            data-ui="select-content"
            ref={contentRef}
            
            role="listbox"

            className={cn(
                'absolute left-0 top-full z-10 mt-1 min-w-xs p-1.5 rounded shadow border border-weak-bound bg-weak-surface',
                dir === 'rtl' && 'origin-top-right right-0 left-auto',
                className
            )}
        >
            {children}
        </Element>
    );
}


export interface SelectLabelProps {
    children?: ReactNode;
    className?: string;
    asChild?: boolean;
}

export function SelectLabel({ children, className, asChild }: SelectLabelProps) {
    const Element = asChild ? Slot : 'span';

    const { dir } = useSelect();

    return (
        <Element data-ui="select-label"
            className={cn(
                "block w-fit text-write px-1.5 py-1 text-xs leading-none font-medium",
                dir === 'rtl' && "text-right",
                className
            )}>
            {children}
        </Element>
    );
}

export interface SelectItemProps {
    children?: ReactNode;
    className?: string;
    disabled?: boolean;
    asChild?: boolean;
    label?: string;
    value: string;
}

export function SelectItem({ children, className, asChild, value, label, disabled }: SelectItemProps) {
    const Element = asChild ? Slot : 'div';

    const itemRef = useRef<HTMLDivElement>(null);
    const { items, addItem, removeItem, cursor, setCursor, setValue, setOpen, value: selectedValue } = useSelect();
    const index = items.findIndex(item => item.value === value);

    useEffect(() => {
        if (disabled) return;

        const confirmedLabel = label ?? itemRef.current?.textContent ?? '';
        const itemData = { label: confirmedLabel, index, ref: itemRef, value };
        addItem(itemData);

        return () => { removeItem(value) }

    }, [disabled, addItem, removeItem, value, label]);

    const mouseEnterHandler = () => { 
        if (disabled) return; 
        if (index !== -1) setCursor(index); 
    }
    
    const mouseLeaveHandler = () => { 
        if (disabled) return; 
        setCursor(-1); 
    }
    
    const clickHandler = () => {
        if (disabled) return;
        setValue(value);
        setOpen(false);
        setCursor(-1);
    }

    const isActiveDescendant = cursor === index && index !== -1 && !disabled;
    const isSelected = selectedValue === value;
    const optionId = `select-option-${value}`;

    return (
        <Element 
            data-ui="select-item"
            ref={itemRef}
            
            role="option"
            id={optionId}
            aria-selected={isSelected}
            data-index={index}

            onMouseEnter={mouseEnterHandler}
            onMouseLeave={mouseLeaveHandler}
            onClick={clickHandler}

            className={cn(
                "flex items-center justify-between w-full text-sm text-write py-2.5 px-1.5 rounded transition-colors cursor-pointer",
                isActiveDescendant && "bg-surface",
                isSelected && "font-medium",
                disabled && "opacity-50 cursor-not-allowed",
                className
            )}
        >
            {children}
        </Element>
    );
}


export interface SelectGroupProps {
    children?: ReactNode;
    className?: string;
    asChild?: boolean;
}

export function SelectGroup({ children, className, asChild }: SelectGroupProps) {
    const Element = asChild ? Slot : 'div';

    return (
        <Element data-ui="select-group"
            className={cn("w-full space-y-px py-1", className)}
        >
            {children}
        </Element>
    )
}

export interface SelectItemIndicatorProps {
    children?: ReactElement;
    className?: string;
    asChild?: boolean;
}

export function SelectItemIndicator({ children, className, asChild }: SelectItemIndicatorProps) {
    if (asChild) return (
        <Slot data-ui="select-item-indicator"
            className={className}
        >
            {children}
        </Slot>
    );

    return (
        <span data-ui="select-item-indicator"
            className={cn('block size-4 text-write shrink-0 transition-transform', className)}
        >
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
        </span>
    );
}


export interface SelectSeparatorProps {
    className?: string;
    asChild?: boolean;
    children?: ReactElement;
}

export function SelectSeparator({ className, asChild, children }: SelectSeparatorProps) {
    const Element = asChild ? Slot : 'hr';

    return (
        <Element data-ui="select-separator"
            className={cn(
                "block m-1.5 text-weak-bound",
                className
            )}
        >
            {children}
        </Element>
    );
}

export interface SelectContentViewProps {
    children?: ReactNode;
    className?: string;
    asChild?: boolean;
}

export function SelectContentView({ children, className, asChild }: SelectContentViewProps) {
    const Element = asChild ? Slot : 'div';

    const { contentViewRef } = useSelect();

    return (
        <Element data-ui="select-content-view"
            style={{ scrollbarWidth: 'none' }}
            ref={contentViewRef}

            className={cn(
                "w-full max-h-96 overflow-y-auto [&::-webkit-scrollbar]:hidden",
                className
            )}
        >
            {children}
        </Element>
    )
}

export interface SelectScrollUpButtonProps {
    children?: ReactElement;
    className?: string;
    asChild?: boolean;
}

export function SelectScrollUpButton({ className, asChild, children }: SelectScrollUpButtonProps) {
    const { contentViewRef } = useSelect();
    const [disabled, setDisabled] = useState(true);

    useEffect(() => {
        const view = contentViewRef.current;
        if (!view) return;

        const update = () => { setDisabled(view.scrollTop <= 0) };
        view.addEventListener('scroll', update);
        update();

        return () => view.removeEventListener('scroll', update);

    }, [contentViewRef]);

    const intervalRef = useRef<number | null>(null);
    const scrollStep = () => contentViewRef.current?.scrollBy({ behavior: 'smooth', top: -10 });

    const handleMouseDown = () => {
        scrollStep();
        intervalRef.current = window.setInterval(scrollStep, 100);
    };

    const handleMouseUp = () => {
        if (intervalRef.current) window.clearInterval(intervalRef.current);
    };

    const handleClick = () => {
        contentViewRef.current?.scrollBy({ behavior: 'smooth', top: -50 });
    }

    if (asChild) return (

        <Slot data-ui="select-scroll-up-button"
            disabled={disabled}

            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseUp}
            onMouseUp={handleMouseUp}
            onClick={handleClick}

            className={className}
        >
            {children}
        </Slot>
    );

    return (
        <button data-ui="select-scroll-up-button"
            disabled={disabled}

            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseUp}
            onMouseUp={handleMouseUp}
            onClick={handleClick}

            className={cn(
                "w-full flex justify-center py-1 hover:bg-surface transition-colors",
                disabled && "opacity-50 cursor-not-allowed",
                className
            )}
        >
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

        </button>
    )
}

export interface SelectScrollDownButtonProps {
    children?: ReactElement;
    className?: string;
    asChild?: boolean;
}

export function SelectScrollDownButton({ className, asChild, children }: SelectScrollDownButtonProps) {
    const { contentViewRef } = useSelect();
    const [disabled, setDisabled] = useState(true);

    useEffect(() => {
        const view = contentViewRef.current;
        if (!view) return;

        const update = () => { setDisabled(Math.ceil(view.scrollTop + view.clientHeight) >= view.scrollHeight); };
        view.addEventListener('scroll', update);
        update();

        return () => view.removeEventListener('scroll', update);

    }, [contentViewRef]);

    const intervalRef = useRef<number | null>(null);
    const scrollStep = () => contentViewRef.current?.scrollBy({ behavior: 'smooth', top: 10 });

    const handleMouseDown = () => {
        scrollStep();
        intervalRef.current = window.setInterval(scrollStep, 100);
    };

    const handleMouseUp = () => {
        if (intervalRef.current) window.clearInterval(intervalRef.current);
    };

    const handleClick = () => {
        contentViewRef.current?.scrollBy({ behavior: 'smooth', top: 50 });
    }

    if (asChild) return (

        <Slot data-ui="select-scroll-down-button"
            disabled={disabled}

            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseUp}
            onMouseUp={handleMouseUp}
            onClick={handleClick}

            className={className}
        >
            {children}
        </Slot>
    );

    return (
        <button data-ui="select-scroll-down-button"
            disabled={disabled}

            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseUp}
            onMouseUp={handleMouseUp}
            onClick={handleClick}

            className={cn(
                "w-full flex justify-center py-1 hover:bg-surface transition-colors",
                disabled && "opacity-50 cursor-not-allowed",
                className
            )}
        >
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

        </button>
    )
}

