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
                solid: true,
                outline: 'border-2',
                ghost: true,
                link: 'underline underline-offset-4',
            },

            color: {
                primary: true,
                secondary: true,
                success: true,
                warning: true,
                failure: true,
                red: true,
                orange: true,
                amber: true,
                yellow: true,
                lime: true,
                green: true,
                emerald: true,
                teal: true,
                cyan: true,
                sky: true,
                blue: true,
                indigo: true,
                violet: true,
                purple: true,
                fuchsia: true,
                pink: true,
                rose: true,
            },

            size: {
                small: 'px-3 py-1 text-xs',
                default: 'px-4 py-2 text-sm',
                large: 'px-5 py-2.5 text-base',

                icon: 'size-9',
            },
        },

        compoundVariants: [
            { variant: 'solid', color: 'primary', class: 'bg-primary-surface text-primary-write hover:bg-primary-surface/85' },
            { variant: 'solid', color: 'secondary', class: 'bg-secondary-surface text-secondary-write hover:bg-secondary-surface/85' },
            { variant: 'solid', color: 'success', class: 'bg-success text-white dark:text-black hover:bg-success/85' },
            { variant: 'solid', color: 'warning', class: 'bg-warning text-white dark:text-black hover:bg-warning/85' },
            { variant: 'solid', color: 'failure', class: 'bg-failure text-white dark:text-black hover:bg-failure/85' },

            { variant: 'outline', color: 'primary', class: 'border-primary-surface text-primary-surface hover:border-primary-surface/85 hover:text-primary-surface/85' },
            { variant: 'outline', color: 'secondary', class: 'invert-35 border-secondary-surface text-secondary-surface hover:border-secondary-surface/85 hover:text-secondary-surface/85' },
            { variant: 'outline', color: 'success', class: 'border-success text-success hover:border-success/85 hover:text-success/85' },
            { variant: 'outline', color: 'warning', class: 'border-warning text-warning hover:border-warning/85 hover:text-warning/85' },
            { variant: 'outline', color: 'failure', class: 'border-failure text-failure hover:border-failure/85 hover:text-failure/85' },

            { variant: 'ghost', color: 'primary', class: 'text-primary-surface hover:bg-primary-surface/10' },
            { variant: 'ghost', color: 'secondary', class: 'invert-35 text-secondary-surface hover:bg-secondary-surface/10' },
            { variant: 'ghost', color: 'success', class: 'text-success hover:bg-success/10' },
            { variant: 'ghost', color: 'warning', class: 'text-warning hover:bg-warning/10' },
            { variant: 'ghost', color: 'failure', class: 'text-failure hover:bg-failure/10' },

            { variant: 'link', color: 'primary', class: 'text-primary-surface hover:text-primary-surface/85' },
            { variant: 'link', color: 'secondary', class: 'invert-35 text-secondary-surface hover:text-secondary-surface/85' },
            { variant: 'link', color: 'success', class: 'text-success hover:text-success/85' },
            { variant: 'link', color: 'warning', class: 'text-warning hover:text-warning/85' },
            { variant: 'link', color: 'failure', class: 'text-failure hover:text-failure/85' },

            { variant: 'solid', color: 'red', class: 'bg-accent-red-surface text-accent-red-write hover:bg-accent-red-surface/85' },
            { variant: 'outline', color: 'red', class: 'border-accent-red-surface text-accent-red-surface hover:border-accent-red-surface/85 hover:text-accent-red-surface/85' },
            { variant: 'ghost', color: 'red', class: 'text-accent-red-surface hover:bg-accent-red-surface/10' },
            { variant: 'link', color: 'red', class: 'text-accent-red-surface hover:text-accent-red-surface/85' },

            { variant: 'solid', color: 'orange', class: 'bg-accent-orange-surface text-accent-orange-write hover:bg-accent-orange-surface/85' },
            { variant: 'outline', color: 'orange', class: 'border-accent-orange-surface text-accent-orange-surface hover:border-accent-orange-surface/85 hover:text-accent-orange-surface/85' },
            { variant: 'ghost', color: 'orange', class: 'text-accent-orange-surface hover:bg-accent-orange-surface/10' },
            { variant: 'link', color: 'orange', class: 'text-accent-orange-surface hover:text-accent-orange-surface/85' },

            { variant: 'solid', color: 'amber', class: 'bg-accent-amber-surface text-accent-amber-write hover:bg-accent-amber-surface/85' },
            { variant: 'outline', color: 'amber', class: 'border-accent-amber-surface text-accent-amber-surface hover:border-accent-amber-surface/85 hover:text-accent-amber-surface/85' },
            { variant: 'ghost', color: 'amber', class: 'text-accent-amber-surface hover:bg-accent-amber-surface/10' },
            { variant: 'link', color: 'amber', class: 'text-accent-amber-surface hover:text-accent-amber-surface/85' },

            { variant: 'solid', color: 'yellow', class: 'bg-accent-yellow-surface text-accent-yellow-write hover:bg-accent-yellow-surface/85' },
            { variant: 'outline', color: 'yellow', class: 'border-accent-yellow-surface text-accent-yellow-surface hover:border-accent-yellow-surface/85 hover:text-accent-yellow-surface/85' },
            { variant: 'ghost', color: 'yellow', class: 'text-accent-yellow-surface hover:bg-accent-yellow-surface/10' },
            { variant: 'link', color: 'yellow', class: 'text-accent-yellow-surface hover:text-accent-yellow-surface/85' },

            { variant: 'solid', color: 'lime', class: 'bg-accent-lime-surface text-accent-lime-write hover:bg-accent-lime-surface/85' },
            { variant: 'outline', color: 'lime', class: 'border-accent-lime-surface text-accent-lime-surface hover:border-accent-lime-surface/85 hover:text-accent-lime-surface/85' },
            { variant: 'ghost', color: 'lime', class: 'text-accent-lime-surface hover:bg-accent-lime-surface/10' },
            { variant: 'link', color: 'lime', class: 'text-accent-lime-surface hover:text-accent-lime-surface/85' },

            { variant: 'solid', color: 'green', class: 'bg-accent-green-surface text-accent-green-write hover:bg-accent-green-surface/85' },
            { variant: 'outline', color: 'green', class: 'border-accent-green-surface text-accent-green-surface hover:border-accent-green-surface/85 hover:text-accent-green-surface/85' },
            { variant: 'ghost', color: 'green', class: 'text-accent-green-surface hover:bg-accent-green-surface/10' },
            { variant: 'link', color: 'green', class: 'text-accent-green-surface hover:text-accent-green-surface/85' },

            { variant: 'solid', color: 'emerald', class: 'bg-accent-emerald-surface text-accent-emerald-write hover:bg-accent-emerald-surface/85' },
            { variant: 'outline', color: 'emerald', class: 'border-accent-emerald-surface text-accent-emerald-surface hover:border-accent-emerald-surface/85 hover:text-accent-emerald-surface/85' },
            { variant: 'ghost', color: 'emerald', class: 'text-accent-emerald-surface hover:bg-accent-emerald-surface/10' },
            { variant: 'link', color: 'emerald', class: 'text-accent-emerald-surface hover:text-accent-emerald-surface/85' },

            { variant: 'solid', color: 'teal', class: 'bg-accent-teal-surface text-accent-teal-write hover:bg-accent-teal-surface/85' },
            { variant: 'outline', color: 'teal', class: 'border-accent-teal-surface text-accent-teal-surface hover:border-accent-teal-surface/85 hover:text-accent-teal-surface/85' },
            { variant: 'ghost', color: 'teal', class: 'text-accent-teal-surface hover:bg-accent-teal-surface/10' },
            { variant: 'link', color: 'teal', class: 'text-accent-teal-surface hover:text-accent-teal-surface/85' },

            { variant: 'solid', color: 'cyan', class: 'bg-accent-cyan-surface text-accent-cyan-write hover:bg-accent-cyan-surface/85' },
            { variant: 'outline', color: 'cyan', class: 'border-accent-cyan-surface text-accent-cyan-surface hover:border-accent-cyan-surface/85 hover:text-accent-cyan-surface/85' },
            { variant: 'ghost', color: 'cyan', class: 'text-accent-cyan-surface hover:bg-accent-cyan-surface/10' },
            { variant: 'link', color: 'cyan', class: 'text-accent-cyan-surface hover:text-accent-cyan-surface/85' },

            { variant: 'solid', color: 'sky', class: 'bg-accent-sky-surface text-accent-sky-write hover:bg-accent-sky-surface/85' },
            { variant: 'outline', color: 'sky', class: 'border-accent-sky-surface text-accent-sky-surface hover:border-accent-sky-surface/85 hover:text-accent-sky-surface/85' },
            { variant: 'ghost', color: 'sky', class: 'text-accent-sky-surface hover:bg-accent-sky-surface/10' },
            { variant: 'link', color: 'sky', class: 'text-accent-sky-surface hover:text-accent-sky-surface/85' },

            { variant: 'solid', color: 'blue', class: 'bg-accent-blue-surface text-accent-blue-write hover:bg-accent-blue-surface/85' },
            { variant: 'outline', color: 'blue', class: 'border-accent-blue-surface text-accent-blue-surface hover:border-accent-blue-surface/85 hover:text-accent-blue-surface/85' },
            { variant: 'ghost', color: 'blue', class: 'text-accent-blue-surface hover:bg-accent-blue-surface/10' },
            { variant: 'link', color: 'blue', class: 'text-accent-blue-surface hover:text-accent-blue-surface/85' },

            { variant: 'solid', color: 'indigo', class: 'bg-accent-indigo-surface text-accent-indigo-write hover:bg-accent-indigo-surface/85' },
            { variant: 'outline', color: 'indigo', class: 'border-accent-indigo-surface text-accent-indigo-surface hover:border-accent-indigo-surface/85 hover:text-accent-indigo-surface/85' },
            { variant: 'ghost', color: 'indigo', class: 'text-accent-indigo-surface hover:bg-accent-indigo-surface/10' },
            { variant: 'link', color: 'indigo', class: 'text-accent-indigo-surface hover:text-accent-indigo-surface/85' },

            { variant: 'solid', color: 'violet', class: 'bg-accent-violet-surface text-accent-violet-write hover:bg-accent-violet-surface/85' },
            { variant: 'outline', color: 'violet', class: 'border-accent-violet-surface text-accent-violet-surface hover:border-accent-violet-surface/85 hover:text-accent-violet-surface/85' },
            { variant: 'ghost', color: 'violet', class: 'text-accent-violet-surface hover:bg-accent-violet-surface/10' },
            { variant: 'link', color: 'violet', class: 'text-accent-violet-surface hover:text-accent-violet-surface/85' },

            { variant: 'solid', color: 'purple', class: 'bg-accent-purple-surface text-accent-purple-write hover:bg-accent-purple-surface/85' },
            { variant: 'outline', color: 'purple', class: 'border-accent-purple-surface text-accent-purple-surface hover:border-accent-purple-surface/85 hover:text-accent-purple-surface/85' },
            { variant: 'ghost', color: 'purple', class: 'text-accent-purple-surface hover:bg-accent-purple-surface/10' },
            { variant: 'link', color: 'purple', class: 'text-accent-purple-surface hover:text-accent-purple-surface/85' },

            { variant: 'solid', color: 'fuchsia', class: 'bg-accent-fuchsia-surface text-accent-fuchsia-write hover:bg-accent-fuchsia-surface/85' },
            { variant: 'outline', color: 'fuchsia', class: 'border-accent-fuchsia-surface text-accent-fuchsia-surface hover:border-accent-fuchsia-surface/85 hover:text-accent-fuchsia-surface/85' },
            { variant: 'ghost', color: 'fuchsia', class: 'text-accent-fuchsia-surface hover:bg-accent-fuchsia-surface/10' },
            { variant: 'link', color: 'fuchsia', class: 'text-accent-fuchsia-surface hover:text-accent-fuchsia-surface/85' },

            { variant: 'solid', color: 'pink', class: 'bg-accent-pink-surface text-accent-pink-write hover:bg-accent-pink-surface/85' },
            { variant: 'outline', color: 'pink', class: 'border-accent-pink-surface text-accent-pink-surface hover:border-accent-pink-surface/85 hover:text-accent-pink-surface/85' },
            { variant: 'ghost', color: 'pink', class: 'text-accent-pink-surface hover:bg-accent-pink-surface/10' },
            { variant: 'link', color: 'pink', class: 'text-accent-pink-surface hover:text-accent-pink-surface/85' },

            { variant: 'solid', color: 'rose', class: 'bg-accent-rose-surface text-accent-rose-write hover:bg-accent-rose-surface/85' },
            { variant: 'outline', color: 'rose', class: 'border-accent-rose-surface text-accent-rose-surface hover:border-accent-rose-surface/85 hover:text-accent-rose-surface/85' },
            { variant: 'ghost', color: 'rose', class: 'text-accent-rose-surface hover:bg-accent-rose-surface/10' },
            { variant: 'link', color: 'rose', class: 'text-accent-rose-surface hover:text-accent-rose-surface/85' },
        ],

        defaultVariants: {
            variant: 'solid',
            color: 'primary',
            size: 'default',
        }
    },
);

export interface ButtonProps extends
    VariantProps<typeof variants>,
    Omit<React.ComponentProps<'button'>, 'color'> {
    asChild?: boolean;
}

export const Button = ({
    variant,
    color,
    size,
    className,
    children,
    asChild,
    ...props
}: ButtonProps) => {

    const Element = asChild ? Slot : 'button';


    return (
        <Element data-ui="button"
            className={cn(variants({ variant, size, color }), className)}
            {...props}
        >
            {children}
        </Element>
    );
}