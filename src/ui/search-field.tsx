import {
    createContext,
    useCallback,
    useContext,
    type InputHTMLAttributes,
    type HTMLAttributes,
    type ReactNode,
    type MouseEvent,
    type KeyboardEvent,
} from "react";

import { useControllableState } from "@/hooks/use-controllable-state";
import { Slot } from "@/ui/slot";
import { cn } from "@/cn";

// ---------------------------------------------------------------------------------------------------- //

interface SearchFieldContextState {
    value: string;
    setValue: (next: string) => void;
    clear: () => void;
    name?: string;
    disabled: boolean;
    readOnly: boolean;
    required: boolean;
}

const SearchFieldContext = createContext<SearchFieldContextState | null>(null);

function useSearchFieldContext(): SearchFieldContextState {
    const context = useContext(SearchFieldContext);
    if (!context) throw new Error("useSearchFieldContext must be used within a <SearchField> component");
    return context;
}

// ---------------------------------------------------------------------------------------------------- //

interface SearchFieldProps extends Omit<HTMLAttributes<HTMLElement>, 'defaultValue' | 'onChange'> {
    children: ReactNode;
    name?: string;
    defaultValue?: string;
    value?: string;
    onValueChange?: (value: string) => void;
    onClear?: () => void;
    disabled?: boolean;
    readOnly?: boolean;
    required?: boolean;
}

function SearchField({
    children,
    className,
    name,
    defaultValue,
    value,
    onValueChange,
    onClear,
    disabled = false,
    readOnly = false,
    required = false,
    ...props
}: SearchFieldProps) {
    const [currentValue, setCurrentValue] = useControllableState<string>({
        value,
        defaultValue: defaultValue ?? '',
        onChange: onValueChange,
    });

    const setValue = useCallback(
        (next: string) => {
            if (disabled || readOnly) return;
            setCurrentValue(next);
        },
        [disabled, readOnly, setCurrentValue]
    );

    const clear = useCallback(() => {
        if (disabled || readOnly) return;
        setCurrentValue('');
        onClear?.();
    }, [disabled, readOnly, setCurrentValue, onClear]);

    const contextValue: SearchFieldContextState = {
        value: currentValue,
        setValue,
        clear,
        name,
        disabled,
        readOnly,
        required,
    }

    return (
        <SearchFieldContext.Provider value={contextValue}>
            <div
                data-ui="search-field"
                data-disabled={disabled || undefined}
                data-readonly={readOnly || undefined}
                data-required={required || undefined}
                data-has-value={currentValue.length > 0 || undefined}
                role="search"

                className={cn(
                    'relative flex w-fit items-stretch',
                    '[&>[data-ui="search-field-input"]]:flex-1',
                    '[&>[data-ui="search-field-input"]]:pl-9',
                    '[&>[data-ui="search-field-input"]]:pr-9',
                    '[&>[data-ui="search-field-indicator"]]:absolute [&>[data-ui="search-field-indicator"]]:left-0 [&>[data-ui="search-field-indicator"]]:top-0 [&>[data-ui="search-field-indicator"]]:z-10',
                    '[&>[data-ui="search-field-clear"]]:absolute [&>[data-ui="search-field-clear"]]:right-0 [&>[data-ui="search-field-clear"]]:top-0',
                    className
                )}

                {...props}
            >
                {children}
            </div>
        </SearchFieldContext.Provider>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface SearchFieldInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'type'> { }

function SearchFieldInput({
    className,
    onChange,
    onKeyDown,
    ...props
}: SearchFieldInputProps) {
    const {
        value,
        setValue,
        clear,
        name,
        disabled,
        readOnly,
        required,
    } = useSearchFieldContext();

    const handleChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            setValue(event.currentTarget.value);
            onChange?.(event);
        },
        [onChange, setValue]
    );

    const handleKeyDown = useCallback(
        (event: KeyboardEvent<HTMLInputElement>) => {
            if (event.key === 'Escape' && value.length > 0) {
                event.preventDefault();
                clear();
            }
            onKeyDown?.(event);
        },
        [clear, onKeyDown, value.length]
    );

    return (
        <input
            data-ui="search-field-input"
            data-disabled={disabled || undefined}
            data-readonly={readOnly || undefined}
            data-required={required || undefined}
            data-has-value={value.length > 0 || undefined}

            name={name}
            type="search"
            role="searchbox"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}

            disabled={disabled}
            readOnly={readOnly}
            required={required}
            aria-disabled={disabled || undefined}
            aria-readonly={readOnly || undefined}
            aria-required={required || undefined}

            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}

            className={cn(
                'relative flex w-full h-9 px-3 py-2 text-sm text-write ring-offset-2 transition-all rounded border border-bound bg-surface',
                'focus-visible:outline-none focus-visible:ring-offset-muted-bound focus-visible:ring-outer-bound focus-visible:ring-2',
                'disabled:cursor-not-allowed disabled:pointer-events-none disabled:text-muted-write disabled:border-muted-bound',
                'aria-invalid:ring-danger aria-invalid:border-danger',
                'placeholder:text-muted-write',
                '[&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden',
                className
            )}

            {...props}
        />
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface SearchFieldIndicatorProps extends HTMLAttributes<HTMLElement> {
    asChild?: boolean;
}

