import {
    useLayoutEffect,
    useCallback,
    useEffect,
    useState,
    useRef,
    type RefObject,
} from "react";

// ---------------------------------------------------------------------------------------------------- //

type Boundary = Element | null | Array<Element | null>;
type Side = "top" | "right" | "bottom" | "left";
type Align = "start" | "center" | "end";
type Sticky = "partial" | "always";

interface ExplicitPadding {
    top: number;
    right: number;
    bottom: number;
    left: number;
}

type Padding = Partial<ExplicitPadding> | number;

interface Position {
    top: number;
    left: number;
}

interface FullPosition {
    top: number;
    right: number;
    bottom: number;
    left: number;
}

interface Size {
    width: number;
    height: number;
}

interface MaxSize {
    maxWidth: number;
    maxHeight: number;
}

interface PositionResult extends Position {
    actualSide: Side;
    actualAlign: Align;
    maxHeight?: number;
    maxWidth?: number;
    isReferenceHidden: boolean;
}

// ---------------------------------------------------------------------------------------------------- //

const DEFAULT_SIDE: Side = "bottom";
const DEFAULT_ALIGN: Align = "start";
const DEFAULT_SIDE_OFFSET = 4;
const DEFAULT_ALIGN_OFFSET = 0;
const DEFAULT_AVOID_COLLISIONS = true;
const DEFAULT_COLLISION_PADDING = 8;
const DEFAULT_CONSTRAIN_SIZE = true;
const DEFAULT_STICKY: Sticky = "partial";
const DEFAULT_COLLISION_BOUNDARY: Boundary = [];

const ALL_SIDES: Side[] = ["top", "right", "bottom", "left"];

// ---------------------------------------------------------------------------------------------------- //

interface UsePositionOptions {
    relativeTo: RefObject<HTMLElement | null> | MouseEvent;
    target: RefObject<HTMLElement | null>;

    isTargetRendered: boolean;

    sideOffset?: number;
    side?: Side;

    alignOffset?: number;
    align?: Align;

    collisionPadding?: Padding;
    collisionBoundary?: Boundary;
    avoidCollisions?: boolean;

    sticky?: Sticky;
    hideWhenDetached?: boolean;

    constrainSize?: boolean;
}

interface UsePositionReturn extends PositionResult {
    updatePosition: (recalculateNaturalSize?: boolean) => void;
    isPositioned: boolean;
    isReferenceHidden: boolean;
}

// ---------------------------------------------------------------------------------------------------- //

const normalizePadding = (padding: Padding): ExplicitPadding => {
    const getValue = (side: Side): number => {
        return typeof padding === "number"
            ? padding
            : (padding[side] ?? 0);
    }

    return (
        (["top", "right", "bottom", "left"] as Side[]).reduce((acc, value) => {
            acc[value] = getValue(value);
            return acc;
        }, {} as ExplicitPadding)
    );
}

// ---------------------------------------------------------------------------------------------------- //

interface AvailableSpaceGetterParams {
    padding: ExplicitPadding;
    relativeToRect: DOMRect;
    collisionRect: FullPosition;
    sideOffset: number;
}

const getAvailableSpace = ({
    relativeToRect,
    sideOffset,
    padding,
    collisionRect,
}: AvailableSpaceGetterParams): ExplicitPadding => ({
    top: relativeToRect.top - collisionRect.top - sideOffset - padding.top,
    bottom: collisionRect.bottom - relativeToRect.bottom - sideOffset - padding.bottom,
    left: relativeToRect.left - collisionRect.left - sideOffset - padding.left,
    right: collisionRect.right - relativeToRect.right - sideOffset - padding.right,
});

// ---------------------------------------------------------------------------------------------------- //

const isVerticalSide = (side: Side): boolean => ['top', 'bottom'].includes(side);

// ---------------------------------------------------------------------------------------------------- //

