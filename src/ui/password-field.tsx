import {
    createContext,
    useCallback,
    useContext,
    type InputHTMLAttributes,
    type HTMLAttributes,
    type ReactNode,
    type MouseEvent,
} from "react";

import { useControllableState } from "@/hooks/use-controllable-state";
import { Slot } from "@/ui/slot";
import { cn } from "@/cn";

// ---------------------------------------------------------------------------------------------------- //

interface PasswordFieldContextState {
    value: string;
    setValue: (next: string) => void;
    name?: string;
    visible: boolean;
    setVisible: (next: boolean) => void;
    disabled: boolean;
    readOnly: boolean;
    required: boolean;
}

const PasswordFieldContext = createContext<PasswordFieldContextState | null>(null);

function usePasswordFieldContext(): PasswordFieldContextState {
    const context = useContext(PasswordFieldContext);
    if (!context) throw new Error("usePasswordFieldContext must be used within a <PasswordField> component");
    return context;
}

// ---------------------------------------------------------------------------------------------------- //

interface PasswordFieldProps extends Omit<HTMLAttributes<HTMLElement>, 'defaultValue' | 'onChange'> {
    children: ReactNode;
    name?: string;
    defaultValue?: string;
    value?: string;
    onValueChange?: (value: string) => void;
    defaultVisible?: boolean;
    visible?: boolean;
    onVisibleChange?: (visible: boolean) => void;
    disabled?: boolean;
    readOnly?: boolean;
    required?: boolean;
}

