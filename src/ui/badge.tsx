import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../cn";

const badgeVariants = cva(
    cn(
        "inline-flex items-center rounded whitespace-nowrap select-none font-semibold transition-colors px-2 py-0.5 text-xs border border-transparent overflow-hidden",
        "[&_svg]:pointer-events-none [&_svg]:size-3 [&_svg:not([class*='size-'])]:size-3 [&_svg]:shrink-0",
        "focus-visible:outline-none focus-visible:ring-outer-bound focus-visible:ring-2",
        "aria-invalid:ring-error-bound aria-invalid:border-error-bound",
    ),
    {
        variants: {
            variant: {
                default: "bg-primary-surface text-primary-write",
                secondary: "bg-secondary-surface text-secondary-write",
                outline: "bg-transparent border-bound text-write",
                ghost: "bg-weak-surface text-write",
                warning: "bg-warning-surface text-warning-write",
                success: "bg-success-surface text-success-write",
                error: "bg-error-surface text-error-write",
            },
            size: {
                default: "text-xs px-2 py-0.5",
                large: "text-sm px-3 py-1",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

export const Badge = ({
    variant,
    size,
    className,
    children,
    ...props
}: VariantProps<typeof badgeVariants> & React.ComponentProps<"span">) => {
    return (
        <span data-ui="badge" className={cn(badgeVariants({ variant, size }), className)} {...props}>
            {children}
        </span>
    );
};
