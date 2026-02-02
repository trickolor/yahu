import { useCallback, useState } from "react";

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

    const setState = useCallback(
        (next: T) => {
            if (!isControlled) setInternal(next);
            onChange?.(next);
        },
        [isControlled, onChange]
    );

    return [state, setState] as const;
}

export {
    useControllableState,
    type ControllableStateProps,
    type ControllableStateReturn,
}