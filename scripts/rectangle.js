// rectangle drawing settings
const rect_params = {
    stroke: 'blue',
    strokeWidth: 1,
    fill: 'rgba(0, 0, 0, 0)'
}

// rectangle that event handlers will modify
let rectangle;

// start the rectangle
function startRect(mouse_event) {
    // remove last rect
    input.remove(rectangle);
    // add a new rect
    rectangle = new fabric.Rect(rect_params);
    const location = mouse_event.pointer;
    rectangle.left = Math.round(location.x);
    rectangle.top = Math.round(location.y);
}

// end the rectangle
function endRect(mouse_event) {
    const location = mouse_event.pointer;
    rectangle.width = Math.round(Math.abs(location.x - rectangle.left));
    rectangle.height = Math.round(Math.abs(location.y - rectangle.top));
    // return prematurely if rectangle is invalid
    if (rectangle.width == 0 || rectangle.height == 0) return;
    // consider more situation
    if (location.x < rectangle.left && location.y < rectangle.top) {
        rectangle.left = Math.round(location.x);
        rectangle.top = Math.round(location.y);
    } else if (location.x < rectangle.left) {
        rectangle.left = Math.round(location.x);
        rectangle.top = Math.round(location.y - rectangle.height);
    } else if (location.y < rectangle.top) {
        rectangle.left = Math.round(location.x - rectangle.width);
        rectangle.top = Math.round(location.y);
    }
    // add rectangle to the fabric canvas
    input.add(rectangle);
    // perform rectangular grabcut
    const rect = new cv.Rect({
        x: rectangle.left,
        y: rectangle.top,
        width: rectangle.width,
        height: rectangle.height
    });
    result = rectGrabCut(cv_image, rect);
    const fg_points = extractMaskPoints(result.mask, isForeground);
    const copy = result.mask.clone();
    updateMask(copy, fg_points, 255);
    cv.imshow("extracted", copy);
    copy.delete();
}