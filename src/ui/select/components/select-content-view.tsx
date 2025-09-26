import { type ReactNode, type HTMLAttributes, type RefObject } from "react";
import { useSelect } from "../hooks/use-select";
import { cn } from "../../../cn";


export interface SelectContentViewProps extends HTMLAttributes<HTMLElement> {
    children?: ReactNode;
    asChild?: boolean;
}

export function SelectContentView({ children, className, asChild, id, ...props }: SelectContentViewProps) {
    const {
        idManagement: { contentView: contentViewId, trigger: triggerId },
        refManagement: { contentView: contentViewRef },
        openStateManagement: { open },
    } = useSelect();

    if (!open) return null;

    return (
        <div data-ui="select-content-view" role="listbox"

            ref={contentViewRef as RefObject<HTMLDivElement>}
            id={id || contentViewId}

            aria-multiselectable="false"
            aria-labelledby={triggerId}

            tabIndex={-1}

            className={cn(
                "[scrollbar-width:none] w-full max-h-96 overflow-y-auto",
                className
            )}

            {...props}
        >
            {children}
        </div>
    )
}
