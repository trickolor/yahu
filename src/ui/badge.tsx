import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../cn";

const badgeVariants = cva(
    cn(
        "w-fit text-sm py-0.5 px-1.5 font-medium inline-flex gap-2 justify-center items-center rounded-full whitespace-nowrap",
        "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-3 [&_svg]:shrink-0",
    ),
    {
        variants: {
            variant: {
                default: 'bg-primary-surface text-primary-write',
                secondary: 'bg-secondary-surface text-secondary-write',
                danger: 'bg-danger text-white dark:text-black',
                success: 'bg-success text-white dark:text-black',
                warn: 'bg-warn text-white dark:text-black',
                outline: 'border border-bound text-write',
            },
        },
        defaultVariants: {
            variant: 'default',
        }
    }
);

export interface BadgeProps extends
    VariantProps<typeof badgeVariants>,
    Omit<React.ComponentProps<'span'>, 'color'> { }

export const Badge = ({
    variant,
    className,
    children,
    ...props
}: BadgeProps) => {
    return (
        <span data-ui="badge" className={cn(badgeVariants({ variant }), className)} {...props}>
            {children}
        </span>
    );
}
