import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useLayoutEffect,
    useState,
    useMemo,
    useReducer,
    useRef,
    useId,
    type HTMLAttributes,
    type ReactNode,
    type RefObject,
    type Dispatch,
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

// ================================================================================================== //
// TYPES & CONSTANTS
// ================================================================================================== //

type Direction = "ltr" | "rtl";

// ================================================================================================== //
// ACTION HELPERS
// ================================================================================================== //

const MenubarActions = {
    None: -1,
    Open: 0,
    Close: 1,
    Select: 2,
    First: 3,
    Last: 4,
    Previous: 5,
    Next: 6,
    Type: 7,
    NextMenu: 8,
    PreviousMenu: 9,
    OpenSub: 10,
    CloseSub: 11,
} as const;

type MenubarAction = (typeof MenubarActions)[keyof typeof MenubarActions];

/**
 * Get action for MenubarTrigger keyboard events
 */
const getMenubarTriggerAction = (
    event: React.KeyboardEvent,
    isOpen: boolean,
    dir: Direction
): MenubarAction => {
    const { key } = event;

    if (!isOpen) {
        if (["Enter", " ", "ArrowDown", "ArrowUp"].includes(key)) return MenubarActions.Open;
    }

    if (key === "ArrowRight") return dir === "ltr" ? MenubarActions.NextMenu : MenubarActions.PreviousMenu;
    if (key === "ArrowLeft") return dir === "ltr" ? MenubarActions.PreviousMenu : MenubarActions.NextMenu;

    return MenubarActions.None;
}

/**
 * Get action for MenubarContent keyboard events
 */
const getMenubarContentAction = (
    event: React.KeyboardEvent,
    dir: Direction
): MenubarAction => {
    const { key, altKey, ctrlKey, metaKey } = event;

    const isTypeahead =
        ["Backspace", "Clear"].includes(key) ||
        (key.length === 1 && key !== " " && !altKey && !ctrlKey && !metaKey);

    switch (key) {
        case "Tab": return MenubarActions.Close;
        case "Escape": return MenubarActions.Close;
        case "Enter": case " ": return MenubarActions.Select;
        case "ArrowDown": return MenubarActions.Next;
        case "ArrowUp": return MenubarActions.Previous;
        case "Home": return MenubarActions.First;
        case "End": return MenubarActions.Last;
        case "ArrowRight": return dir === "ltr" ? MenubarActions.OpenSub : MenubarActions.CloseSub;
        case "ArrowLeft": return dir === "ltr" ? MenubarActions.CloseSub : MenubarActions.OpenSub;
        default: return isTypeahead ? MenubarActions.Type : MenubarActions.None;
    }
}

/**
 * Get action for MenubarSubContent keyboard events
 */
const getMenubarSubContentAction = (
    event: React.KeyboardEvent,
    dir: Direction
): MenubarAction => {
    const { key, altKey, ctrlKey, metaKey } = event;

    const isTypeahead =
        ["Backspace", "Clear"].includes(key) ||
        (key.length === 1 && key !== " " && !altKey && !ctrlKey && !metaKey);

    const closeKey = dir === "ltr" ? "ArrowLeft" : "ArrowRight";
    const openKey = dir === "ltr" ? "ArrowRight" : "ArrowLeft";

    switch (key) {
        case "Escape": return MenubarActions.Close;
        case "Enter": case " ": return MenubarActions.Select;
        case "ArrowDown": return MenubarActions.Next;
        case "ArrowUp": return MenubarActions.Previous;
        case "Home": return MenubarActions.First;
        case "End": return MenubarActions.Last;
        default:
            if (key === closeKey) return MenubarActions.CloseSub;
            if (key === openKey) return MenubarActions.OpenSub;
            return isTypeahead ? MenubarActions.Type : MenubarActions.None;
    }
}

// ================================================================================================== //
// ROOT STATE & REDUCER
// Centralized state management for menubar root
// ================================================================================================== //

interface RootState {
    tabbableMenuValue: string | null;
}

type RootAction =
    | { type: "SET_TABBABLE_MENU"; value: string }

function rootReducer(state: RootState, action: RootAction): RootState {
    switch (action.type) {
        case "SET_TABBABLE_MENU":
            return state.tabbableMenuValue === action.value ? state : { ...state, tabbableMenuValue: action.value }
        default:
            return state;
    }
}

// ================================================================================================== //
// MENU STATE & REDUCER  
// Centralized state management for individual menus
// ================================================================================================== //

interface MenuState {
    openedWithKeyboard: boolean;
    typeaheadValue: string;
}

type MenuAction =
    | { type: "SET_OPENED_WITH_KEYBOARD"; value: boolean }
    | { type: "SET_TYPEAHEAD"; value: string }
    | { type: "CLEAR_TYPEAHEAD" }
    | { type: "RESET" }

function menuReducer(state: MenuState, action: MenuAction): MenuState {
    switch (action.type) {
        case "SET_OPENED_WITH_KEYBOARD":
            return state.openedWithKeyboard === action.value ? state : { ...state, openedWithKeyboard: action.value }
        case "SET_TYPEAHEAD":
            return state.typeaheadValue === action.value ? state : { ...state, typeaheadValue: action.value }
        case "CLEAR_TYPEAHEAD":
            return state.typeaheadValue === "" ? state : { ...state, typeaheadValue: "" }
        case "RESET":
            return { openedWithKeyboard: false, typeaheadValue: "" }
        default:
            return state;
    }
}

const initialMenuState: MenuState = {
    openedWithKeyboard: false,
    typeaheadValue: "",
}

// ================================================================================================== //
// ROOT CONTEXT
// ================================================================================================== //

interface MenubarRootContextValue {
    // Active menu (controlled externally)
    activeMenuValue: string | null;
    setActiveMenu: (value: string | null) => void;

    // Reducer state & dispatch
    state: RootState;
    dispatch: Dispatch<RootAction>;

    // Configuration
    dir: Direction;
    loop: boolean;

    // Menu registry
    registerMenu: (value: string, triggerRef: RefObject<HTMLButtonElement | null>) => void;
    unregisterMenu: (value: string) => void;
    getMenuTriggerRefs: () => Map<string, RefObject<HTMLButtonElement | null>>;
    registerContentRef: (value: string, contentRef: RefObject<HTMLDivElement | null>) => void;
}

const MenubarRootContext = createContext<MenubarRootContextValue | null>(null);

// ================================================================================================== //
// MENU CONTEXT
// ================================================================================================== //

interface MenuItemEntry {
    id: string;
    ref: RefObject<HTMLDivElement | null>;
    textValue: string;
}

interface MenubarMenuContextValue {
    value: string;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onOpenChangeWithKeyboard: (open: boolean) => void;

    state: MenuState;
    dispatch: Dispatch<MenuAction>;

    triggerRef: RefObject<HTMLButtonElement | null>;
    contentRef: RefObject<HTMLDivElement | null>;
    triggerId: string;
    contentId: string;

    registerItem: (id: string, ref: RefObject<HTMLDivElement | null>, textValue: string) => void;
    unregisterItem: (id: string) => void;
    getItemEntries: () => MenuItemEntry[];
    getItemRef: (id: string) => RefObject<HTMLDivElement | null> | undefined;

    dir: Direction;
}

const MenubarMenuContext = createContext<MenubarMenuContextValue | null>(null);

// ================================================================================================== //
// MENUBAR ROOT COMPONENT
// ================================================================================================== //

interface MenubarProps extends Omit<HTMLAttributes<HTMLDivElement>, "defaultValue"> {
    value?: string | null;
    onValueChange?: (value: string | null) => void;
    defaultValue?: string | null;
    dir?: Direction;
    loop?: boolean;
    modal?: boolean;
    asChild?: boolean;
}

