import type { ReactNode, HTMLAttributes } from "react";

import { Slot } from "../../slot";
import { cn } from "../../../cn";

export interface SelectGroupProps extends HTMLAttributes<HTMLElement> {
    children?: ReactNode;
    className?: string;
    asChild?: boolean;
}

export function SelectGroup({ children, className, asChild, ...props }: SelectGroupProps) {
    const Element = asChild ? Slot : 'div';

    return (
        <Element data-ui="select-group"
            role="group"

            className={cn("w-full space-y-px py-1", className)}

            {...props}
        >
            {children}
        </Element>
    );
}
