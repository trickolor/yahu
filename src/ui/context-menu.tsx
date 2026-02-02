import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useLayoutEffect,
    useState,
    useMemo,
    useRef,
    useId,
    type HTMLAttributes,
    type ReactNode,
    type RefObject,
} from "react";

import { createPortal } from "react-dom";

import {
    usePosition,
    type Padding,
    type Align,
    type Side,
    type Sticky,
    type Boundary,
} from "@/hooks/use-position";

import { useControllableState } from "@/hooks/use-controllable-state";
import { Slot } from "@/ui/slot";
import { cn } from "@/cn";

// ---------------------------------------------------------------------------------------------------- //

const ContextMenuActions = {
    None: -1,
    Open: 0,
    Close: 1,
    Select: 2,
    First: 3,
    Last: 4,
    Previous: 5,
    Next: 6,
    Type: 7,
} as const;

type ContextMenuAction = (typeof ContextMenuActions)[keyof typeof ContextMenuActions];

const getContextMenuAction = (
    event: React.KeyboardEvent,
    open: boolean,
    dir: "ltr" | "rtl"
): ContextMenuAction => {
    const { key, altKey, ctrlKey, metaKey } = event;

    const isTypeahead =
        ["Backspace", "Clear"].includes(key) ||
        (key.length === 1 && key !== " " && !altKey && !ctrlKey && !metaKey);

    if (!open) {
        if (["ArrowDown", "ArrowUp", "Enter", " "].includes(key)) return ContextMenuActions.Open;
        if (isTypeahead) return ContextMenuActions.Type;
        return ContextMenuActions.None;
    }

    switch (key) {
        case "Tab": return ContextMenuActions.None;
        case "Escape": return ContextMenuActions.Close;
        case "Enter": case " ": return ContextMenuActions.Select;
        case "ArrowDown": return ContextMenuActions.Next;
        case "ArrowUp": return ContextMenuActions.Previous;
        case "Home": return ContextMenuActions.First;
        case "End": return ContextMenuActions.Last;
        case "ArrowRight": return dir === "ltr" ? ContextMenuActions.None : ContextMenuActions.Previous;
        case "ArrowLeft": return dir === "ltr" ? ContextMenuActions.None : ContextMenuActions.Next;
        default: return isTypeahead ? ContextMenuActions.Type : ContextMenuActions.None;
    }
}

// ---------------------------------------------------------------------------------------------------- //

interface ContextMenuItemEntry {
    ref: RefObject<HTMLElement | null>;
    textValue: string;
    id: string;
}

interface ContextMenuContextState {
    open: boolean;
    modal: boolean;
    dir: "ltr" | "rtl";
    focusedItemId: string | null;
    typeaheadValue: string;
    openedWithKeyboard: boolean;

    triggerRef: RefObject<HTMLDivElement | null>;
    contentRef: RefObject<HTMLDivElement | null>;
    triggerId: string;
    contentId: string;
    mouseEvent: MouseEvent | null;

    onOpenChange: (open: boolean) => void;
    onOpenChangeWithKeyboard: (open: boolean) => void;
    setFocusedItemId: (id: string | null) => void;
    setMouseEvent: (event: MouseEvent | null) => void;
    registerItem: (id: string, ref: RefObject<HTMLElement | null>, textValue: string) => void;
    unregisterItem: (id: string) => void;
    getItemEntries: () => ContextMenuItemEntry[];
    getItemRef: (id: string) => RefObject<HTMLElement | null> | undefined;
    setTypeaheadValue: (value: string) => void;
    clearTypeahead: () => void;
}

const ContextMenuContext = createContext<ContextMenuContextState | null>(null);

function useContextMenuContext(): ContextMenuContextState {
    const context = useContext(ContextMenuContext);
    if (!context) throw new Error("useContextMenuContext hook must be used within ContextMenu component!");
    return context;
}

// ---------------------------------------------------------------------------------------------------- //

interface UseContextMenuItemOptions {
    disabled?: boolean;
    textValue?: string;
    children?: ReactNode;
}

interface UseContextMenuItemReturn {
    id: string;
    itemRef: RefObject<HTMLDivElement | null>;
    isFocused: boolean;
    tabIndex: 0 | -1;
    resolvedTextValue: string;

    focusHandlers: {
        onFocus: () => void;
        onMouseEnter: (event: React.MouseEvent<HTMLElement>) => void;
        onMouseLeave: (event: React.MouseEvent<HTMLElement>) => void;
    }
}

function useContextMenuItem({
    disabled = false,
    textValue,
    children,
}: UseContextMenuItemOptions): UseContextMenuItemReturn {
    const {
        focusedItemId,
        setFocusedItemId,
        registerItem,
        unregisterItem
    } = useContextMenuContext();

    const id = useId();
    const itemRef = useRef<HTMLDivElement>(null);

    const resolvedTextValue = useMemo(() => {
        if (textValue) return textValue;
        if (typeof children === "string") return children;
        return "";
    }, [textValue, children]);

    useLayoutEffect(() => {
        const finalTextValue = resolvedTextValue || itemRef.current?.textContent?.trim() || "";
        registerItem(id, itemRef, finalTextValue);
        return () => unregisterItem(id);
    }, [id, registerItem, unregisterItem, resolvedTextValue]);

    const isFocused = focusedItemId === id;
    const tabIndex = isFocused ? 0 : -1;

    const focusHandlers = useMemo(() => ({
        onFocus: () => setFocusedItemId(id),
        onMouseLeave: () => setFocusedItemId(null),

        onMouseEnter: () => {
            if (!disabled) {
                setFocusedItemId(id);
                itemRef.current?.focus({ preventScroll: true });
            }
        },

    }), [id, disabled, setFocusedItemId, itemRef]);

    return {
        id,
        itemRef,
        isFocused,
        tabIndex,
        resolvedTextValue,
        focusHandlers,
    }
}

// ---------------------------------------------------------------------------------------------------- //

interface ContextMenuProps {
    defaultOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    modal?: boolean;
    dir?: "ltr" | "rtl";
    children?: ReactNode;
}

