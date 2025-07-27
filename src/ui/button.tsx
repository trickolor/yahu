import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../cn";
import { Slot } from "./slot";

const variants = cva(
    cn(
        'w-fit inline-flex items-center justify-center gap-2 rounded shrink-0 font-medium whitespace-nowrap cursor-pointer ring-offset-2 transition-all',
        '[&_svg]:pointer-events-none [&_svg:not([class*="size-"])]:size-4 [&_svg]:shrink-0',
        'focus-visible:outline-none focus-visible:ring-outer-bound focus-visible:ring-2',
        'disabled:cursor-not-allowed disabled:opacity-70 disabled:pointer-events-none',
        'aria-invalid:ring-error-bound aria-invalid:border-error-bound',
    ),
    {
        variants: {

            variant: {
                default: 'bg-primary-surface text-primary-write hover:bg-primary-surface/85',
                secondary: 'bg-secondary-surface text-secondary-write hover:bg-secondary-surface/85',

                outline: 'border-2 border-bound text-write hover:border-bound/85 hover:text-write/85',

                ghost: 'text-write hover:bg-weak-surface',

                link: 'underline underline-offset-4 text-write hover:text-write/85',

                warning: 'bg-warning-surface text-warning-write hover:bg-warning-surface/85',
                success: 'bg-success-surface text-success-write hover:bg-success-surface/85',
                error: 'bg-error-surface text-error-write hover:bg-error-surface/85',
            },


            size: {
                small: 'px-3 py-1 text-xs',
                default: 'px-4 py-2 text-sm',
                large: 'px-5 py-2.5 text-base',

                icon: 'size-9',
            },
        },

        defaultVariants: {
            variant: 'default',
            size: 'default',
        }
    }
);

export interface ButtonProps extends
    VariantProps<typeof variants>,
    React.ComponentProps<'button'> {
    asChild?: boolean;
}

export const Button = ({
    variant,
    size,
    className,
    children,
    asChild,
    ...props
}: ButtonProps) => {

    const Element = asChild ? Slot : 'button';


    return (
        <Element data-ui="button"
            className={cn(variants({ variant, size }), className)}
            {...props}
        >
            {children}
        </Element>
    );
}