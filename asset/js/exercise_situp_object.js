function countRep(){
  if (pose) {
    /* Rule base sit up counter */
    let confidenceThreshold = 0.7;
    let downHeightTolerance = 180;
    let upHeightTolerance = 50;
    let kneeAngleTolerance = 100;
    let leftYDist;
    let rightYDist;
    let leftXDist;
    let rightXDist;
    let rightKneeAngle;
    let leftKneeAngle;
  
    function jointYDistEvaluate(joint1, joint2, confidenceThreshold){
      /*
      Calculate vertical distance between joints
      */
      let jointDist = null;
      if (pose.keypoints[joint1].score >= confidenceThreshold && pose.keypoints[joint2].score >= confidenceThreshold) {
        jointDist = pose.keypoints[joint1].position.y - pose.keypoints[joint2].position.y;;
      } 
      return jointDist;
    }
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

    function find_angle(joint1,joint2,joint3) {
      /*
      * Calculates the angle ABC (in radians) 
      *
      * joint1 first point, ex: {x: 0, y: 0}
      * joint3 second point
      * joint2 center point
      */      
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

    function classifyPose() {
      // left OR right knee must be of sit up angle
      // X OR Y distance (depending on position) of elbows and knees should be far from each other
      if ((leftKneeAngle <= kneeAngleTolerance | rightKneeAngle <= kneeAngleTolerance)
          && ((Math.abs(leftYDist) >= downHeightTolerance) | (Math.abs(rightYDist) >= downHeightTolerance) 
            |(Math.abs(leftXDist) >= downHeightTolerance) | (Math.abs(righXDist) >= downHeightTolerance))
      ) {
        poseLabel = "DOWN";
        // console.log("leftKneeAngle: " + leftKneeAngle);
        // console.log("rightKneeAngle: " + rightKneeAngle);
      }
      // left OR right knee must be of sit up angle
      // X AND Y distance of elbows and knees must be near each other
      else if ((leftKneeAngle <= kneeAngleTolerance | rightKneeAngle <= kneeAngleTolerance)
              && (Math.abs(leftYDist) <= upHeightTolerance) && (Math.abs(leftXDist) <= upHeightTolerance)
                |(Math.abs(rightYDist) <= upHeightTolerance) && (Math.abs(righXDist) <= upHeightTolerance)
      ) {
        poseLabel = "UP";
        // console.log("leftKneeAngle: " + leftKneeAngle);
        // console.log("rightKneeAngle: " + rightKneeAngle);
      }
      // console.log("poseLabel: " + poseLabel);

      if (lastPose == "DOWN" && poseLabel == "UP") {
        // console.log("current: " + poseLabel);
        // console.log("prev pose: "+lastPose);
        // console.log("current leftYDist: " + leftYDist);
        // console.log("current leftXDist: " + leftXDist);
        // console.log("prev leftYDist: " + lastLeftYDist);
        // console.log("prev leftXDist: " + lastLeftXDist);
        // console.log("current rightYDist: " + rightYDist);
        // console.log("current rightXDist: " + rightXDist);
        // console.log("prev rightYDist: " + lastRightYDist);
        // console.log("prev rightXDist: " + lastRightXDist);
        audio.play();
        count++;
      }
      lastPose =  poseLabel
      lastLeftYDist =  leftYDist
      lastRightYDist =  rightYDist
      lastLeftXDist =  leftXDist
      lastRightXDist =  rightXDist
    }
    // distance between elbow and knees
    leftYDist = jointYDistEvaluate(7, 13, confidenceThreshold);
    rightYDist = jointYDistEvaluate(8, 14, confidenceThreshold);
    leftXDist = jointXDistEvaluate(7, 13, confidenceThreshold);
    righXDist = jointXDistEvaluate(8, 14, confidenceThreshold);

    // hip-knee-ankle joints to get knee angle
    leftKneeAngle = find_angle(11,13,15)
    rightKneeAngle = find_angle(12,14,16)

    classifyPose();

  }
  setTimeout(countRep, 100);
}