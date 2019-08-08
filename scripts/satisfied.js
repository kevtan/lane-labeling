const seg_plotvals = [
    [0, 0, 0], // black
    [27, 161, 226], // cyan
    [244, 114, 208], // pink
    [250, 104, 0], // orange
    [164, 196, 0], // lime
    [170, 0, 255] // violet
];

const ins_plotvals = [
    [0, 0, 0],
    [27, 161, 226], // cyan
    [244, 114, 208], // pink
    [250, 104, 0], // orange
    [164, 196, 0], // lime
    [170, 0, 255], // violet
    [229, 20, 0], // red
    [227, 200, 0], // yellow
    [0, 171, 169], // teal
    [240, 163, 10], // amber
    [100, 118, 135] // steel
];

/*
@brief Returns an integer representing the lane you're labeling,
    taking into account both lane type (s|d|r) and color (w|y).
@return number
*/
function getLaneInteger() {
    const { type, color } = state.lane;
    if (type == 'r') return 1;
    else if (type == 'd') return color == 'w' ? 2 : 3;
    else if (type == 's') return color == 'w' ? 4 : 5;
    else throw new Error('Cannot compute lane encoding!');
}

/*
@brief Event handler for when the user clicks the 'Satisfied' button;
    commits extraction results to the segmentation and instance masks.
*/
function satisfied() {
    if (state.lane.number == null || state.lane.type == null || state.lane.color == null)
        alert("Please specify lane number, type, and color before committing changes!");
    const lane_encoding = getLaneInteger();
    const anno = annotations[state.image];
    updateMatrix(anno.segmentation, state.result.fg_points, [lane_encoding]);
    updateMatrix(anno.instance, state.result.fg_points, [state.lane.number]);
    renderSegmentation();
    renderInstance();
}

/*
@brief Recomputes a colorful segmentation image and displays it.
*/
function renderSegmentation() {
    const anno = annotations[state.image];
    console.log(state.image);
    const seg = anno.segmentation;
    const copy = new cv.Mat.zeros(seg.rows, seg.cols, cv.CV_8UC3);
    for (let i = 0; i < seg.rows; i++) {
        for (let j = 0; j < seg.cols; j++) {
            const pixelVal = seg_plotvals[seg.ucharAt(i, j)];
            copy.ucharPtr(i, j)[0] = pixelVal[0];
            copy.ucharPtr(i, j)[1] = pixelVal[1];
            copy.ucharPtr(i, j)[2] = pixelVal[2];
        }
    }
    cv.imshow("segmentation", copy);
    copy.delete();
}

/*
@brief Recomputes a colorful instance image and displays it.
*/
function renderInstance() {
    const anno = annotations[state.image];
    const ins = anno.instance;
    const copy = new cv.Mat.zeros(ins.rows, ins.cols, cv.CV_8UC3);
    for (let i = 0; i < ins.rows; i++) {
        for (let j = 0; j < ins.cols; j++) {
            const pixelVal = ins_plotvals[ins.ucharAt(i, j)];
            copy.ucharPtr(i, j)[0] = pixelVal[0];
            copy.ucharPtr(i, j)[1] = pixelVal[1];
            copy.ucharPtr(i, j)[2] = pixelVal[2];
        }
    }
    cv.imshow("instance", copy);
    copy.delete();
}