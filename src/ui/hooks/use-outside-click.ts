import { useCallback, useEffect } from "react";

export const useOutsideClick = (
    callback: (callbackEvent: MouseEvent) => void,
    ...refs: React.RefObject<HTMLElement | null>[]
): void => {
    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            const isElementClicked = (ref: React.RefObject<HTMLElement | null>) =>
                event.target instanceof Node && ref.current?.contains(event.target);

            const isClickOutside = refs.every((ref) => !isElementClicked(ref));
            if (isClickOutside) useCallback(() => callback(event), [callback]);
        }

        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);

    }, [callback, refs]);
}