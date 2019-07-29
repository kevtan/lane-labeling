#### OpenCV.js

OpenCV.js is asm.js/WASM implementation of OpenCV. Currently, it is based on OpenCV version 3.3. It includes more than 100 select functions form the following OpenCV modules.

* Core
* Image processing
* Video
* Object detection
* Image codecs

#### Installation

```
npm install opencv.js
```

#### How to Use
```js
cv = require('opencv.js');
```

#### Demos
Use this [pointer](https://huningxin.github.io/opencv.js/samples/index.html) to access the demos.

#### API
Please refer to  the [OpenCV.js documentations](https://huningxin.github.io/opencv_docs/tutorial_js_table_of_contents_core.html).

#### Basic Types
```cv.Mat``` is the main data structure that is used by the functions. The following constructors are available to create matrices.

```
cv.Mat()
cv.Mat(another_mat)
cv.Mat(size, type)
cv.Mat(rows, cols, type, data, step)
```

Simple types such as ```cv::Rect```, ```cv::Point``` are represented using JavaScript value objects.

#### Examples
##### Working with Images - Canny Edge Detection
This examples demonstrates how to find edges in a given image file.

```js
var cv = require('opencv.js');
var jpeg = require('jpeg-js');
var fs = require('fs');

// Load an image
var jpeg_data = fs.readFileSync("in_img.jpg");
var raw_data = jpeg.decode(jpeg_data);

// Create a matrix from image. input image expected to be in RGBA format
var src = cv.matFromImageData(raw_data);
cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY); // Convert to grayscale

dst = new cv.Mat();
cv.Canny(src, dst, 50, 150);
cv.cvtColor(dst, dst, cv.COLOR_GRAY2RGBA); // Convert back to RGBA to display

// Save the result
raw_data = {
  data: dst.data,
  width: dst.size().width,
  height: dst.size().height
};
var jpeg_data = jpeg.encode(raw_data, 50);
fs.writeFileSync("out_img.jpg", jpeg_data.data);

```
##### Working with videos - Face detection using HARR Cascades
This example demonstrates how to use HAAR cascades to find objects in video frames. We will rely on pre-trained HAAR models that are specialized in finding certain objects. OpenCV provides several models that can be used.

```js
let v4l2camera = require( "v4l2camera" );
var jpeg = require('jpeg-js');
var fs = require('fs');
let cv = require('opencv.js');

// Loading classifier with the frontal face model
cv.FS_createLazyFile('/', 'haarcascade_frontalface_default.xml',
                         'haarcascade_frontalface_default.xml', true, false);
let faceClassifier = new cv.CascadeClassifier();
faceClassifier.load('haarcascade_frontalface_default.xml');

// Start the camera
let cam = new v4l2camera.Camera("/dev/video0");
if (cam.configGet().formatName !== "YUYV") {
    console.log("YUYV camera required");
    process.exit(1);
}

// Configure and start the camera
cam.configSet({width: 320, height: 240});
let format = cam.configGet();
console.log("Camera config [ " + format.formatName + " " + format.width + "x" +
    format.height + " " + format.interval.numerator + "/" +
    format.interval.denominator + "]");
cam.start();

let yuvMat = null;
let rgbMat = null;
let grayMat = null;

let stopped = false;
let frameIndex = 0;

cam.capture(function detectFace(success) {
  let frame = cam.frameRaw();
  let videoHeight = cam.height;
  let videoWidth = cam.width;
  if (!yuvMat)
    yuvMat = new cv.Mat(videoHeight, videoWidth, cv.CV_8UC2);
  yuvMat.data.set(frame);
  if (!rgbMat)
    rgbMat = new cv.Mat(videoHeight, videoWidth, cv.CV_8UC4);
  cv.cvtColor(yuvMat, rgbMat, cv.COLOR_YUV2RGBA_YUYV);
  if (!grayMat)
    grayMat = new cv.Mat(videoHeight, videoWidth, cv.CV_8UC1);
  cv.cvtColor(rgbMat, grayMat, cv.COLOR_RGBA2GRAY);

  let faces = [];
  let eyes = [];
  let size;
  let faceVect = new cv.RectVector();
  let faceMat = new cv.Mat();

  // Scale down the input frame
  cv.pyrDown(grayMat, faceMat);
  if (videoWidth > 320)
    cv.pyrDown(faceMat, faceMat);
  size = faceMat.size();

  // Processing the frame to find faces
  faceClassifier.detectMultiScale(faceMat, faceVect);

  // Draw rectangle around faces
  for (let i = 0; i < faceVect.size(); i++) {
    let xRatio = videoWidth/size.width;
    let yRatio = videoHeight/size.height;
    let face = faceVect.get(i);
    let x = face.x*xRatio;
    let y = face.y*yRatio;
    let w = face.width*xRatio;
    let h = face.height*yRatio;
    let point1 = new cv.Point(x, y);
    let point2 = new cv.Point(x + w, y + h);
    cv.rectangle(rgbMat, point1, point2, [255, 0, 0, 255]);
    console.log('\tFace detected : ' + '[' + i + ']' +
        ' (' + x + ', ' + y + ', ' + w + ', ' + h + ')');
  }

  // Free the memory used by vectors
  faceMat.delete();
  faceVect.delete();

  if (stopped) {
    cam.stop();
    console.log('Stopped');
    rawData = {
      data: rgbMat.data,
      width: rgbMat.size().width,
      height: rgbMat.size().height
    };
    var jpegData = jpeg.encode(rawData, 50);
    const filename = 'result.jpg';
    fs.writeFileSync(filename, jpegData.data);
    console.log('Written into ' + filename);
    yuvMat.delete();
    rgbMat.delete();
    grayMat.delete();
    process.exit();
  }
  cam.capture(detectFace);
});

const ESC_KEY = '\u001b';
const CTRL_C = '\u0003';
let stdin = process.stdin;
stdin.setRawMode(true);
stdin.resume();
stdin.setEncoding('utf8');
stdin.on('data', function(key) {
  if (key === ESC_KEY || key === CTRL_C) {
    stopped = true;
  }
});
```


#### Contributers
1. Sajjad Taheri (Architect of the initial version and GSoC mentor, University of California, Irvine)
2. Congxiang Pan (GSoC student, Shanghai Jiao Tong University)
3. Gang Song (GSoC student, Shanghai Jiao Tong University)
4. Wenyao Gan (Student intern, Shanghai Jiao Tong University)
5. Mohammad Reza Haghighat (Project initiator & sponsor, Intel Corporation)
6. Ningxin Hu (Students' supervisor, Intel Corporation)

This project was supported by the Intel corporation and Google through 2017 Google Summer of Code program.

## License
BSD 3 Clause