function Menubar({
    value,
    onValueChange,
    defaultValue,
    dir = "ltr",
    loop = false,
    modal = true,
    asChild = false,
    className,
    children,
    ...props
}: MenubarProps) {
    const [activeMenuValue, setActiveMenuValue] = useControllableState({
        value,
        defaultValue: defaultValue ?? null,
        onChange: onValueChange,
    });

    const [state, dispatch] = useReducer(rootReducer, {
        tabbableMenuValue: null,
    });

    const menuTriggerRefsMap = useRef<Map<string, RefObject<HTMLButtonElement | null>>>(new Map());
    const contentRefsMap = useRef<Map<string, RefObject<HTMLDivElement | null>>>(new Map());
    const hasSetInitialTabbable = useRef(false);

    const registerMenu = useCallback((menuValue: string, triggerRef: RefObject<HTMLButtonElement | null>) => {
        menuTriggerRefsMap.current.set(menuValue, triggerRef);

        if (!hasSetInitialTabbable.current) {
            hasSetInitialTabbable.current = true;
            dispatch({ type: "SET_TABBABLE_MENU", value: menuValue });
        }
    }, []);

    const unregisterMenu = useCallback((menuValue: string) => {
        menuTriggerRefsMap.current.delete(menuValue);
        contentRefsMap.current.delete(menuValue);
    }, []);

    const getMenuTriggerRefs = useCallback(() => menuTriggerRefsMap.current, []);

    const registerContentRef = useCallback((menuValue: string, contentRef: RefObject<HTMLDivElement | null>) => {
        contentRefsMap.current.set(menuValue, contentRef);
    }, []);

    useEffect(() => {
        if (!activeMenuValue || !modal) return;

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const elementsToInert: Element[] = [];
        const activeContentRef = contentRefsMap.current.get(activeMenuValue);
        const activeTriggerRef = menuTriggerRefsMap.current.get(activeMenuValue);

        for (const child of document.body.children) {
            if (
                child.hasAttribute("inert") ||
                (activeContentRef?.current && child.contains(activeContentRef.current)) ||
                (activeTriggerRef?.current && child.contains(activeTriggerRef.current))
            ) continue;

            child.setAttribute("inert", "");
            elementsToInert.push(child);
        }

        return () => {
            document.body.style.overflow = originalOverflow;
            elementsToInert.forEach(el => el.removeAttribute("inert"));
        }
    }, [activeMenuValue, modal]);

    const contextValue = useMemo<MenubarRootContextValue>(() => ({
        activeMenuValue,
        setActiveMenu: setActiveMenuValue,
        state,
        dispatch,
        dir,
        loop,
        registerMenu,
        unregisterMenu,
        getMenuTriggerRefs,
        registerContentRef,
    }), [activeMenuValue, setActiveMenuValue, state, dir, loop, registerMenu, unregisterMenu, getMenuTriggerRefs, registerContentRef]);

    const Component = asChild ? Slot : "div";

    return (
        <MenubarRootContext.Provider value={contextValue}>
            <Component
                data-ui="menubar"

                role="menubar"
                dir={dir}

                className={cn("flex items-center gap-1 rounded border border-bound bg-surface p-1", className)}

                {...props}
            >
                {children}
            </Component>
        </MenubarRootContext.Provider>
    );
}

// ================================================================================================== //
// MENUBAR MENU COMPONENT
// ================================================================================================== //

interface MenubarMenuProps {
    value?: string;
    children?: ReactNode;
}

function MenubarMenu({ value: valueProp, children }: MenubarMenuProps) {
    const root = useContext(MenubarRootContext);
    if (!root) throw new Error("MenubarMenu must be used within Menubar");

    const autoValue = useId();
    const value = valueProp ?? autoValue;

    const isOpen = root.activeMenuValue === value;

    const triggerRef = useRef<HTMLButtonElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const triggerId = useId();
    const contentId = useId();

    const itemRefsMap = useRef<Map<string, RefObject<HTMLDivElement | null>>>(new Map());
    const itemEntriesRef = useRef<MenuItemEntry[]>([]);

    const [state, dispatch] = useReducer(menuReducer, initialMenuState);
    const typeaheadTimeoutRef = useRef<number | null>(null);

    useLayoutEffect(() => {
        root.registerMenu(value, triggerRef);
        root.registerContentRef(value, contentRef);
        return () => root.unregisterMenu(value);
    }, [value, root]);

    const registerItem = useCallback((id: string, ref: RefObject<HTMLDivElement | null>, textValue: string) => {
        itemRefsMap.current.set(id, ref);
        const existingIndex = itemEntriesRef.current.findIndex(item => item.id === id);

        if (existingIndex >= 0) itemEntriesRef.current[existingIndex] = { id, ref, textValue }
        else itemEntriesRef.current.push({ id, ref, textValue });
    }, []);

    const unregisterItem = useCallback((id: string) => {
        itemRefsMap.current.delete(id);
        itemEntriesRef.current = itemEntriesRef.current.filter(item => item.id !== id);
    }, []);

    const getItemEntries = useCallback(() => itemEntriesRef.current, []);
    const getItemRef = useCallback((id: string) => itemRefsMap.current.get(id), []);

    useEffect(() => {
        if (!isOpen) {
            dispatch({ type: "RESET" });

            if (typeaheadTimeoutRef.current) {
                clearTimeout(typeaheadTimeoutRef.current);
                typeaheadTimeoutRef.current = null;
            }
        }
    }, [isOpen]);

    const handleOpenChange = useCallback((open: boolean) => {
        if (!open) dispatch({ type: "SET_OPENED_WITH_KEYBOARD", value: false });
        root.setActiveMenu(open ? value : null);
    }, [root, value]);

    const handleOpenChangeWithKeyboard = useCallback((open: boolean) => {
        dispatch({ type: "SET_OPENED_WITH_KEYBOARD", value: open });
        root.setActiveMenu(open ? value : null);
    }, [root, value]);

    const contextValue = useMemo<MenubarMenuContextValue>(() => ({
        value,
        isOpen,
        onOpenChange: handleOpenChange,
        onOpenChangeWithKeyboard: handleOpenChangeWithKeyboard,
        state,
        dispatch,
        triggerRef,
        contentRef,
        triggerId,
        contentId,
        registerItem,
        unregisterItem,
        getItemEntries,
        getItemRef,
        dir: root.dir,
    }), [value, isOpen, handleOpenChange, handleOpenChangeWithKeyboard, state, triggerId, contentId, registerItem, unregisterItem, getItemEntries, getItemRef, root.dir]);

    return (
        <MenubarMenuContext.Provider data-ui="menubar-menu" value={contextValue}>
            {children}
        </MenubarMenuContext.Provider>
    );
}

// ================================================================================================== //
// MENUBAR TRIGGER COMPONENT
// ================================================================================================== //

interface MenubarTriggerProps extends HTMLAttributes<HTMLButtonElement> {
    asChild?: boolean;
}

function MenubarTrigger({
    className,
    children,
    onKeyDown,
    onClick,
    onPointerEnter,
    onPointerMove,
    asChild = false,
    ...props
}: MenubarTriggerProps) {
    const root = useContext(MenubarRootContext);
    const menu = useContext(MenubarMenuContext);

    if (!root || !menu) throw new Error("MenubarTrigger must be used within MenubarMenu");

    const handleClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        menu.onOpenChange(!menu.isOpen);
        onClick?.(event);
    }, [menu, onClick]);

    const handlePointerHover = useCallback((event: React.PointerEvent<HTMLButtonElement>) => {
        if (root.activeMenuValue && root.activeMenuValue !== menu.value) menu.onOpenChange(true);
        if (event.type === "pointerenter") onPointerEnter?.(event);
        else if (event.type === "pointermove") onPointerMove?.(event);
    }, [root, menu, onPointerEnter, onPointerMove]);

    const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLButtonElement>) => {
        const action = getMenubarTriggerAction(event, menu.isOpen, root.dir);

        if (action === MenubarActions.None) {
            onKeyDown?.(event);
            return;
        }

        if (action === MenubarActions.Open) {
            event.preventDefault();
            menu.onOpenChangeWithKeyboard(true);
            return;
        }

        if (action === MenubarActions.NextMenu || action === MenubarActions.PreviousMenu) {
            event.preventDefault();

            const menuValues = Array.from(root.getMenuTriggerRefs().keys());
            const currentIndex = menuValues.indexOf(menu.value);
            const delta = action === MenubarActions.NextMenu ? 1 : -1;
            let nextIndex = currentIndex + delta;

            if (nextIndex >= menuValues.length) nextIndex = root.loop ? 0 : menuValues.length - 1;
            else if (nextIndex < 0) nextIndex = root.loop ? menuValues.length - 1 : 0;

            const nextMenuValue = menuValues[nextIndex];

            if (nextMenuValue && nextMenuValue !== menu.value) {
                const nextTrigger = root.getMenuTriggerRefs().get(nextMenuValue)?.current;

                if (nextTrigger) {
                    root.dispatch({ type: "SET_TABBABLE_MENU", value: nextMenuValue });
                    if (menu.isOpen) root.setActiveMenu(nextMenuValue);
                    nextTrigger.focus();
                }
            }
        }

        onKeyDown?.(event);
    }, [menu, root, onKeyDown]);

    const Component = asChild ? Slot : "button";

    return (
        <Component
            data-ui="menubar-trigger"
            data-state={menu.isOpen ? "open" : "closed"}

            tabIndex={root.state.tabbableMenuValue === menu.value ? 0 : -1}
            ref={menu.triggerRef}
            id={menu.triggerId}
            type="button"

            aria-controls={menu.isOpen ? menu.contentId : undefined}
            aria-expanded={menu.isOpen}
            aria-haspopup="menu"

            onPointerEnter={handlePointerHover}
            onPointerMove={handlePointerHover}
            onKeyDown={handleKeyDown}
            onClick={handleClick}

            className={cn(
                "flex cursor-pointer items-center rounded px-2 py-1 text-sm font-medium outline-none transition-colors leading-none",
                "data-[state=open]:bg-muted-surface",
                "focus:bg-muted-surface",
                className
            )}

            {...props}
        >
            {children}
        </Component>
    );
}

