import { createContext, useContext } from "react";
import type { KeyboardEvent, ReactNode, RefObject } from "react";
import type { SelectItem } from "./use-select-items";

export interface SelectContextState {
    
    itemManagement: {
        getIndex: (value: string) => number;
        add: (item: SelectItem) => void;
        remove: (value: string) => void;
        items: SelectItem[];
    };

    refManagement: {
        contentView: RefObject<HTMLElement | null>;
        trigger: RefObject<HTMLElement | null>;
        content: RefObject<HTMLElement | null>;
    }

    typeahead: {
        setQuery: (query: string) => void;
        query: string;
    }

    valueStateManagement: {
        setValue: (value: string) => void;
        value: string;
    }

    openStateManagement: {
        setOpen: (open: boolean) => void;
        open: boolean;
    }

    navigationManagement: {
        cursor: number;
        moveCursor: (index: number) => void;
    }

    idManagement: {
        contentView: string;
        content: string;
        trigger: string;
        select: string;
    }

    formProps: {
        name?: string;
        form?: string;
        required?: boolean;
        disabled?: boolean;
    }

    placeholder?: ReactNode;
    dir?: "ltr" | "rtl";

    keyDownHandler: (event: KeyboardEvent) => void;
    getActiveItemId: () => string | undefined;
    scrollIntoView: (index: number, shouldCenter?: boolean) => void;
}

export const SelectContext = createContext<SelectContextState | null>(null);

export const useSelect = (): SelectContextState => {
    const context = useContext(SelectContext);
    if (!context) throw new Error("useSelect must be used within a <Select> component");

    return context;
}
