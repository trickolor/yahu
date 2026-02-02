import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../cn";

const variants = cva(
    cn(
        'w-fit inline-flex items-center justify-center gap-2 rounded shrink-0 font-medium whitespace-nowrap cursor-pointer ring-offset-2 transition-all',
        '[&_svg]:pointer-events-none [&_svg:not([class*="size-"])]:size-4 [&_svg]:shrink-0',
        'focus-visible:outline-none focus-visible:ring-offset-muted-bound focus-visible:ring-outer-bound focus-visible:ring-2',
        'disabled:cursor-not-allowed disabled:opacity-70 disabled:pointer-events-none',
        'aria-invalid:ring-danger aria-invalid:border-danger',
    ),

    {
        variants: {
            variant: {
                default: 'bg-primary-surface text-primary-write hover:bg-primary-surface/85',
                outline: 'border border-bound text-write hover:bg-muted-surface',
                ghost: 'text-primary-surface hover:bg-primary-surface/10',
                danger: 'bg-danger text-white dark:text-black hover:bg-danger/85',
                secondary: 'bg-secondary-surface text-secondary-write hover:bg-secondary-surface/85',
                success: 'bg-success text-white dark:text-black hover:bg-success/85',
                warn: 'bg-warn text-white dark:text-black hover:bg-warn/85',
                link: 'underline underline-offset-4 text-primary-surface hover:text-primary-surface/85',
            },

            size: {
                default: 'px-4 h-8 text-sm',
                sm: 'px-3 h-7 text-xs',
                lg: 'px-5 h-9 text-sm',
                'icon-sm': 'size-7',
                icon: 'size-8',
                'icon-lg': 'size-9',
            },
        },

        defaultVariants: {
            variant: 'default',
            size: 'default',
        }
    },
);

export interface ButtonProps extends
    VariantProps<typeof variants>,
    Omit<React.ComponentProps<'button'>, 'color'> { }

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    function Button({ variant, size, className, children, ...props }, ref) {
        return (
            <button
                data-ui="button"
                ref={ref}
                className={cn(variants({ variant, size }), className)}
                {...props}
            >
                {children}
            </button>
        );
    }
);