// ================================================================================================== //
// MENUBAR PORTAL COMPONENT
// ================================================================================================== //

interface MenubarPortalProps {
    children?: ReactNode;
    container?: HTMLElement;
}

function MenubarPortal({ children, container }: MenubarPortalProps) {
    return createPortal(children, container || document.body);
}

// ================================================================================================== //
// MENUBAR CONTENT COMPONENT
// ================================================================================================== //

interface MenubarContentProps extends HTMLAttributes<HTMLDivElement> {
    align?: Align;
    side?: Side;
    sideOffset?: number;
    alignOffset?: number;
    sticky?: Sticky;
    avoidCollisions?: boolean;
    collisionBoundary?: Boundary;
    collisionPadding?: Padding;
    forceMount?: boolean;
    loop?: boolean;
    asChild?: boolean;
    onCloseAutoFocus?: (event: Event) => void;
    onEscapeKeyDown?: (event: KeyboardEvent) => void;
}

function MenubarContent({
    align = "start",
    side = "bottom",
    sideOffset = 8,
    alignOffset = 0,
    sticky = "partial",
    avoidCollisions = true,
    collisionBoundary = [],
    collisionPadding = 8,
    forceMount = false,
    loop = false,
    asChild = false,
    className,
    children,
    onKeyDown,
    onCloseAutoFocus,
    onEscapeKeyDown,
    ...props
}: MenubarContentProps) {
    const root = useContext(MenubarRootContext);
    const menu = useContext(MenubarMenuContext);

    if (!root || !menu) throw new Error("MenubarContent must be used within MenubarMenu");

    const [isMounted, setIsMounted] = useState(menu.isOpen);
    const typeaheadTimeoutRef = useRef<number | null>(null);
    const needsFocusOnMount = useRef(false);

    const { top, left, actualSide, isPositioned } = usePosition({
        relativeTo: menu.triggerRef,
        target: menu.contentRef,
        isTargetRendered: isMounted,
        side,
        align,
        sideOffset,
        alignOffset,
        avoidCollisions,
        collisionBoundary,
        collisionPadding,
        sticky,
    });

    useEffect(() => {
        if (menu.isOpen && !isMounted) {
            // Menu is opening - mark that we need to focus when mounted
            needsFocusOnMount.current = true;
        }
        setIsMounted(menu.isOpen);
    }, [menu.isOpen, isMounted]);

    useEffect(() => {
        if (!menu.isOpen) return;

        const handlePointerDown = (event: PointerEvent) => {
            const target = event.target as Node;

            if (!menu.contentRef.current?.contains(target)) {
                if (menu.triggerRef.current?.contains(target)) return;

                for (const [, triggerRef] of root.getMenuTriggerRefs())
                    if (triggerRef.current?.contains(target)) return;

                menu.onOpenChange(false);
            }
        }

        document.addEventListener("pointerdown", handlePointerDown);
        return () => document.removeEventListener("pointerdown", handlePointerDown);
    }, [menu, root]);

    const getEnabledItems = useCallback((): HTMLElement[] => {
        const content = menu.contentRef.current;
        if (!content) return [];

        return Array.from(content.querySelectorAll<HTMLElement>(
            "[role='menuitem']:not([data-disabled='true']):not([aria-disabled='true']), " +
            "[role='menuitemcheckbox']:not([data-disabled='true']):not([aria-disabled='true']), " +
            "[role='menuitemradio']:not([data-disabled='true']):not([aria-disabled='true'])"
        )).filter(element => !element.closest("[data-ui='menubar-sub-content']"));
    }, [menu.contentRef]);

    const getCurrentFocusedItem = useCallback((): HTMLElement | null => {
        const content = menu.contentRef.current;
        if (!content) return null;

        const activeElement = document.activeElement as HTMLElement;

        if (
            activeElement &&
            content.contains(activeElement) &&
            !activeElement.closest("[data-ui='menubar-sub-content']") &&
            activeElement.matches("[role='menuitem'], [role='menuitemcheckbox'], [role='menuitemradio']")
        ) return activeElement;

        return null;
    }, [menu.contentRef]);

    const focusItem = useCallback((element: HTMLElement) => {
        element.scrollIntoView({ block: "nearest" });
        element.focus();
    }, []);

    const typeaheadHandler = useCallback((character: string) => {
        if (typeaheadTimeoutRef.current) clearTimeout(typeaheadTimeoutRef.current);

        const enabledItems = getEnabledItems();
        if (enabledItems.length === 0) return;

        const { typeaheadValue } = menu.state;
        const getTextValue = (el: HTMLElement) => el.textContent?.trim().toLowerCase() || "";
        const currentItem = getCurrentFocusedItem();

        const isRepeatedChar = character.toLowerCase() === typeaheadValue.toLowerCase() && typeaheadValue.length === 1;

        if (isRepeatedChar) {
            const matchingItems = enabledItems.filter(el => getTextValue(el).startsWith(character.toLowerCase()));

            if (matchingItems.length > 0) {
                const currentIndex = currentItem ? matchingItems.indexOf(currentItem) : -1;
                focusItem(matchingItems[(currentIndex + 1) % matchingItems.length]);
            }

            menu.dispatch({ type: "SET_TYPEAHEAD", value: character });
        }

        else {
            const newTypeaheadValue = typeaheadValue + character;
            menu.dispatch({ type: "SET_TYPEAHEAD", value: newTypeaheadValue });
            const matchingItem = enabledItems.find(el => getTextValue(el).startsWith(newTypeaheadValue.toLowerCase()));
            if (matchingItem) focusItem(matchingItem);
        }

        typeaheadTimeoutRef.current = window.setTimeout(() => menu.dispatch({ type: "CLEAR_TYPEAHEAD" }), 500);
    }, [menu, getEnabledItems, getCurrentFocusedItem, focusItem]);

    const closeOpenSubmenu = useCallback(() => {
        const openSubTrigger = menu.contentRef.current?.querySelector("[data-ui='menubar-sub-trigger'][data-state='open']") as HTMLElement | null;
        if (openSubTrigger) openSubTrigger.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
        return openSubTrigger;
    }, [menu]);

    const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
        const target = event.target as HTMLElement;
        const isFromSubmenu = target.closest("[data-ui='menubar-sub-content']");
        const action = getMenubarContentAction(event, menu.dir);

        const enabledItems = getEnabledItems();
        const currentItem = getCurrentFocusedItem();

        // Skip submenu events - they handle themselves
        if (isFromSubmenu && action !== MenubarActions.OpenSub && action !== MenubarActions.CloseSub) {
            onKeyDown?.(event);
            return;
        }

        if (action === MenubarActions.None) {
            onKeyDown?.(event);
            return;
        }

        switch (action) {
            case MenubarActions.Close: {
                event.preventDefault();

                if (event.key === "Tab") {
                    menu.onOpenChange(false);
                    menu.triggerRef.current?.focus();
                } else {
                    // Escape
                    onEscapeKeyDown?.(event.nativeEvent as KeyboardEvent);
                    menu.onOpenChange(false);
                    requestAnimationFrame(() => {
                        menu.triggerRef.current?.focus();
                        onCloseAutoFocus?.(event.nativeEvent);
                    });
                }
                return;
            }

            case MenubarActions.Next: {
                if (isFromSubmenu) return;
                event.preventDefault();
                closeOpenSubmenu();

                if (!currentItem || !enabledItems.includes(currentItem)) {
                    if (enabledItems.length > 0) focusItem(enabledItems[0]);
                } else {
                    const currentIndex = enabledItems.indexOf(currentItem);
                    const nextIndex = currentIndex + 1 >= enabledItems.length ? (loop ? 0 : enabledItems.length - 1) : currentIndex + 1;
                    focusItem(enabledItems[nextIndex]);
                }
                return;
            }

            case MenubarActions.Previous: {
                if (isFromSubmenu) return;
                event.preventDefault();
                closeOpenSubmenu();

                if (!currentItem || !enabledItems.includes(currentItem)) {
                    if (enabledItems.length > 0) focusItem(enabledItems[enabledItems.length - 1]);
                } else {
                    const currentIndex = enabledItems.indexOf(currentItem);
                    const nextIndex = currentIndex - 1 < 0 ? (loop ? enabledItems.length - 1 : 0) : currentIndex - 1;
                    focusItem(enabledItems[nextIndex]);
                }
                return;
            }

            case MenubarActions.First: {
                event.preventDefault();
                if (enabledItems.length > 0) focusItem(enabledItems[0]);
                return;
            }

            case MenubarActions.Last: {
                event.preventDefault();
                if (enabledItems.length > 0) focusItem(enabledItems[enabledItems.length - 1]);
                return;
            }

            case MenubarActions.OpenSub:
            case MenubarActions.CloseSub: {
                const openSubTrigger = menu.contentRef.current?.querySelector("[data-ui='menubar-sub-trigger'][data-state='open']") as HTMLElement | null;

                if (openSubTrigger) {
                    const subContentId = openSubTrigger.getAttribute("aria-controls");
                    const subContent = subContentId ? document.getElementById(subContentId) : null;
                    const focusedInSub = subContent?.contains(document.activeElement);

                    if (action === MenubarActions.CloseSub) {
                        event.preventDefault();
                        event.stopPropagation();

                        openSubTrigger.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));

                        if (!focusedInSub) {
                            // Navigate to previous menu
                            const menuValues = Array.from(root.getMenuTriggerRefs().keys());
                            const currentIndex = menuValues.indexOf(menu.value);
                            let nextIndex = currentIndex - 1;
                            if (nextIndex < 0) nextIndex = root.loop ? menuValues.length - 1 : currentIndex;

                            const nextMenuValue = menuValues[nextIndex];
                            if (nextMenuValue && nextMenuValue !== menu.value) {
                                menu.onOpenChange(false);
                                root.setActiveMenu(nextMenuValue);
                            }
                        } else {
                            openSubTrigger.focus();
                        }
                        return;
                    }

                    if (action === MenubarActions.OpenSub) {
                        event.preventDefault();
                        event.stopPropagation();

                        if (focusedInSub) {
                            // Navigate to next menu
                            const menuValues = Array.from(root.getMenuTriggerRefs().keys());
                            const currentIndex = menuValues.indexOf(menu.value);
                            let nextIndex = currentIndex + 1;
                            if (nextIndex >= menuValues.length) nextIndex = root.loop ? 0 : currentIndex;

                            const nextMenuValue = menuValues[nextIndex];
                            if (nextMenuValue && nextMenuValue !== menu.value) {
                                menu.onOpenChange(false);
                                root.setActiveMenu(nextMenuValue);
                            }
                            return;
                        }

                        const firstItem = subContent?.querySelector<HTMLElement>("[role='menuitem']:not([data-disabled='true']), [role='menuitemcheckbox']:not([data-disabled='true']), [role='menuitemradio']:not([data-disabled='true'])");
                        if (firstItem) firstItem.focus();
                        return;
                    }
                }

                // No open submenu - check if current item is a sub-trigger
                if (currentItem?.getAttribute("data-ui") === "menubar-sub-trigger" && action === MenubarActions.OpenSub) {
                    event.preventDefault();
                    event.stopPropagation();
                    currentItem.dispatchEvent(new KeyboardEvent("keydown", { key: event.key, code: event.code, bubbles: true, cancelable: true }));
                    return;
                }

                // Navigate between menus
                event.preventDefault();
                const menuValues = Array.from(root.getMenuTriggerRefs().keys());
                const currentMenuIndex = menuValues.indexOf(menu.value);
                const delta = action === MenubarActions.OpenSub ? 1 : -1;

                let nextIndex = currentMenuIndex + delta;
                if (nextIndex >= menuValues.length) nextIndex = root.loop ? 0 : currentMenuIndex;
                else if (nextIndex < 0) nextIndex = root.loop ? menuValues.length - 1 : currentMenuIndex;

                const nextMenuValue = menuValues[nextIndex];
                if (nextMenuValue && nextMenuValue !== menu.value) {
                    menu.onOpenChange(false);
                    root.setActiveMenu(nextMenuValue);
                }
                return;
            }

            case MenubarActions.Select: {
                event.preventDefault();
                if (currentItem) currentItem.click();
                return;
            }

            case MenubarActions.Type: {
                event.preventDefault();
                typeaheadHandler(event.key);
                return;
            }
        }

        onKeyDown?.(event);
    }, [menu, root, getEnabledItems, getCurrentFocusedItem, focusItem, loop, typeaheadHandler, closeOpenSubmenu, onKeyDown, onCloseAutoFocus, onEscapeKeyDown]);

    // Focus management: focus the content when it becomes mounted
    // This ensures focus moves even when switching menus via pointer hover
    useEffect(() => {
        if (!isMounted || !needsFocusOnMount.current) return;
        needsFocusOnMount.current = false;

        // Use requestAnimationFrame to ensure the DOM element is ready
        const frameId = requestAnimationFrame(() => {
            if (menu.contentRef.current) {
                menu.contentRef.current.focus();

                if (menu.state.openedWithKeyboard) {
                    const enabledItems = getEnabledItems();
                    if (enabledItems.length > 0) focusItem(enabledItems[0]);
                }
            }
        });

        return () => cancelAnimationFrame(frameId);
    }, [isMounted, menu.contentRef, menu.state.openedWithKeyboard, getEnabledItems, focusItem]);

    const handlePointerLeave = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
        const relatedTarget = event.relatedTarget as Node | null;

        if (relatedTarget) {
            const subContent = (relatedTarget as Element).closest?.("[data-ui='menubar-sub-content']");
            if (subContent) return;
        }

        menu.contentRef.current?.focus();
    }, [menu.contentRef]);

    if (!isMounted && !forceMount) return null;

    const Component = asChild ? Slot : "div";

    return (
        <Component
            data-ui="menubar-content"
            data-state={menu.isOpen ? "open" : "closed"}
            data-side={actualSide}

            ref={menu.contentRef}
            id={menu.contentId}
            tabIndex={-1}

            aria-labelledby={menu.triggerId}
            aria-orientation="vertical"
            role="menu"

            onPointerLeave={handlePointerLeave}
            onKeyDown={handleKeyDown}

            style={{
                position: "fixed",
                top: `${top}px`,
                left: `${left}px`,
                zIndex: 50,
                visibility: isPositioned ? "visible" : "hidden",
            }}

            className={cn(
                "min-w-56 w-fit rounded border border-bound bg-surface p-1 shadow-lg",
                "focus:outline-none",
                className
            )}

            {...props}
        >
            {children}
        </Component>
    );
}

