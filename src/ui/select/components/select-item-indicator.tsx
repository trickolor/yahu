import type { ReactElement, HTMLAttributes } from "react";
import { useSelectItem } from "../hooks/use-select-item";
import { cn } from "../../../cn";

export interface SelectItemIndicatorProps extends HTMLAttributes<HTMLElement> {
    children?: ReactElement;
}

export function SelectItemIndicator({ children, className, ...props }: SelectItemIndicatorProps) {
    const { isSelected } = useSelectItem();
    if (!isSelected) return null;

    return (
        <span data-ui="select-item-indicator"
            className={cn('block size-4 text-write shrink-0 transition-transform', className)}
            {...props}
        >
            {
                children || <svg data-ui="select-item-indicator-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                >
                    <path
                        d="M20.7071 5.29289C21.0976 5.68342 21.0976 6.31658 20.7071 6.70711L9.70711 17.7071C9.31658 18.0976 8.68342 18.0976 8.29289 17.7071L3.29289 12.7071C2.90237 12.3166 2.90237 11.6834 3.29289 11.2929C3.68342 10.9024 4.31658 10.9024 4.70711 11.2929L9 15.5858L19.2929 5.29289C19.6834 4.90237 20.3166 4.90237 20.7071 5.29289Z"
                        fill="currentColor"
                        fillRule="evenodd"
                        clipRule="evenodd"
                    />
                </svg>
            }
        </span>
    );
}
