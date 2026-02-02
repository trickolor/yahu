import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useId,
    useLayoutEffect,
    useReducer,
    useRef,
    useState,
    useMemo,
    type HTMLAttributes,
    type KeyboardEvent,
    type ReactNode,
    type RefObject,
    type Dispatch,
} from "react";

import { createPortal } from "react-dom";

import { useControllableState } from "@/hooks/use-controllable-state";

import {
    usePosition,
    type Boundary,
    type Padding,
    type Sticky,
    type Align,
    type Side,
} from "@/hooks/use-position";

import { Slot } from "@/ui/slot";
import { cn } from "@/cn";

// ---------------------------------------------------------------------------------------------------- //

const MultiSelectActions = {
    None: -1,
    Close: 0,
    Open: 1,
    Toggle: 2,
    First: 3,
    Last: 4,
    Previous: 5,
    Next: 6,
    PageUp: 7,
    PageDown: 8,
    Type: 9,
    SelectAll: 10,
    DeselectAll: 11,
} as const;

type MultiSelectAction = typeof MultiSelectActions[keyof typeof MultiSelectActions];

const getMultiSelectAction = (event: KeyboardEvent<HTMLDivElement>, open: boolean): MultiSelectAction => {
    const { key, altKey, ctrlKey, metaKey } = event;

    const openKeys = ['ArrowDown', 'ArrowUp', 'Enter', ' '];
    if (!open && openKeys.includes(key)) return MultiSelectActions.Open;

    if (key === 'Home') return MultiSelectActions.First;
    if (key === 'End') return MultiSelectActions.Last;
    if (open && key === 'a' && (ctrlKey || metaKey)) return MultiSelectActions.SelectAll;

    if (
        key === 'Backspace' ||
        key === 'Clear' ||
        key.length === 1 && key !== ' ' && !altKey && !ctrlKey && !metaKey
    ) return MultiSelectActions.Type;

    if (open) switch (key) {
        case 'ArrowUp': return altKey ? MultiSelectActions.Close : MultiSelectActions.Previous;
        case 'ArrowDown': return altKey ? MultiSelectActions.None : MultiSelectActions.Next;
        case 'PageUp': return MultiSelectActions.PageUp;
        case 'PageDown': return MultiSelectActions.PageDown;
        case 'Escape': return MultiSelectActions.Close;
        case 'Enter': case ' ': return MultiSelectActions.Toggle;
    }

    return MultiSelectActions.None;
}

// ---------------------------------------------------------------------------------------------------- //

interface MultiSelectItemEntry {
    id: string;
    value: string;
    textValue: string;
    disabled: boolean;
    element: HTMLElement | null;
}

interface MultiSelectState {
    cursor: number;
    items: MultiSelectItemEntry[];
    typeaheadValue: string;
    typeaheadTimeout: number | null;
    pendingCursorAction: 'first' | 'last' | 'default' | null;
}

type MultiSelectStateAction =
    | { type: 'SET_CURSOR'; payload: number }
    | { type: 'SET_PENDING_CURSOR_ACTION'; payload: 'first' | 'last' | 'default' | null }
    | { type: 'REGISTER_ITEM'; payload: MultiSelectItemEntry }
    | { type: 'UNREGISTER_ITEM'; payload: string }
    | { type: 'SET_TYPEAHEAD_VALUE'; payload: string }
    | { type: 'SET_TYPEAHEAD_TIMEOUT'; payload: number | null }
    | { type: 'CLEAR_TYPEAHEAD' }

function multiSelectStateReducer(
    state: MultiSelectState,
    action: MultiSelectStateAction,
): MultiSelectState {
    switch (action.type) {
        case 'UNREGISTER_ITEM': return { ...state, items: state.items.filter(item => item.id !== action.payload) }

        case 'SET_PENDING_CURSOR_ACTION': return { ...state, pendingCursorAction: action.payload }
        case 'SET_TYPEAHEAD_TIMEOUT': return { ...state, typeaheadTimeout: action.payload }
        case 'SET_TYPEAHEAD_VALUE': return { ...state, typeaheadValue: action.payload }
        case 'SET_CURSOR': return { ...state, cursor: action.payload }

        case 'REGISTER_ITEM': {
            const filtered = state.items
                .filter(item => item.id !== action.payload.id);

            const newItems = [...filtered, action.payload].sort((a, b) => {
                if (!a.element || !b.element) return 0;
                const position = a.element.compareDocumentPosition(b.element);
                return position & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
            });

            return { ...state, items: newItems }
        }

        case 'CLEAR_TYPEAHEAD': {
            if (state.typeaheadTimeout) clearTimeout(state.typeaheadTimeout);
            return { ...state, typeaheadValue: '', typeaheadTimeout: null }
        }

        default: return state;
    }
}

// ---------------------------------------------------------------------------------------------------- //

interface MultiSelectContextState {
    value: string[];
    setValue: (value: string[]) => void;
    toggleValue: (itemValue: string) => void;

    open: boolean;
    setOpen: (open: boolean) => void;

    disabled: boolean;

    state: MultiSelectState;
    dispatch: Dispatch<MultiSelectStateAction>;

    activeDescendant: string | null;

    itemLabelsRef: RefObject<Map<string, string>>;
    itemLabels: Map<string, string>;
    registerItemLabel: (value: string, textValue: string) => void;

    viewportRef: RefObject<HTMLDivElement | null>;
    triggerRef: RefObject<HTMLDivElement | null>;
    contentRef: RefObject<HTMLDivElement | null>;

    scrollRequestRef: RefObject<{
        type: 'none' | 'ensure-visible' | 'edge-start' | 'edge-end';
        targetIndex: number;
    }>;

    scrollTrigger: number;
    triggerScroll: () => void;
}

const MultiSelectContext = createContext<MultiSelectContextState | null>(null);

function useMultiSelectContext(): MultiSelectContextState {
    const context = useContext(MultiSelectContext);
    if (!context) throw new Error("useMultiSelectContext must be used within a <MultiSelect> component");
    return context;
}

// ---------------------------------------------------------------------------------------------------- //

interface MultiSelectProps {
    value?: string[];
    defaultValue?: string[];
    onValueChange?: (value: string[]) => void;

    defaultOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;

    dir?: "ltr" | "rtl";

