function changeButton(value) {
    state.input_canvas.__eventListeners = {} // TODO: Fix, hacky
    window.onkeypress = null;
    if (value == 'pan') {
        window.onkey
        return;
    } else if (value == 'rect') {
        state.input_canvas.isDrawingMode = false;
        state.input_canvas.on("mouse:down", startRect);
        state.input_canvas.on("mouse:up", endRect);
        window.onkeypress = rectKeyPressHandler;
    } else {
        input_canvas.isDrawingMode = true;
        const circleBrush = new fabric.PencilBrush(input_canvas);
        circleBrush.width = 3;
        circleBrush.color = value;
        input_canvas.freeDrawingBrush = circleBrush;
        input_canvas.on("mouse:up", _ => {
            // step 1: extract out points
            const points = circleBrush._points;
            // step 2: draw points onto mask
            const pixel_value = new cv.Scalar(value == 'green' ? cv.GC_FGD : cv.GC_BGD);
            for (let i = 0; i < points.length - 1; i++) {
                const start = points[i];
                const end = points[i + 1];
                cv.line(state.last_gc_result.mask, start, end, pixel_value);
            }
            // step 3: invoke mask grabcut
            state.last_gc_result = maskGrabCut(
                cv_image,
                state.last_gc_result.mask,
                state.last_gc_result.bgdModel,
                state.last_gc_result.fgdModel
            );
            // step 4: render the results
            fg_points = extractMaskPoints(state.last_gc_result.mask, isForeground);
            updateMatrix(state.last_gc_result.mask, fg_points, [255]);
            cv.imshow("extracted", state.last_gc_result.mask);
        });
    }
}