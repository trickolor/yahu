import {
    createContext,
    forwardRef,
    useImperativeHandle,
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
    type InputHTMLAttributes,
    type ChangeEvent,
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

const AutocompleteActions = {
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
} as const;

type AutocompleteAction = typeof AutocompleteActions[keyof typeof AutocompleteActions];

const getAutocompleteAction = (event: KeyboardEvent<HTMLInputElement>, open: boolean): AutocompleteAction => {
    const { key, altKey } = event;

    if (key === 'Home') return AutocompleteActions.First;
    if (key === 'End') return AutocompleteActions.Last;

    if (open) switch (key) {
        case 'ArrowUp': return altKey ? AutocompleteActions.Close : AutocompleteActions.Previous;
        case 'ArrowDown': return altKey ? AutocompleteActions.None : AutocompleteActions.Next;
        case 'PageUp': return AutocompleteActions.PageUp;
        case 'PageDown': return AutocompleteActions.PageDown;
        case 'Escape': return AutocompleteActions.Close;
        case 'Enter': return AutocompleteActions.Select;
        case 'Tab': return AutocompleteActions.Select;
    }

    if (!open) switch (key) {
        case 'ArrowDown': return AutocompleteActions.Open;
        case 'ArrowUp': return AutocompleteActions.Open;
    }

    return AutocompleteActions.None;
}

// ---------------------------------------------------------------------------------------------------- //

interface AutocompleteItemEntry {
    id: string;
    value: string;
    textValue: string;
    disabled: boolean;
    element: HTMLElement | null;
}

interface AutocompleteState {
    cursor: number;
    items: AutocompleteItemEntry[];
    pendingCursorAction: 'first' | 'last' | 'default' | null;
}

type AutocompleteStateAction =
    | { type: 'SET_CURSOR'; payload: number }
    | { type: 'SET_PENDING_CURSOR_ACTION'; payload: 'first' | 'last' | 'default' | null }
    | { type: 'REGISTER_ITEM'; payload: AutocompleteItemEntry }
    | { type: 'UNREGISTER_ITEM'; payload: string }

function autocompleteStateReducer(state: AutocompleteState, action: AutocompleteStateAction): AutocompleteState {
    switch (action.type) {
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

        default: return state;
    }
}

// ---------------------------------------------------------------------------------------------------- //

function findNextEnabledIndex(
    items: AutocompleteItemEntry[],
    startIndex: number,
    direction: 1 | -1,
    loop: boolean,
): number {
    if (!items.length) return -1;

    const { length } = items;
    let index = startIndex;

    for (let i = 0; i < length; i++) {
        index += direction;

        if (loop) index = ((index % length) + length) % length;
        else if (index < 0 || index >= length) return -1;

        if (!items[index].disabled) return index;
    }

    return -1;
}

function findEdgeEnabledIndex(items: AutocompleteItemEntry[], edge: 'first' | 'last'): number {
    if (items.length === 0) return -1;

    if (edge === 'first')
        return items.findIndex(item => !item.disabled);

    for (let i = items.length - 1; i >= 0; i--)
        if (!items[i].disabled) return i;

    return -1;
}

// ---------------------------------------------------------------------------------------------------- //

type AutocompleteFilterFunction = (value: string, items: AutocompleteItemEntry[]) => AutocompleteItemEntry[];

interface AutocompleteActionsRef {
    clear: () => void;
    setOpen: (open: boolean) => void;
    setValue: (value: string) => void;
    highlightIndex: (index: number) => void;
}

interface AutocompleteContextState {
    instanceId: string;
    listboxId: string;

    value: string;
    setValue: (value: string) => void;

    open: boolean;
    setOpen: (open: boolean) => void;

    disabled: boolean;

    autoHighlight: boolean;
    highlightItemOnHover: boolean;
    openOnInputClick: boolean;
    loopFocus: boolean;

    state: AutocompleteState;
    dispatch: Dispatch<AutocompleteStateAction>;

    activeDescendant: string | null;

    filter: AutocompleteFilterFunction | null;
    filteredItems: AutocompleteItemEntry[];
    filteredItemIds: Set<string>;

    viewportRef: RefObject<HTMLDivElement | null>;
    triggerRef: RefObject<HTMLDivElement | null>;
    inputRef: RefObject<HTMLInputElement | null>;
    contentRef: RefObject<HTMLDivElement | null>;

    scrollRequestRef: RefObject<{
        type: 'none' | 'center' | 'ensure-visible' | 'edge-start' | 'edge-end';
        targetIndex: number;
    }>;

    scrollTrigger: number;
    triggerScroll: () => void;
}

const AutocompleteContext = createContext<AutocompleteContextState | null>(null);

function useAutocompleteContext(): AutocompleteContextState {
    const context = useContext(AutocompleteContext);
    if (!context) throw new Error("useAutocompleteContext must be used within an <Autocomplete> component");
    return context;
}

// ---------------------------------------------------------------------------------------------------- //

const defaultFilter: AutocompleteFilterFunction = (value, items) => {
    if (!value) return items;
    const lowerInput = value.toLowerCase();
    return items.filter(item =>
        item.textValue.toLowerCase().includes(lowerInput)
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface AutocompleteProps {
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;

    defaultOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;

    autoHighlight?: boolean;
    highlightItemOnHover?: boolean;
    openOnInputClick?: boolean;
    loopFocus?: boolean;
    modal?: boolean;

    filter?: AutocompleteFilterFunction | null;

    name?: string;
    disabled?: boolean;
    required?: boolean;

    actionsRef?: RefObject<AutocompleteActionsRef | null>;

    children?: ReactNode;
}

function Autocomplete({
    defaultValue, onValueChange, value,
    defaultOpen, onOpenChange, open,
    autoHighlight = false,
    highlightItemOnHover = true,
    openOnInputClick = true,
    loopFocus = true,
    disabled = false,
    filter = defaultFilter,
    actionsRef,
    children,
}: AutocompleteProps) {
    const instanceId = useId();
    const listboxId = `autocomplete-listbox-${instanceId}`;

    const [valueState, setValue] = useControllableState({
        defaultValue: defaultValue ?? '',
        onChange: onValueChange,
        value,
    });

    const [openState, setOpenInternal] = useControllableState({
        defaultValue: defaultOpen ?? false,
        onChange: onOpenChange,
        value: open,
    });

    const setOpen = useCallback((newOpen: boolean) => {
        setOpenInternal(newOpen);
    }, [setOpenInternal]);

    const [state, dispatch] = useReducer(autocompleteStateReducer, {
        cursor: -1,
        items: [],
        pendingCursorAction: null,
    });

    const viewportRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    const scrollRequestRef = useRef<{
        type: 'none' | 'center' | 'ensure-visible' | 'edge-start' | 'edge-end';
        targetIndex: number;
    }>({ type: 'none', targetIndex: -1 });

    const [scrollTrigger, setScrollTrigger] = useState(0);
    const triggerScroll = useCallback(() => setScrollTrigger(prev => prev + 1), []);

    const lastOpenFilteredItemsRef = useRef<AutocompleteItemEntry[]>([]);

    const filteredItems = useMemo(() => {
        if (!openState) return lastOpenFilteredItemsRef.current;

        if (!filter) {
            lastOpenFilteredItemsRef.current = state.items;
            return state.items;
        }

        const result = filter(valueState, state.items);
        lastOpenFilteredItemsRef.current = result;
        return result;
    }, [filter, valueState, state.items, openState]);

    const filteredItemIds = useMemo(() => {
        return new Set(filteredItems.map(item => item.id));
    }, [filteredItems]);

    const activeDescendant = useMemo(() => {
        return state.cursor >= 0 && state.cursor < filteredItems.length
            ? filteredItems[state.cursor].id
            : null;
    }, [state.cursor, filteredItems]);

    useEffect(() => {
        if (!openState) {
            dispatch({ type: 'SET_PENDING_CURSOR_ACTION', payload: null });
            return;
        }

        if (autoHighlight && filteredItems.length > 0) {
            const firstEnabledIndex = findEdgeEnabledIndex(filteredItems, 'first');

            if (firstEnabledIndex >= 0) {
                scrollRequestRef.current = { type: 'ensure-visible', targetIndex: firstEnabledIndex }
                dispatch({ type: 'SET_CURSOR', payload: firstEnabledIndex });
                triggerScroll();
            }
        }
    }, [openState, autoHighlight, filteredItems, triggerScroll]);

    useEffect(() => {
        if (!openState) return;

        if (autoHighlight && filteredItems.length > 0) {
            const firstEnabledIndex = findEdgeEnabledIndex(filteredItems, 'first');

            if (firstEnabledIndex >= 0) dispatch({ type: 'SET_CURSOR', payload: firstEnabledIndex });
            else dispatch({ type: 'SET_CURSOR', payload: -1 });

        } else if (filteredItems.length === 0) dispatch({ type: 'SET_CURSOR', payload: -1 });
    }, [openState, autoHighlight, filteredItems.length]);

    useEffect(() => {
        if (!openState || filteredItems.length === 0 || !state.pendingCursorAction) return;

        if (state.pendingCursorAction === 'first') {
            const firstEnabled = findEdgeEnabledIndex(filteredItems, 'first');

            if (firstEnabled >= 0) {
                scrollRequestRef.current = { type: 'edge-start', targetIndex: firstEnabled }
                dispatch({ type: 'SET_CURSOR', payload: firstEnabled });
                triggerScroll();
            }
        }

        else if (state.pendingCursorAction === 'last') {
            const lastEnabled = findEdgeEnabledIndex(filteredItems, 'last');

            if (lastEnabled >= 0) {
                scrollRequestRef.current = { type: 'edge-end', targetIndex: lastEnabled }
                dispatch({ type: 'SET_CURSOR', payload: lastEnabled });
                triggerScroll();
            }
        }

        else if (state.pendingCursorAction === 'default') {
            const currentIndex = valueState ? filteredItems.findIndex(item => item.textValue === valueState) : -1;
            const initialCursor = currentIndex >= 0 ? currentIndex : (autoHighlight ? findEdgeEnabledIndex(filteredItems, 'first') : -1);

            if (initialCursor >= 0) {
                scrollRequestRef.current = { type: 'center', targetIndex: initialCursor }
                dispatch({ type: 'SET_CURSOR', payload: initialCursor });
                triggerScroll();
            } else dispatch({ type: 'SET_CURSOR', payload: -1 });
        }

        dispatch({ type: 'SET_PENDING_CURSOR_ACTION', payload: null });
    }, [openState, filteredItems, state.pendingCursorAction, valueState, autoHighlight, triggerScroll]);

    const prevOpenRef = useRef(openState);

    useEffect(() => {
        const wasOpen = prevOpenRef.current;
        prevOpenRef.current = openState;

        if (wasOpen && !openState) {
            dispatch({ type: 'SET_CURSOR', payload: -1 });
        }
    }, [openState]);

    useImperativeHandle(actionsRef, () => ({
        setValue,
        setOpen,

        clear: () => {
            setValue('');
        },

        highlightIndex: (index: number) => {
            if (index >= 0 && index < filteredItems.length) {
                scrollRequestRef.current = { type: 'ensure-visible', targetIndex: index }
                dispatch({ type: 'SET_CURSOR', payload: index });
                triggerScroll();
            }
        },
    }), [setValue, setOpen, filteredItems.length, triggerScroll]);

    const context: AutocompleteContextState = useMemo(() => ({
        instanceId,
        listboxId,
        value: valueState,
        setValue,
        open: openState,
        setOpen,
        disabled,
        autoHighlight,
        highlightItemOnHover,
        openOnInputClick,
        loopFocus,
        state,
        dispatch,
        activeDescendant,
        filter,
        filteredItems,
        filteredItemIds,
        triggerRef,
        inputRef,
        contentRef,
        viewportRef,
        scrollRequestRef,
        scrollTrigger,
        triggerScroll,
    }), [
        instanceId, listboxId,
        valueState, setValue,
        openState, setOpen,
        disabled, autoHighlight, highlightItemOnHover, openOnInputClick, loopFocus,
        state, activeDescendant, filter, filteredItems, filteredItemIds,
        scrollTrigger, triggerScroll
    ]);

    return (
        <AutocompleteContext.Provider data-ui="autocomplete" value={context}>
            {children}
        </AutocompleteContext.Provider>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface AutocompleteTriggerProps extends HTMLAttributes<HTMLElement> {
    asChild?: boolean;
}

function AutocompleteTrigger({ className, children, asChild, ...props }: AutocompleteTriggerProps) {
    const { open, setOpen, disabled, triggerRef, inputRef, dispatch } = useAutocompleteContext();

    // Check if input is inside the trigger
    const [inputInTrigger, setInputInTrigger] = useState(false);

    useLayoutEffect(() => {
        if (triggerRef.current && inputRef.current) {
            setInputInTrigger(triggerRef.current.contains(inputRef.current));
        }
    }, [triggerRef, inputRef, children]);

    const clickHandler = useCallback((e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest('button')) return;
        if (target === inputRef.current) return;
        if (disabled) return;

        if (!open) {
            dispatch({ type: 'SET_PENDING_CURSOR_ACTION', payload: 'default' });
            setOpen(true);
        } else setOpen(false);

        // Only focus input if it's in the trigger
        if (inputInTrigger) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 0);
        }
    }, [disabled, open, setOpen, dispatch, inputRef, inputInTrigger]);

    const keyDownHandler = useCallback((e: React.KeyboardEvent) => {
        // If the input is focused, let it handle its own keys
        if (document.activeElement === inputRef.current) return;

        if (disabled) return;

        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (!open) {
                dispatch({ type: 'SET_PENDING_CURSOR_ACTION', payload: 'default' });
                setOpen(true);
                // Only focus input if it's in the trigger
                if (inputInTrigger) {
                    setTimeout(() => {
                        inputRef.current?.focus();
                    }, 0);
                }
            }
        } else if (e.key === 'Escape' && open) {
            e.preventDefault();
            setOpen(false);
        }
    }, [disabled, open, setOpen, dispatch, inputRef, inputInTrigger]);

    const Component = asChild ? Slot : 'div';

    return (
        <Component
            data-ui="autocomplete-trigger"
            data-state={open ? "open" : "closed"}
            data-disabled={disabled || undefined}

            ref={triggerRef}
            tabIndex={disabled || inputInTrigger ? undefined : 0}
            onClick={clickHandler}
            onKeyDown={keyDownHandler}

            className={cn(
                'w-fit min-w-64 min-h-9 inline-flex items-center justify-between gap-2 px-3 py-1.5 rounded text-write border border-bound bg-surface transition-all',
                'focus-within:outline-none focus-within:ring-2 focus-within:ring-outer-bound focus-within:ring-offset-muted-bound focus-within:ring-offset-1',
                !inputInTrigger && 'focus:outline-none focus:ring-2 focus:ring-outer-bound focus:ring-offset-muted-bound focus:ring-offset-1',
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

interface AutocompleteInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
    asChild?: boolean;
}

const AutocompleteInput = forwardRef<HTMLInputElement, AutocompleteInputProps>(function AutocompleteInput(
    { className, asChild, ...props },
    forwardedRef
) {
    const {
        open, setOpen, disabled, loopFocus,
        value, setValue,
        activeDescendant, inputRef, listboxId,
        state, dispatch, scrollRequestRef, triggerScroll,
        filteredItems, openOnInputClick,
        triggerRef, contentRef,
    } = useAutocompleteContext();

    useImperativeHandle(forwardedRef, () => inputRef.current!, [inputRef]);

    const changeHandler = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;
        setValue(newValue);

        dispatch({ type: 'SET_CURSOR', payload: -1 });

        if (!open && newValue.length > 0) setOpen(true);
    }, [open, setOpen, setValue, dispatch]);

    const inputHandler = useCallback((event: React.FormEvent<HTMLInputElement>) => {
        const newValue = (event.target as HTMLInputElement).value;
        setValue(newValue);

        dispatch({ type: 'SET_CURSOR', payload: -1 });

        if (!open && newValue.length > 0) setOpen(true);
    }, [open, setOpen, setValue, dispatch]);

    const clickHandler = useCallback(() => {
        if (disabled) return;

        if (openOnInputClick && !open) {
            dispatch({ type: 'SET_PENDING_CURSOR_ACTION', payload: 'default' });
            setOpen(true);
        }
    }, [disabled, openOnInputClick, open, dispatch, setOpen]);

    const focusHandler = useCallback((event: React.FocusEvent<HTMLInputElement>) => {
        const input = event.target;

        const fromInside = triggerRef.current?.contains(event.relatedTarget as Node);
        if (fromInside) return;

        const length = input.value.length;
        input.setSelectionRange(length, length);
    }, [triggerRef]);

    const blurHandler = useCallback((event: React.FocusEvent<HTMLInputElement>) => {
        setTimeout(() => {
            const newFocusTarget = event.relatedTarget as HTMLElement | null;
            const isFocusInTrigger = triggerRef.current?.contains(newFocusTarget);
            const isFocusInContent = contentRef.current?.contains(newFocusTarget);

            if (!isFocusInTrigger && !isFocusInContent && open) {
                setOpen(false);
            }
        }, 0);
    }, [open, setOpen, triggerRef, contentRef]);

    const keyDownHandler = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
        if (disabled) return;
        if (event.key === ' ') return;

        const action = getAutocompleteAction(event, open);

        if (action !== AutocompleteActions.None && event.key !== 'Tab') event.preventDefault();

        switch (action) {
            case AutocompleteActions.Open:
                if (!open) {
                    dispatch({ type: 'SET_PENDING_CURSOR_ACTION', payload: 'default' });
                    setOpen(true);
                }

                break;

            case AutocompleteActions.First: {
                if (!open) {
                    dispatch({ type: 'SET_PENDING_CURSOR_ACTION', payload: 'first' });
                    setOpen(true);
                }

                else {
                    const firstEnabled = findEdgeEnabledIndex(filteredItems, 'first');

                    if (firstEnabled >= 0) {
                        scrollRequestRef.current = { type: 'edge-start', targetIndex: firstEnabled }
                        dispatch({ type: 'SET_CURSOR', payload: firstEnabled });
                        triggerScroll();
                    }
                }

                break;
            }

            case AutocompleteActions.Last: {
                if (!open) {
                    dispatch({ type: 'SET_PENDING_CURSOR_ACTION', payload: 'last' });
                    setOpen(true);
                }

                else {
                    const lastEnabled = findEdgeEnabledIndex(filteredItems, 'last');

                    if (lastEnabled >= 0) {
                        scrollRequestRef.current = { type: 'edge-end', targetIndex: lastEnabled }
                        dispatch({ type: 'SET_CURSOR', payload: lastEnabled });
                        triggerScroll();
                    }
                }

                break;
            }

            case AutocompleteActions.Previous: {
                const nextIndex = findNextEnabledIndex(filteredItems, state.cursor, -1, loopFocus);

                if (nextIndex >= 0) {
                    const scrollType = nextIndex === 0 ? 'edge-start' : 'ensure-visible';
                    scrollRequestRef.current = { type: scrollType, targetIndex: nextIndex }
                    dispatch({ type: 'SET_CURSOR', payload: nextIndex });
                    triggerScroll();
                }

                break;
            }

            case AutocompleteActions.Next: {
                const nextIndex = findNextEnabledIndex(filteredItems, state.cursor, 1, loopFocus);

                if (nextIndex >= 0) {
                    const isLast = nextIndex === filteredItems.length - 1;
                    const scrollType = isLast ? 'edge-end' : 'ensure-visible';
                    scrollRequestRef.current = { type: scrollType, targetIndex: nextIndex }
                    dispatch({ type: 'SET_CURSOR', payload: nextIndex });
                    triggerScroll();
                }

                break;
            }

            case AutocompleteActions.PageUp: {
                let target = Math.max(0, state.cursor - 10);

                while (target < filteredItems.length && filteredItems[target].disabled) target++;
                if (target >= filteredItems.length) target = findEdgeEnabledIndex(filteredItems, 'first');

                if (target >= 0) {
                    const scrollType = target === 0 ? 'edge-start' : 'ensure-visible';
                    scrollRequestRef.current = { type: scrollType, targetIndex: target }
                    dispatch({ type: 'SET_CURSOR', payload: target });
                    triggerScroll();
                }

                break;
            }

            case AutocompleteActions.PageDown: {
                let target = Math.min(filteredItems.length - 1, state.cursor + 10);

                while (target >= 0 && filteredItems[target].disabled) target--;
                if (target < 0) target = findEdgeEnabledIndex(filteredItems, 'last');

                if (target >= 0) {
                    const isLast = target === filteredItems.length - 1;
                    const scrollType = isLast ? 'edge-end' : 'ensure-visible';
                    scrollRequestRef.current = { type: scrollType, targetIndex: target }
                    dispatch({ type: 'SET_CURSOR', payload: target });
                    triggerScroll();
                }

                break;
            }

            case AutocompleteActions.Select:
                if (state.cursor >= 0 && state.cursor < filteredItems.length) {
                    const item = filteredItems[state.cursor];

                    if (!item.disabled) {
                        setValue(item.textValue);
                        if (open) {
                            setOpen(false);
                            // Handle focus for input in content
                            const inputInTrigger = triggerRef.current?.contains(inputRef.current);
                            if (!inputInTrigger && event.key === 'Tab') {
                                // Prevent default and move to next focusable element
                                event.preventDefault();
                                requestAnimationFrame(() => {
                                    // Find next focusable element after trigger
                                    const focusableElements = Array.from(
                                        document.querySelectorAll<HTMLElement>(
                                            'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
                                        )
                                    );
                                    const triggerIndex = triggerRef.current ? focusableElements.indexOf(triggerRef.current) : -1;
                                    const nextElement = focusableElements[triggerIndex + 1];
                                    if (nextElement) {
                                        nextElement.focus();
                                    }
                                });
                            } else if (!inputInTrigger) {
                                // For non-Tab keys (Enter), return focus to trigger
                                requestAnimationFrame(() => {
                                    triggerRef.current?.focus();
                                });
                            }
                        }
                    }
                }

                else if (event.key === 'Tab' && open) {
                    setOpen(false);

                    // Move to next focusable element if input is in content
                    const inputInTrigger = triggerRef.current?.contains(inputRef.current);
                    if (!inputInTrigger) {
                        event.preventDefault();
                        requestAnimationFrame(() => {
                            // Find next focusable element after trigger
                            const focusableElements = Array.from(
                                document.querySelectorAll<HTMLElement>(
                                    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
                                )
                            );
                            const triggerIndex = triggerRef.current ? focusableElements.indexOf(triggerRef.current) : -1;
                            const nextElement = focusableElements[triggerIndex + 1];
                            if (nextElement) {
                                nextElement.focus();
                            }
                        });
                    }
                }

                else if (!open) {
                    dispatch({ type: 'SET_PENDING_CURSOR_ACTION', payload: 'default' });
                    setOpen(true);
                }

                break;

            case AutocompleteActions.Close:
                if (open) {
                    setOpen(false);
                    dispatch({ type: 'SET_CURSOR', payload: -1 });
                    // Return focus to trigger if input is in content
                    const inputInTrigger = triggerRef.current?.contains(inputRef.current);
                    if (!inputInTrigger) {
                        requestAnimationFrame(() => {
                            triggerRef.current?.focus();
                        });
                    }
                }

                break;

            default: break;
        }
    }, [
        disabled, open, loopFocus, state.cursor, filteredItems,
        dispatch, setOpen, scrollRequestRef, triggerScroll, setValue,
        triggerRef, inputRef, value
    ]);

    const Component = asChild ? Slot : 'input';

    return (
        <Component
            data-ui="autocomplete-input"

            aria-activedescendant={activeDescendant || undefined}
            aria-autocomplete="list"
            aria-controls={listboxId}
            aria-expanded={open}
            aria-haspopup="listbox"
            role="combobox"

            autoComplete="off"
            disabled={disabled}
            ref={inputRef}
            type="text"

            value={value}
            onInput={inputHandler}
            onChange={changeHandler}
            onClick={clickHandler}
            onFocus={focusHandler}
            onBlur={blurHandler}
            onKeyDown={keyDownHandler}

            className={cn(
                'flex-1 bg-transparent text-sm text-write placeholder:text-muted-write outline-none',
                'disabled:cursor-not-allowed',
                className
            )}

            {...props}
        />
    );
});

