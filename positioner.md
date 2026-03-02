# Select.Positioner — Props Reference

---

## `alignItemWithTrigger`

| | |
|---|---|
| **Type** | `boolean \| undefined` |
| **Default** | `true` |

Whether the positioner overlaps the trigger so the selected item's text is aligned with the trigger's value text. This only applies to mouse input and is automatically disabled if there is not enough space.

---

## `disableAnchorTracking`

| | |
|---|---|
| **Type** | `boolean \| undefined` |
| **Default** | `false` |

Whether to disable the popup from tracking any layout shift of its positioning anchor.

---

## `align`

| | |
|---|---|
| **Type** | `'start' \| 'center' \| 'end' \| undefined` |
| **Default** | `'center'` |

How to align the popup relative to the specified side.

---

## `alignOffset`

| | |
|---|---|
| **Type** | `number \| OffsetFunction` |
| **Default** | `0` |

---

## `side`

| | |
|---|---|
| **Type** | `'top' \| 'bottom' \| 'left' \| 'right' \| 'inline-end' \| 'inline-start' \| undefined` |
| **Default** | `'bottom'` |

Which side of the anchor element to align the popup against. May automatically change to avoid collisions.

---

## `sideOffset`

| | |
|---|---|
| **Type** | `number \| OffsetFunction` |
| **Default** | `0` |

---

## `arrowPadding`

| | |
|---|---|
| **Type** | `number` |
| **Default** | `5` |

---

## `anchor`

| | |
|---|---|
| **Type** | `Element \| VirtualElement \| React.RefObject<Element \| null> \| (() => Element \| VirtualElement \| null) \| null \| undefined` |
| **Default** | `—` |

An element to position the popup against. By default, the popup will be positioned against the trigger.

---

## `collisionAvoidance`

| | |
|---|---|
| **Type** | `CollisionAvoidance \| undefined` |
| **Default** | `—` |

Determines how to handle collisions when positioning the popup.

```ts
// Flip variant
{
  side?: 'flip' | 'none'
  align?: 'flip' | 'shift' | 'none'
  fallbackAxisSide?: 'start' | 'end' | 'none'
}

// Shift variant
{
  side?: 'shift' | 'none'
  align?: 'shift' | 'none'
  fallbackAxisSide?: 'start' | 'end' | 'none'
}
```

**Example:**

```jsx
<Positioner
  collisionAvoidance={{
    side: 'shift',
    align: 'shift',
    fallbackAxisSide: 'none',
  }}
/>
```

---

## `collisionBoundary`

| | |
|---|---|
| **Type** | `'clipping-ancestors' \| Element \| Element[] \| Rect \| undefined` |
| **Default** | `'clipping-ancestors'` |

An element or a rectangle that delimits the area that the popup is confined to.

---

## `collisionPadding`

| | |
|---|---|
| **Type** | `number \| { top?: number; right?: number; bottom?: number; left?: number } \| undefined` |
| **Default** | `5` |

Additional space to maintain from the edge of the collision boundary.

---

## `sticky`

| | |
|---|---|
| **Type** | `boolean \| undefined` |
| **Default** | `false` |

Whether to maintain the popup in the viewport after the anchor element was scrolled out of view.

---

## `positionMethod`

| | |
|---|---|
| **Type** | `'absolute' \| 'fixed' \| undefined` |
| **Default** | `'absolute'` |

Determines which CSS `position` property to use.

---

## `className`

| | |
|---|---|
| **Type** | `string \| ((state: Select.Positioner.State) => string \| undefined)` |
| **Default** | `—` |

CSS class applied to the element, or a function that returns a class based on the component's state.

---

## `style`

| | |
|---|---|
| **Type** | `React.CSSProperties \| ((state: Select.Positioner.State) => CSSProperties \| undefined)` |
| **Default** | `—` |

---

## `render`

| | |
|---|---|
| **Type** | `ReactElement \| ((props: HTMLProps, state: Select.Positioner.State) => ReactElement)` |
| **Default** | `—` |

Allows you to replace the component's HTML element with a different tag, or compose it with another component. Accepts a `ReactElement` or a function that returns the element to render.