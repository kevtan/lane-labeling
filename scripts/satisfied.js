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
@brief Gets number representing what kind of lane you're labeling
@return number
*/
function laneEncoding() {
    const { lane_type, lane_color } = state.lane_specs;
    if (lane_type == 'r') return 1;
    else if (lane_type == 'd') return lane_color == 'w' ? 2 : 3;
    else if (lane_type == 's') return lane_color == 'w' ? 4 : 5;
    else throw new Error('Cannot compute lane encoding!');
}

function satisfied() {
    // check to make sure user specified all settings
    const specs = state.lane_specs;
    if (specs.lane_number == null || specs.lane_type == null || specs.lane_color == null)
        alert("Please specify lane number, type, and color before committing changes!");
    const fg_points = state.gc_result.fg_points;
    const lane_encoding = laneEncoding();
    updateMatrix(state.segmentation_real, fg_points, [lane_encoding]);
    updateMatrix(state.segmentation_plot, fg_points, seg_plotvals[lane_encoding]);
    updateMatrix(state.instance_real, fg_points, [specs.lane_number]);
    updateMatrix(state.instance_plot, fg_points, ins_plotvals[specs.lane_number - 1])
    cv.imshow("segmentation", state.segmentation_plot);
    cv.imshow("instance", state.instance_plot);
    // transform fg points back into original reference frame
}