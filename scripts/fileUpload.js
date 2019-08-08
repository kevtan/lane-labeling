const file_input = document.getElementById('file_input');
file_input.onchange = (e) => {
    uploads = e.target.files;
    annotations = new Array(uploads.length);
    cache = new Array(uploads.length);
    const file_chooser = document.getElementById('file_chooser');
    file_chooser.min = 0;
    file_chooser.max = annotations.length - 1;
    file_chooser.value = 0;
    displayFile(0);
};

/*
@brief Displays the specified file and related annotations onto the screen.
@param nFile (number)
@note sets up the cache for the image
*/
function displayFile(nFile) {
    state.image = nFile;
    if (!cache[state.image]) cache[state.image] = { dataURL: URL.createObjectURL(uploads[state.image]) };
    const temp = document.createElement('img');
    temp.src = cache[state.image].dataURL;
    temp.onload = _ => {
        input_canvas.setBackgroundImage(cache[state.image].dataURL);
        input_canvas.setWidth(temp.width);
        input_canvas.setHeight(temp.height);
        if (!annotations[state.image]) {
            annotations[state.image] = {
                filename: uploads[state.image].name,
                segmentation: new cv.Mat.zeros(temp.height, temp.width, cv.CV_8UC1),
                instance: new cv.Mat.zeros(temp.height, temp.width, cv.CV_8UC1)
            };
            cache.segmentation = new cv.Mat.zeros(temp.height, temp.width, cv.CV_8UC3);
            cache.instance = cache.segmentation.clone();
        }
        cv.imshow("segmentation", cache.segmentation);
        cv.imshow("instance", cache.instance);
    };
}