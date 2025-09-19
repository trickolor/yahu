import type { ReactNode, HTMLAttributes, RefObject } from "react";
import React from "react";

import { Slot } from "../../slot";
import { cn } from "../../../cn";
import { useSelect } from "../hooks/use-select";

export interface SelectTriggerProps extends HTMLAttributes<HTMLButtonElement> {
    children?: ReactNode;
    asChild?: boolean;
}

export function SelectTrigger({ children, className, asChild, ...props }: SelectTriggerProps) {
    const Element = asChild ? Slot : 'button';

    const {
        refManagement: { trigger: triggerRef },
        idManagement: { trigger: triggerId, contentView: contentViewId },
        openStateManagement: { open, setOpen },
        valueStateManagement: { value },
        itemManagement: { items },
        navigationManagement: { moveCursor },
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
                scrollIntoView(index, true); // Center the selected item
            } else {
                // If no value is selected, don't set cursor to any item
                moveCursor(-1);
            }
        }
        else {
            setOpen(false);
            moveCursor(-1);
        }
    }

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (disabled) return;
        keyDownHandler(event);
    }

    return (
        <Element data-ui="select-trigger"
            ref={triggerRef as RefObject<HTMLButtonElement>}
            id={triggerId}

            role="combobox"
            aria-activedescendant={open && getActiveItemId() ? getActiveItemId() : undefined}
            aria-controls={contentViewId}
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-disabled={disabled}

            type="button"
            disabled={disabled}
            tabIndex={disabled ? -1 : 0}

            onKeyDown={handleKeyDown}
            onClick={clickHandler}

            className={cn(
                "w-fit min-w-xs min-h-8 inline-flex items-center justify-between gap-2 px-3 py-2 rounded text-write border border-bound bg-weak-surface",
                "[&[dir='rtl']]:flex-row-reverse",
                disabled && "opacity-50 cursor-not-allowed",
                className
            )}

            {...props}
        >
            {children}
        </Element>
    );
}
