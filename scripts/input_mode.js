/*
@brief Event handler for input mode buttons.
@param button (HTMLButtonElement)
*/
const setInputMode = button => {
    state.mode = button.innerText;
    updateInputMode();
}

/*
@brief Changes the input mode based on state.mode.
*/
const updateInputMode = _ => {
    input_canvas.__eventListeners = new Object();
    input_canvas.set('isDrawingMode', false);
    switch (state.mode) {
        case "Pan":
            break;
        case "Rectangle":
            input_canvas.on("mouse:down", startRect);
            input_canvas.on("mouse:up", endRect);
            break;
        case "Polygon":
        case "Green Line":
            enableLineDrawing('green');
            break;
        case "Red Line":
            enableLineDrawing('red');
            break;
    };
}

/*
@brief Starts creating a rectangle to render on the input canvas.
@param e (MouseEvent)
*/
const startRect = e => {
    if (input.rectangle) input_canvas.remove(input.rectangle);
    const location = e.pointer;
    input.rectangle = new fabric.Rect({
        stroke: "fuchsia",
        fill: "transparent",
        left: Math.round(location.x),
        top: Math.round(location.y)
    });
}

/*
@brief Ends creating a rectangle to render on the input canvas.
@param e (MouseEvent)
*/
const endRect = e => {
    const location = e.pointer;
    let width = Math.round(location.x) - input.rectangle.left;
    let height = Math.round(location.y) - input.rectangle.top;
    if (width == 0 || height == 0) return;
    if (width < 0) {
        input.rectangle.left = input.rectangle.left + width;
        width = -width;
    }
    if (height < 0) {
        input.rectangle.top = input.rectangle.top + height;
        height = -height;
    }
    input.rectangle.width = width;
    input.rectangle.height = height;
    input_canvas.add(input.rectangle);
}

/*
@brief Enables users to draw lines of a certain color that changes the grabcut mask.
@param color (String)
*/
function enableLineDrawing(color) {
    input_canvas.freeDrawingBrush.color = color;
    input_canvas.on('mouse:up', _ => {
        // prevent user from changing the path
        const path = input_canvas._objects.pop();
        path.set({
            selectable: false,
            hoverCursor: "crosshair"
        });
        input_canvas._objects.push(path);
        // plot the path on mask
        const value = color == 'green' ? new cv.Scalar(cv.GC_FGD) : new cv.Scalar(cv.GC_BGD);
        const points = input_canvas.freeDrawingBrush._points;
        for (let i = 0; i < points.length - 1; i++)
            cv.line(result.mask, points[i], points[i + 1], value, path.strokeWidth);
        computeGrabcut(true);
    });
    input_canvas.set('isDrawingMode', true);
}

function enablePolyDrawing() {
    input_canvas.on("mouse:down", e => {
        const location = e.pointer;
        const RADIUS = 2;
        state.user_input.polygon.push(new fabric.Circle({
            left: location.x - RADIUS,
            top: location.y - RADIUS,
            radius: RADIUS,
            fill: 'red',
            hasControls: false
        }));
        input_canvas.add(...state.user_input.polygon);
    });
    window.onkeypress = e => {
        if (e.key == 'Enter') {
            const snapshot = takeSnapshot();
            const points = fcircles2points(state.user_input.polygon);
            state.gc_result = polygonGrabCut(snapshot, points);
            snapshot.delete();
            const mask_copy = state.gc_result.mask.clone();
            state.gc_result.fg_points = extractMaskPoints(mask_copy, isForeground);
            updateMatrix(mask_copy, state.gc_result.fg_points, [255]);
            cv.imshow("extracted", mask_copy);
            mask_copy.delete();
            // replace relics
            input_canvas.add(...state.user_input.polygon);
        }
    }
}

function enableCursorLine(mouse_event) {
    const canvas = input_canvas;
    canvas.remove(canvas.lineX);
    canvas.remove(canvas.lineY);
    const lineType = {
        fill: 'red',
        stroke: 'red',
        strokeWidth: 1,
        selectable: false,
        evented: false,
    }
    const location = mouse_event.pointer;
    const width = canvas.width;
    const height = canvas.height;
    canvas.lineY = new fabric.Line([location.x, 0, location.x, height], lineType);
    canvas.lineX = new fabric.Line([0, location.y, width, location.y], lineType);
    canvas.add(canvas.lineX);
    canvas.add(canvas.lineY);
}