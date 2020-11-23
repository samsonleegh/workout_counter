// ml5.js: Pose Classification
// The Coding Train / Daniel Shiffman
// https://thecodingtrain.com/learning/ml5/7.2-pose-classification.html
// https://youtu.be/FYgYyq-xqAw

// All code: https://editor.p5js.org/codingtrain/sketches/JoZl-QRPK

// Separated into three sketches
// 1: Data Collection: https://editor.p5js.org/codingtrain/sketches/kTM0Gm-1q
// 2: Model Training: https://editor.p5js.org/codingtrain/sketches/-Ywq20rM9
// 3: Model Deployment: https://editor.p5js.org/codingtrain/sketches/c5sDNr8eM
// const count_disp = document.getElementById('count');
var video;
var poseNet;
var pose;
var skeleton;

var count = 0;
var poseLabel = "";
var lastPose = "";
var exercise;

var prevLeftYDist;
var prevRightYDist;
var prevLeftXDist;
var prevRightXDist;

var audio = new Audio('asset/sound/ding.mp3');

function setup() {
  // Canvas
  var cnv = createCanvas(640, 480);
  let x = (windowWidth - width) / 2;
  let y = (windowHeight - height) / 2;
  cnv.position(x, y);

  // Video capture functionality
  let videoCaptureSettings = {
      video: {
        mandatory: {
          maxWidth: 640,
          maxHeight: 480
      },
      optional: [{ maxFrameRate: 15 }]
    },
    audio: false
  };
  video = createCapture(videoCaptureSettings);
  video.hide();

  // Load PoseNet Model with ml5 wrapper
  let poseNetOptions = {
    architecture: 'ResNet50',
    outputStride: 32,
    detectionType: 'single',
    inputResolution: 161
    }

  poseNet = ml5.poseNet(video, poseNetOptions, modelLoaded);
  poseNet.on('pose', gotPoses);
  countRep();
}

function gotPoses(poses) {
  /*
  Callback function to handle PoseNet object "pose" event
  */
  if (poses.length > 0) {
    pose = poses[0].pose;
    skeleton = poses[0].skeleton;
  }
}

function modelLoaded() {
  /*
  Callback when poseNet model load is completed
  */
  console.log('poseNet ready');
}

function draw() {
  push();
  translate(video.width, 0);
  scale(-1, 1);
  image(video, 0, 0, video.width, video.height);

  if (pose) {
    for (let i = 0; i < skeleton.length; i++) {
      let a = skeleton[i][0];
      let b = skeleton[i][1];
      strokeWeight(1.5);
      stroke(255, 0, 0);

      line(a.position.x, a.position.y, b.position.x, b.position.y);
    }
    for (let i = 0; i < pose.keypoints.length; i++) {
      let x = pose.keypoints[i].position.x;
      let y = pose.keypoints[i].position.y;
      // fill(0);
      // stroke(255);
      // ellipse(x, y, 16, 16);
      fill(255, 0, 0);
      ellipse(x, y, 10, 10);
    }
  }
  pop();

  fill(255, 0, 255);
  noStroke();
  textSize(64);
  textAlign(CENTER, CENTER);
  text(count, 550, 400);
  fill(51);
  noStroke();
  textSize(50);
  textAlign(CENTER, CENTER);
  text(poseLabel, 550, 450);
}