import { cn } from "@/cn";
import { createContext, useContext, type HTMLAttributes, type ReactNode } from "react"
import { Select, SelectContent, SelectItem, SelectItemIndicator, SelectItemText, SelectPortal, SelectScrollDownButton, SelectScrollUpButton, SelectTrigger, SelectTriggerIndicator, SelectValue, SelectViewport } from "./select";

// ---------------------------------------------------------------------------------------------------- //

interface CalendarContextState { }

const CalendarContext = createContext<CalendarContextState | null>(null);

function useCalendarContext() {
    const context = useContext(CalendarContext);
    if (!context) throw new Error("useCalendarContext must be used within a <Calendar> component");
    return context;
}

// ---------------------------------------------------------------------------------------------------- //

interface CalendarProps {
    children?: ReactNode;
}

function Calendar({ children }: CalendarProps) {
    return (
        <CalendarContext.Provider value={{}}>
            <div className="w-fit min-w-xs p-4 rounded border border-bound bg-surface">
                {children}
            </div>
        </CalendarContext.Provider>
    )
}

// ---------------------------------------------------------------------------------------------------- //

interface CalendarHeadingProps extends HTMLAttributes<HTMLElement> { }

function CalendarHeading({
    className,
    children,
    ...props
}: CalendarHeadingProps) {
    return (
        <div
            data-ui="calendar-heading"

            className={cn(
                "relative w-full flex justify-center h-8 items-center gap-2",
                className,
            )}

            {...props}
        >
            {children}
        </div>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface CalendarPreviousButtonProps extends HTMLAttributes<HTMLElement> { }

function CalendarPreviousButton({
    className,
    ...props
}: CalendarPreviousButtonProps) {
    return (
        <button
            data-ui="calendar-previous-button"
            type="button"

            className={cn(
                "absolute top-0 left-0 cursor-pointer size-8 rounded inline-flex items-center justify-center text-write transition-colors shrink-0",
                "focus-visible:outline-none focus-visible:ring-offset-muted-bound focus-visible:ring-outer-bound focus-visible:ring-2",
                "[&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0",
                "hover:bg-muted-surface",
                className,
            )}

            {...props}
        >
            <svg
                data-ui="calendar-previous-button-icon"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
            >
                <path
                    d="M15.7071 5.29289C16.0976 5.68342 16.0976 6.31658 15.7071 6.70711L10.4142 12L15.7071 17.2929C16.0976 17.6834 16.0976 18.3166 15.7071 18.7071C15.3166 19.0976 14.6834 19.0976 14.2929 18.7071L8.29289 12.7071C7.90237 12.3166 7.90237 11.6834 8.29289 11.2929L14.2929 5.29289C14.6834 4.90237 15.3166 4.90237 15.7071 5.29289Z"
                    fill="currentColor"
                    fillRule="evenodd"
                    clipRule="evenodd"
                />
            </svg>

        </button>
    )
}

// ---------------------------------------------------------------------------------------------------- //

interface CalendarNextButtonProps extends HTMLAttributes<HTMLElement> { }

function CalendarNextButton({
    className,
    ...props
}: CalendarNextButtonProps) {
    return (
        <button
            data-ui="calendar-next-button"
            type="button"

            className={cn(
                "absolute top-0 right-0 cursor-pointer size-8 rounded inline-flex items-center justify-center text-write transition-colors shrink-0",
                "focus-visible:outline-none focus-visible:ring-offset-muted-bound focus-visible:ring-outer-bound focus-visible:ring-2",
                "[&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0",
                "hover:bg-muted-surface",
                className,
            )}

            {...props}
        >
            <svg
                data-ui="calendar-next-button-icon"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
            >
                <path
                    d="M8.29289 5.29289C8.68342 4.90237 9.31658 4.90237 9.70711 5.29289L15.7071 11.2929C16.0976 11.6834 16.0976 12.3166 15.7071 12.7071L9.70711 18.7071C9.31658 19.0976 8.68342 19.0976 8.29289 18.7071C7.90237 18.3166 7.90237 17.6834 8.29289 17.2929L13.5858 12L8.29289 6.70711C7.90237 6.31658 7.90237 5.68342 8.29289 5.29289Z"
                    fill="currentColor"
                    fillRule="evenodd"
                    clipRule="evenodd"
                />
            </svg>

        </button>
    )
}

// ---------------------------------------------------------------------------------------------------- //

interface CalendarYearProps extends HTMLAttributes<HTMLElement> {

}

function CalendarYear({
    className,
    children,
    ...props
}: CalendarYearProps) {
    return (
        <span
            data-ui="calendar-year"

            className={cn(
                "text-write font-medium text-sm",
                className,
            )}

            {...props}
        >
            {children}
        </span>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface CalendarMonthProps extends HTMLAttributes<HTMLElement> { }

function CalendarMonth({
    className,
    children,
    ...props
}: CalendarMonthProps) {
    return (
        <span
            data-ui="calendar-month"

            className={cn(
                "text-write font-medium text-sm",
                className,
            )}

            {...props}
        >
            {children}
        </span>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface CalendarGridProps extends HTMLAttributes<HTMLElement> { }

function CalendarGrid({
    className,
    children,
    ...props
}: CalendarGridProps) {
    return (
        <div
            data-ui="calendar-grid"

            className={cn(
                "w-full grid grid-cols-7 pt-4 gap-1 place-items-center",
                className,
            )}

            {...props}
        >
            {children}
        </div>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface CalendarGridHeaderProps extends HTMLAttributes<HTMLElement> { }

function CalendarGridHeader({
    className,
    children,
    ...props
}: CalendarGridHeaderProps) {
    return (
        <div
            data-ui="calendar-grid-header"

            className={cn(
                "w-full grid col-span-full grid-cols-subgrid gap-1 place-items-center",
                className,
            )}

            {...props}
        >
            {children}
        </div>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface CalendarGridHeaderCellProps extends HTMLAttributes<HTMLElement> { }

function CalendarGridHeaderCell({
    className,
    children,
    ...props
}: CalendarGridHeaderCellProps) {
    return (
        <span
            data-ui="calendar-grid-header-cell"

            className={cn(
                "aspect-square w-full flex items-center justify-center text-sm text-write font-medium",
                className,
            )}

            {...props}
        >
            {children}
        </span>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface CalendarGridBodyProps extends HTMLAttributes<HTMLElement> { }

function CalendarGridBody({
    className,
    children,
    ...props
}: CalendarGridBodyProps) {
    return (
        <div
            data-ui="calendar-grid-body"

            className={cn(
                "w-full grid col-span-full grid-cols-subgrid gap-1 place-items-center",
                className,
            )}

            {...props}
        >
            {children}
        </div>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface CalendarGridBodyCellProps extends HTMLAttributes<HTMLElement> { }

function CalendarGridBodyCell({
    className,
    children,
    ...props
}: CalendarGridBodyCellProps) {
    return (
        <button
            data-ui="calendar-grid-body-cell"
            type="button"

            className={cn(
                "cursor-pointer aspect-square w-full rounded flex items-center justify-center text-sm text-write",
                "hover:bg-muted-surface",
                className,
            )}

            {...props}
        >
            {children}
        </button>
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface CalendarYearSelectProps extends HTMLAttributes<HTMLElement> { }

function CalendarYearSelect({
    className,
    children,
    ...props
}: CalendarYearSelectProps) {
    return (
        <Select defaultValue="1925">
            <SelectTrigger className="min-w-auto h-fit gap-1 justify-start py-0.5 px-2 text-base w-fit">
                <SelectValue />
                <SelectTriggerIndicator />
            </SelectTrigger>

            <SelectPortal>
                <SelectContent>
                    <SelectScrollUpButton />
                    <SelectViewport>
                        {Array.from({ length: 99 }, (_, i) => (
                            <SelectItem key={i} value={`${i + 1925}`}>
                                <SelectItemText>{`${i + 1925}`}</SelectItemText>
                                <SelectItemIndicator />
                            </SelectItem>
                        ))}
                    </SelectViewport>
                    <SelectScrollDownButton />
                </SelectContent>
            </SelectPortal>
        </Select>
    );
}

// ---------------------------------------------------------------------------------------------------- //

// ---------------------------------------------------------------------------------------------------- //

interface CalendarMonthSelectProps extends HTMLAttributes<HTMLElement> { }

function CalendarMonthSelect({
    className,
    children,
    ...props
}: CalendarMonthSelectProps) {
    return (
        <Select defaultValue="January">
            <SelectTrigger className="min-w-auto h-fit gap-1 justify-start py-0.5 px-2 text-base w-fit">
                <SelectValue />
                <SelectTriggerIndicator />
            </SelectTrigger>

            <SelectPortal>
                <SelectContent>
                    <SelectScrollUpButton />
                    <SelectViewport>
                        {
                            ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((month) => (
                                <SelectItem key={month} value={month}>
                                    <SelectItemText>{month}</SelectItemText>
                                    <SelectItemIndicator />
                                </SelectItem>
                            ))
                        }
                    </SelectViewport>
                    <SelectScrollDownButton />
                </SelectContent>
            </SelectPortal>
        </Select>
    );
}

// ---------------------------------------------------------------------------------------------------- //

export {
    Calendar,
    CalendarHeading,
    CalendarPreviousButton,
    CalendarNextButton,
    CalendarYear,
    CalendarMonth,
    CalendarGrid,
    CalendarGridHeader,
    CalendarGridHeaderCell,
    CalendarGridBody,
    CalendarGridBodyCell,
    CalendarYearSelect,
    CalendarMonthSelect,
    type CalendarProps,
    type CalendarHeadingProps,
    type CalendarPreviousButtonProps,
    type CalendarNextButtonProps,
    type CalendarYearProps,
    type CalendarMonthProps,
    type CalendarGridProps,
    type CalendarGridHeaderProps,
    type CalendarGridHeaderCellProps,
    type CalendarGridBodyProps,
    type CalendarGridBodyCellProps,
    type CalendarYearSelectProps,
    type CalendarMonthSelectProps,
}