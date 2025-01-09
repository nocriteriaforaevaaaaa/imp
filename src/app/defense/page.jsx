"use client";
import React, { useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import * as posenet from "@tensorflow-models/posenet";
import Webcam from "react-webcam";

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const structureCanvasRef = useRef(null); // New canvas for the human structure
  const [poseData, setPoseData] = useState(null);

  const runPosenet = async () => {
    const net = await posenet.load({
      inputResolution: { width: 640, height: 480 },
      scale: 0.8,
    });

    setInterval(() => {
      detect(net);
    }, 100);
  };

  const detect = async (net) => {
    if (webcamRef.current && webcamRef.current.video.readyState === 4) {
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      const pose = await net.estimateSinglePose(video);
      setPoseData(pose.keypoints);

      drawCanvas(pose, video, videoWidth, videoHeight, canvasRef);
      drawStructure(pose.keypoints, structureCanvasRef); // Draw the human structure
    }
  };

  const drawCanvas = (pose, video, videoWidth, videoHeight, canvas) => {
    if (!canvas.current) return;
    const ctx = canvas.current.getContext("2d");
    canvas.current.width = videoWidth;
    canvas.current.height = videoHeight;

    ctx.clearRect(0, 0, videoWidth, videoHeight); // Clear the canvas
    pose.keypoints.forEach((keypoint) => {
      if (keypoint.score > 0.6) {
        const { x, y } = keypoint.position;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = "red";
        ctx.fill();
      }
    });
  };

  const drawStructure = (keypoints, canvas) => {
    if (!canvas.current) return;
    const ctx = canvas.current.getContext("2d");
    const width = 200; // Width of the schematic canvas
    const height = 400; // Height of the schematic canvas
    canvas.current.width = width;
    canvas.current.height = height;

    ctx.clearRect(0, 0, width, height); // Clear the canvas
    ctx.strokeStyle = "blue";
    ctx.lineWidth = 2;

    // Define a mapping for simplified skeleton
    const connections = [
      ["nose", "leftEye"],
      ["nose", "rightEye"],
      ["leftEye", "leftEar"],
      ["rightEye", "rightEar"],
      ["leftShoulder", "rightShoulder"],
      ["leftShoulder", "leftElbow"],
      ["leftElbow", "leftWrist"],
      ["rightShoulder", "rightElbow"],
      ["rightElbow", "rightWrist"],
      ["leftShoulder", "leftHip"],
      ["rightShoulder", "rightHip"],
      ["leftHip", "rightHip"],
      ["leftHip", "leftKnee"],
      ["leftKnee", "leftAnkle"],
      ["rightHip", "rightKnee"],
      ["rightKnee", "rightAnkle"],
    ];

    // Scale the keypoints to fit the schematic canvas
    const scaleFactor = 0.5; // Adjust as needed
    const offsetX = 50; // Center the structure
    const offsetY = 50;

    const scaledKeypoints = keypoints.reduce((acc, keypoint) => {
      if (keypoint.score > 0.6) {
        acc[keypoint.part] = {
          x: keypoint.position.x * scaleFactor + offsetX,
          y: keypoint.position.y * scaleFactor + offsetY,
        };
      }
      return acc;
    }, {});

    // Draw the skeleton
    connections.forEach(([partA, partB]) => {
      if (scaledKeypoints[partA] && scaledKeypoints[partB]) {
        const { x: x1, y: y1 } = scaledKeypoints[partA];
        const { x: x2, y: y2 } = scaledKeypoints[partB];
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    });

    // Draw the keypoints
    Object.values(scaledKeypoints).forEach(({ x, y }) => {
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = "red";
      ctx.fill();
    });
  };

  React.useEffect(() => {
    runPosenet();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        {/* Camera Feed */}
        <Webcam
          ref={webcamRef}
          style={{
            position: "absolute",
            left: "20%",
            textAlign: "center",
            zIndex: 9,
            width: 640,
            height: 480,
          }}
        />

        {/* Overlay Canvas */}
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            left: "20%",
            zIndex: 9,
            width: 640,
            height: 480,
          }}
        />

        {/* Schematic Canvas */}
        <canvas
          ref={structureCanvasRef}
          style={{
            position: "absolute",
            right: "10%",
            top: "20%",
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            border: "1px solid black",
          }}
        />
      </header>
    </div>
  );
}

export default App;
