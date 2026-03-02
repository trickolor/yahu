import {
    forwardRef,
    useCallback,
    useEffect,
    useRef,
    useState,
    type CSSProperties,
    type ReactNode,
    type RefObject,
} from "react";

// ---------------------------------------------------------------------------------------------------- //

export interface VirtualElement {
    getBoundingClientRect(): DOMRect;
    contextElement?: Element;
}

export type OffsetFunction = (data: {
    side: PhysicalSide;
    align: Align;
    anchor: { width: number; height: number };
    positioner: { width: number; height: number };
}) => number;

export type Anchor =
    | Element
    | VirtualElement
    | RefObject<Element | null>
    | (() => Element | VirtualElement | null)
    | null
    | undefined;

export type Side =
    | "top"
    | "bottom"
    | "left"
    | "right"
    | "inline-end"
    | "inline-start";

type PhysicalSide = "top" | "bottom" | "left" | "right";

export type Align = "start" | "center" | "end";

export interface Rect {
    top: number;
    right: number;
    bottom: number;
    left: number;
}

export type CollisionBoundary =
    | "clipping-ancestors"
    | Element
    | Element[]
    | Rect;

export type CollisionAvoidance =
    | {
          side?: "flip" | "none";
          align?: "flip" | "shift" | "none";
          fallbackAxisSide?: "start" | "end" | "none";
      }
    | {
          side?: "shift" | "none";
          align?: "shift" | "none";
          fallbackAxisSide?: "start" | "end" | "none";
      };

export type Padding =
    | number
    | { top?: number; right?: number; bottom?: number; left?: number };

// ---------------------------------------------------------------------------------------------------- //

export interface PositionerProps {
    anchor?: Anchor;
    enabled?: boolean;

    side?: Side;
    sideOffset?: number | OffsetFunction;
    align?: Align;
    alignOffset?: number | OffsetFunction;

    collisionAvoidance?: CollisionAvoidance;
    collisionBoundary?: CollisionBoundary;
    collisionPadding?: Padding;

    sticky?: boolean;
    positionMethod?: "fixed" | "absolute";
    disableAnchorTracking?: boolean;

    children?: ReactNode;
    className?: string;
    style?: CSSProperties;
    zIndex?: number;
}

// ---------------------------------------------------------------------------------------------------- //

interface NormalizedPadding {
    top: number;
    right: number;
    bottom: number;
    left: number;
}

interface PositionResult {
    x: number;
    y: number;
    actualSide: PhysicalSide;
    actualAlign: Align;
    anchorHidden: boolean;
    anchorWidth: number;
    anchorHeight: number;
    availableWidth: number;
    availableHeight: number;
    transformOrigin: string;
}

// ---------------------------------------------------------------------------------------------------- //

function isVirtualElement(value: unknown): value is VirtualElement {
    return (
        typeof value === "object" &&
        value !== null &&
        "getBoundingClientRect" in value &&
        !("nodeType" in value)
    );
}

function resolveAnchor(anchor: Anchor): Element | VirtualElement | null {
    if (!anchor) return null;
    if (typeof anchor === "function") return anchor();
    if ("current" in anchor) return anchor.current;
    return anchor;
}

function getAnchorRect(anchor: Element | VirtualElement): DOMRect {
    return anchor.getBoundingClientRect();
}

function getContextElement(anchor: Element | VirtualElement): Element | null {
    if (isVirtualElement(anchor)) return anchor.contextElement ?? null;
    return anchor;
}

// ---------------------------------------------------------------------------------------------------- //

function resolveLogicalSide(side: Side): PhysicalSide {
    if (side === "inline-start" || side === "inline-end") {
        const dir =
            document.documentElement.dir ||
            getComputedStyle(document.documentElement).direction ||
            "ltr";
        const isRtl = dir === "rtl";
        if (side === "inline-start") return isRtl ? "right" : "left";
        return isRtl ? "left" : "right";
    }
    return side;
}

// ---------------------------------------------------------------------------------------------------- //

