import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useReducer,
    useRef,
    useState,
    type HTMLAttributes,
    type ReactNode,
    type Dispatch,
    type ChangeEvent,
    type FocusEvent,
    type KeyboardEvent,
    type MouseEvent,
    type PointerEvent,
} from "react";

import { useControllableState } from "@/hooks/use-controllable-state";

import { Slot } from "@/ui/slot";
import { cn } from "@/cn";

// ---------------------------------------------------------------------------------------------------- //

type NumericFieldValue = number | null;

interface NumericFieldState {
    inputValue: string;
    isScrubbing: boolean;
    scrubStartValue: number | null;
    scrubStartPosition: number;
}

type NumericFieldAction =
    | { type: 'SET_INPUT_VALUE'; payload: string }
    | { type: 'START_SCRUB'; payload: { value: number | null; position: number } }
    | { type: 'END_SCRUB' }

function numericFieldReducer(state: NumericFieldState, action: NumericFieldAction): NumericFieldState {
    switch (action.type) {
        case 'SET_INPUT_VALUE':
            return { ...state, inputValue: action.payload }

        case 'START_SCRUB':
            return {
                ...state,
                isScrubbing: true,
                scrubStartValue: action.payload.value ?? 0,
                scrubStartPosition: action.payload.position,
            }

        case 'END_SCRUB':
            return {
                ...state,
                isScrubbing: false,
                scrubStartValue: null,
                scrubStartPosition: 0,
            }

        default:
            return state;
    }
}

// ---------------------------------------------------------------------------------------------------- //

const countDecimals = (value: number) => {
    if (Number.isInteger(value)) return 0;
    const [, decimals = ""] = value.toString().split(".");
    return decimals.length;
}

const roundToPrecision = (value: number, precision: number) => {
    if (!Number.isFinite(value)) return value;
    if (precision <= 0) return Math.round(value);
    return Number(value.toFixed(precision));
}

const snapToStep = (value: number, step: number, min?: number) => {
    if (!Number.isFinite(step) || step <= 0) return value;
    const base = min ?? 0;
    const snapped = Math.round((value - base) / step) * step + base;
    return roundToPrecision(snapped, countDecimals(step));
}

const clamp = (value: number, min?: number, max?: number) => {
    let next = value;
    if (min !== undefined) next = Math.max(min, next);
    if (max !== undefined) next = Math.min(max, next);
    return next;
}

const parseInputValue = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    const parsed = Number(trimmed);
    return Number.isNaN(parsed) ? null : parsed;
}

const resolveStep = (event: { shiftKey?: boolean; altKey?: boolean }, step: number, smallStep: number, largeStep: number) => {
    if (event.shiftKey) return largeStep;
    if (event.altKey) return smallStep;
    return step;
}

// ---------------------------------------------------------------------------------------------------- //

interface NumericFieldContextState {
    value: NumericFieldValue;
    setValue: (next: NumericFieldValue, options?: { commit?: boolean }) => void;
    commitValue: () => void;

    name?: string;
    min?: number;
    max?: number;
    step: number;
    smallStep: number;
    largeStep: number;
    snapOnStep: boolean;
    allowWheelScrub: boolean;
    disabled: boolean;
    readOnly: boolean;
    required: boolean;

    state: NumericFieldState;
    dispatch: Dispatch<NumericFieldAction>;

    normalizeValue: (value: NumericFieldValue) => NumericFieldValue;
}

const NumericFieldContext = createContext<NumericFieldContextState | null>(null);

function useNumericFieldContext(): NumericFieldContextState {
    const context = useContext(NumericFieldContext);
    if (!context) throw new Error("useNumericFieldContext must be used within a <NumericField> component");
    return context;
}

// ---------------------------------------------------------------------------------------------------- //

interface NumericFieldProps extends Omit<HTMLAttributes<HTMLElement>, 'defaultValue' | 'onChange'> {
    children: ReactNode;
    name?: string;
    defaultValue?: number;
    value?: NumericFieldValue;
    onValueChange?: (value: NumericFieldValue) => void;
    onValueCommit?: (value: NumericFieldValue) => void;
    snapOnStep?: boolean;
    step?: number;
    smallStep?: number;
    largeStep?: number;
    min?: number;
    max?: number;
    allowWheelScrub?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
    required?: boolean;
}

