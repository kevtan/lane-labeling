const file_input = document.getElementById('file_input');

file_input.onchange = (e) => {
    const temp = document.createElement('img');
    temp.src = URL.createObjectURL(e.target.files[0]);
    temp.onload = _ => {
        URL.revokeObjectURL(temp.src);
        resizeCanvases(temp);
        addImageToCanvas(temp);
        createMasks(temp);
        console.log(cv.imread("input").size());
    }
};

/*
@brief Resizes all canvas elements according to input image.
@param imgElement (HTMLImageElement)
*/
function resizeCanvases(imgElement) {
    // resize input canvas (special because fabric wrapper)
    state.input_canvas.setWidth(imgElement.width);
    state.input_canvas.setHeight(imgElement.height);
    // resize output canvases
    const o_canvases = document.querySelectorAll('.output');
    Array.prototype.map.call(o_canvases, o_canvas => {
        o_canvas.width = imgElement.width;
        o_canvas.height = imgElement.height;
    });
}

/*
@brief Adds an HTMLImageElement as fabric image object to input canvas.
@param imgElement (HTMLImageElement)
*/
function addImageToCanvas(imgElement) {
    state.image_object = new fabric.Image(imgElement, { selectable: false });
    state.input_canvas.add(state.image_object);
}

/*
@brief Creates the extracted, segmentation, and instance masks.
@param imgElemetn (HTMLImageElement)
*/
function createMasks(imgElement) {
    state.extracted = new cv.Mat.zeros(imgElement.height, imgElement.width, cv.CV_8UC1);
    state.segmentation_real = state.extracted.clone();
    state.instance_real = state.extracted.clone();
    state.segmentation_plot = new cv.Mat.zeros(imgElement.height, imgElement.width, cv.CV_8UC3);
    state.instance_plot = state.segmentation_plot.clone();
    cv.imshow("extracted", state.extracted);
    cv.imshow("segmentation", state.segmentation_plot);
    cv.imshow("instance", state.instance_plot);
}