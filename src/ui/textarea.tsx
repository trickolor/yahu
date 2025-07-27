import { cn } from "../cn";

export const Textarea = ({
    className,
    ...props
}: React.ComponentProps<"textarea">) => {
    return (
        <textarea data-ui="textarea"
            className={cn(
                "flex w-full px-3 py-2 text-write resize-y ring-offset-2 transition-all rounded border border-bound bg-surface md:text-sm",
                "[&[type='file']]:p-0 file:cursor-pointer file:hover:bg-secondary-surface/85 file:px-3 file:py-1.5 file:mr-4 file:bg-secondary-surface file:text-write file:font-medium file:border-0",
                "focus-visible:outline-none focus-visible:ring-outer-bound focus-visible:ring-2",
                "disabled:cursor-not-allowed disabled:opacity-70 disabled:pointer-events-none",
                "aria-invalid:ring-error-bound aria-invalid:border-error-bound",
                "placeholder:text-weak-write",
            )}
            {...props}
        />
    );
};
