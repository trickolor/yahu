import { useState, useEffect, useRef } from "react";
import type { ReactElement, HTMLAttributes } from "react";

import { Slot } from "../../slot";
import { cn } from "../../../cn";

import { useSelect } from "../hooks/use-select";

// ----------------------------------------------------------------- //
// Component Props
// ----------------------------------------------------------------- //

export interface SelectScrollDownButtonProps extends HTMLAttributes<HTMLElement> {
    children?: ReactElement;
    className?: string;
    asChild?: boolean;
}

export function SelectScrollDownButton({ className, asChild, children, ...props }: SelectScrollDownButtonProps) {
    const { refManagement: { contentView } } = useSelect();
    const [disabled, setDisabled] = useState(true);

    useEffect(() => {
        const view = contentViewRef.current;
        if (!view) return;

        const update = () => { setDisabled(Math.ceil(view.scrollTop + view.clientHeight) >= view.scrollHeight); };
        view.addEventListener('scroll', update);
        update();

        return () => view.removeEventListener('scroll', update);

    }, [contentViewRef]);

    const animationRef = useRef<number | null>(null);
    const isScrolling = useRef(false);

    const scrollStep = () => {
        if (isScrolling.current && contentViewRef.current) {
            contentViewRef.current.scrollBy({ top: 2, behavior: 'auto' });
            animationRef.current = requestAnimationFrame(scrollStep);
        }
    };

    const handleMouseEnter = () => {
        if (!isScrolling.current) {
            isScrolling.current = true;
            scrollStep();
        }
    };

    const handleMouseLeave = () => {
        isScrolling.current = false;
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            isScrolling.current = false;
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, []);

    if (asChild) return (

        <Slot data-ui="select-scroll-down-button"
            disabled={disabled}

            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}

            className={className}
            {...props}
        >
            {children}
        </Slot>
    );

    return (
        <button data-ui="select-scroll-down-button"
            disabled={disabled}

            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}

            className={cn(
                "w-full flex justify-center py-1 hover:bg-surface transition-colors",
                disabled && "opacity-50 cursor-not-allowed",
                className
            )}
            {...props}
        >
            <svg data-ui="select-scroll-down-icon"
                className="size-4 text-write shrink-0"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
            >
                <path
                    d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                    fill="currentColor"
                    fillRule="evenodd"
                    clipRule="evenodd"
                />
            </svg>

        </button>
    )
}
