import {
    createContext,
    useCallback,
    useContext,
    useState,
    useRef,
    useId,
    useEffect,
    type HTMLAttributes,
    type KeyboardEvent,
    type RefObject,
} from "react";

import { cn } from "@/cn";

// ---------------------------------------------------------------------------------------------------- //

type CheckedState = boolean | 'indeterminate';

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

interface CheckboxGroupContextState {
    value: string[];
    disabled: boolean;
    required: boolean;
    name?: string;
    onValueChange: (value: string[]) => void;
}

const CheckboxGroupContext = createContext<CheckboxGroupContextState | null>(null);

function useCheckboxGroupContext(): CheckboxGroupContextState | null {
    return useContext(CheckboxGroupContext);
}

// ---------------------------------------------------------------------------------------------------- //

interface CheckboxGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
    defaultValue?: string[];
    value?: string[];
    onValueChange?: (value: string[]) => void;
    disabled?: boolean;
    required?: boolean;
    name?: string;
    orientation?: 'horizontal' | 'vertical';
}

function CheckboxGroup({
    defaultValue = [],
    value,
    onValueChange,
    disabled = false,
    required = false,
    name,
    orientation = 'vertical',
    children,
    className,
    ...props
}: CheckboxGroupProps) {
    const [currentValue, setCurrentValue] = useControllableState<string[]>({
        value,
        defaultValue,
        onChange: onValueChange,
    });

    const contextValue: CheckboxGroupContextState = {
        value: currentValue,
        disabled,
        required,
        name,
        onValueChange: setCurrentValue,
    }

    return (
        <CheckboxGroupContext.Provider value={contextValue}>
            <div
                role="group"
                data-ui="checkbox-group"
                data-orientation={orientation}
                data-disabled={disabled || undefined}
                className={cn(
                    'flex',
                    orientation === 'vertical' ? 'flex-col gap-2' : 'flex-row flex-wrap gap-4',
                    className
                )}
                {...props}
            >
                {children}
            </div>
        </CheckboxGroupContext.Provider>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface CheckboxContextState {
    checked: CheckedState;
    disabled: boolean;
    required: boolean;
    onCheckedChange: (checked: CheckedState) => void;
    inputRef: RefObject<HTMLInputElement | null>;
}

const CheckboxContext = createContext<CheckboxContextState | null>(null);

function useCheckboxContext(): CheckboxContextState {
    const context = useContext(CheckboxContext);
    if (!context) throw new Error('useCheckboxContext must be used within a Checkbox');

    return context;
}

// ---------------------------------------------------------------------------------------------------- //

interface CheckboxProps extends Omit<HTMLAttributes<HTMLButtonElement>, 'onChange' | 'defaultChecked'> {
    defaultChecked?: CheckedState;
    checked?: CheckedState;
    onCheckedChange?: (checked: CheckedState) => void;
    disabled?: boolean;
    required?: boolean;
    name?: string;
    value?: string;
}

function Checkbox({
    defaultChecked = false,
    checked,
    onCheckedChange,
    disabled: disabledProp = false,
    required: requiredProp = false,
    name: nameProp,
    value = 'on',
    children,
    className,
    onKeyDown,
    ...props
}: CheckboxProps) {
    const groupContext = useCheckboxGroupContext();

    // Derive state from group context if within a group
    const isInGroup = groupContext !== null;
    const groupChecked = isInGroup && groupContext.value.includes(value);

    const [currentChecked, setCurrentChecked] = useControllableState<CheckedState>({
        value: isInGroup ? groupChecked : checked,
        defaultValue: isInGroup ? groupChecked : defaultChecked,
        onChange: onCheckedChange,
    });

    const inputRef = useRef<HTMLInputElement>(null);
    const buttonId = useId();

    // Merge props with group context
    const disabled = disabledProp || (groupContext?.disabled ?? false);
    const required = requiredProp || (groupContext?.required ?? false);
    const name = nameProp ?? groupContext?.name;

    const isIndeterminate = currentChecked === 'indeterminate';
    const isChecked = currentChecked === true;

    // Sync indeterminate state to native input
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.indeterminate = isIndeterminate;
        }
    }, [isIndeterminate]);

    const handleToggle = useCallback(() => {
        if (disabled) return;

        // Handle group value changes
        if (isInGroup && groupContext) {
            const newGroupValue = groupChecked
                ? groupContext.value.filter((v) => v !== value)
                : [...groupContext.value, value];
            groupContext.onValueChange(newGroupValue);
            return;
        }

        // Indeterminate -> checked, checked -> unchecked, unchecked -> checked
        setCurrentChecked(currentChecked === 'indeterminate' ? true : !currentChecked);
    }, [disabled, isInGroup, groupContext, groupChecked, value, currentChecked, setCurrentChecked]);

    const handleKeyDown = useCallback((event: KeyboardEvent<HTMLButtonElement>) => {
        if (event.key === ' ') {
            event.preventDefault();
            handleToggle();
        }

        onKeyDown?.(event);
    }, [handleToggle, onKeyDown]);

    const getDataState = () => {
        if (isIndeterminate) return 'indeterminate';
        return isChecked ? 'checked' : 'unchecked';
    }

    const contextValue: CheckboxContextState = {
        checked: currentChecked,
        disabled,
        required,
        onCheckedChange: setCurrentChecked,
        inputRef,
    }

    return (
        <CheckboxContext.Provider value={contextValue}>
            <button
                id={buttonId}
                type="button"
                role="checkbox"
                aria-checked={isIndeterminate ? 'mixed' : isChecked}
                aria-required={required || undefined}
                disabled={disabled}
                data-ui="checkbox"
                data-state={getDataState()}
                data-disabled={disabled || undefined}
                onClick={handleToggle}
                onKeyDown={handleKeyDown}
                className={cn(
                    'inline-flex items-center justify-center',
                    'size-4 rounded border border-bound',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-outer-bound focus-visible:ring-offset-2',
                    (isChecked || isIndeterminate) && 'bg-primary-surface border-primary-surface',
                    disabled && 'cursor-not-allowed opacity-50',
                    !disabled && 'cursor-pointer hover:border-primary-surface',
                    className
                )}
                {...props}
            >
                {children}
            </button>

            {/* Hidden native input for form integration */}
            {name && (
                <input
                    ref={inputRef}
                    type="checkbox"
                    name={name}
                    value={value}
                    checked={isChecked}
                    required={required}
                    disabled={disabled}
                    onChange={() => { }} // Controlled by the button
                    tabIndex={-1}
                    aria-hidden="true"
                    style={{
                        position: 'absolute',
                        pointerEvents: 'none',
                        opacity: 0,
                        margin: 0,
                        width: 0,
                        height: 0,
                    }}
                />
            )}
        </CheckboxContext.Provider>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface CheckboxIndicatorProps extends HTMLAttributes<HTMLElement> {
    forceMount?: boolean;
}

function CheckboxIndicator({
    forceMount = false,
    className,
    ...props
}: CheckboxIndicatorProps) {
    const { checked } = useCheckboxContext();

    const isIndeterminate = checked === 'indeterminate';
    const isChecked = checked === true;
    const isVisible = isChecked || isIndeterminate;

    if (!isVisible && !forceMount) return null;

    const getDataState = () => {
        if (isIndeterminate) return 'indeterminate';
        return isChecked ? 'checked' : 'unchecked';
    }

    return (
        <span
            data-ui="checkbox-indicator"
            data-state={getDataState()}
            aria-hidden="true"
            className={cn(
                'w-fit [&>svg]:size-3 text-primary-write shrink-0',
                'transition-all duration-150',
                isVisible ? 'scale-100 opacity-100' : 'scale-0 opacity-0',
                className
            )}
            {...props}
        >
            {isIndeterminate ? (
                <svg
                    data-ui="checkbox-indicator-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                >
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M4 12C4 11.4477 4.44772 11 5 11H19C19.5523 11 20 11.4477 20 12C20 12.5523 19.5523 13 19 13H5C4.44772 13 4 12.5523 4 12Z"
                    />
                </svg>
            ) : (
                <svg
                    data-ui="checkbox-indicator-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                >
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M20.7071 5.29289C21.0976 5.68342 21.0976 6.31658 20.7071 6.70711L9.70711 17.7071C9.31658 18.0976 8.68342 18.0976 8.29289 17.7071L3.29289 12.7071C2.90237 12.3166 2.90237 11.6834 3.29289 11.2929C3.68342 10.9024 4.31658 10.9024 4.70711 11.2929L9 15.5858L19.2929 5.29289C19.6834 4.90237 20.3166 4.90237 20.7071 5.29289Z"
                    />
                </svg>
            )}
        </span>
    );
}

// ---------------------------------------------------------------------------------------------------- //

export {
    Checkbox,
    CheckboxIndicator,
    CheckboxGroup,
}

export type {
    CheckboxProps,
    CheckboxIndicatorProps,
    CheckboxGroupProps,
    CheckedState,
}

// ---------------------------------------------------------------------------------------------------- //
