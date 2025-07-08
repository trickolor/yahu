import { cva } from "class-variance-authority";
import { cn } from "../cn";

const variants = cva(
    cn(
        'w-fit inline-flex items-center justify-center gap-2 rounded text-sm shrink-0 font-medium whitespace-nowrap cursor-pointer',
        '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg:not([class*="size-"])]:size-4 [&_svg]:shrink-0',
        'focus-visible:outline-none focus-visible:ring-outer-bound ring-2 ring-offset-2',
    ),
    {
        variants: {
            
            theme: {
                primary: 'bg-primary text-write hover:bg-primary/85',
                secondary: 'bg-secondary text-write hover:bg-secondary/85',

                warning: 'bg-warning text-write hover:bg-warning/85',
                success: 'bg-success text-write hover:bg-success/85',
                error: 'bg-error text-write hover:bg-error/85',
            },

            visual: {
                

            }

            size: {
                small: 'px-2 py-1',
                regular: 'px-3 py-2',
                large: 'px-4 py-2.5',

                icon: 'p-2',
            },

            disabled: {
                fasle: null,
                true: 'bg-surface-weak text-write-weak cursor-auto'
            }
        },



    }
)