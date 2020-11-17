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
let video;
let poseNet;
let pose;
let skeleton;
let count = 0;
let lastPose = ""

// let prevLeftYDist = 9999;
// let prevRightYDist = 9999;
let dist;

let brain;
let poseLabel = "";

var audio = new Audio('./asset/sound/ding.mp3');

// var up_arr = ["TOP_UP", "MID_UP", "BOT_UP"];
// var down_arr = ["TOP_DOWN", "MID_DOWN", "BOT_DOWN"];
// var up_arr = ["UP"];
// var down_arr = ["DOWN"];

function setup() {
  // createCanvas(640, 480);
  var cnv = createCanvas(640, 480);
  var x = (windowWidth - width) / 2;
  var y = (windowHeight - height) / 2;
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
  // video = createCapture(VIDEO);
  video.hide();
  poseNet = ml5.poseNet(video, poseNetOptions, modelLoaded);
  poseNet.on('pose', gotPoses);
  armsUp();
}

// Load PoseNet Model with ml5 wrapper
let poseNetOptions = {
  architecture: 'ResNet50',
  outputStride: 32,
  detectionType: 'single',
  // inputResolution: 193,
  inputResolution: 161
  }

function gotPoses(poses) {
  // console.log(poses);
  if (poses.length > 0) {
    pose = poses[0].pose;
    skeleton = poses[0].skeleton;
  }
}

function modelLoaded() {
  console.log('poseNet ready');
}

function armsUp(){
  if (pose) {
    /* Rule base push up counter */
    let confidenceThreshold = 0.3;
    let downHeightTolerance = 150;
    let upHeightTolerance = 70;
    let leftYDist;
    let rightYDist;
  
    function jointDistEvaluate(joint1, joint2, confidenceThreshold){
      let jointDist = null;
      if (pose.keypoints[joint1].score >= confidenceThreshold && pose.keypoints[joint2].score >= confidenceThreshold) {
        jointDist = pose.keypoints[joint1].position.y - pose.keypoints[joint2].position.y;;
      } 
      return jointDist;
    }
    
    // distance between shoulders and wrists
    leftYDist = jointDistEvaluate(5, 9, confidenceThreshold);
    rightYDist = jointDistEvaluate(6, 10, confidenceThreshold);

    function classifyPose() {
      if ((Math.abs(leftYDist) >= downHeightTolerance) | (Math.abs(rightYDist) >= downHeightTolerance)) {
        poseLabel = "DOWN";
      }
      else if ((Math.abs(leftYDist) <= upHeightTolerance) | (Math.abs(rightYDist) <= upHeightTolerance)) {
        poseLabel = "UP";
      }
      console.log("poseLabel: " + poseLabel);
      if (lastPose == "DOWN" && poseLabel == "UP") {
        console.log("lastpose: "+lastPose);
        console.log("current: " + poseLabel);
        audio.play();
        count++;
      }
      lastPose =  poseLabel
    }

    classifyPose();

  }
  setTimeout(armsUp, 100);
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
      // strokeWeight(2);
      // stroke(0);
      strokeWeight(1.5);
      stroke(255,0,0);

      line(a.position.x, a.position.y, b.position.x, b.position.y);
    }
    for (let i = 0; i < pose.keypoints.length; i++) {
      let x = pose.keypoints[i].position.x;
      let y = pose.keypoints[i].position.y;
      // fill(0);
      // stroke(255);
      // ellipse(x, y, 16, 16);
      fill(0, 0, 0);
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