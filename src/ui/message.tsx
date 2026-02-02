import type { HTMLAttributes } from "react";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/cn";

// ---------------------------------------------------------------------------------------------------- //

const variants = cva(
    cn(
        'w-fit grid items-start grid-cols-1 py-3 px-4 rounded border border-bound bg-surface text-sm',
        'has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] has-[>svg]:gap-x-4 gap-y-1',
        'has-[>svg]:[&>[data-ui="message-description"]]:col-span-full has-[>svg]:[&>[data-ui="message-description"]]:pl-8',
        'has-[>svg]:[&>svg]:pointer-events-none has-[>svg]:[&>svg]:order-first has-[>svg]:[&>svg]:shrink-0 has-[>svg]:[&>svg]:translate-y-0.5',
        'has-[>svg]:[&>svg]:not([class*="size-"])]:size-4',
        'data-[variant="default"]:text-weak-write',
        'data-[variant="success"]:text-success/75',
        'data-[variant="warn"]:text-warn/75',
        'data-[variant="danger"]:text-danger/75',
    ),
    {
        variants: {
            variant: {
                default: 'text-write',
                success: 'text-success',
                warn: 'text-warn',
                danger: 'text-danger',
            },
        },
        defaultVariants: {
            variant: "default",
        },
    },
);

interface MessageProps extends
    VariantProps<typeof variants>, HTMLAttributes<HTMLElement> { }

function Message({
    variant = 'default',
    className,
    children,
    ...props
}: MessageProps) {
    return (
        <div data-ui="message"
            role="alert"
            data-variant={variant}
            className={cn(variants({ variant }), className)}
            {...props}
        >
            {children}
        </div>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface MessageTitleProps extends HTMLAttributes<HTMLElement> { }

function MessageTitle({
    children,
    className,
    ...props
}: MessageTitleProps) {
    return (
        <h4 data-ui="message-title"
            className={cn('text-base font-medium leading-tight', className)}
            {...props}
        >
            {children}
        </h4>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface MessageDescriptionProps extends HTMLAttributes<HTMLElement> { }

function MessageDescription({
    children,
    className,
    ...props
}: MessageDescriptionProps) {
    return (
        <div data-ui="message-description"
            className={cn('flex flex-col gap-1 justify-start [&_p]:leading-relaxed', className)}
            {...props}
        >
            {children}
        </div>
    );
}

// ---------------------------------------------------------------------------------------------------- //

export {
    Message,
    MessageTitle,
    MessageDescription,
}

export type {
    MessageProps,
    MessageTitleProps,
    MessageDescriptionProps,
}

// ---------------------------------------------------------------------------------------------------- //