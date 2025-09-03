import {
    useMemo,

    isValidElement,
    cloneElement,
    forwardRef,

    type ReactElement,
    type RefCallback,
    type Ref,
    type JSX

} from "react";

import { cn } from "../cn";

type AnyFn = (...args: any[]) => any;

const mergeRefs = <T,>(...refs: Array<Ref<T>>): RefCallback<T> =>
    (node: T) => {
        refs.forEach(ref => {
            if (typeof ref === 'function') ref(node);
            else if (ref && typeof ref === 'object') (ref as any).current = node;
        });
    };

const composeEventHandlers =
    (theirHandler?: AnyFn, ourHandler?: AnyFn): AnyFn | undefined =>
        (event: any) => {
            theirHandler?.(event);
            if (!event?.defaultPrevented) ourHandler?.(event);
        };

const mergeProps = <P extends Record<string, any>, C extends Record<string, any>>(
    slotProps: P,
    childProps: C,
    mergedRef: Ref<any>
): P & C => {
    const result: Record<string, any> = { ...childProps, ...slotProps };

    if ((childProps as any)?.className || (slotProps as any)?.className) {
        result.className = cn((childProps as any)?.className, (slotProps as any)?.className);
    }

    for (const key of Object.keys(slotProps)) {
        if (key.startsWith('on') && typeof (slotProps as any)[key] === 'function') {
            result[key] = composeEventHandlers(
                (childProps as any)[key],
                (slotProps as any)[key]
            );
        }
    }

    result.ref = mergedRef;
    return result as P & C;
}

export interface SlotProps {
    children: ReactElement<any, keyof JSX.IntrinsicElements | React.JSXElementConstructor<any>>;
    [key: string]: any;
}

export const Slot = forwardRef<any, SlotProps>(({ children, ...slotProps }, ref) => {
    if (!isValidElement(children))
        throw new Error('<Slot> expects exactly one valid React element as child');

    const mergedRef = useMemo(
        () => mergeRefs((children as any).ref, ref),
        [children, ref]
    );

    return cloneElement(children, mergeProps(slotProps, (children as any).props, mergedRef));
});

Slot.displayName = 'Slot';