/*
@brief Read an <img> or <canvas> element as 3-channel OpenCV matrix.
@param img (HTMLCanvasElement, canvas ID, HTMLImageElement, or image ID)
@return (cv.Mat | type cv.CV_8UC3)
*/
function readImage(img) {
    const img_mat = cv.imread(img);
    cv.cvtColor(img_mat, img_mat, cv.COLOR_RGBA2RGB);
    return img_mat;
}

/*
@brief Extracts
@return (cv.Mat | type cv.CV_8UC3)
*/
function takeSnapshot() {
    input_canvas.remove(...input_canvas._objects);
    input_canvas.renderAll();
    const snapshot = readImage("input");
    // resize due to cv.imread quirk
    const dsize = new cv.Size(input_canvas.width, input_canvas.height);
    cv.resize(snapshot, snapshot, dsize);
    input_canvas.add(...input_canvas._objects);
    return snapshot;
}

/*
@brief Converts a fabric rectangle into an cv.RotatedRect.
@param frect (fabric.Rect)
@return (cv.RotatedRect)
*/
function frect2crect(frect) {
    const vertices = frect.aCoords;
    const crect = new cv.RotatedRect();
    crect.center.x = (vertices.tl.x + vertices.br.x) / 2;
    crect.center.y = (vertices.tl.y + vertices.br.y) / 2;
    crect.size.width = frect.getScaledWidth();
    crect.size.height = frect.getScaledHeight();
    crect.angle = frect.angle;
    return crect;
}

/*
@brief Draws a rotated rectangle onto a matrix
@param matrix (cv.Mat)
@param rrect (cv.RotatedRect)
@param color (cv.Scalar)
*/
function drawRotatedRect(matrix, rrect, color, width = 1) {
    const points = cv.rotatedRectPoints(rrect);
    const first = points[0];
    points.push(first);
    for (let i = 0; i < points.length - 1; i++) {
        const [start, end] = points.slice(i, i + 2);
        cv.line(matrix, start, end, color, width);
    }
}

/*
@brief Plots a series of line segments that make up a path onto a matrix.
@param matrix (cv.Mat)
@param points (Array)
@param color (cv.Scalar)
*/
function plotPath(matrix, points, color, thickness) {
    for (let i = 0; i < points.length - 1; i++) {
        const [start, end] = points.slice(i, i + 2);
        cv.line(matrix, start, end, color, thickness);
    }
}

/*
@brief Converts an array of fabric.Circle objects into an array of cv.Point objects.
@param fcircles (fabric.Circle[])
*/
function fcircles2points(fcircles) {
    return fcircles.map(fcircle => new cv.Point(
        fcircle.left + fcircle.radius,
        fcircle.top + fcircle.radius
    ));
}

/*
@brief Returns whether or not a value represents grabcut foreground
@param value (number)
@return bool
*/
function isForeground(value) {
    return value[0] == cv.GC_FGD || value[0] == cv.GC_PR_FGD;
}

/*
@brief Extract pixel locations in matrix that satisfy a predicate.
@param matrix (cv.Mat)
@param pred (function)
@return (Array)
*/
function extractMatrixPoints(matrix, pred) {
    const points = [];
    for (let row = 0; row < matrix.rows; row++) {
        for (let col = 0; col < matrix.cols; col++) {
            const pixel_value = matrix.ucharPtr(row, col);
            if (pred(pixel_value)) points.push([row, col]);
        }
    }
    return points;
}

/*
@brief Updates an OpenCV matrix at given points to be a certain value
@param matrix (cv.Mat)
@param points (Array)
@param value (Array)
*/
function updateMatrix(matrix, points, value) {
    const nChannels = value.length;
    points.map(
        point => {
            for (let channel = 0; channel < nChannels; channel++) {
                matrix.ucharPtr(point[0], point[1])[channel] = value[channel];
            }
        }
    );
}

/*
@brief Updates an OpenCV matrix at given points to have a certain transparency level (alpha value)
@param matrix (cv.Mat)
@param points (Array)
@param alpha (number)
*/
function updateAlpha(matrix, points, alpha) {
    const ALPHA_CHANNEL = 3;
    points.map(
        point => {
            matrix.ucharPtr(point[0], point[1])[ALPHA_CHANNEL] = alpha;
        }
    );
}

/*
@brief Given the current state of the canvas (background image, rectangle/polygon,
    correction lines, etc.), compute the grabcut result and render it.
*/
function computeGrabcut() {
    const snapshot = takeSnapshot();
    if (state.input.rectangle == null) {
        // wait until polygon.js is done
    } else {
        const rrect = frect2crect(state.input.rectangle);
        if (state.result) {
            state.result.mask.delete();
            state.result.fgdModel.delete();
            state.result.bgdModel.delete();
        }
        state.result = rrectGrabCut(snapshot, rrect);
    }
    snapshot.delete();
    const size = state.result.mask.size();
    const foreground = new cv.Mat.zeros(size.height, size.width, cv.CV_8UC1);
    state.result.fg_points = extractMatrixPoints(state.result.mask, isForeground);
    updateMatrix(foreground, state.result.fg_points, [255]);
    cv.imshow("extracted", foreground);
    foreground.delete();
}