function normalizePadding(padding: Padding): NormalizedPadding {
    if (typeof padding === "number") {
        return { top: padding, right: padding, bottom: padding, left: padding };
    }
    return {
        top: padding.top ?? 0,
        right: padding.right ?? 0,
        bottom: padding.bottom ?? 0,
        left: padding.left ?? 0,
    };
}

// ---------------------------------------------------------------------------------------------------- //

function getClippingAncestors(element: Element): Element[] {
    const ancestors: Element[] = [];
    let current: Element | null = element.parentElement;

    while (current && current !== document.documentElement) {
        const style = getComputedStyle(current);
        const overflow = style.overflow + style.overflowX + style.overflowY;
        if (/auto|scroll|hidden|clip/.test(overflow)) {
            ancestors.push(current);
        }
        current = current.parentElement;
    }

    return ancestors;
}

function getCollisionRect(
    boundary: CollisionBoundary | null | undefined,
    contextElement: Element | null
): Rect {
    const viewport: Rect = {
        top: 0,
        left: 0,
        right: window.innerWidth,
        bottom: window.innerHeight,
    };

    if (!boundary) return viewport;

    if (boundary === "clipping-ancestors") {
        if (!contextElement) return viewport;

        const ancestors = getClippingAncestors(contextElement);
        if (ancestors.length === 0) return viewport;

        return ancestors.reduce<Rect>((acc, el) => {
            const r = el.getBoundingClientRect();
            return {
                top: Math.max(acc.top, r.top),
                left: Math.max(acc.left, r.left),
                right: Math.min(acc.right, r.right),
                bottom: Math.min(acc.bottom, r.bottom),
            };
        }, viewport);
    }

    if (boundary instanceof Element) {
        const r = boundary.getBoundingClientRect();
        // Intersect with viewport so the popup never escapes the screen.
        return {
            top: Math.max(viewport.top, r.top),
            left: Math.max(viewport.left, r.left),
            right: Math.min(viewport.right, r.right),
            bottom: Math.min(viewport.bottom, r.bottom),
        };
    }

    if (Array.isArray(boundary)) {
        if (boundary.length === 0) return viewport;
        return boundary.reduce<Rect>((acc, el) => {
            const r = el.getBoundingClientRect();
            return {
                top: Math.max(acc.top, r.top),
                left: Math.max(acc.left, r.left),
                right: Math.min(acc.right, r.right),
                bottom: Math.min(acc.bottom, r.bottom),
            };
        }, viewport);
    }

    // Plain Rect
    return boundary;
}

// ---------------------------------------------------------------------------------------------------- //

function resolveOffset(
    offset: number | OffsetFunction,
    data: Parameters<OffsetFunction>[0]
): number {
    if (typeof offset === "function") return offset(data);
    return offset;
}

// ---------------------------------------------------------------------------------------------------- //

function getBasePosition(
    anchorRect: DOMRect,
    floatingSize: { width: number; height: number },
    side: PhysicalSide,
    sideOffset: number
): { x: number; y: number } {
    switch (side) {
        case "bottom":
            return { x: anchorRect.left, y: anchorRect.bottom + sideOffset };
        case "top":
            return {
                x: anchorRect.left,
                y: anchorRect.top - floatingSize.height - sideOffset,
            };
        case "right":
            return { x: anchorRect.right + sideOffset, y: anchorRect.top };
        case "left":
            return {
                x: anchorRect.left - floatingSize.width - sideOffset,
                y: anchorRect.top,
            };
    }
}

// ---------------------------------------------------------------------------------------------------- //

