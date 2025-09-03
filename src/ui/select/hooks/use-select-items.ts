import { useCallback, useState, type RefObject } from "react";

export interface SelectItem {
    textRef: RefObject<HTMLElement | null>;
    ref: RefObject<HTMLElement | null>;
    index: number;
    value: string;
    textValue: string;
}

export interface UseSelectItemsReturn {
    getIndex: (value: string) => number;
    add: (item: SelectItem) => void;
    remove: (value: string) => void;
    items: SelectItem[];
}

export function useSelectItems(): UseSelectItemsReturn {
    const [items, setItems] = useState<SelectItem[]>([]);

    const add = useCallback((item: SelectItem) => {
        setItems(prev => {
            const filtered = prev.filter(existingItem => existingItem.value !== item.value);
            return [...filtered, item];
        });
    }, []);

    const remove = useCallback((value: string) => {
        setItems(prev => prev.filter(item => item.value !== value));
    }, []);

    const getIndex = useCallback((value: string) => {
        return items.findIndex(item => item.value === value);
    }, [items]);

    return { items, add, remove, getIndex };
}