function PasswordField({
    children,
    className,
    name,
    defaultValue,
    value,
    onValueChange,
    defaultVisible,
    visible,
    onVisibleChange,
    disabled = false,
    readOnly = false,
    required = false,
    ...props
}: PasswordFieldProps) {
    const [currentValue, setCurrentValue] = useControllableState<string>({
        value,
        defaultValue: defaultValue ?? '',
        onChange: onValueChange,
    });

    const [currentVisible, setCurrentVisible] = useControllableState<boolean>({
        value: visible,
        defaultValue: defaultVisible ?? false,
        onChange: onVisibleChange,
    });

    const setValue = useCallback(
        (next: string) => {
            if (disabled || readOnly) return;
            setCurrentValue(next);
        },
        [disabled, readOnly, setCurrentValue]
    );

    const setVisible = useCallback(
        (next: boolean) => {
            if (disabled) return;
            setCurrentVisible(next);
        },
        [disabled, setCurrentVisible]
    );

    const contextValue: PasswordFieldContextState = {
        value: currentValue,
        setValue,
        name,
        visible: currentVisible,
        setVisible,
        disabled,
        readOnly,
        required,
    }

    return (
        <PasswordFieldContext.Provider value={contextValue}>
            <div
                data-ui="password-field"
                data-disabled={disabled || undefined}
                data-readonly={readOnly || undefined}
                data-required={required || undefined}
                data-visible={currentVisible || undefined}
                data-has-value={currentValue.length > 0 || undefined}
                role="group"

                className={cn(
                    'relative flex w-fit items-stretch',
                    '[&>[data-ui="password-field-input"]]:flex-1',
                    '[&>[data-ui="password-field-input"]]:pr-10',
                    '[&>[data-ui="password-field-toggle"]]:absolute [&>[data-ui="password-field-toggle"]]:right-0 [&>[data-ui="password-field-toggle"]]:top-0 [&>[data-ui="password-field-toggle"]]:z-10',
                    className
                )}

                {...props}
            >
                {children}
            </div>
        </PasswordFieldContext.Provider>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface PasswordFieldInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'type'> { }

function PasswordFieldInput({
    className,
    onChange,
    ...props
}: PasswordFieldInputProps) {
    const {
        value,
        setValue,
        name,
        visible,
        disabled,
        readOnly,
        required,
    } = usePasswordFieldContext();

    const handleChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            setValue(event.currentTarget.value);
            onChange?.(event);
        },
        [onChange, setValue]
    );

    return (
        <input
            data-ui="password-field-input"
            data-disabled={disabled || undefined}
            data-readonly={readOnly || undefined}
            data-required={required || undefined}
            data-visible={visible || undefined}
            data-has-value={value.length > 0 || undefined}

            name={name}
            type={visible ? 'text' : 'password'}
            autoComplete="current-password"

            disabled={disabled}
            readOnly={readOnly}
            required={required}

            aria-disabled={disabled || undefined}
            aria-readonly={readOnly || undefined}
            aria-required={required || undefined}

            value={value}
            onChange={handleChange}

            className={cn(
                'relative flex w-full h-9 px-3 py-2 text-sm text-write ring-offset-2 transition-all rounded border border-bound bg-surface',
                'focus-visible:outline-none focus-visible:ring-offset-muted-bound focus-visible:ring-outer-bound focus-visible:ring-2',
                'disabled:cursor-not-allowed disabled:pointer-events-none disabled:text-muted-write disabled:border-muted-bound',
                'aria-invalid:ring-danger aria-invalid:border-danger',
                'placeholder:text-muted-write',
                className
            )}

            {...props}
        />
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface PasswordFieldToggleProps extends HTMLAttributes<HTMLButtonElement> {
    asChild?: boolean;
}

function PasswordFieldToggle({
    className,
    asChild,
    children,
    onClick,
    ...props
}: PasswordFieldToggleProps) {
    const { visible, setVisible, disabled } = usePasswordFieldContext();

    const Component = asChild ? Slot : 'button';

    const handleClick = useCallback(
        (event: MouseEvent<HTMLButtonElement>) => {
            if (disabled) return;
            setVisible(!visible);
            onClick?.(event);
        },
        [disabled, onClick, setVisible, visible]
    );

    return (
        <Component
            data-ui="password-field-toggle"
            data-disabled={disabled || undefined}
            data-visible={visible || undefined}

            type="button"
            disabled={disabled}
            aria-label={visible ? 'Hide password' : 'Show password'}
            aria-pressed={visible}
            aria-disabled={disabled || undefined}
            onClick={handleClick}

            className={cn(
                'inline-flex items-center justify-center shrink-0 cursor-pointer ring-offset-2 transition-all rounded',
                'focus-visible:outline-none focus-visible:ring-offset-muted-bound focus-visible:ring-outer-bound focus-visible:ring-2',
                'disabled:cursor-not-allowed disabled:pointer-events-none disabled:text-muted-write',
                'size-9 text-write',
                '[&_svg]:pointer-events-none [&_svg:not([class*="size-"])]:size-4 [&_svg]:shrink-0',
                className
            )}

            {...props}
        >
            {children}
        </Component>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface PasswordFieldToggleIndicatorProps extends HTMLAttributes<HTMLElement> {
    asChild?: boolean;
}

function PasswordFieldToggleIndicator({
    className,
    asChild,
    children,
    ...props
}: PasswordFieldToggleIndicatorProps) {
    const { visible } = usePasswordFieldContext();

    const Component = asChild ? Slot : 'span';

    return (
        <Component
            data-ui="password-field-toggle-indicator"
            data-visible={visible || undefined}
            aria-hidden

            className={cn(
                'w-fit [&>svg]:size-4 text-current shrink-0',
                className
            )}

            {...props}
        >
            {asChild ? children : visible ? (
                // Eye off icon (password visible, click to hide)
                <svg
                    data-ui="password-field-toggle-indicator-icon"
                    aria-hidden
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
                    <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
                    <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" />
                    <path d="m2 2 20 20" />
                </svg>
            ) : (
                // Eye icon (password hidden, click to show)
                <svg
                    data-ui="password-field-toggle-indicator-icon"
                    aria-hidden
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                    <circle cx="12" cy="12" r="3" />
                </svg>
            )}
        </Component>
    );
}

// ---------------------------------------------------------------------------------------------------- //

export {
    PasswordField,
    PasswordFieldInput,
    PasswordFieldToggle,
    PasswordFieldToggleIndicator,
    type PasswordFieldProps,
    type PasswordFieldInputProps,
    type PasswordFieldToggleProps,
    type PasswordFieldToggleIndicatorProps,
}

// ---------------------------------------------------------------------------------------------------- //
