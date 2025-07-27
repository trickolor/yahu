import {
    createContext,

    useLayoutEffect,
    useCallback,
    useContext,
    useEffect,
    useState,
    useRef,

    type KeyboardEvent,
    type ReactElement,
    type ReactNode,
} from "react"

import { Slot } from "./slot";

import { cn } from "../cn";

interface SelectItemDescriptor {
    ref: HTMLElement | null;
    value: string;
    text: string;
}

interface SelectContextState {
    placeholder?: string;
    dir: "ltr" | "rtl";
    value: string;
    open: boolean;

    valueToLabel: Record<string, string>;
    items: SelectItemDescriptor[];
    searchString: string;
    activeIndex: number;

    setSearchString(str: string): void;
    setActiveIndex(idx: number): void;
    setValue(value: string): void;
    setOpen(open: boolean): void;

    registerItem(item: SelectItemDescriptor): void;
    unregisterItem(value: string): void;

    contentViewRef: React.RefObject<HTMLDivElement | null>;
    triggerRef: React.RefObject<HTMLButtonElement | null>;
    contentRef: React.RefObject<HTMLDivElement | null>;
}

const SelectActions = {
    None: -1,
    Open: 0,
    OpenFirst: 1,
    OpenCurrent: 2,
    Select: 3,
    Previous: 4,
    Next: 5,
    Typeahead: 6,
    Close: 7,
}

const getActionFromKey = (key: string, isOpen: boolean) => {

    if (!isOpen) {
        if (['ArrowDown', 'ArrowUp'].includes(key)) return SelectActions.Open;
        if (key === 'Enter') return SelectActions.OpenFirst;
        if (key === ' ') return SelectActions.OpenCurrent;
    }

    else {
        if (['Enter', ' '].includes(key)) return SelectActions.Select;
        if (key === 'ArrowUp') return SelectActions.Previous;
        if (key === 'ArrowDown') return SelectActions.Next;
        if (key === 'Escape') return SelectActions.Close;

        if (/^[a-zA-Z0-9]$/.test(key)) return SelectActions.Typeahead;
    }

    return SelectActions.None;
}

const SelectContext = createContext<SelectContextState | null>(null);

const useSelect = () => {
    const context = useContext(SelectContext);
    if (!context) throw new Error("useSelect must be used within a <Select> component");

    return context;
}

export interface SelectProps {
    placeholder?: string;
    children: ReactNode;
    dir?: "ltr" | "rtl";
    className?: string;

    defaultValue?: string;
    value?: string;

    defaultOpen?: boolean;
    open?: boolean;

    onValueChange?: (v: string) => void;
    onOpenChange?: (v: boolean) => void;
}


