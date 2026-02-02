import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
    type InputHTMLAttributes,
    type HTMLAttributes,
    type ReactNode,
    type KeyboardEvent,
    type ClipboardEvent,
    type FocusEvent,
    type RefObject,
} from "react";

import { useControllableState } from "@/hooks/use-controllable-state";
import { Slot } from "@/ui/slot";
import { cn } from "@/cn";

// ---------------------------------------------------------------------------------------------------- //

type ValidationType = "numeric" | "alphanumeric" | "alphabetic";
type Orientation = "horizontal" | "vertical";
type Direction = "ltr" | "rtl";

interface InputEntry {
    id: string;
    ref: RefObject<HTMLInputElement | null>;
    index: number;
}

interface OTPFieldContextState {
    value: string;
    setValue: (value: string) => void;
    length: number;
    disabled: boolean;
    readOnly: boolean;
    type: "text" | "password";
    validationType: ValidationType;
    orientation: Orientation;
    dir: Direction;
    autoComplete: string;

    // Input registration (auto-incrementing index)
    registerInput: (id: string, ref: RefObject<HTMLInputElement | null>) => number;
    unregisterInput: (id: string) => void;
    getInputIndex: (id: string) => number;

    // Focus management
    focusedIndex: number;
    setFocusedIndex: (index: number) => void;
    focusInput: (index: number) => void;
    focusNextInput: () => void;
    focusPrevInput: () => void;
    focusFirstInput: () => void;
    focusLastInput: () => void;
    focusFirstEmptyOrLast: () => void;
    isProgrammaticFocus: RefObject<boolean>;

    // Value management
    setCharAt: (index: number, char: string) => void;
    deleteCharAt: (index: number) => void;
    deleteCharAtAndShift: (index: number) => void;
    clearAll: () => void;
    handlePaste: (pastedValue: string) => void;
}

const OTPFieldContext = createContext<OTPFieldContextState | null>(null);

function useOTPFieldContext(): OTPFieldContextState {
    const context = useContext(OTPFieldContext);
    if (!context) throw new Error("OTP Field components must be used within an <OTPField> component");
    return context;
}

// ---------------------------------------------------------------------------------------------------- //

const sanitizeByType = (value: string, validationType: ValidationType): string => {
    switch (validationType) {
        case "numeric":
            return value.replace(/[^0-9]/g, "");
        case "alphabetic":
            return value.replace(/[^a-zA-Z]/g, "");
        case "alphanumeric":
            return value.replace(/[^a-zA-Z0-9]/g, "");
        default:
            return value;
    }
}

const isValidChar = (char: string, validationType: ValidationType): boolean => {
    if (char.length !== 1) return false;
    switch (validationType) {
        case "numeric":
            return /^[0-9]$/.test(char);
        case "alphabetic":
            return /^[a-zA-Z]$/.test(char);
        case "alphanumeric":
            return /^[a-zA-Z0-9]$/.test(char);
        default:
            return true;
    }
}

// ---------------------------------------------------------------------------------------------------- //
// Keyboard Actions
// ---------------------------------------------------------------------------------------------------- //

const OTPFieldAction = {
    None: -1,
    Submit: 0,      // Enter - submit form
    Next: 1,        // ArrowRight (horizontal) / ArrowDown (vertical)
    Previous: 2,    // ArrowLeft (horizontal) / ArrowUp (vertical)
    First: 3,       // Home
    Last: 4,        // End
    Delete: 5,      // Delete - remove char and shift values back
    Backspace: 6,   // Backspace - remove char and move to previous
    ClearAll: 7,    // Cmd/Ctrl + Backspace - clear all
    TypeChar: 8,    // Character input
} as const;

type OTPFieldActionType = typeof OTPFieldAction[keyof typeof OTPFieldAction];

