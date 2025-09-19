import {
    useEffect,
    useRef,

    type HTMLAttributes,
    type ReactNode,
} from "react";

import { SelectItemContext } from "../hooks/use-select-item";
import { useSelect } from "../hooks/use-select";

import { Slot } from "../../slot"
import { cn } from "../../../cn";

export interface SelectItemProps extends HTMLAttributes<HTMLElement> {
    textValue?: string;
    value?: string;

    isDisabled?: boolean;

    children?: ReactNode;
    className?: string;
    asChild?: boolean;
}

export function SelectItem({
    textValue,
    value,

    isDisabled,
    className,
    children,
    asChild,

    ...props
}: SelectItemProps) {

    const {
        itemManagement: { add, remove, getIndex, items },
        navigationManagement: { cursor, moveCursor },
        valueStateManagement: { value: selectedValue, setValue },
        openStateManagement: { setOpen },
        idManagement: { select: selectId },
        scrollIntoView,
    } = useSelect();

    const textRef = useRef<HTMLDivElement>(null);
    const ref = useRef<HTMLDivElement>(null);
    const reg = useRef<string>(value ?? "");

    useEffect(() => {
        const resolvedValue = value ?? ref.current?.textContent ?? '';
        const resolvedText = textValue ?? textRef.current?.textContent ?? resolvedValue;
        reg.current = resolvedValue;

        add({
            index: items.length,

            textValue: resolvedText,
            value: resolvedValue,

            textRef,
            ref,
        });

        return () => { if (reg.current) remove(reg.current) };

    }, [add, remove, textValue, value]);

    const Element = asChild ? Slot : 'div';

    const resolvedValue = reg.current || value || '';
    const index = getIndex(resolvedValue);
    const id = props.id || `${selectId}-item-${resolvedValue}`;

    const isHighlighted = index >= 0 && cursor === index;
    const isSelected = !!resolvedValue && selectedValue === resolvedValue;

    const mouseEnterHandler = () => {
        if (isDisabled) return;

        if (index >= 0) {
            moveCursor(index);
            scrollIntoView(index);
        }
    };

    const mouseLeaveHandler = () => {
        // Don't reset cursor on mouse leave to avoid disrupting keyboard navigation
        // The cursor will be managed by keyboard events and clicks
    };

    const clickHandler = () => {
        if (isDisabled) return;

        if (resolvedValue) {
            setValue(resolvedValue);
            setOpen(false);
        }
    };

    const context: SelectItemContext = {
        textValue: textValue ?? reg.current,
        textRef,

        value: resolvedValue,
        index,

        isHighlighted,
        isSelected,
        isDisabled,
    }

    return (
        <SelectItemContext.Provider value={context}>
            <Element data-ui="select-item"
                ref={ref}
                id={id}

                role="option"

                aria-selected={isHighlighted}
                aria-disabled={isDisabled}

                data-highlighted={isHighlighted}
                data-selected={isSelected}
                data-disabled={isDisabled}
                data-value={resolvedValue}
                data-index={index}

                onMouseEnter={mouseEnterHandler}
                onMouseLeave={mouseLeaveHandler}
                onClick={clickHandler}

                className={cn(
                    "flex items-center justify-between w-full text-sm text-write py-2.5 px-1.5 rounded transition-colors cursor-pointer",
                    "[&[aria-disabled='true']]:opacity-50 [&[aria-disabled='true']]:cursor-not-allowed",
                    "[&[data-highlighted='true']]:bg-surface",
                    "[&[data-selected='true']]:font-medium",
                    className
                )}
                {...props}
            >
                {children}
            </Element>
        </SelectItemContext.Provider>
    );
}
