import type { ReactElement, HTMLAttributes } from "react";
import { Slot } from "../../slot";
import { cn } from "../../../cn";

export interface SelectSeparatorProps extends HTMLAttributes<HTMLElement> {
    children?: ReactElement;
    asChild?: boolean;
}

export function SelectSeparator({ className, asChild, children, ...props }: SelectSeparatorProps) {
    const Element = asChild ? Slot : 'hr';

    return (
        <Element data-ui="select-separator"

            role="separator"
            aria-orientation="horizontal"

            className={cn("block h-px m-1.5 bg-weak-bound", className)}

            {...props}
        >
            {children}
        </Element>
    );
}
