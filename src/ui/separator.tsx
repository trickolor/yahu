import { type HTMLAttributes } from "react";
import { cn } from "@/cn";

// ---------------------------------------------------------------------------------------------------- //

interface SeparatorProps extends HTMLAttributes<HTMLElement> {
    orientation?: 'horizontal' | 'vertical';
    decorative?: boolean;
}

function Separator({
    orientation = 'horizontal',
    decorative = false,
    className,
    ...props
}: SeparatorProps) {
    return (
        <span
            data-ui="separator"
            data-orientation={orientation}

            role={decorative ? 'presentation' : 'separator'}
            aria-orientation={orientation}

            className={cn(
                'block shrink-0 bg-muted-bound',
                'data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full',
                'data-[orientation=vertical]:w-px data-[orientation=vertical]:self-stretch',
                className
            )}

            {...props}
        />
    );
}

// ---------------------------------------------------------------------------------------------------- //

export { Separator, type SeparatorProps }

// ---------------------------------------------------------------------------------------------------- //

