const file_input = document.getElementById('file_input');
file_input.onchange = (e) => {
    uploads = e.target.files;
    annotations = new Array(uploads.length);
    const file_chooser = document.getElementById('file_chooser');
    file_chooser.min = 0;
    file_chooser.max = annotations.length - 1;
    file_chooser.value = 0;
    displayFile(0);
};

/*
@brief Change all of the canvases to match the current file (image).
@param nFile (number)
*/
function displayFile(nFile) {
    state.image = nFile;
    const temp = document.createElement('img');
    temp.src = URL.createObjectURL(uploads[nFile]);
    temp.onload = _ => {
        input_canvas.setBackgroundImage(temp.src);
        URL.revokeObjectURL(temp.src);
        input_canvas.setWidth(temp.width);
        input_canvas.setHeight(temp.height);
        if (annotations[nFile] === undefined) {
            annotations[nFile] = {
                filename: uploads[nFile].name,
                segmentation: new cv.Mat.zeros(temp.height, temp.width, cv.CV_8UC1),
                instance: new cv.Mat.zeros(temp.height, temp.width, cv.CV_8UC1)
            };
        }
        renderSegmentation();
        renderInstance();
    }
}