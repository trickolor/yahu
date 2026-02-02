import { cn } from "../cn";

export const Input = ({
    className,
    ...props
}: React.ComponentProps<"input">) => {
    return (
        <input data-ui="input"
            className={cn(
                "relative flex w-full h-8 px-3 py-2 text-sm text-write ring-offset-2 transition-all rounded border border-bound bg-surface",
                "file:cursor-pointer file:h-full file:hover:bg-secondary-surface/85 file:px-3 file:py-1.5 file:mr-4 file:bg-secondary-surface file:text-secondary-write file:font-medium file:border-0",
                'focus-visible:outline-none focus-visible:ring-offset-muted-bound focus-visible:ring-outer-bound focus-visible:ring-2',
                "disabled:cursor-not-allowed disabled:opacity-70 disabled:pointer-events-none",
                "[&[type='file']]:p-0 [&[type='color']]:p-1 [&[type='range']]:p-0",
                "aria-invalid:ring-danger aria-invalid:border-danger",
                "placeholder:text-muted-write",
                className
            )}
            {...props}
        />
    );
}
