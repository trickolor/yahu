import { useId } from "react";
import type { ReactNode, HTMLAttributes } from "react";

import { Slot } from "../../slot";
import { cn } from "../../../cn";

export interface SelectLabelProps extends HTMLAttributes<HTMLElement> {
    children?: ReactNode;
    className?: string;
    asChild?: boolean;
}

export function SelectLabel({ children, className, asChild, id, ...props }: SelectLabelProps) {
    const Element = asChild ? Slot : 'span';

    return (
        <Element data-ui="select-label"
            role="label"

            className={cn(
                "block w-fit text-write px-1.5 py-1 text-xs leading-none font-medium tracking-wide",
                "[&[dir='rtl']]:text-right",
                className
            )}

            {...props}
        >
            {children}
        </Element>
    );
}
