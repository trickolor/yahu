import type { HTMLAttributes } from "react";
import { cn } from "../../../cn";

export interface SelectSeparatorProps extends HTMLAttributes<HTMLElement> { }

export function SelectSeparator({ className, children, ...props }: SelectSeparatorProps) {
    return (
        <hr data-ui="select-separator" aria-orientation="horizontal" role=" separator"
            className={cn("block h-px m-1.5 text-bound", className)}
            {...props}
        >
            {children}
        </hr>
    );
}
