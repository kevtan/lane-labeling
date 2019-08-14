/*
@brief Converts a fabric rectangle into an cv.RotatedRect.
@param frect (fabric.Rect)
@return (cv.RotatedRect)
*/
function frect2crect(frect) {
    return new cv.RotatedRect(
        frect.getCenterPoint(),
        new cv.Size(frect.width, frect.height),
        frect.angle
    );
}

/*
@brief Converts a cv.RotatedRect into a fabric rectangle.
@param crect (cv.RotatedRect)
@return (fabric.Rect)
*/
function crect2frect(crect) {
    const rect = new fabric.Rect({
        centeredRotation: true,
        left: crect.center.x - crect.size.width / 2,
        top: crect.center.y - crect.size.height / 2,
        width: crect.size.width,
        height: crect.size.height,
        stroke: "fuchsia",
        fill: "transparent"
    });
    rect.rotate(crect.angle);
    return rect;
}

/*
@brief Draws a rotated rectangle onto a matrix
@param matrix (cv.Mat)
@param rrect (cv.RotatedRect)
@param color (cv.Scalar)
*/
function plotRotatedRect(matrix, rrect, color, width = 1) {
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
@brief Converts an array of fabric.Circle objects into an OpenCV matrix.
@param fcircles (fabric.Circle[])
@return matrix (cv.Mat | type cv.CV_32SC2)
*/
function fcircles2cmatrix(fcircles) {
    const points = []
    fcircles.map(
        fcircle => points.push(
            fcircle.left + fcircle.radius,
            fcircle.top + fcircle.radius
        )
    );
    return cv.matFromArray(points.length / 2, 1, cv.CV_32SC2, points);
}

/*
@brief Extract pixel locations in matrix that satisfy a predicate.
@param matrix (cv.Mat)
@param pred (function)
@return (cv.Point[])
*/
function extractPoints(matrix, pred) {
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
@brief Updates an OpenCV matrix at given points to be a certain value.
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
@brief Updates an OpenCV matrix at given points to have a certain transparency level (alpha value).
@param matrix (cv.Mat | type cv.CV_**C4)
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
function computeGrabcut(maskgc = false) {
    const nImage = getImageNo();
    if (maskgc) {
        maskGrabCut(
            cache[nImage].image,
            result.mask,
            result.bgdModel,
            result.fgdModel
        );
    } else {
        const rrect = frect2crect(input.data);
        if (result) {
            result.mask.delete();
            result.fgdModel.delete();
            result.bgdModel.delete();
        }
        result = rrectGrabCut(cache[nImage].image, rrect);
    }
    result.points = extractPoints(
        result.mask,
        pixel => pixel[0] == cv.GC_FGD || pixel[0] == cv.GC_PR_FGD
    );
    const size = result.mask.size();
    const foreground = new cv.Mat.zeros(size.height, size.width, cv.CV_8UC1);
    updateMatrix(foreground, result.points, [255]);
    cv.imshow("extracted", foreground);
    foreground.delete();
}