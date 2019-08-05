const rect_params = {
    stroke: 'blue',
    strokeWidth: 1,
    fill: 'rgba(0, 0, 0, 0)'
}

function hideLastRectangle() {
    const rect_num = state.rectangles.length;
    state.input_canvas.remove(state.rectangles[rect_num - 1]);
}

function showLastRectangle() {
    const rect_num = state.rectangles.length;
    state.input_canvas.add(state.rectangles[rect_num - 1]);
}

function startRect(mouse_event) {
    state.rect_cancelled = false;
    hideLastRectangle();
    rectangle = new fabric.Rect(rect_params);
    const location = mouse_event.pointer;
    rectangle.left = Math.round(location.x);
    rectangle.top = Math.round(location.y);
    state.rectangles.push(rectangle);
}

function endRect(mouse_event) {
    if (state.rect_cancelled || !finishRectangle(mouse_event)) return;
    // perform rectangular grabcut
    const rectangle = state.rectangles.pop();
    const rect = new cv.Rect({
        x: rectangle.left,
        y: rectangle.top,
        width: rectangle.width,
        height: rectangle.height
    });
    state.rectangles.push(rectangle);
    const image_matrix = readImage('input');
    state.gc_result = rectGrabCut(image_matrix, rect);
    state.gc_result.fg_points = extractMaskPoints(state.gc_result.mask, isForeground);
    // display results on extracted canvas
    const mask_copy = state.gc_result.mask.clone();
    updateMatrix(mask_copy, state.gc_result.fg_points, [255]);
    cv.imshow("extracted", mask_copy);
    mask_copy.delete();
    showLastRectangle();
}

/*
@brief Finishes the most recently started rectangle object.
@param mouse_event (Mouse Event)
@return success (bool)
*/
function finishRectangle(mouse_event) {
    const rectangle = state.rectangles.pop();
    const location = mouse_event.pointer;
    let width = Math.round(location.x) - rectangle.left;
    let height = Math.round(location.y) - rectangle.top;
    if (width == 0 || height == 0) return false;
    if (width < 0) {
        rectangle.left = rectangle.left + width;
        width = -width;
    }
    if (height < 0) {
        rectangle.top = rectangle.top + height;
        height = -height;
    }
    rectangle.width = width;
    rectangle.height = height;
    state.rectangles.push(rectangle);
    return true;
}

/*
@brief Cancels current rectangle if user presses 'q'
*/
function rectKeyPressHandler(key_event) {
    state.rect_cancelled = key_event.key == 'q';
}