// ================================================================================================== //
// MENUBAR ITEM COMPONENT
// ================================================================================================== //

interface MenubarItemProps extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
    onSelect?: (event: Event) => void;
    textValue?: string;
    disabled?: boolean;
    asChild?: boolean;
}

function MenubarItem({
    className,
    children,
    onSelect,
    onKeyDown,
    onMouseEnter,
    onClick,
    disabled = false,
    textValue,
    asChild = false,
    ...props
}: MenubarItemProps) {
    const menu = useContext(MenubarMenuContext);
    if (!menu) throw new Error("MenubarItem must be used within MenubarMenu");

    const id = useId();
    const itemRef = useRef<HTMLDivElement>(null);

    const resolvedTextValue = useMemo(() => {
        if (textValue) return textValue;
        if (typeof children === "string") return children;
        return itemRef.current?.textContent?.trim() || "";
    }, [textValue, children]);

    useLayoutEffect(() => {
        const finalTextValue = resolvedTextValue || itemRef.current?.textContent?.trim() || "";
        menu.registerItem(id, itemRef, finalTextValue);
        return () => menu.unregisterItem(id);
    }, [id, menu, resolvedTextValue]);

    const handleClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
        if (disabled) return;
        onSelect?.(event.nativeEvent);
        onClick?.(event);
        menu.onOpenChange(false);
        requestAnimationFrame(() => menu.triggerRef.current?.focus());
    }, [disabled, onSelect, onClick, menu]);

    const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
        if (disabled) return;

        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onSelect?.(event.nativeEvent);
            menu.onOpenChange(false);
            requestAnimationFrame(() => menu.triggerRef.current?.focus());
            return;
        }

        onKeyDown?.(event);
    }, [disabled, onSelect, menu, onKeyDown]);

    const handleMouseHover = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
        if (!disabled) {

            if (event.type === "mousemove") {
                const parentContent = itemRef.current?.closest("[data-ui='menubar-content'], [data-ui='menubar-sub-content']");

                if (parentContent) {
                    const openSiblingTriggers = parentContent.querySelectorAll<HTMLElement>(
                        ":scope > [data-ui='menubar-sub-trigger'][data-state='open']"
                    );

                    for (const trigger of openSiblingTriggers) trigger.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
                }
            }

            itemRef.current?.focus();
        }

        if (event.type === "mouseenter") onMouseEnter?.(event);
    }, [disabled, onMouseEnter]);

    const Component = asChild ? Slot : "div";

    return (
        <Component
            data-ui="menubar-item"
            data-item-id={id}
            data-disabled={disabled || undefined}

            ref={itemRef}

            aria-disabled={disabled}
            role="menuitem"
            tabIndex={-1}

            onMouseEnter={handleMouseHover}
            onMouseMove={handleMouseHover}
            onKeyDown={handleKeyDown}
            onClick={handleClick}

            className={cn(
                "relative flex items-center gap-2 rounded px-2 py-1.5 text-sm text-write cursor-pointer select-none outline-none transition-colors",
                "data-[disabled=true]:opacity-50 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:pointer-events-none",
                "focus:bg-muted-surface",
                className
            )}

            {...props}
        >
            {children}
        </Component>
    );
}

