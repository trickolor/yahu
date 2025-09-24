import { type ReactNode, type HTMLAttributes, type RefObject } from "react";
import { Slot } from "../../slot";
import { cn } from "../../../cn";
import { useSelect } from "../hooks/use-select";


export interface SelectContentViewProps extends HTMLAttributes<HTMLElement> {
    children?: ReactNode;
    asChild?: boolean;
}

export function SelectContentView({ children, className, asChild, id, ...props }: SelectContentViewProps) {
    const Element = asChild ? Slot : 'div';

    const {
        refManagement: { contentView: contentViewRef },
        idManagement: { contentView: contentViewId, trigger: triggerId },
        openStateManagement: { open },
    } = useSelect();

    if (!open) return null;

    return (
        <Element data-ui="select-content-view"
            ref={contentViewRef as RefObject<HTMLDivElement>}
            id={id || contentViewId}

            aria-labelledby={triggerId}
            aria-multiselectable="false"

            role="listbox"

            tabIndex={-1}

            className={cn(
                "w-full max-h-96 overflow-y-auto sb-width-thin",
                className
            )}

            {...props}
        >
            {children}
        </Element>
    )
}
