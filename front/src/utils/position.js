// Determines if a position is under - resp. over - another
export const isUnder = (positionA, positionB) => {
    if (isHigher(positionA, positionB)) {
        return false;
    }
    return match(positionA, positionB);
};
export const isOver = (positionA, positionB) => {
    if (!isHigher(positionA, positionB)) {
        return false;
    }
    return match(positionA, positionB);
};

// Compare z-index of 2 positions
export const isHigher = (positionA, positionB) => {
    return positionA.zIndex > positionB.zIndex;
};

// Determine if 2 positions match (even if z-index are different)
// J4B: accelerate
export const match = (positionA, positionB) => {
    const [ax0, ax1] =
        positionA?.left !== undefined
            ? [positionA.left, positionA.left + positionA.width]
            : [positionA.right - positionA.width, positionA.right];
    const [bx0, bx1] =
        positionB?.left !== undefined
            ? [positionB.left, positionB.left + positionB.width]
            : [positionB.right - positionB.width, positionB.right];
    if ((ax0 > bx0 || bx0 >= ax1) && (bx0 > ax0 || ax0 >= bx1)) {
        return false;
    }

    const [ay0, ay1] =
        positionA?.top !== undefined
            ? [positionA.top, positionA.top + positionA.height]
            : [positionA.bottom - positionA.height, positionA.bottom];
    const [by0, by1] =
        positionB?.top !== undefined
            ? [positionB.top, positionB.top + positionB.height]
            : [positionB.bottom - positionB.height, positionB.bottom];
    if ((ay0 > by0 || by0 >= ay1) && (by0 > ay0 || ay0 >= by1)) {
        return false;
    }

    return true;
};
export const include = (positionA, positionB) => {
    let a = {
        x0: positionA?.left
            ? positionA?.left
            : positionA?.right - positionA?.width,
        x1: positionA?.left
            ? positionA?.left + positionA?.width
            : positionA?.right,
        y0: positionA?.top
            ? positionA?.top
            : positionA?.bottom - positionA?.height,
        y1: positionA?.top
            ? positionA?.top + positionA?.height
            : positionA?.bottom,
    };

    let b = {
        x0: positionB?.left
            ? positionB?.left
            : positionB?.right - positionB?.width,
        x1: positionB?.left
            ? positionB?.left + positionB?.width
            : positionB?.right,
        y0: positionB?.top
            ? positionB?.top
            : positionB?.bottom - positionB?.height,
        y1: positionB?.top
            ? positionB?.top + positionB?.height
            : positionB?.bottom,
    };

    let bCa = a.x0 <= b.x0 && b.x1 < a.x1 && a.y0 <= b.y0 && b.y1 < a.y1;
    let aCb = b.x0 <= a.x0 && a.x1 < b.x1 && b.y0 <= a.y0 && a.y1 < b.y1;

    return bCa || aCb;
};

export const neighbours = (
    node,
    otherNodes,
    { snapRadius, snapVerticalAxis, snapHorizontalAxis, snapBorder }
) => {
    let left = Infinity;
    let top = Infinity;

    // Center of node
    let nodeCenter = {
        left: node?.left + node?.width / 2,
        top: node?.top + node?.height / 2,
    };

    for (let neighbour of otherNodes) {
        // Neighbour center
        let neighbourCenter = {
            left: neighbour?.left + neighbour?.width / 2,
            top: neighbour?.top + neighbour?.height / 2,
        };

        if (
            node?.top <=
                (snapRadius || 0) + neighbour?.top + neighbour?.height && // top node < bottom neighbour
            neighbour?.top <= (snapRadius || 0) + node?.top + node?.height // top neighbour < bottom node
        ) {
            if (snapBorder) {
                left = minAbsoluteValue(left, node?.left - neighbour?.left); // left node, left neighbour
                left = minAbsoluteValue(
                    left,
                    node?.left - neighbour?.left - neighbour?.width
                ); // left node, right neighbour
                left = minAbsoluteValue(
                    left,
                    node?.left + node?.width - neighbour?.left
                ); // right node, left neighbour
                left = minAbsoluteValue(
                    left,
                    node?.left +
                        node?.width -
                        neighbour?.left -
                        neighbour?.width
                ); // right node, right neighbour
            }
            if (snapVerticalAxis) {
                left = minAbsoluteValue(
                    left,
                    nodeCenter?.left - neighbourCenter?.left
                ); // center node, center neighbour
            }
        }

        if (
            node?.left <=
                (snapRadius || 0) + neighbour?.left + neighbour?.width && // left node < right neighbour
            neighbour?.left <= (snapRadius || 0) + node?.left + node?.width // left neighbour < right node
        ) {
            if (snapBorder) {
                top = minAbsoluteValue(top, node?.top - neighbour?.top); // top node, top neighbour
                top = minAbsoluteValue(
                    top,
                    node?.top - neighbour?.top - neighbour?.height
                ); // top node, bottom neighbour
                top = minAbsoluteValue(
                    top,
                    node?.top + node?.height - neighbour?.top
                ); // bottom node, top neighbour
                top = minAbsoluteValue(
                    top,
                    node?.top +
                        node?.height -
                        neighbour?.top -
                        neighbour?.height
                ); // bottom node, bottom neighbour
            }
            if (snapHorizontalAxis) {
                top = minAbsoluteValue(
                    top,
                    nodeCenter?.top - neighbourCenter?.top
                ); // middle node, middle neighbour
            }
        }

        // if( snapCenter ){
        //     if(
        //         Math.pow( nodeCenter?.left - neighbourCenter?.left, 2 ) +
        //         Math.pow( nodeCenter?.top  - neighbourCenter?.top , 2 ) < Math.pow( snapRadius || 0, 2 )
        //     ){
        //         left = minAbsoluteValue( left, nodeCenter?.left - neighbourCenter?.left );
        //         top  = minAbsoluteValue( top , nodeCenter?.top  - neighbourCenter?.top  );
        //     }
        // }
    }

    function minAbsoluteValue(a, b) {
        //sort by absolute value
        if (Math.abs(a) < Math.abs(b)) {
            return a;
        } else {
            return b;
        }
    }

    // Set snap to null, if distance is greater than snapRadius threshold
    left = Math.abs(left) < snapRadius ? left : 0;
    top = Math.abs(top) < snapRadius ? top : 0;

    return { left, top };
};

