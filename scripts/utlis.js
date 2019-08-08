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
@brief Takes a snapshot of the input canvas without any user input objects (rectangles, correction lines, polygon points, etc.)
@return (cv.Mat | type cv.CV_8UC3)
*/
function takeSnapshot() {
    // remove user input objects
    const canvas = state.input_canvas;
    const artifacts = state.user_input;
    canvas.remove(artifacts.rectangle, ...artifacts.polygon); // TODO: remove correction lines as well
    canvas.renderAll();
    // take the snapshot and resize (due to cv.imread quirk)
    const snapshot = readImage("input");
    const dsize = new cv.Size(canvas.width, canvas.height);
    cv.resize(snapshot, snapshot, dsize);
    // replace user input objects
    canvas.add(artifacts.rectangle, ...artifacts.polygon);
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
@brief Converts an array of fabric.Circle objects into an array of cv.Point objects.
@param fcircles (fabric.Circle[])
*/
function fcircles2points(fcircles) {
    return fcircles.map(fcircle => new cv.Point(
        fcircle.left + fcircle.radius,
        fcircle.top + fcircle.radius
    ));
}