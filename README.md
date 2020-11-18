# Workout Counter
![GitHub release (latest by date including pre-releases)](https://img.shields.io/badge/release-v1.0-blue)
![GitHub last commit](https://img.shields.io/badge/last%20commit-Nov%2020-yellow)

While most computer vision pose estimation models have high accuracy, they are usually heavy in size and difficult to deploy. The introduction of [TensorFlow.js](https://www.tensorflow.org/js/) for [posenet](https://github.com/tensorflow/tfjs-models/tree/master/posenet) has allowed real-time human pose estimation in the browser. The aim of workout counter is to make use of the light-weighted posenet model wrapped in javascript for functional purposes. We have built a workout classifier on top of a posenet model to count the no. of repetition of various exercises. The intent is to build a platform where people could have easy access to workout counter to motivate their exercises and correct their postures.

## Demo-Preview - access Workout Counter over [here](https://fitcounter.herokuapp.com/)
![Random GIF](./images/convai_smile.gif) 

## Table of contents

- [Project](#workout-counter)
- [Demo-Preview](#demo-preview)
- [Table of contents](#table-of-contents)
- [Model Architecture](#model-architecture)
- [Usage](#usage)
- [Deployment](#deployment)
- [References](#references)
- [License](#license)
- [Footer](#footer)

## Model Architecture
The underlying pre-trained model from tensorflow.js uses the following specifications:

| Specification | Details |
| ------ | ------ |
| Model | ResNet50 |
| outputStride | 32 |
| Input Resolution | 161 |
| Detection Type | Single |

Following which, there are two approaches to build a classifying layer on top of the pre-trained layer.

1) <i>Machine-learning based classifier.</i> This approach feeds the output of the pre-trained layer (34 joint co-ordinates of the posture - eyes, elbows, knees, etc.) into a model to learn the exercise movements. The benefit of the approach would be that the learning of the model <b>to identify various components of an exercise pose</b>, only if a human correctly perform these components would the motion be classified as a count. The cons, however, is the <b>requirement of extensive dataset</b> in terms of camera angle and positioning of the various exercises - simply because the machine will not be able to learn/classify exercise in camera positions which it has not captured before.

2) <i>Rule-based classifier.</i> This approach uses various coded rules to identify particular exercise movements. Only when all rules are hit before an exercise position is counted. The benefit of <b>the approach allows generalisability</b> - while the previous approach requires dataset on different camera angles and positions to be trained, a simplistic rule-based method works no matter the camera angle or human's position. However the downside would be the ease to trick the system into counting exercises as long as simple rules are hit i.e. <b>too stringent rules and the rules are difficult to generalise across different positions/angles while too simple rules and the human does not even need to perform the exercise correctly before triggering the counter.</b>

A machine-learning classifer was used before moving to the rule-based classifier due to ease of generalisation. However, a future hybrid approach and/or more exetensive dataset trained on could help make the machine-learning classifier a better approach for certain exercises.

## Usage

*Folder structure*:
```
    WORKOUT_COUNTER                   # Main project folder
    ├── 1_collect                     # data collection folder
    │   ├── index.html                # interface to collect the video data
    │   ├── preprocess_json.py        # preprocess the data collected into json
    │   ├── sketch.js                 # javascript for data collection
    │   ├── style.css                 # css formats
    ├── 2_train                       # model training folder
    │   ├── data                      # collected data in json format  
    │   ├── index.html                # interface to train the model
    │   ├── ml5.min.js                # ml5 javascript
    │   ├── sketch.js                 # javascript for model training
    │   ├── style.css                 # css formats
    ├── asset                         # model training folder
    │   ├── css                       # folder of css formats
    │   ├── js                        # folder of each exercise javascript
    │   ├── models                    # exercise models' weights in json
    │   ├── sound                     # audio for the exercise count
    ├── armup.html                    # interface for exercise
    ├── index.html                    # interface for links to the exercises
    ├── pushup.html                   # interface for exercise
    ├── situp.html                    # interface for exercise
```

*Data Preprocessing*

For the machine-learning classifier approach, a pre-processing and model training pipeline is required. In your terminal, `cd` into the collection folder `1_collect`. In the `sketch.js` script, update line 35-67 to the number of poses you want to collect data on. Currently there are only two poses - 'UP' and 'DOWN'. Use the command `python3 -m http.server` to start the interface on http://localhost:8000/. Press '1' to start the recording to collect the 'UP' posture for 10 secs, the audio will signal the end of collection. Press '2' for the 'DOWN' posture. Press 's' to save the data as json. After the collection of multiple json files, run the `preprocess_json.py` script to merge the data together into a single json file. Push this file to `2_collect/data` folder.

*Model Training*

In your terminal, `cd` into the model training folder `2_train`.  In the `sketch.js` script, update line 15-46 to the model architecture you require. The current classification model specification is as follows:

| Specification | Details |
| ------ | ------ |
| Layer1 | 32 nodes |
| Layer1 Act. | ReLU |
| Layer2 | 16 nodes |
| Layer2 Act. | ReLU |
| Class Layer | 2 nodes |
| Class Act. | Sigmoid |
| Epochs | 40 |
| Data Normalisation | True |

After which, Use the command `python3 -m http.server` to start the interface on http://localhost:8000/. The training would start and the model weights will be downloaded automatically. Save these weights into `asset/models` folder. 

### Deployment

For deployment if using the machine-leaerning based model, go to the needed exercise.html script - for example `armup.html`, change line 14 source into `asset/js/archive_exercise_situp.js`. `cd` into the work counter folder. Use the command `python3 -m http.server` to start the interface on http://localhost:8000/. Choose the exercise and it should start working after loading for a few seconds.

### References

https://github.com/tensorflow/tfjs-models/tree/master/posenet <br>
https://ml5js.org/reference/api-PoseNet/
