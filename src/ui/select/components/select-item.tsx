import {
    useEffect,
    useRef,

    type HTMLAttributes,
} from "react";

import { SelectItemContext } from "../hooks/use-select-item";
import { useSelect } from "../hooks/use-select";

import { cn } from "../../../cn";

export interface SelectItemProps extends HTMLAttributes<HTMLElement> {
    disabled?: boolean;
    textValue?: string;
    value?: string;
}

export function SelectItem({
    textValue,
    value,

    disabled,
    className,
    children,

    ...props
}: SelectItemProps) {

    const {
        valueStateManagement: { value: selectedValue, setValue },
        itemManagement: { add, remove, getIndex, items },
        navigationManagement: { cursor, moveCursor },
        idManagement: { select: selectId },
        openStateManagement: { setOpen },
        scrollIntoView,
    } = useSelect();

    const textRef = useRef<HTMLDivElement>(null);
    const ref = useRef<HTMLDivElement>(null);
    const reg = useRef<string>(value ?? "");

    useEffect(() => {
        const resolvedValue = value ?? ref.current?.dataset?.value ?? ref.current?.textContent?.trim() ?? '';
        
        // Get text content - prefer explicit textValue, then from textRef, then from content, finally fallback to value
        const getResolvedText = () => {
            if (textValue) return textValue;
            if (textRef.current?.textContent) return textRef.current.textContent.trim();
            if (ref.current?.textContent) return ref.current.textContent.trim();
            return resolvedValue;
        };
        
        const resolvedText = getResolvedText();
        reg.current = resolvedValue;

        add({
            textValue: resolvedText,
            value: resolvedValue,
            index: items.length,
            textRef,
            ref,
        });

        return () => { if (reg.current) remove(reg.current) };
    }, [add, remove, textValue, value, items.length]);

    const resolvedValue = reg.current || value || '';
    const id = props.id || `${selectId}-item-${resolvedValue}`;
    const index = getIndex(resolvedValue);

    const selected = !!resolvedValue && selectedValue === resolvedValue;
    const highlighted = index >= 0 && cursor === index;

    const mouseEnterHandler = () => {
        if (disabled) return;

        if (index >= 0) {
            moveCursor(index);
            scrollIntoView(index);
        }
    };

    const clickHandler = () => {
        if (disabled) return;

        if (resolvedValue) {
            setValue(resolvedValue);
            setOpen(false);
            // Move cursor to selected item
            moveCursor(index);
        }
    };

    const context: SelectItemContext = {
        textValue: textValue ?? reg.current,
        textRef,

        value: resolvedValue,
        index,

        highlighted,
        selected,
        disabled,
    }

    return (
        <SelectItemContext.Provider value={context}>
            <div data-ui="select-item" role="option"

                ref={ref}
                id={id}

                aria-selected={highlighted ? true : selected}
                aria-disabled={disabled}

                data-highlighted={highlighted}
                data-selected={selected}
                data-disabled={disabled}

                onMouseEnter={mouseEnterHandler}
                onClick={clickHandler}

                className={cn(
                    "flex items-center justify-between w-full text-sm text-write py-2.5 px-1.5 rounded transition-colors cursor-pointer relative",
                    "hover:bg-surface focus:bg-surface focus:outline-none",

                    "[data-disabled='true']:opacity-50 [data-disabled='true']:cursor-not-allowed [data-disabled='true']:hover:bg-transparent",
                    "[data-highlighted='true']:bg-surface [data-highlighted='true']:ring-2 [data-highlighted='true']:ring-blue-500/20",
                    "[data-selected='true']:font-medium [data-selected='true']:bg-blue-50",

                    className
                )}
                {...props}
            >
                {children}
            </div>
        </SelectItemContext.Provider>
    );
}