// Add center to the position
export const addCenter = (position) => {
    position.center = {
        left: position?.left + position?.width / 2,
        top: position?.top + position?.height / 2,
    };
    return position;
};

// Convert an event position into a layer position
export const eventToLayer = (evt, panzoom) => {
    if (evt.originalEvent) {
        evt = evt.originalEvent;
    }

    const eventName = evt?.constructor?.name;
    if (["MouseEvent", "ClipboardEvent", "DragEvent"].includes(eventName)) {
        const position = payload(evt);
        position.key = 1;
        return [position];
    }
    if (["PointerEvent"].includes(eventName)) {
        let allEvents = evt.getCoalescedEvents();
        if (!allEvents.length) {
            allEvents = [evt];
        }
        return allEvents
            .map((pointer) => {
                const position = payload(pointer);
                position.key = pointer.pointerId;
                position.timeStamp = pointer.timeStamp;
                return position;
            })
            .sort((a, b) => b.timeStamp - a.timeStamp); // descending timestamp sort, so 1st event is the last one
    }
    if (["TouchEvent"].includes(eventName)) {
        return Object.values(evt.changedTouches).map((touch) => {
            const position = payload(touch);
            position.key = touch.identifier;
            return position;
        });
    }

    function payload(evt) {
        let left = evt.pageX;
        let top = evt.pageY;

        // Corner top left of panzoom wrapper
        left -= panzoom.scene?.left;
        top -= panzoom.scene?.top;

        // Offset panzoom
        if (panzoom.x) {
            left -= panzoom.x;
        }
        if (panzoom.y) {
            top -= panzoom.y;
        }

        // Scale
        if (panzoom.scale) {
            left /= panzoom.scale;
            top /= panzoom.scale;
        }

        return { left, top };
    }
};

// Get coordinates of the circumscribed rectangle
export const getRect = (positions) => {
    const x0 = Math.min(...positions.map((x) => x.data?.left));
    const x1 = Math.max(...positions.map((x) => x.data?.left + x.data?.width));
    const y0 = Math.min(...positions.map((x) => x.data?.top));
    const y1 = Math.max(...positions.map((x) => x.data?.top + x.data?.height));

    return {
        left: x0,
        right: x1,
        width: x1 - x0,
        top: y0,
        bottom: y1,
        height: y1 - y0,
    };
};

// Determines if 2 top-left corner are different, resp. exactly the same
export const originAreDifferent = (positionA, positionB) => {
    return (
        positionA?.left !== positionB?.left ||
        positionA?.top !== positionB?.top ||
        positionA?.width !== positionB?.width ||
        positionA?.height !== positionB?.height
    );
};
export const originAreEqual = (positionA, positionB) => {
    return !originAreDifferent(positionA, positionB);
};

// Determines if 2 positions'size are different, resp. exactly the same
export const sizeAreDifferent = (positionA, positionB) => {
    return (
        positionA?.width !== positionB?.width ||
        positionA?.height !== positionB?.height
    );
};
export const sizeAreEqual = (positionA, positionB) => {
    return !sizeAreDifferent(positionA, positionB);
};

// Retrieves the distance between the centers of 2 positions
export const distance = (positionA, positionB) => {
    const x =
        positionA.left +
        (positionA.width || 0) / 2 -
        (positionB.left + (positionB.width || 0) / 2);
    const y =
        positionA.top +
        (positionA.height || 0) / 2 -
        (positionB.top + (positionB.height || 0) / 2);
    return Math.sqrt(x * x + y * y);
};

export default {
    isOver,
    isUnder,
    match,
    include,
    isHigher,
    neighbours,
    addCenter,
    eventToLayer,
    getRect,
    originAreDifferent,
    originAreEqual,
    sizeAreDifferent,
    sizeAreEqual,
    distance,
};
