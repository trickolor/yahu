// ----------------------------------------------------------------- //
// Select Actions Constants
// ----------------------------------------------------------------- //

export const SelectActions = {
    None: -1,
    Open: 0,
    OpenFirst: 1,
    OpenCurrent: 2,
    OpenLast: 3,
    Select: 4,
    Previous: 5,
    Next: 6,
    First: 7,
    Last: 8,
    PageUp: 9,
    PageDown: 10,
    Typeahead: 11,
    Close: 12,
    CloseSelect: 13,
    OpenWithTypeahead: 14,
} as const;

export type SelectAction = typeof SelectActions[keyof typeof SelectActions];

// ----------------------------------------------------------------- //
// Helper Functions
// ----------------------------------------------------------------- //

export const getSelectAction = (key: string, isOpen: boolean, hasAltKey = false): SelectAction => {
    if (!isOpen) switch (key) {
        case 'Enter': case ' ': case 'ArrowDown': return SelectActions.Open;
        case 'ArrowUp':
            return hasAltKey ? SelectActions.Open : SelectActions.OpenFirst;
        case 'Home': return SelectActions.OpenFirst;
        case 'End': return SelectActions.OpenLast;
    }

    if (/^[a-zA-Z0-9 ]$/.test(key)) return SelectActions.OpenWithTypeahead;

    else switch (key) {
        case 'ArrowUp': return hasAltKey ? SelectActions.CloseSelect : SelectActions.Previous;
        case 'ArrowDown': return SelectActions.Next;

        case 'Enter': case ' ': return SelectActions.Select;
        case 'Tab': return SelectActions.CloseSelect;
        case 'Escape': return SelectActions.Close;

        case 'PageDown': return SelectActions.PageDown;
        case 'PageUp': return SelectActions.PageUp;

        case 'Home': return SelectActions.First;
        case 'End': return SelectActions.Last;
    }

    if (/^[a-zA-Z0-9 ]$/.test(key)) return SelectActions.Typeahead;
    return SelectActions.None;
}