function SearchFieldIndicator({
    className,
    asChild,
    children,
    ...props
}: SearchFieldIndicatorProps) {
    const { disabled } = useSearchFieldContext();

    const Component = asChild ? Slot : 'span';

    return (
        <Component
            data-ui="search-field-indicator"
            data-disabled={disabled || undefined}
            aria-hidden

            className={cn(
                'inline-flex items-center justify-center size-9 text-muted-write shrink-0 pointer-events-none',
                '[&_svg]:pointer-events-none [&_svg:not([class*="size-"])]:size-4 [&_svg]:shrink-0',
                className
            )}

            {...props}
        >
            {asChild ? children : (
                <svg
                    data-ui="search-field-indicator-icon"
                    aria-hidden
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                </svg>
            )}
        </Component>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface SearchFieldClearProps extends HTMLAttributes<HTMLButtonElement> {
    asChild?: boolean;
}

function SearchFieldClear({
    className,
    asChild,
    children,
    onClick,
    ...props
}: SearchFieldClearProps) {
    const { value, clear, disabled, readOnly } = useSearchFieldContext();

    const Component = asChild ? Slot : 'button';

    const handleClick = useCallback(
        (event: MouseEvent<HTMLButtonElement>) => {
            if (disabled || readOnly) return;
            clear();
            onClick?.(event);
        },
        [clear, disabled, onClick, readOnly]
    );

    // Hide clear button when there's no value
    if (value.length === 0) return null;

    return (
        <Component
            data-ui="search-field-clear"
            data-disabled={disabled || undefined}

            type="button"
            disabled={disabled || readOnly}
            aria-label="Clear search"
            onClick={handleClick}

            className={cn(
                'inline-flex items-center justify-center shrink-0 cursor-pointer rounded ring-offset-2 transition-all z-10',
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

interface SearchFieldClearIndicatorProps extends HTMLAttributes<HTMLElement> {
    asChild?: boolean;
}

function SearchFieldClearIndicator({
    className,
    asChild,
    children,
    ...props
}: SearchFieldClearIndicatorProps) {
    const Component = asChild ? Slot : 'span';

    return (
        <Component
            data-ui="search-field-clear-indicator"
            aria-hidden

            className={cn(
                'w-fit [&>svg]:size-4 text-current shrink-0',
                className
            )}

            {...props}
        >
            {asChild ? children : (
                <svg
                    data-ui="search-field-clear-indicator-icon"
                    aria-hidden
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                </svg>
            )}
        </Component>
    );
}

// ---------------------------------------------------------------------------------------------------- //

export {
    SearchField,
    SearchFieldInput,
    SearchFieldIndicator,
    SearchFieldClear,
    SearchFieldClearIndicator,
    type SearchFieldProps,
    type SearchFieldInputProps,
    type SearchFieldIndicatorProps,
    type SearchFieldClearProps,
    type SearchFieldClearIndicatorProps,
}

// ---------------------------------------------------------------------------------------------------- //
