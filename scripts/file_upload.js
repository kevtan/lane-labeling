/*
@brief Get and set the current image number.
*/
const getImageNo = _ => parseInt(file_chooser.value);
const setImageNo = n => {
    n = parseInt(n);
    const val = file_chooser.val;
    if (val !== n && n >= 0 && n < uploads.length) {
        file_chooser.value = n;
        file_chooser.dispatchEvent(new Event('change'));
    }
}


document.getElementById('file_input').onchange = e => {
    // set up global variables
    uploads = e.target.files;
    const nUploads = uploads.length;
    annotations = new Array(nUploads);
    cache = new Array(nUploads);
    // display the first image
    const file_chooser = document.getElementById('file_chooser');
    file_chooser.max = annotations.length - 1;
    setImageNo(0);
};

/*
@brief Displays the specified image and associated tricolor segmentation and
    instance annotations onto the screen, caching the data if uncached.
@param nFile (number)
@note Assumes that nImage parameter is a valid image index.
*/
function displayImage(nImage) {
    if (!cache[nImage]) cache[nImage] = { dataURL: URL.createObjectURL(uploads[nImage]) };
    const cache_data = cache[nImage];
    const temp = document.createElement('img');
    temp.src = cache_data.dataURL;
    temp.onload = _ => {
        input_canvas.setDimensions({
            width: temp.width,
            height: temp.height
        });
        input_canvas.setBackgroundImage(cache_data.dataURL, _ => {
            input_canvas.renderAll();
            if (cache_data.image) return;
            const image = cv.imread("input");
            cv.cvtColor(image, image, cv.COLOR_RGBA2RGB);
            const dsize = new cv.Size(input_canvas.width, input_canvas.height);
            cv.resize(image, image, dsize);
            cache_data.image = image;
        });
        if (!annotations[nImage]) {
            annotations[nImage] = {
                filename: uploads[nImage].name,
                segmentation: new cv.Mat.zeros(temp.height, temp.width, cv.CV_8UC1),
                instance: new cv.Mat.zeros(temp.height, temp.width, cv.CV_8UC1)
            };
            cache_data.segmentation = new cv.Mat.zeros(temp.height, temp.width, cv.CV_8UC3);
            cache_data.instance = new cv.Mat.zeros(temp.height, temp.width, cv.CV_8UC3);
        }
        cv.imshow("segmentation", cache_data.segmentation);
        cv.imshow("instance", cache_data.instance);
    };
}