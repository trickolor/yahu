import {
    createContext,
    useContext,
    useCallback,
    useState,
    useEffect,
    useRef,
    useId,
    type HTMLAttributes,
    type KeyboardEvent,
    type MouseEvent,
    type ReactNode,
} from "react";

import { createPortal } from "react-dom";

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

interface AlertDialogContextState {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    triggerRef: React.RefObject<HTMLDivElement | null>;
    contentRef: React.RefObject<HTMLDivElement | null>;
    titleId: string;
    descriptionId: string;
}

const AlertDialogContext = createContext<AlertDialogContextState | null>(null);

const useAlertDialogContext = () => {
    const context = useContext(AlertDialogContext);
    if (!context) throw new Error('useAlertDialogContext must be used within a AlertDialog');

    return context;
}

// ---------------------------------------------------------------------------------------------------- //

interface AlertDialogProps extends HTMLAttributes<HTMLElement> {
    defaultOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

function AlertDialog({
    defaultOpen = false,
    open,
    onOpenChange,
    children,
}: AlertDialogProps) {
    const [openState, setOpenState] = useControllableState({
        value: open,
        defaultValue: defaultOpen,
        onChange: onOpenChange,
    });

    const triggerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    const titleId = useId();
    const descriptionId = useId();

    const context: AlertDialogContextState = {
        open: openState,
        onOpenChange: setOpenState,
        triggerRef,
        contentRef,
        titleId,
        descriptionId,
    }

    return (
        <AlertDialogContext.Provider value={context}>
            {children}
        </AlertDialogContext.Provider>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface AlertDialogPortalProps {
    container?: HTMLElement;
    forceMount?: boolean;
    children?: ReactNode;
}

function AlertDialogPortal({
    container,
    forceMount = false,
    children,
}: AlertDialogPortalProps) {
    const { open } = useAlertDialogContext();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    if (!mounted) return null;
    if (!open && !forceMount) return null;

    const target = container || document.body;
    return createPortal(children, target);
}

// ---------------------------------------------------------------------------------------------------- //

interface AlertDialogOverlayProps extends HTMLAttributes<HTMLElement> {
    forceMount?: boolean;
}

function AlertDialogOverlay({
    forceMount = false,
    className,
    ...props
}: AlertDialogOverlayProps) {
    const { open } = useAlertDialogContext();

    if (!open && !forceMount) return null;

    return (
        <div
            data-ui="alert-dialog-overlay"
            data-state={open ? 'open' : 'closed'}
            className={cn(
                'fixed inset-0 z-50 bg-black/50 transition-opacity duration-200',
                'data-[state=open]:opacity-100 data-[state=closed]:opacity-0',
                className
            )}
            {...props}
        />
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface AlertDialogTriggerProps extends HTMLAttributes<HTMLDivElement> { }

function AlertDialogTrigger({
    children,
    className,
    onClick,
    ...props
}: AlertDialogTriggerProps) {
    const { onOpenChange, triggerRef } = useAlertDialogContext();

    const handleClick = useCallback((event: MouseEvent<HTMLDivElement>) => {
        onOpenChange(true);
        onClick?.(event);
    }, [onOpenChange, onClick]);

    return (
        <div data-ui="alert-dialog-trigger"
            ref={triggerRef}
            onClick={handleClick}
            className={className}
            {...props}
        >
            {children}
        </div>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface AlertDialogContentProps extends HTMLAttributes<HTMLElement> {
    forceMount?: boolean;
    onOpenAutoFocus?: (event: Event) => void;
    onCloseAutoFocus?: (event: Event) => void;
    onEscapeKeyDown?: (event: KeyboardEvent) => void;
}

function AlertDialogContent({
    forceMount = false,
    onOpenAutoFocus,
    onCloseAutoFocus,
    onEscapeKeyDown,
    children,
    className,
    onKeyDown,
    ...props
}: AlertDialogContentProps) {
    const alertDialogContext = useAlertDialogContext();

    const {
        open,
        onOpenChange,
        contentRef,
        titleId,
        descriptionId,
    } = alertDialogContext;

    const previousActiveElementRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (!open) return;

        previousActiveElementRef.current = document.activeElement as HTMLElement | null;

        const promise = Promise.resolve().then(() => {
            if (contentRef.current) {
                const event = new Event('focus', { bubbles: false, cancelable: true });

                if (onOpenAutoFocus) {
                    onOpenAutoFocus(event);
                    if (event.defaultPrevented) return;
                }

                const focusableElements = contentRef.current.querySelectorAll<HTMLElement>(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );

                if (focusableElements.length > 0) focusableElements[0].focus();
                else contentRef.current.focus();
            }
        });

        return () => { promise.catch(() => { }) }
    }, [open, onOpenAutoFocus, contentRef]);

    useEffect(() => {
        if (open) return;

        const promise = Promise.resolve().then(() => {
            if (previousActiveElementRef.current) {
                const event = new Event('focus', { bubbles: false, cancelable: true });

                if (onCloseAutoFocus) {
                    onCloseAutoFocus(event);
                    if (event.defaultPrevented) return;
                }

                previousActiveElementRef.current.focus();
                previousActiveElementRef.current = null;
            }
        });

        return () => { promise.catch(() => { }) }
    }, [open, onCloseAutoFocus]);

    useEffect(() => {
        if (!open) return;

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => { document.body.style.overflow = originalOverflow }
    }, [open]);

    const keyDownHandler = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Escape') {
            if (onEscapeKeyDown) {
                onEscapeKeyDown(event);
                if (event.defaultPrevented) return;
            }

            onOpenChange(false);
        }

        onKeyDown?.(event);
    }, [onEscapeKeyDown, onOpenChange, onKeyDown]);

    useEffect(() => {
        if (!open || !contentRef.current) return;

        const focusHandler = (event: FocusEvent) => {
            const target = event.target as Node;
            const content = contentRef.current;

            if (!content || content.contains(target)) return;

            event.preventDefault();

            const focusableElements = content.querySelectorAll<HTMLElement>(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );

            if (focusableElements.length > 0) focusableElements[0].focus();
            else content.focus();
        }

        document.addEventListener('focusin', focusHandler);
        return () => document.removeEventListener('focusin', focusHandler);
    }, [open, contentRef]);

    if (!open && !forceMount) return null;

    return (
        <div
            data-ui="alert-dialog-content"
            data-state={open ? 'open' : 'closed'}

            ref={contentRef}

            role="alertdialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}

            onKeyDown={keyDownHandler}

            tabIndex={-1}

            className={cn(
                'fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-fit flex flex-col gap-4 border border-bound bg-surface p-6 shadow rounded transition-all duration-200',
                'data-[state=open]:opacity-100 data-[state=closed]:opacity-0 data-[state=open]:scale-100 data-[state=closed]:scale-95',
                className
            )}

            {...props}
        >
            {children}
        </div>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface AlertDialogCancelProps extends HTMLAttributes<HTMLButtonElement> { }

function AlertDialogCancel({
    children,
    className,
    onClick,
    ...props
}: AlertDialogCancelProps) {
    const { onOpenChange } = useAlertDialogContext();

    const handleClick = useCallback((event: MouseEvent<HTMLButtonElement>) => {
        onOpenChange(false);
        onClick?.(event);
    }, [onOpenChange, onClick]);

    return (
        <button
            data-ui="alert-dialog-cancel"
            type="button"

            onClick={handleClick}

            className={cn(
                'w-fit px-4 py-2 text-sm bg-secondary-surface text-secondary-write hover:bg-secondary-surface/85 inline-flex items-center justify-center gap-2 rounded shrink-0 font-medium whitespace-nowrap cursor-pointer ring-offset-2 transition-all',
                '[&_svg]:pointer-events-none [&_svg:not([class*="size-"])]:size-4 [&_svg]:shrink-0',
                'focus-visible:outline-none focus-visible:ring-outer-bound focus-visible:ring-2',
                'disabled:cursor-not-allowed disabled:opacity-70 disabled:pointer-events-none',
                'aria-invalid:ring-danger aria-invalid:border-danger',
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface AlertDialogTitleProps extends HTMLAttributes<HTMLElement> { }

function AlertDialogTitle({
    children,
    className,
    ...props
}: AlertDialogTitleProps) {
    const { titleId } = useAlertDialogContext();

    return (
        <h2
            data-ui="alert-dialog-title"
            id={titleId}
            className={cn('text-lg font-semibold text-write', className)}
            {...props}
        >
            {children}
        </h2>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface AlertDialogDescriptionProps extends HTMLAttributes<HTMLElement> { }

function AlertDialogDescription({
    children,
    className,
    ...props
}: AlertDialogDescriptionProps) {
    const { descriptionId } = useAlertDialogContext();

    return (
        <p
            data-ui="alert-dialog-description"
            id={descriptionId}
            className={cn('text-sm text-muted-write', className)}
            {...props}
        >
            {children}
        </p>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface AlertDialogActionProps extends HTMLAttributes<HTMLButtonElement> { }

function AlertDialogAction({
    children,
    className,
    onClick,
    ...props
}: AlertDialogActionProps) {
    const { onOpenChange } = useAlertDialogContext();

    const handleClick = useCallback((event: MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (!event.defaultPrevented) onOpenChange(false);
    }, [onOpenChange, onClick]);

    return (
        <button
            data-ui="alert-dialog-action"
            type="button"
            onClick={handleClick}
            className={cn(
                'w-fit px-4 py-2 text-sm bg-danger text-white dark:text-black hover:bg-danger/85 inline-flex items-center justify-center gap-2 rounded shrink-0 font-medium whitespace-nowrap cursor-pointer ring-offset-2 transition-all',
                '[&_svg]:pointer-events-none [&_svg:not([class*="size-"])]:size-4 [&_svg]:shrink-0',
                'focus-visible:outline-none focus-visible:ring-outer-bound focus-visible:ring-2',
                'disabled:cursor-not-allowed disabled:opacity-70 disabled:pointer-events-none',
                'aria-invalid:ring-danger aria-invalid:border-danger',
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}

// ---------------------------------------------------------------------------------------------------- //

export {
    AlertDialog,
    AlertDialogPortal,
    AlertDialogOverlay,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogCancel,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogAction,
}

export type {
    AlertDialogProps,
    AlertDialogPortalProps,
    AlertDialogOverlayProps,
    AlertDialogTriggerProps,
    AlertDialogContentProps,
    AlertDialogCancelProps,
    AlertDialogTitleProps,
    AlertDialogDescriptionProps,
    AlertDialogActionProps,
}

// ---------------------------------------------------------------------------------------------------- //