const input_canvas = new fabric.Canvas('input', {
    defaultCursor: "crosshair"
});

const state = {
    lane: {
        number: null,
        type: null,
        color: null
    },
    mode: null
};

/* HTMLElement that stores data about which image we're annotating. */
const file_chooser = document.getElementById('file_chooser');

/*
Object containing user input rectangle xor polygon.
{
    type: String,
    data: fabric.Rect | fabric.Circle[]
}
*/
let input = new Object();

/*
Object containing the result of the latest grabcut operation. For example:
{
    mask: cv.Mat,
    bgdModel: cv.Mat,
    fgdModel: cv.Mat,
    points: cv.Point[]
}
*/
let result;

/* FileList object containing all the uploaded images. */
let uploads;

/*
Array containing all of the annotation results to be saved. An example element:
{
    filename: "1557049332.025_front_right_image.jpg",
    segmentation: cv.Mat,
    instance: cv.Mat
}
*/
let annotations;

/*
Array containing all of the cached data that enhances the user experience.
An example element:
{
    dataURL: "blob:null/a00f479b-7e17-4347-991f-a220f490583e",
    image: cv.Mat,
    segmentation: cv.Mat,
    instance: cv.Mat
}
*/
let cache;