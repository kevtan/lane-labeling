const rect_params = {
    stroke: 'blue',
    strokeWidth: 1,
    fill: 'rgba(0, 0, 0, 0)'
}

function startRect(mouse_event) {
    state.rect_cancelled = false;
    // TODO: how to completely get rid of rectangle from memory?
    if (state.last_rectangle) state.input_canvas.remove(state.last_rectangle);
    state.last_rectangle = new fabric.Rect(rect_params);
    const location = mouse_event.pointer;
    state.last_rectangle.left = Math.round(location.x);
    state.last_rectangle.top = Math.round(location.y);
}

function endRect(mouse_event) {
    if (state.rect_cancelled || !finishRectangle(mouse_event)) return;
    state.input_canvas.add(state.last_rectangle);
}

/*
@brief Finishes the most recently started rectangle object.
@param mouse_event (Mouse Event)
@return success (bool)
*/
function finishRectangle(mouse_event) {
    const location = mouse_event.pointer;
    let width = Math.round(location.x) - state.last_rectangle.left;
    let height = Math.round(location.y) - state.last_rectangle.top;
    if (width == 0 || height == 0) return false;
    if (width < 0) {
        state.last_rectangle.left = state.last_rectangle.left + width;
        width = -width;
    }
    if (height < 0) {
        state.last_rectangle.top = state.last_rectangle.top + height;
        height = -height;
    }
    state.last_rectangle.width = width;
    state.last_rectangle.height = height;
    return true;
}