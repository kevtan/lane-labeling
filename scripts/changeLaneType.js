const shoulder_points = [];
const shoulder_lines = [];
const point_radius = 2;

function changeLaneType(type) {
    if (type == 'r') {
        state.input_canvas.on('mouse:down', addRoadShoulderPoint);
        window.onkeydown = endRoadShoulder;
    } else {
        state.lane_specs.lane_type = typename;
    }
}

function addRoadShoulderPoint(mouse_event) {
    const { pointer } = mouse_event;
    const new_point = new fabric.Circle({
        left: pointer.x - point_radius / 2 - 1,
        top: pointer.y - point_radius / 2 - 1,
        radius: point_radius
    });
    shoulder_points.push(new_point);
    state.input_canvas.add(...shoulder_points);
    if (shoulder_points.length == 1) return;
    shoulder_lines.push(new fabric.Line([shoulder_points[shoulder_points.length - 2], shoulder_points[shoulder_points.length - 1]], {
        stroke: "red",
        width: 1,
        strokeWidth: 1
    }));
    state.input_canvas.add(...shoulder_lines);
    state.input_canvas.renderAll();
}

function endRoadShoulder(key_event) {
    if (key_event.key != ' ') return;
    alert("Done")
}