import {
    Children,
    cloneElement,
    forwardRef,
    isValidElement,
    type ReactNode,
    type ReactElement,
    type HTMLAttributes,
    type Ref,
    type RefCallback,
    type CSSProperties,
} from "react";

import { cn } from "@/cn";

// ---------------------------------------------------------------------------------------------------- //

type PossibleRef<T> = Ref<T> | undefined;

function setRef<T>(ref: PossibleRef<T>, value: T): void {
    if (typeof ref === "function") ref(value);
    else if (ref !== null && ref !== undefined) {
        const mutableRef = ref as { current: T }
        mutableRef.current = value;
    }
}

function composeRefs<T>(...refs: PossibleRef<T>[]): RefCallback<T> {
    return (node: T) => refs.forEach((ref) => setRef(ref, node));
}

// ---------------------------------------------------------------------------------------------------- //

type AnyRecord = Record<string, unknown>;

type EventHandlerLike = (...args: unknown[]) => void;

function isEventHandler(key: string): boolean {
    return (
        key.length > 2 &&
        key.startsWith("on") &&
        key.charCodeAt(2) >= 65 &&
        key.charCodeAt(2) <= 90
    );
}

function isFunction(value: unknown): value is EventHandlerLike {
    return typeof value === "function";
}

function isString(value: unknown): value is string {
    return typeof value === "string";
}

function isStyleObject(value: unknown): value is CSSProperties {
    return (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
    );
}

function mergeProps(slotProps: AnyRecord, childProps: AnyRecord): AnyRecord {
    const merged: AnyRecord = { ...slotProps }

    Object.keys(childProps).forEach((key) => {
        const slotValue = slotProps[key];
        const childValue = childProps[key];

        if (isEventHandler(key)) {
            const slotHandler = isFunction(slotValue) ? slotValue : undefined;
            const childHandler = isFunction(childValue) ? childValue : undefined;

            merged[key] = slotHandler && childHandler
                ? (...args: unknown[]) => {
                    childHandler(...args);
                    slotHandler(...args);
                }
                : childHandler || slotHandler;
        }

        else if (key === "style") {
            const slotStyle = isStyleObject(slotValue) ? slotValue : undefined;
            const childStyle = isStyleObject(childValue) ? childValue : undefined;

            merged[key] = { ...slotStyle, ...childStyle }
        }

        else if (key === "className") {
            const slotClass = isString(slotValue) ? slotValue : undefined;
            const childClass = isString(childValue) ? childValue : undefined;
            merged[key] = cn([slotClass, childClass].filter(Boolean).join(" ")) || undefined;
        }

        else merged[key] = childValue !== undefined ? childValue : slotValue;
    });

    return merged;
}

function getElementRef(element: ReactElement): PossibleRef<unknown> {
    const props = element.props as { ref?: Ref<unknown> }
    const elementWithRef = element as { ref?: Ref<unknown> }
    return props.ref ?? elementWithRef.ref;
}

// ---------------------------------------------------------------------------------------------------- //

interface SlottableProps {
    children: ReactNode;
}

function Slottable({ children }: SlottableProps) {
    return children;
}

function isSlottable(child: ReactNode): child is ReactElement<SlottableProps> {
    return isValidElement(child) && child.type === Slottable;
}

// ---------------------------------------------------------------------------------------------------- //

interface SlotCloneProps {
    children: ReactNode;
}

const SlotClone = forwardRef<unknown, SlotCloneProps & HTMLAttributes<HTMLElement>>(
    function SlotClone({ children, ...slotProps }, forwardedRef) {
        if (!isValidElement(children)) {
            if (children === null || children === undefined) return null;
            console.warn("Slot: Expected a single React element child, received:", typeof children);
            return <>{children}</>;
        }

        const childProps = children.props as AnyRecord;
        const childRef = getElementRef(children);

        const mergedProps = mergeProps(slotProps, childProps);

        const composedRef = forwardedRef
            ? composeRefs(forwardedRef, childRef)
            : childRef;

        return cloneElement(
            children,
            { ...mergedProps, ref: composedRef } as Partial<typeof children.props> & { ref?: unknown }
        );
    }
);

// ---------------------------------------------------------------------------------------------------- //

interface SlotProps extends HTMLAttributes<HTMLElement> {
    children?: ReactNode;
}

const Slot = forwardRef<HTMLElement, SlotProps>(
    function Slot({ children, ...slotProps }, forwardedRef) {
        const childArray = Children.toArray(children);
        const slottableChild = childArray.find(isSlottable);

        if (slottableChild) {
            const slottableContent = slottableChild.props.children;

            if (isValidElement(slottableContent)) {
                const slottableContentProps = slottableContent.props as AnyRecord;
                const slottableContentRef = getElementRef(slottableContent);

                const mergedProps = mergeProps(slotProps, slottableContentProps);
                const composedRef = forwardedRef
                    ? composeRefs(forwardedRef, slottableContentRef)
                    : slottableContentRef;

                const otherChildren = childArray.filter((child) => child !== slottableChild);

                const childrenForClone: ReactNode = otherChildren.length > 0
                    ? otherChildren
                    : (slottableContentProps.children as ReactNode);

                return cloneElement(
                    slottableContent,

                    {
                        ...mergedProps,
                        children: childrenForClone,
                        ref: composedRef,
                    } as Partial<typeof slottableContent.props> & { ref?: unknown; children?: ReactNode }
                );
            }

            return <>{children}</>;
        }

        return (
            <SlotClone {...slotProps} ref={forwardedRef}>
                {children}
            </SlotClone>
        );
    });

// ---------------------------------------------------------------------------------------------------- //

export {
    Slot,
    Slottable,
    composeRefs,
    mergeProps,
    type SlotProps,
    type SlottableProps,
}

// ---------------------------------------------------------------------------------------------------- //
