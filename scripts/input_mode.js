/*
@brief Changes the input mode.
@param mode (String)
*/
const setInputMode = mode => {
    state.mode = mode;
    // remove old event listeners
    const listeners = input_canvas.__eventListeners;
    delete listeners["mouse:down"];
    delete listeners["mouse:up"];
    delete listeners["mouse:dblclick"];
    input_canvas.set('isDrawingMode', false);
    // add new event listeners
    switch (mode) {
        case "Pan":
            break;
        case "Rectangle":
            input_canvas.remove(...input_canvas._objects);
            input.type = "Rectangle";
            input_canvas.on("mouse:down", startRect);
            input_canvas.on("mouse:up", endRect);
            break;
        case "Polygon":
            input_canvas.remove(...input_canvas._objects);
            input.type = "Polygon";
            input.data = [];
            input_canvas.on("mouse:down", placePoint);
            input_canvas.on("mouse:dblclick", endPolygon);
            break;
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
    input_canvas.remove(...input_canvas._objects);
    const location = e.absolutePointer;
    input.data = new fabric.Rect({
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
    const location = e.absolutePointer;
    let width = Math.round(location.x) - input.data.left;
    let height = Math.round(location.y) - input.data.top;
    if (width == 0 || height == 0) return;
    const rect = input.data;
    if (width < 0) {
        rect.left = rect.left + width;
        width = -width;
    }
    if (height < 0) {
        rect.top = rect.top + height;
        height = -height;
    }
    rect.width = width;
    rect.height = height;
    input_canvas.add(rect);
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
        const width = path.strokeWidth > 0 ? path.strokeWidth : 1;
        for (let i = 0; i < points.length - 1; i++)
            cv.line(result.mask, points[i], points[i + 1], value, path.strokeWidth);
        computeGrabcut(true);
    });
    input_canvas.set('isDrawingMode', true);
}

/*
@brief Adds a point to the current polygon.
*/
const placePoint = e => {
    // add new point to canvas
    const RADIUS = 2;
    const new_point = new fabric.Circle({
        left: e.absolutePointer.x - RADIUS,
        top: e.absolutePointer.y - RADIUS,
        radius: RADIUS,
        fill: 'fuchsia',
        hasControls: false
    });
    input.data.push(new_point);
    input_canvas.add(new_point);
}

/*
@brief Completes the current polygon.
*/
function endPolygon() {

}

function enablePolyDrawing() {
    input.data = new Array();
    input_canvas.on("mouse:down", e => {
        const location = e.pointer;
        const RADIUS = 2;
        input.data.push(new fabric.Circle({
            left: location.x - RADIUS,
            top: location.y - RADIUS,
            radius: RADIUS,
            fill: 'red',
            hasControls: false
        }));
        input_canvas.add(...input.data);
    });
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