// ================================================================================================== //
// MENUBAR SEPARATOR COMPONENT
// ================================================================================================== //

interface MenubarSeparatorProps extends HTMLAttributes<HTMLDivElement> {
    asChild?: boolean;
}

function MenubarSeparator({ className, asChild = false, ...props }: MenubarSeparatorProps) {
    const Component = asChild ? Slot : "div";

    return (
        <Component
            data-ui="menubar-separator"

            aria-orientation="horizontal"
            role="separator"

            className={cn("my-1 -mx-1 h-px bg-muted-bound", className)}

            {...props}
        />
    );
}

// ================================================================================================== //
// MENUBAR GROUP COMPONENT
// ================================================================================================== //

interface MenubarGroupProps extends HTMLAttributes<HTMLDivElement> {
    asChild?: boolean;
}

function MenubarGroup({ className, children, asChild = false, ...props }: MenubarGroupProps) {
    const Component = asChild ? Slot : "div";

    return (
        <Component
            data-ui="menubar-group"
            role="group"
            className={cn("flex flex-col", className)}
            {...props}
        >
            {children}
        </Component>
    );
}

// ================================================================================================== //
// MENUBAR LABEL COMPONENT
// ================================================================================================== //

interface MenubarLabelProps extends HTMLAttributes<HTMLDivElement> {
    asChild?: boolean;
}

function MenubarLabel({ className, children, asChild = false, ...props }: MenubarLabelProps) {
    const Component = asChild ? Slot : "div";

    return (
        <Component
            data-ui="menubar-label"
            role="presentation"
            className={cn("px-2 py-1.5 text-xs font-semibold text-muted-write", className)}
            {...props}
        >
            {children}
        </Component>
    );
}

// ================================================================================================== //
// MENUBAR CHECKBOX ITEM COMPONENT
// ================================================================================================== //

interface MenubarCheckboxItemContextState {
    checked: boolean | "indeterminate";
}

const MenubarCheckboxItemContext = createContext<MenubarCheckboxItemContextState | null>(null);

interface MenubarCheckboxItemProps extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
    onSelect?: (event: Event) => void;
    onCheckedChange?: (checked: boolean) => void;
    checked?: boolean | "indeterminate";
    disabled?: boolean;
    textValue?: string;
    asChild?: boolean;
}

function MenubarCheckboxItem({
    className,
    children,
    onSelect,
    onCheckedChange,
    checked = false,
    disabled = false,
    textValue,
    asChild = false,
    onKeyDown,
    onMouseEnter,
    onClick,
    ...props
}: MenubarCheckboxItemProps) {
    const menu = useContext(MenubarMenuContext);
    if (!menu) throw new Error("MenubarCheckboxItem must be used within MenubarMenu");

    const id = useId();
    const itemRef = useRef<HTMLDivElement>(null);

    const resolvedTextValue = useMemo(() => {
        if (textValue) return textValue;
        if (typeof children === "string") return children;
        return itemRef.current?.textContent?.trim() || "";
    }, [textValue, children]);

    useLayoutEffect(() => {
        const finalTextValue = resolvedTextValue || itemRef.current?.textContent?.trim() || "";
        menu.registerItem(id, itemRef, finalTextValue);
        return () => menu.unregisterItem(id);
    }, [id, menu, resolvedTextValue]);

    const handleClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
        if (disabled) return;
        const newChecked = checked !== true;
        onCheckedChange?.(newChecked);
        onSelect?.(event.nativeEvent);
        onClick?.(event);
        menu.onOpenChange(false);
        requestAnimationFrame(() => menu.triggerRef.current?.focus());
    }, [disabled, checked, onCheckedChange, onSelect, onClick, menu]);

    const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
        if (disabled) return;

        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onCheckedChange?.(checked !== true);
            onSelect?.(event.nativeEvent);
            menu.onOpenChange(false);
            requestAnimationFrame(() => menu.triggerRef.current?.focus());
        }

        onKeyDown?.(event);
    }, [disabled, checked, onCheckedChange, onSelect, onKeyDown, menu]);

    const handleMouseEnter = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
        if (!disabled) itemRef.current?.focus();
        onMouseEnter?.(event);
    }, [disabled, onMouseEnter]);

    const handlePointerMove = useCallback(() => {
        if (!disabled) {
            const parentContent = itemRef.current?.closest("[data-ui='menubar-content'], [data-ui='menubar-sub-content']");

            if (parentContent) {
                const openSiblingTriggers = parentContent.querySelectorAll<HTMLElement>(
                    ":scope > [data-ui='menubar-sub-trigger'][data-state='open']"
                );

                for (const trigger of openSiblingTriggers) trigger.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
            }

            itemRef.current?.focus();
        }
    }, [disabled]);

    const checkedState = checked === true ? "checked" : checked === "indeterminate" ? "indeterminate" : "unchecked";
    const ariaChecked = checked === "indeterminate" ? "mixed" : checked;

    const Component = asChild ? Slot : "div";

    return (
        <MenubarCheckboxItemContext.Provider value={{ checked }}>
            <Component
                data-ui="menubar-checkbox-item"
                data-disabled={disabled || undefined}
                data-checked={checkedState}
                data-item-id={id}

                ref={itemRef}
                tabIndex={-1}

                aria-checked={ariaChecked}
                aria-disabled={disabled}
                role="menuitemcheckbox"

                onPointerMove={handlePointerMove}
                onMouseEnter={handleMouseEnter}
                onKeyDown={handleKeyDown}
                onClick={handleClick}

                className={cn(
                    "relative flex items-center gap-2 rounded pl-8 pr-2 py-1.5 text-sm text-write cursor-pointer select-none outline-none transition-colors",
                    "data-[disabled=true]:opacity-50 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:pointer-events-none",
                    "focus:bg-muted-surface",
                    className
                )}

                {...props}
            >
                {children}
            </Component>
        </MenubarCheckboxItemContext.Provider>
    );
}

// ================================================================================================== //
// MENUBAR CHECKBOX ITEM INDICATOR COMPONENT
// ================================================================================================== //

interface MenubarCheckboxItemIndicatorProps extends HTMLAttributes<HTMLDivElement> {
    forceMount?: boolean;
    asChild?: boolean;
}

function MenubarCheckboxItemIndicator({
    className,
    forceMount = false,
    asChild = false,
    ...props
}: MenubarCheckboxItemIndicatorProps) {
    const context = useContext(MenubarCheckboxItemContext);
    const shouldShow = context?.checked === true || context?.checked === "indeterminate";

    if (!shouldShow && !forceMount) return null;

    const Component = asChild ? Slot : "div";

    return (
        <Component
            data-ui="menubar-checkbox-item-indicator"
            aria-hidden
            className={cn("absolute left-2 w-fit [&>svg]:size-4 text-write shrink-0", className)}
            {...props}
        >
            <svg data-ui="menubar-checkbox-item-indicator-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.7071 5.29289C21.0976 5.68342 21.0976 6.31658 20.7071 6.70711L9.70711 17.7071C9.31658 18.0976 8.68342 18.0976 8.29289 17.7071L3.29289 12.7071C2.90237 12.3166 2.90237 11.6834 3.29289 11.2929C3.68342 10.9024 4.31658 10.9024 4.70711 11.2929L9 15.5858L19.2929 5.29289C19.6834 4.90237 20.3166 4.90237 20.7071 5.29289Z" />
            </svg>
        </Component>
    );
}

