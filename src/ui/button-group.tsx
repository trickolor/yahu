import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/cn";
import type { HTMLAttributes } from "react";

// ---------------------------------------------------------------------------------------------------- //

const buttonGroupVariants = cva(
    cn(
        'flex w-fit items-stretch',
        'has-[select[aria-hidden="true"]:last-child]:[&>[data-ui="select-trigger"]:last-of-type]:rounded-r-md',
        '[&>[data-ui="select-trigger"]:not([class*="w-"])]:w-fit',
        '[&>*]:focus-visible:z-10 [&>*]:focus-visible:relative',
        'has-[>[data-ui="button-group"]]:gap-2',
        '[&>input]:flex-1',
    ),

    {
        variants: {
            orientation: {
                horizontal: cn(
                    '[&>*:not(:first-child)]:rounded-l-none [&>*:not(:first-child)]:border-l-0',
                    '[&>*:not(:last-child)]:rounded-r-none',
                ),
                vertical: cn(
                    'flex-col',
                    '[&>*:not(:first-child)]:rounded-t-none [&>*:not(:first-child)]:border-t-0',
                    '[&>*:not(:last-child)]:rounded-b-none',
                ),
            },
        },

        defaultVariants: {
            orientation: 'horizontal',
        },
    },
);

interface ButtonGroupProps extends
    VariantProps<typeof buttonGroupVariants>,
    HTMLAttributes<HTMLElement> { }

function ButtonGroup({
    orientation = 'horizontal',
    className,
    children,
    ...props
}: ButtonGroupProps) {
    return (
        <div
            data-ui="button-group"
            data-orientation={orientation ?? 'horizontal'}
            aria-orientation={orientation ?? 'horizontal'}
            role="group"
            className={cn(buttonGroupVariants({ orientation }), className)}
            {...props}
        >
            {children}
        </div>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface ButtonGroupSeparatorProps extends HTMLAttributes<HTMLElement> {
    orientation?: 'horizontal' | 'vertical';
}

function ButtonGroupSeparator({
    className,
    orientation = 'vertical',
    ...props }: ButtonGroupSeparatorProps) {
    return (
        <span
            data-ui="button-group-separator"
            data-orientation={orientation ?? 'horizontal'}
            aria-orientation={orientation ?? 'horizontal'}
            role="separator"
            className={(cn(
                'bg-muted-bound block self-stretch',
                'data-[orientation="vertical"]:w-px data-[orientation="vertical"]:ml-px',
                'data-[orientation="horizontal"]:h-px data-[orientation="horizontal"]:mt-px',
                className,
            ))}
            {...props}
        >

        </span>
    )
}

// ---------------------------------------------------------------------------------------------------- //

export { ButtonGroup, ButtonGroupSeparator, type ButtonGroupProps, type ButtonGroupSeparatorProps }

// ---------------------------------------------------------------------------------------------------- //