import type { ReactNode, HTMLAttributes } from "react";
import { cn } from "../../../cn";

export interface SelectGroupProps extends HTMLAttributes<HTMLElement> {
    children?: ReactNode;
    className?: string;
    asChild?: boolean;
}

export function SelectGroup({ children, className, asChild, ...props }: SelectGroupProps) {
    return (
        <div data-ui="select-group"

            className={cn("w-full space-y-px py-1 px-1.5", className)}
            role="group"

            {...props}
        >
            {children}
        </div>
    );
}