// ================================================================================================== //
// MENUBAR RADIO GROUP COMPONENT
// ================================================================================================== //

interface MenubarRadioGroupContextState {
    value: string | null;
    onValueChange: (value: string) => void;
}

const MenubarRadioGroupContext = createContext<MenubarRadioGroupContextState | null>(null);

interface MenubarRadioGroupProps extends HTMLAttributes<HTMLDivElement> {
    value?: string;
    onValueChange?: (value: string) => void;
    asChild?: boolean;
}

function MenubarRadioGroup({
    className,
    children,
    value,
    onValueChange,
    asChild = false,
    ...props
}: MenubarRadioGroupProps) {
    const [currentValue, setCurrentValue] = useControllableState({
        value,
        defaultValue: "",
        onChange: onValueChange,
    });

    const context = useMemo<MenubarRadioGroupContextState>(() => ({
        value: currentValue || null,
        onValueChange: setCurrentValue,
    }), [currentValue, setCurrentValue]);

    const Component = asChild ? Slot : "div";

    return (
        <MenubarRadioGroupContext.Provider value={context}>
            <Component
                data-ui="menubar-radio-group"
                role="group"
                className={cn("flex flex-col", className)}
                {...props}
            >
                {children}
            </Component>
        </MenubarRadioGroupContext.Provider>
    );
}

// ================================================================================================== //
// MENUBAR RADIO ITEM COMPONENT
// ================================================================================================== //

interface MenubarRadioItemContextState {
    checked: boolean;
}

const MenubarRadioItemContext = createContext<MenubarRadioItemContextState | null>(null);

interface MenubarRadioItemProps extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
    onSelect?: (event: Event) => void;
    value?: string;
    disabled?: boolean;
    textValue?: string;
    asChild?: boolean;
}

function MenubarRadioItem({
    className,
    children,
    onSelect,
    value,
    disabled = false,
    textValue,
    asChild = false,
    onKeyDown,
    onMouseEnter,
    onClick,
    ...props
}: MenubarRadioItemProps) {
    const menu = useContext(MenubarMenuContext);
    const radioGroup = useContext(MenubarRadioGroupContext);
    if (!menu || !radioGroup) throw new Error("MenubarRadioItem must be used within MenubarRadioGroup");

    const id = useId();
    const itemRef = useRef<HTMLDivElement>(null);

    const resolvedTextValue = useMemo(() => {
        if (textValue) return textValue;
        if (typeof children === "string") return children;
        return itemRef.current?.textContent?.trim() || "";
    }, [textValue, children]);

    useLayoutEffect(() => {
        const finalTextValue = resolvedTextValue || itemRef.current?.textContent?.trim() || "";
        menu.registerItem(id, itemRef, finalTextValue);
        return () => menu.unregisterItem(id);
    }, [id, menu, resolvedTextValue]);

    const isChecked = value !== undefined && radioGroup.value === value;

    const handleClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
        if (disabled || value === undefined) return;
        radioGroup.onValueChange(value);
        onSelect?.(event.nativeEvent);
        onClick?.(event);
        menu.onOpenChange(false);
        requestAnimationFrame(() => menu.triggerRef.current?.focus());
    }, [disabled, value, radioGroup, onSelect, onClick, menu]);

    const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
        if (disabled || value === undefined) return;

        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            radioGroup.onValueChange(value);
            onSelect?.(event.nativeEvent);
            menu.onOpenChange(false);
            requestAnimationFrame(() => menu.triggerRef.current?.focus());
        }

        onKeyDown?.(event);
    }, [disabled, value, radioGroup, onSelect, onKeyDown, menu]);

    const handleMouseEnter = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
        if (!disabled) {
            itemRef.current?.focus();
        }
        onMouseEnter?.(event);
    }, [disabled, onMouseEnter]);

    const handlePointerMove = useCallback(() => {
        if (!disabled) {
            const parentContent = itemRef.current?.closest("[data-ui='menubar-content'], [data-ui='menubar-sub-content']");

            if (parentContent) {
                const openSiblingTriggers = parentContent.querySelectorAll<HTMLElement>(
                    ":scope > [data-ui='menubar-sub-trigger'][data-state='open']"
                );

                for (const trigger of openSiblingTriggers) trigger.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
            }

            itemRef.current?.focus();
        }
    }, [disabled]);

    const Component = asChild ? Slot : "div";

    return (
        <MenubarRadioItemContext.Provider value={{ checked: isChecked }}>
            <Component
                data-ui="menubar-radio-item"
                data-checked={isChecked || undefined}
                data-disabled={disabled || undefined}
                data-item-id={id}

                ref={itemRef}
                tabIndex={-1}

                aria-checked={isChecked}
                aria-disabled={disabled}
                role="menuitemradio"

                onPointerMove={handlePointerMove}
                onMouseEnter={handleMouseEnter}
                onKeyDown={handleKeyDown}
                onClick={handleClick}

                className={cn(
                    "relative flex items-center gap-2 rounded pl-8 pr-2 py-1.5 text-sm text-write cursor-pointer select-none outline-none transition-colors",
                    "data-[disabled=true]:opacity-50 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:pointer-events-none",
                    "focus:bg-muted-surface",
                    className
                )}

                {...props}
            >
                {children}
            </Component>
        </MenubarRadioItemContext.Provider>
    );
}

// ================================================================================================== //
// MENUBAR RADIO ITEM INDICATOR COMPONENT
// ================================================================================================== //

interface MenubarRadioItemIndicatorProps extends HTMLAttributes<HTMLDivElement> {
    forceMount?: boolean;
    asChild?: boolean;
}

function MenubarRadioItemIndicator({
    className,
    forceMount = false,
    asChild = false,
    ...props
}: MenubarRadioItemIndicatorProps) {
    const context = useContext(MenubarRadioItemContext);
    const shouldShow = context?.checked === true;

    if (!shouldShow && !forceMount) return null;

    const Component = asChild ? Slot : "div";

    return (
        <Component
            data-ui="menubar-radio-item-indicator"
            aria-hidden
            className={cn("absolute left-3 w-fit size-2 rounded-full bg-write shrink-0", className)}
            {...props}
        />
    );
}

// ================================================================================================== //
// MENUBAR SUB CONTEXT & COMPONENT
// ================================================================================================== //

interface MenubarSubContextState {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onOpenChangeWithKeyboard: (open: boolean) => void;
    openedWithKeyboard: boolean;

    subTriggerRef: RefObject<HTMLDivElement | null>;
    subContentRef: RefObject<HTMLDivElement | null>;
    subTriggerId: string;
    subContentId: string;

    dir: Direction;
}

const MenubarSubContext = createContext<MenubarSubContextState | null>(null);

interface MenubarSubProps {
    children?: ReactNode;
}

function MenubarSub({ children }: MenubarSubProps) {
    const parentMenu = useContext(MenubarMenuContext);
    if (!parentMenu) throw new Error("MenubarSub must be used within MenubarMenu");

    const [isOpen, setIsOpen] = useState(false);
    const [openedWithKeyboard, setOpenedWithKeyboard] = useState(false);

    const subTriggerRef = useRef<HTMLDivElement>(null);
    const subContentRef = useRef<HTMLDivElement>(null);
    const subTriggerId = useId();
    const subContentId = useId();

    const handleOpenChange = useCallback((open: boolean) => {
        setIsOpen(open);
        if (!open) setOpenedWithKeyboard(false);
    }, []);

    const handleOpenChangeWithKeyboard = useCallback((open: boolean) => {
        setIsOpen(open);
        setOpenedWithKeyboard(open);
    }, []);

    useEffect(() => {
        if (!parentMenu.isOpen && isOpen) {
            setIsOpen(false);
            setOpenedWithKeyboard(false);
        }
    }, [parentMenu.isOpen, isOpen]);

    const subContext = useMemo<MenubarSubContextState>(() => ({
        isOpen,
        onOpenChange: handleOpenChange,
        onOpenChangeWithKeyboard: handleOpenChangeWithKeyboard,
        openedWithKeyboard,
        subTriggerRef,
        subContentRef,
        subTriggerId,
        subContentId,
        dir: parentMenu.dir,
    }), [isOpen, handleOpenChange, handleOpenChangeWithKeyboard, openedWithKeyboard, subTriggerId, subContentId, parentMenu.dir]);

    return (
        <MenubarSubContext.Provider value={subContext}>
            {children}
        </MenubarSubContext.Provider>
    );
}

