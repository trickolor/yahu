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

interface SelectState {
    textValue: string | null;
    cursor: number;
    items: SelectItemEntry[];
    typeaheadValue: string;
    typeaheadTimeout: number | null;
    pendingCursorAction: 'first' | 'last' | 'default' | null;
}

type SelectStateAction =
    | { type: 'SET_TEXT_VALUE'; payload: string | null }
    | { type: 'SET_CURSOR'; payload: number }
    | { type: 'SET_PENDING_CURSOR_ACTION'; payload: 'first' | 'last' | 'default' | null }
    | { type: 'REGISTER_ITEM'; payload: SelectItemEntry }
    | { type: 'UNREGISTER_ITEM'; payload: string }
    | { type: 'SET_TYPEAHEAD_VALUE'; payload: string }
    | { type: 'SET_TYPEAHEAD_TIMEOUT'; payload: number | null }
    | { type: 'CLEAR_TYPEAHEAD' }

function selectStateReducer(state: SelectState, action: SelectStateAction): SelectState {
    switch (action.type) {
        case 'SET_TEXT_VALUE':
            return { ...state, textValue: action.payload }

        case 'SET_CURSOR':
            return { ...state, cursor: action.payload }

        case 'SET_PENDING_CURSOR_ACTION':
            return { ...state, pendingCursorAction: action.payload }

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

        case 'CLEAR_TYPEAHEAD':
            if (state.typeaheadTimeout) clearTimeout(state.typeaheadTimeout);
            return { ...state, typeaheadValue: '', typeaheadTimeout: null }

        default: return state;
    }
}

// ---------------------------------------------------------------------------------------------------- //

interface SelectContextState {
    value: string;
    setValue: (value: string) => void;

    open: boolean;
    setOpen: (open: boolean) => void;

    disabled: boolean;

    state: SelectState;
    dispatch: Dispatch<SelectStateAction>;

    activeDescendant: string | null;

    // For registering item labels
    registerItemLabel: (itemValue: string, textValue: string) => void;

    viewportRef: RefObject<HTMLDivElement | null>;
    triggerRef: RefObject<HTMLButtonElement | null>;
    contentRef: RefObject<HTMLDivElement | null>;

    scrollRequestRef: RefObject<{
        type: 'none' | 'center' | 'ensure-visible' | 'edge-start' | 'edge-end';
        targetIndex: number;
    }>;

    scrollTrigger: number;
    triggerScroll: () => void;
}

const SelectContext = createContext<SelectContextState | null>(null);

function useSelectContext(): SelectContextState {
    const context = useContext(SelectContext);
    if (!context) throw new Error("useSelectContext must be used within a <Select> component");
    return context;
}

// ---------------------------------------------------------------------------------------------------- //

