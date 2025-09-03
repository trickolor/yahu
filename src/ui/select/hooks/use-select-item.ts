import { createContext, useContext, type RefObject } from "react";

export interface SelectItemContext {
    textRef: RefObject<HTMLElement | null>;

    textValue?: string;
    value?: string;
    index: number;
    
    isHighlighted: boolean;
    isDisabled?: boolean;
    isSelected: boolean;
}

export const SelectItemContext = createContext<SelectItemContext | null>(null);

export const useSelectItem = (): SelectItemContext => {
    const context = useContext(SelectItemContext);
    if (!context) throw new Error("useSelectItem must be used within a <SelectItem> component");

    return context;
}
