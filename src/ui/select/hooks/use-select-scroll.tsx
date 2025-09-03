import { useEffect, useRef, useState } from "react";
import { useSelect } from "./use-select";

export interface UseSelectScrollOptions {
    direction: 'up' | 'down';
    speed?: number;
}

export interface UseSelectScrollReturn {
    disabled: boolean;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
}

export function useSelectScroll({ direction, speed = 2 }: UseSelectScrollOptions): UseSelectScrollReturn {
    const { refManagement: { contentView } } = useSelect();

    const [disabled, setDisabled] = useState(true);
    const animationRef = useRef<number | null>(null);
    const isScrolling = useRef(false);

    useEffect(() => {
        const view = contentView.current;
        if (!view) return;

        const updateDisabled = () => {
            if (direction === 'up') setDisabled(view.scrollTop <= 0);
            else setDisabled(Math.ceil(view.scrollTop + view.clientHeight) >= view.scrollHeight);
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

    const onMouseEnter = () => {
        if (!isScrolling.current) {
            isScrolling.current = true;
            step();
        }
    };

    const onMouseLeave = () => {
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

    return { disabled, onMouseEnter, onMouseLeave };
}


