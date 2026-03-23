// TODO: check if functions are real utils or may be dispatched to appropriate components

export const center = (
    positions,
    screenWidth,
    screenHeight,
    boardWidth,
    boardHeight,
    scaleBoundsMargin
) => {
    // Center board borders if positions doesnt contain any item
    if (positions.length < 1) {
        let scale = getMinScale(
            screenWidth,
            screenHeight,
            boardWidth,
            boardHeight,
            scaleBoundsMargin
        );
        return {
            x: (screenWidth - boardWidth * scale) * 0.5,
            y: (screenHeight - boardHeight * scale) * 0.5,
            scale,
        };
    }

    // Corner of used area
    let xMin = Infinity;
    let xMax = -Infinity;
    let yMin = Infinity;
    let yMax = -Infinity;
    for (let note of positions) {
        // Current note
        let x0 = note.data.left;
        let x1 = note.data.left + note.data.width;
        let y0 = note.data.top;
        let y1 = note.data.top + note.data.height;

        // Min - max
        xMin = x0 < xMin ? x0 : xMin;
        yMin = y0 < yMin ? y0 : yMin;
        xMax = x1 > xMax ? x1 : xMax;
        yMax = y1 > yMax ? y1 : yMax;
    }

    // Initial scale : minScale on used area
    let scale = getMinScale(
        screenWidth,
        screenHeight,
        xMax - xMin,
        yMax - yMin,
        scaleBoundsMargin
    );
    if (scale > 1) {
        scale = 1;
    }
    return {
        x: (screenWidth - (xMax + xMin) * scale) * 0.5,
        y: (screenHeight - (yMax + yMin) * scale) * 0.5,
        scale,
    };
};

export const replaceInBounds = (
    x,
    y,
    scale,
    screenWidth,
    screenHeight,
    boardWidth,
    boardHeight,
    scaleBoundsMargin
) => {
    // Min and max acceptable value for both x & y axis (to stay visible)
    const margin = {
        x: screenWidth * scaleBoundsMargin,
        y: screenHeight * scaleBoundsMargin,
    };
    const boundsOfWall = {
        xMax: 0 + margin.x, // left
        yMax: 0 + margin.y, // top
        xMin: screenWidth - boardWidth * scale - margin.x, // right
        yMin: screenHeight - boardHeight * scale - margin.y, // bottom
    };

    // Position where the board will be placed
    const position = {
        x: x,
        y: y,
        scale: scale,
    };

    // Stay on middle of horizontal axis, both right and left side are visible
    if (boundsOfWall.xMin > boundsOfWall.xMax) {
        position.x = (boundsOfWall.xMax + boundsOfWall.xMin) * 0.5;
    }

    // Move on right side
    else if (x < boundsOfWall.xMin) {
        position.x = boundsOfWall.xMin;
    }

    // Move on left side
    else if (x > boundsOfWall.xMax) {
        position.x = boundsOfWall.xMax;
    }

    // Stay on middle of vertical axis, both bottom and top side are visible
    if (boundsOfWall.yMin > boundsOfWall.yMax) {
        position.y = (boundsOfWall.yMax + boundsOfWall.yMin) * 0.5;
    }

    // Move on bottom side
    else if (y < boundsOfWall.yMin) {
        position.y = boundsOfWall.yMin;
    }

    // Move on top side
    else if (y > boundsOfWall.yMax) {
        position.y = boundsOfWall.yMax;
    }

    // Is a moveTo necessary ?
    position.outOfBounds = position.x !== x || position.y !== y;

    return position;
};

export const getScreenCenter = () => {
    return {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
    };
};

export const getMinScale = (
    screenWidth,
    screenHeight,
    boardWidth,
    boardHeight,
    scaleBoundsMargin
) => {
    const minScaleX = screenWidth / boardWidth;
    const minScaleY = screenHeight / boardHeight;
    const minScale = minScaleX < minScaleY ? minScaleX : minScaleY;
    const minScaleWithMargin = minScale * (1 - scaleBoundsMargin);
    return minScaleWithMargin;
};

export const getScreenPosition = (x, y, scale, screenWidth, screenHeight) => {
    return {
        left: (0 - x) / scale,
        top: (0 - y) / scale,
        right: (screenWidth - x) / scale,
        bottom: (screenHeight - y) / scale,
        width: screenWidth / scale,
        height: screenHeight / scale,
    };
};

export default {
    center: center,
    replaceInBounds: replaceInBounds,
    getScreenCenter: getScreenCenter,
    getMinScale: getMinScale,
    getScreenPosition: getScreenPosition,
};