const measureNaturalContentSize = (content: HTMLElement): Size => {
    const previousStyles = {
        maxHeight: content.style.maxHeight,
        maxWidth: content.style.maxWidth,
    };

    // Temporarily remove size constraints so side selection uses the natural content size.
    content.style.maxHeight = "none";
    content.style.maxWidth = "none";

    const measuredSize = {
        width: content.scrollWidth,
        height: content.scrollHeight,
    };

    content.style.maxHeight = previousStyles.maxHeight;
    content.style.maxWidth = previousStyles.maxWidth;

    return measuredSize;
}

// ---------------------------------------------------------------------------------------------------- //

interface BasePositionGetterParams {
    contentSize: Size;
    relativeToRect: DOMRect;

    sideOffset: number;
    side: Side;
}

const getBasePosition = ({
    contentSize,
    relativeToRect,
    sideOffset,
    side,
}: BasePositionGetterParams): Position => {
    switch (side) {
        case "top": return {
            top: relativeToRect.top - contentSize.height - sideOffset,
            left: relativeToRect.left,
        }

        case "bottom": return {
            top: relativeToRect.bottom + sideOffset,
            left: relativeToRect.left,
        }

        case "left": return {
            top: relativeToRect.top,
            left: relativeToRect.left - contentSize.width - sideOffset,
        }

        case "right": return {
            top: relativeToRect.top,
            left: relativeToRect.right + sideOffset,
        }
    }
}

// ---------------------------------------------------------------------------------------------------- //

interface AlignmentSetterParams {
    contentSize: Size;
    relativeToRect: DOMRect;
    position: Position;

    side: Side;

    alignOffset: number;
    align: Align;
}

const setAlignment = ({
    contentSize,
    relativeToRect,
    position,

    side,

    alignOffset,
    align,
}: AlignmentSetterParams): Position => {
    const vertical = isVerticalSide(side);

    switch (align) {
        case "start": return vertical
            ? { ...position, left: relativeToRect.left + alignOffset }
            : { ...position, top: relativeToRect.top + alignOffset }

        case "center": return vertical
            ? { ...position, left: relativeToRect.left + relativeToRect.width / 2 - contentSize.width / 2 + alignOffset }
            : { ...position, top: relativeToRect.top + relativeToRect.height / 2 - contentSize.height / 2 + alignOffset }

        case "end": return vertical
            ? { ...position, left: relativeToRect.right - contentSize.width + alignOffset }
            : { ...position, top: relativeToRect.bottom - contentSize.height + alignOffset }
    }
}

// ---------------------------------------------------------------------------------------------------- //

interface OptimalSideGetterParams {
    relativeToRect: DOMRect;
    contentSize: Size;
    collisionRect: FullPosition;
    padding: ExplicitPadding;
    preferredSide: Side;
    sideOffset: number;
    alignOffset: number;
    align: Align;
    sticky: Sticky;

    avoidCollisions: boolean;
}

interface SideOverflow {
    top: number;
    right: number;
    bottom: number;
    left: number;
}

const getOverflowForPosition = ({
    position,
    contentSize,
    collisionRect,
    padding,
}: {
    position: Position;
    contentSize: Size;
    collisionRect: FullPosition;
    padding: ExplicitPadding;
}): SideOverflow => {
    const minTop = collisionRect.top + padding.top;
    const maxRight = collisionRect.right - padding.right;
    const maxBottom = collisionRect.bottom - padding.bottom;
    const minLeft = collisionRect.left + padding.left;

    const contentTop = position.top;
    const contentRight = position.left + contentSize.width;
    const contentBottom = position.top + contentSize.height;
    const contentLeft = position.left;

    return {
        top: Math.max(minTop - contentTop, 0),
        right: Math.max(contentRight - maxRight, 0),
        bottom: Math.max(contentBottom - maxBottom, 0),
        left: Math.max(minLeft - contentLeft, 0),
    };
}

const getMainAxisOverflow = (overflow: SideOverflow, side: Side): number => {
    switch (side) {
        case "top": return overflow.top;
        case "right": return overflow.right;
        case "bottom": return overflow.bottom;
        case "left": return overflow.left;
    }
}

const getTotalOverflow = (overflow: SideOverflow): number => (
    overflow.top + overflow.right + overflow.bottom + overflow.left
);

