import { useCallback, useState } from 'react';

interface UseControllableStateProps<T> {
    onChange?: (next: T) => void;
    defaultValue: T;
    value?: T;
}

type UseControllableStateReturn<T> = [T, (next: T) => void];

export function useControllableState<T>({
    defaultValue,
    onChange,
    value,
}: UseControllableStateProps<T>): UseControllableStateReturn<T> {
    const [internal, setInternal] = useState<T>(defaultValue);
    const isControlled = value !== undefined;
    const state = isControlled ? (value as T) : internal;

    const setState = useCallback((next: T) => {
        if (!isControlled) setInternal(next);
        onChange?.(next);
    }, [isControlled, onChange]);

    return [state, setState] as const;
}