interface SelectProps {
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

function Select({
    defaultValue, onValueChange, value,
    defaultOpen, onOpenChange, open,
    disabled = false,
    children,
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

    const [state, dispatch] = useReducer(selectStateReducer, {
        textValue: null,
        cursor: -1,
        items: [],
        typeaheadValue: '',
        typeaheadTimeout: null,
        pendingCursorAction: null,
    });

    const viewportRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    const scrollRequestRef = useRef<{
        type: 'none' | 'center' | 'ensure-visible' | 'edge-start' | 'edge-end';
        targetIndex: number;
    }>({ type: 'none', targetIndex: -1 });

    const [scrollTrigger, setScrollTrigger] = useState(0);
    const triggerScroll = useCallback(() => setScrollTrigger(prev => prev + 1), []);

    const activeDescendant = useMemo(() => {
        return state.cursor >= 0 && state.cursor < state.items.length
            ? state.items[state.cursor].id
            : null;
    }, [state.cursor, state.items]);

    // Register item label - if it matches current value and textValue is null, set it
    const registerItemLabel = useCallback((itemValue: string, textValue: string) => {
        if (itemValue === valueState && state.textValue === null) {
            dispatch({ type: 'SET_TEXT_VALUE', payload: textValue });
        }
    }, [valueState, state.textValue, dispatch]);

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
            const currentIndex = state.items.findIndex(item => item.value === valueState);
            const initialCursor = currentIndex >= 0 ? currentIndex : 0;
            scrollRequestRef.current = { type: 'center', targetIndex: initialCursor }
            dispatch({ type: 'SET_CURSOR', payload: initialCursor });
            triggerScroll();
        }

        dispatch({ type: 'SET_PENDING_CURSOR_ACTION', payload: null });
    }, [openState, state.items.length, state.pendingCursorAction, valueState, triggerScroll]);

    const context: SelectContextState = useMemo(() => ({
        value: valueState,
        setValue,
        open: openState,
        setOpen,
        disabled,
        state,
        dispatch,
        activeDescendant,
        registerItemLabel,
        triggerRef,
        contentRef,
        viewportRef,
        scrollRequestRef,
        scrollTrigger,
        triggerScroll,
    }), [valueState, setValue, openState, setOpen, disabled, state, activeDescendant, registerItemLabel, scrollTrigger, triggerScroll]);

    return (
        <SelectContext.Provider data-ui="select" value={context}>
            {children}
        </SelectContext.Provider>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface SelectTriggerProps extends HTMLAttributes<HTMLElement> {
    asChild?: boolean;
}

function SelectTrigger({ className, children, asChild, ...props }: SelectTriggerProps) {
    const { open, setOpen, state, dispatch, setValue, activeDescendant, triggerRef, scrollRequestRef, triggerScroll, disabled } = useSelectContext();

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
    }, [state.typeaheadTimeout, state.typeaheadValue, state.items, state.cursor, scrollRequestRef, triggerScroll]);

    const keyDownHandler = useCallback((event: KeyboardEvent<HTMLButtonElement>) => {
        if (disabled) return;
        const action = getSelectAction(event, open);
        if (action !== SelectActions.None) event.preventDefault();

        switch (action) {
            case SelectActions.Open:
                if (!open) {
                    dispatch({ type: 'SET_PENDING_CURSOR_ACTION', payload: 'default' });
                    setOpen(true);
                }

                break;

            case SelectActions.First:
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

            case SelectActions.Last:
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

            case SelectActions.Previous:
                if (state.cursor > 0) {
                    const newCursor = state.cursor - 1;
                    const scrollType = newCursor === 0 ? 'edge-start' : 'ensure-visible';
                    scrollRequestRef.current = { type: scrollType, targetIndex: newCursor }
                    dispatch({ type: 'SET_CURSOR', payload: newCursor });
                    triggerScroll();
                }

                break;

            case SelectActions.Next:
                if (state.cursor < state.items.length - 1) {
                    const newCursor = state.cursor + 1;
                    const isLast = newCursor === state.items.length - 1;
                    const scrollType = isLast ? 'edge-end' : 'ensure-visible';
                    scrollRequestRef.current = { type: scrollType, targetIndex: newCursor }
                    dispatch({ type: 'SET_CURSOR', payload: newCursor });
                    triggerScroll();
                }

                break;

            case SelectActions.PageUp: {
                const pageUpCursor = Math.max(0, state.cursor - 10);
                const scrollType = pageUpCursor === 0 ? 'edge-start' : 'ensure-visible';
                scrollRequestRef.current = { type: scrollType, targetIndex: pageUpCursor }
                dispatch({ type: 'SET_CURSOR', payload: pageUpCursor });
                triggerScroll();
                break;
            }

            case SelectActions.PageDown: {
                const pageDownCursor = Math.min(state.items.length - 1, state.cursor + 10);
                const isLast = pageDownCursor === state.items.length - 1;
                const scrollType = isLast ? 'edge-end' : 'ensure-visible';
                scrollRequestRef.current = { type: scrollType, targetIndex: pageDownCursor }
                dispatch({ type: 'SET_CURSOR', payload: pageDownCursor });
                triggerScroll();
                break;
            }

            case SelectActions.Type:
                if (!open) {
                    dispatch({ type: 'SET_PENDING_CURSOR_ACTION', payload: 'default' });
                    setOpen(true);
                }

                typeahead(event.key);
                break;

            case SelectActions.Select:
                if (state.cursor >= 0 && state.cursor < state.items.length) {
                    setValue(state.items[state.cursor].value);
                    dispatch({ type: 'SET_TEXT_VALUE', payload: state.items[state.cursor].textValue });
                    if (open) setOpen(false);
                }

                break;

            case SelectActions.FocusMove:
                if (state.cursor >= 0 && state.cursor < state.items.length) {
                    setValue(state.items[state.cursor].value);
                    dispatch({ type: 'SET_TEXT_VALUE', payload: state.items[state.cursor].textValue });
                    if (open) setOpen(false);

                    const focusables = (Array.from(document.querySelectorAll('*')) as HTMLElement[])
                        .filter(i => i.tabIndex >= 0 && ('disabled' in i ? !i.disabled : true) && i.offsetParent !== null)

                    const nextFocusable = focusables[focusables.indexOf(event.target as HTMLButtonElement) + 1]
                    if (nextFocusable) nextFocusable.focus();
                }

                break;

            case SelectActions.Close:
                if (open) setOpen(false);
                break;

            default: break;
        }
    }, [disabled, open, dispatch, setOpen, scrollRequestRef, triggerScroll, state.items, state.cursor, typeahead, setValue]);

    const Component = asChild ? Slot : 'button';

    return (
        <Component
            data-ui="select-trigger"
            data-state={open ? "open" : "closed"}
            data-disabled={disabled || undefined}

            aria-activedescendant={activeDescendant || undefined}
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-disabled={disabled || undefined}
            role="combobox"

            onKeyDown={keyDownHandler}
            onClick={clickHandler}

            ref={triggerRef}
            type="button"
            disabled={disabled}
            tabIndex={disabled ? -1 : 0}

            className={cn(
                'w-fit min-w-64 h-9 inline-flex items-center justify-between gap-2 px-3 py-2 rounded text-write border border-bound bg-surface transition-all',
                'focus-visible:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-outer-bound focus-visible:ring-offset-muted-bound focus-visible:ring-offset-1',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                className
            )}

            {...props}
        >
            {children}
        </Component>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface SelectValueProps extends HTMLAttributes<HTMLElement> {
    placeholder?: ReactNode;
    asChild?: boolean;
}

function SelectValue({ className, children, placeholder, asChild, ...props }: SelectValueProps) {
    const { state } = useSelectContext();

    const displayed = children ?? state.textValue ?? placeholder ?? '';

    const Component = asChild ? Slot : 'span';

    return (
        <Component
            data-ui="select-value"

            className={cn(
                'text-sm font-medium text-write overflow-hidden truncate',
                className
            )}

            {...props}
        >
            {displayed}
        </Component>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface SelectTriggerIndicatorProps extends HTMLAttributes<HTMLElement> {
    asChild?: boolean;
}

function SelectTriggerIndicator({ className, asChild, children, ...props }: SelectTriggerIndicatorProps) {
    const Component = asChild ? Slot : 'span';

    return (
        <Component
            data-ui="select-trigger-indicator"

            aria-hidden

            className={cn(
                'w-fit [&>svg]:size-4 text-write shrink-0',
                className
            )}

            {...props}
        >
            {asChild ? children : (
                <svg
                    data-ui="select-trigger-indicator-icon"

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
            )}
        </Component>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface SelectPortalProps { container?: HTMLElement, children?: ReactNode }

function SelectPortal({ container, children }: SelectPortalProps) {
    return createPortal(children, container || document.body);
}

// ---------------------------------------------------------------------------------------------------- //

interface SelectContentProps extends HTMLAttributes<HTMLElement> {
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

    position?: "item-aligned" | "popper";
}

function SelectContent({
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

    position = "popper",

    className,
    children,

    ...props
}: SelectContentProps) {

    const { open, setOpen, triggerRef, contentRef, viewportRef, scrollRequestRef, scrollTrigger, state, dispatch } = useSelectContext();

    // Collection pass: mount invisibly on first render to collect item labels, then unmount
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

        else if (type === 'center') {
            const elementRect = element.getBoundingClientRect();
            const viewportRect = viewport.getBoundingClientRect();
            const elementTop = elementRect.top - viewportRect.top + viewport.scrollTop;
            const elementHeight = elementRect.height;
            const viewportHeight = viewport.clientHeight;
            const centerOffset = (viewportHeight - elementHeight) / 2;
            const targetScroll = elementTop - centerOffset;
            const maxScroll = viewport.scrollHeight - viewportHeight;
            const clampedScroll = Math.max(0, Math.min(targetScroll, maxScroll));
            viewport.scrollTo({ top: clampedScroll, behavior: 'instant' });
        }

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

    // End collection pass after one frame (items have registered via useLayoutEffect)
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
            data-ui="select-content"
            data-state={open ? "open" : "closed"}
            data-side={actualSide}

            role="listbox"

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

interface SelectViewportProps extends HTMLAttributes<HTMLElement> {
    asChild?: boolean;
}

function SelectViewport({ children, className, asChild, ...props }: SelectViewportProps) {
    const { viewportRef } = useSelectContext();

    const Component = asChild ? Slot : 'div';

    return (
        <Component
            data-ui="select-viewport"

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
    asChild?: boolean;
}

function SelectItem({ children, className, value, disabled, textValue, asChild, ...props }: SelectItemProps) {
    const { setOpen, setValue, value: currentValue, state, dispatch, registerItemLabel } = useSelectContext();

    const ref = useRef<HTMLDivElement>(null);
    const textElementRef = useRef<HTMLElement>(null);
    const fallbackId = useId();
    const itemId = props.id ?? fallbackId;
    const selected = value === currentValue;
    const itemIndex = state.items.findIndex(item => item.id === itemId);
    const highlighted = itemIndex >= 0 && state.cursor === itemIndex;

    const context: SelectItemContextState = { textElementRef, selected }

    useLayoutEffect(() => {
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
        }

        dispatch({ type: 'REGISTER_ITEM', payload: item });
        
        // Register label for initial value display
        registerItemLabel(value, resolvedTextValue);
        
        return () => dispatch({ type: 'UNREGISTER_ITEM', payload: itemId });
    }, [itemId, value, textValue, disabled, dispatch, registerItemLabel]);

    const clickHandler = useCallback(() => {
        if (disabled) return;
        if (value) setValue(value);
        setOpen(false);

        const resolvedTextValue = textValue ??
            textElementRef?.current?.textContent ??
            ref?.current?.textContent ??
            value ??
            '';

        dispatch({ type: 'SET_TEXT_VALUE', payload: resolvedTextValue });
    }, [disabled, value, setValue, setOpen, textValue, dispatch]);

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
        <SelectItemContext.Provider value={context}>
            <Component
                data-ui="select-item"
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
        </SelectItemContext.Provider>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface SelectItemTextProps extends HTMLAttributes<HTMLElement> {
    children?: string;
    asChild?: boolean;
}

function SelectItemText({ className, children, asChild, ...props }: SelectItemTextProps) {
    const { textElementRef } = useSelectItemContext();

    const Component = asChild ? Slot : 'span';

    return (
        <Component
            data-ui="select-item-text"

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

interface SelectItemIndicatorProps extends HTMLAttributes<HTMLElement> {
    asChild?: boolean;
}

function SelectItemIndicator({ className, asChild, children, ...props }: SelectItemIndicatorProps) {
    const { selected } = useSelectItemContext();
    if (!selected) return null;

    const Component = asChild ? Slot : 'span';

    return (
        <Component
            data-ui="select-item-indicator"

            className={cn(
                'w-fit [&>svg]:size-4 text-write shrink-0',
                className
            )}

            {...props}
        >
            {asChild ? children : (
                <svg
                    data-ui="select-item-indicator-icon"

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

interface SelectGroupProps extends HTMLAttributes<HTMLElement> {
    asChild?: boolean;
}

function SelectGroup({ children, className, asChild, ...props }: SelectGroupProps) {
    const fallbackId = useId();
    const groupId = props.id ?? fallbackId;
    const labelElementRef = useRef<HTMLElement>(null);
    const labeledBy = labelElementRef?.current?.id ?? `${groupId}-label`;

    const context: SelectGroupContextState = { groupId, labelElementRef }

    const Component = asChild ? Slot : 'div';

    return (
        <SelectGroupContext.Provider value={context}>
            <Component
                data-ui="select-group"

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
        </SelectGroupContext.Provider>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface SelectLabelProps extends HTMLAttributes<HTMLElement> {
    asChild?: boolean;
}

function SelectLabel({ children, className, asChild, ...props }: SelectLabelProps) {
    const { groupId, labelElementRef } = useSelectGroupContext();
    const labelId = props.id ?? `${groupId}-label`;

    const Component = asChild ? Slot : 'span';

    return (
        <Component
            data-ui="select-label"

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

interface SelectSeparatorProps extends HTMLAttributes<HTMLElement> {
    asChild?: boolean;
}

function SelectSeparator({ className, children, asChild, ...props }: SelectSeparatorProps) {
    const Component = asChild ? Slot : 'span';

    return (
        <Component
            data-ui="select-separator"

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

interface ScrollUpButtonProps extends HTMLAttributes<HTMLElement> {
    asChild?: boolean;
}

function SelectScrollUpButton({ className, asChild, children, ...props }: ScrollUpButtonProps) {
    const { viewportRef } = useSelectContext();
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
            data-ui="select-scroll-up-button"

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
                    data-ui="select-scroll-up-icon"

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

interface ScrollDownButtonProps extends HTMLAttributes<HTMLElement> {
    asChild?: boolean;
}

function SelectScrollDownButton({ className, asChild, children, ...props }: ScrollDownButtonProps) {
    const { viewportRef } = useSelectContext();
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
            data-ui="select-scroll-down-button"

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
                    data-ui="select-scroll-down-icon"

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
    Select,
    SelectTrigger,
    SelectValue,
    SelectTriggerIndicator,
    SelectPortal,
    SelectContent,
    SelectViewport,
    SelectItem,
    SelectItemText,
    SelectItemIndicator,
    SelectGroup,
    SelectLabel,
    SelectSeparator,
    SelectScrollUpButton,
    SelectScrollDownButton,
    type SelectProps,
    type SelectItemProps,
    type SelectValueProps,
    type SelectContentProps,
    type SelectItemTextProps,
    type SelectItemIndicatorProps,
    type SelectGroupProps,
    type SelectLabelProps,
    type SelectSeparatorProps,
    type ScrollUpButtonProps,
    type ScrollDownButtonProps,
    type SelectTriggerProps,
    type SelectTriggerIndicatorProps,
    type SelectPortalProps,
    type SelectViewportProps,
}

// ---------------------------------------------------------------------------------------------------- //