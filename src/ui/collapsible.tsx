import {
    createContext,
    useCallback,
    useContext,
    useState,
    useEffect,
    useRef,
    useId,
    type HTMLAttributes,
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

interface CollapsibleContextState {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    disabled: boolean;
    triggerId: string;
    contentId: string;
}

const CollapsibleContext = createContext<CollapsibleContextState | null>(null);

function useCollapsibleContext(): CollapsibleContextState {
    const context = useContext(CollapsibleContext);
    if (!context) throw new Error('useCollapsibleContext must be used within a Collapsible');

    return context;
}

// ---------------------------------------------------------------------------------------------------- //

interface CollapsibleProps extends HTMLAttributes<HTMLElement> {
    defaultOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    disabled?: boolean;
}

function Collapsible({
    defaultOpen = false,
    open,
    onOpenChange,
    disabled = false,
    children,
    className,
    ...props
}: CollapsibleProps) {
    const [currentOpen, setCurrentOpen] = useControllableState({
        value: open,
        defaultValue: defaultOpen,
        onChange: onOpenChange,
    });

    const triggerId = useId();
    const contentId = useId();

    const handleOpenChange = useCallback((newOpen: boolean) => {
        if (!disabled) {
            setCurrentOpen(newOpen);
        }
    }, [disabled, setCurrentOpen]);

    const contextValue: CollapsibleContextState = {
        open: currentOpen,
        onOpenChange: handleOpenChange,
        disabled,
        triggerId,
        contentId,
    }

    return (
        <CollapsibleContext.Provider value={contextValue}>
            <div
                data-ui="collapsible"
                data-state={currentOpen ? 'open' : 'closed'}
                data-disabled={disabled || undefined}
                className={cn('min-w-fit text-write text-sm flex flex-col', className)}
                {...props}
            >
                {children}
            </div>
        </CollapsibleContext.Provider>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface CollapsibleHeaderProps extends HTMLAttributes<HTMLElement> { }

function CollapsibleHeader({
    children,
    className,
    ...props
}: CollapsibleHeaderProps) {
    const { open, disabled } = useCollapsibleContext();

    return (
        <h4
            data-ui="collapsible-header"
            data-state={open ? 'open' : 'closed'}
            data-disabled={disabled}
            className={cn('w-full flex items-center font-medium justify-between gap-2 py-2', className)}
            {...props}
        >
            {children}
        </h4>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface CollapsibleTriggerProps extends Omit<HTMLAttributes<HTMLElement>, 'onClick'> { }

function CollapsibleTrigger({
    children,
    className,
    ...props
}: CollapsibleTriggerProps) {
    const { open, onOpenChange, disabled, triggerId, contentId } = useCollapsibleContext();

    const handleClick = useCallback(() => {
        onOpenChange(!open);
    }, [open, onOpenChange]);

    return (
        <button
            data-ui="collapsible-trigger"
            data-state={open ? 'open' : 'closed'}
            data-disabled={disabled || undefined}

            id={triggerId}
            type="button"
            aria-expanded={open}
            aria-controls={contentId}
            disabled={disabled}

            onClick={handleClick}

            className={cn(
                'size-fit shrink-0 transition-colors duration-200 hover:bg-surface rounded p-1 flex items-center gap-2',
                disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
                className
            )}

            {...props}
        >
            {children}
        </button>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface CollapsibleContentProps extends HTMLAttributes<HTMLElement> {
    forceMount?: boolean;
}

function CollapsibleContent({
    children,
    className,
    forceMount = false,
    style,
    ...props
}: CollapsibleContentProps) {
    const { open, triggerId, contentId, disabled } = useCollapsibleContext();

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
            data-ui="collapsible-content"
            data-state={open ? 'open' : 'closed'}
            data-disabled={disabled || undefined}

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
            <div ref={innerRef}>
                {children}
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface CollapsibleIndicatorProps extends HTMLAttributes<HTMLElement> { }

function CollapsibleIndicator({
    className,
    ...props
}: CollapsibleIndicatorProps) {

    return (
        <span
            data-ui="collapsible-indicator"
            aria-hidden="true"
            className={cn(
                'w-fit [&>svg]:size-4 text-current shrink-0',
                className
            )}
            {...props}
        >
            <svg
                data-ui="collapsible-indicator-icon"
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
        </span>
    );
}

// ---------------------------------------------------------------------------------------------------- //

export {
    Collapsible,
    CollapsibleTrigger,
    CollapsibleHeader,
    CollapsibleContent,
    CollapsibleIndicator
}

export type {
    CollapsibleProps,
    CollapsibleTriggerProps,
    CollapsibleHeaderProps,
    CollapsibleContentProps,
    CollapsibleIndicatorProps,
}

// ---------------------------------------------------------------------------------------------------- //