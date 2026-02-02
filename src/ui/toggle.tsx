import {
    useCallback,
    useState,
    type KeyboardEvent,
    type HTMLAttributes,
} from "react";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/cn";

// ---------------------------------------------------------------------------------------------------- //

interface ControllableStateProps<T> {
    onChange?: (next: T) => void;
    defaultValue: T;
    value?: T;
}

type ControllableStateReturn<T> = [T, (next: T) => void];

function useControllableState<T>({
    defaultValue,
    onChange,
    value,
}: ControllableStateProps<T>): ControllableStateReturn<T> {
    const [internal, setInternal] = useState<T>(defaultValue);
    const isControlled = value !== undefined;
    const state = isControlled ? value : internal;

    const setState = useCallback((next: T) => {
        if (!isControlled) setInternal(next);
        onChange?.(next);
    }, [isControlled, onChange]);

    return [state, setState] as const;
}

// ---------------------------------------------------------------------------------------------------- //

const toggleVariants = cva(
    cn(
        'w-fit inline-flex items-center justify-center gap-2 rounded shrink-0 font-medium whitespace-nowrap cursor-pointer ring-offset-2 transition-all',
        '[&_svg]:pointer-events-none [&_svg:not([class*="size-"])]:size-4 [&_svg]:shrink-0',
        'focus-visible:outline-none focus-visible:ring-offset-muted-bound focus-visible:ring-outer-bound focus-visible:ring-2',
        'disabled:cursor-not-allowed disabled:opacity-70 disabled:pointer-events-none',
        'aria-invalid:ring-danger aria-invalid:border-danger',
    ),

    {
        variants: {
            variant: {
                default: cn(
                    'text-write hover:bg-muted-surface',
                    'data-[state=on]:bg-muted-surface'
                ),
                outline: cn(
                    'border border-bound text-write bg-surface hover:bg-muted-surface',
                    'data-[state=on]:bg-muted-surface'
                ),
            },
            size: {
                default: 'px-4 h-8 text-sm',
                sm: 'px-3 h-7 text-xs',
                lg: 'px-5 h-9 text-sm',
                'icon-sm': 'size-7',
                icon: 'size-8',
                'icon-lg': 'size-9',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    }
);

// ---------------------------------------------------------------------------------------------------- //

interface ToggleProps extends
    VariantProps<typeof toggleVariants>,
    Omit<HTMLAttributes<HTMLButtonElement>, 'onChange'> {
    defaultPressed?: boolean;
    pressed?: boolean;
    onPressedChange?: (pressed: boolean) => void;
    disabled?: boolean;
}

function Toggle({
    defaultPressed = false,
    pressed,
    onPressedChange,
    disabled = false,
    variant,
    size,
    className,
    children,
    onKeyDown,
    onClick,
    ...props
}: ToggleProps) {
    const [currentPressed, setCurrentPressed] = useControllableState({
        value: pressed,
        defaultValue: defaultPressed,
        onChange: onPressedChange,
    });

    const toggleHandler = useCallback(() => {
        if (!disabled) setCurrentPressed(!currentPressed);
    }, [disabled, currentPressed, setCurrentPressed]);

    const keyDownHandler = useCallback((event: KeyboardEvent<HTMLButtonElement>) => {
        if (event.key === ' ' || event.key === 'Enter') {
            event.preventDefault();
            toggleHandler();
        }

        onKeyDown?.(event);
    }, [toggleHandler, onKeyDown]);

    const handleClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
        toggleHandler();
        onClick?.(event);
    }, [toggleHandler, onClick]);

    return (
        <button
            data-ui="toggle"
            data-state={currentPressed ? 'on' : 'off'}
            data-disabled={disabled || undefined}

            role="button"
            aria-pressed={currentPressed}

            type="button"
            disabled={disabled}
            className={cn(toggleVariants({ variant, size }), className)}

            onClick={handleClick}
            onKeyDown={keyDownHandler}

            {...props}
        >
            {children}
        </button>
    );
}

// ---------------------------------------------------------------------------------------------------- //

export { Toggle, type ToggleProps }

// ---------------------------------------------------------------------------------------------------- //
