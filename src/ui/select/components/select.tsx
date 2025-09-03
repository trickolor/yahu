import {
    useCallback,
    useState,
    useRef,
    useId,

    type HTMLAttributes,
    type ReactNode,
} from "react";

import { useControllableState } from "../../hooks/use-controllable-state";
import { cn } from "../../../cn";

import { SelectContext, type SelectContextState } from "../hooks/use-select";
import { useSelectNavigation } from "../hooks/use-select-navigation";
import { useSelectTypeahead } from "../hooks/use-select-typeahead";
import { useSelectItems } from "../hooks/use-select-items";
import { useOutsideClick } from "../../hooks/use-outside-click";

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
    id,

    ...props
}: SelectProps) {

    const [selectValue, setSelectValue] = useControllableState({
        defaultValue: defaultValue ?? '',
        onChange: onValueChange,
        value,
    });

    const [selectOpen, setSelectOpen] = useControllableState({
        defaultValue: defaultOpen ?? false,
        onChange: onOpenChange,
        value: open,
    });

    const contentView = useRef<HTMLElement>(null);
    const trigger = useRef<HTMLElement>(null);
    const content = useRef<HTMLElement>(null);

    const fallbackId = useId();
    const selectId = id || fallbackId;

    const contentViewId = `${selectId}-content-view`;
    const contentId = `${selectId}-content`;
    const triggerId = `${selectId}-trigger`;

    const itemManagement = useSelectItems();
    const { items } = itemManagement;

    const [cursor, moveCursor] = useState(-1);

    const scrollIntoView = useCallback((index: number) => {
        const item = items[index];
        if (!item?.ref.current || !contentView.current) return;

        const container = contentView.current;
        const containerRect = container.getBoundingClientRect();

        const option = item.ref.current;
        const optionRect = option.getBoundingClientRect();

        if (optionRect.top < containerRect.top || optionRect.bottom > containerRect.bottom)
            option.scrollIntoView({ block: 'nearest', behavior: 'smooth' });

    }, [items, contentView]);

    const typeaheadMatchHandler = useCallback((index: number) => {
        if (index >= 0 && index < items.length) {
            moveCursor(index);
            scrollIntoView(index);
        }
    }, [items, scrollIntoView]);

    const cursorMoveHandler = useCallback((index: number) => {
        moveCursor(index);
        scrollIntoView(index);
    }, [scrollIntoView]);

    const typeahead = useSelectTypeahead({
        matchHandler: typeaheadMatchHandler,
        delay: 500,
        items,
    });

    const typeaheadHandler = useCallback((char: string) => {
        typeahead.setQuery(char);
    }, [typeahead]);

    const { keyDownHandler } = useSelectNavigation({
        value: selectValue,
        open: selectOpen,
        items,

        cursor: {
            move: moveCursor,
            value: cursor,
        },

        handlers: {
            typeahead: typeaheadHandler,
            move: cursorMoveHandler,

            select: (value: string) => setSelectValue(value),
            close: () => setSelectOpen(false),
            open: () => setSelectOpen(true),
        }
    });

    const getActiveItemId = useCallback((): string | undefined => {
        if (cursor >= 0 && cursor < items.length) {
            const activeItem = items[cursor];
            return `${selectId}-item-${activeItem.value}`;
        }
    }, [cursor, items, selectId]);

    const outsideClickHandler = useCallback(() => {
        setSelectOpen(false);
        moveCursor(-1);
    }, [setSelectOpen, moveCursor]);

    useOutsideClick(outsideClickHandler, content, trigger);

    const context: SelectContextState = {
        placeholder, dir,

        itemManagement,

        typeahead,

        refManagement: {
            contentView,
            trigger,
            content,
        },

        valueStateManagement: {
            setValue: setSelectValue,
            value: selectValue,
        },

        openStateManagement: {
            setOpen: setSelectOpen,
            open: selectOpen,
        },

        navigationManagement: {
            moveCursor,
            cursor,
        },

        idManagement: {
            contentView: contentViewId,
            content: contentId,
            trigger: triggerId,
            select: selectId,
        },

        getActiveItemId,
        scrollIntoView,
        keyDownHandler,
    };

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
