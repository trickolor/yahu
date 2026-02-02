import {
    createContext,
    useCallback,
    useContext,
    useState,
    useRef,
    useEffect,
    useMemo,
    useLayoutEffect,
    useId,
    type HTMLAttributes,
    type KeyboardEvent,
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

const SliderKeyActions = {
    None: 'none',
    Increment: 'increment',
    Decrement: 'decrement',
    PageIncrement: 'pageIncrement',
    PageDecrement: 'pageDecrement',
    Min: 'min',
    Max: 'max',
} as const;

type SliderKeyAction = typeof SliderKeyActions[keyof typeof SliderKeyActions];

const getSliderKeyAction = (
    event: KeyboardEvent<HTMLSpanElement>,
    orientation: 'horizontal' | 'vertical',
): SliderKeyAction => {
    switch (event.key) {
        case 'ArrowRight': return orientation === 'horizontal'
            ? SliderKeyActions.Increment
            : SliderKeyActions.None;

        case 'ArrowLeft': return orientation === 'horizontal'
            ? SliderKeyActions.Decrement
            : SliderKeyActions.None;

        case 'ArrowUp': return SliderKeyActions.Increment;
        case 'ArrowDown': return SliderKeyActions.Decrement;
        case 'PageUp': return SliderKeyActions.PageIncrement;
        case 'PageDown': return SliderKeyActions.PageDecrement;
        case 'Home': return SliderKeyActions.Min;
        case 'End': return SliderKeyActions.Max;
        default: return SliderKeyActions.None;
    }
}

// ---------------------------------------------------------------------------------------------------- //

interface SliderContextState {
    values: number[];
    onValueChange: (values: number[]) => void;
    onValueCommit?: (values: number[]) => void;
    disabled: boolean;
    orientation: 'horizontal' | 'vertical';
    dir: 'ltr' | 'rtl';
    inverted: boolean;
    min: number;
    max: number;
    step: number;
    minStepsBetweenThumbs: number;
    trackRef: React.RefObject<HTMLDivElement | null>;
    thumbRefs: React.RefObject<Map<string, HTMLSpanElement | null>>;
    activeThumbIndex: number | null;
    setActiveThumbIndex: (index: number | null) => void;
    registerThumb: (id: string) => void;
    unregisterThumb: (id: string) => void;
    getThumbIndex: (id: string) => number;
}

const SliderContext = createContext<SliderContextState | null>(null);

function useSliderContext(): SliderContextState {
    const context = useContext(SliderContext);
    if (!context) throw new Error('useSliderContext must be used within a Slider');
    return context;
}

// ---------------------------------------------------------------------------------------------------- //

interface SliderProps
    extends Omit<HTMLAttributes<HTMLElement>, 'defaultValue' | 'onChange' | 'dir'> {
    defaultValue?: number[];
    value?: number[];
    onValueChange?: (values: number[]) => void;
    onValueCommit?: (values: number[]) => void;
    name?: string;
    disabled?: boolean;
    orientation?: 'horizontal' | 'vertical';
    dir?: 'ltr' | 'rtl';
    inverted?: boolean;
    min?: number;
    max?: number;
    step?: number;
    minStepsBetweenThumbs?: number;
    form?: string;
}

function Slider({
    defaultValue = [0],
    value,
    onValueChange,
    onValueCommit,
    name,
    disabled = false,
    orientation = 'horizontal',
    dir = 'ltr',
    inverted = false,
    min = 0,
    max = 100,
    step = 1,
    minStepsBetweenThumbs = 0,
    form,
    children,
    className,
    ...props
}: SliderProps) {

    const [currentValues, setCurrentValues] = useControllableState({
        value,
        defaultValue,
        onChange: onValueChange,
    });

    const trackRef = useRef<HTMLDivElement>(null);
    const thumbRefs = useRef(new Map<string, HTMLSpanElement>());

    const [activeThumbIndex, setActiveThumbIndex] = useState<number | null>(null);
    const [thumbOrder, setThumbOrder] = useState<string[]>([]);

    const registerThumb = useCallback((id: string) => {
        setThumbOrder((prev) => (prev.includes(id) ? prev : [...prev, id]));
    }, []);

    const unregisterThumb = useCallback((id: string) => {
        setThumbOrder((prev) => prev.filter((thumbId) => thumbId !== id));
    }, []);

    const getThumbIndex = useCallback((id: string) => {
        return thumbOrder.indexOf(id);
    }, [thumbOrder]);

    const context: SliderContextState = {
        values: currentValues,
        onValueChange: setCurrentValues,
        onValueCommit,
        disabled,
        orientation,
        dir,
        inverted,
        min,
        max,
        step,
        minStepsBetweenThumbs,
        trackRef,
        thumbRefs,
        activeThumbIndex,
        setActiveThumbIndex,
        registerThumb,
        unregisterThumb,
        getThumbIndex,
    }

    return (
        <SliderContext.Provider value={context}>
            <div
                data-ui="slider"
                data-orientation={orientation}
                data-disabled={disabled || undefined}
                data-inverted={inverted || undefined}

                className={cn(
                    'relative flex touch-none select-none items-center h-5 w-full',
                    'data-[orientation=vertical]:flex-col data-[orientation=vertical]:h-48 data-[orientation=vertical]:w-5 data-[orientation=vertical]:justify-center',
                    'data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed',
                    className
                )}

                {...props}
            >
                {children}

                {name && currentValues.map((val, index) => (
                    <input
                        key={index}
                        type="number"
                        name={name}
                        value={val}
                        form={form}
                        disabled={disabled}
                        onChange={() => { }}
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
                ))}
            </div>
        </SliderContext.Provider>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface SliderTrackProps extends HTMLAttributes<HTMLElement> { }

function SliderTrack({
    className,
    children,
    onPointerDown,
    ...props
}: SliderTrackProps) {

    const {
        disabled,
        orientation,
        dir,
        inverted,
        min,
        max,
        step,
        minStepsBetweenThumbs,
        values,
        onValueChange,
        trackRef,
    } = useSliderContext();

    const isVertical = orientation === 'vertical';

    const getValueFromPointer = useCallback((clientX: number, clientY: number): number => {
        const track = trackRef.current;
        if (!track) return min;

        const rect = track.getBoundingClientRect();
        const coordinate = isVertical ? clientY : clientX;
        const trackSize = isVertical ? rect.height : rect.width;
        const trackStart = isVertical ? rect.top : rect.left;
        const offset = coordinate - trackStart;
        const normalized = Math.max(0, Math.min(1, offset / trackSize));

        const percentage = isVertical
            ? 1 - normalized
            : dir === 'rtl'
                ? 1 - normalized
                : normalized;

        const rawValue = min + percentage * (max - min);
        const steppedValue = Math.round(rawValue / step) * step;
        return Math.max(min, Math.min(max, steppedValue));
    }, [trackRef, min, max, step, isVertical, dir]);

    const pointerDownHandler = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
        if (disabled) return;
        event.preventDefault();

        const newValue = getValueFromPointer(event.clientX, event.clientY);
        const distances = values.map((v) => Math.abs(v - newValue));
        const closestIndex = distances.indexOf(Math.min(...distances));
        const newValues = [...values];
        const minStepDistance = minStepsBetweenThumbs * step;

        if (closestIndex > 0) {
            const prevValue = newValues[closestIndex - 1];

            if (newValue < prevValue + minStepDistance) {
                newValues[closestIndex] = prevValue + minStepDistance;
                onValueChange(newValues);
                onPointerDown?.(event);
                return;
            }
        }

        if (closestIndex < newValues.length - 1) {
            const nextValue = newValues[closestIndex + 1];

            if (newValue > nextValue - minStepDistance) {
                newValues[closestIndex] = nextValue - minStepDistance;
                onValueChange(newValues);
                onPointerDown?.(event);
                return;
            }
        }

        newValues[closestIndex] = newValue;
        onValueChange(newValues);
        onPointerDown?.(event);

    }, [disabled, getValueFromPointer, values, onValueChange, minStepsBetweenThumbs, step, onPointerDown]);

    return (
        <div
            data-ui="slider-track"
            data-orientation={orientation}
            data-disabled={disabled || undefined}
            data-inverted={inverted || undefined}
            ref={trackRef}
            onPointerDown={pointerDownHandler}
            className={cn(
                'absolute rounded-full bg-muted-surface cursor-pointer',
                'data-[inverted]:bg-primary-surface',
                'data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=horizontal]:top-1/2 data-[orientation=horizontal]:-translate-y-1/2',
                'data-[orientation=vertical]:w-1.5 data-[orientation=vertical]:h-full data-[orientation=vertical]:left-1/2 data-[orientation=vertical]:-translate-x-1/2',
                'data-[disabled]:cursor-not-allowed',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface SliderRangeProps extends HTMLAttributes<HTMLElement> { }

function SliderRange({
    className,
    ...props
}: SliderRangeProps) {
    const {
        values,
        orientation,
        dir,
        inverted,
        min,
        max,
    } = useSliderContext();

    const isVertical = orientation === 'vertical';
    const isRtl = dir === 'rtl';

    const toVisualOffset = (val: number) => {
        const percentage = ((val - min) / (max - min)) * 100;
        if (isVertical) return 100 - percentage;
        return isRtl ? 100 - percentage : percentage;
    }

    const axisStart = isVertical ? 100 : (isRtl ? 100 : 0);
    const offsets = values.map(toVisualOffset);

    const [startOffset, endOffset] = values.length === 1
        ? [axisStart, offsets[0]]
        : [Math.min(...offsets), Math.max(...offsets)];

    const rangeStart = Math.min(startOffset, endOffset);
    const rangeSize = Math.abs(endOffset - startOffset);

    const style = isVertical
        ? { top: `${rangeStart}%`, height: `${rangeSize}%` }
        : { left: `${rangeStart}%`, width: `${rangeSize}%` }

    return (
        <div
            data-ui="slider-range"
            data-orientation={orientation}
            data-inverted={inverted || undefined}
            className={cn(
                'absolute rounded-full bg-primary-surface',
                'data-[inverted]:bg-muted-surface',
                'data-[orientation=horizontal]:h-full',
                'data-[orientation=vertical]:w-full',
                className
            )}
            style={style}
            {...props}
        />
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface SliderThumbProps extends HTMLAttributes<HTMLElement> { }

function SliderThumb({
    className,
    onKeyDown,
    ...props
}: SliderThumbProps) {
    const {
        values,
        onValueChange,
        onValueCommit,
        disabled,
        orientation,
        dir,
        min,
        max,
        step,
        minStepsBetweenThumbs,
        thumbRefs,
        activeThumbIndex,
        setActiveThumbIndex,
        registerThumb,
        unregisterThumb,
        getThumbIndex,
    } = useSliderContext();

    const thumbId = useId();
    const isVertical = orientation === 'vertical';
    const isRtl = dir === 'rtl';
    useLayoutEffect(() => {
        registerThumb(thumbId);
        return () => unregisterThumb(thumbId);
    }, [thumbId, registerThumb, unregisterThumb]);

    const registeredIndex = getThumbIndex(thumbId);
    const thumbIndex = registeredIndex >= 0 ? registeredIndex : 0;

    const value = values[thumbIndex] ?? min;
    const basePercentage = ((value - min) / (max - min)) * 100;

    const visualPercentage = useMemo(() => {
        if (isVertical) return 100 - basePercentage;
        return isRtl ? 100 - basePercentage : basePercentage;
    }, [isVertical, isRtl, basePercentage]);

    const position = useMemo(() => {
        if (isVertical) return { top: `${visualPercentage}%` }
        return { left: `${visualPercentage}%` }
    }, [isVertical, visualPercentage]);

    const updateValue = useCallback((newValue: number, targetIndex: number) => {
        const newValues = [...values];
        const clampedValue = Math.max(min, Math.min(max, newValue));
        const minStepDistance = minStepsBetweenThumbs * step;

        if (targetIndex > 0) {
            const prevValue = newValues[targetIndex - 1];

            if (clampedValue < prevValue + minStepDistance) {
                newValues[targetIndex] = prevValue + minStepDistance;
                onValueChange(newValues);
                return;
            }
        }

        if (targetIndex < newValues.length - 1) {
            const nextValue = newValues[targetIndex + 1];

            if (clampedValue > nextValue - minStepDistance) {
                newValues[targetIndex] = nextValue - minStepDistance;
                onValueChange(newValues);
                return;
            }
        }

        newValues[targetIndex] = clampedValue;
        onValueChange(newValues);
    }, [values, min, max, step, minStepsBetweenThumbs, onValueChange]);

    const keyDownHandler = useCallback((event: KeyboardEvent<HTMLSpanElement>) => {
        if (disabled) return;

        const action = getSliderKeyAction(event, orientation);
        
        if (action === SliderKeyActions.None) {
            onKeyDown?.(event);
            return;
        }

        const getStepSize = () => {
            if (event.shiftKey) return step * 10;
            if (event.ctrlKey || event.metaKey) return (max - min) / 10;
            return step;
        }

        const stepSize = getStepSize();
        const horizontalDirection = isRtl ? -1 : 1;

        const isVerticalKey = event.key === 'ArrowUp' || event.key === 'ArrowDown';

        switch (action) {
            case SliderKeyActions.Min:
                event.preventDefault();
                updateValue(min, thumbIndex);
                onKeyDown?.(event);
                return;

            case SliderKeyActions.Max:
                event.preventDefault();
                updateValue(max, thumbIndex);
                onKeyDown?.(event);
                return;

            case SliderKeyActions.Increment:
                event.preventDefault();
                updateValue(
                    value + (isVertical || isVerticalKey ? stepSize : stepSize * horizontalDirection),
                    thumbIndex
                );
                onKeyDown?.(event);
                return;

            case SliderKeyActions.Decrement:
                event.preventDefault();
                updateValue(
                    value - (isVertical || isVerticalKey ? stepSize : stepSize * horizontalDirection),
                    thumbIndex
                );
                onKeyDown?.(event);
                return;

            case SliderKeyActions.PageIncrement:
                event.preventDefault();
                updateValue(value + stepSize * 10, thumbIndex);
                onKeyDown?.(event);
                return;

            case SliderKeyActions.PageDecrement:
                event.preventDefault();
                updateValue(value - stepSize * 10, thumbIndex);
                onKeyDown?.(event);
                return;

            default: onKeyDown?.(event);
        }
    }, [disabled, value, min, max, step, isVertical, isRtl, orientation, updateValue, onKeyDown, thumbIndex]);

    const pointerDownHandler = useCallback((event: React.PointerEvent<HTMLSpanElement>) => {
        if (disabled) return;

        event.stopPropagation();
        event.preventDefault();

        const thumb = event.currentTarget;
        thumb.setPointerCapture(event.pointerId);

        setActiveThumbIndex(thumbIndex);
        thumb.focus();

        const track = thumb.closest('[data-ui="slider"]')?.querySelector('[data-ui="slider-track"]') as HTMLDivElement;
        if (!track) return;

        const pointerMoveHandler = (e: PointerEvent) => {
            const rect = track.getBoundingClientRect();
            const coordinate = isVertical ? e.clientY : e.clientX;
            const trackSize = isVertical ? rect.height : rect.width;
            const trackStart = isVertical ? rect.top : rect.left;

            const offset = coordinate - trackStart;
            const normalized = Math.max(0, Math.min(1, offset / trackSize));

            const relative = isVertical
                ? 1 - normalized
                : isRtl
                    ? 1 - normalized
                    : normalized;

            const rawValue = min + relative * (max - min);
            const steppedValue = Math.round(rawValue / step) * step;

            updateValue(steppedValue, thumbIndex);
        }

        const pointerUpHandler = (e: PointerEvent) => {
            thumb.releasePointerCapture(e.pointerId);
            setActiveThumbIndex(null);
            onValueCommit?.(values);

            thumb.removeEventListener('pointermove', pointerMoveHandler);
            thumb.removeEventListener('pointerup', pointerUpHandler);
            thumb.removeEventListener('pointercancel', pointerUpHandler);
        }

        thumb.addEventListener('pointermove', pointerMoveHandler);
        thumb.addEventListener('pointerup', pointerUpHandler);
        thumb.addEventListener('pointercancel', pointerUpHandler);
    }, [disabled, thumbIndex, isVertical, isRtl, min, max, step, updateValue, setActiveThumbIndex, onValueCommit, values]);

    useEffect(() => {
        const thumb = thumbRefs.current.get(thumbId);
        return () => { if (thumb) thumbRefs.current.delete(thumbId) }
    }, [thumbId, thumbRefs]);

    return (
        <span
            ref={(element) => { if (element) thumbRefs.current.set(thumbId, element); }}
            id={thumbId}
            role="slider"
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={value}
            aria-orientation={orientation}
            aria-disabled={disabled || undefined}
            tabIndex={disabled ? -1 : 0}
            data-ui="slider-thumb"
            data-orientation={orientation}
            data-disabled={disabled || undefined}
            data-active={activeThumbIndex === thumbIndex || undefined}
            onKeyDown={keyDownHandler}
            onPointerDown={pointerDownHandler}
            className={cn(
                'absolute block size-4 -translate-x-1/2 -translate-y-1/2 rounded-full cursor-grab border-2 border-primary-surface bg-surface shadow transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-outer-bound focus-visible:ring-offset-2',
                'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
                'data-[orientation=horizontal]:top-1/2',
                'data-[orientation=vertical]:left-1/2',
                'active:cursor-grabbing',
                'hover:bg-muted-surface',
                className
            )}
            style={position}
            {...props}
        />
    );
}

// ---------------------------------------------------------------------------------------------------- //

export {
    Slider,
    SliderTrack,
    SliderRange,
    SliderThumb,
}

export type {
    SliderProps,
    SliderTrackProps,
    SliderRangeProps,
    SliderThumbProps,
}

// ---------------------------------------------------------------------------------------------------- //
