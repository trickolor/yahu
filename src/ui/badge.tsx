import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../cn";

const badgeVariants = cva(
    cn(
        "inline-flex items-center rounded-full whitespace-nowrap select-none font-semibold transition-colors px-2.5 py-0.5 text-xs border border-transparent overflow-hidden text-sm",
        "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-3 [&_svg]:shrink-0",
        "focus-visible:outline-none focus-visible:ring-outer-bound focus-visible:ring-2",
        "aria-invalid:ring-error-bound aria-invalid:border-error-bound",
    ),
    {
        variants: {
            variant: {
                default: "bg-primary-surface text-primary-write",
                secondary: "bg-secondary-surface text-secondary-write",
                outline: "bg-transparent border-bound text-write",
                warning: "bg-warning-surface text-warning-write",
                success: "bg-success-surface text-success-write",
                error: "bg-error-surface text-error-write",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

export const Badge = ({
    variant,
    className,
    children,
    ...props
}: VariantProps<typeof badgeVariants> & React.ComponentProps<"span">) => {
    return (
        <span data-ui="badge" className={cn(badgeVariants({ variant }), className)} {...props}>
            {children}
        </span>
    );
};