function applyAlignment(
    pos: { x: number; y: number },
    anchorRect: DOMRect,
    floatingSize: { width: number; height: number },
    side: PhysicalSide,
    align: Align,
    alignOffset: number
): { x: number; y: number } {
    const vertical = side === "top" || side === "bottom";

    if (vertical) {
        switch (align) {
            case "start":
                return { ...pos, x: anchorRect.left + alignOffset };
            case "center":
                return {
                    ...pos,
                    x:
                        anchorRect.left +
                        anchorRect.width / 2 -
                        floatingSize.width / 2 +
                        alignOffset,
                };
            case "end":
                return {
                    ...pos,
                    x: anchorRect.right - floatingSize.width + alignOffset,
                };
            default:
                return pos;
        }
    } else {
        switch (align) {
            case "start":
                return { ...pos, y: anchorRect.top + alignOffset };
            case "center":
                return {
                    ...pos,
                    y:
                        anchorRect.top +
                        anchorRect.height / 2 -
                        floatingSize.height / 2 +
                        alignOffset,
                };
            case "end":
                return {
                    ...pos,
                    y: anchorRect.bottom - floatingSize.height + alignOffset,
                };
            default:
                return pos;
        }
    }
}

// ---------------------------------------------------------------------------------------------------- //

function getOverflow(
    pos: { x: number; y: number },
    floatingSize: { width: number; height: number },
    collisionRect: Rect,
    padding: NormalizedPadding
): NormalizedPadding {
    return {
        top: Math.max(collisionRect.top + padding.top - pos.y, 0),
        bottom: Math.max(
            pos.y + floatingSize.height - (collisionRect.bottom - padding.bottom),
            0
        ),
        left: Math.max(collisionRect.left + padding.left - pos.x, 0),
        right: Math.max(
            pos.x + floatingSize.width - (collisionRect.right - padding.right),
            0
        ),
    };
}

function getOppositeSide(side: PhysicalSide): PhysicalSide {
    switch (side) {
        case "top": return "bottom";
        case "bottom": return "top";
        case "left": return "right";
        case "right": return "left";
    }
}

function getOppositeAlign(align: Align): Align {
    if (align === "start") return "end";
    if (align === "end") return "start";
    return "center";
}

function getSideOverflow(overflow: NormalizedPadding, side: PhysicalSide): number {
    switch (side) {
        case "top": return overflow.top;
        case "bottom": return overflow.bottom;
        case "left": return overflow.left;
        case "right": return overflow.right;
    }
}

// ---------------------------------------------------------------------------------------------------- //

function resolveCollision(
    preferredSide: PhysicalSide,
    anchorRect: DOMRect,
    floatingSize: { width: number; height: number },
    collisionRect: Rect,
    padding: NormalizedPadding,
    sideOffset: number,
    align: Align,
    alignOffset: number,
    avoidance: CollisionAvoidance,
    sticky: boolean
): PhysicalSide {
    const sideMode = avoidance.side ?? "flip";
    if (sideMode === "none") return preferredSide;

    const testPosition = (side: PhysicalSide) => {
        const base = getBasePosition(anchorRect, floatingSize, side, sideOffset);
        const aligned = applyAlignment(base, anchorRect, floatingSize, side, align, alignOffset);
        const constrained = sticky
            ? applySticky(aligned, floatingSize, collisionRect, padding, anchorRect, side)
            : aligned;
        return getSideOverflow(getOverflow(constrained, floatingSize, collisionRect, padding), side);
    };

    const preferredOverflow = testPosition(preferredSide);
    if (preferredOverflow <= 0) return preferredSide;

    if (sideMode === "flip") {
        const opposite = getOppositeSide(preferredSide);
        const oppositeOverflow = testPosition(opposite);

        // Only flip if the opposite side fits completely (no overflow on its main axis).
        // Using "strictly less" caused oscillation with constrained-height lists because
        // both sides overflow and the winner kept changing as the user scrolled.
        if (oppositeOverflow === 0) return opposite;

        // fallbackAxisSide: try perpendicular axis sides
        const fallback = (avoidance as { fallbackAxisSide?: string }).fallbackAxisSide;
        if (fallback && fallback !== "none") {
            const isVertical = preferredSide === "top" || preferredSide === "bottom";
            const fallbackSide: PhysicalSide = isVertical
                ? fallback === "start" ? "left" : "right"
                : fallback === "start" ? "top" : "bottom";

            const fallbackOverflow = testPosition(fallbackSide);
            if (fallbackOverflow < preferredOverflow) return fallbackSide;
        }

        return preferredSide;
    }

    // shift mode: keep preferred side, clamping is handled in applyShift
    return preferredSide;
}

