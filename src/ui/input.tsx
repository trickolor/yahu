import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../cn";

const inputVariants = cva(
    cn(
        "flex w-full px-3 py-2 text-sm text-write ring-offset-2 transition-all",
        "[type='file']:px-0 [type='file']:py-0 [type='file']:border-0 [type='file']:bg-transparent [type='file']:text-weak-write [type='file']:focus-visible:ring-0",
        "focus-visible:outline-none focus-visible:ring-outer-bound focus-visible:ring-2",
        "disabled:cursor-not-allowed disabled:opacity-70 disabled:pointer-events-none",
        "aria-invalid:ring-error-bound aria-invalid:border-error-bound",
        "placeholder:text-weak-write",
    ),
    {
        variants: {
            variant: {
                default:
                    "rounded border border-bound bg-surface",
                underline:
                    // border-0 on all sides, but a 2px bottom border;
                    // kill any focus ring with !important
                    "border-0 border-b-2 border-bound rounded-none bg-surface " +
                    "!focus-visible:ring-0 focus-visible:border-primary-bound " +
                    "focus:outline-none outline-none ring-0",
                ghost:
                    // totally transparent, no border, no shadow, no focus ring/outline
                    "border-0 bg-transparent shadow-none " +
                    "!focus-visible:ring-0 focus-visible:ring-offset-0 " +
                    "focus:outline-none outline-none ring-0",
            },
            size: {
                default: "h-8 px-2 py-1 text-sm",
                large: "h-9 px-3 py-2 text-sm",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

export const Input = ({
    size,
    variant,
    className,
    type,
    ...props
}: VariantProps<typeof inputVariants> & Omit<React.ComponentProps<"input">, "size">) => {
    return (
        <input
            data-ui="input"
            type={type}
            className={cn(inputVariants({ size, variant }), className)}
            {...props}
        />
    );
};
