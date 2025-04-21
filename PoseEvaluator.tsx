import React, { useEffect, useRef, useState } from 'react';
import {
  FilesetResolver,
  PoseLandmarker,
  NormalizedLandmark
} from '@mediapipe/tasks-vision';
import { checkSquat, checkPushup, JointName } from './rules';
import AnnotationOverlay from './AnnotationOverlay';

const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';

const connections: [number, number][] = [
  [11,13],[13,15],[12,14],[14,16],
  [23,25],[25,27],[24,26],[26,28],
  [11,12],[23,24],[11,23],[12,24]
];

const jointToIndex: Record<JointName, number> = {
  knee: 25,
  hip: 23,
  elbow: 13
};

interface Props {
  exercise: 'squat' | 'pushup';
  onBack: () => void;
}

export default function PoseEvaluator({ exercise, onBack }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [landmarks, setLandmarks] = useState<NormalizedLandmark[]>([]);
  const [problems, setProblems]   = useState<JointName[]>([]);
  const [phase, setPhase]         = useState<'down'|'up'|null>(null);
  const [reps, setReps]           = useState(0);
  const [fps, setFps]             = useState(0);

  useEffect(() => {
    let landmarker: PoseLandmarker|null = null;
    let running = true, lastTs = performance.now(), frames = 0;

    (async () => {
      const size = 640;
      const video = videoRef.current!;
      const canvas = canvasRef.current!;
      video.width = canvas.width = size;
      video.height = canvas.height = size;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: size, height: size }
      });
      video.srcObject = stream;
      await video.play();

      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10/wasm'
      );
      landmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: MODEL_URL },
        runningMode: 'VIDEO'
      });

      const ctx = canvas.getContext('2d')!;

      const loop = async () => {
        if (!running || !landmarker) return;
        ctx.drawImage(video, 0, 0, size, size);
        const result = landmarker.detectForVideo(canvas, performance.now());
        const multi = result.landmarks ?? [];
        if (multi.length) {
          const lm = multi[0];
          setLandmarks(lm);

          // phase detection & rep count (squat only)
          if (exercise === 'squat') {
            const hip = lm[23], knee = lm[25], ankle = lm[27];
            const kneeAngle = Math.acos(
              ((hip.x - knee.x)*(ankle.x - knee.x) + (hip.y - knee.y)*(ankle.y - knee.y)) /
              (Math.hypot(hip.x-knee.x,hip.y-knee.y)*Math.hypot(ankle.x-knee.x,ankle.y-knee.y))
            ) * (180/Math.PI);
            if (kneeAngle < 140 && phase !== 'down') setPhase('down');
            if (kneeAngle > 160 && phase === 'down') {
              setPhase('up');
              setReps(r=>r+1);
            }
          }

          // rule checks
          const { problematicJoints } =
            exercise === 'squat'
              ? checkSquat(lm)
              : checkPushup(lm);
          setProblems(problematicJoints);

          // draw skeleton & keypoints
          const badIdx = problematicJoints.map(j=>jointToIndex[j]);
          ctx.lineWidth = 2;
          for (let [i,j] of connections) {
            ctx.strokeStyle = badIdx.includes(i)||badIdx.includes(j) ? 'red' : 'lime';
            ctx.beginPath();
            ctx.moveTo(lm[i].x*size, lm[i].y*size);
            ctx.lineTo(lm[j].x*size, lm[j].y*size);
            ctx.stroke();
          }
          lm.forEach((p,i)=>{
            ctx.fillStyle = badIdx.includes(i) ? 'red' : 'lime';
            ctx.beginPath();
            ctx.arc(p.x*size, p.y*size, 5, 0, 2*Math.PI);
            ctx.fill();
          });

          // FPS
          frames++;
          const now = performance.now();
          if (now - lastTs >= 1000) {
            setFps(frames);
            frames = 0;
            lastTs = now;
          }
        }
        requestAnimationFrame(loop);
      };
      loop();
    })();

    return () => {
      running = false;
      landmarker?.close();
      const stream = videoRef.current?.srcObject as MediaStream|null;
      if (stream) stream.getTracks().forEach(t=>t.stop());
    };
  }, [exercise, phase]);

  return (
    <div style={{ position: 'relative', width: 640, height: 640, margin: 'auto' }}>
      <video ref={videoRef} playsInline muted style={{ position:'absolute',top:0,left:0 }} />
      <canvas ref={canvasRef} style={{ position:'absolute',top:0,left:0 }} />

      <div className="stats-card">
        <div>Phase: {phase || '–'}</div>
        <div>Reps: {reps}</div>
        <div>FPS: {fps}</div>
      </div>

      <div
        className="feedback-badge"
        style={{ background: problems.length ? 'var(--accent-error)' : 'var(--accent)' }}
      >
        {problems.length
          ? `Fix your ${problems.join(' & ')}`
          : 'Perfect form!'}
      </div>

      <AnnotationOverlay joints={landmarks} problems={problems} />

      <button className="btn" onClick={onBack}
        style={{ position:'absolute', top:10, left:10 }}
      >
        ← Back
      </button>
    </div>
  );
}