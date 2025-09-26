import type { HTMLAttributes } from "react";
import { cn } from "../../../cn";

export interface SelectGroupProps extends HTMLAttributes<HTMLElement> { }

export function SelectGroup({ children, className, ...props }: SelectGroupProps) {
    return (
        <div data-ui="select-group" className={cn("w-full space-y-px py-1 px-1.5", className)} role="group" {...props}>
            {children}
        </div>
    );
}
