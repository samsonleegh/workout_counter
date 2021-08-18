function countRep(){
    if (pose) {
      /* Rule base sit up counter */
      let confidenceThreshold = 0.7;
      let upHeightTolerance = 50;
      let armpitAngleTolerance = 100;
      let leftYDist;
      let rightYDist;
      let leftArmpitAngle;
      let rightArmpitAngle;
    
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
        // left and right elbow angle must be horizontal to shoulders
        if (
            (leftArmpitAngle <= armpitAngleTolerance && rightArmpitAngle <= armpitAngleTolerance)
        ) {
          poseLabel = "DOWN";
        //   console.log("leftArmpitAngle: " + leftArmpitAngle);
        //   console.log("rightArmpitAngle: " + rightArmpitAngle);
        }
        // wide armpit angle - left and right elbow should be above shoulders
        // YDist of left and right elbow should be close to eyes
        else if ((leftArmpitAngle > armpitAngleTolerance && rightArmpitAngle > armpitAngleTolerance)
                && (Math.abs(leftYDist) <= upHeightTolerance) 
                && (Math.abs(rightYDist) <= upHeightTolerance)
        ) {
          poseLabel = "UP";
        //   console.log("leftArmpitAngle: " + leftArmpitAngle);
        //   console.log("rightArmpitAngle: " + rightArmpitAngle);
        //   console.log("leftYDist: " + leftYDist);
        //   console.log("rightArmpitAngle: " + rightArmpitAngle);
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
      }
      // vertical distance between elbows and eyes
      leftYDist = jointYDistEvaluate(7, 1, confidenceThreshold);
      rightYDist = jointYDistEvaluate(8, 2, confidenceThreshold);
  
      // arm-shoulder-waist joints to get armpit angle
      leftArmpitAngle = find_angle(7,5,11)
      rightArmpitAngle = find_angle(8,6,12)
  
      classifyPose();
  
    }
    setTimeout(countRep, 100);
  }