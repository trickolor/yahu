import { type ReactNode, type HTMLAttributes, type RefObject } from "react";
import { useSelect } from "../hooks/use-select";
import { cn } from "../../../cn";

export interface SelectContentProps extends HTMLAttributes<HTMLElement> {
    children?: ReactNode;
    className?: string;
    asChild?: boolean;
}

export function SelectContent({ children, className, asChild, id, ...props }: SelectContentProps) {
    const {
        refManagement: { content: contentRef },
        idManagement: { content: contentId },
        openStateManagement: { open },
    } = useSelect();

    if (!open) return null;

    return (
        <div data-ui="select-content"
            ref={contentRef as RefObject<HTMLDivElement>}
            id={id || contentId}

            data-state={open ? "open" : "closed"}

            className={cn(
                'absolute left-0 top-full z-10 mt-1 min-w-xs p-1.5 rounded-md shadow-lg border border-muted-bound bg-muted-surface',
                "[dir='rtl']:origin-top-right [dir='rtl']:right-0 [dir='rtl']:left-auto",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
