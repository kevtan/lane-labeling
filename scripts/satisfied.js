const seg_plotvals = [
    [27, 161, 226], // cyan
    [244, 114, 208], // pink
    [250, 104, 0], // orange
    [164, 196, 0], // lime
    [170, 0, 255] // violet
];

const ins_plotvals = [
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
    const { lane_type, lane_color } = state.lane_specs;
    if (lane_type == 'r') return 1;
    else if (lane_type == 'd') return lane_color == 'w' ? 2 : 3;
    else if (lane_type == 's') return lane_color == 'w' ? 4 : 5;
    else throw new Error('Cannot compute lane encoding!');
}

/*
@brief Event handler for when the user clicks the 'Satisfied' button;
    commits extraction results to the segmentation and instance masks.
*/
function satisfied() {
    // check to make sure user specified all settings
    const specs = state.lane_specs;
    if (specs.lane_number == null || specs.lane_type == null || specs.lane_color == null)
        alert("Please specify lane number, type, and color before committing changes!");
    // transform grabcut mask back and extract foreground
    const transformation_matrix = getTransformationMatrix();
    const transformed_mask = transformMask(transformation_matrix);
    const fg_points = extractMaskPoints(transformed_mask, isForeground);
    // cleanup results
    transformation_matrix.delete();
    transformed_mask.delete();
    // render results on canvases and in state masks
    const lane_encoding = getLaneInteger();
    updateMatrix(state.segmentation_real, fg_points, [lane_encoding]);
    updateMatrix(state.segmentation_plot, fg_points, seg_plotvals[lane_encoding]);
    updateMatrix(state.instance_real, fg_points, [specs.lane_number]);
    updateMatrix(state.instance_plot, fg_points, ins_plotvals[specs.lane_number - 1])
    cv.imshow("segmentation", state.segmentation_plot);
    cv.imshow("instance", state.instance_plot);
}

/*
@brief Transforms grabcut mask result back into original frame of reference.
@return (Array of Foreground Points)
*/
function transformBack() {
    const fg_points = extractMaskPoints(recovered_mask, isForeground);
    transformation_mat.delete();
    recovered_mask.delete();
    return fg_points;
}

/*
@brief Find the affine transformation matrix to get from the current
    image position (potentially rotated/stretched) back to the original.
@return (cv.Mat | type cv.CV_64FC1 | size 2x3)
*/
function getTransformationMatrix() {
    const { tl, bl, tr } = state.image_object.aCoords;
    const src_points = new cv.matFromArray(3, 1, cv.CV_32FC2, [
        tl.x, tl.y,
        bl.x, bl.y,
        tr.x, tr.y
    ]);
    // note: scaling image changes scaleX and scaleY not width and height
    const dst_points = new cv.matFromArray(3, 1, cv.CV_32FC2, [
        0, 0,
        0, state.image_object.height,
        state.image_object.width, 0
    ]);
    const transformation_matrix = cv.getAffineTransform(src_points, dst_points);
    dst_points.delete();
    src_points.delete();
    return transformation_matrix;
}

/*
@brief Transforms state.gc_result.mask according to a transformation matrix.
@return (cv.Mat | type cv.CV_8UC1)
*/
function transformMask(transformation_matrix) {
    const transformed_mask = new cv.Mat();
    // note: scaling image changes scaleX and scaleY not width and height
    const transformed_mask_size = new cv.Size(
        state.image_object.width,
        state.image_object.height
    );
    cv.warpAffine(
        state.gc_result.mask,
        transformed_mask,
        transformation_matrix,
        transformed_mask_size,
        cv.INTER_NEAREST
    );
    return transformed_mask;
}