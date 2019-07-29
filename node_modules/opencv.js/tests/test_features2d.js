//  //////////////////////////////////////////////////////////////////////////////////////
//
//  IMPORTANT: READ BEFORE DOWNLOADING, COPYING, INSTALLING OR USING.
//
//  By downloading, copying, installing or using the software you agree to this license.
//  If you do not agree to this license, do not download, install,
//  copy or use the software.
//
//
//                           License Agreement
//                For Open Source Computer Vision Library
//
// Copyright (C) 2013, OpenCV Foundation, all rights reserved.
// Third party copyrights are property of their respective owners.
//
// Redistribution and use in source and binary forms, with or without modification,
// are permitted provided that the following conditions are met:
//
//   * Redistribution's of source code must retain the above copyright notice,
//     this list of conditions and the following disclaimer.
//
//   * Redistribution's in binary form must reproduce the above copyright notice,
//     this list of conditions and the following disclaimer in the documentation
//     and/or other materials provided with the distribution.
//
//   * The name of the copyright holders may not be used to endorse or promote products
//     derived from this software without specific prior written permission.
//
// This software is provided by the copyright holders and contributors "as is" and
// any express or implied warranties, including, but not limited to, the implied
// warranties of merchantability and fitness for a particular purpose are disclaimed.
// In no event shall the Intel Corporation or contributors be liable for any direct,
// indirect, incidental, special, exemplary, or consequential damages
// (including, but not limited to, procurement of substitute goods or services;
// loss of use, data, or profits; or business interruption) however caused
// and on any theory of liability, whether in contract, strict liability,
// or tort (including negligence or otherwise) arising in any way out of
// the use of this software, even if advised of the possibility of such damage.
//

// //////////////////////////////////////////////////////////////////////////////////////
// Author: Sajjad Taheri, University of California, Irvine. sajjadt[at]uci[dot]edu
//
//                             LICENSE AGREEMENT
// Copyright (c) 2015 The Regents of the University of California (Regents)
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
// 1. Redistributions of source code must retain the above copyright
//    notice, this list of conditions and the following disclaimer.
// 2. Redistributions in binary form must reproduce the above copyright
//    notice, this list of conditions and the following disclaimer in the
//    documentation and/or other materials provided with the distribution.
// 3. Neither the name of the University nor the
//    names of its contributors may be used to endorse or promote products
//    derived from this software without specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS ''AS IS'' AND ANY
// EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
// WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
// DISCLAIMED. IN NO EVENT SHALL CONTRIBUTORS BE LIABLE FOR ANY
// DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
// (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
// LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
// ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
// SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//

if (typeof module !== 'undefined' && module.exports) {
    // The envrionment is Node.js
    var cv = require('../opencv.js'); // eslint-disable-line no-var
}

QUnit.module('Features Framework', {});
QUnit.test('Simple Blob Detector', function(assert) {
    // Constructor
    {
        let detector = new cv.SimpleBlobDetector();

        assert.equal(detector instanceof cv.SimpleBlobDetector, true);
        detector.delete();

        let params = {};
        params.thresholdStep = 10;
        params.minThreshold = 50;
        params.maxThreshold = 220;
        params.minRepeatability = 2;
        params.minDistBetweenBlobs = 10;
        params.filterByColor = true;
        params.blobColor = 0;
        params.filterByArea = true;
        params.minArea = 25;
        params.maxArea = 5000;
        params.filterByCircularity = false;
        params.minCircularity = 0.8;
        params.maxCircularity = Number.MAX_VALUE;
        params.filterByInertia = true;
        params.minInertiaRatio = 0.1;
        params.maxInertiaRatio = Number.MAX_VALUE;
        params.filterByConvexity = true;
        params.minConvexity = 0.95;
        params.maxConvexity = Number.MAX_VALUE;

        detector = new cv.SimpleBlobDetector(params);

        assert.equal(detector instanceof cv.SimpleBlobDetector, true);
        detector.delete();

    }
    // Detect
    {
        let image = cv.Mat.ones(5, 5, cv.CV_8UC3);
        let detector = new cv.SimpleBlobDetector();
        let keypoints = new cv.KeyPointVector();

        detector.detect(image, keypoints);
        assert.equal(keypoints instanceof cv.KeyPointVector, true);

        image.delete();
        keypoints.delete();
    }

});