    name?: string;
    disabled?: boolean;
    required?: boolean;

    children?: ReactNode;
}

function MultiSelect({
    defaultValue, onValueChange, value,
    defaultOpen, onOpenChange, open,
    disabled = false,
    children,
}: MultiSelectProps) {
    const [valueState, setValue] = useControllableState({
        defaultValue: defaultValue ?? [],
        onChange: onValueChange,
        value,
    });

    const [openState, setOpen] = useControllableState({
        defaultValue: defaultOpen ?? false,
        onChange: onOpenChange,
        value: open,
    });

    const [state, dispatch] = useReducer(multiSelectStateReducer, {
        pendingCursorAction: null,
        typeaheadTimeout: null,
        typeaheadValue: '',
        cursor: -1,
        items: [],
    });

    const viewportRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    const scrollRequestRef = useRef<{
        type: 'none' | 'ensure-visible' | 'edge-start' | 'edge-end';
        targetIndex: number;
    }>({ type: 'none', targetIndex: -1 });

    const [scrollTrigger, setScrollTrigger] = useState(0);
    const triggerScroll = useCallback(() => setScrollTrigger(prev => prev + 1), []);

    const activeDescendant = useMemo(() => {
        return state.cursor >= 0 && state.cursor < state.items.length
            ? state.items[state.cursor].id
            : null;
    }, [state.cursor, state.items]);

    const toggleValue = useCallback((itemValue: string) => {
        const newValue = valueState.includes(itemValue)
            ? valueState.filter(v => v !== itemValue)
            : [...valueState, itemValue];
        setValue(newValue);
    }, [valueState, setValue]);

    const itemLabelsRef = useRef<Map<string, string>>(new Map());
    const [itemLabels, setItemLabels] = useState<Map<string, string>>(() => new Map());

    const registerItemLabel = useCallback((itemValue: string, textValue: string) => {
        const currentTextValue = itemLabelsRef.current.get(itemValue);

        if (currentTextValue !== textValue) {
            itemLabelsRef.current.set(itemValue, textValue);

            setItemLabels(prev => {
                if (prev.get(itemValue) === textValue) return prev;
                const next = new Map(prev);
                next.set(itemValue, textValue);
                return next;
            });
        }
    }, []);

    useEffect(() => {
        if (!openState) {
            dispatch({ type: 'CLEAR_TYPEAHEAD' });
            dispatch({ type: 'SET_PENDING_CURSOR_ACTION', payload: null });
        }
    }, [openState]);

    useEffect(() => {
        if (!openState || state.items.length === 0 || !state.pendingCursorAction) return;

        if (state.pendingCursorAction === 'first') {
            scrollRequestRef.current = { type: 'edge-start', targetIndex: 0 }
            dispatch({ type: 'SET_CURSOR', payload: 0 });
            triggerScroll();
        }

        else if (state.pendingCursorAction === 'last') {
            const lastIndex = state.items.length - 1;
            scrollRequestRef.current = { type: 'edge-end', targetIndex: lastIndex }
            dispatch({ type: 'SET_CURSOR', payload: lastIndex });
            triggerScroll();
        }

        else if (state.pendingCursorAction === 'default') {
            scrollRequestRef.current = { type: 'edge-start', targetIndex: 0 }
            dispatch({ type: 'SET_CURSOR', payload: 0 });
            triggerScroll();
        }

        dispatch({ type: 'SET_PENDING_CURSOR_ACTION', payload: null });
    }, [openState, state.items.length, state.pendingCursorAction, triggerScroll]);

    const context: MultiSelectContextState = useMemo(() => ({
        value: valueState,
        setValue,
        toggleValue,
        open: openState,
        setOpen,
        disabled,
        state,
        dispatch,
        activeDescendant,
        itemLabelsRef,
        itemLabels,
        registerItemLabel,
        triggerRef,
        contentRef,
        viewportRef,
        scrollRequestRef,
        scrollTrigger,
        triggerScroll,
    }), [valueState, setValue, toggleValue, openState, setOpen, disabled, state, activeDescendant, itemLabels, registerItemLabel, scrollTrigger, triggerScroll]);

    return (
        <MultiSelectContext.Provider data-ui="multi-select" value={context}>
            {children}
        </MultiSelectContext.Provider>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface MultiSelectTriggerProps extends HTMLAttributes<HTMLElement> {
    asChild?: boolean;
}

function MultiSelectTrigger({ className, children, asChild, ...props }: MultiSelectTriggerProps) {
    const { open, setOpen, state, dispatch, toggleValue, setValue, activeDescendant, triggerRef, scrollRequestRef, triggerScroll, disabled } = useMultiSelectContext();

    const clickHandler = useCallback(() => {
        if (disabled) return;
        if (!open) dispatch({ type: 'SET_PENDING_CURSOR_ACTION', payload: 'default' });
        setOpen(!open);
    }, [disabled, open, dispatch, setOpen]);

    const typeahead = useCallback((character: string) => {
        if (state.typeaheadTimeout)
            clearTimeout(state.typeaheadTimeout);

        const enabledItems = state.items.filter(item => !item.disabled);
        if (enabledItems.length === 0) return;

        const isRepeatedChar = character.toLowerCase() === state.typeaheadValue.toLowerCase() && state.typeaheadValue.length === 1;

        if (isRepeatedChar) {
            const matchingItems = enabledItems.filter(item =>
                item.textValue.toLowerCase().startsWith(character.toLowerCase())
            );

            if (matchingItems.length > 0) {
                const currentMatchIndex = matchingItems.findIndex(
                    item => state.items.indexOf(item) === state.cursor
                );

                const nextMatchIndex = (currentMatchIndex + 1) % matchingItems.length;
                const nextMatch = matchingItems[nextMatchIndex];
                const nextCursor = state.items.indexOf(nextMatch);

                scrollRequestRef.current = { type: 'ensure-visible', targetIndex: nextCursor }
                dispatch({ type: 'SET_CURSOR', payload: nextCursor });
                triggerScroll();
            }

            dispatch({ type: 'SET_TYPEAHEAD_VALUE', payload: character });
        }

        else {
            const newTypeaheadValue = state.typeaheadValue + character;
            dispatch({ type: 'SET_TYPEAHEAD_VALUE', payload: newTypeaheadValue });

            const matchingItem = enabledItems.find(item =>
                item.textValue.toLowerCase().startsWith(newTypeaheadValue.toLowerCase())
            );

            if (matchingItem) {
                const matchingIndex = state.items.indexOf(matchingItem);
                scrollRequestRef.current = { type: 'ensure-visible', targetIndex: matchingIndex }
                dispatch({ type: 'SET_CURSOR', payload: matchingIndex });
                triggerScroll();
            }
        }

        const timeout = window.setTimeout(() => {
            dispatch({ type: 'CLEAR_TYPEAHEAD' });
        }, 500);

        dispatch({ type: 'SET_TYPEAHEAD_TIMEOUT', payload: timeout });
    }, [state.typeaheadTimeout, state.typeaheadValue, state.items, state.cursor, scrollRequestRef, triggerScroll, dispatch]);

    const keyDownHandler = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
        if (disabled) return;
        const action = getMultiSelectAction(event, open);
        if (action !== MultiSelectActions.None) event.preventDefault();

        switch (action) {
            case MultiSelectActions.Open:
                if (!open) {
                    dispatch({ type: 'SET_PENDING_CURSOR_ACTION', payload: 'default' });
                    setOpen(true);
                }

                break;

            case MultiSelectActions.First:
                if (!open) {
                    dispatch({ type: 'SET_PENDING_CURSOR_ACTION', payload: 'first' });
                    setOpen(true);
                }

                else {
                    scrollRequestRef.current = { type: 'edge-start', targetIndex: 0 }
                    dispatch({ type: 'SET_CURSOR', payload: 0 });
                    triggerScroll();
                }

                break;

            case MultiSelectActions.Last:
                if (!open) {
                    dispatch({ type: 'SET_PENDING_CURSOR_ACTION', payload: 'last' });
                    setOpen(true);
                }

                else {
                    const lastIndex = state.items.length - 1;
                    scrollRequestRef.current = { type: 'edge-end', targetIndex: lastIndex }
                    dispatch({ type: 'SET_CURSOR', payload: lastIndex });
                    triggerScroll();
                }

                break;

            case MultiSelectActions.Previous:
                if (state.cursor > 0) {
                    const newCursor = state.cursor - 1;
                    const scrollType = newCursor === 0 ? 'edge-start' : 'ensure-visible';
                    scrollRequestRef.current = { type: scrollType, targetIndex: newCursor }
                    dispatch({ type: 'SET_CURSOR', payload: newCursor });
                    triggerScroll();
                }

                break;

            case MultiSelectActions.Next:
                if (state.cursor < state.items.length - 1) {
                    const newCursor = state.cursor + 1;
                    const isLast = newCursor === state.items.length - 1;
                    const scrollType = isLast ? 'edge-end' : 'ensure-visible';
                    scrollRequestRef.current = { type: scrollType, targetIndex: newCursor }
                    dispatch({ type: 'SET_CURSOR', payload: newCursor });
                    triggerScroll();
                }

                break;

            case MultiSelectActions.PageUp: {
                const pageUpCursor = Math.max(0, state.cursor - 10);
                const scrollType = pageUpCursor === 0 ? 'edge-start' : 'ensure-visible';
                scrollRequestRef.current = { type: scrollType, targetIndex: pageUpCursor }
                dispatch({ type: 'SET_CURSOR', payload: pageUpCursor });
                triggerScroll();

                break;
            }

            case MultiSelectActions.PageDown: {
                const pageDownCursor = Math.min(state.items.length - 1, state.cursor + 10);
                const isLast = pageDownCursor === state.items.length - 1;
                const scrollType = isLast ? 'edge-end' : 'ensure-visible';
                scrollRequestRef.current = { type: scrollType, targetIndex: pageDownCursor }
                dispatch({ type: 'SET_CURSOR', payload: pageDownCursor });
                triggerScroll();

                break;
            }

            case MultiSelectActions.Type:
                if (!open) {
                    dispatch({ type: 'SET_PENDING_CURSOR_ACTION', payload: 'default' });
                    setOpen(true);
                }

                typeahead(event.key);
                break;

            case MultiSelectActions.Toggle:
                if (state.cursor >= 0 && state.cursor < state.items.length) {
                    const item = state.items[state.cursor];
                    if (!item.disabled) toggleValue(item.value);
                }

                break;

            case MultiSelectActions.SelectAll: {
                const enabledItems = state.items.filter(item => !item.disabled);
                const allValues = enabledItems.map(item => item.value);
                setValue(allValues);

                break;
            }

            case MultiSelectActions.Close:
                if (open) setOpen(false);
                break;

            default: break;
        }
    }, [disabled, open, dispatch, setOpen, scrollRequestRef, triggerScroll, state.items, state.cursor, typeahead, toggleValue, setValue]);

    const Component = asChild ? Slot : 'div';

    return (
        <Component
            data-ui="multi-select-trigger"
            data-state={open ? "open" : "closed"}
            data-disabled={disabled || undefined}

            aria-activedescendant={activeDescendant || undefined}
            aria-disabled={disabled || undefined}
            aria-haspopup="listbox"
            aria-expanded={open}
            role="combobox"

            onKeyDown={keyDownHandler}
            onClick={clickHandler}

            tabIndex={disabled ? -1 : 0}
            ref={triggerRef}

            className={cn(
                'w-fit min-w-64 min-h-9 inline-flex items-center justify-between gap-2 px-3 py-1.5 rounded text-write border border-bound bg-surface transition-all cursor-default',
                'focus-visible:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-outer-bound focus-visible:ring-offset-muted-bound focus-visible:ring-offset-1',
                'data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed data-[disabled]:pointer-events-none',
                className
            )}

            {...props}
        >
            {children}
        </Component>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface SelectedItemData {
    value: string;
    textValue: string;
}

type MultiSelectItemRender = (
    item: SelectedItemData,
    removeHandler: (value: string) => void,
    context: MultiSelectContextState
) => ReactNode;

interface MultiSelectValueProps extends HTMLAttributes<HTMLElement> {
    placeholder?: ReactNode;
    asChild?: boolean;
    maxDisplayedItems?: number;
    itemRender?: MultiSelectItemRender;
}

function MultiSelectValue({
    className,
    children,
    placeholder,
    asChild,
    maxDisplayedItems = 3,
    itemRender,
    ...props
}: MultiSelectValueProps) {
    const context = useMultiSelectContext();
    const { value, itemLabelsRef, itemLabels, toggleValue, disabled } = context;

    const selectedItems: SelectedItemData[] = useMemo(() => {
        return value.map(v => ({
            value: v,
            textValue: itemLabels.get(v) ?? itemLabelsRef.current.get(v) ?? v,
        }));
    }, [value, itemLabels, itemLabelsRef]);

    const displayedItems = selectedItems.slice(0, maxDisplayedItems);
    const remainingCount = Math.max(0, selectedItems.length - maxDisplayedItems);

    const removeHandler = useCallback((itemValue: string) => {
        if (!disabled) toggleValue(itemValue);
    }, [disabled, toggleValue]);

    const defaultItemRender: MultiSelectItemRender = useCallback(
        (
            item: SelectedItemData,
            removeHandler: (value: string) => void,
            ctx: MultiSelectContextState,
        ) => (
            <MultiSelectChip
                key={item.value}
                value={item.value}
                onRemove={removeHandler}
                disabled={ctx.disabled}
            >
                {item.textValue}
            </MultiSelectChip>
        ), []);

    const Component = asChild ? Slot : 'span';

    if (children) return (
        <Component
            data-ui="multi-select-value"
            className={cn('flex-1 flex flex-wrap items-center gap-1 overflow-hidden', className)}
            {...props}
        >
            {children}
        </Component>
    );


    if (!selectedItems.length) return (
        <Component
            data-ui="multi-select-value"
            className={cn('text-sm font-medium text-muted-write overflow-hidden truncate', className)}
            {...props}
        >
            {placeholder ?? ''}
        </Component>
    );

    return (
        <Component
            data-ui="multi-select-value"
            className={cn('flex-1 flex flex-wrap items-center gap-1 overflow-hidden', className)}
            {...props}
        >
            {displayedItems.map(item => (itemRender ?? defaultItemRender)(item, removeHandler, context))}

            {
                remainingCount > 0 && <span className="text-xs font-medium text-muted-write px-1">
                    {`+${remainingCount}`}
                </span>
            }
        </Component >
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface MultiSelectChipProps extends HTMLAttributes<HTMLElement> {
    onRemove?: (value: string) => void;
    textValue?: string;
    disabled?: boolean;
    value?: string;
    asChild?: boolean;
}

function MultiSelectChip({ className, value, children, onRemove, disabled, asChild, ...props }: MultiSelectChipProps) {
    const Component = asChild ? Slot : 'span';

    const removeClickHandler = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        if (!disabled && onRemove && value) onRemove(value);
    }, [disabled, onRemove]);

    const keyDownHandler = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' || e.key === 'Delete') {
            e.stopPropagation();
            if (!disabled && onRemove && value) onRemove(value);
        }
    }, [disabled, onRemove]);

    return (
        <Component
            data-ui="multi-select-chip"
            data-disabled={disabled || undefined}

            onKeyDown={keyDownHandler}

            className={cn(
                'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-muted-surface text-write',
                'data-[disabled]:opacity-50',
                className
            )}

            {...props}
        >
            {children}

            {onRemove && (
                <button
                    data-ui="multi-select-chip-remove"
                    type="button"
                    className="inline-flex items-center justify-center size-3.5 rounded-sm hover:bg-muted-bound/50 focus:outline-none disabled:pointer-events-none"
                    onClick={removeClickHandler}
                    disabled={disabled}
                    aria-label="Remove"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="size-3"
                    >
                        <path
                            d="M6.70711 5.29289C6.31658 4.90237 5.68342 4.90237 5.29289 5.29289C4.90237 5.68342 4.90237 6.31658 5.29289 6.70711L10.5858 12L5.29289 17.2929C4.90237 17.6834 4.90237 18.3166 5.29289 18.7071C5.68342 19.0976 6.31658 19.0976 6.70711 18.7071L12 13.4142L17.2929 18.7071C17.6834 19.0976 18.3166 19.0976 18.7071 18.7071C19.0976 18.3166 19.0976 17.6834 18.7071 17.2929L13.4142 12L18.7071 6.70711C19.0976 6.31658 19.0976 5.68342 18.7071 5.29289C18.3166 4.90237 17.6834 4.90237 17.2929 5.29289L12 10.5858L6.70711 5.29289Z"
                            fill="currentColor"
                        />
                    </svg>
                </button>
            )}
        </Component>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface MultiSelectTriggerIndicatorProps extends HTMLAttributes<HTMLElement> {
    asChild?: boolean;
}

function MultiSelectTriggerIndicator({ className, asChild, children, ...props }: MultiSelectTriggerIndicatorProps) {
    const Component = asChild ? Slot : 'span';

    return (
        <Component
            data-ui="multi-select-trigger-indicator"
            aria-hidden

            className={cn(
                'w-fit text-write shrink-0',
                '[&>svg]:size-4',
                className
            )}

            {...props}
        >
            {
                asChild
                    ? children

                    : <svg
                        data-ui="multi-select-trigger-indicator-icon"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        aria-hidden
                        fill="currentColor"
                    >
                        <path
                            d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                            fill="currentColor"
                            fillRule="evenodd"
                            clipRule="evenodd"
                        />
                    </svg>
            }
        </Component>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface MultiSelectClearProps extends HTMLAttributes<HTMLElement> {
    asChild?: boolean;
}

function MultiSelectClear({ className, asChild, children, ...props }: MultiSelectClearProps) {
    const { setValue, value, disabled } = useMultiSelectContext();

    const clickHandler = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        if (!disabled) setValue([]);
    }, [disabled, setValue]);

    if (value.length === 0) return null;

    const Component = asChild ? Slot : 'button';

    return (
        <Component
            data-ui="multi-select-clear"
            type="button"
            disabled={disabled}
            onClick={clickHandler}
            aria-label="Clear all selections"

            className={cn(
                'w-fit [&>svg]:size-4 text-muted-write hover:text-write shrink-0 transition-colors',
                'disabled:opacity-50 disabled:pointer-events-none',
                className
            )}

            {...props}
        >
            {asChild ? children : (
                <svg
                    data-ui="multi-select-clear-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    aria-hidden
                    fill="currentColor"
                >
                    <path
                        d="M6.70711 5.29289C6.31658 4.90237 5.68342 4.90237 5.29289 5.29289C4.90237 5.68342 4.90237 6.31658 5.29289 6.70711L10.5858 12L5.29289 17.2929C4.90237 17.6834 4.90237 18.3166 5.29289 18.7071C5.68342 19.0976 6.31658 19.0976 6.70711 18.7071L12 13.4142L17.2929 18.7071C17.6834 19.0976 18.3166 19.0976 18.7071 18.7071C19.0976 18.3166 19.0976 17.6834 18.7071 17.2929L13.4142 12L18.7071 6.70711C19.0976 6.31658 19.0976 5.68342 18.7071 5.29289C18.3166 4.90237 17.6834 4.90237 17.2929 5.29289L12 10.5858L6.70711 5.29289Z"
                        fill="currentColor"
                    />
                </svg>
            )}
        </Component>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface MultiSelectPortalProps { container?: HTMLElement, children?: ReactNode }

function MultiSelectPortal({ container, children }: MultiSelectPortalProps) {
    return createPortal(children, container || document.body);
}

// ---------------------------------------------------------------------------------------------------- //

interface MultiSelectContentProps extends HTMLAttributes<HTMLElement> {
    asChild?: boolean;

    onEscapeKeyDown?: (event: React.KeyboardEvent) => void;
    onPointerDownOutside?: (event: PointerEvent) => void;
    onCloseAutoFocus?: (event: Event) => void;

    align?: Align;
    side?: Side;

    alignOffset?: number;
    sideOffset?: number;

    sticky?: Sticky;

    collisionBoundary?: Boundary;
    collisionPadding?: Padding;
    avoidCollisions?: boolean;

    hideWhenDetached?: boolean;
    forceMount?: boolean;
}

function MultiSelectContent({
    asChild = false,

    onPointerDownOutside,
    onCloseAutoFocus,
    onEscapeKeyDown,

    align = "start",
    side = "bottom",

    alignOffset = 0,
    sideOffset = 4,

    sticky = "partial",

    avoidCollisions = true,
    collisionBoundary = [],
    collisionPadding = 8,

    hideWhenDetached = false,
    forceMount = false,

    className,
    children,

    ...props
}: MultiSelectContentProps) {
    const { open, setOpen, triggerRef, contentRef, viewportRef, scrollRequestRef, scrollTrigger, state, dispatch } = useMultiSelectContext();

    const [hasCollected, setHasCollected] = useState(false);
    const isCollectionPass = !hasCollected && !open;

    const [isMounted, setIsMounted] = useState(open || isCollectionPass);
    const lastProcessedRef = useRef<{ trigger: number; positioned: boolean }>({ trigger: 0, positioned: false });

    const {
        top,
        left,
        actualSide,
        maxHeight,
        isPositioned,
        isReferenceHidden
    } = usePosition({
        relativeTo: triggerRef,
        target: contentRef,
        isTargetRendered: isMounted,
        side,
        align,
        sideOffset,
        alignOffset,
        avoidCollisions,
        collisionBoundary,
        collisionPadding,
        sticky,
        hideWhenDetached,
    });

    useLayoutEffect(() => {
        if (!open || !isPositioned) return;

        const { type, targetIndex } = scrollRequestRef.current;
        if (type === 'none') return;

        const lastProcessed = lastProcessedRef.current;
        if (scrollTrigger === lastProcessed.trigger && lastProcessed.positioned) return;

        const viewport = viewportRef.current;
        if (!viewport) return;

        if (targetIndex < 0 || targetIndex >= state.items.length) return;
        const { element } = state.items[targetIndex];
        if (!element) return;

        lastProcessedRef.current = { trigger: scrollTrigger, positioned: true }

        if (type === 'edge-start') viewport.scrollTo({ top: 0, behavior: 'instant' });
        else if (type === 'edge-end') viewport.scrollTo({ top: viewport.scrollHeight - viewport.clientHeight, behavior: 'instant' });

        else if (type === 'ensure-visible') {
            const elementRect = element.getBoundingClientRect();
            const viewportRect = viewport.getBoundingClientRect();
            const elementTop = elementRect.top - viewportRect.top + viewport.scrollTop;
            const elementHeight = elementRect.height;
            const elementBottom = elementTop + elementHeight;
            const scrollTop = viewport.scrollTop;
            const scrollBottom = scrollTop + viewport.clientHeight;

            if (elementTop < scrollTop) viewport.scrollTo({ top: elementTop, behavior: 'instant' });
            else if (elementBottom > scrollBottom) viewport.scrollTo({ top: elementBottom - viewport.clientHeight, behavior: 'instant' });
        }

        scrollRequestRef.current = { type: 'none', targetIndex: -1 }
    }, [open, isPositioned, scrollTrigger, state.items, scrollRequestRef, viewportRef]);

    useEffect(() => {
        if (!open) lastProcessedRef.current = { trigger: 0, positioned: false }
    }, [open]);

    useEffect(() => { if (open) setIsMounted(true) }, [open]);

    useLayoutEffect(() => {
        if (isCollectionPass) {
            setHasCollected(true);
            if (!open) setIsMounted(false);
        }
    }, [isCollectionPass, open]);

    const animationEndHandler = useCallback((event: React.AnimationEvent<HTMLDivElement>) => {
        if (event.target === event.currentTarget && !open) {
            const element = event.currentTarget;
            element.style.display = "none";
            setIsMounted(false);
        }
    }, [open]);

    useEffect(() => {
        if (!open) return;

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const elementsToInert: Element[] = [];

        Array.from(document.body.children).forEach((child) => {
            if (
                child.hasAttribute("inert") ||
                child.contains(contentRef.current) ||
                child.contains(triggerRef.current)
            ) return;

            child.setAttribute("inert", "");
            elementsToInert.push(child);
        });

        return () => {
            document.body.style.overflow = originalOverflow;
            elementsToInert.forEach((el) => { el.removeAttribute("inert") });
        }
    }, [open, contentRef, triggerRef]);

    useEffect(() => {
        if (!open) return;

        const outsideClickHandler = (event: MouseEvent) => {
            if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
                if (triggerRef.current && triggerRef.current.contains(event.target as Node)) return;
                onPointerDownOutside?.(event as PointerEvent);
                setOpen(false);

                dispatch({ type: 'SET_CURSOR', payload: -1 });
                dispatch({ type: 'SET_PENDING_CURSOR_ACTION', payload: null });
            }
        }

        document.addEventListener("mousedown", outsideClickHandler);

        return () => { document.removeEventListener("mousedown", outsideClickHandler) }
    }, [open, contentRef, triggerRef, onPointerDownOutside, setOpen, dispatch]);

    useEffect(() => {
        if (!open) return;

        const keyDownHandler = (event: globalThis.KeyboardEvent) => {
            if (event.key === "Escape") {
                onEscapeKeyDown?.(event as unknown as React.KeyboardEvent);
                setOpen(false);

                dispatch({ type: 'SET_CURSOR', payload: -1 });
                dispatch({ type: 'SET_PENDING_CURSOR_ACTION', payload: null });

                triggerRef.current?.focus();
            }
        }

        document.addEventListener("keydown", keyDownHandler);

        return () => { document.removeEventListener("keydown", keyDownHandler) }
    }, [open, onEscapeKeyDown, setOpen, dispatch, triggerRef]);

    if (!isMounted && !forceMount && !isCollectionPass) return null;

    const Component = asChild ? Slot : 'div';

    return (
        <Component
            data-ui="multi-select-content"
            data-state={open ? "open" : "closed"}
            data-side={actualSide}

            role="listbox"
            aria-multiselectable="true"

            ref={contentRef}
            tabIndex={-1}

            onAnimationEnd={animationEndHandler}

            style={{
                position: 'fixed',
                top: isCollectionPass ? '-9999px' : `${top}px`,
                left: isCollectionPass ? '-9999px' : `${left}px`,
                zIndex: 50,
                maxHeight: maxHeight ? `${maxHeight}px` : undefined,
                display: 'flex',
                flexDirection: 'column',
                visibility: isCollectionPass ? 'hidden' : (isPositioned && !isReferenceHidden ? "visible" : "hidden"),
                pointerEvents: isCollectionPass ? 'none' : 'auto',
                opacity: isCollectionPass ? 0 : undefined,
            }}

            className={cn(
                'min-w-64 w-fit rounded border border-bound bg-surface shadow',
                "data-[state='open']:animate-in data-[state='open']:zoom-in-95 data-[state='open']:fade-in-0",
                "data-[state='closed']:animate-out data-[state='closed']:zoom-out-95 data-[state=closed]:fade-out-0",
                "data-[side=bottom]:slide-in-from-top-2",
                "data-[side=left]:slide-in-from-right-2",
                "data-[side=right]:slide-in-from-left-2",
                "data-[side=top]:slide-in-from-bottom-2",
                className
            )}

            {...props}
        >
            {children}
        </Component>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface MultiSelectViewportProps extends HTMLAttributes<HTMLElement> {
    asChild?: boolean;
}

function MultiSelectViewport({ children, className, asChild, ...props }: MultiSelectViewportProps) {
    const { viewportRef } = useMultiSelectContext();

    const Component = asChild ? Slot : 'div';

    return (
        <Component
            data-ui="multi-select-viewport"

            ref={viewportRef}
            tabIndex={-1}

            className={cn(
                '[scrollbar-width:none] p-1 w-full flex-1 overflow-y-auto',
                className
            )}

            {...props}
        >
            {children}
        </Component>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface MultiSelectItemContextState {
    textElementRef: RefObject<HTMLElement | null>;
    selected: boolean;
}

const MultiSelectItemContext = createContext<MultiSelectItemContextState | null>(null);

function useMultiSelectItemContext(): MultiSelectItemContextState {
    const context = useContext(MultiSelectItemContext);
    if (!context) throw new Error("useMultiSelectItemContext must be used within a <MultiSelectItem> component");
    return context;
}

// ---------------------------------------------------------------------------------------------------- //

interface MultiSelectItemProps extends HTMLAttributes<HTMLElement> {
    value?: string;
    disabled?: boolean;
    textValue?: string;
    asChild?: boolean;
}

function MultiSelectItem({ children, className, value, disabled, textValue, asChild, ...props }: MultiSelectItemProps) {
    const { toggleValue, value: selectedValues, state, dispatch, registerItemLabel } = useMultiSelectContext();

    const ref = useRef<HTMLDivElement>(null);
    const textElementRef = useRef<HTMLElement>(null);
    const fallbackId = useId();
    const itemId = props.id ?? fallbackId;

    const selected = value ? selectedValues.includes(value) : false;
    const itemIndex = state.items.findIndex(item => item.id === itemId);
    const highlighted = itemIndex >= 0 && state.cursor === itemIndex;

    const context: MultiSelectItemContextState = { textElementRef, selected }

    const getResolvedTextValue = useCallback(() => {
        return textValue ??
            textElementRef?.current?.textContent ??
            ref?.current?.textContent ??
            value ??
            '';
    }, [textValue, value]);

    useLayoutEffect(() => {
        if (!value) return;

        const resolvedTextValue = getResolvedTextValue();

        const item: MultiSelectItemEntry = {
            id: itemId,
            value,
            textValue: resolvedTextValue,
            disabled: disabled ?? false,
            element: ref.current,
        }

        dispatch({ type: 'REGISTER_ITEM', payload: item });
        return () => dispatch({ type: 'UNREGISTER_ITEM', payload: itemId });
    }, [itemId, value, disabled, dispatch, getResolvedTextValue]);

    useLayoutEffect(() => {
        if (!value) return;
        const resolvedTextValue = getResolvedTextValue();
        registerItemLabel(value, resolvedTextValue);
    }, [value, registerItemLabel, getResolvedTextValue]);

    const clickHandler = useCallback(() => {
        if (disabled) return;
        if (!value) return;

        const resolvedTextValue = getResolvedTextValue();
        registerItemLabel(value, resolvedTextValue);

        toggleValue(value);
    }, [disabled, value, getResolvedTextValue, registerItemLabel, toggleValue]);

    const mouseEnterHandler = useCallback(() => {
        if (disabled) return;
        if (itemIndex >= 0) dispatch({ type: 'SET_CURSOR', payload: itemIndex });
    }, [disabled, itemIndex, dispatch]);

    const pointerMoveHandler = useCallback(() => {
        if (disabled) return;
        if (itemIndex >= 0) dispatch({ type: 'SET_CURSOR', payload: itemIndex });
    }, [disabled, itemIndex, dispatch]);

    const mouseLeaveHandler = useCallback(() => {
        dispatch({ type: 'SET_CURSOR', payload: -1 });
    }, [dispatch]);

    const Component = asChild ? Slot : 'div';

    return (
        <MultiSelectItemContext.Provider value={context}>
            <Component
                data-ui="multi-select-item"
                data-state={selected ? 'checked' : 'unchecked'}
                data-highlighted={highlighted}
                data-disabled={disabled}

                aria-selected={selected}
                aria-disabled={disabled}
                role="option"

                onMouseEnter={mouseEnterHandler}
                onPointerMove={pointerMoveHandler}
                onMouseLeave={mouseLeaveHandler}
                onClick={clickHandler}

                id={itemId}
                ref={ref}

                className={cn(
                    'flex items-center justify-between w-full text-sm text-write px-2 py-1.5 rounded cursor-pointer relative',
                    'data-[disabled="true"]:opacity-50 data-[disabled="true"]:cursor-not-allowed data-[disabled="true"]:hover:bg-transparent',
                    'data-[highlighted="true"]:bg-muted-surface',
                    'data-[state="checked"]:font-medium',
                    className
                )}

                {...props}
            >
                {children}
            </Component>
        </MultiSelectItemContext.Provider>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface MultiSelectItemTextProps extends HTMLAttributes<HTMLElement> {
    children?: string;
    asChild?: boolean;
}

function MultiSelectItemText({ className, children, asChild, ...props }: MultiSelectItemTextProps) {
    const { textElementRef } = useMultiSelectItemContext();

    const Component = asChild ? Slot : 'span';

    return (
        <Component
            data-ui="multi-select-item-text"
            ref={textElementRef}
            className={cn('flex-1 truncate', className)}

            {...props}
        >
            {children}
        </Component>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface MultiSelectItemIndicatorProps extends HTMLAttributes<HTMLElement> {
    asChild?: boolean;
}

function MultiSelectItemIndicator({ className, asChild, children, ...props }: MultiSelectItemIndicatorProps) {
    const { selected } = useMultiSelectItemContext();
    if (!selected) return null;

    const Component = asChild ? Slot : 'span';

    return (
        <Component
            data-ui="multi-select-item-indicator"

            className={cn(
                'w-fit text-write shrink-0',
                '[&>svg]:size-4',
                className
            )}

            {...props}
        >
            {
                asChild

                    ? children

                    : <svg
                        data-ui="multi-select-item-indicator-icon"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                    >
                        <path
                            d="M20.7071 5.29289C21.0976 5.68342 21.0976 6.31658 20.7071 6.70711L9.70711 17.7071C9.31658 18.0976 8.68342 18.0976 8.29289 17.7071L3.29289 12.7071C2.90237 12.3166 2.90237 11.6834 3.29289 11.2929C3.68342 10.9024 4.31658 10.9024 4.70711 11.2929L9 15.5858L19.2929 5.29289C19.6834 4.90237 20.3166 4.90237 20.7071 5.29289Z"
                            fill="currentColor"
                            fillRule="evenodd"
                            clipRule="evenodd"
                        />
                    </svg>
            }
        </Component>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface MultiSelectGroupContextState {
    labelElementRef: RefObject<HTMLElement | null>;
    groupId: string;
}

const MultiSelectGroupContext = createContext<MultiSelectGroupContextState | null>(null);

function useMultiSelectGroupContext(): MultiSelectGroupContextState {
    const context = useContext(MultiSelectGroupContext);
    if (!context) throw new Error("useMultiSelectGroupContext must be used within a <MultiSelectGroup> component");
    return context;
}

// ---------------------------------------------------------------------------------------------------- //

interface MultiSelectGroupProps extends HTMLAttributes<HTMLElement> {
    asChild?: boolean;
}

function MultiSelectGroup({ children, className, asChild, ...props }: MultiSelectGroupProps) {
    const fallbackId = useId();
    const groupId = props.id ?? fallbackId;
    const labelElementRef = useRef<HTMLElement>(null);
    const labeledBy = labelElementRef?.current?.id ?? `${groupId}-label`;

    const context: MultiSelectGroupContextState = { groupId, labelElementRef }

    const Component = asChild ? Slot : 'div';

    return (
        <MultiSelectGroupContext.Provider value={context}>
            <Component
                data-ui="multi-select-group"

                aria-labelledby={labeledBy}
                role="group"

                id={groupId}

                className={cn(
                    'w-full flex flex-col gap-px',
                    className
                )}

                {...props}
            >
                {children}
            </Component>
        </MultiSelectGroupContext.Provider>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface MultiSelectLabelProps extends HTMLAttributes<HTMLElement> {
    asChild?: boolean;
}

function MultiSelectLabel({ children, className, asChild, ...props }: MultiSelectLabelProps) {
    const { groupId, labelElementRef } = useMultiSelectGroupContext();
    const labelId = props.id ?? `${groupId}-label`;

    const Component = asChild ? Slot : 'span';

    return (
        <Component
            data-ui="multi-select-label"

            ref={labelElementRef}
            id={labelId}

            className={cn(
                'text-xs font-semibold text-muted-write px-2 py-1.5',
                className
            )}

            {...props}
        >
            {children}
        </Component>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface MultiSelectSeparatorProps extends HTMLAttributes<HTMLElement> {
    asChild?: boolean;
}

function MultiSelectSeparator({ className, children, asChild, ...props }: MultiSelectSeparatorProps) {
    const Component = asChild ? Slot : 'span';

    return (
        <Component
            data-ui="multi-select-separator"

            aria-orientation="horizontal"
            role="separator"

            className={cn(
                'block h-px my-1 -mx-1 bg-muted-bound',
                className
            )}

            {...props}
        >
            {children}
        </Component>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface MultiSelectScrollUpButtonProps extends HTMLAttributes<HTMLElement> {
    asChild?: boolean;
}

function MultiSelectScrollUpButton({ className, asChild, children, ...props }: MultiSelectScrollUpButtonProps) {
    const { viewportRef } = useMultiSelectContext();
    const [isAtTop, setIsAtTop] = useState(true);
    const scrollIntervalRef = useRef<number | null>(null);

    useEffect(() => {
        const viewport = viewportRef.current;
        if (!viewport) return;

        const checkPosition = () => {
            setIsAtTop(viewport.scrollTop === 0);
        }

        checkPosition();
        viewport.addEventListener('scroll', checkPosition);
        return () => viewport.removeEventListener('scroll', checkPosition);
    }, [viewportRef]);

    const stopScrolling = useCallback(() => {
        if (scrollIntervalRef.current) {
            clearInterval(scrollIntervalRef.current);
            scrollIntervalRef.current = null;
        }
    }, []);

    const startScrolling = useCallback(() => {
        const viewport = viewportRef.current;
        if (!viewport || isAtTop) return;

        scrollIntervalRef.current = window.setInterval(() => {
            if (viewport.scrollTop === 0) stopScrolling();
            else viewport.scrollBy({ top: -5, behavior: 'auto' });
        }, 20);
    }, [viewportRef, isAtTop, stopScrolling]);

    useEffect(() => {
        return () => stopScrolling();
    }, [stopScrolling]);

    const Component = asChild ? Slot : 'button';

    return (
        <Component
            data-ui="multi-select-scroll-up-button"

            onMouseEnter={startScrolling}
            onMouseLeave={stopScrolling}

            disabled={isAtTop}
            tabIndex={-1}
            type="button"

            className={cn(
                'w-full flex justify-center py-1 transition-colors focus:outline-none text-write',
                'disabled:opacity-30 disabled:cursor-not-allowed',
                '[&>svg]:size-4 [&>svg]:shrink-0',
                'hover:bg-surface ',
                className
            )}

            {...props}
        >
            {
                asChild
                    ? children

                    : <svg
                        data-ui="multi-select-scroll-up-icon"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                    >
                        <path
                            d="M11.2929 8.29289C11.6834 7.90237 12.3166 7.90237 12.7071 8.29289L18.7071 14.2929C19.0976 14.6834 19.0976 15.3166 18.7071 15.7071C18.3166 16.0976 17.6834 16.0976 17.2929 15.7071L12 10.4142L6.70711 15.7071C6.31658 16.0976 5.68342 16.0976 5.29289 15.7071C4.90237 15.3166 4.90237 14.6834 5.29289 14.2929L11.2929 8.29289Z"
                            fill="currentColor"
                            fillRule="evenodd"
                            clipRule="evenodd"
                        />
                    </svg>
            }
        </Component>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface MultiSelectScrollDownButtonProps extends HTMLAttributes<HTMLElement> {
    asChild?: boolean;
}

function MultiSelectScrollDownButton({ className, asChild, children, ...props }: MultiSelectScrollDownButtonProps) {
    const { viewportRef } = useMultiSelectContext();
    const [isAtBottom, setIsAtBottom] = useState(false);
    const scrollIntervalRef = useRef<number | null>(null);

    useEffect(() => {
        const viewport = viewportRef.current;
        if (!viewport) return;

        const checkPosition = () => {
            const atBottom = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight === 0;
            setIsAtBottom(atBottom);
        }

        checkPosition();
        viewport.addEventListener('scroll', checkPosition);

        const observer = new ResizeObserver(checkPosition);
        observer.observe(viewport);

        return () => {
            viewport.removeEventListener('scroll', checkPosition);
            observer.disconnect();
        }
    }, [viewportRef]);

    const stopScrolling = useCallback(() => {
        if (scrollIntervalRef.current) {
            clearInterval(scrollIntervalRef.current);
            scrollIntervalRef.current = null;
        }
    }, []);

    const startScrolling = useCallback(() => {
        const viewport = viewportRef.current;
        if (!viewport || isAtBottom) return;

        scrollIntervalRef.current = window.setInterval(() => {
            const atBottom = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight === 0;
            if (atBottom) stopScrolling();
            else viewport.scrollBy({ top: 5, behavior: 'auto' });
        }, 20);
    }, [viewportRef, isAtBottom, stopScrolling]);

    useEffect(() => {
        return () => stopScrolling();
    }, [stopScrolling]);

    const Component = asChild ? Slot : 'button';

    return (
        <Component
            data-ui="multi-select-scroll-down-button"

            onMouseEnter={startScrolling}
            onMouseLeave={stopScrolling}

            disabled={isAtBottom}
            tabIndex={-1}
            type="button"

            className={cn(
                'w-full flex justify-center py-1 transition-colors focus:outline-none text-write',
                'disabled:opacity-30 disabled:cursor-not-allowed',
                '[&>svg]:size-4 [&>svg]:shrink-0',
                'hover:bg-surface',
                className
            )}

            {...props}
        >
            {asChild ? children : (
                <svg
                    data-ui="multi-select-scroll-down-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                >
                    <path
                        d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                        fill="currentColor"
                        fillRule="evenodd"
                        clipRule="evenodd"
                    />
                </svg>
            )}
        </Component>
    );
}

// ---------------------------------------------------------------------------------------------------- //

export {
    MultiSelect,
    MultiSelectTrigger,
    MultiSelectValue,
    MultiSelectChip,
    MultiSelectTriggerIndicator,
    MultiSelectClear,
    MultiSelectPortal,
    MultiSelectContent,
    MultiSelectViewport,
    MultiSelectItem,
    MultiSelectItemText,
    MultiSelectItemIndicator,
    MultiSelectGroup,
    MultiSelectLabel,
    MultiSelectSeparator,
    MultiSelectScrollUpButton,
    MultiSelectScrollDownButton,
    type MultiSelectProps,
    type MultiSelectTriggerProps,
    type MultiSelectValueProps,
    type MultiSelectChipProps,
    type MultiSelectTriggerIndicatorProps,
    type MultiSelectClearProps,
    type MultiSelectPortalProps,
    type MultiSelectContentProps,
    type MultiSelectViewportProps,
    type MultiSelectItemProps,
    type MultiSelectItemTextProps,
    type MultiSelectItemIndicatorProps,
    type MultiSelectGroupProps,
    type MultiSelectLabelProps,
    type MultiSelectSeparatorProps,
    type MultiSelectScrollUpButtonProps,
    type MultiSelectScrollDownButtonProps,
}

// ---------------------------------------------------------------------------------------------------- //
