function countRep(){
    if (pose) {
      let confidenceThreshold = 0.7;
      let XDistTolerance = 100;
      let leftXDist;
      let rightXDist;

      function jointXDistEvaluate(joint1, joint2, confidenceThreshold){
        /*
        Calculate horizontal distance between joints
        */
        let jointDist = null;
        if (pose.keypoints[joint1].score >= confidenceThreshold && pose.keypoints[joint2].score >= confidenceThreshold) {
          jointDist = pose.keypoints[joint1].position.x - pose.keypoints[joint2].position.x;;
        } 
        return jointDist;
      }
  
      function classifyPose() {
        // left ear on same axis as left shoulder
        if (
            (Math.abs(leftXDist) <= XDistTolerance)
        ) {
          poseLabel = "LEFT";
          console.log("leftXDist: " + leftXDist);
        }

        // right ear on same axis as right shoulder
        else if (
                  (Math.abs(rightXDist) <= XDistTolerance)
        ) {
          poseLabel = "RIGHT";
          console.log("rightXDist: " + rightXDist);
        }
        // console.log("poseLabel: " + poseLabel);
  
        if (lastPose == "LEFT" && poseLabel == "RIGHT") {
          // console.log("current: " + poseLabel);
          // console.log("prev pose: "+lastPose);
          audio.play();
          count++;
        }
        lastPose =  poseLabel
        lastLeftXDist =  leftXDist
        lastRightXDist =  rightXDist
      }
      // horizontal distance between ears and shoulders
      leftXDist = jointXDistEvaluate(3, 5, confidenceThreshold);
      rightXDist = jointXDistEvaluate(4, 6, confidenceThreshold);
      classifyPose();
  
    }
    setTimeout(countRep, 100);
  }