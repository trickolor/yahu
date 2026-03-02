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

import { useControllableState } from "@/hooks/use-controllable-state";

import { Slot } from "@/ui/slot";
import { cn } from "@/cn";

// ---------------------------------------------------------------------------------------------------- //

const ListboxActions = {
    None: -1,
    Select: 0,
    Toggle: 1,
    First: 2,
    Last: 3,
    Previous: 4,
    Next: 5,
    PageUp: 6,
    PageDown: 7,
    Type: 8,
    SelectAll: 9,
    DeselectAll: 10,
} as const;

type ListboxAction = typeof ListboxActions[keyof typeof ListboxActions];

const getListboxAction = (event: KeyboardEvent<HTMLDivElement>, multiple: boolean): ListboxAction => {
    const { key, altKey, ctrlKey, metaKey, shiftKey } = event;

    if (key === 'Home') return ListboxActions.First;
    if (key === 'End') return ListboxActions.Last;

    if (multiple && key === 'a' && (ctrlKey || metaKey) && shiftKey) return ListboxActions.DeselectAll;
    if (multiple && key === 'a' && (ctrlKey || metaKey)) return ListboxActions.SelectAll;

    if (
        key === 'Backspace' ||
        key === 'Clear' ||
        key.length === 1 && key !== ' ' && !altKey && !ctrlKey && !metaKey
    ) return ListboxActions.Type;

    switch (key) {
        case 'ArrowUp': return ListboxActions.Previous;
        case 'ArrowDown': return ListboxActions.Next;
        case 'PageUp': return ListboxActions.PageUp;
        case 'PageDown': return ListboxActions.PageDown;
        case 'Enter': case ' ': return multiple ? ListboxActions.Toggle : ListboxActions.Select;
    }

    return ListboxActions.None;
}

// ---------------------------------------------------------------------------------------------------- //

interface ListboxItemEntry {
    id: string;
    value: string;
    textValue: string;
    disabled: boolean;
    element: HTMLElement | null;
}

interface ListboxState {
    cursor: number;
    items: ListboxItemEntry[];
    typeaheadValue: string;
    typeaheadTimeout: number | null;
}

type ListboxStateAction =
    | { type: 'SET_CURSOR'; payload: number }
    | { type: 'REGISTER_ITEM'; payload: ListboxItemEntry }
    | { type: 'UNREGISTER_ITEM'; payload: string }
    | { type: 'SET_TYPEAHEAD_VALUE'; payload: string }
    | { type: 'SET_TYPEAHEAD_TIMEOUT'; payload: number | null }
    | { type: 'CLEAR_TYPEAHEAD' }

function listboxStateReducer(state: ListboxState, action: ListboxStateAction): ListboxState {
    switch (action.type) {
        case 'SET_CURSOR':
            return { ...state, cursor: action.payload }

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

        case 'UNREGISTER_ITEM':
            return { ...state, items: state.items.filter(item => item.id !== action.payload) }

        case 'SET_TYPEAHEAD_VALUE':
            return { ...state, typeaheadValue: action.payload }

        case 'SET_TYPEAHEAD_TIMEOUT':
            return { ...state, typeaheadTimeout: action.payload }

        case 'CLEAR_TYPEAHEAD': {
            if (state.typeaheadTimeout) clearTimeout(state.typeaheadTimeout);
            return { ...state, typeaheadValue: '', typeaheadTimeout: null }
        }

        default: return state;
    }
}

// ---------------------------------------------------------------------------------------------------- //

interface ListboxContextState {
    value: string | string[];
    setValue: (value: string | string[]) => void;
    toggleValue: (itemValue: string) => void;

    multiple: boolean;
    disabled: boolean;

    state: ListboxState;
    dispatch: Dispatch<ListboxStateAction>;

    activeDescendant: string | null;

    rootRef: RefObject<HTMLDivElement | null>;
    viewportRef: RefObject<HTMLDivElement | null>;

    scrollRequestRef: RefObject<{
        type: 'none' | 'ensure-visible' | 'edge-start' | 'edge-end';
        targetIndex: number;
    }>;

    scrollTrigger: number;
    triggerScroll: () => void;
}

const ListboxContext = createContext<ListboxContextState | null>(null);

function useListboxContext(): ListboxContextState {
    const context = useContext(ListboxContext);
    if (!context) throw new Error("useListboxContext must be used within a <Listbox> component");
    return context;
}

// ---------------------------------------------------------------------------------------------------- //

interface ListboxProps extends HTMLAttributes<HTMLElement> {
    value?: string | string[];
    defaultValue?: string | string[];
    onValueChange?: (value: string | string[]) => void;

    multiple?: boolean;
    disabled?: boolean;

    asChild?: boolean;
    children?: ReactNode;
}