const getOptimalSide = ({
    relativeToRect,
    contentSize,
    preferredSide,
    collisionRect,
    padding,
    sideOffset,
    alignOffset,
    align,
    sticky,
    avoidCollisions,
}: OptimalSideGetterParams): Side => {
    if (!avoidCollisions) return preferredSide;

    const sideMetrics = ALL_SIDES.map((candidateSide) => {
        const basePosition = getBasePosition({
            relativeToRect,
            contentSize,
            sideOffset,
            side: candidateSide,
        });

        const alignedPosition = setAlignment({
            contentSize,
            relativeToRect,
            position: basePosition,
            side: candidateSide,
            alignOffset,
            align,
        });

        const constrainedPosition = setViewportConstraint({
            contentSize,
            padding,
            position: alignedPosition,
            relativeToRect,
            collisionRect,
            sticky,
            side: candidateSide,
        });

        const overflow = getOverflowForPosition({
            position: constrainedPosition,
            contentSize,
            collisionRect,
            padding,
        });

        const mainOverflow = getMainAxisOverflow(overflow, candidateSide);
        const totalOverflow = getTotalOverflow(overflow);

        return {
            side: candidateSide,
            mainOverflow,
            totalOverflow,
            isPreferred: candidateSide === preferredSide,
        };
    });

    sideMetrics.sort((a, b) => {
        if (a.mainOverflow !== b.mainOverflow) return a.mainOverflow - b.mainOverflow;
        if (a.totalOverflow !== b.totalOverflow) return a.totalOverflow - b.totalOverflow;
        if (a.isPreferred !== b.isPreferred) return a.isPreferred ? -1 : 1;

        // Keep deterministic fallback order.
        return ALL_SIDES.indexOf(a.side) - ALL_SIDES.indexOf(b.side);
    });

    return sideMetrics[0].side;
}

// ---------------------------------------------------------------------------------------------------- //

interface ViewportConstraintSetterParams {
    contentSize: Size;
    padding: ExplicitPadding;
    position: Position;
    relativeToRect: DOMRect;
    collisionRect: FullPosition;
    sticky: Sticky;
    side: Side;
}

const setViewportConstraint = ({
    contentSize,
    padding,
    position,
    relativeToRect,
    collisionRect,
    sticky,
    side,
}: ViewportConstraintSetterParams): Position => {
    const vertical = isVerticalSide(side);

    if (vertical) {
        const minLeft = collisionRect.left + padding.left;
        const maxLeft = collisionRect.right - contentSize.width - padding.right;
        const baseConstrainedLeft = Math.max(Math.min(position.left, maxLeft), minLeft);

        const triggerInBounds =
            relativeToRect.right > collisionRect.left + padding.left &&
            relativeToRect.left < collisionRect.right - padding.right;

        const constrainedLeft = sticky === "partial" && !triggerInBounds
            ? position.left
            : baseConstrainedLeft;

        return { ...position, left: constrainedLeft }
    }

    const minTop = collisionRect.top + padding.top;
    const maxTop = collisionRect.bottom - contentSize.height - padding.bottom;
    const baseConstrainedTop = Math.max(Math.min(position.top, maxTop), minTop);

    const triggerInBounds =
        relativeToRect.bottom > collisionRect.top + padding.top &&
        relativeToRect.top < collisionRect.bottom - padding.bottom;

    const constrainedTop = sticky === "partial" && !triggerInBounds
        ? position.top
        : baseConstrainedTop;

    return { ...position, top: constrainedTop }
}

// ---------------------------------------------------------------------------------------------------- //

interface MaxDimensionsGetterParams {
    availableSpace: ExplicitPadding;
    constrainSize: boolean;
    side: Side;
}

const getMaxDimensions = ({
    availableSpace,
    constrainSize,
    side,
}: MaxDimensionsGetterParams): Partial<MaxSize> => {
    if (!constrainSize) return {}

    const vertical = isVerticalSide(side);
    const space = availableSpace[side];

    // Use available space as max dimension - never exceed it
    // This ensures content always fits within boundaries and scrolls if needed
    return vertical
        ? { maxHeight: Math.max(space, 0) }
        : { maxWidth: Math.max(space, 0) }
}

// ---------------------------------------------------------------------------------------------------- //

