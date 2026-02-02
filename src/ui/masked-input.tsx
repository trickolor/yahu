import {
    forwardRef,
    useCallback,
    useEffect,
    useRef,
    useState,
    type ChangeEvent,
    type ClipboardEvent,
    type FocusEvent,
    type InputHTMLAttributes,
    type KeyboardEvent,
    type MouseEvent,
} from "react";
import { cn } from "@/cn";
import { useControllableState } from "@/hooks/use-controllable-state";
import { Slot } from "@/ui/slot";

type MaskChar = string | RegExp;
type Mask = string | MaskChar[];

interface MaskedState {
    value: string;
    selection: { start: number; end: number } | null;
}

interface MaskedInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue'> {
    mask: Mask;
    maskPlaceholder?: string;
    alwaysShowMask?: boolean;
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    beforeMaskedStateChange?: (state: MaskedState) => MaskedState;
    asChild?: boolean;
}

const DEFAULT_MASK_DEFINITIONS: Record<string, RegExp> = {
    '9': /[0-9]/,
    'a': /[a-zA-Z]/,
    '*': /[a-zA-Z0-9]/,
}

interface ParsedMaskChar {
    char: string;
    isEditable: boolean;
    pattern?: RegExp;
}

const parseMask = (mask: Mask): ParsedMaskChar[] => {
    const result: ParsedMaskChar[] = [];

    if (typeof mask === 'string') {
        let i = 0;

        while (i < mask.length) {
            const char = mask[i];

            if (char === '\\' && i + 1 < mask.length) {
                result.push({ char: mask[i + 1], isEditable: false });
                i += 2;
                continue;
            }

            const pattern = DEFAULT_MASK_DEFINITIONS[char];

            pattern ? result.push({ char, isEditable: true, pattern }) : result.push({ char, isEditable: false });

            i++;
        }
    }

    else {
        for (const item of mask) {
            if (typeof item === 'string') {
                const pattern = DEFAULT_MASK_DEFINITIONS[item];

                pattern ? result.push({ char: item, isEditable: true, pattern }) : result.push({ char: item, isEditable: false });
            }

            else result.push({ char: '_', isEditable: true, pattern: item });
        }
    }

    return result;
}

const getEditableIndices = (parsedMask: ParsedMaskChar[]): number[] =>
    parsedMask
        .map((m, i) => (m.isEditable ? i : -1))
        .filter((i) => i !== -1);

const applyMask = (
    rawValue: string,
    parsedMask: ParsedMaskChar[],
    placeholder: string
): string => {
    const rawChars = rawValue.split('');
    let rawIndex = 0;

    return parsedMask
        .map((maskChar) => {
            if (!maskChar.isEditable) return maskChar.char;

            while (rawIndex < rawChars.length) {
                const char = rawChars[rawIndex++];

                if (maskChar.pattern?.test(char)) return char;
            }

            return placeholder;
        })
        .join('');
}

const extractRawValue = (
    maskedValue: string,
    parsedMask: ParsedMaskChar[],
    placeholder: string
): string => {
    const editableIndices = getEditableIndices(parsedMask);

    return editableIndices
        .map((i) => maskedValue[i])
        .filter((char) => char && char !== placeholder)
        .join('');
}

const getDisplayValue = (
    value: string,
    parsedMask: ParsedMaskChar[],
    placeholder: string,
    alwaysShowMask: boolean,
    isFocused: boolean
): string => {
    if (!isFocused && !alwaysShowMask) {
        if (!value) return '';

        const masked = applyMask(value, parsedMask, placeholder);
        const editableIndices = getEditableIndices(parsedMask);

        let lastFilledIdx = -1;

        for (let i = editableIndices.length - 1; i >= 0; i--) {
            const idx = editableIndices[i];

            if (masked[idx] !== placeholder) {
                lastFilledIdx = idx;
                break;
            }
        }

        if (lastFilledIdx === -1) return '';

        return masked.substring(0, lastFilledIdx + 1);
    }

    return applyMask(value, parsedMask, placeholder);
}

const findNextEditableIndex = (
    parsedMask: ParsedMaskChar[],
    currentIndex: number
): number => {
    for (let i = currentIndex + 1; i < parsedMask.length; i++)
        if (parsedMask[i].isEditable) return i;

    const editableIndices = getEditableIndices(parsedMask);
    const lastEditable = editableIndices[editableIndices.length - 1];

    return lastEditable !== undefined ? lastEditable + 1 : parsedMask.length;
}

const findPrevEditableIndex = (
    parsedMask: ParsedMaskChar[],
    currentIndex: number
): number => {
    for (let i = currentIndex - 1; i >= 0; i--)
        if (parsedMask[i].isEditable) return i;

    return currentIndex;
}

