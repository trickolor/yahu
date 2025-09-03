import { SelectActions, getSelectAction } from "../helpers/get-select-action";
import type { SelectItem } from "./use-select-items";
import { useCallback } from "react";
import type { KeyboardEvent } from "react";

export interface UseSelectNavigationOptions {
    items: SelectItem[];
    open: boolean;
    value: string;

    cursor: {
        move: (index: number) => void;
        value: number;
    }

    handlers: {
        typeahead: (char: string) => void;
        select: (value: string) => void;
        move: (index: number) => void;
        close: () => void;
        open: () => void;
    }
}

export interface UseSelectNavigationReturn {
    keyDownHandler: (event: KeyboardEvent) => void;
}

export function useSelectNavigation({
    handlers,
    cursor,
    items,
    value,
    open,
}: UseSelectNavigationOptions): UseSelectNavigationReturn {

    const keyDownHandler = useCallback((event: KeyboardEvent) => {

        const action = getSelectAction(event.key, open, event.altKey);
        if (action !== SelectActions.None) event.preventDefault();

        switch (action) {

            case SelectActions.Open:
                handlers.open();
                cursor.move(-1);
                break;

            case SelectActions.OpenFirst:
                handlers.open();

                if (items.length > 0) {
                    cursor.move(0);
                    handlers.move(0);
                }

                break;

            case SelectActions.OpenLast:
                handlers.open();

                if (items.length > 0) {
                    const last = items.length - 1;
                    cursor.move(last);
                    handlers.move(last);
                }

                break;

            case SelectActions.OpenCurrent: {
                handlers.open();
                const index = items.findIndex(i => i.value === value);

                if (index >= 0) {
                    cursor.move(index);
                    handlers.move(index);
                }

                break;
            }

            case SelectActions.Select:
            case SelectActions.CloseSelect:
                if (cursor.value >= 0 && cursor.value < items.length)
                    handlers.select(items[cursor.value].value);

                handlers.close();
                cursor.move(-1);

                break;

            case SelectActions.Previous:
                if (cursor.value > 0) {
                    const prev = cursor.value - 1;
                    cursor.move(prev);
                    handlers.move(prev);
                }

                break;

            case SelectActions.Next:
                if (cursor.value < items.length - 1) {
                    const next = cursor.value + 1;
                    cursor.move(next);
                    handlers.move(next);
                }

                break;

            case SelectActions.First:
                if (items.length > 0) {
                    cursor.move(0);
                    handlers.move(0);
                }

                break;

            case SelectActions.Last:
                if (items.length > 0) {
                    const last = items.length - 1;
                    cursor.move(last);
                    handlers.move(last);
                }

                break;

            case SelectActions.PageUp:
                if (items.length > 0) {
                    const up = Math.max(0, cursor.value - 10);
                    cursor.move(up);
                    handlers.move(up);
                }

                break;

            case SelectActions.PageDown:
                if (items.length > 0) {
                    const down = Math.min(items.length - 1, cursor.value + 10);
                    cursor.move(down);
                    handlers.move(down);
                }

                break;

            case SelectActions.Typeahead:
                handlers.typeahead(event.key);
                break;

            case SelectActions.Close:
                handlers.close();
                cursor.move(-1);
                break;

            case SelectActions.None:
            default: break;
        }
    }, [open, items, cursor, handlers, value]);

    return { keyDownHandler };
}