// ---------------------------------------------------------------------------------------------------- //

function applySticky(
    pos: { x: number; y: number },
    floatingSize: { width: number; height: number },
    collisionRect: Rect,
    padding: NormalizedPadding,
    anchorRect: DOMRect,
    side: PhysicalSide
): { x: number; y: number } {
    const vertical = side === "top" || side === "bottom";

    if (vertical) {
        const minX = collisionRect.left + padding.left;
        const maxX = collisionRect.right - padding.right - floatingSize.width;
        const anchorInBounds =
            anchorRect.right > collisionRect.left + padding.left &&
            anchorRect.left < collisionRect.right - padding.right;

        const clampedX = anchorInBounds
            ? Math.max(minX, Math.min(pos.x, maxX))
            : pos.x;

        return { ...pos, x: clampedX };
    }

    const minY = collisionRect.top + padding.top;
    const maxY = collisionRect.bottom - padding.bottom - floatingSize.height;
    const anchorInBounds =
        anchorRect.bottom > collisionRect.top + padding.top &&
        anchorRect.top < collisionRect.bottom - padding.bottom;

    const clampedY = anchorInBounds
        ? Math.max(minY, Math.min(pos.y, maxY))
        : pos.y;

    return { ...pos, y: clampedY };
}

// ---------------------------------------------------------------------------------------------------- //

function applyShift(
    pos: { x: number; y: number },
    floatingSize: { width: number; height: number },
    collisionRect: Rect,
    padding: NormalizedPadding,
    side: PhysicalSide,
    avoidance: CollisionAvoidance
): { x: number; y: number } {
    const alignMode = avoidance.align ?? "shift";
    if (alignMode === "none") return pos;

    const vertical = side === "top" || side === "bottom";

    if (vertical) {
        const minX = collisionRect.left + padding.left;
        const maxX = collisionRect.right - padding.right - floatingSize.width;
        return { ...pos, x: Math.max(minX, Math.min(pos.x, maxX)) };
    }

    const minY = collisionRect.top + padding.top;
    const maxY = collisionRect.bottom - padding.bottom - floatingSize.height;
    return { ...pos, y: Math.max(minY, Math.min(pos.y, maxY)) };
}

// ---------------------------------------------------------------------------------------------------- //

function resolveAlignCollision(
    pos: { x: number; y: number },
    anchorRect: DOMRect,
    floatingSize: { width: number; height: number },
    collisionRect: Rect,
    padding: NormalizedPadding,
    side: PhysicalSide,
    align: Align,
    alignOffset: number,
    avoidance: CollisionAvoidance
): { x: number; y: number; actualAlign: Align } {
    const alignMode = avoidance.align ?? "shift";

    if (alignMode === "none") return { ...pos, actualAlign: align };

    if (alignMode === "flip") {
        const overflow = getOverflow(pos, floatingSize, collisionRect, padding);
        const vertical = side === "top" || side === "bottom";

        const hasOverflow = vertical
            ? overflow.left > 0 || overflow.right > 0
            : overflow.top > 0 || overflow.bottom > 0;

        if (hasOverflow && align !== "center") {
            const flippedAlign = getOppositeAlign(align);
            const flippedPos = applyAlignment(
                getBasePosition(anchorRect, floatingSize, side, 0),
                anchorRect,
                floatingSize,
                side,
                flippedAlign,
                alignOffset
            );
            const flippedOverflow = getOverflow(flippedPos, floatingSize, collisionRect, padding);
            const currentTotal = overflow.left + overflow.right + overflow.top + overflow.bottom;
            const flippedTotal =
                flippedOverflow.left + flippedOverflow.right + flippedOverflow.top + flippedOverflow.bottom;

            if (flippedTotal < currentTotal) {
                return { ...flippedPos, actualAlign: flippedAlign };
            }
        }

        return { ...pos, actualAlign: align };
    }

    // shift
    const shifted = applyShift(pos, floatingSize, collisionRect, padding, side, avoidance);
    return { ...shifted, actualAlign: align };
}

