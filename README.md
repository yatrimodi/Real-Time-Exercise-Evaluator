# 🏋️ Real-Time Exercise Evaluator

A real-time AI-based fitness web application that uses **MediaPipe** for pose detection and **Three.js** for visual feedback, built as part of a technical internship assignment for **Realfy Oasis**.

## 🚀 Features

- 🎥 **Live Webcam Pose Detection** using MediaPipe Pose Landmarker
- 🧠 **Rule-Based Posture Evaluation**
  - Squats: Evaluates back angle, knee bend
  - Push-Ups: Checks elbow angle, chest depth, back alignment
- 🎨 **Visual Feedback**
  - 🟢 Green keypoints for correct posture
  - 🔴 Red keypoints & 3D annotations for incorrect form
- 🔘 **Exercise Selector**
  - Start Squats
  - Start Push-Ups
- 📱 **Mobile Responsive Design**
  - Works on both desktop and mobile browsers

## 🛠️ Technologies Used

| Area            | Tools                                     |
|-----------------|-------------------------------------------|
| Pose Detection  | [MediaPipe Pose Landmarker](https://developers.google.com/mediapipe/solutions/vision/pose_landmarker) |
| Frontend        | React, JavaScript, HTML, CSS              |
| 3D Visualization| Three.js                                  |
| Hosting         | GitHub Pages / Vercel / Netlify           |

## 🧪 How It Works

1. **Choose an Exercise** (Squats or Push-Ups)
2. **Real-Time Pose Tracking** begins
3. Each frame is evaluated against exercise rules:
   - E.g., angle of joints, posture alignment
4. **Visual Feedback** is shown:
   - Incorrect joints are marked in red with Three.js annotations
   - Correct form is marked in green