const findEditableIndexAt = (
    parsedMask: ParsedMaskChar[],
    position: number
): number => {
    for (let i = position; i < parsedMask.length; i++)
        if (parsedMask[i].isEditable) return i;

    for (let i = position - 1; i >= 0; i--)
        if (parsedMask[i].isEditable) return i;

    return 0;
}

const getMaxCursorPosition = (
    maskedValue: string,
    editableIndices: number[],
    placeholder: string
): number => {
    let lastFilledIndex = -1;

    for (let i = editableIndices.length - 1; i >= 0; i--) {
        const idx = editableIndices[i];

        if (maskedValue[idx] && maskedValue[idx] !== placeholder) {
            lastFilledIndex = idx;
            break;
        }
    }

    if (lastFilledIndex === -1) return editableIndices[0] ?? 0;

    for (let i = 0; i < editableIndices.length; i++)
        if (editableIndices[i] > lastFilledIndex) return editableIndices[i];

    return lastFilledIndex + 1;
}

const MaskedInput = forwardRef<HTMLInputElement, MaskedInputProps>(
    (
        {
            mask,
            maskPlaceholder = '_',
            alwaysShowMask = false,
            value: valueProp,
            defaultValue,
            onValueChange,
            beforeMaskedStateChange,
            asChild = false,
            children,
            className,
            onFocus,
            onBlur,
            onChange,
            onKeyDown,
            onPaste,
            onClick,
            onSelect,
            ...props
        },
        forwardedRef
    ) => {
        const inputRef = useRef<HTMLInputElement>(null);
        const [isFocused, setIsFocused] = useState(false);

        const parsedMask = parseMask(mask);
        const editableIndices = getEditableIndices(parsedMask);

        const [rawValue, setRawValue] = useControllableState({
            value: valueProp,
            defaultValue: defaultValue ?? '',
            onChange: onValueChange,
        });

        const displayValue = getDisplayValue(
            rawValue,
            parsedMask,
            maskPlaceholder,
            alwaysShowMask,
            isFocused
        );

        const pendingCursorRef = useRef<number | null>(null);

        useEffect(() => {
            if (pendingCursorRef.current !== null && inputRef.current) {
                const pos = pendingCursorRef.current;
                inputRef.current.setSelectionRange(pos, pos);
                pendingCursorRef.current = null;
            }
        });

        const updateValue = useCallback(
            (newRawValue: string, cursorPosition: number) => {
                let state: MaskedState = {
                    value: newRawValue,
                    selection: { start: cursorPosition, end: cursorPosition },
                }

                if (beforeMaskedStateChange) state = beforeMaskedStateChange(state);

                setRawValue(state.value);

                if (state.selection) pendingCursorRef.current = state.selection.start;
            },
            [beforeMaskedStateChange, setRawValue]
        );

        const findFirstEmptyEditablePosition = (
            maskedValue: string,
            parsedMask: ParsedMaskChar[],
            placeholder: string
        ): number => {
            for (let i = 0; i < parsedMask.length; i++)
                if (parsedMask[i].isEditable && maskedValue[i] === placeholder) return i;

            return parsedMask.length;
        }

        const handleFocus = useCallback(
            (event: FocusEvent<HTMLInputElement>) => {
                setIsFocused(true);

                requestAnimationFrame(() => {
                    if (!inputRef.current) return;

                    const maskedValue = applyMask(rawValue, parsedMask, maskPlaceholder);
                    const cursorPos = findFirstEmptyEditablePosition(maskedValue, parsedMask, maskPlaceholder);

                    inputRef.current.setSelectionRange(cursorPos, cursorPos);
                });

                onFocus?.(event);
            },
            [maskPlaceholder, onFocus, parsedMask, rawValue]
        );

        const handleBlur = useCallback(
            (event: FocusEvent<HTMLInputElement>) => {
                setIsFocused(false);
                onBlur?.(event);
            },
            [onBlur]
        );

        const handleChange = useCallback(
            (event: ChangeEvent<HTMLInputElement>) => {
                const input = event.target;
                const newValue = input.value;
                const cursorPos = input.selectionStart ?? 0;

                const newRawValue = extractRawValue(newValue, parsedMask, maskPlaceholder);

                const newCursorPos = findEditableIndexAt(parsedMask, cursorPos);

                updateValue(newRawValue, newCursorPos);
                onChange?.(event);
            },
            [maskPlaceholder, onChange, parsedMask, updateValue]
        );

        const deleteSelection = (
            maskedValue: string,
            parsedMask: ParsedMaskChar[],
            cursorPos: number,
            selectionEnd: number,
            placeholder: string
        ): string => {
            let newRaw = '';

            for (let i = 0; i < parsedMask.length; i++) {
                if (!parsedMask[i].isEditable) continue;

                const char = maskedValue[i];

                if (char === placeholder) continue;

                if (i >= cursorPos && i < selectionEnd) continue;

                newRaw += char;
            }

            return newRaw;
        }

        const handleBackspaceAtPosition = (
            maskedValue: string,
            parsedMask: ParsedMaskChar[],
            cursorPos: number,
            placeholder: string
        ): { rawValue: string; cursorPos: number } | null => {
            const prevEditable = findPrevEditableIndex(parsedMask, cursorPos);

            if (!(prevEditable >= 0 && prevEditable < cursorPos)) return null;

            let newRaw = '';
            let skipped = false;

            for (let i = 0; i < parsedMask.length; i++) {
                if (!parsedMask[i].isEditable) continue;

                const char = maskedValue[i];

                if (char === placeholder) continue;

                if (i === prevEditable && !skipped) {
                    skipped = true;
                    continue;
                }

                newRaw += char;
            }

            return { rawValue: newRaw, cursorPos: prevEditable }
        }

        const handleDeleteAtPosition = (
            maskedValue: string,
            parsedMask: ParsedMaskChar[],
            cursorPos: number,
            placeholder: string
        ): { rawValue: string; cursorPos: number } | null => {
            const editableAtCursor = findEditableIndexAt(parsedMask, cursorPos);

            if (!(editableAtCursor >= cursorPos)) return null;

            let newRaw = '';

            for (let i = 0; i < parsedMask.length; i++) {
                if (!parsedMask[i].isEditable) continue;

                const char = maskedValue[i];

                if (char === placeholder || i === editableAtCursor) continue;

                newRaw += char;
            }

            return { rawValue: newRaw, cursorPos: editableAtCursor }
        }

        const handleCharacterInput = (
            char: string,
            maskedValue: string,
            parsedMask: ParsedMaskChar[],
            cursorPos: number,
            selectionEnd: number,
            hasSelection: boolean,
            placeholder: string
        ): { rawValue: string; cursorPos: number } | null => {
            const editableAtCursor = findEditableIndexAt(parsedMask, cursorPos);
            const maskChar = parsedMask[editableAtCursor];

            if (!maskChar?.pattern?.test(char)) return null;

            const rawIndexAtCursor = editableIndices.indexOf(editableAtCursor);
            const currentRawChars: string[] = [];

            for (const idx of editableIndices) {
                const c = maskedValue[idx];

                currentRawChars.push(c !== placeholder ? c : '');
            }

            let newRaw: string;

            if (hasSelection) {
                const startRawIdx = editableIndices.indexOf(
                    editableIndices.find(i => i >= cursorPos) ?? editableAtCursor
                );

                const endRawIdx = editableIndices.indexOf(
                    editableIndices.find(i => i >= selectionEnd) ?? editableIndices[editableIndices.length - 1]
                );

                currentRawChars.splice(startRawIdx, endRawIdx - startRawIdx, char);
                newRaw = currentRawChars.filter(c => c).join('');
            }

            else {
                currentRawChars.splice(rawIndexAtCursor, 0, char);
                newRaw = currentRawChars.filter(c => c).join('');
            }

            const nextCursor = findNextEditableIndex(parsedMask, editableAtCursor);

            return { rawValue: newRaw, cursorPos: nextCursor }
        }

        const handleKeyDown = useCallback(
            (event: KeyboardEvent<HTMLInputElement>) => {
                const input = event.currentTarget;
                const cursorPos = input.selectionStart ?? 0;
                const selectionEnd = input.selectionEnd ?? cursorPos;
                const hasSelection = cursorPos !== selectionEnd;

                if (event.key === 'Backspace') {
                    event.preventDefault();

                    const maskedValue = displayValue;

                    if (hasSelection) {
                        const newRaw = deleteSelection(maskedValue, parsedMask, cursorPos, selectionEnd, maskPlaceholder);

                        updateValue(newRaw, cursorPos);
                    }

                    else {
                        const result = handleBackspaceAtPosition(maskedValue, parsedMask, cursorPos, maskPlaceholder);

                        if (result) updateValue(result.rawValue, result.cursorPos);
                    }

                    onKeyDown?.(event);
                    return;
                }

                if (event.key === 'Delete') {
                    event.preventDefault();

                    const maskedValue = displayValue;

                    if (hasSelection) {
                        const newRaw = deleteSelection(maskedValue, parsedMask, cursorPos, selectionEnd, maskPlaceholder);

                        updateValue(newRaw, cursorPos);
                    }

                    else {
                        const result = handleDeleteAtPosition(maskedValue, parsedMask, cursorPos, maskPlaceholder);

                        if (result) updateValue(result.rawValue, result.cursorPos);
                    }

                    onKeyDown?.(event);
                    return;
                }

                if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
                    event.preventDefault();

                    const maskedValue = displayValue;
                    const result = handleCharacterInput(
                        event.key,
                        maskedValue,
                        parsedMask,
                        cursorPos,
                        selectionEnd,
                        hasSelection,
                        maskPlaceholder
                    );

                    if (result) updateValue(result.rawValue, result.cursorPos);

                    onKeyDown?.(event);
                    return;
                }

                onKeyDown?.(event);
            },
            [displayValue, maskPlaceholder, onKeyDown, parsedMask, updateValue]
        );

        const handleSelect = useCallback(
            (event: React.SyntheticEvent<HTMLInputElement>) => {
                const input = event.currentTarget;
                const cursorPos = input.selectionStart ?? 0;
                const selectionEnd = input.selectionEnd ?? cursorPos;

                const maskedValue = applyMask(rawValue, parsedMask, maskPlaceholder);
                const maxPos = getMaxCursorPosition(maskedValue, editableIndices, maskPlaceholder);

                const constrainedStart = Math.min(cursorPos, maxPos);
                const constrainedEnd = Math.min(selectionEnd, maxPos);

                if (constrainedStart !== cursorPos || constrainedEnd !== selectionEnd)
                    input.setSelectionRange(constrainedStart, constrainedEnd);

                onSelect?.(event);
            },
            [editableIndices, maskPlaceholder, onSelect, parsedMask, rawValue]
        );

        const handleClick = useCallback(
            (event: MouseEvent<HTMLInputElement>) => {
                onClick?.(event);
            },
            [onClick]
        );

        const buildRawValueFromPaste = (
            maskedValue: string,
            parsedMask: ParsedMaskChar[],
            cursorPos: number,
            pastedText: string,
            placeholder: string
        ): string => {
            let newRaw = '';

            for (let i = 0; i < parsedMask.length && i < cursorPos; i++) {
                if (!parsedMask[i].isEditable) continue;

                const char = maskedValue[i];

                if (char !== placeholder) newRaw += char;
            }

            let pasteIndex = 0;
            const editableFromCursor = editableIndices.filter(i => i >= cursorPos);

            for (const editableIdx of editableFromCursor) {
                const maskChar = parsedMask[editableIdx];

                while (pasteIndex < pastedText.length) {
                    const char = pastedText[pasteIndex++];

                    if (maskChar.pattern?.test(char)) {
                        newRaw += char;
                        break;
                    }
                }
            }

            return newRaw;
        }

        const findCursorPositionAfterPaste = (
            newRaw: string,
            parsedMask: ParsedMaskChar[],
            placeholder: string
        ): number => {
            const newMasked = applyMask(newRaw, parsedMask, placeholder);

            for (let i = 0; i < parsedMask.length; i++)
                if (parsedMask[i].isEditable && newMasked[i] === placeholder) return i;

            return parsedMask.length;
        }

        const handlePaste = useCallback(
            (event: ClipboardEvent<HTMLInputElement>) => {
                event.preventDefault();

                const pastedText = event.clipboardData.getData('text/plain');
                const input = event.currentTarget;
                const cursorPos = input.selectionStart ?? 0;

                const maskedValue = displayValue;
                const newRaw = buildRawValueFromPaste(
                    maskedValue,
                    parsedMask,
                    cursorPos,
                    pastedText,
                    maskPlaceholder
                );
                const newCursorPos = findCursorPositionAfterPaste(newRaw, parsedMask, maskPlaceholder);

                updateValue(newRaw, newCursorPos);
                onPaste?.(event);
            },
            [displayValue, editableIndices, maskPlaceholder, onPaste, parsedMask, updateValue]
        );

        const mergedRef = useCallback(
            (node: HTMLInputElement | null) => {
                (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = node;

                typeof forwardedRef === 'function' ? forwardedRef(node) : forwardedRef && (forwardedRef.current = node);
            },
            [forwardedRef]
        );

        const Comp = asChild ? Slot : 'input';

        return (
            <Comp
                data-ui="masked-input"
                
                value={displayValue}
                ref={mergedRef}
                type="text"
                
                onKeyDown={handleKeyDown}
                onChange={handleChange}
                onSelect={handleSelect}
                onPaste={handlePaste}
                onClick={handleClick}
                onFocus={handleFocus}
                onBlur={handleBlur}
                
                className={cn(
                    "relative flex w-full h-9 px-3 py-2 text-sm text-write ring-offset-2 transition-all rounded border border-bound bg-surface",
                    'focus-visible:outline-none focus-visible:ring-offset-muted-bound focus-visible:ring-outer-bound focus-visible:ring-2',
                    "disabled:cursor-not-allowed disabled:opacity-70 disabled:pointer-events-none",
                    "aria-invalid:ring-danger aria-invalid:border-danger",
                    "placeholder:text-muted-write",
                    className
                )}

                {...props}
            >
                {children}
            </Comp>
        );
    }
);

export {
    MaskedInput,
    type MaskedInputProps,
    type MaskedState,
    type Mask,
    type MaskChar,
}
