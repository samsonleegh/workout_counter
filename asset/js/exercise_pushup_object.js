/* 
Push Up 
*/
function countRep() {
    if (pose) {
      /* Rule base push up counter */
      let confidenceThreshold = 0.35;
      let downHeightTolerance = 50;
      let leftYDist;
      let rightYDist;
      let leftCount;
      let rightCount;

      function jointYDistEvaluate(pose, joint1, joint2, confidenceThreshold){
        /*
        Calculate vertical distance between joints
        */
        let jointDist = null;
        if (pose.keypoints[joint1].score >= confidenceThreshold && pose.keypoints[joint2].score >= confidenceThreshold) {
          jointDist = pose.keypoints[joint1].position.y - pose.keypoints[joint2].position.y;;
        }
        return jointDist;
      }

      // y distance left shoulder to left elbow
      leftYDist = jointYDistEvaluate(pose, 5, 7, confidenceThreshold);
      // y distance right shoulder to right elbow
      rightYDist = jointYDistEvaluate(pose, 6, 8, confidenceThreshold);

      // left rep count
      if (leftYDist) {
        leftCount = pushUpCountCheckRule(leftYDist, prevLeftYDist, downHeightTolerance);
        prevLeftYDist = leftYDist;
      }

      // right rep count
      if (rightYDist) {
        rightCount = pushUpCountCheckRule(rightYDist, prevRightYDist, downHeightTolerance);
        prevRightYDist = rightYDist;
      }

      if (leftCount || rightCount) {
        audio.play();
        count++;
      }
    }
    setTimeout(countRep, 100)
  

  function pushUpCountCheckRule(currentYDist, prevYDist, downHeightTolerance) {
    if ((Math.abs(currentYDist) <= downHeightTolerance) && (Math.abs(prevYDist) > downHeightTolerance)) {
      // Count Rep
      return true;
    } else {
      return false;
    }
  }
}

