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
const DEFAULT_MIN_CONSTRAINED_HEIGHT = 100;
const DEFAULT_MIN_CONSTRAINED_WIDTH = 100;
const DEFAULT_STICKY: Sticky = "partial";
const DEFAULT_COLLISION_BOUNDARY: Boundary = [];

const OPPOSITE_SIDE: Record<Side, Side> = {
    top: "bottom",
    bottom: "top",
    left: "right",
    right: "left",
}

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

    minConstrainedHeight?: number;
    minConstrainedWidth?: number;
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
    contentSize: Size;
    availableSpace: ExplicitPadding;
    preferredSide: Side;

    avoidCollisions: boolean;
}

const getOptimalSide = ({
    contentSize,
    availableSpace,
    preferredSide,
    avoidCollisions,
}: OptimalSideGetterParams): Side => {
    if (!avoidCollisions) return preferredSide;

    const vertical = isVerticalSide(preferredSide);
    const dimension = vertical ? contentSize.height : contentSize.width;
    const preferredSpace = availableSpace[preferredSide];
    const oppositeSpace = availableSpace[OPPOSITE_SIDE[preferredSide]];

    if (dimension <= preferredSpace) return preferredSide;
    if (dimension <= oppositeSpace) return OPPOSITE_SIDE[preferredSide];

    return preferredSpace >= oppositeSpace
        ? preferredSide
        : OPPOSITE_SIDE[preferredSide];
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

    minHeight: number;
    minWidth: number;
}

const getMaxDimensions = ({
    availableSpace,
    constrainSize,
    side,
    minHeight,
    minWidth,
}: MaxDimensionsGetterParams): Partial<MaxSize> => {
    if (!constrainSize) return {}

    const vertical = isVerticalSide(side);
    const space = availableSpace[side];

    return vertical
        ? { maxHeight: Math.max(space, minHeight) }
        : { maxWidth: Math.max(space, minWidth) }
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

    minConstrainedHeight: number;
    minConstrainedWidth: number;
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
    minConstrainedHeight,
    minConstrainedWidth,
}: PositionGetterParams): PositionResult => {

    const availableSpace = getAvailableSpace({
        relativeToRect,
        sideOffset,
        padding,
        collisionRect,
    });

    const actualSide = getOptimalSide({
        preferredSide: side,
        avoidCollisions,
        availableSpace,
        contentSize,
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

    const finalPosition = (
        actualSide === "top" &&
        constrainSize &&
        contentSize.height > recalculatedSpace.top)
        ? { ...constrainedPosition, top: collisionRect.top + padding.top }
        : constrainedPosition;

    const maxDimensions = getMaxDimensions({
        side: actualSide,
        availableSpace: recalculatedSpace,
        constrainSize,
        minHeight: minConstrainedHeight,
        minWidth: minConstrainedWidth
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

    minConstrainedHeight = DEFAULT_MIN_CONSTRAINED_HEIGHT,
    minConstrainedWidth = DEFAULT_MIN_CONSTRAINED_WIDTH,
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
            ? { width: content.scrollWidth, height: content.scrollHeight }
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

            minConstrainedHeight,
            minConstrainedWidth,
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

        minConstrainedHeight,
        minConstrainedWidth,
    ]);

    useLayoutEffect(() => {
        if (!isTargetRendered) return;
        naturalSizeRef.current = null;
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