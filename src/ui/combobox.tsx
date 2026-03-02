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

const ComboboxActions = {
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
    Toggle: 9,
    SelectAll: 10,
    DeselectAll: 11,
} as const;

type ComboboxAction = typeof ComboboxActions[keyof typeof ComboboxActions];

const getComboboxAction = (event: KeyboardEvent<HTMLInputElement>, open: boolean, multiple: boolean): ComboboxAction => {
    const { key, altKey, ctrlKey, metaKey, shiftKey } = event;

    if (key === 'Home') return ComboboxActions.First;
    if (key === 'End') return ComboboxActions.Last;

    if (open && multiple && key === 'a' && (ctrlKey || metaKey) && shiftKey) return ComboboxActions.DeselectAll;
    if (open && multiple && key === 'a' && (ctrlKey || metaKey)) return ComboboxActions.SelectAll;

    if (open) switch (key) {
        case 'ArrowUp': return altKey ? ComboboxActions.Close : ComboboxActions.Previous;
        case 'ArrowDown': return altKey ? ComboboxActions.None : ComboboxActions.Next;
        case 'PageUp': return ComboboxActions.PageUp;
        case 'PageDown': return ComboboxActions.PageDown;
        case 'Escape': return ComboboxActions.Close;
        case 'Enter': return multiple ? ComboboxActions.Toggle : ComboboxActions.Select;
        case 'Tab': return multiple ? ComboboxActions.Toggle : ComboboxActions.Select;
    }

    if (!open) switch (key) {
        case 'ArrowDown': return ComboboxActions.Open;
        case 'ArrowUp': return ComboboxActions.Open;
        case 'Enter': return ComboboxActions.Open;
    }

    return ComboboxActions.None;
}

// ---------------------------------------------------------------------------------------------------- //

interface ComboboxItemEntry {
    id: string;
    value: string;
    textValue: string;
    disabled: boolean;
    element: HTMLElement | null;
}

interface ComboboxState {
    cursor: number;
    items: ComboboxItemEntry[];
    pendingCursorAction: 'first' | 'last' | 'default' | null;
}

type ComboboxStateAction =
    | { type: 'SET_CURSOR'; payload: number }
    | { type: 'SET_PENDING_CURSOR_ACTION'; payload: 'first' | 'last' | 'default' | null }
    | { type: 'REGISTER_ITEM'; payload: ComboboxItemEntry }
    | { type: 'UNREGISTER_ITEM'; payload: string }