interface PositionGetterParams {
    relativeToRect: DOMRect;
    contentSize: Size;

    sideOffset: number;
    side: Side;

    alignOffset: number;
    align: Align;

    padding: ExplicitPadding;
    collisionRect: FullPosition;

    avoidCollisions: boolean;
    constrainSize: boolean;
    sticky: Sticky;
}

const getPosition = ({
    relativeToRect,
    contentSize,
    side,
    align,
    sideOffset,
    alignOffset,
    avoidCollisions,
    padding,
    collisionRect,
    constrainSize,
    sticky,
}: PositionGetterParams): PositionResult => {

    const actualSide = getOptimalSide({
        relativeToRect,
        preferredSide: side,
        avoidCollisions,
        contentSize,
        collisionRect,
        padding,
        sideOffset,
        alignOffset,
        align,
        sticky,
    });

    const basePosition = getBasePosition({
        relativeToRect,
        contentSize,
        side: actualSide,
        sideOffset,
    });

    const alignedPosition = setAlignment({
        position: basePosition,
        side: actualSide,
        relativeToRect,
        contentSize,
        alignOffset,
        align,
    });

    const constrainedPosition = setViewportConstraint({
        position: alignedPosition,
        contentSize,
        padding,
        relativeToRect,
        collisionRect,
        sticky,
        side: actualSide,
    });

    const recalculatedSpace = getAvailableSpace({
        relativeToRect,
        sideOffset,
        padding,
        collisionRect,
    });

    // When positioning on top side, if content's natural height exceeds available space,
    // reposition to viewport top to maximize visible area (content will scroll via maxHeight constraint)
    const shouldRepositionToViewportTop =
        actualSide === "top" &&
        constrainSize &&
        contentSize.height > recalculatedSpace.top;

    const finalPosition = shouldRepositionToViewportTop
        ? { ...constrainedPosition, top: collisionRect.top + padding.top }
        : constrainedPosition;

    // Calculate max dimensions based on available space
    // maxHeight will be set to exactly the available space, ensuring proper scrolling without overlay
    const maxDimensions = getMaxDimensions({
        side: actualSide,
        availableSpace: recalculatedSpace,
        constrainSize,
    });

    const isReferenceHidden =
        relativeToRect.bottom <= collisionRect.top ||
        relativeToRect.top >= collisionRect.bottom ||
        relativeToRect.right <= collisionRect.left ||
        relativeToRect.left >= collisionRect.right;

    return {
        ...finalPosition,
        actualSide,
        actualAlign: align,
        isReferenceHidden,
        ...maxDimensions,
    }
}

// ---------------------------------------------------------------------------------------------------- //

