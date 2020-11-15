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
let lastPose = "No ex"

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
  video = createCapture(VIDEO);
  video.hide();
  poseNet = ml5.poseNet(video, modelLoaded);
  poseNet.on('pose', gotPoses);

  let options = {
    inputs: 34,
    outputs: 2,
    task: 'classification',
    debug: true
  }
  brain = ml5.neuralNetwork(options);
  const modelInfo = {
    model: '../models/pushupmodel/model.json',
    metadata: '../models/pushupmodel/model_meta.json',
    weights: '../models/pushupmodel/model.weights.bin',
  };
  brain.load(modelInfo, brainLoaded);
}

function brainLoaded() {
  console.log('pose classification ready!');
  classifyPose();
}

function classifyPose() {
  if (pose) {
    let inputs = [];
    for (let i = 0; i < pose.keypoints.length; i++) {
      let x = pose.keypoints[i].position.x;
      let y = pose.keypoints[i].position.y;
      inputs.push(x);
      inputs.push(y);
    }
    brain.classify(inputs, gotResult);
  } else {
    poseLabel = 'Start'
    setTimeout(classifyPose, 100);
  }
}

function gotResult(error, results) {
  // console.log(results);
  // console.log(results[0]);
  // console.log(results[0].label.toUpperCase());
  // count_disp.innerHTML = count;
  // console.log(results[0])
  if (results[0].confidence >= 0.8) {
    poseLabel = results[0].label.toUpperCase();
  } 
  if (lastPose == "DOWN" && poseLabel == "UP") {
  // if (down_arr.contains(lastPose) && up_arr.contains(poseLabel)) {
    console.log("lastpose: "+lastPose);
    console.log("current: " + poseLabel);
    console.log("current confidence: " + results[0].confidence);
    audio.play();
    count++;
  }
  // console.log(results[0].confidence);
  classifyPose();
  lastPose =  poseLabel
}


function gotPoses(poses) {
  if (poses.length > 0) {
    pose = poses[0].pose;
    skeleton = poses[0].skeleton;
  }
}


function modelLoaded() {
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
      strokeWeight(2);
      stroke(0);

      line(a.position.x, a.position.y, b.position.x, b.position.y);
    }
    for (let i = 0; i < pose.keypoints.length; i++) {
      let x = pose.keypoints[i].position.x;
      let y = pose.keypoints[i].position.y;
      fill(0);
      stroke(255);
      ellipse(x, y, 16, 16);
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