QUnit.test('ORB Features', function(assert) {
    // Constructor
    {
        let detector = new cv.ORB();

        assert.equal(detector instanceof cv.ORB, true);

        detector.delete();

        detector = new cv.ORB(400, 1, 8, 32, 0, 2, cv.ORB_HARRIS_SCORE, 32, 16);

        assert.equal(detector.getMaxFeatures(), 400);
        assert.equal(detector.getNLevels(), 8);
        assert.equal(detector.getEdgeThreshold(), 32);
        assert.equal(detector.getPatchSize(), 32);

        detector.setPatchSize(25);
        assert.equal(detector.getPatchSize(), 25);

        detector.delete();

    }
    // Detect and Compute
    {
        let detector = new cv.ORB();

        let image = cv.Mat.ones(5, 5, cv.CV_8UC3);
        let keypoints = new cv.KeyPointVector();
        let descriptors = new cv.Mat();

        assert.equal(detector instanceof cv.ORB, true);

        detector.detect(image, keypoints);
        detector.compute(image, keypoints, descriptors);

        assert.equal(keypoints instanceof cv.KeyPointVector, true);
        assert.equal(descriptors instanceof cv.Mat, true);
        assert.equal(image.channels, descriptors.channels);

        image.delete();
        keypoints.delete();

        image = cv.Mat.ones(5, 5, cv.CV_8UC3);
        keypoints = new cv.KeyPointVector();
        descriptors = new cv.Mat();
        let mask = new cv.Mat();

        detector.detectAndCompute(image, mask, keypoints, descriptors);
        assert.equal(keypoints instanceof cv.KeyPointVector, true);
        assert.equal(descriptors instanceof cv.Mat, true);
        assert.equal(image.channels, descriptors.channels);

        image.delete();
        keypoints.delete();
        detector.delete();
        mask.delete();

    }
});

QUnit.test('Fast Features', function(assert) {
    // Constructor
    {
        let detector = new cv.FastFeatureDetector();

        assert.equal(detector instanceof cv.FastFeatureDetector, true);

        detector.delete();

        detector = new cv.FastFeatureDetector(15, true, cv.FastFeatureDetector_TYPE_7_12 );

        assert.equal(detector instanceof cv.FastFeatureDetector, true);
        assert.equal(detector.getThreshold(), 15);
        assert.equal(detector.getNonmaxSuppression(), true);
        assert.equal(detector.getType(), cv.FastFeatureDetector_TYPE_7_12);

        detector.delete();
    }
    // Detect
    {

        let detector = new cv.FastFeatureDetector();
        let image = cv.Mat.ones(5, 5, cv.CV_8UC3);
        let keypoints = new cv.KeyPointVector();

        assert.equal(detector instanceof cv.FastFeatureDetector, true);

        detector.detect(image, keypoints);

        assert.equal(keypoints instanceof cv.KeyPointVector, true);

        image.delete();
        keypoints.delete();

    }
});

QUnit.test('Descriptor Matcher', function(assert) {
    // Constructor
    {

        // BruteForce (it uses L2 )
        // BruteForce-L1
        // BruteForce-Hamming
        // BruteForce-Hamming(2)
        // FlannBased   (Not supported)

        let matcher = new cv.DescriptorMatcher("BruteForce");

        assert.equal(matcher instanceof cv.DescriptorMatcher, true);

        matcher.delete();


        matcher = new cv.DescriptorMatcher("BruteForce-L1");

        assert.equal(matcher instanceof cv.DescriptorMatcher, true);

        matcher.delete();

        matcher = new cv.DescriptorMatcher("BruteForce-Hamming");

        assert.equal(matcher instanceof cv.DescriptorMatcher, true);

        matcher.delete();


        matcher = new cv.DescriptorMatcher("BruteForce-Hamming(2)");

        assert.equal(matcher instanceof cv.DescriptorMatcher, true);

        matcher.delete();

    }
    // Match
    {
        let matcher = new cv.DescriptorMatcher("BruteForce");
        let detector = new cv.ORB();
        let matches = new cv.DMatchVector();

        assert.equal(matcher instanceof cv.DescriptorMatcher, true);
        assert.equal(detector instanceof cv.ORB, true);

        let image = cv.Mat.ones(5, 5, cv.CV_8UC3);
        let keypoints = new cv.KeyPointVector();
        let descriptors = new cv.Mat();

        let image2 = cv.Mat.ones(5, 5, cv.CV_8UC3);
        let keypoints2 = new cv.KeyPointVector();
        let descriptors2 = new cv.Mat();

        let mask = new cv.Mat();

        detector.detectAndCompute(image, mask, keypoints, descriptors);
        detector.detectAndCompute(image2, mask, keypoints2, descriptors2);
        matcher.match(descriptors, descriptors2, matches);

        assert.equal(matches instanceof cv.DMatchVector, true);

        image.delete();
        image2.delete();
        mask.delete();
        keypoints.delete();
        keypoints2.delete();
        descriptors.delete();
        descriptors2.delete();
        matches.delete();
        detector.delete();
        matcher.delete();
    }
});
