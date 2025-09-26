import { createContext, useCallback, useContext, useState, type HTMLAttributes, type KeyboardEvent, type ReactNode, type SyntheticEvent } from "react";
import { cn } from "../../cn";
import { createPortal } from "react-dom";

// ---------------------------------------------------------------------------------------------------- //

interface ControllableStateProps<T> {
    onChange?: (next: T) => void;
    defaultValue: T;
    value?: T;
}

type ControllableStateReturn<T> = [T, (next: T) => void];

export function useControllableState<T>({
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



// ---------------------------------------------------------------------------------------------------- //

interface SelectContextState {
    value: string;
    setValue: (value: string) => void;

    open: boolean;
    setOpen: (open: boolean) => void;

    textValue: string;
    setTextValue: (textValue: string) => void;
}

const SelectContext = createContext<SelectContextState | null>(null);

function useSelectContext(): SelectContextState {
    const context = useContext(SelectContext);
    if (!context) throw new Error("useSelectContext must be used within a <Select> component");
    return context;
}

// ---------------------------------------------------------------------------------------------------- //

interface SelectProps extends HTMLAttributes<HTMLElement> {
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;

    defaultOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;

    dir?: "ltr" | "rtl";

    name?: string;
    disabled?: boolean;
    required?: boolean;

    children?: ReactNode;
}

// ---------------------------------------------------------------------------------------------------- //

function Select({
    defaultValue, onValueChange, value,
    defaultOpen, onOpenChange, open,
    children, className, ...props
}: SelectProps) {

    const [valueState, setValue] = useControllableState({
        defaultValue: defaultValue ?? '',
        onChange: onValueChange,
        value,
    });

    const [openState, setOpen] = useControllableState({
        defaultValue: defaultOpen ?? false,
        onChange: onOpenChange,
        value: open,
    });

    const [textValue, setTextValue] = useState('');

    const context: SelectContextState = {
        value: valueState,
        setValue,
        open: openState,
        setOpen,
        textValue,
        setTextValue,
    }

    return (
        <SelectContext.Provider value={context}>
            <div data-ui="select" {...props} className={cn("relative w-fit", className)}>
                {children}
            </div>
        </SelectContext.Provider>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface SelectTriggerProps extends HTMLAttributes<HTMLElement> { }

function SelectTrigger({ className, children, ...props }: SelectTriggerProps) {
    const { open, setOpen } = useSelectContext();

    const clickHandler = () => setOpen(!open);

    return (
        <button data-ui="select-trigger" type="button" onClick={clickHandler} {...props}

            data-state={open ? "open" : "closed"}
            data-disabled
            data-placeholder

            className={cn(
                "w-fit min-w-xs min-h-9 inline-flex items-center justify-between gap-2 px-3 py-2 rounded text-write border border-bound bg-weak-surface transition-colors",
                "focus:bg-surface focus:outline-none focus:ring-2 focus:ring-bound focus:ring-offset-1",
                "hover:bg-surface",
            )}
        >
            {children}
        </button>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface SelectValueProps extends HTMLAttributes<HTMLElement> {
    placeholder?: ReactNode;
}

function SelectValue({ className, children, placeholder, ...props }: SelectValueProps) {
    const { textValue } = useSelectContext();

    useEffect(() => {
        const displayed = children ?? (textValue.length ? textValue : null) ?? placeholder;
        setTextValue(displayed);
    }, [children, textValue, placeholder]);


    return (
        <span data-ui="select-value" {...props} className={cn("text-sm font-medium text-write overflow-hidden truncate", className)}>
            {textValue}
        </span>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface SelectTriggerIndicatorProps extends HTMLAttributes<HTMLElement> { }

function SelectTriggerIndicator({ className, ...props }: SelectTriggerIndicatorProps) {
    const Icon = () => {
        return (
            <svg data-ui="select-trigger-indicator-icon"
                aria-hidden

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
        )
    }

    return (
        <span data-ui="select-trigger-indicator" aria-hidden {...props}
            className={cn("w-fit [&>svg]:size-4 text-write shrink-0", className)}
        >
            <Icon />
        </span>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface SelectPortalProps { container?: HTMLElement, children?: ReactNode }

export function SelectPortal({ container, children }: SelectPortalProps) {
    return createPortal(children, container || document.body);
}

// ---------------------------------------------------------------------------------------------------- //

interface SelectContentProps extends HTMLAttributes<HTMLElement> {
    onCloseAutoFocus?: (event: SyntheticEvent) => void;
    onEscapeKeyDown?: (event: KeyboardEvent) => void;
    onOutsidePointerDown?: (event: PointerEvent) => void;
}

export function SelectContent({
    onCloseAutoFocus, onEscapeKeyDown, onOutsidePointerDown,
    children, className, ...props
}: SelectContentProps) {
    const { open } = useSelectContext();

    if (!open) return null;

    return (
        <div data-ui="select-content" {...props}

            data-state={open ? "open" : "closed"}


            className={cn(
                "absolute left-0 top-full z-10 mt-1 min-w-xs p-1.5 rounded-md shadow-lg border border-muted-bound bg-muted-surface",
                className
            )}
        >
            {children}
        </div>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface SelectViewportProps extends HTMLAttributes<HTMLElement> { }

export function SelectViewport({ children, className, ...props }: SelectViewportProps) {
    return (
        <div tabIndex={-1} data-ui="select-viewport" {...props} className={cn("[scrollbar-width:none] w-full max-h-96 overflow-y-auto", className)}>
            {children}
        </div>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface SelectItemProps extends HTMLAttributes<HTMLElement> {
    value?: string;
    disabled?: boolean;
    textValue?: string;
}

export function SelectItem({ children, className, value, disabled, textValue, ...props }: SelectItemProps) {
    const { open, setOpen, setValue } = useSelectContext();

    const clickHandler = () => {
        if (disabled) return;
        if (value) setValue(value);

        setOpen(false);
    }

    return (
        <div data-ui="select-item"

            onClick={clickHandler}

            data-state
            data-highlighted
            data-disabled

            {...props}

            className={cn("flex items-center justify-between w-full text-sm text-write py-2.5 px-1.5 rounded transition-colors cursor-pointer relative",
                "hover:bg-surface focus:bg-surface focus:outline-none",

                "[data-disabled='true']:opacity-50 [data-disabled='true']:cursor-not-allowed [data-disabled='true']:hover:bg-transparent",
                "[data-highlighted='true']:bg-surface [data-highlighted='true']:ring-2 [data-highlighted='true']:ring-blue-500/20",
                "[data-state='checked']:font-medium [data-state='checked']:bg-blue-50",
                className
            )}
        >
            {children}
        </div>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface SelectItemTextProps extends HTMLAttributes<HTMLElement> { children?: string }

export function SelectItemText({ className, children, ...props }: SelectItemTextProps) {

    return (
        <span data-ui="select-item-text" className={cn("flex-1 truncate", className)} {...props}>
            {children}
        </span>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface SelectItemIndicatorProps extends HTMLAttributes<HTMLElement> { }

export function SelectItemIndicator({ className, ...props }: SelectItemIndicatorProps) {
    const Icon = () => {
        return (
            <svg data-ui="select-item-indicator-icon"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
            >
                <path
                    d="M20.7071 5.29289C21.0976 5.68342 21.0976 6.31658 20.7071 6.70711L9.70711 17.7071C9.31658 18.0976 8.68342 18.0976 8.29289 17.7071L3.29289 12.7071C2.90237 12.3166 2.90237 11.6834 3.29289 11.2929C3.68342 10.9024 4.31658 10.9024 4.70711 11.2929L9 15.5858L19.2929 5.29289C19.6834 4.90237 20.3166 4.90237 20.7071 5.29289Z"
                    fill="currentColor"
                    fillRule="evenodd"
                    clipRule="evenodd"
                />
            </svg>
        )
    }
    return (
        <span data-ui="select-item-indicator" className={cn("w-fit [&>svg]:size-4 text-write shrink-0", className)} {...props}>
            <Icon />
        </span>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface SelectGroupProps extends HTMLAttributes<HTMLElement> { }

export function SelectGroup({ children, className, ...props }: SelectGroupProps) {
    return (
        <div data-ui="select-group" className={cn("w-full space-y-px py-1 px-1.5", className)} role="group" {...props}>
            {children}
        </div>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface SelectLabelProps extends HTMLAttributes<HTMLElement> { }

export function SelectLabel({ children, className, ...props }: SelectLabelProps) {
    return (
        <span data-ui="select-label" className={cn("text-sm font-medium text-write", className)} {...props}>
            {children}
        </span>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface SelectSeparatorProps extends HTMLAttributes<HTMLElement> { }

export function SelectSeparator({ className, ...props }: SelectSeparatorProps) {
    return (
        <hr data-ui="select-separator" className={cn("w-full h-px bg-muted-bound", className)} {...props} />
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface ScrollUpButtonProps extends HTMLAttributes<HTMLElement> { }

export function SelectScrollUpButton({ className, ...props }: ScrollUpButtonProps) {
    const Icon = () => {
        return (
            <svg data-ui="select-scroll-up-icon"
                className="size-4 text-write shrink-0"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
            >
                <path
                    d="M11.2929 8.29289C11.6834 7.90237 12.3166 7.90237 12.7071 8.29289L18.7071 14.2929C19.0976 14.6834 19.0976 15.3166 18.7071 15.7071C18.3166 16.0976 17.6834 16.0976 17.2929 15.7071L12 10.4142L6.70711 15.7071C6.31658 16.0976 5.68342 16.0976 5.29289 15.7071C4.90237 15.3166 4.90237 14.6834 5.29289 14.2929L11.2929 8.29289Z"
                    fill="currentColor"
                    fillRule="evenodd"
                    clipRule="evenodd"
                />
            </svg>
        );
    }

    return (
        <button data-ui="select-scroll-up-button" type="button" {...props}
            className={cn("w-full flex justify-center py-1 hover:bg-surface transition-colors focus:bg-surface focus:outline-none", className)}
        >
            <Icon />
        </button>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface ScrollDownButtonProps extends HTMLAttributes<HTMLElement> { }

export function SelectScrollDownButton({ className, ...props }: ScrollDownButtonProps) {
    const Icon = () => {
        return (
            <svg data-ui="select-scroll-down-icon"
                className="size-4 text-write shrink-0"
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
        )
    }

    return (
        <button data-ui="select-scroll-down-button" type="button" {...props}
            className={cn("w-full flex justify-center py-1 hover:bg-surface transition-colors focus:bg-surface focus:outline-none", className)}
        >
            <Icon />
        </button>
    );
}

// ---------------------------------------------------------------------------------------------------- //



export const Test = () => {
    return (
        <Select>
            <SelectTrigger>
                <SelectValue placeholder="Select an option" />
                <SelectTriggerIndicator />
            </SelectTrigger>

            <SelectContent>
                <SelectScrollUpButton />

                <SelectViewport>
                    <SelectGroup>
                        <SelectLabel>Group 1</SelectLabel>
                        <SelectItem value="A"><SelectItemText>Orange</SelectItemText> <SelectItemIndicator /></SelectItem>
                        <SelectItem value="B"><SelectItemText>Apple</SelectItemText> <SelectItemIndicator /></SelectItem>
                        <SelectItem value="C"><SelectItemText>Peach</SelectItemText> <SelectItemIndicator /></SelectItem>
                    </SelectGroup>

                    <SelectSeparator />

                    <SelectGroup>
                        <SelectLabel>Group 2</SelectLabel>
                        <SelectItem value="D"><SelectItemText>Carrot</SelectItemText> <SelectItemIndicator /></SelectItem>
                        <SelectItem value="E"><SelectItemText>Potato</SelectItemText> <SelectItemIndicator /></SelectItem>
                        <SelectItem value="F"><SelectItemText>Tomato</SelectItemText> <SelectItemIndicator /></SelectItem>
                    </SelectGroup>

                    <SelectSeparator />

                    <SelectGroup>
                        <SelectLabel>Group 3</SelectLabel>
                        <SelectItem value="G"><SelectItemText>Mayo</SelectItemText> <SelectItemIndicator /></SelectItem>
                        <SelectItem value="H"><SelectItemText>Mustard</SelectItemText> <SelectItemIndicator /></SelectItem>
                        <SelectItem value="I"><SelectItemText>Ketchup</SelectItemText> <SelectItemIndicator /></SelectItem>
                    </SelectGroup>
                </SelectViewport>

                <SelectScrollDownButton />
            </SelectContent>
        </Select>
    );
}