// ---------------------------------------------------------------------------------------------------- //

interface AutocompleteTriggerIndicatorProps extends HTMLAttributes<HTMLElement> {
    asChild?: boolean;
}

function AutocompleteTriggerIndicator({ className, asChild, children, ...props }: AutocompleteTriggerIndicatorProps) {
    const Component = asChild ? Slot : 'span';

    return (
        <Component
            data-ui="autocomplete-trigger-indicator"

            aria-hidden

            className={cn(
                'w-fit [&>svg]:size-4 text-write shrink-0',
                className
            )}

            {...props}
        >
            {asChild ? children : (
                <svg
                    data-ui="autocomplete-trigger-indicator-icon"

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

interface AutocompletePortalProps { container?: HTMLElement, children?: ReactNode }

function AutocompletePortal({ container, children }: AutocompletePortalProps) {
    return createPortal(children, container || document.body);
}

// ---------------------------------------------------------------------------------------------------- //

interface AutocompleteContentProps extends HTMLAttributes<HTMLElement> {
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

function AutocompleteContent({
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
}: AutocompleteContentProps) {
    const { open, setOpen, triggerRef, inputRef, contentRef, viewportRef, scrollRequestRef, scrollTrigger, filteredItems, dispatch, listboxId } = useAutocompleteContext();

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
        isReferenceHidden,
        updatePosition,
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

        if (targetIndex < 0 || targetIndex >= filteredItems.length) return;
        const { element } = filteredItems[targetIndex];
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
    }, [open, isPositioned, scrollTrigger, filteredItems, scrollRequestRef, viewportRef]);

    useEffect(() => {
        if (!open) lastProcessedRef.current = { trigger: 0, positioned: false }
    }, [open]);

    useEffect(() => { if (open) setIsMounted(true); }, [open]);

    useLayoutEffect(() => {
        if (open && isMounted && isPositioned) {
            const frameId = requestAnimationFrame(() => { updatePosition(true) });
            return () => cancelAnimationFrame(frameId);
        }
    }, [open, isMounted, isPositioned, updatePosition]);

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

    useLayoutEffect(() => {
        if (isCollectionPass) {
            setHasCollected(true);
            if (!open) setIsMounted(false);
        }
    }, [isCollectionPass, open]);

    // Focus the input when the content opens and is positioned
    useEffect(() => {
        if (open && isPositioned && isMounted && inputRef.current && contentRef.current) {
            // Check if input is inside the content (not in trigger)
            if (contentRef.current.contains(inputRef.current)) {
                // Double rAF to ensure rendering is complete
                const frameId = requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        if (inputRef.current && !inputRef.current.disabled) {
                            inputRef.current.focus();
                        }
                    });
                });
                return () => cancelAnimationFrame(frameId);
            }
        }
    }, [open, isPositioned, isMounted, inputRef, contentRef]);

    const animationEndHandler = useCallback((event: React.AnimationEvent<HTMLDivElement>) => {
        if (event.target === event.currentTarget && !open) {
            const element = event.currentTarget;
            element.style.display = "none";
            setIsMounted(false);
        }
    }, [open]);

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
        return () => { document.removeEventListener("mousedown", outsideClickHandler); }
    }, [open, contentRef, triggerRef, onPointerDownOutside, setOpen, dispatch]);

    useEffect(() => {
        if (!open) return;

        const keyDownHandler = (event: globalThis.KeyboardEvent) => {
            if (event.key === "Escape" && document.activeElement !== inputRef.current) {
                onEscapeKeyDown?.(event as unknown as React.KeyboardEvent);
                setOpen(false);
                dispatch({ type: 'SET_CURSOR', payload: -1 });
                dispatch({ type: 'SET_PENDING_CURSOR_ACTION', payload: null });
                inputRef.current?.focus();
            }
        }

        document.addEventListener("keydown", keyDownHandler);
        return () => { document.removeEventListener("keydown", keyDownHandler); }
    }, [open, onEscapeKeyDown, setOpen, dispatch, inputRef]);

    if (!isMounted && !forceMount && !isCollectionPass) return null;

    const Component = asChild ? Slot : 'div';

    return (
        <Component
            data-ui="autocomplete-content"
            data-state={open ? "open" : "closed"}
            data-side={actualSide}

            role="listbox"
            id={listboxId}
            aria-label="Suggestions"

            ref={contentRef}
            tabIndex={-1}

            onAnimationEnd={animationEndHandler}

            style={{
                position: 'fixed',
                top: isCollectionPass ? '-9999px' : `${top}px`,
                left: isCollectionPass ? '-9999px' : `${left}px`,
                zIndex: 50,
                maxHeight: isCollectionPass ? undefined : (maxHeight ? `${maxHeight}px` : undefined),
                display: 'flex',
                flexDirection: 'column',
                visibility: isCollectionPass ? 'hidden' : (isPositioned && !isReferenceHidden ? "visible" : "hidden"),
                pointerEvents: isCollectionPass ? 'none' : 'auto',
                opacity: isCollectionPass ? 0 : undefined,
            }}

            className={cn(
                "min-w-64 w-fit rounded border border-bound bg-surface shadow",
                "[&_[data-ui='autocomplete-input']]:px-2 [&_[data-ui='autocomplete-input']]:py-1.5",
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

interface AutocompleteViewportProps extends HTMLAttributes<HTMLElement> {
    asChild?: boolean;
}

function AutocompleteViewport({ children, className, asChild, ...props }: AutocompleteViewportProps) {
    const { viewportRef } = useAutocompleteContext();

    const Component = asChild ? Slot : 'div';

    return (
        <Component
            data-ui="autocomplete-viewport"

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

interface AutocompleteEmptyProps extends HTMLAttributes<HTMLElement> {
    asChild?: boolean;
}

function AutocompleteEmpty({ children, className, asChild, ...props }: AutocompleteEmptyProps) {
    const { filteredItems, open } = useAutocompleteContext();
    if (!open || filteredItems.length > 0) return null;

    const Component = asChild ? Slot : 'div';

    return (
        <Component
            data-ui="autocomplete-empty"

            role="status"
            aria-live="polite"

            className={cn(
                'flex items-center justify-start w-full text-sm text-muted-write px-2 py-1.5 rounded',
                className
            )}

            {...props}
        >
            {children ?? 'No results found.'}
        </Component>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface AutocompleteItemContextState {
    textElementRef: RefObject<HTMLElement | null>;
    selected: boolean;
}

const AutocompleteItemContext = createContext<AutocompleteItemContextState | null>(null);

function useAutocompleteItemContext(): AutocompleteItemContextState {
    const context = useContext(AutocompleteItemContext);
    if (!context) throw new Error("useAutocompleteItemContext must be used within an <AutocompleteItem> component");
    return context;
}

// ---------------------------------------------------------------------------------------------------- //

interface AutocompleteItemProps extends HTMLAttributes<HTMLElement> {
    value?: string;
    disabled?: boolean;
    textValue?: string;
    asChild?: boolean;
}

function AutocompleteItem({ children, className, value, disabled, textValue, asChild, ...props }: AutocompleteItemProps) {
    const {
        setOpen, setValue,
        value: currentValue,
        state, dispatch,
        highlightItemOnHover, filteredItems, filteredItemIds,
    } = useAutocompleteContext();

    const ref = useRef<HTMLDivElement>(null);
    const textElementRef = useRef<HTMLElement>(null);
    const fallbackId = useId();
    const itemId = props.id ?? fallbackId;

    const selected = value === currentValue;

    const isFiltered = filteredItemIds.has(itemId);
    const itemIndex = filteredItems.findIndex(item => item.id === itemId);
    const highlighted = itemIndex >= 0 && state.cursor === itemIndex;

    const context: AutocompleteItemContextState = { textElementRef, selected }

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

        const item: AutocompleteItemEntry = {
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

        const resolvedTextValue = textValue ??
            textElementRef?.current?.textContent ??
            ref?.current?.textContent ??
            value;

        setValue(resolvedTextValue);
        setOpen(false);
    }, [disabled, value, setValue, setOpen, textValue]);

    const mouseEnterHandler = useCallback(() => {
        if (disabled || !highlightItemOnHover) return;
        if (itemIndex >= 0) dispatch({ type: 'SET_CURSOR', payload: itemIndex });
    }, [disabled, highlightItemOnHover, itemIndex, dispatch]);

    const pointerMoveHandler = useCallback(() => {
        if (disabled || !highlightItemOnHover) return;
        if (itemIndex >= 0) dispatch({ type: 'SET_CURSOR', payload: itemIndex });
    }, [disabled, highlightItemOnHover, itemIndex, dispatch]);

    const mouseLeaveHandler = useCallback(() => {
        if (!highlightItemOnHover) return;
        dispatch({ type: 'SET_CURSOR', payload: -1 });
    }, [highlightItemOnHover, dispatch]);

    const Component = asChild ? Slot : 'div';

    return (
        <AutocompleteItemContext.Provider value={context}>
            <Component
                data-ui="autocomplete-item"
                data-state={selected ? 'checked' : 'unchecked'}
                data-highlighted={highlighted}
                data-disabled={disabled}

                aria-selected={selected}
                aria-disabled={disabled}
                role="option"
                aria-hidden={!isFiltered || undefined}

                onMouseEnter={mouseEnterHandler}
                onPointerMove={pointerMoveHandler}
                onMouseLeave={mouseLeaveHandler}
                onClick={clickHandler}

                id={itemId}
                ref={ref}

                style={!isFiltered ? { display: 'none' } : undefined}

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
        </AutocompleteItemContext.Provider>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface AutocompleteItemTextProps extends HTMLAttributes<HTMLElement> {
    children?: string;
    asChild?: boolean;
}

function AutocompleteItemText({ className, children, asChild, ...props }: AutocompleteItemTextProps) {
    const { textElementRef } = useAutocompleteItemContext();

    const Component = asChild ? Slot : 'span';

    return (
        <Component
            data-ui="autocomplete-item-text"

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

interface AutocompleteItemIndicatorProps extends HTMLAttributes<HTMLElement> {
    asChild?: boolean;
}

function AutocompleteItemIndicator({ className, asChild, children, ...props }: AutocompleteItemIndicatorProps) {
    const { selected } = useAutocompleteItemContext();
    if (!selected) return null;

    const Component = asChild ? Slot : 'span';

    return (
        <Component
            data-ui="autocomplete-item-indicator"

            className={cn(
                'w-fit [&>svg]:size-4 text-write shrink-0',
                className
            )}

            {...props}
        >
            {asChild ? children : (
                <svg
                    data-ui="autocomplete-item-indicator-icon"

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

interface AutocompleteGroupContextState {
    groupId: string;
    labelElementRef: RefObject<HTMLElement | null>;
    hasVisibleItems: boolean;
}

const AutocompleteGroupContext = createContext<AutocompleteGroupContextState | null>(null);

function useAutocompleteGroupContext(): AutocompleteGroupContextState {
    const context = useContext(AutocompleteGroupContext);
    if (!context) throw new Error("useAutocompleteGroupContext must be used within an <AutocompleteGroup> component");
    return context;
}

// ---------------------------------------------------------------------------------------------------- //

interface AutocompleteGroupProps extends HTMLAttributes<HTMLElement> {
    asChild?: boolean;
}

function AutocompleteGroup({ children, className, asChild, ...props }: AutocompleteGroupProps) {
    const { filteredItemIds, open } = useAutocompleteContext();
    const fallbackId = useId();
    const groupId = props.id ?? fallbackId;
    const labelElementRef = useRef<HTMLElement>(null);
    const labeledBy = labelElementRef?.current?.id ?? `${groupId}-label`;
    const groupRef = useRef<HTMLDivElement>(null);
    const [hasVisibleItems, setHasVisibleItems] = useState(true);

    useLayoutEffect(() => {
        if (!open) {
            setHasVisibleItems(true);
            return;
        }

        const timer = setTimeout(() => {
            if (!groupRef.current) return;

            const items = groupRef.current.querySelectorAll('[data-ui="autocomplete-item"]');
            const visible = Array.from(items).some(item => {
                const itemId = item.getAttribute('id');
                return itemId && filteredItemIds.has(itemId);
            });

            setHasVisibleItems(visible);
        }, 0);

        return () => clearTimeout(timer);
    }, [open, filteredItemIds]);

    const context: AutocompleteGroupContextState = { groupId, labelElementRef, hasVisibleItems }

    const Component = asChild ? Slot : 'div';

    return (
        <AutocompleteGroupContext.Provider value={context}>
            <Component
                data-ui="autocomplete-group"
                data-hidden={!hasVisibleItems || undefined}

                aria-labelledby={labeledBy}
                role="group"

                id={groupId}
                ref={groupRef}

                className={cn(
                    'w-full flex flex-col gap-px',
                    !hasVisibleItems && 'hidden',
                    className
                )}

                {...props}
            >
                {children}
            </Component>
        </AutocompleteGroupContext.Provider>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface AutocompleteLabelProps extends HTMLAttributes<HTMLElement> {
    asChild?: boolean;
}

function AutocompleteLabel({ children, className, asChild, ...props }: AutocompleteLabelProps) {
    const { groupId, labelElementRef, hasVisibleItems } = useAutocompleteGroupContext();
    const labelId = props.id ?? `${groupId}-label`;

    const Component = asChild ? Slot : 'span';

    return (
        <Component
            data-ui="autocomplete-label"
            data-hidden={!hasVisibleItems || undefined}

            ref={labelElementRef}
            id={labelId}

            className={cn(
                'text-xs font-semibold text-muted-write px-2 py-1.5',
                !hasVisibleItems && 'hidden',
                className
            )}

            {...props}
        >
            {children}
        </Component>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface AutocompleteSeparatorProps extends HTMLAttributes<HTMLElement> {
    asChild?: boolean;
}

function AutocompleteSeparator({ className, children, asChild, ...props }: AutocompleteSeparatorProps) {
    const Component = asChild ? Slot : 'span';

    return (
        <Component
            data-ui="autocomplete-separator"

            aria-orientation="horizontal"
            role="separator"

            className={cn(
                'block h-px my-1 -mx-1 bg-muted-bound',
                'has-[+_[data-hidden]]:hidden',
                '[[data-hidden]+&]:hidden',
                className
            )}

            {...props}
        >
            {children}
        </Component>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface AutocompleteScrollUpButtonProps extends HTMLAttributes<HTMLElement> {
    asChild?: boolean;
}

function AutocompleteScrollUpButton({ className, asChild, children, ...props }: AutocompleteScrollUpButtonProps) {
    const { viewportRef } = useAutocompleteContext();
    const [isAtTop, setIsAtTop] = useState(true);
    const scrollIntervalRef = useRef<number | null>(null);

    useEffect(() => {
        const viewport = viewportRef.current;
        if (!viewport) return;

        const checkPosition = () => setIsAtTop(viewport.scrollTop === 0);
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

    useEffect(() => { return () => stopScrolling() }, [stopScrolling]);

    const Component = asChild ? Slot : 'button';

    return (
        <Component
            data-ui="autocomplete-scroll-up-button"

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
                    data-ui="autocomplete-scroll-up-icon"

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

interface AutocompleteScrollDownButtonProps extends HTMLAttributes<HTMLElement> {
    asChild?: boolean;
}

function AutocompleteScrollDownButton({ className, asChild, children, ...props }: AutocompleteScrollDownButtonProps) {
    const { viewportRef } = useAutocompleteContext();
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
            data-ui="autocomplete-scroll-down-button"

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
                    data-ui="autocomplete-scroll-down-icon"

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
    Autocomplete,
    AutocompleteTrigger,
    AutocompleteInput,
    AutocompleteTriggerIndicator,
    AutocompletePortal,
    AutocompleteContent,
    AutocompleteViewport,
    AutocompleteEmpty,
    AutocompleteItem,
    AutocompleteItemText,
    AutocompleteItemIndicator,
    AutocompleteGroup,
    AutocompleteLabel,
    AutocompleteSeparator,
    AutocompleteScrollUpButton,
    AutocompleteScrollDownButton,
    type AutocompleteProps,
    type AutocompleteTriggerProps,
    type AutocompleteInputProps,
    type AutocompleteTriggerIndicatorProps,
    type AutocompletePortalProps,
    type AutocompleteContentProps,
    type AutocompleteViewportProps,
    type AutocompleteEmptyProps,
    type AutocompleteItemProps,
    type AutocompleteItemTextProps,
    type AutocompleteItemIndicatorProps,
    type AutocompleteGroupProps,
    type AutocompleteLabelProps,
    type AutocompleteSeparatorProps,
    type AutocompleteScrollUpButtonProps,
    type AutocompleteScrollDownButtonProps,
}

// ---------------------------------------------------------------------------------------------------- //
