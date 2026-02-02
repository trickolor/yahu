import {
    createContext,
    useContext,
    useCallback,
    useMemo,
    useRef,
    useState,
    useEffect,
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

const AccordionActions = {
    None: -1,
    Open: 0,
    Close: 1,
    Next: 2,
    Previous: 3,
    First: 4,
    Last: 5,
} as const;

type AccordionAction = typeof AccordionActions[keyof typeof AccordionActions];

const getAccordionAction = (
    event: KeyboardEvent<HTMLButtonElement>,
    direction: 'horizontal' | 'vertical',
    open: boolean): AccordionAction => {

    const {
        Open,
        Close,
        Next,
        Previous,
        First,
        Last,
        None,
    } = AccordionActions;

    switch (event.key) {
        case 'Enter': case ' ': return open ? Close : Open;

        case 'ArrowRight':
            if (direction === 'horizontal') return Next;
            return None;

        case 'ArrowLeft':
            if (direction === 'horizontal') return Previous;
            return None;

        case 'ArrowDown':
            if (direction === 'vertical') return Next;
            return None;

        case 'ArrowUp':
            if (direction === 'vertical') return Previous;
            return None;

        case 'Home': return First;
        case 'End': return Last;

        default: return None;
    }
}

// ---------------------------------------------------------------------------------------------------- //

type TriggerRef = RefObject<HTMLButtonElement | null>;

interface AccordionContextBaseState {
    disabled: boolean;
    orientation: 'horizontal' | 'vertical';
    triggerRefs: Map<string, TriggerRef>;
}

interface SingleAccordionContextState extends AccordionContextBaseState {
    type: 'single';
    value?: string;
    onValueChange: (value?: string) => void;
    collapsible: boolean;
}

interface MultipleAccordionContextState extends AccordionContextBaseState {
    type: 'multiple';
    value: string[];
    onValueChange: (value: string[]) => void;
}

type AccordionContextState = SingleAccordionContextState | MultipleAccordionContextState;

const AccordionContext = createContext<AccordionContextState | null>(null);

function useAccordionContext(): AccordionContextState {
    const context = useContext(AccordionContext);
    if (!context) throw new Error("useAccordionContext must be used within an Accordion component");

    return context;
}

// ---------------------------------------------------------------------------------------------------- //

interface AccordionItemContextState {
    value: string;
    open: boolean;
    disabled: boolean;
    triggerId: string;
    contentId: string;
    triggerRef: TriggerRef;
    clickHandler: () => void;
}

const AccordionItemContext = createContext<AccordionItemContextState | null>(null);

function useAccordionItemContext() {
    const context = useContext(AccordionItemContext);
    if (!context) throw new Error("useAccordionItemContext must be used within an AccordionItem component");

    return context;
}

// ---------------------------------------------------------------------------------------------------- //

interface AccordionBaseProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
    disabled?: boolean;
    orientation?: 'horizontal' | 'vertical';
}

// ---------------------------------------------------------------------------------------------------- //

interface AccordionSingleProps extends AccordionBaseProps {
    type?: 'single';
    value?: string;
    defaultValue?: string;
    onValueChange?: (value?: string) => void;
    collapsible?: boolean;
    disabled?: boolean;
    orientation?: 'horizontal' | 'vertical';
}

