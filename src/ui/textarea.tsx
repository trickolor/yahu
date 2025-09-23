import { cn } from "../cn";

export const Textarea = ({
    className,
    ...props
}: React.ComponentProps<"textarea">) => {
    return (
        <textarea data-ui="textarea"
            className={cn(
                "flex w-full px-3 py-2 text-sm text-write resize-y ring-offset-2 transition-all rounded border border-bound bg-surface",
                "focus-visible:outline-none focus-visible:ring-outer-bound focus-visible:ring-2",
                "disabled:cursor-not-allowed disabled:opacity-70 disabled:pointer-events-none",
                "aria-invalid:ring-failure aria-invalid:border-failure",
                "placeholder:text-muted-write",
                className
            )}
            {...props}
        />
    );
};
