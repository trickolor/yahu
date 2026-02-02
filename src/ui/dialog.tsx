import React, {
    createContext,
    useContext,
    useCallback,
    useState,
    useEffect,
    useRef,
    useId,
    type HTMLAttributes,
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

interface DialogContextState {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    modal: boolean;
    triggerRef: React.RefObject<HTMLDivElement | null>;
    contentRef: React.RefObject<HTMLDivElement | null>;
    titleId: string;
    descriptionId: string;
}

const DialogContext = createContext<DialogContextState | null>(null);

function useDialogContext(): DialogContextState {
    const context = useContext(DialogContext);
    if (!context) throw new Error('useDialogContext must be used within a Dialog');

    return context;
}

// ---------------------------------------------------------------------------------------------------- //

interface DialogProps extends HTMLAttributes<HTMLElement> {
    defaultOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    modal?: boolean;
}

function Dialog({
    defaultOpen = false,
    open,
    onOpenChange,
    modal = true,
    children,
}: DialogProps) {

    const [currentOpen, setCurrentOpen] = useControllableState({
        value: open,
        defaultValue: defaultOpen,
        onChange: onOpenChange,
    });

    const triggerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    const titleId = useId();
    const descriptionId = useId();

    const contextValue: DialogContextState = {
        open: currentOpen,
        onOpenChange: setCurrentOpen,
        modal,
        triggerRef,
        contentRef,
        titleId,
        descriptionId,
    }

    return (
        <DialogContext.Provider value={contextValue}>
            {children}
        </DialogContext.Provider>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface DialogTriggerProps extends HTMLAttributes<HTMLElement> { }

function DialogTrigger({
    children,
    className,
    onClick,
    ...props
}: DialogTriggerProps) {
    const { open, onOpenChange, triggerRef } = useDialogContext();

    const clickHandler = useCallback((event: React.MouseEvent<HTMLElement>) => {
        onOpenChange(true);
        onClick?.(event);
    }, [onOpenChange, onClick]);

    return (
        <div
            data-ui="dialog-trigger"
            data-state={open ? 'open' : 'closed'}
            onClick={clickHandler}
            className={className}
            ref={triggerRef}
            {...props}
        >
            {children}
        </div>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface DialogPortalProps {
    container?: HTMLElement;
    forceMount?: boolean;
    children: ReactNode;
}

function DialogPortal({
    container,
    forceMount = false,
    children,
}: DialogPortalProps) {
    const { open } = useDialogContext();
    if (!open && !forceMount) return null;
    const target = container || document.body;
    return createPortal(children, target);
}

// ---------------------------------------------------------------------------------------------------- //

interface DialogOverlayProps extends HTMLAttributes<HTMLElement> {
    forceMount?: boolean;
}

function DialogOverlay({
    forceMount = false,
    className,
    onClick,
    ...props
}: DialogOverlayProps) {
    const { open, onOpenChange, modal } = useDialogContext();

    const clickHandler = useCallback((event: React.MouseEvent<HTMLElement>) => {
        if (modal) onOpenChange(false);
        onClick?.(event);
    }, [modal, onOpenChange, onClick]);

    if (!open && !forceMount) return null;

    return (
        <div
            data-ui="dialog-overlay"
            data-state={open ? 'open' : 'closed'}
            onClick={clickHandler}
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

interface DialogContentProps extends HTMLAttributes<HTMLElement> {
    forceMount?: boolean;
    onOpenAutoFocus?: (event: Event) => void;
    onCloseAutoFocus?: (event: Event) => void;
    onEscapeKeyDown?: (event: React.KeyboardEvent<HTMLElement>) => void;
    onPointerDownOutside?: (event: React.PointerEvent<HTMLElement>) => void;
    onInteractOutside?: (event: MouseEvent | FocusEvent) => void;
}

function DialogContent({
    forceMount = false,
    onOpenAutoFocus,
    onCloseAutoFocus,
    onEscapeKeyDown,
    onPointerDownOutside,
    onInteractOutside,
    children,
    className,
    onKeyDown,
    onPointerDown,
    ...props
}: DialogContentProps) {
    const { open, onOpenChange, modal, contentRef, titleId, descriptionId } = useDialogContext();

    const previousActiveElementRef = useRef<HTMLElement | null>(null);
    const pointerDownOutsideRef = useRef(false);

    useEffect(() => {
        if (!open) return;

        previousActiveElementRef.current = document.activeElement as HTMLElement;

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
                else contentRef.current?.focus();
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
        if (!open || !modal) return;

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => { document.body.style.overflow = originalOverflow }
    }, [open, modal]);

    const keyDownHandler = useCallback((event: React.KeyboardEvent<HTMLElement>) => {
        if (event.key === 'Escape' && onEscapeKeyDown) {
            onEscapeKeyDown(event);
            if (event.defaultPrevented) return;
            onOpenChange(false);
        }

        onKeyDown?.(event);
    }, [onEscapeKeyDown, onOpenChange, onKeyDown]);

    const pointerDownHandler = useCallback((event: React.PointerEvent<HTMLElement>) => {
        const target = event.target as HTMLElement;
        const content = contentRef.current;

        if (content && !content.contains(target)) {
            pointerDownOutsideRef.current = true;
            if (onPointerDownOutside) onPointerDownOutside(event);
        }

        else pointerDownOutsideRef.current = false;

        onPointerDown?.(event);
    }, [contentRef, onPointerDownOutside, onPointerDown]);

    useEffect(() => {
        if (!open || !modal) return;

        const pointerUpHandler = (event: typeof window.MouseEvent.prototype) => {
            const target = event.target as HTMLElement;
            const content = contentRef.current;

            if (!content || !pointerDownOutsideRef.current) return;

            if (!content.contains(target) && onInteractOutside) {
                onInteractOutside(event);
                if (event.defaultPrevented) return;
                onOpenChange(false);
            }

            pointerDownOutsideRef.current = false;
        }

        document.addEventListener('mouseup', pointerUpHandler);
        return () => document.removeEventListener('mouseup', pointerUpHandler);
    }, [open, modal, onInteractOutside, onOpenChange, contentRef]);

    useEffect(() => {
        if (!open || !modal || !contentRef.current) return;

        const handleFocusTrap = (event: FocusEvent) => {
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

        document.addEventListener('focusin', handleFocusTrap);
        return () => document.removeEventListener('focusin', handleFocusTrap);
    }, [open, modal, contentRef]);

    if (!open && !forceMount) return null;

    return (
        <div
            data-ui="dialog-content"
            data-state={open ? 'open' : 'closed'}
            role="dialog"
            aria-modal={modal || undefined}
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            ref={contentRef}
            tabIndex={-1}
            onKeyDown={keyDownHandler}
            onPointerDown={pointerDownHandler}
            className={cn(
                'fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-fit gap-4 border border-bound bg-surface text-write p-6 rounded',
                'data-[state=open]:scale-100 data-[state=open]:opacity-100',
                'data-[state=closed]:scale-95 data-[state=closed]:opacity-0',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface DialogTitleProps extends HTMLAttributes<HTMLElement> { }

function DialogTitle({
    children,
    className,
    ...props
}: DialogTitleProps) {
    const { titleId } = useDialogContext();

    return (
        <h2
            data-ui="dialog-title"
            id={titleId}
            className={cn('text-lg font-semibold text-write', className)}
            {...props}
        >
            {children}
        </h2>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface DialogDescriptionProps extends HTMLAttributes<HTMLElement> { }

function DialogDescription({
    children,
    className,
    ...props
}: DialogDescriptionProps) {
    const { descriptionId } = useDialogContext();

    return (
        <p
            data-ui="dialog-description"
            id={descriptionId}
            className={cn('text-sm text-muted-write', className)}
            {...props}
        >
            {children}
        </p>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface DialogCloseProps extends HTMLAttributes<HTMLButtonElement> { }

function DialogClose({
    onClick,
    className,
    children,
    ...props
}: DialogCloseProps) {
    const { onOpenChange } = useDialogContext();

    const clickHandler = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
        onOpenChange(false);
        onClick?.(event);
    }, [onOpenChange, onClick]);

    return (
        <button
            data-ui="dialog-close"
            type="button"
            onClick={clickHandler}
            className={cn(
                'w-fit bg-primary-surface text-primary-write hover:bg-primary-surface/85 px-4 py-2 text-sm inline-flex items-center justify-center gap-2 rounded shrink-0 font-medium whitespace-nowrap cursor-pointer ring-offset-2 transition-all',
                '[&_svg]:pointer-events-none [&_svg:not([class*="size-"])]:size-4 [&_svg]:shrink-0',
                'focus-visible:outline-none focus-visible:ring-outer-bound focus-visible:ring-2',
                'disabled:cursor-not-allowed disabled:opacity-70 disabled:pointer-events-none',
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
    Dialog,
    DialogTrigger,
    DialogPortal,
    DialogOverlay,
    DialogContent,
    DialogTitle,
    DialogDescription,
    DialogClose,
    type DialogProps,
    type DialogTriggerProps,
    type DialogPortalProps,
    type DialogOverlayProps,
    type DialogContentProps,
    type DialogTitleProps,
    type DialogDescriptionProps,
    type DialogCloseProps,
}

// ---------------------------------------------------------------------------------------------------- //