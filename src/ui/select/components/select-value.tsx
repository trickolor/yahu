import type { HTMLAttributes, ReactNode } from "react";
import { useSelect } from "../hooks/use-select";
import { Slot } from "../../slot";
import { cn } from "../../../cn";

export interface SelectValueProps extends HTMLAttributes<HTMLElement> {
    children?: ReactNode;
    asChild?: boolean;
}

export function SelectValue({ children, className, asChild, ...props }: SelectValueProps) {
    const Element = asChild ? Slot : 'span';

    const {
        valueStateManagement: { value },
        itemManagement: { items },
        placeholder,
    } = useSelect();

    const selectedItem = items.find(i => i.value === value);
    const selectedText = value ? (selectedItem?.textValue || selectedItem?.textRef.current?.textContent || value) : '';
    const content = !value ? (placeholder ?? null) : selectedText;

    return (
        <Element data-ui="select-value"

            data-placeholder={!value}

            className={cn(
                "text-sm font-medium text-write overflow-hidden truncate",
                className
            )}

            {...props}
        >
            {children ?? content}
        </Element>
    );
}
