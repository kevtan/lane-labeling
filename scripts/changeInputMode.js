function changeInputMode(value) {
    input_canvas.__eventListeners = {} // TODO: Fix, hacky
    input_canvas.isDrawingMode = false;
    if (value == 'pan') return;
    else if (value == 'poly') enablePolyDrawing();
    else if (value == 'rect') {
        input_canvas.on("mouse:down", startRect);
        input_canvas.on("mouse:up", endRect);
    } else enableLineDrawing(value);
}

/*
@brief Starts creating a rectangle to render on the input canvas.
@param (MouseEvent)
*/
function startRect(mouse_event) {
    let input = state.input;
    if (input.rectangle) input_canvas.remove(input.rectangle);
    input.rectangle = new fabric.Rect({
        stroke: 'blue',
        fill: 'rgba(0, 0, 0, 0)'
    });
    const location = mouse_event.pointer;
    input.rectangle.left = Math.round(location.x);
    input.rectangle.top = Math.round(location.y);
}

/*
@brief Ends creating a rectangle to render on the input canvas.
@param (MouseEvent)
*/
function endRect(mouse_event) {
    const rect = state.input.rectangle;
    const location = mouse_event.pointer;
    let width = Math.round(location.x) - rect.left;
    let height = Math.round(location.y) - rect.top;
    if (width == 0 || height == 0) return;
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

// const PolygonPoint = (thisArg, left, top) => {
//     return fabric.Circle.bind(thisArg, {
//         left: left - RADIUS,
//         top: top - RADIUS,
//         radius: radius,
//         // stroke: 'red',
//         // fill: 'red',
//         hasControls: false
//     });
// };

// class PolygonPoint extends fabric.Circle {

//     RADIUS = 2;

//     constructor(left, top) {
//         super({
//             left: left - this.RADIUS,
//             top: top - this.RADIUS,
//             hasControls: false
//         })
//     }
// }

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

function enableLineDrawing(color) {
    canvas.freeDrawingBrush.color = color;
    canvas.isDrawingMode = true;
    canvas.on("mouse:up", _ => {
        const lines = state.adjustment_lines;
        const points = canvas.freeDrawingBrush._points;
        points.width = canvas.freeDrawingBrush.width;
        if (color == 'green') lines.foreground.push(points);
        else lines.background.push(points);
        updateGrabcut();
    });
}

function updateGrabcut() {
    const image_mat = readImage('input');
    const mask_copy = state.gc_result.mask.clone();
    const lines = state.adjustment_lines;
    lines.foreground.map(path => plotPath(mask_copy, path, new cv.Scalar(cv.GC_FGD), path.width));
    lines.background.map(path => plotPath(mask_copy, path, new cv.Scalar(cv.GC_BGD), path.width));
    const temp_result = maskGrabCut(
        image_mat,
        mask_copy,
        state.gc_result.bgdModel,
        state.gc_result.fgdModel
    );
    const fg_points = extractMaskPoints(mask_copy, isForeground);
    updateMatrix(mask_copy, fg_points, [255]);
    cv.imshow("extracted", mask_copy);
}