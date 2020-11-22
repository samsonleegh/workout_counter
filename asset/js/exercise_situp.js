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

let lastLeftYDist = ""
let lastRightYDist = ""
let lastLeftXDist = ""
let lastRightXDist = ""

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
  sitUp();
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

function sitUp(){
  if (pose) {
    /* Rule base sit up counter */
    let confidenceThreshold = 0.5;
    let downHeightTolerance = 150;
    let upHeightTolerance = 70;
    let leftYDist;
    let rightYDist;
    let leftXDist;
    let rightXDist;
  
    function jointYDistEvaluate(joint1, joint2, confidenceThreshold){
      let jointDist = null;
      if (pose.keypoints[joint1].score >= confidenceThreshold && pose.keypoints[joint2].score >= confidenceThreshold) {
        jointDist = pose.keypoints[joint1].position.y - pose.keypoints[joint2].position.y;;
      } 
      return jointDist;
    }
    function jointXDistEvaluate(joint1, joint2, confidenceThreshold){
      let jointDist = null;
      if (pose.keypoints[joint1].score >= confidenceThreshold && pose.keypoints[joint2].score >= confidenceThreshold) {
        jointDist = pose.keypoints[joint1].position.x - pose.keypoints[joint2].position.x;;
      } 
      return jointDist;
    }

    // distance between elbow and knees
    leftYDist = jointYDistEvaluate(7, 13, confidenceThreshold);
    rightYDist = jointYDistEvaluate(8, 14, confidenceThreshold);
    leftXDist = jointXDistEvaluate(7, 13, confidenceThreshold);
    righXDist = jointXDistEvaluate(8, 14, confidenceThreshold);

    /*
    * Calculates the angle ABC (in radians) 
    *
    * joint1 first point, ex: {x: 0, y: 0}
    * joint3 second point
    * joint2 center point
    */
    function find_angle(joint1,joint2,joint3) {
      let joinAngle = null;
      if (pose.keypoints[joint1].score >= confidenceThreshold 
        && pose.keypoints[joint2].score >= confidenceThreshold
        && pose.keypoints[joint3].score >= confidenceThreshold
        ) {
          var A = pose.keypoints[joint1].position
          var B = pose.keypoints[joint2].position
          var C = pose.keypoints[joint3].position
          var AB = Math.sqrt(Math.pow(B.x-A.x,2)+ Math.pow(B.y-A.y,2));    
          var BC = Math.sqrt(Math.pow(B.x-C.x,2)+ Math.pow(B.y-C.y,2)); 
          var AC = Math.sqrt(Math.pow(C.x-A.x,2)+ Math.pow(C.y-A.y,2));
          joinRad = Math.acos((BC*BC+AB*AB-AC*AC)/(2*BC*AB));
          joinAngle = (joinRad * 180) / Math.PI
      } 
      return joinAngle
    }

    // hip-knee-ankle joints to get knee angle
    leftKneeAngle = find_angle(11,13,15)
    rightKneeAngle = find_angle(12,14,16)

    function classifyPose() {
      // left OR right knee must be of sit up angle
      // X OR Y distance (depending on position) of elbows and knees should be far from each other
      if ((leftKneeAngle <= 120 | rightKneeAngle <= 120)
          && ((Math.abs(leftYDist) >= downHeightTolerance) | (Math.abs(rightYDist) >= downHeightTolerance) 
            |(Math.abs(leftXDist) >= downHeightTolerance) | (Math.abs(righXDist) >= downHeightTolerance))
      ) {
        poseLabel = "DOWN";
        console.log("leftKneeAngle: " + leftKneeAngle);
        console.log("rightKneeAngle: " + rightKneeAngle);
      }
      // left OR right knee must be of sit up angle
      // X AND Y distance of elbows and knees must be near each other
      else if ((leftKneeAngle <= 120 | rightKneeAngle <= 120)
              && (Math.abs(leftYDist) <= upHeightTolerance) && (Math.abs(leftXDist) <= upHeightTolerance)
                |(Math.abs(rightYDist) <= upHeightTolerance) && (Math.abs(righXDist) <= upHeightTolerance)
      ) {
        poseLabel = "UP";
        console.log("leftKneeAngle: " + leftKneeAngle);
        console.log("rightKneeAngle: " + rightKneeAngle);
      }
      console.log("poseLabel: " + poseLabel);

      if (lastPose == "DOWN" && poseLabel == "UP") {
        console.log("current: " + poseLabel);
        console.log("prev pose: "+lastPose);
        console.log("current leftYDist: " + leftYDist);
        console.log("current leftXDist: " + leftXDist);
        console.log("prev leftYDist: " + lastLeftYDist);
        console.log("prev leftXDist: " + lastLeftXDist);
        console.log("current rightYDist: " + rightYDist);
        console.log("current rightXDist: " + rightXDist);
        console.log("prev rightYDist: " + lastRightYDist);
        console.log("prev rightXDist: " + lastRightXDist);
        audio.play();
        count++;
      }
      lastPose =  poseLabel
      lastLeftYDist =  leftYDist
      lastRightYDist =  rightYDist
    }

    classifyPose();

  }
  setTimeout(sitUp, 100);
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