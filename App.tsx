import React, { useState } from 'react';
import PoseEvaluator from './PoseEvaluator';

type Exercise = 'squat' | 'pushup' | null;

export default function App() {
  const [exercise, setExercise] = useState<Exercise>(null);

  return (
    <div style={{ width: '100%' }}>
      <div className="app-header">Real‑Time Exercise Evaluator</div>
      {!exercise ? (
        <div className="control-panel">
          <button className="btn" onClick={() => setExercise('squat')}>
            Start Squats
          </button>
          <button className="btn" onClick={() => setExercise('pushup')}>
            Start Push‑Ups
          </button>
        </div>
      ) : (
        <PoseEvaluator exercise={exercise} onBack={() => setExercise(null)} />
      )}
    </div>
  );
}