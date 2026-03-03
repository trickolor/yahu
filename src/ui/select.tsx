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
    type ComponentPropsWithoutRef,
    type CSSProperties,
} from "react";

import { createPortal } from "react-dom";

import { useControllableState } from "@/hooks/use-controllable-state";

import {
    Positioner,
    type Side,
    type Align,
} from "@/ui/positioner";

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

const getSelectAction = (
    event: KeyboardEvent<HTMLButtonElement>,
    open: boolean
): SelectAction => {
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

type ScrollRequestType = 'none' | 'center' | 'item-top' | 'ensure-visible' | 'edge-start' | 'edge-end';
type ScrollRequest = { type: ScrollRequestType; targetIndex: number };

interface SelectStableContextState {
    setValue: (value: string) => void;
    setOpen: (open: boolean) => void;
    dispatch: Dispatch<SelectStateAction>;
    registerItemLabel: (itemValue: string, textValue: string) => void;
    triggerScroll: () => void;

    viewportRef: RefObject<HTMLDivElement | null>;
    triggerRef: RefObject<HTMLButtonElement | null>;
    positionerRef: RefObject<HTMLDivElement | null>;
    contentRef: RefObject<HTMLDivElement | null>;
    valueRef: RefObject<HTMLElement | null>;
    selectedItemTextRef: RefObject<HTMLElement | null>;
    scrollRequestRef: RefObject<ScrollRequest>;
    alignItemWithTriggerActiveRef: RefObject<boolean>;
}

interface SelectReactiveContextState {
    value: string;
    open: boolean;
    disabled: boolean;
    state: SelectState;
    activeDescendant: string | null;
    scrollTrigger: number;
}

type SelectContextState =
    & SelectStableContextState
    & SelectReactiveContextState;

const SelectStableContext = createContext<SelectStableContextState | null>(null);
const SelectReactiveContext = createContext<SelectReactiveContextState | null>(null);

function useSelectContext(): SelectContextState {
    const error = useCallback(() => {
        throw new Error("useSelectContext must be used within a <Select> component");
    }, []);

    const stable = useContext(SelectStableContext);
    if (!stable) error();

    const reactive = useContext(SelectReactiveContext);
    if (!reactive) error();

    return { ...stable!, ...reactive! };
}

// ---------------------------------------------------------------------------------------------------- //

interface SelectProps<V> { // todo the V generic
    name?: string; // todo
    id?: string; // todo

    disabled?: boolean; // todo
    required?: boolean; // todo
    readOnly?: boolean; // todo
    autoComplete?: string; // todo

    inputRef?: RefObject<HTMLInputElement | null>; // todo

    isItemEqualToValue?: (itemValue: V, selectedValue: V) => boolean; // todo
    itemToStringLabel?: (itemValue: V) => string; // todo
    itemToStringValue?: (itemValue: V) => string; // todo

    highlightItemOnHover?: boolean; // todo

    actionsRef?: RefObject<unknown | null>; // todo - we need to create imperative ref handling for unmount

    items?:
    | Record<string, ReactNode>
    | Array<{ label: ReactNode, value: any }> // todo

    value?: V;
    defaultValue?: V;
    onValueChange?: (value: string) => void;

    defaultOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onOpenChangeComplete?: (open: boolean) => void; // todo

    children?: ReactNode;
}

function Select({
    defaultValue, onValueChange, value,
    defaultOpen, onOpenChange, open,
    disabled = false,
    children,
}: SelectProps) {
    const [scrollTrigger, setScrollTrigger] = useState(0);

    const triggerScroll = useCallback(() => {
        setScrollTrigger(prev => prev + 1);
    }, []);

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

    const defaultState = useMemo(() => ({
        textValue: null,
        cursor: -1,
        items: [],
        typeaheadValue: '',
        typeaheadTimeout: null,
        pendingCursorAction: null,
    }), []);

    const [state, dispatch] = useReducer(selectStateReducer, defaultState);

    const viewportRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const positionerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const valueRef = useRef<HTMLElement>(null);
    const selectedItemTextRef = useRef<HTMLElement>(null);

    const scrollRequestRef = useRef<ScrollRequest>({ type: 'none', targetIndex: -1 });
    const alignItemWithTriggerActiveRef = useRef<boolean>(false);


    const activeDescendant = useMemo(() => {
        if (state.cursor < 0 || state.cursor >= state.items.length) return null;
        return state.items[state.cursor].id;
    }, [state.cursor, state.items]);

    const registerItemLabelImpl = useCallback((itemValue: string, textValue: string) => {
        if (itemValue === valueState && state.textValue === null)
            dispatch({ type: 'SET_TEXT_VALUE', payload: textValue });
    }, [valueState, state.textValue, dispatch]);

    const registerItemLabelRef = useRef(registerItemLabelImpl);
    registerItemLabelRef.current = registerItemLabelImpl;

    const registerItemLabel = useCallback((itemValue: string, textValue: string) => {
        registerItemLabelRef.current(itemValue, textValue);
    }, []);

    useEffect(() => {
        if (openState) return;
        dispatch({ type: 'CLEAR_TYPEAHEAD' });
        dispatch({ type: 'SET_PENDING_CURSOR_ACTION', payload: null });
    }, [openState]);

    useEffect(() => {
        if (
            !openState
            || state.items.length === 0
            || !state.pendingCursorAction
        ) return;

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

            if (alignItemWithTriggerActiveRef.current)
                scrollRequestRef.current = { type: 'none', targetIndex: -1 };

            else {
                scrollRequestRef.current = { type: 'center', targetIndex: initialCursor };
                triggerScroll();
            }

            dispatch({ type: 'SET_CURSOR', payload: initialCursor });
        }

        dispatch({ type: 'SET_PENDING_CURSOR_ACTION', payload: null });
    }, [openState, state.items.length, state.pendingCursorAction, valueState, triggerScroll]);

    const stableContextRef = useRef<SelectStableContextState | null>(null);

    if (!stableContextRef.current) stableContextRef.current = {
        setValue,
        setOpen,
        dispatch,
        triggerScroll,
        registerItemLabel,
        triggerRef,
        positionerRef,
        contentRef,
        viewportRef,
        valueRef,
        selectedItemTextRef,
        scrollRequestRef,
        alignItemWithTriggerActiveRef,
    };

    const reactiveContext = useMemo<SelectReactiveContextState>(() => ({
        value: valueState,
        open: openState,
        disabled,
        state,
        activeDescendant,
        scrollTrigger,
    }), [valueState, openState, disabled, state, activeDescendant, scrollTrigger]);

    return (
        <SelectStableContext.Provider value={stableContextRef.current}>
            <SelectReactiveContext.Provider value={reactiveContext}>
                {children}
            </SelectReactiveContext.Provider>
        </SelectStableContext.Provider>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface SelectTriggerProps {
    disabled?: boolean;

    className?: string;
    style?: CSSProperties;
    children?: ReactNode;

    asChild?: boolean;
}

function SelectTrigger({ className, children, asChild, ...props }: SelectTriggerProps) {
    const {
        open,
        setOpen,
        state,
        dispatch,
        setValue,
        activeDescendant,
        triggerRef,
        scrollRequestRef,
        triggerScroll,
        disabled,
    } = useSelectContext();

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

            // todo - set these data attrs
            data-content-open
            data-pressed
            data-disabled
            data-readonly
            data-required
            data-valid
            data-invalid
            data-placeholder

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
                'w-fit min-w-64 h-8 inline-flex items-center justify-between gap-2 px-3 py-2 rounded text-write border border-bound bg-surface transition-all',
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

interface SelectValueProps {
    placeholder?: ReactNode;

    className?: string;
    style?: CSSProperties;
    children?: ReactNode;

    asChild?: boolean;
}

function SelectValue({ className, children, placeholder, asChild, ...props }: SelectValueProps) {
    const { state, valueRef } = useSelectContext();

    const displayed = children ?? state.textValue ?? placeholder ?? '';

    const Component = asChild ? Slot : 'span';

    return (
        <Component
            data-ui="select-value"

            // todo - set this data attr
            data-placeholder

            ref={valueRef}

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

            // todo - set this data attr
            data-content-open

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

interface SelectBackdropProps {
    className?: string;
    style?: CSSProperties;
    children?: ReactNode;
    asChild?: boolean;
}

function SelectBackdrop({ className, children, asChild, ...props }: SelectBackdropProps) {
    // Todo - properly create this component, will have data-open data-closed data-animation-in data-animation-out
}

// ---------------------------------------------------------------------------------------------------- //

// TODO (!) - we will create a separate portal component in portal.tsx, 
// will have: container prop set to: 
// | HTMLElement
// | ShadowRoot
// | React.RefObject<HTMLElement | ShadowRoot | null>
// | null
// | undefined
// + className, style, asChild and children 

interface SelectPortalProps { container?: HTMLElement; children?: ReactNode }

function SelectPortal({ container, children }: SelectPortalProps) {
    return createPortal(children, container ?? document.body);
}

// ---------------------------------------------------------------------------------------------------- //

function shouldAlignItemWithTrigger(triggerEl: HTMLButtonElement, minHeight: number): boolean {
    const triggerRect = triggerEl.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    if (triggerRect.top < 20 || triggerRect.bottom > viewportHeight - 20) return false;
    if (viewportHeight - triggerRect.top < minHeight) return false;

    return true;
}

// ---------------------------------------------------------------------------------------------------- //

interface SelectPositionerProps extends
    Omit<ComponentPropsWithoutRef<typeof Positioner>, 'anchor' | 'enabled'> {
    alignItemWithTrigger?: boolean;
}

function SelectPositioner({
    alignItemWithTrigger = true,
    side = "bottom",
    sideOffset = 2,
    align = "start",
    alignOffset = 0,
    collisionAvoidance,
    collisionBoundary = "clipping-ancestors",
    collisionPadding = 8,
    sticky = false,
    positionMethod = "fixed",
    disableAnchorTracking = false,
    className,
    style,
    zIndex = 50,
    children,
    ...props
}: SelectPositionerProps) {
    const [pointerType, setPointerType] = useState<string>("mouse");

    const {
        open,
        triggerRef,
        positionerRef,
        alignItemWithTriggerActiveRef,
    } = useSelectContext();

    useEffect(() => {
        const trigger = triggerRef.current;
        if (!trigger) return;

        const handler = (e: PointerEvent) => setPointerType(e.pointerType);
        trigger.addEventListener("pointerdown", handler);

        return () => trigger.removeEventListener("pointerdown", handler);
    }, [triggerRef]);

    const minHeight = useMemo(() => {
        const el = positionerRef.current;
        if (!el) return 80;

        const parsed = parseFloat(getComputedStyle(el).minHeight);
        return isNaN(parsed) ? 80 : parsed;
    }, [positionerRef, open]);

    const alignActive =
        alignItemWithTrigger &&
        pointerType !== "touch" &&
        open &&
        !!triggerRef.current &&
        shouldAlignItemWithTrigger(triggerRef.current, minHeight);

    alignItemWithTriggerActiveRef.current = alignActive;

    if (alignActive) {
        return (
            <div data-ui="select-positioner"
                ref={positionerRef}
                className={className}
                data-align-mode="item"
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    visibility: 'hidden',
                    zIndex,
                    ...style,
                }}
                {...props}
            >
                {children}
            </div>
        );
    }

    return (
        <Positioner data-ui="select-positioner"
            ref={positionerRef}
            className={className}
            zIndex={zIndex}
            style={style}

            disableAnchorTracking={disableAnchorTracking}
            anchor={triggerRef}
            enabled={open}

            side={side}
            sideOffset={sideOffset}

            align={align}
            alignOffset={alignOffset}

            collisionAvoidance={collisionAvoidance}
            collisionBoundary={collisionBoundary}
            collisionPadding={collisionPadding}

            sticky={sticky}
            positionMethod={positionMethod}

            {...props}
        >
            {children}
        </Positioner>
    );
}

// ---------------------------------------------------------------------------------------------------- //

type InteractionType = 'mouse' | 'keyboard' | 'touch' | 'pen';

interface SelectContentProps extends HTMLAttributes<HTMLElement> {
    asChild?: boolean;

    finalFocus?:
    | boolean
    | React.RefObject<HTMLElement | null>
    | ((closeType: InteractionType,) => boolean | void | HTMLElement | null)

    onEscapeKeyDown?: (event: React.KeyboardEvent) => void;
    onPointerDownOutside?: (event: PointerEvent) => void;
    onCloseAutoFocus?: (event: Event) => void;

    forceMount?: boolean;
}

function SelectContent({
    asChild = false,

    onPointerDownOutside,
    onCloseAutoFocus: _onCloseAutoFocus,
    onEscapeKeyDown,

    forceMount = false,

    className,
    children,

    ...props
}: SelectContentProps) {
    const {
        open, setOpen, value, triggerRef, positionerRef, contentRef, viewportRef,
        scrollRequestRef, scrollTrigger, state, dispatch,
        valueRef, selectedItemTextRef, alignItemWithTriggerActiveRef,
    } = useSelectContext();

    const [hasCollected, setHasCollected] = useState(false);
    const isCollectionPass = !hasCollected && !open;

    const [isMounted, setIsMounted] = useState(open || isCollectionPass);
    const lastProcessedRef = useRef<{ trigger: number; positioned: boolean }>({ trigger: 0, positioned: false });

    const [isPositioned, setIsPositioned] = useState(false);
    const initialPlacedRef = useRef(false);

    const originalPositionerStylesRef = useRef<Record<string, string>>({});

    useLayoutEffect(() => {
        if (alignItemWithTriggerActiveRef.current) return;
        const el = positionerRef.current;
        if (!el) return;
        const observer = new MutationObserver(() => {
            setIsPositioned(el.style.visibility === "visible");
        });
        observer.observe(el, { attributes: true, attributeFilter: ["style"] });
        return () => observer.disconnect();
    }, [positionerRef, alignItemWithTriggerActiveRef, open]);

    useLayoutEffect(() => {
        if (!open || !alignItemWithTriggerActiveRef.current) return;

        const positioner = positionerRef.current;
        const trigger = triggerRef.current;
        const content = contentRef.current;
        const scroller = viewportRef.current || contentRef.current;

        if (!positioner || !trigger || !content || !scroller) return;
        if (state.items.length === 0) return;

        queueMicrotask(() => {
            const selectedIndex = state.items.findIndex(item => item.value === value);
            const targetIndex = selectedIndex >= 0 ? selectedIndex : 0;
            const targetItem = state.items[targetIndex]?.element;
            if (!targetItem) return;

            let textElement: HTMLElement | null = selectedItemTextRef.current;
            if (!textElement) {
                textElement = targetItem.querySelector('[data-ui="select-item-text"]');
            }
            const valueElement = valueRef.current;

            const triggerRect = trigger.getBoundingClientRect();

            let desiredTop: number;
            let desiredLeft: number;

            if (textElement && valueElement) {
                const textRect = textElement.getBoundingClientRect();
                const valueRect = valueElement.getBoundingClientRect();
                desiredTop = valueRect.top - textRect.top;
                desiredLeft = valueRect.left - textRect.left;
            } else {
                const itemRect = targetItem.getBoundingClientRect();
                desiredTop = triggerRect.top - itemRect.top;
                desiredLeft = triggerRect.left - itemRect.left;
            }

            const vpW = document.documentElement.clientWidth;
            const vpH = document.documentElement.clientHeight;
            const posW = positioner.offsetWidth;
            const posH = positioner.offsetHeight;
            const pad = 8;

            const clampedLeft = Math.max(pad, Math.min(desiredLeft, vpW - posW - pad));
            let clampedTop = Math.max(pad, Math.min(desiredTop, vpH - posH - pad));

            if (posH > vpH - 2 * pad) clampedTop = pad;

            const topShift = clampedTop - desiredTop;
            if (topShift !== 0) {
                scroller.scrollTop = Math.max(0, scroller.scrollTop + topShift);
            }

            originalPositionerStylesRef.current = {
                top: positioner.style.top,
                left: positioner.style.left,
                visibility: positioner.style.visibility,
            };

            positioner.style.top = `${clampedTop}px`;
            positioner.style.left = `${clampedLeft}px`;
            positioner.style.visibility = 'visible';

            scrollRequestRef.current = { type: 'none', targetIndex: -1 };
            setIsPositioned(true);
            initialPlacedRef.current = true;
        });
    }, [open, value, state.items.length, positionerRef, triggerRef, contentRef, viewportRef, selectedItemTextRef, valueRef, alignItemWithTriggerActiveRef, scrollRequestRef]);

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

        lastProcessedRef.current = { trigger: scrollTrigger, positioned: true };

        if (type === 'edge-start') viewport.scrollTo({ top: 0, behavior: 'instant' });
        else if (type === 'edge-end') viewport.scrollTo({ top: viewport.scrollHeight - viewport.clientHeight, behavior: 'instant' });

        else if (type === 'item-top' || type === 'center') {
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

        scrollRequestRef.current = { type: 'none', targetIndex: -1 };
    }, [open, isPositioned, scrollTrigger, state.items, scrollRequestRef, viewportRef]);

    useEffect(() => {
        if (!open) {
            lastProcessedRef.current = { trigger: 0, positioned: false };
            initialPlacedRef.current = false;
            setIsPositioned(false);

            const positioner = positionerRef.current;
            const content = contentRef.current;
            if (positioner && Object.keys(originalPositionerStylesRef.current).length > 0) {
                Object.assign(positioner.style, originalPositionerStylesRef.current);
                originalPositionerStylesRef.current = {};
            }
            if (content) content.style.height = '';
        }
    }, [open, positionerRef, contentRef]);

    useEffect(() => { if (open) setIsMounted(true); }, [open]);

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
                child.contains(positionerRef.current) ||
                child.contains(triggerRef.current)
            ) return;

            child.setAttribute("inert", "");
            elementsToInert.push(child);
        });

        return () => {
            document.body.style.overflow = originalOverflow;
            elementsToInert.forEach((el) => { el.removeAttribute("inert") });
        };
    }, [open, positionerRef, triggerRef]);

    useEffect(() => {
        if (!open) return;

        const outsideClickHandler = (event: MouseEvent) => {
            if (positionerRef.current && !positionerRef.current.contains(event.target as Node)) {
                if (triggerRef.current && triggerRef.current.contains(event.target as Node)) return;
                onPointerDownOutside?.(event as PointerEvent);
                setOpen(false);

                dispatch({ type: 'SET_CURSOR', payload: -1 });
                dispatch({ type: 'SET_PENDING_CURSOR_ACTION', payload: null });
            }
        };

        document.addEventListener("mousedown", outsideClickHandler);
        return () => { document.removeEventListener("mousedown", outsideClickHandler); };
    }, [open, positionerRef, triggerRef, onPointerDownOutside, setOpen, dispatch]);

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
        };

        document.addEventListener("keydown", keyDownHandler);
        return () => { document.removeEventListener("keydown", keyDownHandler); };
    }, [open, onEscapeKeyDown, setOpen, dispatch, triggerRef]);

    if (!isMounted && !forceMount && !isCollectionPass) return null;

    const Component = asChild ? Slot : 'div';

    return (
        <Component
            data-ui="select-content"

            // todo - set these data attrs
            data-open
            data-closed
            data-align
            data-side
            data-animation-in
            data-animation-out

            role="listbox"

            ref={contentRef}
            tabIndex={-1}

            onAnimationEnd={animationEndHandler}

            style={isCollectionPass ? {
                position: 'fixed',
                top: '-9999px',
                left: '-9999px',
                visibility: 'hidden',
                pointerEvents: 'none',
                opacity: 0,
            } : undefined}

            className={cn(
                'min-w-64 w-fit rounded border border-bound bg-surface shadow flex flex-col',
                "data-[state='open']:animate-in data-[state='open']:fade-in-0",
                "data-[state='closed']:animate-out data-[state='closed']:fade-out-0",
                !alignItemWithTriggerActiveRef.current && "data-[state='open']:zoom-in-95",
                !alignItemWithTriggerActiveRef.current && "data-[state='closed']:zoom-out-95",
                "[[data-side=bottom]_&]:slide-in-from-top-2",
                "[[data-side=left]_&]:slide-in-from-right-2",
                "[[data-side=right]_&]:slide-in-from-left-2",
                "[[data-side=top]_&]:slide-in-from-bottom-2",
                className
            )}

            {...props}
        >
            {children}
        </Component>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface SelectViewportProps {
    className?: string;
    style?: CSSProperties;
    children?: ReactNode;
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

interface SelectItemProps {
    className?: string;
    style?: CSSProperties;
    children?: ReactNode;

    label?: string; // instead of textValue
    value?: any;

    disabled?: boolean;
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

                data-selected
                data-highlighted
                data-disabled

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

interface SelectItemTextProps {
    className?: string;
    style?: CSSProperties;
    children?: ReactNode;
    asChild?: boolean;
}

function SelectItemText({ className, children, asChild, ...props }: SelectItemTextProps) {
    const { textElementRef, selected } = useSelectItemContext();
    const { selectedItemTextRef } = useSelectContext();

    const setRef = useCallback((node: HTMLElement | null) => {
        if (typeof textElementRef === 'object' && textElementRef) textElementRef.current = node;
        if (selected) selectedItemTextRef.current = node;
    }, [textElementRef, selected, selectedItemTextRef]);

    const Component = asChild ? Slot : 'span';

    return (
        <Component
            data-ui="select-item-text"

            ref={setRef}

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

interface SelectItemIndicatorProps {
    className?: string;
    style?: CSSProperties;
    children?: ReactNode;
    keepMounted?: boolean; // todo
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

interface SelectGroupProps {
    className?: string;
    style?: CSSProperties;
    children?: ReactNode;
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

interface SelectLabelProps {
    className?: string;
    style?: CSSProperties;
    children?: ReactNode;
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

interface SelectSeparatorProps {
    className?: string;
    style?: CSSProperties;
    children?: ReactNode;
    orientation?: 'horizontal' | 'vertical';
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

interface ScrollUpButtonProps {
    className?: string;
    style?: CSSProperties;
    children?: ReactNode;
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

            // todo - set these data attrs
            data-direction
            data-side
            data-visible
            data-animation-in
            data-animation-out

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
    SelectPositioner,
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
    type SelectPositionerProps,
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
    type Side,
    type Align,
}

// ---------------------------------------------------------------------------------------------------- //