const getOTPFieldAction = (
    event: KeyboardEvent<HTMLInputElement>,
    orientation: Orientation,
    dir: Direction
): OTPFieldActionType => {
    const isHorizontal = orientation === "horizontal";
    const isRtl = dir === "rtl";

    // Cmd/Ctrl + Backspace - clear all
    if ((event.metaKey || event.ctrlKey) && event.key === "Backspace") return OTPFieldAction.ClearAll;

    switch (event.key) {
        case "Enter":
            return OTPFieldAction.Submit;
        case "ArrowLeft":
            if (isHorizontal) return isRtl ? OTPFieldAction.Next : OTPFieldAction.Previous;
            return OTPFieldAction.None;

        case "ArrowRight":
            if (isHorizontal) return isRtl ? OTPFieldAction.Previous : OTPFieldAction.Next;
            return OTPFieldAction.None;

        case "ArrowUp":
            if (!isHorizontal) return OTPFieldAction.Previous;
            return OTPFieldAction.None;

        case "ArrowDown":
            if (!isHorizontal) return OTPFieldAction.Next;
            return OTPFieldAction.None;
        case "Home":
            return OTPFieldAction.First;
        case "End":
            return OTPFieldAction.Last;
        case "Backspace":
            return OTPFieldAction.Backspace;
        case "Delete":
            return OTPFieldAction.Delete;
        default:
            // Single character without modifier keys
            if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) return OTPFieldAction.TypeChar;

            return OTPFieldAction.None;
    }
}

// ---------------------------------------------------------------------------------------------------- //

interface OTPFieldProps extends Omit<HTMLAttributes<HTMLElement>, 'defaultValue' | 'onChange' | 'dir'> {
    children: ReactNode;
    asChild?: boolean;

    // Value
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;

    // Auto submit
    autoSubmit?: boolean;
    onAutoSubmit?: (value: string) => void;

    // Form
    form?: string;
    name?: string;

    // Validation
    type?: "text" | "password";
    validationType?: ValidationType;
    sanitizeValue?: (value: string) => string;

    // Behavior
    autoComplete?: string;
    autoFocus?: boolean;
    disabled?: boolean;
    readOnly?: boolean;

    // Layout
    orientation?: Orientation;
    dir?: Direction;

    // Length (number of inputs)
    length?: number;
}