// ---------------------------------------------------------------------------------------------------- //

function getAvailableDimensions(
    anchorRect: DOMRect,
    collisionRect: Rect,
    padding: NormalizedPadding,
    side: PhysicalSide
): { availableWidth: number; availableHeight: number } {
    const vertical = side === "top" || side === "bottom";

    const availableHeight = vertical
        ? side === "bottom"
            ? collisionRect.bottom - padding.bottom - anchorRect.bottom
            : anchorRect.top - collisionRect.top - padding.top
        : collisionRect.bottom - padding.bottom - (collisionRect.top + padding.top);

    const availableWidth = !vertical
        ? side === "right"
            ? collisionRect.right - padding.right - anchorRect.right
            : anchorRect.left - collisionRect.left - padding.left
        : collisionRect.right - padding.right - (collisionRect.left + padding.left);

    return {
        availableWidth: Math.max(availableWidth, 0),
        availableHeight: Math.max(availableHeight, 0),
    };
}

// ---------------------------------------------------------------------------------------------------- //

function getTransformOrigin(side: PhysicalSide, align: Align): string {
    switch (side) {
        case "bottom":
            return align === "start" ? "top left" : align === "end" ? "top right" : "top center";
        case "top":
            return align === "start" ? "bottom left" : align === "end" ? "bottom right" : "bottom center";
        case "left":
            return align === "start" ? "top right" : align === "end" ? "bottom right" : "center right";
        case "right":
            return align === "start" ? "top left" : align === "end" ? "bottom left" : "center left";
    }
}

// ---------------------------------------------------------------------------------------------------- //

function isAnchorHidden(anchorRect: DOMRect, collisionRect: Rect): boolean {
    return (
        anchorRect.bottom <= collisionRect.top ||
        anchorRect.top >= collisionRect.bottom ||
        anchorRect.right <= collisionRect.left ||
        anchorRect.left >= collisionRect.right
    );
}

// ---------------------------------------------------------------------------------------------------- //

function getOffsetParentRect(el: HTMLElement): { x: number; y: number } {
    const offsetParent = el.offsetParent;
    if (!offsetParent) return { x: 0, y: 0 };
    const r = offsetParent.getBoundingClientRect();
    const style = getComputedStyle(offsetParent);
    return {
        x: r.left + parseFloat(style.borderLeftWidth || "0"),
        y: r.top + parseFloat(style.borderTopWidth || "0"),
    };
}

