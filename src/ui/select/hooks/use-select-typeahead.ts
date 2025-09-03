import { useCallback, useState, useRef } from "react";
import type { SelectItem } from "./use-select-items";

export interface UseSelectTypeaheadOptions {
    matchHandler: (index: number) => void;
    items: SelectItem[];
    delay?: number;
}

export interface UseSelectTypeaheadReturn {
    setQuery: (char: string) => void;
    query: string;
}

export function useSelectTypeahead({
    matchHandler,
    delay = 500,
    items,
}: UseSelectTypeaheadOptions): UseSelectTypeaheadReturn {

    const [text, setText] = useState('');
    const timeoutRef = useRef<number | null>(null);

    const setQuery = useCallback((char: string) => {
        if (!/^[a-zA-Z0-9]$/.test(char)) return;

        setText(prevText => {
            const newText = prevText + char.toLowerCase();

            const index = items.findIndex(item =>
                item.textValue.toLowerCase().startsWith(newText)
            );

            if (index >= 0) {
                matchHandler(index);
            }

            return newText;
        });

        if (timeoutRef.current !== null)
            clearTimeout(timeoutRef.current);

        timeoutRef.current = window.setTimeout(() => {
            setText('');
            timeoutRef.current = null;
        }, delay);

    }, [items, matchHandler, delay]);

    return { setQuery, query: text };
}