function usePosition({
    relativeTo,

    isTargetRendered,
    target,

    sideOffset = DEFAULT_SIDE_OFFSET,
    side = DEFAULT_SIDE,

    alignOffset = DEFAULT_ALIGN_OFFSET,
    align = DEFAULT_ALIGN,

    collisionPadding = DEFAULT_COLLISION_PADDING,
    collisionBoundary = DEFAULT_COLLISION_BOUNDARY,
    avoidCollisions = DEFAULT_AVOID_COLLISIONS,
    constrainSize = DEFAULT_CONSTRAIN_SIZE,

    sticky = DEFAULT_STICKY,
    hideWhenDetached = false,
}: UsePositionOptions): UsePositionReturn {
    const [maxDimensions, setMaxDimensions] = useState<Partial<MaxSize>>({});
    const [position, setPosition] = useState<Position | null>(null);
    const [actualAlign, setActualAlign] = useState<Align>(align);
    const [actualSide, setActualSide] = useState<Side>(side);
    const [isReferenceHidden, setIsReferenceHidden] = useState(false);

    const naturalSizeRef = useRef<{ width: number; height: number } | null>(null);
    const collisionBoundaryRef = useRef(collisionBoundary);
    collisionBoundaryRef.current = collisionBoundary;

    const updatePosition = useCallback((recalculateNaturalSize: boolean = false) => {
        const content = target.current;
        if (!content) return;

        let relativeToRect: DOMRect;
        let isMouseEvent: boolean;

        // Type guard to check if relativeTo is a MouseEvent
        if (relativeTo && 'clientX' in relativeTo && 'clientY' in relativeTo) {
            // For mouse event positioning (context menus), create a synthetic rect at cursor position
            relativeToRect = new DOMRect(relativeTo.clientX, relativeTo.clientY, 0, 0);
            isMouseEvent = true;
        } else {
            // For element-based positioning (dropdowns), use the element's bounding rect
            const trigger = (relativeTo as RefObject<HTMLElement | null>)?.current;
            if (!trigger) return;
            relativeToRect = trigger.getBoundingClientRect();
            isMouseEvent = false;
        }
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        const viewportRect = {
            top: 0,
            left: 0,
            right: viewportWidth,
            bottom: viewportHeight,
        }

        const boundaryElements = Array.isArray(collisionBoundaryRef.current)
            ? collisionBoundaryRef.current
            : [collisionBoundaryRef.current];

        const boundaryRects = boundaryElements
            .filter((el): el is Element => el !== null)
            .map(el => el.getBoundingClientRect());

        const collisionRect = boundaryRects.reduce((acc, rect) => ({
            top: Math.max(acc.top, rect.top),
            left: Math.max(acc.left, rect.left),
            right: Math.min(acc.right, rect.right),
            bottom: Math.min(acc.bottom, rect.bottom),
        }), viewportRect);

        const contentSize = recalculateNaturalSize || !naturalSizeRef.current
            ? measureNaturalContentSize(content)
            : naturalSizeRef.current;

        if (recalculateNaturalSize) naturalSizeRef.current = contentSize;

        const padding = normalizePadding(collisionPadding);

        const result = getPosition({
            relativeToRect,
            contentSize,

            sideOffset,
            side,

            alignOffset,
            align,

            avoidCollisions,
            constrainSize,
            padding,
            collisionRect,
            sticky,
        });

        // For mouse event positioning, reference is never hidden
        const finalIsReferenceHidden = isMouseEvent ? false : result.isReferenceHidden;

        setPosition({ top: result.top, left: result.left });
        setActualSide(result.actualSide);
        setActualAlign(result.actualAlign);
        setIsReferenceHidden(finalIsReferenceHidden);

        if (recalculateNaturalSize) setMaxDimensions({
            maxHeight: result.maxHeight,
            maxWidth: result.maxWidth,
        });
    }, [
        relativeTo,
        target,

        sideOffset,
        side,

        alignOffset,
        align,

        collisionPadding,
        avoidCollisions,
        constrainSize,

        sticky,
    ]);

    useLayoutEffect(() => {
        if (!isTargetRendered) return;
        // Reset cached measurements and dimensions to ensure fresh calculation
        naturalSizeRef.current = null;
        setMaxDimensions({}); // Clear maxHeight to allow unconstrained measurement
        updatePosition(true);
    }, [isTargetRendered, updatePosition]);

    useEffect(() => {
        if (!isTargetRendered) return;

        const handleScroll = () => updatePosition(false);

        const handleResize = () => {
            naturalSizeRef.current = null;
            updatePosition(true);
        }

        window.addEventListener("scroll", handleScroll, true);
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("scroll", handleScroll, true);
            window.removeEventListener("resize", handleResize);
        }

    }, [isTargetRendered, updatePosition]);

    const shouldHide = hideWhenDetached && isReferenceHidden;

    return {
        top: position?.top ?? 0,
        left: position?.left ?? 0,
        actualSide,
        actualAlign,
        maxHeight: maxDimensions.maxHeight,
        maxWidth: maxDimensions.maxWidth,
        updatePosition,
        isPositioned: position !== null,
        isReferenceHidden: shouldHide,
    }
}

// ---------------------------------------------------------------------------------------------------- //

export {
    usePosition,

    type UsePositionOptions,
    type UsePositionReturn,
    type Side,
    type Align,
    type Sticky,
    type Boundary,
    type Padding,
    type ExplicitPadding,
    type Size,
    type MaxSize,
    type Position,
    type PositionResult,
}

// ---------------------------------------------------------------------------------------------------- //