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
    crect.size.width = frect.width * frect.scaleX;
    crect.size.height = frect.height * frect.scaleY;
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