import type { ReactNode, HTMLAttributes, RefObject, KeyboardEvent } from "react";
import { useSelect } from "../hooks/use-select";
import { Slot } from "../../slot";
import { cn } from "../../../cn";

export interface SelectTriggerProps extends HTMLAttributes<HTMLElement> {
    children?: ReactNode;
    asChild?: boolean;
}

export function SelectTrigger({ children, className, asChild, ...props }: SelectTriggerProps) {
    const Element = asChild ? Slot : 'div';

    const {
        idManagement: { trigger: triggerId, contentView: contentViewId },
        refManagement: { trigger: triggerRef },
        openStateManagement: { open, setOpen },
        navigationManagement: { moveCursor },
        valueStateManagement: { value },
        itemManagement: { items },
        formProps: { disabled },
        getActiveItemId,
        keyDownHandler,
        scrollIntoView,
    } = useSelect();

    const clickHandler = () => {
        if (disabled) return;

        if (!open) {
            setOpen(true);
            const index = items.findIndex(i => i.value === value);

            if (index >= 0) {
                moveCursor(index);
                scrollIntoView(index, true);
            } else moveCursor(-1);
        }

        else {
            setOpen(false);
            moveCursor(-1);
        }
    }

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (disabled) return;
        keyDownHandler(event);
    }

    const activeDescendant = open && getActiveItemId() ? getActiveItemId() : undefined;

    return (
        <Element data-ui="select-trigger"
            ref={triggerRef as RefObject<HTMLDivElement>}
            id={triggerId}

            aria-activedescendant={activeDescendant}
            aria-controls={contentViewId}
            aria-disabled={disabled}
            aria-haspopup="listbox"
            aria-expanded={open}

            role="combobox"

            data-disabled={disabled ? "true" : undefined}
            data-state={open ? "open" : "closed"}

            tabIndex={disabled ? -1 : 0}

            onKeyDown={handleKeyDown}
            onClick={clickHandler}

            className={cn(
                "w-fit min-w-xs min-h-8 inline-flex items-center justify-between gap-2 px-3 py-2 rounded text-write border border-bound bg-weak-surface transition-colors",
                "focus:bg-surface focus:outline-none focus:ring-2 focus:ring-bound focus:ring-offset-1",
                "[data-disabled]:opacity-50 [data-disabled]:cursor-not-allowed",
                "[dir='rtl']:flex-row-reverse",
                "hover:bg-surface",
                className
            )}

            {...props}
        >
            {children}
        </Element>
    );
}