function comboboxStateReducer(state: ComboboxState, action: ComboboxStateAction): ComboboxState {
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
    items: ComboboxItemEntry[],
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

function findEdgeEnabledIndex(items: ComboboxItemEntry[], edge: 'first' | 'last'): number {
    if (items.length === 0) return -1;

    if (edge === 'first')
        return items.findIndex(item => !item.disabled);

    for (let i = items.length - 1; i >= 0; i--)
        if (!items[i].disabled) return i;

    return -1;
}

// ---------------------------------------------------------------------------------------------------- //

type ComboboxFilterFunction = (inputValue: string, items: ComboboxItemEntry[]) => ComboboxItemEntry[];

interface ComboboxActionsRef {
    clear: () => void;
    setOpen: (open: boolean) => void;
    setInputValue: (value: string) => void;
    setValue: (value: string | string[]) => void;
    highlightIndex: (index: number) => void;
}

interface ComboboxContextState {
    instanceId: string;
    listboxId: string;

    value: string | string[];
    setValue: (value: string | string[]) => void;
    toggleValue: (itemValue: string) => void;

    inputValue: string;
    setInputValue: (value: string) => void;

    open: boolean;
    setOpen: (open: boolean) => void;

    disabled: boolean;
    multiple: boolean;

    autoHighlight: boolean;
    highlightItemOnHover: boolean;
    openOnInputClick: boolean;
    loopFocus: boolean;
    allowCustomValue: boolean;

    state: ComboboxState;
    dispatch: Dispatch<ComboboxStateAction>;

    activeDescendant: string | null;

    filter: ComboboxFilterFunction | null;
    filteredItems: ComboboxItemEntry[];
    filteredItemIds: Set<string>;

    itemLabelsRef: RefObject<Map<string, string>>;
    itemLabels: Map<string, string>;
    registerItemLabel: (value: string, textValue: string) => void;

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

    closeReasonRef: RefObject<'escape' | 'blur'>;
    inputModifiedFlagRef: RefObject<boolean>;
}

const ComboboxContext = createContext<ComboboxContextState | null>(null);

function useComboboxContext(): ComboboxContextState {
    const context = useContext(ComboboxContext);
    if (!context) throw new Error("useComboboxContext must be used within a <Combobox> component");
    return context;
}

// ---------------------------------------------------------------------------------------------------- //

const defaultFilter: ComboboxFilterFunction = (inputValue, items) => {
    if (!inputValue) return items;
    const lowerInput = inputValue.toLowerCase();
    return items.filter(item =>
        item.textValue.toLowerCase().includes(lowerInput)
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface ComboboxProps {
    value?: string | string[];
    defaultValue?: string | string[];
    onValueChange?: (value: string | string[]) => void;

    inputValue?: string;
    defaultInputValue?: string;
    onInputValueChange?: (value: string) => void;

    defaultOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;

    autoHighlight?: boolean;
    highlightItemOnHover?: boolean;
    openOnInputClick?: boolean;
    loopFocus?: boolean;
    modal?: boolean;
    multiple?: boolean;
    allowCustomValue?: boolean;

    filter?: ComboboxFilterFunction | null;

    name?: string;
    disabled?: boolean;
    required?: boolean;

    actionsRef?: RefObject<ComboboxActionsRef | null>;

    isItemEqualToValue?: (itemValue: string, selectedValue: string) => boolean;
    itemToStringLabel?: (itemValue: string) => string;
    itemToStringValue?: (itemValue: string) => string;

    children?: ReactNode;
}

function Combobox({
    defaultValue, onValueChange, value,
    defaultInputValue, onInputValueChange, inputValue,
    defaultOpen, onOpenChange, open,
    autoHighlight = false,
    highlightItemOnHover = true,
    openOnInputClick = true,
    loopFocus = true,
    multiple = false,
    disabled = false,
    allowCustomValue = false,
    filter = defaultFilter,
    actionsRef,
    children,
}: ComboboxProps) {
    const instanceId = useId();
    const listboxId = `combobox-listbox-${instanceId}`;

    const [valueState, setValue] = useControllableState({
        defaultValue: defaultValue ?? (multiple ? [] : ''),
        onChange: onValueChange,
        value,
    });

    const [inputValueState, setInputValue] = useControllableState({
        defaultValue: defaultInputValue ?? '',
        onChange: onInputValueChange,
        value: inputValue,
    });

    const [openState, setOpenInternal] = useControllableState({
        defaultValue: defaultOpen ?? false,
        onChange: onOpenChange,
        value: open,
    });

    const setOpen = useCallback((newOpen: boolean) => {
        setOpenInternal(newOpen);
    }, [setOpenInternal]);

    const [state, dispatch] = useReducer(comboboxStateReducer, {
        cursor: -1,
        items: [],
        pendingCursorAction: null,
    });

    const viewportRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    const closeReasonRef = useRef<'escape' | 'blur'>('blur');
    const inputModifiedFlagRef = useRef(false);

    const scrollRequestRef = useRef<{
        type: 'none' | 'center' | 'ensure-visible' | 'edge-start' | 'edge-end';
        targetIndex: number;
    }>({ type: 'none', targetIndex: -1 });

    const [scrollTrigger, setScrollTrigger] = useState(0);
    const triggerScroll = useCallback(() => setScrollTrigger(prev => prev + 1), []);

    const lastOpenFilteredItemsRef = useRef<ComboboxItemEntry[]>([]);

    const filteredItems = useMemo(() => {
        if (!openState) return lastOpenFilteredItemsRef.current;

        if (!filter) {
            lastOpenFilteredItemsRef.current = state.items;
            return state.items;
        }

        if (!multiple && !inputModifiedFlagRef.current) {
            lastOpenFilteredItemsRef.current = state.items;
            return state.items;
        }

        const result = filter(inputValueState, state.items);
        lastOpenFilteredItemsRef.current = result;
        return result;
    }, [filter, inputValueState, state.items, multiple, openState]);

    const filteredItemIds = useMemo(() => {
        return new Set(filteredItems.map(item => item.id));
    }, [filteredItems]);

    const activeDescendant = useMemo(() => {
        return state.cursor >= 0 && state.cursor < filteredItems.length
            ? filteredItems[state.cursor].id
            : null;
    }, [state.cursor, filteredItems]);

    const toggleValue = useCallback((itemValue: string) => {
        if (multiple) {
            const currentArray = Array.isArray(valueState) ? valueState : [];
            const newValue = currentArray.includes(itemValue)
                ? currentArray.filter(v => v !== itemValue)
                : [...currentArray, itemValue];
            setValue(newValue);
        } else setValue(itemValue);
    }, [multiple, valueState, setValue]);

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

    const hasInitializedInputRef = useRef(false);

    useEffect(() => {
        if (multiple || hasInitializedInputRef.current) return;
        const val = valueState as string;
        if (!val) return;
        const label = itemLabels.get(val);

        if (label) {
            hasInitializedInputRef.current = true;
            setInputValue(label);
        }
    }, [multiple, valueState, itemLabels, setInputValue]);

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
            const selectedValue = multiple
                ? (Array.isArray(valueState) && valueState.length > 0 ? valueState[0] : null)
                : (valueState as string);

            const currentIndex = selectedValue ? filteredItems.findIndex(item => item.value === selectedValue) : -1;
            const initialCursor = currentIndex >= 0 ? currentIndex : (autoHighlight ? findEdgeEnabledIndex(filteredItems, 'first') : -1);

            if (initialCursor >= 0) {
                scrollRequestRef.current = { type: 'center', targetIndex: initialCursor }
                dispatch({ type: 'SET_CURSOR', payload: initialCursor });
                triggerScroll();
            } else dispatch({ type: 'SET_CURSOR', payload: -1 });
        }

        dispatch({ type: 'SET_PENDING_CURSOR_ACTION', payload: null });
    }, [openState, filteredItems.length, state.pendingCursorAction, valueState, multiple, autoHighlight, triggerScroll]);

    const prevOpenRef = useRef(openState);

    useEffect(() => {
        if (multiple) return;
        const wasOpen = prevOpenRef.current;
        prevOpenRef.current = openState;
        if (!(wasOpen && !openState)) return;

        const reason = closeReasonRef.current;
        closeReasonRef.current = 'blur';

        const selectedValue = valueState as string;

        // If allowCustomValue is true, don't revert the input
        if (allowCustomValue) {
            inputModifiedFlagRef.current = false;
            dispatch({ type: 'SET_CURSOR', payload: -1 });
            return;
        }

        if (reason === 'escape') {
            if (selectedValue) {
                const label = itemLabels.get(selectedValue) ?? itemLabelsRef.current.get(selectedValue) ?? selectedValue;
                setInputValue(label);
            } else setInputValue('');

            inputModifiedFlagRef.current = false;
        }

        else {
            const wasCleared = inputModifiedFlagRef.current && inputValueState === '';
            const wasModified = inputModifiedFlagRef.current;

            if (wasCleared && selectedValue) setValue('');

            else if (wasModified) {
                // User modified the input but didn't clear it completely
                if (selectedValue) {
                    // Revert to the selected value
                    const label = itemLabels.get(selectedValue) ?? itemLabelsRef.current.get(selectedValue) ?? selectedValue;
                    setInputValue(label);
                } else {
                    // No selected value - clear the input
                    setInputValue('');
                }
            }

            inputModifiedFlagRef.current = false;
        }

        dispatch({ type: 'SET_CURSOR', payload: -1 });
    }, [openState, valueState, multiple, inputValueState, setValue, setInputValue, itemLabels, dispatch, allowCustomValue]);

    useImperativeHandle(actionsRef, () => ({
        setInputValue,
        setValue,
        setOpen,

        clear: () => {
            setValue(multiple ? [] : '');
            setInputValue('');
        },

        highlightIndex: (index: number) => {
            if (index >= 0 && index < filteredItems.length) {
                scrollRequestRef.current = { type: 'ensure-visible', targetIndex: index }
                dispatch({ type: 'SET_CURSOR', payload: index });
                triggerScroll();
            }
        },
    }), [multiple, setValue, setInputValue, setOpen, filteredItems.length, triggerScroll]);

    const context: ComboboxContextState = useMemo(() => ({
        instanceId,
        listboxId,
        value: valueState,
        setValue,
        toggleValue,
        inputValue: inputValueState,
        setInputValue,
        open: openState,
        setOpen,
        disabled,
        multiple,
        autoHighlight,
        highlightItemOnHover,
        openOnInputClick,
        loopFocus,
        allowCustomValue,
        state,
        dispatch,
        activeDescendant,
        filter,
        filteredItems,
        filteredItemIds,
        itemLabelsRef,
        itemLabels,
        registerItemLabel,
        triggerRef,
        inputRef,
        contentRef,
        viewportRef,
        scrollRequestRef,
        scrollTrigger,
        triggerScroll,
        closeReasonRef,
        inputModifiedFlagRef,
    }), [
        instanceId, listboxId,
        valueState, setValue, toggleValue,
        inputValueState, setInputValue,
        openState, setOpen,
        disabled, multiple, autoHighlight, highlightItemOnHover, openOnInputClick, loopFocus, allowCustomValue,
        state, activeDescendant, filter, filteredItems, filteredItemIds, itemLabels, registerItemLabel,
        scrollTrigger, triggerScroll
    ]);

    return (
        <ComboboxContext.Provider data-ui="combobox" value={context}>
            {children}
        </ComboboxContext.Provider>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface ComboboxTriggerProps extends HTMLAttributes<HTMLElement> {
    asChild?: boolean;
}

function ComboboxTrigger({ className, children, asChild, ...props }: ComboboxTriggerProps) {
    const { open, setOpen, disabled, multiple, triggerRef, inputRef, dispatch, inputModifiedFlagRef } = useComboboxContext();

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
            if (!multiple) inputModifiedFlagRef.current = false;
            dispatch({ type: 'SET_PENDING_CURSOR_ACTION', payload: 'default' });
            setOpen(true);
        } else setOpen(false);

        // Only focus input if it's in the trigger
        // If input is in content, the content's useEffect will handle focusing
        if (inputInTrigger) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 0);
        }
    }, [disabled, open, multiple, setOpen, dispatch, inputRef, inputModifiedFlagRef, inputInTrigger]);

    const keyDownHandler = useCallback((e: React.KeyboardEvent) => {
        // If the input is focused, let it handle its own keys
        if (document.activeElement === inputRef.current) return;

        if (disabled) return;

        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (!open) {
                if (!multiple) inputModifiedFlagRef.current = false;
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
    }, [disabled, open, multiple, setOpen, dispatch, inputRef, inputModifiedFlagRef, inputInTrigger]);

    const Component = asChild ? Slot : 'div';

    return (
        <Component
            data-ui="combobox-trigger"
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

interface ComboboxInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
    asChild?: boolean;
}

const ComboboxInput = forwardRef<HTMLInputElement, ComboboxInputProps>(function ComboboxInput(
    { className, asChild, ...props },
    forwardedRef
) {
    const {
        open, setOpen, disabled, multiple, loopFocus,
        inputValue, setInputValue,
        value, setValue, toggleValue,
        activeDescendant, inputRef, listboxId,
        state, dispatch, scrollRequestRef, triggerScroll,
        filteredItems, openOnInputClick, itemLabels, itemLabelsRef,
        triggerRef, contentRef, closeReasonRef,
        inputModifiedFlagRef, allowCustomValue,
    } = useComboboxContext();

    useImperativeHandle(forwardedRef, () => inputRef.current!, [inputRef]);

    const changeHandler = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        inputModifiedFlagRef.current = true;

        const newValue = event.target.value;
        setInputValue(newValue);

        dispatch({ type: 'SET_CURSOR', payload: -1 });

        if (!open && newValue.length > 0) setOpen(true);
    }, [open, setOpen, setInputValue, dispatch]);

    const inputHandler = useCallback((event: React.FormEvent<HTMLInputElement>) => {
        inputModifiedFlagRef.current = true;
        const newValue = (event.target as HTMLInputElement).value;
        setInputValue(newValue);

        dispatch({ type: 'SET_CURSOR', payload: -1 });

        if (!open && newValue.length > 0) setOpen(true);
    }, [open, setOpen, setInputValue, dispatch]);

    const clickHandler = useCallback(() => {
        if (disabled) return;

        if (openOnInputClick && !open) {
            if (!multiple) inputModifiedFlagRef.current = false;
            dispatch({ type: 'SET_PENDING_CURSOR_ACTION', payload: 'default' });
            setOpen(true);
        }
    }, [disabled, multiple, openOnInputClick, open, dispatch, setOpen, inputModifiedFlagRef]);

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
                closeReasonRef.current = 'blur';
                setOpen(false);
            }
        }, 0);
    }, [open, setOpen, triggerRef, contentRef, closeReasonRef]);

    const keyDownHandler = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
        if (disabled) return;
        if (event.key === ' ') return;

        if (multiple && event.key === 'Backspace' && inputValue === '') {
            const valueArray = Array.isArray(value) ? value : [];

            if (valueArray.length > 0) {
                event.preventDefault();
                const newValue = valueArray.slice(0, -1);
                setValue(newValue);
                return;
            }
        }

        const action = getComboboxAction(event, open, multiple);

        if (action !== ComboboxActions.None && event.key !== 'Tab') event.preventDefault();

        switch (action) {
            case ComboboxActions.Open:
                if (!open) {
                    if (!multiple) inputModifiedFlagRef.current = false;
                    dispatch({ type: 'SET_PENDING_CURSOR_ACTION', payload: 'default' });
                    setOpen(true);
                }

                break;

            case ComboboxActions.First: {
                if (!open) {
                    if (!multiple) inputModifiedFlagRef.current = false;
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

            case ComboboxActions.Last: {
                if (!open) {
                    if (!multiple) inputModifiedFlagRef.current = false;
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

            case ComboboxActions.Previous: {
                const nextIndex = findNextEnabledIndex(filteredItems, state.cursor, -1, loopFocus);

                if (nextIndex >= 0) {
                    const scrollType = nextIndex === 0 ? 'edge-start' : 'ensure-visible';
                    scrollRequestRef.current = { type: scrollType, targetIndex: nextIndex }
                    dispatch({ type: 'SET_CURSOR', payload: nextIndex });
                    triggerScroll();
                }

                break;
            }

            case ComboboxActions.Next: {
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

            case ComboboxActions.PageUp: {
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

            case ComboboxActions.PageDown: {
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

            case ComboboxActions.Select:
                if (state.cursor >= 0 && state.cursor < filteredItems.length) {
                    const item = filteredItems[state.cursor];

                    if (!item.disabled) {
                        setValue(item.value);
                        const textValue = itemLabels.get(item.value) ?? itemLabelsRef.current.get(item.value) ?? item.textValue;
                        setInputValue(textValue);
                        if (!multiple) inputModifiedFlagRef.current = false;
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
                    // If allowCustomValue is true, don't revert the input
                    if (!allowCustomValue) {
                        const selectedValue = value as string;
                        const wasCleared = inputModifiedFlagRef.current && inputValue === '';

                        if (wasCleared && selectedValue) {
                            setValue('');
                        } else if (inputModifiedFlagRef.current) {
                            if (selectedValue) {
                                const label = itemLabels.get(selectedValue) ?? itemLabelsRef.current.get(selectedValue) ?? selectedValue;
                                setInputValue(label);
                            } else {
                                setInputValue('');
                            }
                        }
                    }

                    inputModifiedFlagRef.current = false;
                    closeReasonRef.current = 'blur';
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
                    if (!multiple) inputModifiedFlagRef.current = false;
                    dispatch({ type: 'SET_PENDING_CURSOR_ACTION', payload: 'default' });
                    setOpen(true);
                }

                break;

            case ComboboxActions.Toggle:
                if (state.cursor >= 0 && state.cursor < filteredItems.length) {
                    const item = filteredItems[state.cursor];
                    if (!item.disabled) toggleValue(item.value);
                }

                break;

            case ComboboxActions.SelectAll: {
                if (multiple) {
                    const enabledItems = filteredItems.filter(item => !item.disabled);
                    const allValues = enabledItems.map(item => item.value);
                    setValue(allValues);
                }

                break;
            }

            case ComboboxActions.DeselectAll:
                if (multiple) setValue([]);
                break;

            case ComboboxActions.Close:
                if (open) {
                    closeReasonRef.current = 'escape';
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
        disabled, open, multiple, loopFocus, state.cursor, filteredItems,
        dispatch, setOpen, scrollRequestRef, triggerScroll, setValue, toggleValue,
        setInputValue, itemLabels, itemLabelsRef, value, inputValue,
        triggerRef, inputRef, inputModifiedFlagRef, closeReasonRef
    ]);

    const Component = asChild ? Slot : 'input';

    return (
        <Component
            data-ui="combobox-input"

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

            value={inputValue}
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

interface SelectedItemData {
    value: string;
    textValue: string;
}

type ComboboxItemRender = (
    item: SelectedItemData,
    removeHandler: (value: string) => void,
    context: ComboboxContextState
) => ReactNode;

interface ComboboxValueProps extends HTMLAttributes<HTMLElement> {
    placeholder?: ReactNode;
    asChild?: boolean;
    maxDisplayedItems?: number;
    itemRender?: ComboboxItemRender;
}

function ComboboxValue({
    className,
    children,
    placeholder,
    asChild,
    maxDisplayedItems = 3,
    itemRender,
    ...props
}: ComboboxValueProps) {
    const context = useComboboxContext();
    const { value, multiple, itemLabelsRef, itemLabels, toggleValue, disabled } = context;

    const Component = asChild ? Slot : 'span';

    if (children) return (
        <Component
            data-ui="combobox-value"
            className={cn('flex flex-wrap items-center gap-1 overflow-hidden', className)}
            {...props}
        >
            {children}
        </Component>
    );

    // Single selection mode
    if (!multiple) {
        const selectedValue = value as string;
        if (!selectedValue) {
            return placeholder ? (
                <Component
                    data-ui="combobox-value"
                    className={cn('text-sm text-muted-write', className)}
                    {...props}
                >
                    {placeholder}
                </Component>
            ) : null;
        }

        const textValue = itemLabels.get(selectedValue) ?? itemLabelsRef.current.get(selectedValue) ?? selectedValue;

        return (
            <Component
                data-ui="combobox-value"
                className={cn('text-sm overflow-hidden text-ellipsis whitespace-nowrap', className)}
                {...props}
            >
                {textValue}
            </Component>
        );
    }

    // Multiple selection mode
    const selectedItems: SelectedItemData[] = useMemo(() => {
        const valueArray = Array.isArray(value) ? value : [];

        return valueArray.map(v => ({
            value: v,
            textValue: itemLabels.get(v) ?? itemLabelsRef.current.get(v) ?? v,
        }));
    }, [value, itemLabels, itemLabelsRef]);

    const displayedItems = selectedItems.slice(0, maxDisplayedItems);
    const remainingCount = Math.max(0, selectedItems.length - maxDisplayedItems);

    const removeHandler = useCallback((itemValue: string) => {
        if (!disabled) toggleValue(itemValue);
    }, [disabled, toggleValue]);

    const defaultItemRender: ComboboxItemRender = useCallback(
        (
            item: SelectedItemData,
            removeHandler: (value: string) => void,
            ctx: ComboboxContextState,
        ) => (
            <ComboboxChip
                key={item.value}
                value={item.value}
                onRemove={removeHandler}
                disabled={ctx.disabled}
            >
                {item.textValue}
            </ComboboxChip>
        ), []);

    if (!selectedItems.length) {
        return placeholder ? (
            <Component
                data-ui="combobox-value"
                className={cn('text-sm text-muted-write', className)}
                {...props}
            >
                {placeholder}
            </Component>
        ) : null;
    }

    return (
        <Component
            data-ui="combobox-value"
            className={cn('flex flex-wrap items-center gap-1 overflow-hidden', className)}
            {...props}
        >
            {displayedItems.map(item => (itemRender ?? defaultItemRender)(item, removeHandler, context))}

            {
                remainingCount > 0 && <span className="text-xs font-medium text-muted-write px-1">
                    {`+${remainingCount}`}
                </span>
            }
        </Component>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface ComboboxChipProps extends HTMLAttributes<HTMLElement> {
    onRemove?: (value: string) => void;
    textValue?: string;
    disabled?: boolean;
    value?: string;
    asChild?: boolean;
}

function ComboboxChip({ className, value, children, onRemove, disabled, asChild, ...props }: ComboboxChipProps) {
    const Component = asChild ? Slot : 'span';

    const removeClickHandler = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        if (!disabled && onRemove && value) onRemove(value);
    }, [disabled, onRemove, value]);

    return (
        <Component
            data-ui="combobox-chip"
            data-disabled={disabled || undefined}

            className={cn(
                'inline-flex items-center gap-1 px-2 py-0.5 rounded text-sm/tight font-medium bg-muted-surface text-write',
                'data-[disabled]:opacity-50',
                className
            )}

            {...props}
        >
            {children}

            {
                onRemove &&

                <button
                    data-ui="combobox-chip-remove"

                    disabled={disabled}
                    type="button"
                    tabIndex={-1}

                    aria-label="Remove"
                    onClick={removeClickHandler}

                    className={cn(
                        'inline-flex items-center justify-center size-fit shrink-0 rounded',
                        '[&_svg:not([class*="size-"])]:size-3.5',
                        'disabled:pointer-events-none',
                        'hover:bg-muted-bound/50',
                        'focus:outline-none',
                    )}

                >
                    <svg
                        data-ui="combobox-chip-remove-icon"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden
                    >
                        <path
                            d="M18.7071 5.29289C19.0976 5.68342 19.0976 6.31658 18.7071 6.70711L6.70711 18.7071C6.31658 19.0976 5.68342 19.0976 5.29289 18.7071C4.90237 18.3166 4.90237 17.6834 5.29289 17.2929L17.2929 5.29289C17.6834 4.90237 18.3166 4.90237 18.7071 5.29289Z"
                            fill="currentColor"
                            fillRule="evenodd"
                            clipRule="evenodd"
                        />
                        <path
                            d="M5.29289 5.29289C5.68342 4.90237 6.31658 4.90237 6.70711 5.29289L18.7071 17.2929C19.0976 17.6834 19.0976 18.3166 18.7071 18.7071C18.3166 19.0976 17.6834 19.0976 17.2929 18.7071L5.29289 6.70711C4.90237 6.31658 4.90237 5.68342 5.29289 5.29289Z"
                            fill="currentColor"
                            fillRule="evenodd"
                            clipRule="evenodd"
                        />
                    </svg>
                </button>
            }
        </Component>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface ComboboxTriggerIndicatorProps extends HTMLAttributes<HTMLElement> {
    asChild?: boolean;
}

function ComboboxTriggerIndicator({ className, asChild, children, ...props }: ComboboxTriggerIndicatorProps) {
    const Component = asChild ? Slot : 'span';

    return (
        <Component
            data-ui="combobox-trigger-indicator"

            aria-hidden

            className={cn(
                'w-fit [&>svg]:size-4 text-write shrink-0',
                className
            )}

            {...props}
        >
            {asChild ? children : (
                <svg
                    data-ui="combobox-trigger-indicator-icon"

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

interface ComboboxClearProps extends HTMLAttributes<HTMLElement> {
    asChild?: boolean;
}

function ComboboxClear({ className, asChild, children, ...props }: ComboboxClearProps) {
    const { setValue, setInputValue, value, disabled, multiple, inputRef } = useComboboxContext();

    const hasValue = multiple
        ? (Array.isArray(value) && value.length > 0)
        : (value !== '');

    const clickHandler = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        if (disabled) return;
        setValue(multiple ? [] : '');
        setInputValue('');
        inputRef.current?.focus();
    }, [disabled, setValue, setInputValue, multiple, inputRef]);

    if (!hasValue) return null;

    const Component = asChild ? Slot : 'button';

    return (
        <Component
            data-ui="combobox-clear"

            disabled={disabled}
            type="button"
            tabIndex={-1}

            aria-label="Clear"

            onClick={clickHandler}

            className={cn(
                'w-fit [&>svg]:size-4 text-write shrink-0 transition-colors cursor-pointer rounded',
                'disabled:opacity-50 disabled:pointer-events-none',
                'focus:outline-none',
                className
            )}

            {...props}
        >
            {asChild ? children : (
                <svg
                    data-ui="combobox-clear-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden
                >
                    <path
                        d="M18.7071 5.29289C19.0976 5.68342 19.0976 6.31658 18.7071 6.70711L6.70711 18.7071C6.31658 19.0976 5.68342 19.0976 5.29289 18.7071C4.90237 18.3166 4.90237 17.6834 5.29289 17.2929L17.2929 5.29289C17.6834 4.90237 18.3166 4.90237 18.7071 5.29289Z"
                        fill="currentColor"
                        fillRule="evenodd"
                        clipRule="evenodd"
                    />
                    <path
                        d="M5.29289 5.29289C5.68342 4.90237 6.31658 4.90237 6.70711 5.29289L18.7071 17.2929C19.0976 17.6834 19.0976 18.3166 18.7071 18.7071C18.3166 19.0976 17.6834 19.0976 17.2929 18.7071L5.29289 6.70711C4.90237 6.31658 4.90237 5.68342 5.29289 5.29289Z"
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

interface ComboboxPortalProps { container?: HTMLElement, children?: ReactNode }

function ComboboxPortal({ container, children }: ComboboxPortalProps) {
    return createPortal(children, container || document.body);
}

// ---------------------------------------------------------------------------------------------------- //

interface ComboboxContentProps extends HTMLAttributes<HTMLElement> {
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

function ComboboxContent({
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
}: ComboboxContentProps) {
    const { open, setOpen, triggerRef, inputRef, contentRef, viewportRef, scrollRequestRef, scrollTrigger, filteredItems, dispatch, listboxId } = useComboboxContext();

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
            data-ui="combobox-content"
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
                "[&_[data-ui='combobox-input']]:px-2 [&_[data-ui='combobox-input']]:py-1.5",
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

interface ComboboxViewportProps extends HTMLAttributes<HTMLElement> {
    asChild?: boolean;
}

function ComboboxViewport({ children, className, asChild, ...props }: ComboboxViewportProps) {
    const { viewportRef } = useComboboxContext();

    const Component = asChild ? Slot : 'div';

    return (
        <Component
            data-ui="combobox-viewport"

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

interface ComboboxEmptyProps extends HTMLAttributes<HTMLElement> {
    asChild?: boolean;
}

function ComboboxEmpty({ children, className, asChild, ...props }: ComboboxEmptyProps) {
    const { filteredItems, open } = useComboboxContext();
    if (!open || filteredItems.length > 0) return null;

    const Component = asChild ? Slot : 'div';

    return (
        <Component
            data-ui="combobox-empty"

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

interface ComboboxItemContextState {
    textElementRef: RefObject<HTMLElement | null>;
    selected: boolean;
}

const ComboboxItemContext = createContext<ComboboxItemContextState | null>(null);

function useComboboxItemContext(): ComboboxItemContextState {
    const context = useContext(ComboboxItemContext);
    if (!context) throw new Error("useComboboxItemContext must be used within a <ComboboxItem> component");
    return context;
}

// ---------------------------------------------------------------------------------------------------- //

interface ComboboxItemProps extends HTMLAttributes<HTMLElement> {
    value?: string;
    disabled?: boolean;
    textValue?: string;
    asChild?: boolean;
}

function ComboboxItem({ children, className, value, disabled, textValue, asChild, ...props }: ComboboxItemProps) {
    const {
        setOpen, setValue, toggleValue, setInputValue,
        value: currentValue, multiple,
        state, dispatch, registerItemLabel,
        highlightItemOnHover, filteredItems, filteredItemIds, itemLabels, itemLabelsRef,
        inputModifiedFlagRef,
    } = useComboboxContext();

    const ref = useRef<HTMLDivElement>(null);
    const textElementRef = useRef<HTMLElement>(null);
    const fallbackId = useId();
    const itemId = props.id ?? fallbackId;

    const selected = multiple
        ? (Array.isArray(currentValue) && value ? currentValue.includes(value) : false)
        : value === currentValue;

    const isFiltered = filteredItemIds.has(itemId);
    const itemIndex = filteredItems.findIndex(item => item.id === itemId);
    const highlighted = itemIndex >= 0 && state.cursor === itemIndex;

    const context: ComboboxItemContextState = { textElementRef, selected }

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

        const item: ComboboxItemEntry = {
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

        if (multiple) toggleValue(value);

        else {
            setValue(value);

            const resolvedTextValue = textValue ??
                itemLabels.get(value) ??
                itemLabelsRef.current.get(value) ??
                textElementRef?.current?.textContent ??
                ref?.current?.textContent ??
                value;

            setInputValue(resolvedTextValue);
            inputModifiedFlagRef.current = false;
            setOpen(false);
        }
    }, [disabled, value, multiple, setValue, toggleValue, setOpen, setInputValue, textValue, itemLabels, itemLabelsRef]);

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
        <ComboboxItemContext.Provider value={context}>
            <Component
                data-ui="combobox-item"
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
        </ComboboxItemContext.Provider>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface ComboboxItemTextProps extends HTMLAttributes<HTMLElement> {
    children?: string;
    asChild?: boolean;
}

function ComboboxItemText({ className, children, asChild, ...props }: ComboboxItemTextProps) {
    const { textElementRef } = useComboboxItemContext();

    const Component = asChild ? Slot : 'span';

    return (
        <Component
            data-ui="combobox-item-text"

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

interface ComboboxItemIndicatorProps extends HTMLAttributes<HTMLElement> {
    asChild?: boolean;
}

function ComboboxItemIndicator({ className, asChild, children, ...props }: ComboboxItemIndicatorProps) {
    const { selected } = useComboboxItemContext();
    if (!selected) return null;

    const Component = asChild ? Slot : 'span';

    return (
        <Component
            data-ui="combobox-item-indicator"

            className={cn(
                'w-fit [&>svg]:size-4 text-write shrink-0',
                className
            )}

            {...props}
        >
            {asChild ? children : (
                <svg
                    data-ui="combobox-item-indicator-icon"

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

interface ComboboxGroupContextState {
    groupId: string;
    labelElementRef: RefObject<HTMLElement | null>;
    hasVisibleItems: boolean;
}

const ComboboxGroupContext = createContext<ComboboxGroupContextState | null>(null);

function useComboboxGroupContext(): ComboboxGroupContextState {
    const context = useContext(ComboboxGroupContext);
    if (!context) throw new Error("useComboboxGroupContext must be used within a <ComboboxGroup> component");
    return context;
}

// ---------------------------------------------------------------------------------------------------- //

interface ComboboxGroupProps extends HTMLAttributes<HTMLElement> {
    asChild?: boolean;
}

function ComboboxGroup({ children, className, asChild, ...props }: ComboboxGroupProps) {
    const { filteredItemIds, open } = useComboboxContext();
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

            const items = groupRef.current.querySelectorAll('[data-ui="combobox-item"]');
            const visible = Array.from(items).some(item => {
                const itemId = item.getAttribute('id');
                return itemId && filteredItemIds.has(itemId);
            });

            setHasVisibleItems(visible);
        }, 0);

        return () => clearTimeout(timer);
    }, [open, filteredItemIds]);

    const context: ComboboxGroupContextState = { groupId, labelElementRef, hasVisibleItems }

    const Component = asChild ? Slot : 'div';

    return (
        <ComboboxGroupContext.Provider value={context}>
            <Component
                data-ui="combobox-group"
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
        </ComboboxGroupContext.Provider>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface ComboboxLabelProps extends HTMLAttributes<HTMLElement> {
    asChild?: boolean;
}

function ComboboxLabel({ children, className, asChild, ...props }: ComboboxLabelProps) {
    const { groupId, labelElementRef, hasVisibleItems } = useComboboxGroupContext();
    const labelId = props.id ?? `${groupId}-label`;

    const Component = asChild ? Slot : 'span';

    return (
        <Component
            data-ui="combobox-label"
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

interface ComboboxSeparatorProps extends HTMLAttributes<HTMLElement> {
    asChild?: boolean;
}

function ComboboxSeparator({ className, children, asChild, ...props }: ComboboxSeparatorProps) {
    const Component = asChild ? Slot : 'span';

    return (
        <Component
            data-ui="combobox-separator"

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

interface ComboboxScrollUpButtonProps extends HTMLAttributes<HTMLElement> {
    asChild?: boolean;
}

function ComboboxScrollUpButton({ className, asChild, children, ...props }: ComboboxScrollUpButtonProps) {
    const { viewportRef } = useComboboxContext();
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
            data-ui="combobox-scroll-up-button"

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
                    data-ui="combobox-scroll-up-icon"

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

interface ComboboxScrollDownButtonProps extends HTMLAttributes<HTMLElement> {
    asChild?: boolean;
}

function ComboboxScrollDownButton({ className, asChild, children, ...props }: ComboboxScrollDownButtonProps) {
    const { viewportRef } = useComboboxContext();
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
            data-ui="combobox-scroll-down-button"

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
                    data-ui="combobox-scroll-down-icon"

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
    Combobox,
    ComboboxTrigger,
    ComboboxInput,
    ComboboxValue,
    ComboboxChip,
    ComboboxTriggerIndicator,
    ComboboxClear,
    ComboboxPortal,
    ComboboxContent,
    ComboboxViewport,
    ComboboxEmpty,
    ComboboxItem,
    ComboboxItemText,
    ComboboxItemIndicator,
    ComboboxGroup,
    ComboboxLabel,
    ComboboxSeparator,
    ComboboxScrollUpButton,
    ComboboxScrollDownButton,
    type ComboboxProps,
    type ComboboxTriggerProps,
    type ComboboxInputProps,
    type ComboboxValueProps,
    type ComboboxChipProps,
    type ComboboxTriggerIndicatorProps,
    type ComboboxClearProps,
    type ComboboxPortalProps,
    type ComboboxContentProps,
    type ComboboxViewportProps,
    type ComboboxEmptyProps,
    type ComboboxItemProps,
    type ComboboxItemTextProps,
    type ComboboxItemIndicatorProps,
    type ComboboxGroupProps,
    type ComboboxLabelProps,
    type ComboboxSeparatorProps,
    type ComboboxScrollUpButtonProps,
    type ComboboxScrollDownButtonProps,
    type ComboboxActionsRef,
    type ComboboxFilterFunction,
}

// ---------------------------------------------------------------------------------------------------- //