function ContextMenu({
    defaultOpen = false,
    open,
    onOpenChange,
    modal = true,
    dir = "ltr",
    children,
}: ContextMenuProps) {
    const [currentOpen, setCurrentOpenInternal] = useControllableState({
        value: open,
        defaultValue: defaultOpen,
        onChange: onOpenChange,
    });

    const [focusedItemId, setFocusedItemId] = useState<string | null>(null);
    const [openedWithKeyboard, setOpenedWithKeyboard] = useState(false);
    const [typeaheadValue, setTypeaheadValue] = useState("");
    const [mouseEvent, setMouseEvent] = useState<MouseEvent | null>(null);

    const itemRefsMap = useRef<Map<string, RefObject<HTMLElement | null>>>(new Map());
    const typeaheadTimeoutRef = useRef<number | null>(null);
    const itemEntriesRef = useRef<ContextMenuItemEntry[]>([]);

    const triggerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    const triggerId = useId();
    const contentId = useId();

    const setCurrentOpen = useCallback((nextOpen: boolean) => {
        if (!nextOpen) setOpenedWithKeyboard(false);
        setCurrentOpenInternal(nextOpen);
    }, [setCurrentOpenInternal]);

    const setCurrentOpenWithKeyboard = useCallback((nextOpen: boolean) => {
        if (nextOpen) setOpenedWithKeyboard(true);
        setCurrentOpenInternal(nextOpen);
    }, [setCurrentOpenInternal]);

    const registerItem = useCallback((id: string, ref: RefObject<HTMLElement | null>, textValue: string) => {
        itemRefsMap.current.set(id, ref);

        const existingIndex = itemEntriesRef.current.findIndex((item) => item.id === id);

        if (existingIndex >= 0) itemEntriesRef.current[existingIndex] = { id, ref, textValue }
        else itemEntriesRef.current = [...itemEntriesRef.current, { id, ref, textValue }];
    }, []);

    const unregisterItem = useCallback((id: string) => {
        itemRefsMap.current.delete(id);
        itemEntriesRef.current = itemEntriesRef.current.filter((item) => item.id !== id);
    }, []);

    const getItemEntries = useCallback(() => itemEntriesRef.current, []);
    const getItemRef = useCallback((id: string) => itemRefsMap.current.get(id), []);

    const clearTypeahead = useCallback(() => {
        if (typeaheadTimeoutRef.current) {
            clearTimeout(typeaheadTimeoutRef.current);
            typeaheadTimeoutRef.current = null;
        }

        setTypeaheadValue("");
    }, []);

    useEffect(() => {
        if (currentOpen) return;
        setFocusedItemId(null);
        clearTypeahead();
    }, [currentOpen, clearTypeahead]);

    useEffect(() => {
        if (!currentOpen || !modal) return;

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const elementsToInert: Element[] = [];

        Array.from(document.body.children).forEach((child) => {
            if (
                child.hasAttribute("inert") ||
                child.contains(contentRef.current)
            ) return;

            child.setAttribute("inert", "");
            elementsToInert.push(child);
        });

        return () => {
            document.body.style.overflow = originalOverflow;
            elementsToInert.forEach((el) => { el.removeAttribute("inert") });
        }
    }, [currentOpen, modal]);

    const context = useMemo<ContextMenuContextState>(
        () => ({
            open: currentOpen,
            modal,
            dir,
            focusedItemId,
            typeaheadValue,
            openedWithKeyboard,
            triggerRef,
            contentRef,
            triggerId,
            contentId,
            mouseEvent,
            onOpenChange: setCurrentOpen,
            onOpenChangeWithKeyboard: setCurrentOpenWithKeyboard,
            setFocusedItemId,
            setMouseEvent,
            registerItem,
            unregisterItem,
            getItemEntries,
            getItemRef,
            setTypeaheadValue,
            clearTypeahead,
        }),
        [
            currentOpen,
            modal,
            dir,
            focusedItemId,
            typeaheadValue,
            openedWithKeyboard,
            triggerId,
            contentId,
            mouseEvent,
            setCurrentOpen,
            setCurrentOpenWithKeyboard,
            setMouseEvent,
            registerItem,
            unregisterItem,
            getItemEntries,
            getItemRef,
            clearTypeahead,
        ]
    );

    return (
        <ContextMenuContext.Provider data-ui="context-menu" value={context}>
            {children}
        </ContextMenuContext.Provider>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface ContextMenuTriggerProps extends HTMLAttributes<HTMLElement> {
    asChild?: boolean;
    disabled?: boolean;
}

function ContextMenuTrigger({
    asChild = false,
    className,
    children,

    onContextMenu,

    ...props
}: ContextMenuTriggerProps) {
    const {
        open,
        onOpenChange,
        triggerRef,
        contentId,
        triggerId,
        dir,
        setMouseEvent
    } = useContextMenuContext();

    const contextMenuHandler = useCallback((event: React.MouseEvent<HTMLElement>) => {
        if (props.disabled) {
            onContextMenu?.(event);
            return;
        }

        event.preventDefault();
        setMouseEvent?.(event.nativeEvent);
        onOpenChange(true);
        onContextMenu?.(event);
    }, [props.disabled, onOpenChange, onContextMenu, setMouseEvent]);

    const keyDownHandler = useCallback((event: React.KeyboardEvent<HTMLElement>) => {
        const action = getContextMenuAction(event, open, dir);

        if (action === ContextMenuActions.Open) {
            event.preventDefault();
            onOpenChange(true);
        }
    }, [open, onOpenChange, dir]);

    const Component = asChild ? Slot : "div";

    return (
        <Component
            data-ui="context-menu-trigger"
            data-state={open ? "open" : "closed"}

            aria-controls={open ? contentId : undefined}
            aria-haspopup="menu"
            aria-expanded={open}
            role="button"

            onContextMenu={contextMenuHandler}
            onKeyDown={keyDownHandler}

            className={className}
            ref={triggerRef}
            id={triggerId}

            {...props}
        >
            {children}
        </Component>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface ContextMenuPortalProps {
    container?: HTMLElement;
    children?: ReactNode;
}

function ContextMenuPortal({ children, container }: ContextMenuPortalProps) {
    const target = container || document.body;
    return createPortal(children, target);
}

// ---------------------------------------------------------------------------------------------------- //

interface ContextMenuContentProps extends HTMLAttributes<HTMLElement> {
    onInteractOutside?: (event: MouseEvent | FocusEvent) => void;
    onEscapeKeyDown?: (event: React.KeyboardEvent) => void;
    onPointerDownOutside?: (event: PointerEvent) => void;
    onFocusOutside?: (event: FocusEvent) => void;
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
    loop?: boolean;
    asChild?: boolean;
}

function ContextMenuContent({
    onPointerDownOutside,
    onInteractOutside,
    onCloseAutoFocus,
    onEscapeKeyDown,
    onFocusOutside,
    onKeyDown,

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
    loop = false,
    asChild = false,

    className,
    children,

    ...props
}: ContextMenuContentProps) {
    const {
        open,
        onOpenChange,
        contentRef,
        triggerRef,
        focusedItemId,
        setFocusedItemId,
        dir,
        typeaheadValue,
        setTypeaheadValue,
        clearTypeahead,
        getItemEntries,
        getItemRef,
        triggerId,
        contentId,
        openedWithKeyboard,
        mouseEvent,
    } = useContextMenuContext();

    const [isMounted, setIsMounted] = useState(open);

    const {
        top,
        left,
        actualSide,
        maxHeight,
        maxWidth,
        isPositioned,
        isReferenceHidden
    } = usePosition({
        relativeTo: mouseEvent || triggerRef,
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

    const typeaheadTimeoutRef = useRef<number | null>(null);

    useEffect(() => {
        return () => {
            if (typeaheadTimeoutRef.current)
                clearTimeout(typeaheadTimeoutRef.current);
        }
    }, []);

    useEffect(() => { if (open) setIsMounted(true) }, [open]);

    const animationEndHandler = useCallback((event: React.AnimationEvent<HTMLDivElement>) => {
        if (event.target === event.currentTarget && !open) {
            const element = event.currentTarget;
            element.style.display = "none";
            setIsMounted(false);
        }
    }, [open]);

    const getEnabledItems = useCallback((): string[] => {
        const content = contentRef.current;
        if (!content) return [];

        return getItemEntries().filter((entry) => {
            const element = entry.ref.current;
            if (!element) return false;

            const isInSubContent = element.closest("[data-ui='context-menu-sub-content']");
            if (isInSubContent) return false;
            if (!content.contains(element)) return false;

            return !(
                element.getAttribute("data-disabled") === "true" ||
                element.getAttribute("aria-disabled") === "true"
            );
        }).map((entry) => entry.id);
    }, [getItemEntries, contentRef]);

    const focusItem = useCallback((id: string) => {
        const ref = getItemRef(id);

        if (ref?.current) {
            ref.current.focus({ preventScroll: true });
            ref.current.scrollIntoView({ block: "nearest" });
            setFocusedItemId(id);
        }
    }, [getItemRef, setFocusedItemId]);

    const getTextValueForItem = useCallback((id: string): string => {
        const entries = getItemEntries();

        const entry = entries.find((e) => e.id === id);
        if (entry?.textValue) return entry.textValue;

        const ref = getItemRef(id);
        const element = ref?.current;
        if (!element) return "";

        return (
            element.getAttribute("data-text-value") ||
            element.textContent?.trim() ||
            ""
        );
    }, [getItemEntries, getItemRef]);

    const typeaheadHandler = useCallback((character: string) => {
        if (typeaheadTimeoutRef.current) clearTimeout(typeaheadTimeoutRef.current);

        const enabledItems = getEnabledItems();
        if (enabledItems.length === 0) return;

        const isRepeatedChar =
            character.toLowerCase() === typeaheadValue.toLowerCase() &&
            typeaheadValue.length === 1;

        if (isRepeatedChar) {
            const matchingItems = enabledItems.filter((id) => {
                const textVal = getTextValueForItem(id);
                return textVal.toLowerCase().startsWith(character.toLowerCase());
            });

            if (matchingItems.length > 0) {
                const currentMatchIndex = matchingItems.findIndex((id) => id === focusedItemId);
                const nextMatchIndex = (currentMatchIndex + 1) % matchingItems.length;
                focusItem(matchingItems[nextMatchIndex]);
            }

            setTypeaheadValue(character);
        }

        else {
            const newTypeaheadValue = typeaheadValue + character;
            setTypeaheadValue(newTypeaheadValue);

            const matchingItem = enabledItems.find((id) => {
                const textVal = getTextValueForItem(id);
                return textVal.toLowerCase().startsWith(newTypeaheadValue.toLowerCase());
            });

            if (matchingItem) focusItem(matchingItem);
        }

        typeaheadTimeoutRef.current = window.setTimeout(() => { clearTypeahead() }, 500);
    }, [
        typeaheadValue,
        setTypeaheadValue,
        getEnabledItems,
        getTextValueForItem,
        focusItem,
        clearTypeahead,
        focusedItemId,
    ]);

    const keyDownHandler = useCallback((event: React.KeyboardEvent<HTMLElement>) => {
        if (event.key === "Tab") {
            event.preventDefault();
            return;
        }

        const action = getContextMenuAction(event, open, dir);
        const enabledItems = getEnabledItems();

        if (action === ContextMenuActions.None) {
            onKeyDown?.(event);
            return;
        }

        event.preventDefault();

        switch (action) {
            case ContextMenuActions.Close:
                onEscapeKeyDown?.(event);
                onOpenChange(false);

                break;

            case ContextMenuActions.Select:
                if (focusedItemId) {
                    const ref = getItemRef(focusedItemId);
                    ref?.current?.click();
                }

                break;

            case ContextMenuActions.Next: {
                if (enabledItems.length === 0) break;

                if (!focusedItemId) {
                    focusItem(enabledItems[0]);
                    break;
                }

                const currentIndex = enabledItems.indexOf(focusedItemId);

                const nextIndex = currentIndex + 1 >= enabledItems.length
                    ? loop ? 0 : enabledItems.length - 1
                    : currentIndex + 1;

                focusItem(enabledItems[nextIndex]);

                break;
            }

            case ContextMenuActions.Previous: {
                if (enabledItems.length === 0) break;

                if (!focusedItemId) {
                    focusItem(enabledItems[enabledItems.length - 1]);
                    break;
                }

                const currentIndex = enabledItems.indexOf(focusedItemId);

                const nextIndex = currentIndex - 1 < 0
                    ? loop ? enabledItems.length - 1 : 0
                    : currentIndex - 1;

                focusItem(enabledItems[nextIndex]);

                break;
            }

            case ContextMenuActions.First:
                if (enabledItems.length > 0) focusItem(enabledItems[0]);

                break;

            case ContextMenuActions.Last:
                if (enabledItems.length > 0) focusItem(enabledItems[enabledItems.length - 1]);

                break;

            case ContextMenuActions.Type:
                typeaheadHandler(event.key);

                break;
        }

        onKeyDown?.(event);
    }, [
        open,
        dir,
        getEnabledItems,
        focusedItemId,
        loop,
        focusItem,
        typeaheadHandler,
        onOpenChange,
        onEscapeKeyDown,
        getItemRef,
        onKeyDown,
    ]);

    useEffect(() => {
        if (!open) return;

        const outsideClickHandler = (event: MouseEvent) => {
            if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
                onPointerDownOutside?.(event as PointerEvent);
                onInteractOutside?.(event);
                onOpenChange(false);
            }
        }

        const focusHandlerOutside = (event: FocusEvent) => {
            if (contentRef.current && !contentRef.current.contains(event.target as Node))
                onFocusOutside?.(event);
        }

        document.addEventListener("mousedown", outsideClickHandler);
        document.addEventListener("focusin", focusHandlerOutside);

        return () => {
            document.removeEventListener("mousedown", outsideClickHandler);
            document.removeEventListener("focusin", focusHandlerOutside);
        }
    }, [
        open,
        contentRef,
        onPointerDownOutside,
        onInteractOutside,
        onFocusOutside,
        onOpenChange,
    ]);

    const needsFocusOnMount = useRef(false);

    useEffect(() => {
        if (open && !isMounted) {
            // Menu is opening - mark that we need to focus when mounted
            needsFocusOnMount.current = true;
        }
    }, [open, isMounted]);

    // Focus management: focus the content when it becomes mounted
    // This ensures focus moves even when switching menus via pointer hover
    useEffect(() => {
        if (!isMounted || !needsFocusOnMount.current) return;
        needsFocusOnMount.current = false;

        // Use requestAnimationFrame to ensure the DOM element is ready
        const frameId = requestAnimationFrame(() => {
            if (contentRef.current) {
                contentRef.current.focus();

                if (openedWithKeyboard) {
                    const enabledItems = getEnabledItems();
                    if (enabledItems.length > 0) focusItem(enabledItems[0]);
                }
            }
        });

        return () => cancelAnimationFrame(frameId);
    }, [isMounted, contentRef, openedWithKeyboard, getEnabledItems, focusItem]);

    if (!isMounted && !forceMount) return null;

    const Component = asChild ? Slot : "div";

    return (
        <Component
            data-ui="context-menu-content"
            data-side={actualSide}
            data-state={open ? "open" : "closed"}

            aria-labelledby={triggerId}
            aria-orientation="vertical"
            role="menu"

            onAnimationEnd={animationEndHandler}
            onKeyDown={keyDownHandler}

            ref={contentRef}
            id={contentId}
            tabIndex={-1}

            style={{
                position: "fixed",
                top: `${top}px`,
                left: `${left}px`,
                zIndex: 50,
                maxHeight: maxHeight ? `${maxHeight}px` : undefined,
                maxWidth: maxWidth ? `${maxWidth}px` : undefined,
                overflowY: maxHeight ? "auto" : undefined,
                overflowX: maxWidth ? "auto" : undefined,
                visibility: isPositioned && !isReferenceHidden ? "visible" : "hidden",
            }}

            className={cn(
                "min-w-64 w-fit rounded border border-bound bg-surface p-1 shadow",
                "data-[state='open']:animate-in data-[state='open']:zoom-in-95 data-[state='open']:fade-in-0",
                "data-[state='closed']:animate-out data-[state='closed']:zoom-out-95 data-[state=closed]:fade-out-0",
                "data-[side=bottom]:slide-in-from-top-2",
                "data-[side=left]:slide-in-from-right-2",
                "data-[side=right]:slide-in-from-left-2",
                "data-[side=top]:slide-in-from-bottom-2",
                "focus:outline-none",
                className
            )}

            {...props}
        >
            {children}
        </Component>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface ContextMenuItemProps extends Omit<HTMLAttributes<HTMLElement>, "onSelect"> {
    onSelect?: (event: Event) => void;
    textValue?: string;
    disabled?: boolean;
    asChild?: boolean;
}

function ContextMenuItem({
    onSelect,
    onKeyDown,
    onMouseEnter,
    onMouseLeave,
    onClick,

    disabled = false,
    textValue,
    asChild = false,
    className,
    children,

    ...props
}: ContextMenuItemProps) {
    const { onOpenChange } = useContextMenuContext();

    const {
        itemRef,
        isFocused,
        tabIndex,
        resolvedTextValue,
        focusHandlers,
    } = useContextMenuItem({ disabled, textValue, children });

    const clickHandler = useCallback((event: React.MouseEvent<HTMLElement>) => {
        if (disabled) return;

        onSelect?.(event.nativeEvent);
        onClick?.(event);
        onOpenChange(false);
    }, [disabled, onSelect, onClick, onOpenChange]);

    const keyDownHandler = useCallback((event: React.KeyboardEvent<HTMLElement>) => {
        if (disabled) return;

        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();

            onSelect?.(event.nativeEvent);
            onOpenChange(false);
        }

        onKeyDown?.(event);
    }, [disabled, onSelect, onOpenChange, onKeyDown]);

    const mouseEnterHandler = useCallback((event: React.MouseEvent<HTMLElement>) => {
        focusHandlers.onMouseEnter(event);
        onMouseEnter?.(event);
    }, [focusHandlers, onMouseEnter]);

    const mouseLeaveHandler = useCallback((event: React.MouseEvent<HTMLElement>) => {
        focusHandlers.onMouseLeave(event);
        onMouseLeave?.(event);
    }, [focusHandlers, onMouseLeave]);

    const pointerMoveHandler = useCallback(() => {
        if (!disabled) {
            itemRef.current?.focus({ preventScroll: true });
        }
    }, [disabled, itemRef]);

    const Component = asChild ? Slot : "div";

    return (
        <Component
            data-ui="context-menu-item"
            data-text-value={resolvedTextValue.toLowerCase()}
            data-highlighted={isFocused || undefined}
            data-disabled={disabled || undefined}

            aria-disabled={disabled || undefined}
            role="menuitem"

            tabIndex={tabIndex}
            ref={itemRef}

            onPointerMove={pointerMoveHandler}
            onMouseEnter={mouseEnterHandler}
            onMouseLeave={mouseLeaveHandler}
            onFocus={focusHandlers.onFocus}
            onKeyDown={keyDownHandler}
            onClick={clickHandler}

            className={cn(
                "relative flex items-center gap-2 rounded px-2 py-1.5 text-sm text-write cursor-pointer select-none outline-none transition-colors",
                "data-[disabled=true]:opacity-50 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:pointer-events-none",
                "data-[highlighted=true]:bg-muted-surface",
                className
            )}

            {...props}
        >
            {children}
        </Component>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface ContextMenuGroupContextState {
    labelElementRef: RefObject<HTMLDivElement | null>;
    groupId: string;
}

const ContextMenuGroupContext = createContext<ContextMenuGroupContextState | null>(null);

function useContextMenuGroupContext(): ContextMenuGroupContextState {
    const context = useContext(ContextMenuGroupContext);
    if (!context) throw new Error("useContextMenuGroupContext hook must be used within ContextMenuGroup component!");
    return context;
}

// ---------------------------------------------------------------------------------------------------- //

interface ContextMenuGroupProps extends HTMLAttributes<HTMLElement> {
    asChild?: boolean;
}

function ContextMenuGroup({ className, children, asChild = false, ...props }: ContextMenuGroupProps) {
    const fallbackId = useId();
    const groupId = props.id ?? fallbackId;

    const labelElementRef = useRef<HTMLDivElement>(null);
    const labeledBy = labelElementRef?.current?.id ?? `${groupId}-label`;

    const context = useMemo<ContextMenuGroupContextState>(() => ({
        labelElementRef,
        groupId,
    }), [groupId]);

    const Component = asChild ? Slot : "div";

    return (
        <ContextMenuGroupContext.Provider value={context}>
            <Component
                data-ui="context-menu-group"

                aria-labelledby={labeledBy}
                role="group"

                className={cn("flex flex-col", className)}
                id={groupId}

                {...props}
            >
                {children}
            </Component>
        </ContextMenuGroupContext.Provider>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface ContextMenuLabelProps extends HTMLAttributes<HTMLElement> {
    asChild?: boolean;
}

function ContextMenuLabel({ className, children, id, asChild = false, ...props }: ContextMenuLabelProps) {
    const { labelElementRef, groupId } = useContextMenuGroupContext();
    const fallbackId = useId();

    const labelId = id ?? (groupId ? `${groupId}-label` : fallbackId);

    const Component = asChild ? Slot : "div";

    return (
        <Component
            data-ui="context-menu-label"

            role="presentation"

            ref={labelElementRef}
            id={labelId}

            className={cn("px-2 py-1.5 text-xs font-semibold text-muted-write", className)}

            {...props}
        >
            {children}
        </Component>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface ContextMenuCheckboxItemContextState {
    checked: boolean | "indeterminate";
}

const ContextMenuCheckboxItemContext = createContext<ContextMenuCheckboxItemContextState | null>(null);

// ---------------------------------------------------------------------------------------------------- //

interface ContextMenuCheckboxItemProps extends Omit<HTMLAttributes<HTMLElement>, "onSelect"> {
    onSelect?: (event: Event) => void;
    onCheckedChange?: (checked: boolean) => void;

    disabled?: boolean;
    textValue?: string;
    checked?: boolean | "indeterminate";
    asChild?: boolean;
}

function ContextMenuCheckboxItem({
    onSelect,
    onCheckedChange,
    disabled = false,
    textValue,
    checked = false,
    asChild = false,
    className,
    children,
    onClick,
    onKeyDown,
    onMouseEnter,
    onMouseLeave,
    ...props
}: ContextMenuCheckboxItemProps) {
    const { onOpenChange } = useContextMenuContext();

    const {
        itemRef,
        isFocused,
        tabIndex,
        resolvedTextValue,
        focusHandlers
    } = useContextMenuItem({ disabled, textValue, children });

    const clickHandler = useCallback((event: React.MouseEvent<HTMLElement>) => {
        if (disabled) return;
        const newChecked = checked !== true;

        onCheckedChange?.(newChecked);
        onSelect?.(event.nativeEvent);
        onClick?.(event);
        onOpenChange(false);
    }, [disabled, checked, onCheckedChange, onSelect, onClick, onOpenChange]);

    const keyDownHandler = useCallback((event: React.KeyboardEvent<HTMLElement>) => {
        if (disabled) return;

        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            const newChecked = checked !== true;

            onCheckedChange?.(newChecked);
            onSelect?.(event.nativeEvent);
            onOpenChange(false);
        }

        onKeyDown?.(event);
    }, [disabled, checked, onCheckedChange, onSelect, onOpenChange, onKeyDown]);

    const context = useMemo<ContextMenuCheckboxItemContextState>(() => ({
        checked
    }), [checked]);

    const checkedDataAttribute = checked === true
        ? "checked"
        : checked === "indeterminate" ? "indeterminate" : "unchecked";

    const ariaChecked = checked === "indeterminate" ? "mixed" : checked;

    const mouseEnterHandler = useCallback((event: React.MouseEvent<HTMLElement>) => {
        focusHandlers.onMouseEnter(event);
        onMouseEnter?.(event);
    }, [focusHandlers, onMouseEnter]);

    const mouseLeaveHandler = useCallback((event: React.MouseEvent<HTMLElement>) => {
        focusHandlers.onMouseLeave(event);
        onMouseLeave?.(event);
    }, [focusHandlers, onMouseLeave]);

    const pointerMoveHandler = useCallback(() => {
        if (!disabled) {
            itemRef.current?.focus({ preventScroll: true });
        }
    }, [disabled, itemRef]);

    const Component = asChild ? Slot : "div";

    return (
        <ContextMenuCheckboxItemContext.Provider value={context}>
            <Component
                data-ui="context-menu-checkbox-item"
                data-disabled={disabled || undefined}
                data-highlighted={isFocused || undefined}
                data-checked={checkedDataAttribute}
                data-text-value={resolvedTextValue.toLowerCase()}

                aria-checked={ariaChecked}
                role="menuitemcheckbox"

                tabIndex={tabIndex}
                ref={itemRef}

                onPointerMove={pointerMoveHandler}
                onMouseEnter={mouseEnterHandler}
                onMouseLeave={mouseLeaveHandler}
                onFocus={focusHandlers.onFocus}
                onKeyDown={keyDownHandler}
                onClick={clickHandler}

                className={cn(
                    "relative flex items-center gap-2 rounded pl-8 pr-2 py-1.5 text-sm text-write cursor-pointer select-none outline-none",
                    "data-[disabled=true]:opacity-50 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:pointer-events-none",
                    "data-[highlighted=true]:bg-muted-surface",
                    className
                )}

                {...props}
            >
                {children}
            </Component>
        </ContextMenuCheckboxItemContext.Provider>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface ContextMenuCheckboxItemIndicatorProps extends HTMLAttributes<HTMLElement> {
    forceMount?: boolean;
    asChild?: boolean;
}

function ContextMenuCheckboxItemIndicator({ className, forceMount = false, asChild = false, ...props }: ContextMenuCheckboxItemIndicatorProps) {
    const context = useContext(ContextMenuCheckboxItemContext);

    const shouldShow = context?.checked === true || context?.checked === "indeterminate";

    if (!shouldShow && !forceMount) return null;

    const Component = asChild ? Slot : "span";

    return (
        <Component
            data-ui="context-menu-checkbox-item-indicator"
            data-state={context?.checked === true ? "checked" : context?.checked === "indeterminate" ? "indeterminate" : "unchecked"}
            aria-hidden
            className={cn('absolute left-2 w-fit [&>svg]:size-4 text-write shrink-0', className)}
            {...props}
        >
            <svg
                data-ui="context-menu-checkbox-item-indicator-icon"
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
        </Component>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface ContextMenuRadioGroupContextState {
    onValueChange: (value: string) => void;
    value: string | null;
}

const ContextMenuRadioGroupContext = createContext<ContextMenuRadioGroupContextState | null>(null);

function useContextMenuRadioGroupContext(): ContextMenuRadioGroupContextState {
    const context = useContext(ContextMenuRadioGroupContext);
    if (!context) throw new Error("useContextMenuRadioGroupContext hook must be used within ContextMenuRadioGroup component!");
    return context;
}

// ---------------------------------------------------------------------------------------------------- //

interface ContextMenuRadioGroupProps extends HTMLAttributes<HTMLElement> {
    onValueChange?: (value: string) => void;
    value?: string;
    asChild?: boolean;
}

function ContextMenuRadioGroup({
    value,
    onValueChange,
    asChild = false,
    className,
    children,
    ...props
}: ContextMenuRadioGroupProps) {

    const [currentValue, setCurrentValue] = useControllableState({
        value,
        defaultValue: "",
        onChange: onValueChange,
    });

    const context = useMemo<ContextMenuRadioGroupContextState>(() => ({
        value: currentValue || null,
        onValueChange: setCurrentValue,
    }), [currentValue, setCurrentValue]);

    const Component = asChild ? Slot : "div";

    return (
        <ContextMenuRadioGroupContext.Provider value={context}>
            <Component
                data-ui="context-menu-radio-group"

                className={cn("flex flex-col", className)}
                role="group"

                {...props}
            >
                {children}
            </Component>
        </ContextMenuRadioGroupContext.Provider>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface ContextMenuRadioItemContextState {
    checked: boolean;
}

const ContextMenuRadioItemContext = createContext<ContextMenuRadioItemContextState | null>(null);

// ---------------------------------------------------------------------------------------------------- //

interface ContextMenuRadioItemProps extends Omit<HTMLAttributes<HTMLElement>, "onSelect"> {
    onSelect?: (event: Event) => void;
    disabled?: boolean;
    textValue?: string;
    value?: string;
    asChild?: boolean;
}

function ContextMenuRadioItem({
    onSelect,
    disabled = false,
    textValue,
    value,
    asChild = false,
    className,
    children,
    onClick,
    onKeyDown,
    onMouseEnter,
    onMouseLeave,
    ...props
}: ContextMenuRadioItemProps) {
    const { onOpenChange } = useContextMenuContext();
    const { value: groupValue, onValueChange } = useContextMenuRadioGroupContext();

    const {
        itemRef,
        isFocused,
        tabIndex,
        resolvedTextValue,
        focusHandlers
    } = useContextMenuItem({ disabled, textValue, children });

    const checkedState = value !== undefined && groupValue === value;

    const clickHandler = useCallback((event: React.MouseEvent<HTMLElement>) => {
        if (disabled || value === undefined) return;

        onValueChange(value);
        onSelect?.(event.nativeEvent);
        onClick?.(event);
        onOpenChange(false);
    }, [disabled, value, onValueChange, onSelect, onClick, onOpenChange]);

    const keyDownHandler = useCallback((event: React.KeyboardEvent<HTMLElement>) => {
        if (disabled || value === undefined) return;

        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();

            onValueChange(value);
            onSelect?.(event.nativeEvent);
            onOpenChange(false);
        }

        onKeyDown?.(event);
    }, [disabled, value, onValueChange, onSelect, onOpenChange, onKeyDown]);

    const contextValue = useMemo<ContextMenuRadioItemContextState>(() => ({
        checked: checkedState,
    }), [checkedState]);

    const mouseEnterHandler = useCallback((event: React.MouseEvent<HTMLElement>) => {
        focusHandlers.onMouseEnter(event);
        onMouseEnter?.(event);
    }, [focusHandlers, onMouseEnter]);

    const mouseLeaveHandler = useCallback((event: React.MouseEvent<HTMLElement>) => {
        focusHandlers.onMouseLeave(event);
        onMouseLeave?.(event);
    }, [focusHandlers, onMouseLeave]);

    const pointerMoveHandler = useCallback(() => {
        if (!disabled) {
            itemRef.current?.focus({ preventScroll: true });
        }
    }, [disabled, itemRef]);

    const Component = asChild ? Slot : "div";

    return (
        <ContextMenuRadioItemContext.Provider value={contextValue}>
            <Component
                data-ui="context-menu-radio-item"
                data-text-value={resolvedTextValue.toLowerCase()}
                data-highlighted={isFocused || undefined}
                data-disabled={disabled || undefined}
                data-checked={checkedState || undefined}


                aria-checked={checkedState}
                role="menuitemradio"

                tabIndex={tabIndex}
                ref={itemRef}

                onPointerMove={pointerMoveHandler}
                onMouseEnter={mouseEnterHandler}
                onMouseLeave={mouseLeaveHandler}
                onFocus={focusHandlers.onFocus}
                onKeyDown={keyDownHandler}
                onClick={clickHandler}

                className={cn(
                    "relative flex items-center gap-2 rounded pl-8 pr-2 py-1.5 text-sm text-write cursor-pointer select-none outline-none",
                    "data-[disabled=true]:opacity-50 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:pointer-events-none",
                    "data-[highlighted=true]:bg-muted-surface",
                    className
                )}

                {...props}
            >
                {children}
            </Component>
        </ContextMenuRadioItemContext.Provider>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface ContextMenuRadioItemIndicatorProps extends HTMLAttributes<HTMLElement> {
    forceMount?: boolean;
    asChild?: boolean;
}

function ContextMenuRadioItemIndicator({ className, forceMount = false, asChild = false, ...props }: ContextMenuRadioItemIndicatorProps) {
    const context = useContext(ContextMenuRadioItemContext);

    const shouldShow = context?.checked === true;
    if (!shouldShow && !forceMount) return null;

    const Component = asChild ? Slot : "span";

    return (
        <Component
            data-ui="context-menu-radio-item-indicator"
            data-state={context?.checked ? "checked" : "unchecked"}

            aria-hidden

            className={cn('absolute left-3 w-fit size-2 rounded-full bg-write shrink-0', className)}

            {...props}
        />
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface ContextMenuSeparatorProps extends HTMLAttributes<HTMLElement> {
    asChild?: boolean;
}

function ContextMenuSeparator({ className, asChild = false, ...props }: ContextMenuSeparatorProps) {
    const Component = asChild ? Slot : "span";

    return (
        <Component
            data-ui="context-menu-separator"

            aria-orientation="horizontal"
            role="separator"

            className={cn("block h-px bg-muted-bound my-1 -mx-1", className)}

            {...props}
        />
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface ContextMenuSubContextState {
    open: boolean;
    openedWithKeyboard: boolean;
    onOpenChange: (open: boolean) => void;
    onOpenChangeWithKeyboard: (open: boolean) => void;
    subTriggerRef: RefObject<HTMLElement | null>;
    subContentRef: RefObject<HTMLElement | null>;
    subTriggerId: string;
    subContentId: string;
}

const ContextMenuSubContext = createContext<ContextMenuSubContextState | null>(null);

function useContextMenuSubContext(): ContextMenuSubContextState {
    const context = useContext(ContextMenuSubContext);
    if (!context) throw new Error("useContextMenuSubContext hook must be used within ContextMenuSub component!");
    return context;
}

// ---------------------------------------------------------------------------------------------------- //

interface ContextMenuSubProps {
    onOpenChange?: (open: boolean) => void;
    defaultOpen?: boolean;
    open?: boolean;

    children?: ReactNode;
}

function ContextMenuSub({ children }: ContextMenuSubProps) {
    const { open: parentOpen } = useContextMenuContext();

    const [openedWithKeyboard, setOpenedWithKeyboard] = useState(false);
    const [open, setOpenInternal] = useState(false);

    const subTriggerRef = useRef<HTMLElement>(null);
    const subContentRef = useRef<HTMLElement>(null);

    const subTriggerId = useId();
    const subContentId = useId();

    useEffect(() => {
        if (!parentOpen && open) {
            setOpenInternal(false);
            setOpenedWithKeyboard(false);
        }
    }, [parentOpen, open]);

    const setOpen = useCallback((nextOpen: boolean) => {
        if (!nextOpen) setOpenedWithKeyboard(false);
        setOpenInternal(nextOpen);
    }, []);

    const setOpenWithKeyboard = useCallback((nextOpen: boolean) => {
        if (nextOpen) setOpenedWithKeyboard(true);
        setOpenInternal(nextOpen);
    }, []);

    const context = useMemo<ContextMenuSubContextState>(() => ({
        open,
        openedWithKeyboard,
        onOpenChange: setOpen,
        onOpenChangeWithKeyboard: setOpenWithKeyboard,
        subTriggerRef,
        subContentRef,
        subTriggerId,
        subContentId,
    }), [open, openedWithKeyboard, setOpen, setOpenWithKeyboard, subTriggerId, subContentId]);

    return (
        <ContextMenuSubContext.Provider value={context}>
            {children}
        </ContextMenuSubContext.Provider>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface ContextMenuSubTriggerProps extends HTMLAttributes<HTMLElement> {
    textValue?: string;
    disabled?: boolean;
    asChild?: boolean;
}

function ContextMenuSubTrigger({
    className,
    children,
    onKeyDown,
    onMouseEnter,
    onMouseLeave,
    textValue,
    disabled = false,
    asChild = false,
    ...props
}: ContextMenuSubTriggerProps) {
    const {
        open,
        onOpenChange,
        onOpenChangeWithKeyboard,
        subTriggerRef,
        subContentRef,
        subContentId,
    } = useContextMenuSubContext();

    const {
        itemRef,
        isFocused,
        tabIndex,
        resolvedTextValue,
        focusHandlers,
        id: itemId,
    } = useContextMenuItem({ disabled, textValue, children });

    const { dir, focusedItemId, getItemRef } = useContextMenuContext();

    const closeTimeoutRef = useRef<number | null>(null);

    useLayoutEffect(() => {
        subTriggerRef.current = itemRef.current;
    }, [subTriggerRef, itemRef]);

    useEffect(() => {
        return () => { if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current) }
    }, []);

    useEffect(() => {
        if (!open) return;
        if (isFocused) return;

        const subContent = subContentRef.current;
        if (!subContent) {
            onOpenChange(false);
            return;
        }

        // Helper to check if an element is inside a nested submenu of this submenu
        const isInNestedSubContent = (element: Element | null): boolean => {
            if (!element) return false;

            // Find the closest context-menu-sub-content
            const closestSubContent = element.closest("[data-ui='context-menu-sub-content']");
            if (!closestSubContent) return false;

            // If it's our own sub-content, it's not "nested"
            if (closestSubContent === subContent) return false;

            // Check if this sub-content's trigger is inside our sub-content
            // by looking for the sub-trigger that controls it
            const subContentId = closestSubContent.getAttribute("id");
            if (!subContentId) return false;

            const triggerForNestedSub = document.querySelector(`[aria-controls='${subContentId}']`);
            return triggerForNestedSub ? subContent.contains(triggerForNestedSub) : false;
        }

        // Check if focus moved to an item outside the sub-content
        if (focusedItemId && focusedItemId !== itemId) {
            const focusedRef = getItemRef(focusedItemId);
            const focusedElement = focusedRef?.current;

            // If the focused item is not inside sub-content and not in a nested submenu, close
            if (focusedElement && !subContent.contains(focusedElement) && !isInNestedSubContent(focusedElement)) {
                onOpenChange(false);
                return;
            }
        }

        // Fallback: check active element
        const activeElement = document.activeElement;
        if (activeElement && !subContent.contains(activeElement) && !isInNestedSubContent(activeElement)) {
            onOpenChange(false);
        }
    }, [isFocused, open, subContentRef, onOpenChange, focusedItemId, itemId, getItemRef]);

    const keyDownHandler = useCallback((event: React.KeyboardEvent<HTMLElement>) => {
        if (disabled) return;

        const openKey = dir === "ltr" ? "ArrowRight" : "ArrowLeft";

        if ([openKey, "Enter", " "].includes(event.key)) {
            event.preventDefault();
            event.stopPropagation();

            if (open) {
                const subContent = subContentRef.current;
                if (!subContent) return;

                subContent.querySelector<HTMLElement>("[role='menuitem']:not([data-disabled='true'])")?.focus();
            } else onOpenChangeWithKeyboard(true);
        }

        onKeyDown?.(event);
    }, [disabled, dir, open, subContentRef, onOpenChangeWithKeyboard, onKeyDown]);

    const mouseEnterHandler = useCallback((event: React.MouseEvent<HTMLElement>) => {
        if (disabled) return;

        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
            closeTimeoutRef.current = null;
        }

        onMouseEnter?.(event);
    }, [disabled, onMouseEnter]);

    const handlePointerMove = useCallback(() => {
        if (disabled) return;

        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
            closeTimeoutRef.current = null;
        }

        // Close sibling submenus in the parent content
        const parentContent = itemRef.current?.closest("[data-ui='context-menu-content'], [data-ui='context-menu-sub-content']");
        if (parentContent) {
            const openSiblingTriggers = parentContent.querySelectorAll<HTMLElement>(
                ":scope > [data-ui='context-menu-sub-trigger'][data-state='open']"
            );

            for (const trigger of openSiblingTriggers)
                if (trigger !== itemRef.current) trigger.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
        }

        // Close nested submenus if our submenu is already open
        if (open && subContentRef.current) {
            const nestedOpenTriggers = subContentRef.current.querySelectorAll<HTMLElement>(
                ":scope > [data-ui='context-menu-sub-trigger'][data-state='open']"
            );

            for (const trigger of nestedOpenTriggers)
                trigger.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
        }

        itemRef.current?.focus({ preventScroll: true });
        onOpenChange(true);
    }, [disabled, open, subContentRef, onOpenChange, itemRef]);

    const mouseLeaveHandler = useCallback((event: React.MouseEvent<HTMLElement>) => {
        closeTimeoutRef.current = window.setTimeout(() => {
            const subContent = subContentRef.current;
            const mouseX = (event.nativeEvent as MouseEvent).clientX;
            const mouseY = (event.nativeEvent as MouseEvent).clientY;

            // Check if mouse is over the sub-content
            if (subContent) {
                const rect = subContent.getBoundingClientRect();
                const isOverContent =
                    mouseX >= rect.left &&
                    mouseX <= rect.right &&
                    mouseY >= rect.top &&
                    mouseY <= rect.bottom;

                if (isOverContent) return;

                // Check if mouse is over any nested sub-content
                const nestedSubTriggers = subContent.querySelectorAll("[data-ui='context-menu-sub-trigger'][data-state='open']");

                for (const nestedTrigger of nestedSubTriggers) {
                    const nestedContentId = nestedTrigger.getAttribute("aria-controls");
                    if (!nestedContentId) continue;

                    const nestedContent = document.getElementById(nestedContentId);
                    if (!nestedContent) continue;

                    const nestedRect = nestedContent.getBoundingClientRect();
                    const isOverNestedContent =
                        mouseX >= nestedRect.left &&
                        mouseX <= nestedRect.right &&
                        mouseY >= nestedRect.top &&
                        mouseY <= nestedRect.bottom;

                    if (isOverNestedContent) return;
                }
            }

            onOpenChange(false);
        }, 100);

        onMouseLeave?.(event);
    }, [subContentRef, onOpenChange, onMouseLeave]);

    const highlightedState = isFocused || open;

    const Component = asChild ? Slot : "div";

    return (
        <Component
            data-ui="context-menu-sub-trigger"
            data-text-value={resolvedTextValue.toLowerCase()}
            data-highlighted={highlightedState || undefined}
            data-disabled={disabled || undefined}
            data-state={open ? "open" : "closed"}

            ref={itemRef}
            tabIndex={tabIndex}

            aria-controls={open ? subContentId : undefined}
            aria-disabled={disabled || undefined}
            aria-expanded={open}
            aria-haspopup="menu"
            role="menuitem"

            onPointerMove={handlePointerMove}
            onMouseLeave={mouseLeaveHandler}
            onMouseEnter={mouseEnterHandler}
            onFocus={focusHandlers.onFocus}
            onKeyDown={keyDownHandler}

            className={cn(
                "relative flex items-center gap-2 rounded px-2 py-1.5 text-sm text-write cursor-pointer select-none outline-none",
                "data-[disabled=true]:opacity-50 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:pointer-events-none",
                "data-[state=open]:bg-muted-surface data-[highlighted=true]:bg-muted-surface",
                className
            )}

            {...props}
        >
            {children}
        </Component>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface ContextMenuSubTriggerIndicatorProps extends HTMLAttributes<HTMLElement> {
    asChild?: boolean;
}

function ContextMenuSubTriggerIndicator({ className, asChild = false, ...props }: ContextMenuSubTriggerIndicatorProps) {
    const Component = asChild ? Slot : "span";

    return (
        <Component
            data-ui="context-menu-sub-trigger-indicator"
            aria-hidden
            className={cn('ml-auto w-fit [&>svg]:size-4 text-write shrink-0', className)}
            {...props}
        >
            <svg
                data-ui="context-menu-sub-trigger-indicator-icon"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
            >
                <path
                    d="M8.29289 5.29289C8.68342 4.90237 9.31658 4.90237 9.70711 5.29289L15.7071 11.2929C16.0976 11.6834 16.0976 12.3166 15.7071 12.7071L9.70711 18.7071C9.31658 19.0976 8.68342 19.0976 8.29289 18.7071C7.90237 18.3166 7.90237 17.6834 8.29289 17.2929L13.5858 12L8.29289 6.70711C7.90237 6.31658 7.90237 5.68342 8.29289 5.29289Z"
                    fill="currentColor"
                    fillRule="evenodd"
                    clipRule="evenodd"
                />
            </svg>
        </Component>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface ContextMenuSubContentProps extends HTMLAttributes<HTMLElement> {
    onEscapeKeyDown?: (event: React.KeyboardEvent) => void;
    onPointerDownOutside?: (event: PointerEvent) => void;
    onFocusOutside?: (event: FocusEvent) => void;
    onInteractOutside?: (event: MouseEvent | FocusEvent) => void;

    loop?: boolean;
    forceMount?: boolean;
    sideOffset?: number;
    alignOffset?: number;
    avoidCollisions?: boolean;
    collisionBoundary?: Boundary;
    collisionPadding?: Padding;
    sticky?: Sticky;
    hideWhenDetached?: boolean;
    asChild?: boolean;
}

function ContextMenuSubContent({
    className,
    children,
    forceMount = false,
    loop = false,
    sideOffset = 0,
    alignOffset = -4,
    avoidCollisions = true,
    collisionBoundary = [],
    collisionPadding = 8,
    sticky = "partial",
    hideWhenDetached = false,
    asChild = false,
    onKeyDown,
    onMouseEnter,
    onMouseLeave,
    onEscapeKeyDown,
    onPointerDownOutside,
    onFocusOutside,
    onInteractOutside,
    ...props
}: ContextMenuSubContentProps) {
    const {
        open,
        openedWithKeyboard,
        onOpenChange,
        subTriggerRef,
        subContentRef,
        subTriggerId,
        subContentId,
    } = useContextMenuSubContext();

    const {
        dir,
        focusedItemId,
        setFocusedItemId,
        getItemEntries,
        getItemRef,
    } = useContextMenuContext();

    const [isMounted, setIsMounted] = useState(open);
    const [subFocusedItemId, setSubFocusedItemId] = useState<string | null>(null);
    const [subTypeaheadValue, setSubTypeaheadValue] = useState("");

    const subMenuSide: Side = dir === "rtl" ? "left" : "right";
    const subMenuAlignOffset = alignOffset ?? -4;

    const { top, left, actualSide, isPositioned, isReferenceHidden } = usePosition({
        relativeTo: subTriggerRef,
        target: subContentRef,
        isTargetRendered: isMounted,
        side: subMenuSide,
        sideOffset,
        alignOffset: subMenuAlignOffset,
        avoidCollisions,
        collisionBoundary,
        collisionPadding,
        sticky,
        hideWhenDetached,
    });

    const typeaheadTimeoutRef = useRef<number | null>(null);
    const closeTimeoutRef = useRef<number | null>(null);
    const needsFocusOnMount = useRef(false);

    useEffect(() => {
        return () => {
            if (typeaheadTimeoutRef.current)
                clearTimeout(typeaheadTimeoutRef.current);
        }
    }, []);

    useEffect(() => {
        if (open && !isMounted) {
            // Submenu is opening - mark that we need to focus when mounted
            needsFocusOnMount.current = true;
        }
        setIsMounted(open);
    }, [open, isMounted]);

    useEffect(() => {
        if (!open) {
            setSubFocusedItemId(null);
            setSubTypeaheadValue("");

            if (typeaheadTimeoutRef.current) {
                clearTimeout(typeaheadTimeoutRef.current);
                typeaheadTimeoutRef.current = null;
            }
        }
    }, [open]);

    useEffect(() => {
        if (!open || !focusedItemId) return;

        const subContent = subContentRef.current;
        if (!subContent) return;

        const ref = getItemRef(focusedItemId);
        const element = ref?.current;

        if (element && subContent.contains(element)) setSubFocusedItemId(focusedItemId);
    }, [open, focusedItemId, subContentRef, getItemRef]);

    const animationEndHandler = useCallback((event: React.AnimationEvent<HTMLDivElement>) => {
        if (event.target === event.currentTarget && !open) {
            const element = event.currentTarget;
            element.style.display = "none";
            setIsMounted(false);
        }
    }, [open]);

    useEffect(() => {
        return () => { if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current) }
    }, []);

    const getSubItems = useCallback((): string[] => {
        const subContent = subContentRef.current;
        if (!subContent) return [];

        return getItemEntries().filter((entry) => {
            const element = entry.ref.current;
            if (!element) return false;
            if (!subContent.contains(element)) return false;

            return !(
                element.getAttribute("data-disabled") === "true" ||
                element.getAttribute("aria-disabled") === "true"
            );
        }).map((entry) => entry.id);
    }, [subContentRef, getItemEntries]);

    const focusSubItem = useCallback((id: string) => {
        const ref = getItemRef(id);

        if (ref?.current) {
            ref.current.focus({ preventScroll: true });
            ref.current.scrollIntoView({ block: "nearest" });
            setFocusedItemId(id);
            setSubFocusedItemId(id);
        }
    }, [getItemRef, setFocusedItemId]);

    const getTextValueForSubItem = useCallback((id: string): string => {
        const entries = getItemEntries();
        const entry = entries.find((e) => e.id === id);
        if (entry?.textValue) return entry.textValue;

        const ref = getItemRef(id);
        const element = ref?.current;
        if (!element) return "";

        return (
            element.getAttribute("data-text-value") ||
            element.textContent?.trim() ||
            ""
        );
    }, [getItemEntries, getItemRef]);

    const handleSubTypeahead = useCallback((character: string) => {
        if (typeaheadTimeoutRef.current) clearTimeout(typeaheadTimeoutRef.current);

        const subItems = getSubItems();
        if (subItems.length === 0) return;

        const isRepeatedChar =
            character.toLowerCase() === subTypeaheadValue.toLowerCase() &&
            subTypeaheadValue.length === 1;

        if (isRepeatedChar) {
            const matchingItems = subItems.filter((id) => {
                const textVal = getTextValueForSubItem(id);
                return textVal.toLowerCase().startsWith(character.toLowerCase());
            });

            if (matchingItems.length > 0) {
                const currentMatchIndex = matchingItems.findIndex((id) => id === subFocusedItemId);
                const nextMatchIndex = (currentMatchIndex + 1) % matchingItems.length;
                focusSubItem(matchingItems[nextMatchIndex]);
            }

            setSubTypeaheadValue(character);
        }

        else {
            const newTypeaheadValue = subTypeaheadValue + character;
            setSubTypeaheadValue(newTypeaheadValue);

            const matchingItem = subItems.find((id) => {
                const textVal = getTextValueForSubItem(id);
                return textVal.toLowerCase().startsWith(newTypeaheadValue.toLowerCase());
            });

            if (matchingItem) focusSubItem(matchingItem);
        }

        typeaheadTimeoutRef.current = window.setTimeout(() => { setSubTypeaheadValue("") }, 500);
    }, [subTypeaheadValue, getSubItems, getTextValueForSubItem, focusSubItem, subFocusedItemId]);

    // Focus management: focus the content when it becomes mounted
    // This ensures focus moves even when switching submenus via pointer hover
    useEffect(() => {
        if (!isMounted || !needsFocusOnMount.current) return;
        needsFocusOnMount.current = false;

        // Use requestAnimationFrame to ensure the DOM element is ready
        const frameId = requestAnimationFrame(() => {
            if (subContentRef.current) {
                subContentRef.current.focus();

                if (openedWithKeyboard) {
                    const subItems = getSubItems();
                    if (subItems.length > 0) focusSubItem(subItems[0]);
                }
            }
        });

        return () => cancelAnimationFrame(frameId);
    }, [isMounted, subContentRef, openedWithKeyboard, getSubItems, focusSubItem]);

    const keyDownHandler = useCallback((event: React.KeyboardEvent<HTMLElement>) => {
        const closeKey = dir === "ltr" ? "ArrowLeft" : "ArrowRight";
        const openKey = dir === "ltr" ? "ArrowRight" : "ArrowLeft";
        const subItems = getSubItems();

        if (event.key === closeKey) {
            event.preventDefault();
            event.stopPropagation();
            onOpenChange(false);
            subTriggerRef.current?.focus();
            return;
        }

        if (event.key === openKey && !subFocusedItemId && subItems.length > 0) {
            event.preventDefault();
            event.stopPropagation();
            focusSubItem(subItems[0]);
            return;
        }

        if (event.key === "Escape") {
            event.preventDefault();
            event.stopPropagation();
            onEscapeKeyDown?.(event);
            onOpenChange(false);
            subTriggerRef.current?.focus();
            return;
        }

        if (event.key === "ArrowDown") {
            event.preventDefault();
            event.stopPropagation();

            if (subItems.length === 0) return;

            if (!subFocusedItemId) {
                focusSubItem(subItems[0]);
                return;
            }

            const currentIndex = subItems.indexOf(subFocusedItemId);

            const nextIndex = currentIndex + 1 >= subItems.length
                ? loop ? 0 : subItems.length - 1
                : currentIndex + 1;

            focusSubItem(subItems[nextIndex]);

            return;
        }

        if (event.key === "ArrowUp") {
            event.preventDefault();
            event.stopPropagation();

            if (subItems.length === 0) return;

            if (!subFocusedItemId) {
                focusSubItem(subItems[subItems.length - 1]);
                return;
            }

            const currentIndex = subItems.indexOf(subFocusedItemId);

            const nextIndex = currentIndex - 1 < 0
                ? loop ? subItems.length - 1 : 0
                : currentIndex - 1;

            focusSubItem(subItems[nextIndex]);

            return;
        }

        if (!subFocusedItemId) {
            onKeyDown?.(event);
            return;
        }

        if (event.key === "Home") {
            event.preventDefault();
            event.stopPropagation();

            if (subItems.length > 0) focusSubItem(subItems[0]);

            return;
        }

        if (event.key === "End") {
            event.preventDefault();
            event.stopPropagation();

            if (subItems.length > 0) focusSubItem(subItems[subItems.length - 1]);

            return;
        }

        const { key, altKey, ctrlKey, metaKey } = event;
        const isTypeahead = key.length === 1 && key !== " " && !altKey && !ctrlKey && !metaKey;

        if (isTypeahead) {
            event.preventDefault();
            event.stopPropagation();
            handleSubTypeahead(key);
            return;
        }

        onKeyDown?.(event);
    }, [dir, getSubItems, subFocusedItemId, focusSubItem, loop, onOpenChange, subTriggerRef, handleSubTypeahead, onKeyDown, onEscapeKeyDown]);

    const mouseEnterHandler = useCallback((event: React.MouseEvent<HTMLElement>) => {
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
            closeTimeoutRef.current = null;
        }

        onMouseEnter?.(event);
    }, [onMouseEnter]);

    const mouseLeaveHandler = useCallback((event: React.MouseEvent<HTMLElement>) => {
        closeTimeoutRef.current = window.setTimeout(() => {
            const trigger = subTriggerRef.current;
            const subContent = subContentRef.current;
            const mouseX = (event.nativeEvent as MouseEvent).clientX;
            const mouseY = (event.nativeEvent as MouseEvent).clientY;

            // Check if mouse is over trigger
            if (trigger) {
                const rect = trigger.getBoundingClientRect();
                const isOverTrigger =
                    mouseX >= rect.left &&
                    mouseX <= rect.right &&
                    mouseY >= rect.top &&
                    mouseY <= rect.bottom;

                if (isOverTrigger) return;
            }

            // Check if mouse is over any nested sub-content
            if (subContent) {
                const nestedSubContents = subContent.querySelectorAll("[data-ui='context-menu-sub-trigger'][data-state='open']");

                for (const nestedTrigger of nestedSubContents) {
                    const nestedContentId = nestedTrigger.getAttribute("aria-controls");
                    if (!nestedContentId) continue;

                    const nestedContent = document.getElementById(nestedContentId);
                    if (!nestedContent) continue;

                    const nestedRect = nestedContent.getBoundingClientRect();
                    const isOverNestedContent =
                        mouseX >= nestedRect.left &&
                        mouseX <= nestedRect.right &&
                        mouseY >= nestedRect.top &&
                        mouseY <= nestedRect.bottom;

                    if (isOverNestedContent) return;
                }
            }

            onOpenChange(false);
        }, 100);

        onMouseLeave?.(event);
    }, [subTriggerRef, subContentRef, onOpenChange, onMouseLeave]);

    useEffect(() => {
        if (!open) return;

        const outsideClickHandler = (event: MouseEvent) => {
            if (subContentRef.current && !subContentRef.current.contains(event.target as Node)) {
                if (subTriggerRef.current && subTriggerRef.current.contains(event.target as Node)) return;
                onPointerDownOutside?.(event as PointerEvent);
                onInteractOutside?.(event);
            }
        }

        const focusHandlerOutside = (event: FocusEvent) => {
            if (subContentRef.current && !subContentRef.current.contains(event.target as Node))
                onFocusOutside?.(event);
        }

        document.addEventListener("mousedown", outsideClickHandler);
        document.addEventListener("focusin", focusHandlerOutside);

        return () => {
            document.removeEventListener("mousedown", outsideClickHandler);
            document.removeEventListener("focusin", focusHandlerOutside);
        }
    }, [
        open,
        subContentRef,
        subTriggerRef,
        onPointerDownOutside,
        onInteractOutside,
        onFocusOutside,
    ]);

    if (!isMounted && !forceMount) return null;

    const Component = asChild ? Slot : "div";

    return (
        <Component
            data-ui="context-menu-sub-content"
            data-state={open ? "open" : "closed"}
            data-side={actualSide}

            ref={subContentRef as RefObject<HTMLDivElement>}
            id={subContentId}
            tabIndex={-1}

            aria-labelledby={subTriggerId}
            aria-orientation="vertical"
            role="menu"

            onAnimationEnd={animationEndHandler}
            onMouseEnter={mouseEnterHandler}
            onMouseLeave={mouseLeaveHandler}
            onKeyDown={keyDownHandler}

            style={{
                position: "fixed",
                top: `${top}px`,
                left: `${left}px`,
                zIndex: 50,
                visibility: isPositioned && !isReferenceHidden ? "visible" : "hidden",
            }}

            className={cn(
                "min-w-[8rem] w-fit rounded border border-bound bg-surface p-1 shadow",
                "data-[state='open']:animate-in data-[state='open']:zoom-in-95 data-[state='open']:fade-in-0",
                "data-[state='closed']:animate-out data-[state='closed']:zoom-out-95 data-[state=closed]:fade-out-0",
                "data-[side=bottom]:slide-in-from-top-2",
                "data-[side=left]:slide-in-from-right-2",
                "data-[side=right]:slide-in-from-left-2",
                "data-[side=top]:slide-in-from-bottom-2",
                "focus:outline-none",
                className
            )}

            {...props}
        >
            {children}
        </Component>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface ContextMenuShortcutProps extends HTMLAttributes<HTMLElement> {
    asChild?: boolean;
}

function ContextMenuShortcut({ className, children, asChild = false, ...props }: ContextMenuShortcutProps) {
    const Component = asChild ? Slot : "span";

    return (
        <Component
            data-ui="context-menu-shortcut"

            className={cn(
                "ml-auto text-xs tracking-widest text-muted-write",
                className
            )}

            {...props}
        >
            {children}
        </Component>
    );
}

// ---------------------------------------------------------------------------------------------------- //

export {
    ContextMenu,
    ContextMenuTrigger,
    ContextMenuPortal,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuGroup,
    ContextMenuLabel,
    ContextMenuCheckboxItem,
    ContextMenuCheckboxItemIndicator,
    ContextMenuRadioGroup,
    ContextMenuRadioItem,
    ContextMenuRadioItemIndicator,
    ContextMenuSeparator,
    ContextMenuSub,
    ContextMenuSubTrigger,
    ContextMenuSubTriggerIndicator,
    ContextMenuSubContent,
    ContextMenuShortcut,
    type ContextMenuProps,
    type ContextMenuTriggerProps,
    type ContextMenuPortalProps,
    type ContextMenuContentProps,
    type ContextMenuItemProps,
    type ContextMenuGroupProps,
    type ContextMenuLabelProps,
    type ContextMenuCheckboxItemProps,
    type ContextMenuRadioGroupProps,
    type ContextMenuRadioItemProps,
    type ContextMenuCheckboxItemIndicatorProps,
    type ContextMenuSeparatorProps,
    type ContextMenuSubProps,
    type ContextMenuSubTriggerProps,
    type ContextMenuSubTriggerIndicatorProps,
    type ContextMenuSubContentProps,
    type ContextMenuShortcutProps,
}

// ---------------------------------------------------------------------------------------------------- //
