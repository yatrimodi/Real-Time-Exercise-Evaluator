import { NormalizedLandmark } from '@mediapipe/tasks-vision';

export type JointName = 'knee' | 'hip' | 'elbow';

/** Compute angle A–B–C in degrees */
function angleABC(
  A: NormalizedLandmark,
  B: NormalizedLandmark,
  C: NormalizedLandmark
) {
  const vx = A.x - B.x, vy = A.y - B.y;
  const wx = C.x - B.x, wy = C.y - B.y;
  const dot = vx * wx + vy * wy;
  const magV = Math.hypot(vx, vy), magW = Math.hypot(wx, wy);
  return Math.acos(dot / (magV * magW)) * (180 / Math.PI);
}

export function checkSquat(landmarks: NormalizedLandmark[]): {
  kneeOK: boolean; backOK: boolean; problematicJoints: JointName[];
} {
  const hip = landmarks[23],
        knee = landmarks[25],
        ankle = landmarks[27],
        shoulder = landmarks[11];
  const kneeAngle = angleABC(hip, knee, ankle);
  const backAngle = angleABC(knee, hip, shoulder);
  const problems: JointName[] = [];
  if (kneeAngle >= 100) problems.push('knee');
  if (backAngle <= 160) problems.push('hip');
  return {
    kneeOK: kneeAngle < 100,
    backOK: backAngle > 160,
    problematicJoints: problems
  };
}

export function checkPushup(landmarks: NormalizedLandmark[]): {
  elbowOK: boolean; bodyOK: boolean; problematicJoints: JointName[];
} {
  const shoulder = landmarks[11],
        elbow = landmarks[13],
        wrist = landmarks[15],
        hip = landmarks[23],
        ankle = landmarks[27];
  const elbowAngle = angleABC(shoulder, elbow, wrist);
  const bodyAngle = angleABC(shoulder, hip, ankle);
  const problems: JointName[] = [];
  if (elbowAngle <= 100) problems.push('elbow');
  if (bodyAngle <= 160) problems.push('hip');
  return {
    elbowOK: elbowAngle > 100,
    bodyOK: bodyAngle > 160,
    problematicJoints: problems
  };
}