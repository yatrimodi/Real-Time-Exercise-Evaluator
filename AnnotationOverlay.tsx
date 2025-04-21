import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { NormalizedLandmark } from '@mediapipe/tasks-vision';
import { JointName } from './rules';

interface Props {
  joints: NormalizedLandmark[];
  problems: JointName[];
}

const jointToIndex: Record<JointName, number> = {
  knee: 25,
  hip: 23,
  elbow: 13
};

export default function AnnotationOverlay({ joints, problems }: Props) {
  const mount = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mount.current;
    if (!container) return;

    // Three.js scene stub (for future 3D arrows/text)
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 10);
    camera.position.z = 2;
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(200, 200);
    container.appendChild(renderer.domElement);

    // Overlay HTML labels
    problems.forEach((joint, i) => {
      const lm = joints[jointToIndex[joint]];
      const label = document.createElement('div');
      label.textContent = `${joint.toUpperCase()} ISSUE`;
      Object.assign(label.style, {
        position: 'absolute',
        top: `${lm.y * 640 - 20 * (i + 1)}px`,
        left: `${lm.x * 640 + 10}px`,
        color: 'red',
        background: 'rgba(0,0,0,0.5)',
        padding: '2px 4px',
        fontSize: '12px',
        borderRadius: '4px',
      });
      container.appendChild(label);
    });

    const animate = () => {
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    return () => {
      renderer.dispose();
      if (container) container.innerHTML = '';
    };
  }, [joints, problems]);

  return <div ref={mount} style={{ position: 'absolute', top: 0, left: 0 }} />;
}