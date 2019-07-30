/*
@brief Read an <img> or <canvas> element as OpenCV matrix.
@param img (HTMLCanvasElement, canvas ID, HTMLImageElement, or image ID)
@return (cv.Mat | type cv.CV_8UC3)
*/
function readImage(img) {
    const img_mat = cv.imread(img)
    cv.cvtColor(img_mat, img_mat, cv.COLOR_RGBA2RGB)
    return img_mat
}

/*
@brief Extract a rectangular ROI from an image
@param img (cv.Mat | type cv.CV_8UC3)
@param rect (cv.Rect)
@return (object with fields: position and roi)
@note position: (cv.Rect)
      roi: (cv.Mat | type cv.CV_8UC3)
*/
function extractRectFromImage(img, rect) {
    const { width, height } = img.size()
    y_i = Math.max(0, rect.y)
    y_f = Math.min(height, rect.y + rect.height)
    x_i = Math.max(0, rect.x)
    x_f = Math.min(width, rect.x + rect.width)
    const expanded = new cv.Rect(x_i, y_i, x_f - x_i, y_f - y_i)
    return {
        "position": expanded,
        "roi": img.roi(expanded)
    }
}

/*
@brief Extract a foreground object in a rectangle.
@param img (cv.Mat | type cv.CV_8UC3)
@param rect (cv.Rect)
@param iters (number)
@return (object with fields: mask, bgdModel, and fgdModel)
@note mask: (cv.Mat | type cv.CV_8UC1)
      bgdModel: (cv.Mat | type cv.CV_64FC1)
      fgdModel: (cv.Mat | type cv.CV_64FC1)
*/
function rectGrabCut(img, rect, iters = 2, padding = 50) {
    const rect_expanded = new cv.Rect(
        rect.x - padding,
        rect.y - padding,
        rect.width + 2 * padding,
        rect.height + 2 * padding
    )
    const { position, roi } = extractRectFromImage(img, rect_expanded)
    const mask = new cv.Mat()
    const bgdModel = new cv.Mat()
    const fgdModel = new cv.Mat()
    const rect_effective = new cv.Rect(
        rect.x - position.x,
        rect.y - position.y,
        rect.width,
        rect.height
    )
    cv.grabCut(roi, mask, rect_effective, bgdModel, fgdModel, iters, cv.GC_INIT_WITH_RECT)
    const { width, height } = img.size();
    // note that cv.GC_BGD == 0
    const overall_mask = new cv.Mat.zeros(height, width, cv.CV_8UC1)
    for (let row = 0; row < position.height; row++) {
        for (let col = 0; col < position.width; col++) {
            const pixel = mask.ucharPtr(row, col)
            overall_mask.ucharPtr(row + position.y, col + position.x)[0] = pixel[0];
        }
    }
    return { "mask": overall_mask, "bgdModel": bgdModel, "fgdModel": fgdModel }
}

/*
@brief Extract a foreground object given an annotated mask.
@param img (cv.Mat | type cv.CV_8UC3)
@param mask (cv.Mat | type cv.CV_8UC1)
@param bgdModel (cv.Mat | type cv.CV_64FC1) OPTIONAL
@param fgdModel (cv.Mat | type cv.CV_64FC1) OPTIONAL
@return (object with fields: mask, bgdModel, and fgdModel)
@note mask: (cv.Mat | type cv.CV_8UC1)
      bgdModel: (cv.Mat | type cv.CV_64FC1)
      fgdModel: (cv.Mat | type cv.CV_64FC1)
*/
function maskGrabCut(img, mask, bgdModel, fgdModel, iters = 1) {
    if (bgdModel == null && fgdModel == null) {
        // create empty GMMs if left unspecified
        bgdModel = new cv.Mat.zeros(1, 65, cv.CV_64FC1)
        fgdModel = new cv.Mat.zeros(1, 65, cv.CV_64FC1)
    }
    cv.grabCut(img, mask, new cv.Rect(), bgdModel, fgdModel, iters, cv.GC_INIT_WITH_MASK)
    return { "mask": mask, "bgdModel": bgdModel, "fgdModel": fgdModel }
}

/*
@brief Returns whether or not a value represents grabcut foreground
@param value (number)
@return bool
*/
function isForeground(value) {
    return value == cv.GC_FGD || value == cv.GC_PR_FGD;
}

/*
@brief Extract out pixel locations in mask that satisfy predicate
@param mask (cv.Mat | type cv.CV_8UC1)
@param pred (function)
@return (Array)
*/
function extractMaskPoints(mask, pred) {
    const points = new Array();
    for (let row = 0; row < mask.rows; row++) {
        for (let col = 0; col < mask.cols; col++) {
            const pixel_value = mask.ucharAt(row, col);
            if (pred(pixel_value)) points.push([row, col]);
        }
    }
    return points;
}

/*
@brief Updates an OpenCV matrix at given points to be a certain value
@param matrix (cv.Mat)
@param points (Array)
@param value (Array)
*/
function updateMatrix(matrix, points, value) {
    const nChannels = value.length;
    points.map(
        point => {
            for (let channel = 0; channel < nChannels; channel++) {
                matrix.ucharPtr(point[0], point[1])[channel] = value[channel];
            }
        }
    );
}