function computePosition(
    anchorEl: Element | VirtualElement,
    floatingEl: HTMLElement,
    options: {
        side: Side;
        sideOffset: number | OffsetFunction;
        align: Align;
        alignOffset: number | OffsetFunction;
        collisionAvoidance: CollisionAvoidance;
        collisionBoundary: CollisionBoundary | null | undefined;
        collisionPadding: Padding;
        sticky: boolean;
        positionMethod: "fixed" | "absolute";
        // When provided, skip side resolution and use this side directly (scroll updates).
        forceSide?: PhysicalSide;
    }
): PositionResult {
    const anchorRect = getAnchorRect(anchorEl);
    const contextEl = getContextElement(anchorEl);

    // Use getBoundingClientRect for accurate size even when element is off-screen.
    // offsetWidth/offsetHeight can return 0 when visibility:hidden before first paint.
    const floatingRect = floatingEl.getBoundingClientRect();
    const floatingSize = {
        width: floatingRect.width || floatingEl.offsetWidth,
        height: floatingRect.height || floatingEl.offsetHeight,
    };

    // For absolute positioning, all coordinates must be relative to the offset parent.
    const offsetParentPos =
        options.positionMethod === "absolute"
            ? getOffsetParentRect(floatingEl)
            : { x: 0, y: 0 };

    const physicalSide = resolveLogicalSide(options.side);
    const padding = normalizePadding(options.collisionPadding);
    const collisionRect = getCollisionRect(options.collisionBoundary, contextEl);

    const offsetData = {
        side: physicalSide,
        align: options.align,
        anchor: { width: anchorRect.width, height: anchorRect.height },
        positioner: floatingSize,
    };

    const resolvedSideOffset = resolveOffset(options.sideOffset, offsetData);
    const resolvedAlignOffset = resolveOffset(options.alignOffset, offsetData);

    // Use forceSide when provided (scroll updates) to prevent oscillation.
    const actualSide = options.forceSide ?? resolveCollision(
        physicalSide,
        anchorRect,
        floatingSize,
        collisionRect,
        padding,
        resolvedSideOffset,
        options.align,
        resolvedAlignOffset,
        options.collisionAvoidance,
        options.sticky
    );

    const basePos = getBasePosition(anchorRect, floatingSize, actualSide, resolvedSideOffset);
    const alignedPos = applyAlignment(
        basePos,
        anchorRect,
        floatingSize,
        actualSide,
        options.align,
        resolvedAlignOffset
    );

    const stickyPos = options.sticky
        ? applySticky(alignedPos, floatingSize, collisionRect, padding, anchorRect, actualSide)
        : alignedPos;

    const { x, y, actualAlign } = resolveAlignCollision(
        stickyPos,
        anchorRect,
        floatingSize,
        collisionRect,
        padding,
        actualSide,
        options.align,
        resolvedAlignOffset,
        options.collisionAvoidance
    );

    const { availableWidth, availableHeight } = getAvailableDimensions(
        anchorRect,
        collisionRect,
        padding,
        actualSide
    );

    return {
        x: x - offsetParentPos.x,
        y: y - offsetParentPos.y,
        actualSide,
        actualAlign,
        anchorHidden: isAnchorHidden(anchorRect, collisionRect),
        anchorWidth: anchorRect.width,
        anchorHeight: anchorRect.height,
        availableWidth,
        availableHeight,
        transformOrigin: getTransformOrigin(actualSide, actualAlign),
    };
}

// ---------------------------------------------------------------------------------------------------- //

