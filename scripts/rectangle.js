// rectangle drawing settings
const rect_params = {
    stroke: 'blue',
    strokeWidth: 1,
    fill: 'rgba(0, 0, 0, 0)'
}

// rectangle that event handlers will modify
let rectangle = new fabric.Rect(rect_params);

// start the rectangle
function startRect(mouse_event) {
    const location = mouse_event.pointer;
    rectangle.left = Math.round(location.x);
    rectangle.top = Math.round(location.y);
}

// end the rectangle
function endRect(mouse_event) {
    const location = mouse_event.pointer;
    rectangle.width = Math.round(location.x - rectangle.left);
    rectangle.height = Math.round(location.y - rectangle.top);
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
    fg_points = extractMaskPoints(result.mask, isForeground);
    const copy = result.mask.clone();
    updateMatrix(copy, fg_points, [255])
    cv.imshow("extracted", copy);
    copy.delete();
}