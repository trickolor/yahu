import type { HTMLAttributes, ReactNode } from "react";
import { useSelect } from "../hooks/use-select";
import { cn } from "../../../cn";

export interface SelectValueProps extends HTMLAttributes<HTMLElement> {
    children?: ReactNode;
    asChild?: boolean;
}

export function SelectValue({ children, className, asChild, ...props }: SelectValueProps) {
    const {
        valueStateManagement: { value },
        itemManagement: { items },
        placeholder,
    } = useSelect();

    const selectedItem = items.find(i => i.value === value);
    
    // Get the display text - prioritize textValue, then fallback to textContent, then value
    const getDisplayText = () => {
        if (!value || !selectedItem) return '';
        
        // First try the explicitly set textValue
        if (selectedItem.textValue) {
            return selectedItem.textValue;
        }
        
        // Then try to get text content from the DOM element
        if (selectedItem.textRef.current?.textContent) {
            return selectedItem.textRef.current.textContent.trim();
        }
        
        // Fallback to the value itself
        return value;
    };
    
    const selectedText = getDisplayText();
    const content = !value ? (placeholder ?? null) : selectedText;

    return (
        <span data-ui="select-value" data-placeholder={!value}
            className={cn("text-sm font-medium text-write overflow-hidden truncate", className)}
            {...props}
        >
            {children ?? content}
        </span>
    );
}
