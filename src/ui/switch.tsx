import {
    createContext,
    useCallback,
    useContext,
    useState,
    useRef,
    useId,
    type HTMLAttributes,
    type KeyboardEvent,
    type RefObject,
} from "react";

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

interface SwitchContextState {
    checked: boolean;
    disabled: boolean;
    readOnly: boolean;
    required: boolean;
    onCheckedChange: (checked: boolean) => void;
    inputRef: RefObject<HTMLInputElement | null>;
    rootId: string;
}

const SwitchContext = createContext<SwitchContextState | null>(null);

function useSwitchContext(): SwitchContextState {
    const context = useContext(SwitchContext);
    if (!context) throw new Error('Switch components must be used within Switch.Root');

    return context;
}

// ---------------------------------------------------------------------------------------------------- //

interface SwitchProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'onChange'> {
    defaultChecked?: boolean;
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    disabled?: boolean;
    readOnly?: boolean;
    required?: boolean;
    name?: string;
    id?: string;
    inputRef?: RefObject<HTMLInputElement | null>;
}

function Switch({
    defaultChecked = false,
    checked,
    onCheckedChange,
    disabled = false,
    readOnly = false,
    required = false,
    name,
    id,
    inputRef: externalInputRef,
    children,
    className,
    onKeyDown,
    onClick,
    ...props
}: SwitchProps) {
    const [currentChecked, setCurrentChecked] = useControllableState({
        value: checked,
        defaultValue: defaultChecked,
        onChange: onCheckedChange,
    });

    const internalInputRef = useRef<HTMLInputElement>(null);
    const inputRef = externalInputRef || internalInputRef;
    const rootId = useId();
    const switchId = id || rootId;

    const handleToggle = useCallback(() => {
        if (!disabled && !readOnly) {
            setCurrentChecked(!currentChecked);
        }
    }, [disabled, readOnly, currentChecked, setCurrentChecked]);

    const handleKeyDown = useCallback((event: KeyboardEvent<HTMLSpanElement>) => {
        if (event.key === ' ' || event.key === 'Enter') {
            event.preventDefault();
            if (!disabled && !readOnly) {
                handleToggle();
            }
        }

        onKeyDown?.(event);
    }, [disabled, readOnly, handleToggle, onKeyDown]);

    const handleClick = useCallback((event: React.MouseEvent<HTMLSpanElement>) => {
        if (!disabled && !readOnly) {
            handleToggle();
        }
        onClick?.(event);
    }, [disabled, readOnly, handleToggle, onClick]);

    const contextValue: SwitchContextState = {
        checked: currentChecked,
        disabled,
        readOnly,
        required,
        onCheckedChange: setCurrentChecked,
        inputRef,
        rootId: switchId,
    }

    return (
        <SwitchContext.Provider value={contextValue}>
            <span
                id={switchId}
                role="switch"
                aria-checked={currentChecked}
                aria-disabled={disabled || undefined}
                aria-readonly={readOnly || undefined}
                aria-required={required || undefined}
                data-ui="switch"
                data-state={currentChecked ? 'checked' : 'unchecked'}
                data-disabled={disabled || undefined}
                tabIndex={disabled || readOnly ? -1 : 0}
                className={cn(
                    'relative inline-flex items-center h-6 w-11 rounded-full transition-colors bg-muted-surface cursor-pointer',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-outer-bound focus-visible:ring-offset-2',
                    'data-[state=checked]:bg-primary-surface',
                    'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
                    className
                )}
                onClick={handleClick}
                onKeyDown={handleKeyDown}
                {...props}
            >
                {children}
            </span>

            {/* Hidden native input for form integration */}
            {name && (
                <input
                    ref={inputRef}
                    type="checkbox"
                    name={name}
                    checked={currentChecked}
                    required={required}
                    disabled={disabled}
                    readOnly={readOnly}
                    onChange={() => { }} // Controlled by the switch
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
        </SwitchContext.Provider>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface SwitchThumbProps extends HTMLAttributes<HTMLSpanElement> { }

function SwitchThumb({
    className,
    ...props
}: SwitchThumbProps) {
    const { checked, disabled } = useSwitchContext();

    return (
        <span
            data-ui="switch-thumb"
            data-state={checked ? 'checked' : 'unchecked'}
            data-disabled={disabled || undefined}
            aria-hidden="true"
            className={cn(
                'pointer-events-none block size-4 rounded-full bg-surface border border-bound transition-transform duration-200 ease-in-out translate-x-0.5',
                'data-[state=checked]:translate-x-6',
                className
            )}
            {...props}
        />
    );
}

// ---------------------------------------------------------------------------------------------------- //

export {
    Switch,
    SwitchThumb,
    type SwitchProps,
    type SwitchThumbProps,
}

// ---------------------------------------------------------------------------------------------------- //