function Listbox({
    defaultValue,
    onValueChange,
    value,
    multiple = false,
    disabled = false,
    asChild,
    className,
    children,
    ...props
}: ListboxProps) {

    const [valueState, setValue] = useControllableState({
        defaultValue: defaultValue ?? (multiple ? [] : ''),
        onChange: onValueChange,
        value,
    });

    const [state, dispatch] = useReducer(listboxStateReducer, {
        cursor: -1,
        items: [],
        typeaheadValue: '',
        typeaheadTimeout: null,
    });

    const rootRef = useRef<HTMLDivElement>(null);
    const viewportRef = useRef<HTMLDivElement>(null);

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
        if (multiple && Array.isArray(valueState)) {
            const newValue = valueState.includes(itemValue)
                ? valueState.filter(v => v !== itemValue)
                : [...valueState, itemValue];
            setValue(newValue);
        } else {
            setValue(itemValue);
        }
    }, [multiple, valueState, setValue]);

    // Scroll handling
    useLayoutEffect(() => {
        const { type, targetIndex } = scrollRequestRef.current;
        if (type === 'none') return;

        const viewport = viewportRef.current;
        if (!viewport) return;

        if (targetIndex < 0 || targetIndex >= state.items.length) return;
        const { element } = state.items[targetIndex];
        if (!element) return;

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
    }, [scrollTrigger, state.items]);

    // Typeahead
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

    // On focus, if cursor is -1, set to first selected item index (or 0)
    const focusHandler = useCallback(() => {
        if (disabled) return;
        if (state.cursor !== -1) return;

        if (state.items.length === 0) return;

        let initialCursor = -1;

        if (multiple && Array.isArray(valueState)) {
            if (valueState.length > 0) {
                initialCursor = state.items.findIndex(item => valueState.includes(item.value));
            }
        } else if (typeof valueState === 'string' && valueState !== '') {
            initialCursor = state.items.findIndex(item => item.value === valueState);
        }

        if (initialCursor < 0) initialCursor = 0;

        scrollRequestRef.current = { type: 'ensure-visible', targetIndex: initialCursor }
        dispatch({ type: 'SET_CURSOR', payload: initialCursor });
        triggerScroll();
    }, [disabled, state.cursor, state.items, multiple, valueState, scrollRequestRef, dispatch, triggerScroll]);

    // Keyboard handler
    const keyDownHandler = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
        if (disabled) return;

        // Tab: let default behavior proceed, do NOT intercept
        if (event.key === 'Tab') return;

        const action = getListboxAction(event, multiple);
        if (action !== ListboxActions.None) event.preventDefault();

        switch (action) {
            case ListboxActions.First: {
                scrollRequestRef.current = { type: 'edge-start', targetIndex: 0 }
                dispatch({ type: 'SET_CURSOR', payload: 0 });
                triggerScroll();
                break;
            }

            case ListboxActions.Last: {
                const lastIndex = state.items.length - 1;
                scrollRequestRef.current = { type: 'edge-end', targetIndex: lastIndex }
                dispatch({ type: 'SET_CURSOR', payload: lastIndex });
                triggerScroll();
                break;
            }

            case ListboxActions.Previous:
                if (state.cursor > 0) {
                    const newCursor = state.cursor - 1;
                    const scrollType = newCursor === 0 ? 'edge-start' : 'ensure-visible';
                    scrollRequestRef.current = { type: scrollType, targetIndex: newCursor }
                    dispatch({ type: 'SET_CURSOR', payload: newCursor });
                    triggerScroll();
                }

                break;

            case ListboxActions.Next:
                if (state.cursor < state.items.length - 1) {
                    const newCursor = state.cursor + 1;
                    const isLast = newCursor === state.items.length - 1;
                    const scrollType = isLast ? 'edge-end' : 'ensure-visible';
                    scrollRequestRef.current = { type: scrollType, targetIndex: newCursor }
                    dispatch({ type: 'SET_CURSOR', payload: newCursor });
                    triggerScroll();
                }

                break;

            case ListboxActions.PageUp: {
                const pageUpCursor = Math.max(0, state.cursor - 10);
                const scrollType = pageUpCursor === 0 ? 'edge-start' : 'ensure-visible';
                scrollRequestRef.current = { type: scrollType, targetIndex: pageUpCursor }
                dispatch({ type: 'SET_CURSOR', payload: pageUpCursor });
                triggerScroll();
                break;
            }

            case ListboxActions.PageDown: {
                const pageDownCursor = Math.min(state.items.length - 1, state.cursor + 10);
                const isLast = pageDownCursor === state.items.length - 1;
                const scrollType = isLast ? 'edge-end' : 'ensure-visible';
                scrollRequestRef.current = { type: scrollType, targetIndex: pageDownCursor }
                dispatch({ type: 'SET_CURSOR', payload: pageDownCursor });
                triggerScroll();
                break;
            }

            case ListboxActions.Type:
                typeahead(event.key);
                break;

            case ListboxActions.Select:
                if (state.cursor >= 0 && state.cursor < state.items.length) {
                    const item = state.items[state.cursor];
                    if (!item.disabled) setValue(item.value);
                }

                break;

            case ListboxActions.Toggle:
                if (state.cursor >= 0 && state.cursor < state.items.length) {
                    const item = state.items[state.cursor];
                    if (!item.disabled) toggleValue(item.value);
                }

                break;

            case ListboxActions.SelectAll: {
                const enabledItems = state.items.filter(item => !item.disabled);
                const allValues = enabledItems.map(item => item.value);
                setValue(allValues);
                break;
            }

            case ListboxActions.DeselectAll:
                setValue([]);
                break;

            default: break;
        }
    }, [disabled, multiple, dispatch, scrollRequestRef, triggerScroll, state.items, state.cursor, typeahead, toggleValue, setValue]);

    const context: ListboxContextState = useMemo(() => ({
        value: valueState,
        setValue,
        toggleValue,
        multiple,
        disabled,
        state,
        dispatch,
        activeDescendant,
        rootRef,
        viewportRef,
        scrollRequestRef,
        scrollTrigger,
        triggerScroll,
    }), [valueState, setValue, toggleValue, multiple, disabled, state, activeDescendant, scrollTrigger, triggerScroll]);

    const Component = asChild ? Slot : 'div';

    return (
        <ListboxContext.Provider value={context}>
            <Component
                data-ui="listbox"
                data-disabled={disabled || undefined}

                role="listbox"
                aria-multiselectable={multiple || undefined}
                aria-activedescendant={activeDescendant || undefined}
                aria-disabled={disabled || undefined}

                onKeyDown={keyDownHandler}
                onFocus={focusHandler}

                ref={rootRef}
                tabIndex={disabled ? -1 : 0}

                className={cn(
                    'w-full flex flex-col rounded border border-bound bg-surface',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-outer-bound focus-visible:ring-offset-muted-bound focus-visible:ring-offset-1',
                    'data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed data-[disabled]:pointer-events-none',
                    className
                )}

                {...props}
            >
                {children}
            </Component>
        </ListboxContext.Provider>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface ListboxViewportProps extends HTMLAttributes<HTMLElement> {
    asChild?: boolean;
}

function ListboxViewport({ children, className, asChild, ...props }: ListboxViewportProps) {
    const { viewportRef } = useListboxContext();

    const Component = asChild ? Slot : 'div';

    return (
        <Component
            data-ui="listbox-viewport"

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

interface ListboxItemContextState {
    textElementRef: RefObject<HTMLElement | null>;
    selected: boolean;
}

const ListboxItemContext = createContext<ListboxItemContextState | null>(null);

function useListboxItemContext(): ListboxItemContextState {
    const context = useContext(ListboxItemContext);
    if (!context) throw new Error("useListboxItemContext must be used within a <ListboxItem> component");
    return context;
}

// ---------------------------------------------------------------------------------------------------- //

interface ListboxItemProps extends HTMLAttributes<HTMLElement> {
    value?: string;
    disabled?: boolean;
    textValue?: string;
    asChild?: boolean;
}

function ListboxItem({ children, className, value, disabled, textValue, asChild, ...props }: ListboxItemProps) {
    const { multiple, toggleValue, setValue, value: currentValue, state, dispatch } = useListboxContext();

    const ref = useRef<HTMLDivElement>(null);
    const textElementRef = useRef<HTMLElement>(null);
    const fallbackId = useId();
    const itemId = props.id ?? fallbackId;

    const selected = multiple
        ? (Array.isArray(currentValue) && value ? currentValue.includes(value) : false)
        : value === currentValue;

    const itemIndex = state.items.findIndex(item => item.id === itemId);
    const highlighted = itemIndex >= 0 && state.cursor === itemIndex;

    const context: ListboxItemContextState = { textElementRef, selected }

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

        const item: ListboxItemEntry = {
            id: itemId,
            value,
            textValue: resolvedTextValue,
            disabled: disabled ?? false,
            element: ref.current,
        }

        dispatch({ type: 'REGISTER_ITEM', payload: item });
        return () => dispatch({ type: 'UNREGISTER_ITEM', payload: itemId });
    }, [itemId, value, disabled, dispatch, getResolvedTextValue]);

    const clickHandler = useCallback(() => {
        if (disabled) return;
        if (!value) return;

        if (multiple) {
            toggleValue(value);
        } else {
            setValue(value);
        }
    }, [disabled, value, multiple, toggleValue, setValue]);

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
        <ListboxItemContext.Provider value={context}>
            <Component
                data-ui="listbox-item"
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
        </ListboxItemContext.Provider>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface ListboxItemTextProps extends HTMLAttributes<HTMLElement> {
    children?: string;
    asChild?: boolean;
}

function ListboxItemText({ className, children, asChild, ...props }: ListboxItemTextProps) {
    const { textElementRef } = useListboxItemContext();

    const Component = asChild ? Slot : 'span';

    return (
        <Component
            data-ui="listbox-item-text"

            ref={textElementRef}

            className={cn(
                'flex-1 truncate',
                className
            )}

            {...props}
        >
            {children}
        </Component>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface ListboxItemIndicatorProps extends HTMLAttributes<HTMLElement> {
    asChild?: boolean;
}

function ListboxItemIndicator({ className, asChild, children, ...props }: ListboxItemIndicatorProps) {
    const { selected } = useListboxItemContext();
    if (!selected) return null;

    const Component = asChild ? Slot : 'span';

    return (
        <Component
            data-ui="listbox-item-indicator"

            className={cn(
                'w-fit [&>svg]:size-4 text-write shrink-0',
                className
            )}

            {...props}
        >
            {asChild ? children : (
                <svg
                    data-ui="listbox-item-indicator-icon"

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
            )}
        </Component>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface ListboxGroupContextState {
    labelElementRef: RefObject<HTMLElement | null>;
    groupId: string;
}

const ListboxGroupContext = createContext<ListboxGroupContextState | null>(null);

function useListboxGroupContext(): ListboxGroupContextState {
    const context = useContext(ListboxGroupContext);
    if (!context) throw new Error("useListboxGroupContext must be used within a <ListboxGroup> component");
    return context;
}

// ---------------------------------------------------------------------------------------------------- //

interface ListboxGroupProps extends HTMLAttributes<HTMLElement> {
    asChild?: boolean;
}

function ListboxGroup({ children, className, asChild, ...props }: ListboxGroupProps) {
    const fallbackId = useId();
    const groupId = props.id ?? fallbackId;
    const labelElementRef = useRef<HTMLElement>(null);
    const labeledBy = labelElementRef?.current?.id ?? `${groupId}-label`;

    const context: ListboxGroupContextState = { groupId, labelElementRef }

    const Component = asChild ? Slot : 'div';

    return (
        <ListboxGroupContext.Provider value={context}>
            <Component
                data-ui="listbox-group"

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
        </ListboxGroupContext.Provider>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface ListboxLabelProps extends HTMLAttributes<HTMLElement> {
    asChild?: boolean;
}

function ListboxLabel({ children, className, asChild, ...props }: ListboxLabelProps) {
    const { groupId, labelElementRef } = useListboxGroupContext();
    const labelId = props.id ?? `${groupId}-label`;

    const Component = asChild ? Slot : 'span';

    return (
        <Component
            data-ui="listbox-label"

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

interface ListboxSeparatorProps extends HTMLAttributes<HTMLElement> {
    asChild?: boolean;
}

function ListboxSeparator({ className, children, asChild, ...props }: ListboxSeparatorProps) {
    const Component = asChild ? Slot : 'span';

    return (
        <Component
            data-ui="listbox-separator"

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

interface ListboxScrollUpButtonProps extends HTMLAttributes<HTMLElement> {
    asChild?: boolean;
}

function ListboxScrollUpButton({ className, asChild, children, ...props }: ListboxScrollUpButtonProps) {
    const { viewportRef } = useListboxContext();
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
            data-ui="listbox-scroll-up-button"

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
            {asChild ? children : (
                <svg
                    data-ui="listbox-scroll-up-icon"

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
            )}
        </Component>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface ListboxScrollDownButtonProps extends HTMLAttributes<HTMLElement> {
    asChild?: boolean;
}

function ListboxScrollDownButton({ className, asChild, children, ...props }: ListboxScrollDownButtonProps) {
    const { viewportRef } = useListboxContext();
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
            data-ui="listbox-scroll-down-button"

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
                    data-ui="listbox-scroll-down-icon"

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
            )}
        </Component>
    );
}

// ---------------------------------------------------------------------------------------------------- //

export {
    Listbox,
    ListboxViewport,
    ListboxItem,
    ListboxItemText,
    ListboxItemIndicator,
    ListboxGroup,
    ListboxLabel,
    ListboxSeparator,
    ListboxScrollUpButton,
    ListboxScrollDownButton,
    type ListboxProps,
    type ListboxViewportProps,
    type ListboxItemProps,
    type ListboxItemTextProps,
    type ListboxItemIndicatorProps,
    type ListboxGroupProps,
    type ListboxLabelProps,
    type ListboxSeparatorProps,
    type ListboxScrollUpButtonProps,
    type ListboxScrollDownButtonProps,
}

// ---------------------------------------------------------------------------------------------------- //
