const input_canvas = new fabric.Canvas('input', {
    defaultCursor: "crosshair"
});

const state = {
    image: 0,
    lane: {
        number: null,
        type: null,
        color: null
    },
    input: {
        rectangle: null,
        polygon: [],
        corrections: {
            fg: [],
            bg: []
        }
    },
    result: {
        mask: null,
        bgdModel: null,
        fgdModel: null,
        fg_points: []
    }
};

let uploads;
let annotations;

/*
Every entry in state.annotations will look like this:
{
    filename: /fake/path.png,
    segmentation: cv.Mat,
    instance: cv.Mat
}
*/