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
    // State management
    onValueChange?: (value: string) => void;
    onOpenChange?: (open: boolean) => void;
    defaultValue?: string;
    defaultOpen?: boolean;
    value?: string;
    open?: boolean;

    // Content related props
    placeholder?: string;
    children?: ReactNode;
    dir?: "ltr" | "rtl";

    // Form compatibility
    name?: string;
    form?: string;
    required?: boolean;
    disabled?: boolean;
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
    children,

    className,
    id,

    name,
    form,
    required,
    disabled,

    ...props
}: SelectProps) {

    // Value state management
    const [selectValue, setSelectValue] = useControllableState({
        defaultValue: defaultValue ?? '',
        onChange: onValueChange,
        value,
    });

    // Open state management
    const [selectOpen, setSelectOpen] = useControllableState({
        defaultValue: defaultOpen ?? false,
        onChange: onOpenChange,
        value: open,
    });

    // Refs
    const contentView = useRef<HTMLElement>(null);
    const trigger = useRef<HTMLElement>(null);
    const content = useRef<HTMLElement>(null);

    // IDs
    const fallbackId = useId();
    const selectId = id || fallbackId;

    const contentViewId = `${selectId}-content-view`;
    const contentId = `${selectId}-content`;
    const triggerId = `${selectId}-trigger`;

    // Item management
    const itemManagement = useSelectItems();
    const { items } = itemManagement;

    const [cursor, moveCursor] = useState(-1);

    const scrollIntoView = useCallback((index: number, shouldCenter: boolean = false) => {
        const item = items[index];
        if (!item?.ref.current || !contentView.current) return;

        const container = contentView.current;
        const option = item.ref.current;

        // For centering, we need to ensure the element is visible first
        const performScroll = () => {
            // If centering is requested (e.g., when opening to selected item)
            if (shouldCenter) {
                // First, reset scroll to top to get accurate measurements
                container.scrollTop = 0;

                // Calculate measurements after reset
                const containerHeight = container.clientHeight;
                const optionTop = option.offsetTop;
                const optionHeight = option.offsetHeight;

                // Calculate scroll position to center the option
                const centerPosition = optionTop - (containerHeight / 2) + (optionHeight / 2);

                // Clamp the scroll position to valid bounds
                const maxScroll = container.scrollHeight - containerHeight;
                const targetScroll = Math.max(0, Math.min(centerPosition, maxScroll));

                // Use immediate scroll (no smooth behavior) for precise positioning
                container.scrollTop = targetScroll;
                return;
            }

            // For first item, scroll to top of container to show any labels above
            if (index === 0) {
                container.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }

            // For last item, scroll to bottom of container to show any separators/padding below
            if (index === items.length - 1) {
                container.scrollTo({
                    top: container.scrollHeight - container.clientHeight,
                    behavior: 'smooth'
                });
                return;
            }

            // For middle items, use normal scroll into view
            const containerRect = container.getBoundingClientRect();
            const optionRect = option.getBoundingClientRect();

            if (optionRect.top < containerRect.top || optionRect.bottom > containerRect.bottom) {
                option.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
        };

        // Use requestAnimationFrame to ensure DOM is updated, with additional delay for centering
        if (shouldCenter) {
            // For centering, we need to wait a bit for the visibility/opacity transition
            setTimeout(() => {
                requestAnimationFrame(performScroll);
            }, 50); // Increased delay to ensure visibility
        } else {
            requestAnimationFrame(performScroll);
        }
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

    // Initialize cursor when select opens
    const handleSelectOpen = useCallback(() => {
        setSelectOpen(true);
        // Find the selected item index and set cursor there
        const selectedIndex = items.findIndex(item => item.value === selectValue);
        if (selectedIndex >= 0) {
            moveCursor(selectedIndex);
            scrollIntoView(selectedIndex, true);
        } else {
            moveCursor(-1);
        }
    }, [setSelectOpen, items, selectValue, moveCursor, scrollIntoView]);

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
            centerMove: (index: number) => scrollIntoView(index, true),

            select: (value: string) => setSelectValue(value),
            close: () => setSelectOpen(false),
            open: handleSelectOpen,
            restoreFocus: () => {
                if (trigger.current) {
                    trigger.current.focus();
                }
            },
        }
    });

    const getActiveItemId = useCallback((): string | undefined => {
        if (cursor >= 0 && cursor < items.length) {
            const activeItem = items[cursor];
            return `${selectId}-item-${activeItem.value}`;
        }
    }, [cursor, items, selectId]);

    const outsideClickHandler = useCallback(() => {
        if (selectOpen) {
            setSelectOpen(false);
            moveCursor(-1);
            // Only restore focus to trigger if the select was actually open
            if (trigger.current) {
                trigger.current.focus();
            }
        }
    }, [selectOpen, setSelectOpen, moveCursor]);

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

        formProps: {
            name,
            form,
            required,
            disabled,
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

                {name && (
                    <select
                        name={name}
                        form={form}
                        required={required}
                        disabled={disabled}
                        value={selectValue}

                        onChange={() => { }}
                        aria-hidden="true"
                        tabIndex={-1}

                        style={{
                            clip: 'rect(0, 0, 0, 0)',
                            pointerEvents: 'none',
                            whiteSpace: 'nowrap',
                            position: 'absolute',
                            overflow: 'hidden',
                            border: 'none',
                            opacity: 0,
                            height: 0,
                            width: 0,
                            padding: 0,
                            margin: 0,
                        }}
                    >
                        <option value="" disabled={required}>
                            {placeholder || ''}
                        </option>

                        {items.map((item) => (
                            <option key={item.value} value={item.value}>
                                {item.textValue ?? item.textRef.current?.textContent ?? item.value}
                            </option>
                        ))}
                    </select>
                )}

                {children}

            </div>
        </SelectContext.Provider>
    )
}
