import { Slot } from "../../slot";
import { cn } from "../../../cn";
import type { HTMLAttributes, ReactNode } from "react";
import { useSelect } from "../hooks/use-select";

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
    const selectedText = value ? (selectedItem?.textRef.current?.textContent || selectedItem?.textValue || value) : '';

    const isPlaceholder = !value;
    const content = isPlaceholder ? (placeholder ?? null) : selectedText;

    return (
        <Element data-ui="select-value"

            data-placeholder={isPlaceholder}

            className={cn(
                "text-sm font-medium overflow-hidden truncate",
                className
            )}
            {...props}
        >
            {children ?? content}
        </Element>
    );
}
