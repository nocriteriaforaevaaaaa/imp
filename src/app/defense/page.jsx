"use client";
import React, { useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import * as posenet from "@tensorflow-models/posenet";
import Webcam from "react-webcam";

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const frontReferenceCanvasRef = useRef(null);
  const sideReferenceCanvasRef = useRef(null);
  const [poseData, setPoseData] = useState(null);
  const [comparisonResult, setComparisonResult] = useState("");

  // Front view reference pose coordinates
  const frontReferencePose = {
    nose: { x: 190, y: 80 },
    leftEye: { x: 185, y: 70 },
    rightEye: { x: 195, y: 70 },
    leftShoulder: { x: 180, y: 100 },
    rightShoulder: { x: 180, y: 100 },
    leftElbow: { x: 160, y: 130 },
    leftWrist: { x: 180, y: 100 },
    rightElbow: { x: 240, y: 100 },
    rightWrist: { x: 320, y: 100 },
    leftHip: { x: 170, y: 200 },
    rightHip: { x: 170, y: 200 },
    leftKnee: { x: 160, y: 280 },
    rightKnee: { x: 190, y: 280 },
    leftAnkle: { x: 150, y: 360 },
    rightAnkle: { x: 200, y: 360 },
  };

  const boxingTargets = {
    front: [
      { x: 320, y: 100, label: "Straight Punch" },
      { x: 320, y: 140, label: "Body Punch" },
    ],
    side: [
      { x: 320, y: 100, label: "Straight Punch Extension" },
      { x: 320, y: 140, label: "Body Shot Extension" },
    ],
  };

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

      drawCanvas(pose, videoWidth, videoHeight, canvasRef);
      drawFrontReference(frontReferenceCanvasRef);
      drawCapturedPose(pose, sideReferenceCanvasRef);
    }
  };

  const drawCanvas = (pose, videoWidth, videoHeight, canvas) => {
    if (!canvas.current) return;
    const ctx = canvas.current.getContext("2d");
    canvas.current.width = videoWidth;
    canvas.current.height = videoHeight;

    ctx.clearRect(0, 0, videoWidth, videoHeight);

    const connections = [
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

    pose.keypoints.forEach((keypoint) => {
      if (keypoint.score > 0.6) {
        const { x, y } = keypoint.position;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = "blue";
        ctx.fill();
      }
    });

    connections.forEach(([partA, partB]) => {
      const pointA = pose.keypoints.find((kp) => kp.part === partA);
      const pointB = pose.keypoints.find((kp) => kp.part === partB);

      if (pointA.score > 0.6 && pointB.score > 0.6) {
        ctx.beginPath();
        ctx.moveTo(pointA.position.x, pointA.position.y);
        ctx.lineTo(pointB.position.x, pointB.position.y);
        ctx.strokeStyle = "blue";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });
  };

  const drawFrontReference = (canvas) => {
    if (!canvas.current) return;
    const ctx = canvas.current.getContext("2d");
    const width = 400;
    const height = 480;
    canvas.current.width = width;
    canvas.current.height = height;

    ctx.clearRect(0, 0, width, height);

    const connections = [
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

    ctx.strokeStyle = "#666";
    ctx.lineWidth = 2;
    connections.forEach(([partA, partB]) => {
      ctx.beginPath();
      ctx.moveTo(frontReferencePose[partA].x, frontReferencePose[partA].y);
      ctx.lineTo(frontReferencePose[partB].x, frontReferencePose[partB].y);
      ctx.stroke();
    });

    Object.values(frontReferencePose).forEach(({ x, y }) => {
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = "#666";
      ctx.fill();
    });
  };

  const drawCapturedPose = (pose, canvas) => {
    if (!canvas.current) return;
    const ctx = canvas.current.getContext("2d");
    const width = 400;
    const height = 480;
    canvas.current.width = width;
    canvas.current.height = height;

    ctx.clearRect(0, 0, width, height);

    const scaleX = width / 640;
    const scaleY = height / 480;

    const connections = [
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

    pose.keypoints.forEach((keypoint) => {
      if (keypoint.score > 0.6) {
        const { x, y } = keypoint.position;
        ctx.beginPath();
        ctx.arc(x * scaleX, y * scaleY, 5, 0, 2 * Math.PI);
        ctx.fillStyle = "blue";
        ctx.fill();
      }
    });

    connections.forEach(([partA, partB]) => {
      const pointA = pose.keypoints.find((kp) => kp.part === partA);
      const pointB = pose.keypoints.find((kp) => kp.part === partB);

      if (pointA.score > 0.6 && pointB.score > 0.6) {
        ctx.beginPath();
        ctx.moveTo(pointA.position.x * scaleX, pointA.position.y * scaleY);
        ctx.lineTo(pointB.position.x * scaleX, pointB.position.y * scaleY);
        ctx.strokeStyle = "blue";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });
  };
  const comparePoses = () => {
    setComparisonResult("Calculating...");

    // Add a delay of 5 seconds
    setTimeout(() => {
      if (poseData && frontReferencePose) {
        let matchCount = 0;
        const threshold = 100; // Larger threshold to allow for more leniency

        // Loop through reference pose points and compare them to current pose
        Object.keys(frontReferencePose).forEach((key) => {
          const referencePoint = frontReferencePose[key];
          const currentPoint = poseData.find((point) => point.part === key);

          if (currentPoint) {
            if (currentPoint.score > 0.6) {
              // Only consider points with high confidence
              const distance = Math.sqrt(
                Math.pow(currentPoint.position.x - referencePoint.x, 2) +
                  Math.pow(currentPoint.position.y - referencePoint.y, 2)
              );

              // Log the distance for debugging
              console.log(`Comparing ${key}:`);
              console.log("Reference Point:", referencePoint);
              console.log("Current Point:", currentPoint);
              console.log("Distance:", distance);

              // If the distance between points is below the threshold, it's a match
              if (distance < threshold) {
                matchCount++;
              }
            }
          }
        });

        console.log("Total matches:", matchCount);

        // Compare the match count with a flexible threshold
        const result =
          matchCount >= 0.5 // Adjust the match threshold if necessary
            ? "Pose is well matched!"
            : "Pose mismatch. Try again!";

        setComparisonResult(result); // Update result text

        // Use speech synthesis to speak the result
        const utterance = new SpeechSynthesisUtterance(result);
        window.speechSynthesis.speak(utterance);
      }
    }, 5000); // Delay for 5 seconds
  };

  React.useEffect(() => {
    runPosenet();
  }, []);

  return (
    <div className="App">
      <div className="flex flex-row items-center justify-center min-h-screen bg-gray-900 p-4 gap-4">
        <div className="relative w-full max-w-2xl">
          <Webcam
            ref={webcamRef}
            style={{
              width: "100%",
              height: "auto",
              maxHeight: "70vh",
              objectFit: "contain",
            }}
          />
          <canvas
            ref={canvasRef}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
            }}
          />
        </div>

        <div className="flex flex-col gap-4">
          <canvas
            ref={frontReferenceCanvasRef}
            style={{
              backgroundColor: "white",
              border: "2px solid #333",
              borderRadius: "8px",
              width: "300px",
              height: "320px",
            }}
          />
          <canvas
            ref={sideReferenceCanvasRef}
            style={{
              backgroundColor: "white",
              border: "2px solid #333",
              borderRadius: "8px",
              width: "300px",
              height: "320px",
            }}
          />
        </div>
      </div>

      <div className="text-center text-white mt-4">
        <p>{comparisonResult}</p>
        <button
          onClick={comparePoses}
          className="mt-4 px-6 py-3 bg-blue-600 text-white font-bold rounded"
        >
          Compare Pose
        </button>
      </div>
    </div>
  );
}

export default App;