function AccordionSingle({
    value,
    defaultValue,
    onValueChange,
    collapsible = false,
    disabled = false,
    orientation = 'vertical',
    children,
    className,
    ...props
}: AccordionSingleProps) {
    const [currentValue, setCurrentValue] = useControllableState({
        value,
        defaultValue,
        onChange: onValueChange,
    });

    const triggerRefs = useRef(new Map<string, TriggerRef>()).current;

    const handleValueChange = useCallback((newValue?: string) => {
        setCurrentValue(newValue);
    }, [setCurrentValue]);

    const contextValue = useMemo<SingleAccordionContextState>(() => ({
        type: 'single',
        value: currentValue,
        onValueChange: handleValueChange,
        collapsible,
        disabled,
        orientation,
        triggerRefs,
    }), [
        currentValue,
        handleValueChange,
        collapsible,
        disabled,
        orientation,
        triggerRefs
    ]);

    return (
        <AccordionContext.Provider value={contextValue}>
            <div
                data-ui="accordion"
                data-orientation={orientation}
                data-type={'single'}
                data-collapsible={collapsible || undefined}
                data-disabled={disabled || undefined}
                data-value={currentValue || undefined}
                {...props}
            >
                {children}
            </div>
        </AccordionContext.Provider>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface AccordionMultipleProps extends AccordionBaseProps {
    type: 'multiple';
    value?: string[];
    defaultValue?: string[];
    onValueChange?: (value: string[]) => void;
}

function AccordionMultiple({
    value,
    defaultValue,
    onValueChange,
    disabled = false,
    orientation = 'vertical',
    children,
    className,
    ...props
}: AccordionMultipleProps) {
    const [currentValue, setCurrentValue] = useControllableState({
        value,
        defaultValue: defaultValue ?? [],
        onChange: onValueChange,
    });

    const triggerRefs = useRef(new Map<string, TriggerRef>()).current;

    const handleValueChange = useCallback((newValue: string[]) => {
        setCurrentValue(newValue);
    }, [setCurrentValue]);

    const contextValue: MultipleAccordionContextState = {
        type: 'multiple',
        value: currentValue,
        onValueChange: handleValueChange,
        disabled,
        orientation,
        triggerRefs,
    }

    return (
        <AccordionContext.Provider value={contextValue}>
            <div
                data-ui="accordion"
                data-type={'multiple'}
                data-orientation={orientation}
                data-disabled={disabled || undefined}
                data-value={currentValue.join(',') || undefined}
                {...props}
            >
                {children}
            </div>
        </AccordionContext.Provider>
    );
}

// ---------------------------------------------------------------------------------------------------- //

type AccordionProps = AccordionSingleProps | AccordionMultipleProps;

function Accordion(props: AccordionProps) {
    const { type } = props;
    if (type === 'single') return <AccordionSingle {...props} />;
    return <AccordionMultiple {...props as AccordionMultipleProps} />;
}

// ---------------------------------------------------------------------------------------------------- //

interface AccordionItemProps extends HTMLAttributes<HTMLElement> {
    value: string;
    disabled?: boolean;
}

function AccordionItem({
    value,
    disabled = false,
    children,
    className,
    ...props
}: AccordionItemProps) {
    const accordionContext = useAccordionContext();

    const {
        type,
        value: currentValue,
        disabled: accordionDisabled,
        onValueChange,
        triggerRefs,
        orientation,
    } = accordionContext;

    const collapsible = accordionContext.type === 'single' ? accordionContext.collapsible : true;

    const triggerRef = useRef<HTMLButtonElement>(null);

    const triggerId = useId();
    const contentId = useId();

    const disabledState = disabled || accordionDisabled;

    const openState = useMemo<boolean>(() => {
        if (type === 'single') return currentValue === value;
        return currentValue.includes(value);
    }, [type, currentValue, value]);

    const clickHandler = useCallback(() => {
        if (disabledState) return;

        if (type === 'single') onValueChange(currentValue === value && collapsible
            ? undefined
            : value
        );

        else onValueChange(currentValue.includes(value)
            ? currentValue.filter(item => item !== value)
            : [...currentValue, value]
        );

    }, [type, currentValue, value, disabledState, collapsible, onValueChange]);

    useEffect(() => {
        triggerRefs.set(value, triggerRef);
        return () => { triggerRefs.delete(value) }
    }, [value, triggerRefs]);

    const accordionItemContext: AccordionItemContextState = {
        value,
        open: openState,
        disabled: disabledState,
        triggerId,
        contentId,
        triggerRef,
        clickHandler,
    }

    return (
        <AccordionItemContext.Provider value={accordionItemContext}>
            <div
                data-ui="accordion-item"
                data-state={openState ? 'open' : 'closed'}
                data-disabled={disabledState || undefined}
                data-orientation={orientation}
                data-value={value}
                className={cn('w-full not-last:border-b not-last:border-muted-bound text-write text-sm', className)}
                {...props}
            >
                {children}
            </div>
        </AccordionItemContext.Provider>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface AccordionHeaderProps extends HTMLAttributes<HTMLElement> { }

function AccordionHeader({
    children,
    className,
    ...props
}: AccordionHeaderProps) {
    const accordionContext = useAccordionContext();
    const { orientation } = accordionContext;

    const accordionItemContext = useAccordionItemContext();
    const { open, disabled } = accordionItemContext;

    return (
        <h3
            data-ui="accordion-header"
            data-state={open ? 'open' : 'closed'}
            data-disabled={disabled}
            data-orientation={orientation}
            className={cn('w-full flex items-center', className)}
            {...props}
        >
            {children}
        </h3>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface AccordionTriggerProps extends Omit<HTMLAttributes<HTMLElement>, 'onClick'> { }

function AccordionTrigger({
    children,
    className,
    onKeyDown,
    ...props
}: AccordionTriggerProps) {

    const accordionContext = useAccordionContext();
    const { orientation, triggerRefs, type } = accordionContext;

    const accordionItemContext = useAccordionItemContext();
    const { clickHandler, disabled, value, open, triggerRef, triggerId, contentId } = accordionItemContext;

    const keyDownHandler = useCallback((event: KeyboardEvent<HTMLButtonElement>) => {
        if (disabled) return;

        const action = getAccordionAction(event, orientation, open);
        if (action !== AccordionActions.None) event.preventDefault();

        const enabledTriggerRefs = Array.from(triggerRefs.entries())
            .filter(([_, ref]) => !ref.current?.disabled)
            .map(([value]) => value);

        const currentIndex = enabledTriggerRefs.indexOf(value);
        if (currentIndex === -1) return;

        const nextIndex = (() => {
            switch (action) {
                case AccordionActions.Open: case AccordionActions.Close:
                    clickHandler();
                    return null;

                case AccordionActions.Next:
                    return (currentIndex + 1) % enabledTriggerRefs.length;

                case AccordionActions.Previous:
                    return (currentIndex - 1 + enabledTriggerRefs.length) % enabledTriggerRefs.length;

                case AccordionActions.First: return 0;

                case AccordionActions.Last: return enabledTriggerRefs.length - 1;

                default: return null;
            }
        })();

        if (nextIndex !== null) {
            const nextValue = enabledTriggerRefs[nextIndex];
            const nextRef = triggerRefs.get(nextValue);
            nextRef?.current?.focus();
        }

        onKeyDown?.(event);
    }, [orientation, triggerRefs, disabled, value, clickHandler, onKeyDown, open]);

    const isDisabledNonCollapsible = type === 'single' && open && !accordionContext.collapsible;

    return (
        <button
            data-ui="accordion-trigger"
            data-state={open ? 'open' : 'closed'}
            data-orientation={orientation}
            data-disabled={disabled}

            aria-expanded={open}
            aria-controls={contentId}
            aria-disabled={isDisabledNonCollapsible || disabled || undefined}

            ref={triggerRef}
            id={triggerId}
            type="button"

            onKeyDown={keyDownHandler}
            onClick={clickHandler}

            disabled={disabled}

            className={cn(
                'font-medium w-full text-left py-4 flex items-center justify-between gap-4',
                disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:underline',
                className
            )}

            {...props}
        >
            {children}
        </button>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface AccordionContentProps extends HTMLAttributes<HTMLElement> {
    forceMount?: boolean;
}

function AccordionContent({
    children,
    className,
    forceMount = false,
    style,
    ...props
}: AccordionContentProps) {
    const accordionContext = useAccordionContext();
    const { orientation } = accordionContext;

    const accordionItemContext = useAccordionItemContext();
    const { open, triggerId, contentId, disabled } = accordionItemContext;

    const contentRef = useRef<HTMLDivElement>(null);
    const innerRef = useRef<HTMLDivElement>(null);

    const initialOpenRef = useRef(open);
    const hasTransitionedRef = useRef(false);

    const [isPresent, setIsPresent] = useState(open);
    const [height, setHeight] = useState<number | 'auto'>(open ? 'auto' : 0);

    useEffect(() => {
        if (open) setIsPresent(true);
 
        else if (!forceMount) {
            const timer = setTimeout(() => setIsPresent(false), 200);
            return () => clearTimeout(timer);
        }
    }, [open, forceMount]);

    useEffect(() => {
        if (!isPresent || !innerRef.current) return;

        if (open && initialOpenRef.current && !hasTransitionedRef.current) {
            const naturalHeight = innerRef.current.scrollHeight;
            setHeight(naturalHeight);
            return;
        }

        if (!open && !initialOpenRef.current && !hasTransitionedRef.current) {
            hasTransitionedRef.current = true;
            return;
        }

        hasTransitionedRef.current = true;

        if (open) {
            const naturalHeight = innerRef.current.scrollHeight;
            setHeight(0);

            Promise.resolve().then(() => {
                setHeight(naturalHeight);
            });
        } 
        
        else {
            const currentHeight = innerRef.current.scrollHeight;
            setHeight(currentHeight);

            Promise.resolve().then(() => {
                setHeight(0);
            });
        }
    }, [open, isPresent]);

    useEffect(() => {
        if (!innerRef.current || !open || height === 0) return;

        const resizeObserver = new ResizeObserver(() => {
            if (!innerRef.current || !open) return;
            const naturalHeight = innerRef.current.scrollHeight;
            setHeight(naturalHeight);
        });

        resizeObserver.observe(innerRef.current);
        return () => resizeObserver.disconnect();
    }, [open, height]);

    if (!isPresent && !forceMount) return null;

    const shouldTransition = hasTransitionedRef.current && height !== 'auto';

    return (
        <div
            data-ui="accordion-content"
            data-state={open ? 'open' : 'closed'}
            data-disabled={disabled || undefined}
            data-orientation={orientation}

            id={contentId}
            ref={contentRef}

            aria-labelledby={triggerId}
            role="region"

            className={cn(
                shouldTransition && 'transition-[height] duration-200 ease-in-out',
                className
            )}

            style={{
                ...style,
                height: height === 'auto' ? 'auto' : `${height}px`,
                overflow: 'hidden',
            }}

            {...props}
        >
            <div ref={innerRef} className="pb-4">
                {children}
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface AccordionItemIndicatorProps extends HTMLAttributes<HTMLElement> { }

function AccordionItemIndicator({
    className,
    ...props
}: AccordionItemIndicatorProps) {
    const accordionItemContext = useAccordionItemContext();
    const { open } = accordionItemContext;

    return (
        <span
            data-ui="accordion-item-indicator"
            data-state={open ? 'open' : 'closed'}

            aria-hidden="true"

            className={cn(
                'w-fit [&>svg]:size-4 text-current shrink-0 transition-transform duration-200',
                open && 'rotate-180',
                className
            )}
            {...props}
        >
            <svg
                data-ui="accordion-item-indicator-icon"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
            >
                <path
                    d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                    fill="currentColor"
                    fillRule="evenodd"
                    clipRule="evenodd"
                />
            </svg>
        </span>
    );
}

// ---------------------------------------------------------------------------------------------------- //

export {
    Accordion,
    AccordionItem,
    AccordionHeader,
    AccordionTrigger,
    AccordionContent,
    AccordionItemIndicator,
}

export type {
    AccordionProps,
    AccordionItemProps,
    AccordionHeaderProps,
    AccordionTriggerProps,
    AccordionContentProps,
    AccordionItemIndicatorProps,
}

// ---------------------------------------------------------------------------------------------------- //