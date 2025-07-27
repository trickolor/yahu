import {
    Children,
    cloneElement,
    forwardRef,
    type ComponentPropsWithoutRef,
    type ReactElement,
    type Ref,
    type RefCallback
} from "react";

export const refmerge = <T,>(...refs: Ref<T>[]): RefCallback<T> => {
    return (node: T | null) => {
        refs.forEach((ref) => {
            if (typeof ref === "function") ref(node);
            else if (ref) ref.current = node;
        });
    }
}

export interface SlotProps {
    children: ReactElement;
    [key: string]: any;
}

export const Slot = forwardRef<unknown, SlotProps>((props, forwardedRef) => {
    const { children, ...rest } = props;
    const child = Children.only(children) as ReactElement<any, any>;
    const mergedRef = refmerge((child as any).ref, forwardedRef);

    type RefAllowance = ComponentPropsWithoutRef<typeof child.type>;

    return cloneElement<RefAllowance>(child, {
        ...(rest as Partial<RefAllowance>),
        ref: mergedRef,
    });
});