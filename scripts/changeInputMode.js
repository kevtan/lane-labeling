function changeInputMode(value) {
    state.input_canvas.__eventListeners = {} // TODO: Fix, hacky
    window.onkeypress = null;
    state.input_canvas.isDrawingMode = false;
    if (value == 'pan') return;
    else if (value == 'poly') enablePolyDrawing();
    else if (value == 'rect') enableRectDrawing();
    else enableLineDrawing(value);
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
    state.input_canvas.on("mouse:down", e => {
        const location = e.pointer;
        const RADIUS = 2;
        state.user_input.polygon.push(new fabric.Circle({
            left: location.x - RADIUS,
            top: location.y - RADIUS,
            radius: RADIUS,
            fill: 'red',
            hasControls: false
        }));
        state.input_canvas.add(...state.user_input.polygon);
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
            state.input_canvas.add(...state.user_input.polygon);
        }
    }
}

function enableCursorLine(mouse_event) {
    const canvas = state.input_canvas;
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

function enableRectDrawing() {
    const canvas = state.input_canvas;
    canvas.on("mouse:down", startRect);
    canvas.on("mouse:up", endRect);
    window.onkeypress = e => {
        const key = e.key;
        if (key == 'q') state.rect_cancelled = true;
        else if (key == 'Enter') {
            const snapshot = takeSnapshot();
            const rrect = frect2crect(state.last_rectangle);
            state.gc_result = rrectGrabCut(snapshot, rrect);
            snapshot.delete();
            // TODO: simply have an "render results" function that extracts fg points of mask and then renders them on input and extracted
            const mask_copy = state.gc_result.mask.clone();
            state.gc_result.fg_points = extractMaskPoints(mask_copy, isForeground);
            updateMatrix(mask_copy, state.gc_result.fg_points, [255]);
            cv.imshow("extracted", mask_copy);
            mask_copy.delete();
        }
    };
    // turn on auxiliary lines
    canvas.on("mouse:move", enableCursorLine);
}

function enableLineDrawing(color) {
    const canvas = state.input_canvas;
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