import { useEffect, useRef, useState } from "react";
import { useSelect } from "./use-select";

export interface UseSelectScrollOptions {
    direction: 'up' | 'down';
    speed?: number;
}

export interface UseSelectScrollReturn {
    isDisabled: boolean;
    mouseEnterHandler: () => void;
    mouseLeaveHandler: () => void;
}

export function useSelectScroll({ direction, speed = 2 }: UseSelectScrollOptions): UseSelectScrollReturn {
    const { refManagement: { contentView } } = useSelect();

    const [isDisabled, setIsDisabled] = useState(true);
    const animationRef = useRef<number | null>(null);
    const isScrolling = useRef(false);

    useEffect(() => {
        const view = contentView.current;
        if (!view) return;

        const updateDisabled = () => {
            if (direction === 'up') setIsDisabled(view.scrollTop <= 0);
            else setIsDisabled(Math.ceil(view.scrollTop + view.clientHeight) >= view.scrollHeight);
        };

        view.addEventListener('scroll', updateDisabled);
        updateDisabled();

        return () => view.removeEventListener('scroll', updateDisabled);
    }, [contentView, direction]);

    const step = () => {
        const view = contentView.current;
        if (!view) return;

        if (isScrolling.current) {
            const delta = direction === 'up' ? -speed : speed;
            view.scrollBy({ top: delta, behavior: 'auto' });
            animationRef.current = requestAnimationFrame(step);
        }
    };

    const mouseEnterHandler = () => {
        if (!isScrolling.current) {
            isScrolling.current = true;
            step();
        }
    };

    const mouseLeaveHandler = () => {
        isScrolling.current = false;
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
        }
    };

    useEffect(() => () => {
        isScrolling.current = false;
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
    }, []);

    return { isDisabled, mouseEnterHandler, mouseLeaveHandler };
}