export function Select({
    placeholder,
    className,
    children,
    dir,

    defaultValue,
    value,

    defaultOpen,
    open,

    onValueChange,
    onOpenChange,
}: SelectProps) {
    const [internalValue, setInternalValue] = useState<string>(defaultValue ?? '');
    const isControlled = value !== undefined;
    const selectValue = isControlled ? value! : internalValue;

    const setSelectValue = useCallback((targetValue: string) => {
        if (!isControlled) setInternalValue(targetValue);
        onValueChange?.(targetValue);
    }, []);

    const [isInternalOpen, setIsInternalOpen] = useState(!!defaultOpen);
    const isOpenControlled = open !== undefined;
    const selectOpen = isOpenControlled ? open! : isInternalOpen;

    const setSelectOpen = useCallback((to: boolean) => {
        if (!isOpenControlled) setIsInternalOpen(to);
        onOpenChange?.(to);
    }, []);

    const [items, setItems] = useState<SelectItemDescriptor[]>([]);
    const [valueToLabel, setValueToLabel] = useState<Record<string, string>>({});

    const registerItem = useCallback((item: SelectItemDescriptor) => {
        setItems((current) => [...current.filter((i) => i.value !== item.value), item]);

        setValueToLabel((map) => {
            if (map[item.value] === item.text) return map;
            return { ...map, [item.value]: item.text };
        });
    }, []);

    const unregisterItem = useCallback((value: string) => {
        setItems((current) => current.filter((i) => i.value !== value));
    }, []);

    const [activeIndex, setActiveIndex] = useState<number>(-1);
    const [searchString, setSearchString] = useState<string>('');

    useEffect(() => {
        if (!searchString) return;

        const index = items.findIndex((item) =>
            item.text.toLowerCase()
                .startsWith(searchString.toLowerCase())
        );

        if (index !== -1) setActiveIndex(index);

        const timeoutId = window.setTimeout(() => setSearchString(""), 500);
        return () => clearTimeout(timeoutId);

    }, [searchString, items]);

    const triggerRef = useRef<HTMLButtonElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const contentViewRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const mouseDownHandler = (e: MouseEvent) => {
            if (
                selectOpen &&
                !triggerRef.current?.contains(e.target as Node) &&
                !contentRef.current?.contains(e.target as Node)
            ) setSelectOpen(false);
        };

        document.addEventListener("mousedown", mouseDownHandler);
        return () => document.removeEventListener("mousedown", mouseDownHandler);

    }, [selectOpen, setSelectOpen]);

    const context: SelectContextState = {
        value: selectValue,
        dir: dir ?? 'ltr',
        open: selectOpen,
        placeholder,

        searchString,
        valueToLabel,
        activeIndex,
        items,

        unregisterItem,
        registerItem,

        contentViewRef,
        triggerRef,
        contentRef,

        setValue: setSelectValue,
        setOpen: setSelectOpen,
        setSearchString,
        setActiveIndex,
    }

    return (
        <SelectContext.Provider value={context}>
            <div data-ui="select"
                className={cn('relative w-fit', className)}
                dir={dir}

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
    const { open, setOpen, triggerRef, dir, value, items, setActiveIndex } = useSelect();

    
    const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
        switch (event.key) {
            case ' ':
            case 'Enter': {
                event.preventDefault();
                setOpen(true);
                // Focus selected item, or first if none
                const idx = items.findIndex(i => i.value === value);
                setActiveIndex(idx >= 0 ? idx : 0);
                break;
            }
            case 'ArrowDown': {
                event.preventDefault();
                setOpen(true);
                // Focus selected item, or first
                const idx = items.findIndex(i => i.value === value);
                setActiveIndex(idx >= 0 ? idx : 0);
                break;
            }
            case 'ArrowUp': {
                event.preventDefault();
                setOpen(true);
                // Focus selected, or last
                const idx = items.findIndex(i => i.value === value);
                setActiveIndex(idx >= 0 ? idx : items.length - 1);
                break;
            }
            default:
                // Optionally implement typeahead here
                break;
        }
    };

    return (
        <Element data-ui="select-trigger"
            ref={triggerRef}
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls="select-content"
            tabIndex={0}
            onClick={() => setOpen(!open)}
            onKeyDown={handleKeyDown}
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
    const display = valueToLabel[value] ?? placeholder ?? "";

    const Element = asChild ? Slot : 'span';

    if (asChild) return (
        <Slot data-ui="select-value"
            className={className}
        >
            {children}
        </Slot>
    );

    return (
        <Element data-ui="select-value"
            className={cn("text-write text-sm font-medium overflow-hidden", className)}
        >
            {display}
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
    const {
        setSearchString,
        setActiveIndex,
        searchString,
        activeIndex,
        triggerRef,
        contentRef,
        setValue,
        setOpen,
        items,
        open,
        dir,
    } = useSelect();

    // Ensure content gets focus when opened
    useEffect(() => {
        if (open && contentRef.current) {
            contentRef.current.focus();
        }
    }, [open, contentRef]);

    const scrollIntoView = (index: number) => {
        const item = items[index];
        if (item?.ref) item.ref.scrollIntoView({ block: 'nearest' });
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        switch (event.key) {
            case 'Escape':
                event.preventDefault();
                setOpen(false);
                triggerRef.current?.focus();
                break;

            case 'ArrowDown':
                event.preventDefault();
                const adIndex = activeIndex < 0 ? 0 : Math.min(activeIndex + 1, items.length - 1);
                scrollIntoView(adIndex);
                setActiveIndex(adIndex);
                break;

            case 'ArrowUp':
                event.preventDefault();
                const auIndex = activeIndex < 0 ? items.length - 1 : Math.max(activeIndex - 1, 0);
                scrollIntoView(auIndex);
                setActiveIndex(auIndex);
                break;

            case 'Enter':
            case ' ': // Space key
                event.preventDefault();
                if (activeIndex >= 0 && activeIndex < items.length) {
                    const selection = items[activeIndex];
                    setValue(selection.value);
                    setOpen(false);
                    triggerRef.current?.focus();
                }
                break;

            default:
                if (/^[a-z0-9]$/i.test(event.key)) {
                    setSearchString(searchString + event.key);
                }
        }
    };

    useEffect(() => {
        if (!searchString) return;
        const index = items.findIndex(item =>
            item.text.toLowerCase().startsWith(searchString.toLowerCase())
        );
        if (index !== -1) scrollIntoView(index);
    }, [searchString, items]);

    if (!open) return null;

    return (
        <Element
            id="select-content"
            data-ui="select-content"
            onKeyDown={handleKeyDown}
            ref={contentRef}
            role="listbox"
            tabIndex={0}
            aria-activedescendant={
                activeIndex >= 0 && activeIndex < items.length
                    ? `select-item-${items[activeIndex].value}`
                    : undefined
            }
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
    text?: string;
    value: string;
    asChild?: boolean;
}

interface SelectItemContextState {
    value: string;
}

const SelectItemContext = createContext<SelectItemContextState | null>(null);

export function useSelectItemValue() {
    const context = useContext(SelectItemContext);
    if (!context) throw new Error("SelectItemIndicator must be used within a SelectItem");

    return context;
}

export function SelectItem({ children, className, disabled, text, value, asChild }: SelectItemProps) {
    const Element = asChild ? Slot : 'div';
    const {
        registerItem,
        unregisterItem,
        items,
        activeIndex,
        setActiveIndex,
        setValue,
        setOpen,
        triggerRef,
        open,
    } = useSelect();

    const itemRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        if (disabled) return;
        const searchText = text ?? itemRef.current?.textContent ?? '';
        registerItem({ value, text: searchText, ref: itemRef.current });
        return () => unregisterItem(value);
    }, [value, text, disabled, registerItem, unregisterItem]);

    const index = items.findIndex((item) => item.value === value);
    const isHighlighted = open && index === activeIndex;

    // For SR: focus highlighted item
    useEffect(() => {
        if (isHighlighted && itemRef.current) {
            itemRef.current.focus();
        }
    }, [isHighlighted]);

    const handleClick = () => {
        if (disabled) return;
        setValue(value);
        setOpen(false);
        triggerRef.current?.focus();
    };

    const handleMouseEnter = () => {
        if (disabled) return;
        setActiveIndex(index);
    };

    const context: SelectItemContextState = { value };

    return (
        <SelectItemContext.Provider value={context}>
            <Element
                id={`select-item-${value}`}
                data-ui="select-item"
                data-value={value}
                ref={itemRef}
                tabIndex={-1} // NOT 0, so only focused programmatically
                aria-selected={isHighlighted}
                aria-disabled={disabled}
                role="option"
                onMouseEnter={handleMouseEnter}
                onClick={handleClick}
                className={cn(
                    "flex items-center justify-between w-full text-sm text-write py-2.5 px-1.5 rounded hover:bg-surface transition-colors",
                    disabled && "opacity-50 cursor-not-allowed",
                    isHighlighted && "bg-accent",
                    className
                )}
            >
                {children}
            </Element>
        </SelectItemContext.Provider>
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
    const { value: selectValue } = useSelect();
    const { value: itemValue } = useSelectItemValue();

    const isVisible = selectValue === itemValue;
    if (!isVisible) return null;

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