// ================================================================================================== //
// MENUBAR SUB TRIGGER COMPONENT
// ================================================================================================== //

interface MenubarSubTriggerProps extends HTMLAttributes<HTMLDivElement> {
    textValue?: string;
    disabled?: boolean;
    asChild?: boolean;
}

function MenubarSubTrigger({
    className,
    children,
    onKeyDown,
    onMouseEnter,
    onMouseLeave,
    disabled = false,
    textValue,
    asChild = false,
    ...props
}: MenubarSubTriggerProps) {
    const menu = useContext(MenubarMenuContext);
    const sub = useContext(MenubarSubContext);

    if (!menu || !sub) throw new Error("MenubarSubTrigger must be used within MenubarSub");

    const id = useId();
    const itemRef = useRef<HTMLDivElement>(null);
    const closeTimeoutRef = useRef<number | null>(null);

    const resolvedTextValue = useMemo(() => {
        if (textValue) return textValue;
        if (typeof children === "string") return children;
        return itemRef.current?.textContent?.trim() || "";
    }, [textValue, children]);

    useLayoutEffect(() => {
        const finalTextValue = resolvedTextValue || itemRef.current?.textContent?.trim() || "";
        menu.registerItem(id, itemRef, finalTextValue);
        return () => menu.unregisterItem(id);
    }, [id, menu, resolvedTextValue]);

    useLayoutEffect(() => {
        sub.subTriggerRef.current = itemRef.current;
    }, [sub]);

    useEffect(() => {
        return () => { if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current); }
    }, []);

    const openKey = menu.dir === "ltr" ? "ArrowRight" : "ArrowLeft";
    const closeKey = menu.dir === "ltr" ? "ArrowLeft" : "ArrowRight";

    const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
        if (disabled) return;

        if (event.key === openKey || event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            event.stopPropagation();

            if (closeTimeoutRef.current) {
                clearTimeout(closeTimeoutRef.current);
                closeTimeoutRef.current = null;
            }

            if (sub.isOpen) {
                const firstItem = sub.subContentRef.current?.querySelector<HTMLElement>(
                    "[role='menuitem']:not([data-disabled='true']), [role='menuitemcheckbox']:not([data-disabled='true']), [role='menuitemradio']:not([data-disabled='true'])"
                );

                firstItem?.focus();
            } else sub.onOpenChangeWithKeyboard(true);

            return;
        }

        if (event.key === closeKey && sub.isOpen) {
            event.preventDefault();
            sub.onOpenChange(false);
            return;
        }

        if (event.key === "Escape" && sub.isOpen) {
            event.preventDefault();
            event.stopPropagation();
            sub.onOpenChange(false);
            return;
        }

        onKeyDown?.(event);
    }, [disabled, openKey, closeKey, sub, onKeyDown]);

    const handleMouseEnter = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
        if (disabled) return;

        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
            closeTimeoutRef.current = null;
        }

        onMouseEnter?.(event);
    }, [disabled, onMouseEnter]);

    const handleMouseLeave = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
        if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);

        closeTimeoutRef.current = window.setTimeout(() => {
            const subContent = sub.subContentRef.current;
            const { clientX: mouseX, clientY: mouseY } = event.nativeEvent as MouseEvent;

            if (subContent) {
                const rect = subContent.getBoundingClientRect();
                if (mouseX >= rect.left && mouseX <= rect.right && mouseY >= rect.top && mouseY <= rect.bottom) return;

                for (const nestedTrigger of subContent.querySelectorAll("[data-ui='menubar-sub-trigger'][data-state='open']")) {
                    const nestedContentId = nestedTrigger.getAttribute("aria-controls");
                    if (!nestedContentId) continue;

                    const nestedContent = document.getElementById(nestedContentId);
                    if (!nestedContent) continue;

                    const nestedRect = nestedContent.getBoundingClientRect();
                    if (mouseX >= nestedRect.left && mouseX <= nestedRect.right && mouseY >= nestedRect.top && mouseY <= nestedRect.bottom) return;
                }
            }

            sub.onOpenChange(false);
        }, 100);

        onMouseLeave?.(event);
    }, [sub, onMouseLeave]);

    const handlePointerMove = useCallback(() => {
        if (disabled) return;

        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
            closeTimeoutRef.current = null;
        }

        const parentContent = itemRef.current?.closest("[data-ui='menubar-content'], [data-ui='menubar-sub-content']");
        if (parentContent) {
            const openSiblingTriggers = parentContent.querySelectorAll<HTMLElement>(
                ":scope > [data-ui='menubar-sub-trigger'][data-state='open']"
            );

            for (const trigger of openSiblingTriggers)
                if (trigger !== itemRef.current) trigger.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
        }

        if (sub.isOpen && sub.subContentRef.current) {
            const nestedOpenTriggers = sub.subContentRef.current.querySelectorAll<HTMLElement>(
                ":scope > [data-ui='menubar-sub-trigger'][data-state='open']"
            );

            for (const trigger of nestedOpenTriggers) 
                trigger.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
        }

        itemRef.current?.focus();
        sub.onOpenChange(true);
    }, [disabled, sub]);

    const Component = asChild ? Slot : "div";

    return (
        <Component
            data-ui="menubar-sub-trigger"
            data-state={sub.isOpen ? "open" : "closed"}
            data-disabled={disabled || undefined}
            data-item-id={id}

            ref={itemRef}
            tabIndex={-1}

            aria-controls={sub.isOpen ? sub.subContentId : undefined}
            aria-expanded={sub.isOpen}
            aria-disabled={disabled}
            aria-haspopup="menu"
            role="menuitem"

            onPointerMove={handlePointerMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onKeyDown={handleKeyDown}

            className={cn(
                "relative flex items-center gap-2 rounded px-2 py-1.5 text-sm text-write cursor-pointer select-none outline-none transition-colors",
                "data-[disabled=true]:opacity-50 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:pointer-events-none",
                "data-[state=open]:bg-muted-surface focus:bg-muted-surface",
                className
            )}

            {...props}
        >
            {children}
        </Component>
    );
}

// ================================================================================================== //
// MENUBAR SUB TRIGGER INDICATOR COMPONENT
// ================================================================================================== //

interface MenubarSubTriggerIndicatorProps extends HTMLAttributes<HTMLDivElement> {
    asChild?: boolean;
}

function MenubarSubTriggerIndicator({
    className,
    asChild = false,
    ...props
}: MenubarSubTriggerIndicatorProps) {
    const Component = asChild ? Slot : "div";

    return (
        <Component
            data-ui="menubar-sub-trigger-indicator"
            aria-hidden
            className={cn("ml-auto w-fit [&>svg]:size-4 text-write shrink-0", className)}
            {...props}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8.29289 5.29289C8.68342 4.90237 9.31658 4.90237 9.70711 5.29289L15.7071 11.2929C16.0976 11.6834 16.0976 12.3166 15.7071 12.7071L9.70711 18.7071C9.31658 19.0976 8.68342 19.0976 8.29289 18.7071C7.90237 18.3166 7.90237 17.6834 8.29289 17.2929L13.5858 12L8.29289 6.70711C7.90237 6.31658 7.90237 5.68342 8.29289 5.29289Z" />
            </svg>
        </Component>
    );
}

// ================================================================================================== //
// MENUBAR SUB CONTENT COMPONENT
// ================================================================================================== //

interface MenubarSubContentProps extends HTMLAttributes<HTMLDivElement> {
    align?: Align;
    side?: Side;
    sideOffset?: number;
    alignOffset?: number;
    sticky?: Sticky;
    avoidCollisions?: boolean;
    collisionBoundary?: Boundary;
    collisionPadding?: Padding;
    forceMount?: boolean;
    loop?: boolean;
    asChild?: boolean;
}

