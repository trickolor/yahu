import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../cn";

const variants = cva(
    cn(
        'w-fit inline-flex items-center justify-center gap-2 rounded text-sm shrink-0 font-medium whitespace-nowrap cursor-pointer ring-offset-2 transition-all',
        '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg:not([class*="size-"])]:size-4 [&_svg]:shrink-0',
        'focus-visible:outline-none focus-visible:ring-outer-bound focus-visible:ring-2',
        'disabled:cursor-not-allowed disabled:opacity-70 disabled:pointer-events-none',
        'aria-invalid:ring-error aria-invalid:border-error',
    ),
    {
        variants: {

            variant: {
                default: 'bg-primary text-write hover:bg-primary/85',
                secondary: 'bg-secondary text-write hover:bg-secondary/85',

                outline: 'border-2 border-bound text-write hover:bg-surface-weak hover:text-write-weak',

                ghost: 'hover:bg-surface-weak hover:text-write-weak',

                warning: 'bg-warning text-write hover:bg-warning/85',
                success: 'bg-success text-write hover:bg-success/85',
                error: 'bg-error text-write hover:bg-error/85',
            },


            size: {
                small: 'h-8 px-3 py-1 has-[&>svg]:px-2',
                default: 'h-9 px-4 py-2 has-[&>svg]:px-3',
                large: 'h-10 px-6 py-3 has-[&>svg]:px-5',

                icon: 'size-9',
            },
        },

        defaultVariants: {
            variant: 'default',
            size: 'default',
        }
    }
);

export const Button = ({
    variant,
    size,
    className,
    children,
    ...props
}: VariantProps<typeof variants> & React.ComponentProps<'button'>) => {
    return <button data-ui="button" className={cn(variants({ variant, size }), className)} {...props}>{children}</button>
}