const Positioner = forwardRef<HTMLDivElement, PositionerProps>(function Positioner(
    {
        anchor,
        enabled = true,

        side = "bottom",
        sideOffset = 4,
        align = "start",
        alignOffset = 0,

        collisionAvoidance = { side: "flip", align: "shift" },
        collisionBoundary = "clipping-ancestors",
        collisionPadding = 8,

        sticky = false,
        positionMethod = "fixed",
        disableAnchorTracking = false,

        children,
        className,
        style,
        zIndex = 50,
    },
    ref
) {
    const [result, setResult] = useState<PositionResult | null>(null);
    const floatingRef = useRef<HTMLDivElement | null>(null);

    // Stores the resolved physical side so scroll updates don't re-run flip logic
    // (which would oscillate when both sides overflow).
    const resolvedSideRef = useRef<PhysicalSide | null>(null);

    // Keep latest prop values in a ref so callbacks never need to be recreated
    // when object-valued props change identity (e.g. inline object literals).
    const optionsRef = useRef({
        anchor,
        enabled,
        side,
        sideOffset,
        align,
        alignOffset,
        collisionAvoidance,
        collisionBoundary,
        collisionPadding,
        sticky,
        positionMethod,
    });
    optionsRef.current = {
        anchor,
        enabled,
        side,
        sideOffset,
        align,
        alignOffset,
        collisionAvoidance,
        collisionBoundary,
        collisionPadding,
        sticky,
        positionMethod,
    };

    // Full update: re-resolves the side (flip/shift decision) AND coordinates.
    // Call this when the popup opens or when positioning props change.
    const updateFull = useCallback(() => {
        const floating = floatingRef.current;
        const opts = optionsRef.current;
        if (!floating || !opts.enabled) return;

        const resolved = resolveAnchor(opts.anchor);
        if (!resolved) return;

        const pos = computePosition(resolved, floating, {
            side: opts.side,
            sideOffset: opts.sideOffset,
            align: opts.align,
            alignOffset: opts.alignOffset,
            collisionAvoidance: opts.collisionAvoidance,
            collisionBoundary: opts.collisionBoundary,
            collisionPadding: opts.collisionPadding,
            sticky: opts.sticky,
            positionMethod: opts.positionMethod,
        });

        resolvedSideRef.current = pos.actualSide;
        setResult(pos);
    }, []);

    // Scroll update: reuses the already-resolved side to prevent oscillation.
    // Only x/y and overflow-dependent values are recomputed.
    const updateScroll = useCallback(() => {
        const floating = floatingRef.current;
        const opts = optionsRef.current;
        if (!floating || !opts.enabled) return;

        const resolved = resolveAnchor(opts.anchor);
        if (!resolved) return;

        const pos = computePosition(resolved, floating, {
            side: opts.side,
            sideOffset: opts.sideOffset,
            align: opts.align,
            alignOffset: opts.alignOffset,
            collisionAvoidance: opts.collisionAvoidance,
            collisionBoundary: opts.collisionBoundary,
            collisionPadding: opts.collisionPadding,
            sticky: opts.sticky,
            positionMethod: opts.positionMethod,
            forceSide: resolvedSideRef.current ?? undefined,
        });

        setResult(pos);
    }, []);

    // Run a full update (including side resolution) whenever the popup opens or
    // positioning props change. useEffect fires after paint, so the floating
    // element has real dimensions from the browser's layout engine.
    useEffect(() => {
        if (!enabled) {
            resolvedSideRef.current = null;
            setResult(null);
            return;
        }

        const floating = floatingRef.current;
        if (!floating) return;

        updateFull();

        // ResizeObserver catches the initial layout (first paint) and any
        // subsequent content-driven size changes (e.g. dynamic item lists).
        const ro = new ResizeObserver(() => updateFull());
        ro.observe(floating);

        return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabled, updateFull, side, sideOffset, align, alignOffset, sticky]);

    // Scroll/resize listeners use updateScroll to preserve the resolved side.
    useEffect(() => {
        if (!enabled || disableAnchorTracking) return;

        window.addEventListener("scroll", updateScroll, { capture: true, passive: true });
        window.addEventListener("resize", updateScroll, { passive: true });

        return () => {
            window.removeEventListener("scroll", updateScroll, true);
            window.removeEventListener("resize", updateScroll);
        };
    }, [enabled, disableAnchorTracking, updateScroll]);

    const setRefs = useCallback(
        (node: HTMLDivElement | null) => {
            floatingRef.current = node;
            if (typeof ref === "function") ref(node);
            else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        },
        [ref]
    );

    const isPositioned = result !== null;

    const positionStyle: CSSProperties = result
        ? {
              position: positionMethod,
              top: `${result.y}px`,
              left: `${result.x}px`,
              ["--anchor-width" as string]: `${result.anchorWidth}px`,
              ["--anchor-height" as string]: `${result.anchorHeight}px`,
              ["--available-width" as string]: `${result.availableWidth}px`,
              ["--available-height" as string]: `${result.availableHeight}px`,
              ["--transform-origin" as string]: result.transformOrigin,
          }
        : {
              // Keep at top:0 left:0 while hidden so the browser lays out the
              // element and ResizeObserver fires with real dimensions.
              position: positionMethod,
              top: "0px",
              left: "0px",
          };

    return (
        <div
            ref={setRefs}
            className={className}
            data-open={enabled ? "" : undefined}
            data-closed={!enabled ? "" : undefined}
            data-side={result?.actualSide}
            data-align={result?.actualAlign}
            data-anchor-hidden={result?.anchorHidden ? "" : undefined}
            style={{
                ...positionStyle,
                zIndex,
                visibility: isPositioned ? "visible" : "hidden",
                ...style,
            }}
        >
            {children}
        </div>
    );
});

Positioner.displayName = "Positioner";

// ---------------------------------------------------------------------------------------------------- //

export { Positioner };
export type { PhysicalSide };