function MenubarSubContent({
    align = "start",
    side = "right",
    sideOffset = 0,
    alignOffset = -4,
    sticky = "partial",
    avoidCollisions = true,
    collisionBoundary = [],
    collisionPadding = 8,
    forceMount = false,
    loop = false,
    asChild = false,
    className,
    children,
    onKeyDown,
    ...props
}: MenubarSubContentProps) {
    const menu = useContext(MenubarMenuContext);
    const sub = useContext(MenubarSubContext);
    if (!menu || !sub) throw new Error("MenubarSubContent must be used within MenubarSub");

    const [isMounted, setIsMounted] = useState(sub.isOpen);
    const hasInitialSubFocusRun = useRef(false);
    const closeTimeoutRef = useRef<number | null>(null);

    const { top, left, actualSide, isPositioned } = usePosition({
        relativeTo: sub.subTriggerRef,
        target: sub.subContentRef,
        isTargetRendered: isMounted,
        side,
        align,
        sideOffset,
        alignOffset,
        avoidCollisions,
        collisionBoundary,
        collisionPadding,
        sticky,
    });

    useEffect(() => {
        if (sub.isOpen) setIsMounted(true);

        else {
            setIsMounted(false);
            hasInitialSubFocusRun.current = false;
        }
    }, [sub.isOpen]);

    useEffect(() => {
        return () => { if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current) }
    }, []);

    const getSubItems = useCallback((): HTMLElement[] => {
        const subContent = sub.subContentRef.current;
        if (!subContent) return [];

        return Array.from(subContent.querySelectorAll<HTMLElement>(
            "[role='menuitem']:not([data-disabled='true']):not([aria-disabled='true']), " +
            "[role='menuitemcheckbox']:not([data-disabled='true']):not([aria-disabled='true']), " +
            "[role='menuitemradio']:not([data-disabled='true']):not([aria-disabled='true'])"
        ));
    }, [sub.subContentRef]);

    const getCurrentFocusedItem = useCallback((): HTMLElement | null => {
        const subContent = sub.subContentRef.current;
        if (!subContent) return null;

        const activeElement = document.activeElement as HTMLElement;

        if (
            activeElement &&
            subContent.contains(activeElement) &&
            activeElement.matches("[role='menuitem'], [role='menuitemcheckbox'], [role='menuitemradio']")
        ) return activeElement;

        return null;
    }, [sub.subContentRef]);

    const focusItem = useCallback((element: HTMLElement) => {
        element.scrollIntoView({ block: "nearest" });
        element.focus();
    }, []);

    useLayoutEffect(() => {
        if (!sub.isOpen) return;
        if (hasInitialSubFocusRun.current) return;
        hasInitialSubFocusRun.current = true;

        if (sub.openedWithKeyboard) {
            const timeoutId = setTimeout(() => {
                const subItems = getSubItems();
                if (subItems.length > 0) focusItem(subItems[0]);
            }, 0);

            return () => clearTimeout(timeoutId);
        } else sub.subContentRef.current?.focus();
    }, [sub.isOpen, sub.openedWithKeyboard, sub.subContentRef, getSubItems, focusItem]);

    const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
        const action = getMenubarSubContentAction(event, sub.dir);
        const subItems = getSubItems();
        const currentItem = getCurrentFocusedItem();

        if (action === MenubarActions.None) {
            onKeyDown?.(event);
            return;
        }

        // Handle when no item is focused
        if (!currentItem) {
            if (action === MenubarActions.OpenSub || action === MenubarActions.Next) {
                event.preventDefault();
                event.stopPropagation();
                if (subItems.length > 0) focusItem(subItems[0]);
                return;
            }

            if (action === MenubarActions.Previous) {
                event.preventDefault();
                event.stopPropagation();
                if (subItems.length > 0) focusItem(subItems[subItems.length - 1]);
                return;
            }

            if (action === MenubarActions.CloseSub || action === MenubarActions.Close) {
                event.preventDefault();
                event.stopPropagation();
                sub.onOpenChange(false);
                sub.subTriggerRef.current?.focus();
                return;
            }

            return;
        }

        switch (action) {
            case MenubarActions.CloseSub:
            case MenubarActions.Close: {
                event.preventDefault();
                event.stopPropagation();
                sub.onOpenChange(false);
                sub.subTriggerRef.current?.focus();
                return;
            }

            case MenubarActions.Next: {
                event.preventDefault();
                event.stopPropagation();
                if (subItems.length === 0) return;

                const currentIndex = subItems.indexOf(currentItem);
                const nextIndex = currentIndex + 1 >= subItems.length ? (loop ? 0 : subItems.length - 1) : currentIndex + 1;
                focusItem(subItems[nextIndex]);
                return;
            }

            case MenubarActions.Previous: {
                event.preventDefault();
                event.stopPropagation();
                if (subItems.length === 0) return;

                const currentIndex = subItems.indexOf(currentItem);
                const nextIndex = currentIndex - 1 < 0 ? (loop ? subItems.length - 1 : 0) : currentIndex - 1;
                focusItem(subItems[nextIndex]);
                return;
            }

            case MenubarActions.First: {
                event.preventDefault();
                event.stopPropagation();
                if (subItems.length > 0) focusItem(subItems[0]);
                return;
            }

            case MenubarActions.Last: {
                event.preventDefault();
                event.stopPropagation();
                if (subItems.length > 0) focusItem(subItems[subItems.length - 1]);
                return;
            }

            case MenubarActions.Select: {
                event.preventDefault();
                event.stopPropagation();
                currentItem.click();
                return;
            }

            case MenubarActions.Type: {
                event.preventDefault();
                event.stopPropagation();
                // Typeahead not implemented for sub-content
                return;
            }
        }

        onKeyDown?.(event);
    }, [sub, getSubItems, getCurrentFocusedItem, focusItem, loop, onKeyDown]);

    const handleMouseEnter = useCallback(() => {
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
            closeTimeoutRef.current = null;
        }
    }, []);

    const handleMouseLeave = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
        if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);

        closeTimeoutRef.current = window.setTimeout(() => {
            const trigger = sub.subTriggerRef.current;
            const subContent = sub.subContentRef.current;
            const { clientX: mouseX, clientY: mouseY } = event.nativeEvent as MouseEvent;

            if (trigger) {
                const rect = trigger.getBoundingClientRect();

                if (
                    mouseX >= rect.left &&
                    mouseX <= rect.right &&
                    mouseY >= rect.top &&
                    mouseY <= rect.bottom
                ) return;
            }

            if (subContent) {
                for (const nestedTrigger of subContent.querySelectorAll("[data-ui='menubar-sub-trigger'][data-state='open']")) {
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

            sub.onOpenChange(false);
        }, 100);
    }, [sub]);

    const handlePointerLeave = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
        const relatedTarget = event.relatedTarget as Node | null;

        if (relatedTarget) {
            const nestedSubContent = (relatedTarget as Element).closest?.("[data-ui='menubar-sub-content']");
            if (nestedSubContent && nestedSubContent !== sub.subContentRef.current) return;
        }

        sub.subContentRef.current?.focus();
    }, [sub.subContentRef]);

    if (!isMounted && !forceMount) return null;

    const Component = asChild ? Slot : "div";

    return (
        <Component
            data-ui="menubar-sub-content"
            data-side={actualSide}
            data-state={sub.isOpen ? "open" : "closed"}

            ref={sub.subContentRef}
            id={sub.subContentId}
            tabIndex={-1}

            aria-labelledby={sub.subTriggerId}
            aria-orientation="vertical"
            role="menu"

            onPointerLeave={handlePointerLeave}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onKeyDown={handleKeyDown}

            style={{
                position: "fixed",
                top: `${top}px`,
                left: `${left}px`,
                zIndex: 51,
                visibility: isPositioned ? "visible" : "hidden",
            }}

            className={cn(
                "min-w-48 w-fit rounded border border-bound bg-surface p-1 shadow-lg",
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

export {
    Menubar,
    MenubarMenu,
    MenubarTrigger,
    MenubarPortal,
    MenubarContent,
    MenubarItem,
    MenubarSeparator,
    MenubarGroup,
    MenubarLabel,
    MenubarCheckboxItem,
    MenubarCheckboxItemIndicator,
    MenubarRadioGroup,
    MenubarRadioItem,
    MenubarRadioItemIndicator,
    MenubarSub,
    MenubarSubTrigger,
    MenubarSubTriggerIndicator,
    MenubarSubContent,
    type MenubarProps,
    type MenubarMenuProps,
    type MenubarTriggerProps,
    type MenubarPortalProps,
    type MenubarContentProps,
    type MenubarItemProps,
    type MenubarSeparatorProps,
    type MenubarGroupProps,
    type MenubarLabelProps,
    type MenubarCheckboxItemProps,
    type MenubarCheckboxItemIndicatorProps,
    type MenubarRadioGroupProps,
    type MenubarRadioItemProps,
    type MenubarRadioItemIndicatorProps,
    type MenubarSubProps,
    type MenubarSubTriggerProps,
    type MenubarSubTriggerIndicatorProps,
    type MenubarSubContentProps,
}