function OTPField({
    children,
    className,
    asChild,
    value,
    defaultValue,
    onValueChange,
    autoSubmit = false,
    onAutoSubmit,
    form,
    name,
    type = "text",
    validationType = "numeric",
    sanitizeValue,
    autoComplete = "one-time-code",
    autoFocus = false,
    disabled = false,
    readOnly = false,
    orientation = "horizontal",
    dir = "ltr",
    length = 6,
    ...props
}: OTPFieldProps) {
    const [currentValue, setCurrentValue] = useControllableState<string>({
        value,
        defaultValue: defaultValue ?? "",
        onChange: onValueChange,
    });

    const [focusedIndex, setFocusedIndex] = useState(-1);
    const [inputs] = useState(() => new Map<string, InputEntry>());
    const nextIndexRef = useRef(0);

    const hasAutoFocused = useRef(false);
    const hiddenInputRef = useRef<HTMLInputElement>(null);
    const isProgrammaticFocus = useRef(false);

    // Sanitize function
    const sanitize = useCallback(
        (val: string) => sanitizeValue ? sanitizeValue(val) : sanitizeByType(val, validationType),
        [sanitizeValue, validationType]
    );

    // Register/unregister inputs with auto-incrementing index
    const registerInput = useCallback((id: string, ref: RefObject<HTMLInputElement | null>) => {
        // Check if already registered - update ref if so
        const existing = inputs.get(id);
        if (existing) {
            existing.ref = ref;
            return existing.index;
        }

        const index = nextIndexRef.current++;
        inputs.set(id, { id, ref, index });
        return index;
    }, [inputs]);

    const unregisterInput = useCallback((id: string) => {
        inputs.delete(id);
    }, [inputs]);

    const getInputIndex = useCallback((id: string) => {
        return inputs.get(id)?.index ?? -1;
    }, [inputs]);

    // Get sorted inputs by index
    const getSortedInputs = useCallback(() =>
        Array.from(inputs.values()).sort((a, b) => a.index - b.index),
        [inputs]);

    // Focus management
    const focusInput = useCallback((index: number) => {
        const sorted = getSortedInputs();
        const clampedIndex = Math.max(0, Math.min(index, sorted.length - 1));
        const input = sorted[clampedIndex];

        if (input?.ref.current) {
            isProgrammaticFocus.current = true;
            input.ref.current.focus();
            input.ref.current.select();
        }
    }, [getSortedInputs]);

    // Get the maximum navigable index (first empty slot, or last if all filled)
    const getMaxNavigableIndex = useCallback(() => {
        for (let i = 0; i < length; i++) if (!currentValue[i]) return i;
        return length - 1;
    }, [currentValue, length]);

    const focusNextInput = useCallback(() => {
        const maxIndex = getMaxNavigableIndex();
        const nextIndex = Math.min(focusedIndex + 1, maxIndex);
        focusInput(nextIndex);
    }, [focusedIndex, focusInput, getMaxNavigableIndex]);

    const focusPrevInput = useCallback(() => {
        const prevIndex = Math.max(focusedIndex - 1, 0);
        focusInput(prevIndex);
    }, [focusedIndex, focusInput]);

    const focusFirstInput = useCallback(() => focusInput(0), [focusInput]);

    const focusLastInput = useCallback(() => {
        // Focus the last navigable input (last filled or first empty)
        const maxIndex = getMaxNavigableIndex();
        focusInput(maxIndex);
    }, [focusInput, getMaxNavigableIndex]);

    // Focus first empty input, or last input if all are filled
    const focusFirstEmptyOrLast = useCallback(() => {
        const sorted = getSortedInputs();

        // Find first empty slot
        for (let i = 0; i < sorted.length; i++) if (!currentValue[i]) {
            focusInput(i);
            return;
        }

        // All filled, focus last
        focusInput(sorted.length - 1);
    }, [currentValue, focusInput, getSortedInputs]);

    // Value management
    const setValue = useCallback((newValue: string) => {
        if (disabled || readOnly) return;
        const sanitized = sanitize(newValue).slice(0, length);
        setCurrentValue(sanitized);
    }, [disabled, readOnly, sanitize, length, setCurrentValue]);

    const setCharAt = useCallback((index: number, char: string) => {
        if (disabled || readOnly) return;
        if (char && !isValidChar(char, validationType)) return;

        const chars = currentValue.padEnd(length, "").split("");
        chars[index] = char;
        const newValue = chars.join("").replace(/\s+$/, "");
        setValue(newValue);

        // Move to next input if character was entered
        if (char && index < length - 1) focusInput(index + 1);
    }, [currentValue, disabled, focusInput, length, readOnly, setValue, validationType]);

    const deleteCharAt = useCallback((index: number) => {
        if (disabled || readOnly) return;
        const chars = currentValue.padEnd(length, "").split("");
        chars[index] = "";
        const newValue = chars.join("").replace(/\s+$/, "");
        setValue(newValue);
    }, [currentValue, disabled, length, readOnly, setValue]);

    // Delete character at index and shift later values back
    const deleteCharAtAndShift = useCallback((index: number) => {
        if (disabled || readOnly) return;
        const chars = currentValue.split("");
        chars.splice(index, 1); // Remove character at index, shifting others
        const newValue = chars.join("");
        setValue(newValue);
    }, [currentValue, disabled, readOnly, setValue]);

    // Clear all values
    const clearAll = useCallback(() => {
        if (disabled || readOnly) return;
        setValue("");
        focusInput(0);
    }, [disabled, focusInput, readOnly, setValue]);

    const handlePaste = useCallback((pastedValue: string) => {
        if (disabled || readOnly) return;

        const sanitized = sanitize(pastedValue).slice(0, length);
        setValue(sanitized);

        // Focus the input after the last pasted character, or the last input
        const nextIndex = Math.min(sanitized.length, length - 1);
        focusInput(nextIndex);
    }, [disabled, focusInput, length, readOnly, sanitize, setValue]);

    // Auto-submit when complete
    useEffect(() => {
        if (autoSubmit && currentValue.length === length && onAutoSubmit) onAutoSubmit(currentValue);
    }, [autoSubmit, currentValue, length, onAutoSubmit]);

    // Auto-focus first input on mount
    useEffect(() => {
        if (autoFocus && !hasAutoFocused.current) {
            hasAutoFocused.current = true;
            requestAnimationFrame(() => {
                focusFirstInput();
            });
        }
    }, [autoFocus, focusFirstInput]);

    const contextValue: OTPFieldContextState = {
        value: currentValue,
        setValue,
        length,
        disabled,
        readOnly,
        type,
        validationType,
        orientation,
        dir,
        autoComplete,
        registerInput,
        unregisterInput,
        getInputIndex,
        focusedIndex,
        setFocusedIndex,
        focusInput,
        focusNextInput,
        focusPrevInput,
        focusFirstInput,
        focusLastInput,
        focusFirstEmptyOrLast,
        isProgrammaticFocus,
        setCharAt,
        deleteCharAt,
        deleteCharAtAndShift,
        clearAll,
        handlePaste,
    }

    const Component = asChild ? Slot : "div";

    return (
        <OTPFieldContext.Provider value={contextValue}>
            <Component
                data-ui="otp-field"
                data-complete={currentValue.length === length || undefined}
                data-disabled={disabled || undefined}
                data-readonly={readOnly || undefined}
                data-orientation={orientation}
                data-dir={dir}

                role="group"
                aria-label="One-time password"
                dir={dir}

                className={cn(
                    'flex w-fit items-center gap-2',
                    orientation === "vertical" && 'flex-col',
                    className
                )}

                {...props}
            >
                {children}

                <input
                    autoComplete={autoComplete}
                    ref={hiddenInputRef}
                    value={currentValue}
                    disabled={disabled}
                    tabIndex={-1}
                    type="text"
                    name={name}
                    form={form}
                    readOnly

                    aria-hidden="true"

                    onChange={(e) => {
                        const newValue = sanitize(e.target.value).slice(0, length);
                        if (newValue !== currentValue) setValue(newValue);
                    }}

                    style={{
                        clip: "rect(0, 0, 0, 0)",
                        position: "absolute",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        margin: -1,
                        padding: 0,
                        border: 0,
                        height: 1,
                        width: 1,
                    }}
                />
            </Component>
        </OTPFieldContext.Provider>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface OTPFieldGroupProps extends HTMLAttributes<HTMLElement> {
    children: ReactNode;
    asChild?: boolean;
}

function OTPFieldGroup({
    children,
    className,
    asChild,
    ...props
}: OTPFieldGroupProps) {
    const { orientation } = useOTPFieldContext();
    const Component = asChild ? Slot : "div";

    return (
        <Component
            data-ui="otp-field-group"
            data-orientation={orientation}

            role="group"

            className={cn(
                'flex items-stretch',
                // Merge borders and border-radius for horizontal orientation
                orientation === "horizontal" && [
                    '[&>*:not(:first-child)]:rounded-l-none [&>*:not(:first-child)]:border-l-0',
                    '[&>*:not(:last-child)]:rounded-r-none',
                ],
                // Merge borders and border-radius for vertical orientation
                orientation === "vertical" && [
                    'flex-col',
                    '[&>*:not(:first-child)]:rounded-t-none [&>*:not(:first-child)]:border-t-0',
                    '[&>*:not(:last-child)]:rounded-b-none',
                ],
                // Ensure focused input is above siblings
                '[&>*]:focus-visible:z-10 [&>*]:focus-visible:relative',
                className
            )}

            {...props}
        >
            {children}
        </Component>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface OTPFieldSeparatorProps extends HTMLAttributes<HTMLElement> {
    asChild?: boolean;
}

function OTPFieldSeparator({ className, asChild, children, ...props }: OTPFieldSeparatorProps) {
    const Component = asChild ? Slot : "div";

    return (
        <Component
            data-ui="otp-field-separator"
            role="separator"
            aria-hidden="true"
            className={cn('flex items-center justify-center', className)}
            {...props}
        >
            {children ?? <span className="h-0.5 w-2 rounded-full bg-write" />}
        </Component>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface OTPFieldInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'type' | 'onChange' | 'size'> {}

function OTPFieldInput({
    className,
    onFocus,
    onBlur,
    onKeyDown,
    onPaste,
    ...props
}: OTPFieldInputProps) {
    const {
        value,
        length,
        disabled,
        readOnly,
        type,
        validationType,
        orientation,
        dir,
        focusedIndex,
        registerInput,
        unregisterInput,
        setFocusedIndex,
        focusInput,
        isProgrammaticFocus,
        setCharAt,
        deleteCharAt,
        deleteCharAtAndShift,
        clearAll,
        handlePaste,
    } = useOTPFieldContext();

    const inputRef = useRef<HTMLInputElement>(null);
    const inputId = useRef("otp-input-" + Math.random().toString(36).slice(2));
    const [index] = useState(() => registerInput(inputId.current, inputRef));

    const charValue = value[index] ?? "";

    // Update ref in the map after mount (when inputRef.current is available)
    useLayoutEffect(() => {
        // Re-register to update the ref now that DOM is available
        registerInput(inputId.current, inputRef);
    }, [registerInput]);

    // Handle cleanup on unmount
    useEffect(() => {
        return () => unregisterInput(inputId.current);
    }, [unregisterInput]);

    // Compute roving tabindex - only the "active" slot is tabbable when field is not focused
    const getTabIndex = useCallback(() => {
        // If any input in the field is focused, all should have tabIndex=-1
        // This allows Tab to exit the component naturally
        if (focusedIndex !== -1) return -1;

        // When no input is focused, the target input should be tabbable
        let targetIndex = length - 1;
        for (let i = 0; i < length; i++) if (!value[i]) {
            targetIndex = i;
            break;
        }

        return index === targetIndex ? 0 : -1;
    }, [focusedIndex, index, length, value]);

    const handleFocus = useCallback((event: FocusEvent<HTMLInputElement>) => {
        // If this is a programmatic focus (from keyboard navigation), just accept it
        if (isProgrammaticFocus.current) {
            isProgrammaticFocus.current = false;
            setFocusedIndex(index);
            event.currentTarget.select();
            onFocus?.(event);
            return;
        }

        // For user-initiated focus (click/tab), redirect to first empty slot
        let targetIndex = length - 1;
        for (let i = 0; i < length; i++) {
            if (!value[i]) {
                targetIndex = i;
                break;
            }
        }

        // If user clicked on the target slot, select it and stay
        if (index === targetIndex) {
            setFocusedIndex(index);
            event.currentTarget.select();
            onFocus?.(event);
            return;
        }

        // Redirect focus to the target slot
        setFocusedIndex(targetIndex);
        focusInput(targetIndex);

        onFocus?.(event);
    }, [index, onFocus, setFocusedIndex, length, value, focusInput, isProgrammaticFocus]);

    const handleBlur = useCallback((event: FocusEvent<HTMLInputElement>) => {
        setFocusedIndex(-1);
        onBlur?.(event);
    }, [onBlur, setFocusedIndex]);

    const handleKeyDown = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
        const action = getOTPFieldAction(event, orientation, dir);

        // Calculate max navigable index (first empty slot, or last if all filled)
        let maxNavigableIndex = length - 1;
        for (let i = 0; i < length; i++) {
            if (!value[i]) {
                maxNavigableIndex = i;
                break;
            }
        }

        switch (action) {
            case OTPFieldAction.Submit: {
                // Let Enter propagate for form submission
                // Find and submit the closest form
                const form = event.currentTarget.closest('form');

                if (form) {
                    form.requestSubmit();
                    event.preventDefault();
                }

                break;
            }

            case OTPFieldAction.Next:
                event.preventDefault();
                // Only navigate to filled slots + first empty
                if (index < maxNavigableIndex) focusInput(index + 1);
                break;

            case OTPFieldAction.Previous:
                event.preventDefault();
                if (index > 0) focusInput(index - 1);
                break;

            case OTPFieldAction.First:
                event.preventDefault();
                focusInput(0);
                break;

            case OTPFieldAction.Last:
                event.preventDefault();
                // Go to max navigable (last filled or first empty)
                focusInput(maxNavigableIndex);
                break;

            case OTPFieldAction.Backspace: {
                event.preventDefault();

                if (charValue) {
                    deleteCharAt(index);
                    // Stay on current input after deleting (it's now empty)
                }

                else if (index > 0) {
                    // Move to previous and delete there
                    focusInput(index - 1);
                    deleteCharAt(index - 1);
                }

                break;
            }

            case OTPFieldAction.Delete:
                event.preventDefault();
                deleteCharAtAndShift(index);
                break;

            case OTPFieldAction.ClearAll:
                event.preventDefault();
                clearAll();
                break;

            case OTPFieldAction.TypeChar: {
                event.preventDefault();
                if (isValidChar(event.key, validationType)) setCharAt(index, event.key);
                break;
            }

            // Tab, Shift+Tab - let browser handle naturally (OTPFieldAction.None)
            default:
                break;
        }

        onKeyDown?.(event);
    }, [
        charValue,
        clearAll,
        deleteCharAt,
        deleteCharAtAndShift,
        dir,
        focusInput,
        index,
        length,
        onKeyDown,
        orientation,
        setCharAt,
        validationType,
        value,
    ]);

    const handleInputPaste = useCallback((event: ClipboardEvent<HTMLInputElement>) => {
        event.preventDefault();
        const pastedData = event.clipboardData.getData("text/plain");
        handlePaste(pastedData);
        onPaste?.(event);
    }, [handlePaste, onPaste]);

    const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;

        if (newValue.length > 1) {
            handlePaste(newValue);
            return;
        }

        if (newValue.length === 1 && isValidChar(newValue, validationType)) setCharAt(index, newValue);
    }, [handlePaste, index, setCharAt, validationType]);

    return (
        <input
            data-ui="otp-field-input"
            data-filled={!!charValue || undefined}
            data-readonly={readOnly || undefined}
            data-disabled={disabled || undefined}
            data-index={index}

            inputMode={validationType === "numeric" ? "numeric" : "text"}
            pattern={validationType === "numeric" ? "[0-9]*" : undefined}
            autoComplete={index === 0 ? "one-time-code" : "off"}
            tabIndex={getTabIndex()}
            disabled={disabled}
            readOnly={readOnly}
            value={charValue}
            ref={inputRef}
            type={type}
            size={9}


            aria-label={"Digit " + (index + 1) + " of " + length}
            aria-disabled={disabled || undefined}
            aria-readonly={readOnly || undefined}


            onPaste={handleInputPaste}
            onKeyDown={handleKeyDown}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}

            className={cn(
                'flex items-center justify-center text-center text-write ring-offset-2 transition-all rounded border border-bound bg-surface size-9 text-lg font-medium',
                'focus-visible:outline-none focus-visible:ring-offset-muted-bound focus-visible:ring-outer-bound focus-visible:ring-2',
                'disabled:cursor-not-allowed disabled:pointer-events-none disabled:text-muted-write disabled:border-muted-bound',
                'aria-invalid:ring-danger aria-invalid:border-danger',
                className
            )}

            {...props}
        />
    );
}

// ---------------------------------------------------------------------------------------------------- //

export {
    OTPField,
    OTPFieldGroup,
    OTPFieldSeparator,
    OTPFieldInput,
    type OTPFieldProps,
    type OTPFieldGroupProps,
    type OTPFieldSeparatorProps,
    type OTPFieldInputProps,
}

// ---------------------------------------------------------------------------------------------------- //
