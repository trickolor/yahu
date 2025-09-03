import type { HTMLAttributes } from "react";
import { useSelectItem } from "../hooks/use-select-item";
import { Slot } from "../../slot";
import { cn } from "../../../cn";

export interface SelectItemTextProps extends HTMLAttributes<HTMLElement> {
    children?: string;
    asChild?: boolean;
}

export function SelectItemText({ className, children, asChild, ...props }: SelectItemTextProps) {
    const Element = asChild ? Slot : 'span';
    const { textRef, textValue } = useSelectItem();

    return (
        <Element data-ui="select-item-text"
            ref={textRef}
            className={cn("flex-1 truncate", className)}
            {...props}
        >
            {children ?? textValue}
        </Element>
    );
}