function NumericField({
    children,
    className,
    name,
    defaultValue,
    value,
    onValueChange,
    onValueCommit,
    snapOnStep = false,
    step = 1,
    smallStep = 0.1,
    largeStep = 10,
    min,
    max,
    allowWheelScrub = false,
    disabled = false,
    readOnly = false,
    required = false,
    ...props
}: NumericFieldProps) {
    const [currentValue, setCurrentValue] = useControllableState<NumericFieldValue>({
        value,
        defaultValue: defaultValue ?? null,
        onChange: onValueChange,
    });

    const [state, dispatch] = useReducer(numericFieldReducer, {
        inputValue: currentValue?.toString() ?? '',
        isScrubbing: false,
        scrubStartValue: null,
        scrubStartPosition: 0,
    });

    const normalizeValue = useCallback(
        (next: NumericFieldValue) => {
            if (next === null) return null;
            let normalized = next;
            if (snapOnStep) normalized = snapToStep(normalized, step, min);
            normalized = clamp(normalized, min, max);
            const precision = Math.max(countDecimals(step), countDecimals(smallStep), countDecimals(largeStep));
            return roundToPrecision(normalized, precision);
        },
        [largeStep, max, min, smallStep, snapOnStep, step]
    );

    const setValue = useCallback(
        (next: NumericFieldValue, options?: { commit?: boolean }) => {
            if (disabled || readOnly) return;
            const normalized = normalizeValue(next);
            setCurrentValue(normalized);
            if (options?.commit) onValueCommit?.(normalized);
        },
        [disabled, normalizeValue, onValueCommit, readOnly, setCurrentValue]
    );

    const commitValue = useCallback(() => {
        if (disabled || readOnly) return;
        onValueCommit?.(currentValue);
    }, [currentValue, disabled, onValueCommit, readOnly]);

    const contextValue: NumericFieldContextState = {
        value: currentValue,
        setValue,
        commitValue,
        name,
        min,
        max,
        step,
        smallStep,
        largeStep,
        snapOnStep,
        allowWheelScrub,
        disabled,
        readOnly,
        required,
        state,
        dispatch,
        normalizeValue,
    }

    return (
        <NumericFieldContext.Provider value={contextValue}>
            <div
                data-ui="numeric-field"
                data-disabled={disabled || undefined}
                data-readonly={readOnly || undefined}
                data-required={required || undefined}
                data-scrubbing={state.isScrubbing || undefined}
                data-has-value={currentValue !== null || undefined}
                data-value={currentValue ?? undefined}
                data-min={min ?? undefined}
                data-max={max ?? undefined}
                data-step={step}
                data-snap-on-step={snapOnStep || undefined}
                data-allow-wheel-scrub={allowWheelScrub || undefined}
                
                role="group"

                className={cn(
                    'flex w-fit items-stretch',
                    '[&>*]:focus-visible:z-10 [&>*]:focus-visible:relative',
                    '[&>[data-ui="numeric-field-input"]]:flex-1',
                    '[&>*:not(:first-child)]:rounded-l-none [&>*:not(:first-child)]:border-l-0',
                    '[&>*:not(:last-child)]:rounded-r-none',
                    className
                )}

                {...props}
            >
                {children}
            </div>
        </NumericFieldContext.Provider>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface NumericFieldInputProps extends Omit<HTMLAttributes<HTMLInputElement>, 'value'> { }

function NumericFieldInput({
    className,
    onBlur,
    onChange,
    onKeyDown,
    onFocus,
    onMouseEnter,
    onMouseLeave,
    ...props
}: NumericFieldInputProps) {
    const {
        value,
        setValue,
        commitValue,
        name,
        min,
        max,
        step,
        smallStep,
        largeStep,
        allowWheelScrub,
        disabled,
        readOnly,
        required,
        dispatch,
    } = useNumericFieldContext();

    const inputRef = useRef<HTMLInputElement>(null);
    const displayValue = value === null ? '' : String(value);
    const [isFocused, setIsFocused] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const handleChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            const raw = event.currentTarget.value;
            
            // Allow empty input (user clearing the field)
            if (raw.trim() === '') {
                dispatch({ type: 'SET_INPUT_VALUE', payload: raw });
                setValue(null);
                onChange?.(event);
                return;
            }
            
            // Only update if the input is a valid number (or partial like "-" or ".")
            const parsed = parseInputValue(raw);
            if (parsed !== null || /^-?\.?$|^-?\d*\.?\d*$/.test(raw.trim())) {
                dispatch({ type: 'SET_INPUT_VALUE', payload: raw });
                if (parsed !== null) {
                    setValue(parsed);
                }
            }
            // If invalid character typed, ignore it (don't update state)
            onChange?.(event);
        },
        [dispatch, onChange, setValue]
    );

    const handleFocus = useCallback(
        (event: FocusEvent<HTMLInputElement>) => {
            setIsFocused(true);
            onFocus?.(event);
        },
        [onFocus]
    );

    const handleBlur = useCallback(
        (event: FocusEvent<HTMLInputElement>) => {
            setIsFocused(false);
            if (value !== null) {
                dispatch({ type: 'SET_INPUT_VALUE', payload: value.toString() });
            }
            commitValue();
            onBlur?.(event);
        },
        [commitValue, dispatch, onBlur, value]
    );

    const handleMouseEnter = useCallback(
        (event: MouseEvent<HTMLInputElement>) => {
            setIsHovered(true);
            onMouseEnter?.(event);
        },
        [onMouseEnter]
    );

    const handleMouseLeave = useCallback(
        (event: MouseEvent<HTMLInputElement>) => {
            setIsHovered(false);
            onMouseLeave?.(event);
        },
        [onMouseLeave]
    );

    const handleKeyDown = useCallback(
        (event: KeyboardEvent<HTMLInputElement>) => {
            if (event.key === "Enter") {
                commitValue();
                onKeyDown?.(event);
                return;
            }
            if (event.key !== "ArrowUp" && event.key !== "ArrowDown") {
                onKeyDown?.(event);
                return;
            }
            event.preventDefault();
            const direction = event.key === "ArrowUp" ? 1 : -1;
            const delta = resolveStep(event, step, smallStep, largeStep) * direction;
            const baseValue = value ?? 0;
            const next = baseValue + delta;
            setValue(next, { commit: true });
            dispatch({ type: 'SET_INPUT_VALUE', payload: next.toString() });
            onKeyDown?.(event);
        },
        [commitValue, dispatch, largeStep, onKeyDown, setValue, smallStep, step, value]
    );

    // Use native event listener with { passive: false } to properly prevent page scroll
    useEffect(() => {
        const input = inputRef.current;
        if (!input) return;

        const handleWheel = (event: WheelEvent) => {
            // Only apply wheel scrubbing if flag is true AND focused AND hovered
            if (!allowWheelScrub || !isFocused || !isHovered) {
                return;
            }
            // Prevent page scroll when wheel scrubbing
            event.preventDefault();
            event.stopPropagation();
            const direction = event.deltaY < 0 ? 1 : -1;
            const baseValue = value ?? 0;
            const next = baseValue + smallStep * direction;
            setValue(next, { commit: true });
            dispatch({ type: 'SET_INPUT_VALUE', payload: next.toString() });
        }

        input.addEventListener('wheel', handleWheel, { passive: false });
        return () => input.removeEventListener('wheel', handleWheel);
    }, [allowWheelScrub, isFocused, isHovered, dispatch, setValue, smallStep, value]);

    return (
        <input
            ref={inputRef}
            data-ui="numeric-field-input"
            data-disabled={disabled || undefined}
            data-readonly={readOnly || undefined}
            data-required={required || undefined}
            data-has-value={value !== null || undefined}
            data-value={value ?? undefined}

            name={name}
            inputMode="decimal"
            type="text"
            role="spinbutton"
            autoComplete="off"

            disabled={disabled}
            readOnly={readOnly}
            required={required}

            aria-disabled={disabled || undefined}
            aria-readonly={readOnly || undefined}
            aria-required={required || undefined}
            aria-valuenow={value ?? undefined}
            aria-valuemin={min}
            aria-valuemax={max}

            value={displayValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}

            className={cn(
                'relative flex w-full h-9 px-3 py-2 text-sm text-write ring-offset-2 transition-all rounded border border-bound bg-surface',
                'tabular-nums text-right',
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

interface NumericFieldIncrementProps extends HTMLAttributes<HTMLButtonElement> {
    asChild?: boolean;
}

function NumericFieldIncrement({
    className,
    asChild,
    children,
    onClick,
    ...props
}: NumericFieldIncrementProps) {
    const { value, setValue, step, smallStep, largeStep, disabled, readOnly, dispatch } = useNumericFieldContext();

    const Component = asChild ? Slot : 'button';

    const handleClick = useCallback(
        (event: MouseEvent<HTMLButtonElement>) => {
            if (disabled || readOnly) return;
            const delta = resolveStep(event, step, smallStep, largeStep);
            const baseValue = value ?? 0;
            const next = baseValue + delta;
            setValue(next, { commit: true });
            dispatch({ type: 'SET_INPUT_VALUE', payload: next.toString() });
            onClick?.(event);
        },
        [disabled, dispatch, largeStep, onClick, readOnly, setValue, smallStep, step, value]
    );

    return (
        <Component
            data-ui="numeric-field-increment"
            data-disabled={disabled || undefined}

            type="button"
            disabled={disabled || readOnly}
            aria-label="Increase value"
            aria-disabled={disabled || readOnly || undefined}
            onClick={handleClick}

            className={cn(
                'inline-flex items-center justify-center gap-2 rounded shrink-0 cursor-pointer ring-offset-2 transition-all',
                'focus-visible:outline-none focus-visible:ring-offset-muted-bound focus-visible:ring-outer-bound focus-visible:ring-2',
                'disabled:cursor-not-allowed disabled:pointer-events-none disabled:text-muted-write disabled:border-muted-bound',
                'aria-invalid:ring-danger aria-invalid:border-danger',
                'size-9 border border-bound bg-surface text-write hover:bg-secondary-surface/60',
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

interface NumericFieldIncrementIndicatorProps extends HTMLAttributes<HTMLElement> {
    asChild?: boolean;
}

function NumericFieldIncrementIndicator({
    className,
    asChild,
    children,
    ...props
}: NumericFieldIncrementIndicatorProps) {
    const Component = asChild ? Slot : 'span';

    return (
        <Component
            data-ui="numeric-field-increment-indicator"
            aria-hidden

            className={cn(
                'w-fit [&>svg]:size-4 text-write shrink-0',
                className
            )}

            {...props}
        >
            {asChild ? children : (
                <svg
                    data-ui="numeric-field-increment-indicator-icon"
                    aria-hidden
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                >
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M4 12C4 11.4477 4.44772 11 5 11H19C19.5523 11 20 11.4477 20 12C20 12.5523 19.5523 13 19 13H5C4.44772 13 4 12.5523 4 12Z"
                        fill="currentColor"
                    />
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M12 4C12.5523 4 13 4.44772 13 5V19C13 19.5523 12.5523 20 12 20C11.4477 20 11 19.5523 11 19V5C11 4.44772 11.4477 4 12 4Z"
                        fill="currentColor"
                    />
                </svg>
            )}
        </Component>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface NumericFieldDecrementProps extends HTMLAttributes<HTMLButtonElement> {
    asChild?: boolean;
}

function NumericFieldDecrement({
    className,
    asChild,
    children,
    onClick,
    ...props
}: NumericFieldDecrementProps) {
    const { value, setValue, step, smallStep, largeStep, disabled, readOnly, dispatch } = useNumericFieldContext();

    const Component = asChild ? Slot : 'button';

    const handleClick = useCallback(
        (event: MouseEvent<HTMLButtonElement>) => {
            if (disabled || readOnly) return;
            const delta = resolveStep(event, step, smallStep, largeStep);
            const baseValue = value ?? 0;
            const next = baseValue - delta;
            setValue(next, { commit: true });
            dispatch({ type: 'SET_INPUT_VALUE', payload: next.toString() });
            onClick?.(event);
        },
        [disabled, dispatch, largeStep, onClick, readOnly, setValue, smallStep, step, value]
    );

    return (
        <Component
            data-ui="numeric-field-decrement"
            data-disabled={disabled || undefined}

            type="button"
            disabled={disabled || readOnly}
            aria-label="Decrease value"
            aria-disabled={disabled || readOnly || undefined}
            onClick={handleClick}

            className={cn(
                'inline-flex items-center justify-center gap-2 rounded shrink-0 cursor-pointer ring-offset-2 transition-all',
                'focus-visible:outline-none focus-visible:ring-offset-muted-bound focus-visible:ring-outer-bound focus-visible:ring-2',
                'disabled:cursor-not-allowed disabled:pointer-events-none disabled:text-muted-write disabled:border-muted-bound',
                'aria-invalid:ring-danger aria-invalid:border-danger',
                'size-9 border border-bound bg-surface text-write hover:bg-secondary-surface/60',
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

interface NumericFieldDecrementIndicatorProps extends HTMLAttributes<HTMLElement> {
    asChild?: boolean;
}

function NumericFieldDecrementIndicator({
    className,
    asChild,
    children,
    ...props
}: NumericFieldDecrementIndicatorProps) {
    const Component = asChild ? Slot : 'span';

    return (
        <Component
            data-ui="numeric-field-decrement-indicator"
            aria-hidden

            className={cn(
                'w-fit [&>svg]:size-4 text-write shrink-0',
                className
            )}

            {...props}
        >
            {asChild ? children : (
                <svg
                    data-ui="numeric-field-decrement-indicator-icon"
                    aria-hidden
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                >
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M4 12C4 11.4477 4.44772 11 5 11H19C19.5523 11 20 11.4477 20 12C20 12.5523 19.5523 13 19 13H5C4.44772 13 4 12.5523 4 12Z"
                        fill="currentColor"
                    />
                </svg>
            )}
        </Component>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface NumericFieldScrubProps extends HTMLAttributes<HTMLButtonElement> {
    asChild?: boolean;
    direction?: 'horizontal' | 'vertical';
    pixelSensitivity?: number;
    teleportDistance?: number;
}

function NumericFieldScrub({
    className,
    asChild,
    children,
    direction = 'horizontal',
    pixelSensitivity = 2,
    teleportDistance,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    ...props
}: NumericFieldScrubProps) {
    const { value, setValue, commitValue, smallStep, disabled, readOnly, state, dispatch, normalizeValue } = useNumericFieldContext();

    const Component = asChild ? Slot : 'button';
    const lastPositionRef = useRef<number>(0);

    const handlePointerDown = useCallback(
        (event: PointerEvent<HTMLButtonElement>) => {
            if (disabled || readOnly) return;
            const position = direction === 'horizontal' ? event.clientX : event.clientY;
            lastPositionRef.current = position;
            dispatch({ type: 'START_SCRUB', payload: { value, position } });
            event.currentTarget.setPointerCapture(event.pointerId);
            onPointerDown?.(event);
        },
        [direction, disabled, dispatch, onPointerDown, readOnly, value]
    );

    const handlePointerMove = useCallback(
        (event: PointerEvent<HTMLButtonElement>) => {
            if (!state.isScrubbing || state.scrubStartValue === null) return;

            const position = direction === 'horizontal' ? event.clientX : event.clientY;
            let deltaPixels = position - lastPositionRef.current;

            // Invert delta for vertical direction (moving up should increase value)
            if (direction === 'vertical') {
                deltaPixels = -deltaPixels;
            }

            if (teleportDistance && Math.abs(deltaPixels) >= teleportDistance) {
                lastPositionRef.current = position;
                dispatch({ type: 'START_SCRUB', payload: { value, position } });
                return;
            }

            if (deltaPixels === 0) return;

            const deltaValue = (deltaPixels / pixelSensitivity) * smallStep;
            const next = normalizeValue(state.scrubStartValue + deltaValue);
            setValue(next);
            dispatch({ type: 'SET_INPUT_VALUE', payload: next?.toString() ?? '' });

            onPointerMove?.(event);
        },
        [direction, dispatch, normalizeValue, onPointerMove, pixelSensitivity, setValue, smallStep, state.isScrubbing, state.scrubStartValue, teleportDistance, value]
    );

    const handlePointerUp = useCallback(
        (event: PointerEvent<HTMLButtonElement>) => {
            if (!state.isScrubbing) return;
            event.currentTarget.releasePointerCapture(event.pointerId);
            dispatch({ type: 'END_SCRUB' });
            commitValue();
            onPointerUp?.(event);
        },
        [commitValue, dispatch, onPointerUp, state.isScrubbing]
    );

    return (
        <Component
            data-ui="numeric-field-scrub"
            data-direction={direction}
            data-disabled={disabled || undefined}
            data-scrubbing={state.isScrubbing || undefined}

            type="button"
            disabled={disabled || readOnly}

            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}

            className={cn(
                'inline-flex items-center justify-center gap-2 rounded shrink-0 cursor-pointer ring-offset-2 transition-all',
                'focus-visible:outline-none focus-visible:ring-offset-muted-bound focus-visible:ring-outer-bound focus-visible:ring-2',
                'disabled:cursor-not-allowed disabled:opacity-70 disabled:pointer-events-none',
                'aria-invalid:ring-danger aria-invalid:border-danger',
                'size-9 border border-bound bg-surface text-write hover:bg-secondary-surface/60',
                '[&_svg]:pointer-events-none [&_svg:not([class*="size-"])]:size-4 [&_svg]:shrink-0',
                'data-[direction="horizontal"]:cursor-ew-resize data-[direction="vertical"]:cursor-ns-resize',
                className
            )}

            {...props}
        >
            {children}
        </Component>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface NumericFieldScrubIndicatorProps extends HTMLAttributes<HTMLElement> {
    asChild?: boolean;
    direction?: 'horizontal' | 'vertical';
}

function NumericFieldScrubIndicator({
    className,
    asChild,
    children,
    direction = 'horizontal',
    ...props
}: NumericFieldScrubIndicatorProps) {
    const Component = asChild ? Slot : 'span';

    return (
        <Component
            data-ui="numeric-field-scrub-indicator"
            data-direction={direction}
            aria-hidden

            className={cn(
                'w-fit [&>svg]:size-4 text-write shrink-0',
                direction === 'horizontal' && '[&>svg]:rotate-90',
                className
            )}

            {...props}
        >
            {asChild ? children : (
                <svg
                    data-ui="numeric-field-scrub-indicator-icon"
                    aria-hidden
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                >
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M6.29289 14.2929C6.68342 13.9024 7.31658 13.9024 7.70711 14.2929L12 18.5858L16.2929 14.2929C16.6834 13.9024 17.3166 13.9024 17.7071 14.2929C18.0976 14.6834 18.0976 15.3166 17.7071 15.7071L12.7071 20.7071C12.3166 21.0976 11.6834 21.0976 11.2929 20.7071L6.29289 15.7071C5.90237 15.3166 5.90237 14.6834 6.29289 14.2929Z"
                        fill="currentColor"
                    />
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M11.2929 3.29289C11.6834 2.90237 12.3166 2.90237 12.7071 3.29289L17.7071 8.29289C18.0976 8.68342 18.0976 9.31658 17.7071 9.70711C17.3166 10.0976 16.6834 10.0976 16.2929 9.70711L12 5.41421L7.70711 9.70711C7.31658 10.0976 6.68342 10.0976 6.29289 9.70711C5.90237 9.31658 5.90237 8.68342 6.29289 8.29289L11.2929 3.29289Z"
                        fill="currentColor"
                    />
                </svg>
            )}
        </Component>
    );
}

// ---------------------------------------------------------------------------------------------------- //

export {
    NumericField,
    NumericFieldInput,
    NumericFieldIncrement,
    NumericFieldIncrementIndicator,
    NumericFieldDecrement,
    NumericFieldDecrementIndicator,
    NumericFieldScrub,
    NumericFieldScrubIndicator,
    type NumericFieldProps,
    type NumericFieldInputProps,
    type NumericFieldIncrementProps,
    type NumericFieldIncrementIndicatorProps,
    type NumericFieldDecrementProps,
    type NumericFieldDecrementIndicatorProps,
    type NumericFieldScrubProps,
    type NumericFieldScrubIndicatorProps,
}

// ---------------------------------------------------------------------------------------------------- //
