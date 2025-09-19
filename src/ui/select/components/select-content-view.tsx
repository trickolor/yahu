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


    return (
        <Element data-ui="select-content-view"
            ref={contentViewRef as RefObject<HTMLDivElement>}
            id={id || contentViewId}

            style={{ 
                scrollbarWidth: 'none',
                visibility: open ? 'visible' : 'hidden',
                opacity: open ? 1 : 0,
            }}

            role="listbox"
            tabIndex={-1}
            aria-labelledby={triggerId}
            aria-multiselectable="false"

            className={cn(
                "w-full max-h-96 overflow-y-auto [&::-webkit-scrollbar]:hidden",
                className
            )}

            {...props}
        >
            {children}
        </Element>
    )
}
