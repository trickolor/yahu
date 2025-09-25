import { useSelectItem } from "../hooks/use-select-item";
import type { HTMLAttributes } from "react";
import { cn } from "../../../cn";

export interface SelectItemTextProps extends HTMLAttributes<HTMLElement> { }

export function SelectItemText({ className, children, ...props }: SelectItemTextProps) {
    const { textRef, textValue } = useSelectItem();

    return (
        <span data-ui="select-item-text" ref={textRef} className={cn("flex-1 truncate", className)} {...props}>
            {children ?? textValue}
        </span>
    );
}
