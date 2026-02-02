import type { HTMLAttributes } from "react";
import { cn } from "@/cn";

// ---------------------------------------------------------------------------------------------------- //

interface CardProps extends HTMLAttributes<HTMLElement> { }

function Card({ className, children, ...props }: CardProps) {
    return (
        <div
            data-ui="card"
            className={cn(
                'w-fit min-w-sm rounded border shadow border-bound bg-surface py-6 flex flex-col gap-6',
                className,
            )}
            {...props}
        >
            {children}
        </div>
    )
}

// ---------------------------------------------------------------------------------------------------- //

interface CardHeaderProps extends HTMLAttributes<HTMLElement> { }

function CardHeader({ className, children, ...props }: CardHeaderProps) {
    return (
        <div
            data-ui="card-header"
            className={cn(
                'px-6 [.border-b]:pb-6',
                className,
            )}
            {...props}
        >
            {children}
        </div>
    )
}

// ---------------------------------------------------------------------------------------------------- //

interface CardContentProps extends HTMLAttributes<HTMLElement> { }

function CardContent({ className, children, ...props }: CardContentProps) {
    return (
        <div
            data-ui="card-content"
            className={cn(
                'px-6',
                className,
            )}
            {...props}
        >
            {children}
        </div>
    )
}

// ---------------------------------------------------------------------------------------------------- //

interface CardFooterProps extends HTMLAttributes<HTMLElement> { }

function CardFooter({ className, children, ...props }: CardFooterProps) {
    return (
        <div
            data-ui="card-footer"
            className={cn(
                'px-6 [.border-t]:pt-6',
                className,
            )}
            {...props}
        >
            {children}
        </div>
    )
}

// ---------------------------------------------------------------------------------------------------- //

interface CardTitleProps extends HTMLAttributes<HTMLElement> { }

function CardTitle({ className, children, ...props }: CardTitleProps) {
    return (
        <h4
            data-ui="card-title"
            className={cn(
                'text-write font-semibold',
                className,
            )}
            {...props}
        >
            {children}
        </h4>
    )
}

// ---------------------------------------------------------------------------------------------------- //

interface CardDescriptionProps extends HTMLAttributes<HTMLElement> { }

function CardDescription({ className, children, ...props }: CardDescriptionProps) {
    return (
        <p
            data-ui="card-description"
            className={cn(
                'text-sm text-muted-write',
                className,
            )}
            {...props}
        >

            {children}
        </p>
    )
}

// ---------------------------------------------------------------------------------------------------- //

export {
    Card,
    CardHeader,
    CardContent,
    CardFooter,
    CardTitle,
    CardDescription,
    type CardProps,
    type CardHeaderProps,
    type CardContentProps,
    type CardFooterProps,
    type CardTitleProps,
    type CardDescriptionProps,
}

// ---------------------------------------------------------------------------------------------------- //