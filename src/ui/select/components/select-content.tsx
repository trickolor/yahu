import { Slot } from "../../slot";
import { cn } from "../../../cn";
import { type ReactNode, type HTMLAttributes, type RefObject } from "react";
import { useSelect } from "../hooks/use-select";

export interface SelectContentProps extends HTMLAttributes<HTMLElement> {
    children?: ReactNode;
    className?: string;
    asChild?: boolean;
}

export function SelectContent({ children, className, asChild, id, ...props }: SelectContentProps) {
    const Element = asChild ? Slot : 'div';
    
    const {
        refManagement: { content: contentRef },
        idManagement: { content: contentId },
        openStateManagement: { open },
    } = useSelect();

    return (
        <Element data-ui="select-content"
            ref={contentRef as RefObject<HTMLDivElement>}
            id={id || contentId}
            style={{
                visibility: open ? 'visible' : 'hidden',
                opacity: open ? 1 : 0,
            }}

            className={cn(
                'absolute left-0 top-full z-10 mt-1 min-w-xs p-1.5 rounded shadow border border-weak-bound bg-weak-surface transition-opacity duration-150',
                "[&[dir='rtl']]:origin-top-right [&[dir='rtl']]:right-0 [&[dir='rtl']]:left-auto",
                className
            )}
            {...props}
        >
            {children}
        </Element>
    );
}
