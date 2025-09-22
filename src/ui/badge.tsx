import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../cn";

const badgeVariants = cva(
    cn(
        "inline-flex text-center justify-center items-center rounded-full whitespace-nowrap select-none font-semibold transition-colors border border-transparent overflow-hidden",
        "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-3 [&_svg]:shrink-0",
    ),
    {
        variants: {
            variant: {
                solid: true,
                outline: 'border-2',
                ghost: true,
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
                small: 'px-1.5 py-0.25 text-xs',
                default: 'px-2.5 py-0.5 text-xs',
                large: 'px-3 py-1 text-sm',
            },
        },

        compoundVariants: [
            { variant: 'solid', color: 'primary', class: 'bg-primary-surface text-primary-write' },
            { variant: 'solid', color: 'secondary', class: 'bg-secondary-surface text-secondary-write' },
            { variant: 'solid', color: 'success', class: 'bg-success text-white dark:text-black' },
            { variant: 'solid', color: 'warning', class: 'bg-warning text-white dark:text-black' },
            { variant: 'solid', color: 'failure', class: 'bg-failure text-white dark:text-black' },

            { variant: 'outline', color: 'primary', class: 'border-primary-surface text-primary-surface' },
            { variant: 'outline', color: 'secondary', class: 'mix-blend-screen border-secondary-surface text-secondary-surface' },
            { variant: 'outline', color: 'success', class: 'border-success text-success' },
            { variant: 'outline', color: 'warning', class: 'border-warning text-warning' },
            { variant: 'outline', color: 'failure', class: 'border-failure text-failure' },

            { variant: 'ghost', color: 'primary', class: 'text-primary-surface bg-primary-surface/10' },
            { variant: 'ghost', color: 'secondary', class: 'dark:brightness-[3] brightness-[0.675] text-secondary-surface bg-secondary-surface/10' },
            { variant: 'ghost', color: 'success', class: 'text-success bg-success/10' },
            { variant: 'ghost', color: 'warning', class: 'text-warning bg-warning/10' },
            { variant: 'ghost', color: 'failure', class: 'text-failure bg-failure/10' },

            { variant: 'solid', color: 'red', class: 'bg-accent-red-surface text-accent-red-write' },
            { variant: 'outline', color: 'red', class: 'border-accent-red-surface text-accent-red-surface' },
            { variant: 'ghost', color: 'red', class: 'text-accent-red-surface bg-accent-red-surface/10' },

            { variant: 'solid', color: 'orange', class: 'bg-accent-orange-surface text-accent-orange-write' },
            { variant: 'outline', color: 'orange', class: 'border-accent-orange-surface text-accent-orange-surface' },
            { variant: 'ghost', color: 'orange', class: 'text-accent-orange-surface bg-accent-orange-surface/10' },

            { variant: 'solid', color: 'amber', class: 'bg-accent-amber-surface text-accent-amber-write' },
            { variant: 'outline', color: 'amber', class: 'border-accent-amber-surface text-accent-amber-surface' },
            { variant: 'ghost', color: 'amber', class: 'text-accent-amber-surface bg-accent-amber-surface/10' },

            { variant: 'solid', color: 'yellow', class: 'bg-accent-yellow-surface text-accent-yellow-write' },
            { variant: 'outline', color: 'yellow', class: 'border-accent-yellow-surface text-accent-yellow-surface' },
            { variant: 'ghost', color: 'yellow', class: 'text-accent-yellow-surface bg-accent-yellow-surface/10' },

            { variant: 'solid', color: 'lime', class: 'bg-accent-lime-surface text-accent-lime-write' },
            { variant: 'outline', color: 'lime', class: 'border-accent-lime-surface text-accent-lime-surface' },
            { variant: 'ghost', color: 'lime', class: 'text-accent-lime-surface bg-accent-lime-surface/10' },

            { variant: 'solid', color: 'green', class: 'bg-accent-green-surface text-accent-green-write' },
            { variant: 'outline', color: 'green', class: 'border-accent-green-surface text-accent-green-surface' },
            { variant: 'ghost', color: 'green', class: 'text-accent-green-surface bg-accent-green-surface/10' },

            { variant: 'solid', color: 'emerald', class: 'bg-accent-emerald-surface text-accent-emerald-write' },
            { variant: 'outline', color: 'emerald', class: 'border-accent-emerald-surface text-accent-emerald-surface' },
            { variant: 'ghost', color: 'emerald', class: 'text-accent-emerald-surface bg-accent-emerald-surface/10' },

            { variant: 'solid', color: 'teal', class: 'bg-accent-teal-surface text-accent-teal-write' },
            { variant: 'outline', color: 'teal', class: 'border-accent-teal-surface text-accent-teal-surface' },
            { variant: 'ghost', color: 'teal', class: 'text-accent-teal-surface bg-accent-teal-surface/10' },

            { variant: 'solid', color: 'cyan', class: 'bg-accent-cyan-surface text-accent-cyan-write' },
            { variant: 'outline', color: 'cyan', class: 'border-accent-cyan-surface text-accent-cyan-surface' },
            { variant: 'ghost', color: 'cyan', class: 'text-accent-cyan-surface bg-accent-cyan-surface/10' },

            { variant: 'solid', color: 'sky', class: 'bg-accent-sky-surface text-accent-sky-write' },
            { variant: 'outline', color: 'sky', class: 'border-accent-sky-surface text-accent-sky-surface' },
            { variant: 'ghost', color: 'sky', class: 'text-accent-sky-surface bg-accent-sky-surface/10' },

            { variant: 'solid', color: 'blue', class: 'bg-accent-blue-surface text-accent-blue-write' },
            { variant: 'outline', color: 'blue', class: 'border-accent-blue-surface text-accent-blue-surface' },
            { variant: 'ghost', color: 'blue', class: 'text-accent-blue-surface bg-accent-blue-surface/10' },

            { variant: 'solid', color: 'indigo', class: 'bg-accent-indigo-surface text-accent-indigo-write' },
            { variant: 'outline', color: 'indigo', class: 'border-accent-indigo-surface text-accent-indigo-surface' },
            { variant: 'ghost', color: 'indigo', class: 'text-accent-indigo-surface bg-accent-indigo-surface/10' },

            { variant: 'solid', color: 'violet', class: 'bg-accent-violet-surface text-accent-violet-write' },
            { variant: 'outline', color: 'violet', class: 'border-accent-violet-surface text-accent-violet-surface' },
            { variant: 'ghost', color: 'violet', class: 'text-accent-violet-surface bg-accent-violet-surface/10' },

            { variant: 'solid', color: 'purple', class: 'bg-accent-purple-surface text-accent-purple-write' },
            { variant: 'outline', color: 'purple', class: 'border-accent-purple-surface text-accent-purple-surface' },
            { variant: 'ghost', color: 'purple', class: 'text-accent-purple-surface bg-accent-purple-surface/10' },

            { variant: 'solid', color: 'fuchsia', class: 'bg-accent-fuchsia-surface text-accent-fuchsia-write' },
            { variant: 'outline', color: 'fuchsia', class: 'border-accent-fuchsia-surface text-accent-fuchsia-surface' },
            { variant: 'ghost', color: 'fuchsia', class: 'text-accent-fuchsia-surface bg-accent-fuchsia-surface/10' },

            { variant: 'solid', color: 'pink', class: 'bg-accent-pink-surface text-accent-pink-write' },
            { variant: 'outline', color: 'pink', class: 'border-accent-pink-surface text-accent-pink-surface' },
            { variant: 'ghost', color: 'pink', class: 'text-accent-pink-surface bg-accent-pink-surface/10' },

            { variant: 'solid', color: 'rose', class: 'bg-accent-rose-surface text-accent-rose-write' },
            { variant: 'outline', color: 'rose', class: 'border-accent-rose-surface text-accent-rose-surface' },
            { variant: 'ghost', color: 'rose', class: 'text-accent-rose-surface bg-accent-rose-surface/10' },
        ],
        defaultVariants: {
            variant: 'solid',
            color: 'primary',
            size: 'default',
        }
    }
);

export interface BadgeProps extends
    VariantProps<typeof badgeVariants>,
    Omit<React.ComponentProps<'span'>, 'color'> {}

export const Badge = ({
    variant,
    color,
    size,
    className,
    children,
    ...props
}: BadgeProps) => {
    return (
        <span data-ui="badge" className={cn(badgeVariants({ variant, size, color }), className)} {...props}>
            {children}
        </span>
    );
};
