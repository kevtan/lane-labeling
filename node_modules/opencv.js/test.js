var testrunner = require('qunit');
testrunner.options.maxBlockDuration = 20000; // cause opencv_js.js need time to load


testrunner.run({
    code: 'opencv.js',
    tests: ['tests/test_mat.js',
      'tests/test_utils.js',
      'tests/test_imgproc.js',
      'tests/test_features2d.js',
      'tests/test_objdetect.js',
      'tests/test_video.js']}, function(err, report) {
        console.log(report.failed + ' failed, ' + report.passed + ' passed');
});
