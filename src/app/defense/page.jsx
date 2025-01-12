"use client";
import React, { useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import * as posenet from "@tensorflow-models/posenet";
import Webcam from "react-webcam";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const frontReferenceCanvasRef = useRef(null);
  const sideReferenceCanvasRef = useRef(null);

  const [step, setStep] = useState("scan");

  const [countDown, setCountDown] = useState(undefined);

  const [straightPosScan, setStraightPosScan] = useState([]);

  const [holdPosScan, setHoldPosScan] = useState([]);

  const [repetitionCounter, setRepetitionCounter] = useState(0);

  const runPosenet = async () => {
    const net = await posenet.load({
      inputResolution: { width: 640, height: 480 },
      scale: 0.8,
    });

    setInterval(() => {
      detect(net);
    }, 100);
  };
  const [poseData, setPoseData] = useState([]);

  const posBuffer = useRef([]);
  const posRef = useRef([]);
  posRef.current = poseData;
  const stepRef = useRef("scan");
  stepRef.current = step;
  const holdRef = useRef([]);
  holdRef.current = holdPosScan;

  const impParts = [
    "leftShoulder",
    "rightShoulder",
    "leftElbow",
    "leftWrist",
    "rightElbow",
    "leftKnee",
    "rightKnee",
  ];

  const lastCountRef = useRef(undefined);

  const detect = async (net) => {
    if (webcamRef.current && webcamRef.current.video.readyState === 4) {
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      const pose = await net.estimateSinglePose(video);

      if (!pose) return;
      posBuffer.current.push(pose.keypoints);

      if (posBuffer.current.length > 2) {
        let sumPos = posBuffer.current[0];
        posBuffer.current.map((p, i) => {
          if (i == 0) return;

          sumPos = sumPos.map((pos, j) => {
            pos.score += p[j].score;
            pos.position.x += p[j].position.x;
            pos.position.y += p[j].position.y;
            return pos;
          });
        });

        const avgPos = sumPos.map((pos, i) => {
          pos.score /= posBuffer.current.length;
          pos.position.x /= posBuffer.current.length;
          pos.position.y /= posBuffer.current.length;
          return pos;
        });
        setPoseData(avgPos);
        posRef.current = avgPos;
        if (stepRef.current == "repetition") {
          let correct = true;
          const pos = avgPos;
          const comparePos = holdRef.current;

          pos.forEach((p, i) => {
            if (!impParts.includes(p.part)) return;

            const distance = Math.sqrt(
              Math.pow(p.position.x - comparePos[i].position.x, 2) +
                Math.pow(p.position.y - comparePos[i].position.y, 2)
            );

            if (distance > 40) {
              correct = false;
            }
          });

          if (
            correct &&
            (!lastCountRef.current ||
              new Date().getTime() - lastCountRef.current > 2000)
          ) {
            lastCountRef.current = new Date().getTime();
            setRepetitionCounter((p) => p + 1);
          }
        }

        posBuffer.current = [];
      }

      if (!pose) return;
      drawCanvas(pose.keypoints, videoWidth, videoHeight, canvasRef);
      drawCapturedPose(pose.keypoints, sideReferenceCanvasRef);
    }
  };

  if (repetitionCounter > 0) console.log(repetitionCounter);

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

    pose.forEach((keypoint) => {
      if (keypoint.score > 0.6) {
        const { x, y } = keypoint.position;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = "blue";
        ctx.fill();
      }
    });

    connections.forEach(([partA, partB]) => {
      const pointA = pose.find((kp) => kp.part === partA);
      const pointB = pose.find((kp) => kp.part === partB);

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

    pose.forEach((keypoint) => {
      if (keypoint.score > 0.6) {
        const { x, y } = keypoint.position;
        ctx.beginPath();
        ctx.arc(x * scaleX, y * scaleY, 5, 0, 2 * Math.PI);
        ctx.fillStyle = "blue";
        ctx.fill();
      }
    });

    connections.forEach(([partA, partB]) => {
      const pointA = pose.find((kp) => kp.part === partA);
      const pointB = pose.find((kp) => kp.part === partB);

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

  React.useEffect(() => {
    runPosenet();
    const message = "Do this pose for five times.";
    const timeout = setTimeout(() => {
      const speech = new SpeechSynthesisUtterance(message);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(speech);
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  const handleRepetition = () => {
    setCountDown(30);
    const id = setInterval(() => {
      if (id && countDown == 0) {
        setCountDown(undefined);
        clearInterval(id);
        setStep("scan");
        return;
      }
      setCountDown((p) => {
        return p == 0 ? undefined : p - 1;
      });
    }, 1000);
  };

  const holdPosHandler = () => {
    setCountDown(5);

    for (let i = 0; i <= 5; i++) {
      setTimeout(() => {
        if (i == 5) {
          setHoldPosScan(poseData);
          setStep("repetition");
          handleRepetition();
        }
        setCountDown((p) => {
          return p == 0 ? undefined : p - 1;
        });
      }, i * 1000);
    }
  };

  const scanStart = () => {
    setCountDown(5);

    for (let i = 0; i <= 5; i++) {
      setTimeout(() => {
        if (i == 5) {
          setStraightPosScan(poseData);
          setStep("holdPos");
          console.log(poseData);
        }
        setCountDown((p) => {
          return p == 0 ? undefined : p - 1;
        });
      }, i * 1000);
    }
  };

  return (
    <div className="App">
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex flex-col">
        {/* Header Section */}
        <div className="flex items-center justify-between p-6">
          <div className="text-2xl font-bold text-red-600">
            Reps: {repetitionCounter} / 5
          </div>
          <div className="flex items-center gap-4">
            <Button className="bg-red-600 hover:bg-red-700">
              Next Exercise
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="relative w-full max-w-2xl">
          <Webcam
            ref={webcamRef}
            style={{
              width: "100%",
              height: "auto",
              maxHeight: "70vh",
              objectFit: "contain",
              transform: "scaleX(-1)",
            }}
            videoConstraints={{
              facingMode: "user",
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
            ref={sideReferenceCanvasRef}
            style={{
              backgroundColor: "white",
              border: "2px solid #333",
              borderRadius: "8px",
              width: "300px",
              height: "320px",
            }}
          />
          {step == "scan" && (
            <button
              onClick={scanStart}
              className="mt-4 px-6 py-3 bg-green-600 hover:bg-green-700 font-bold rounded"
            >
              Scan me
            </button>
          )}
        </div>
      </div>

      <div className="text-center text-white mt-4">
        {step == "holdPos" && (
          <button
            onClick={holdPosHandler}
            className="mt-4 px-6 py-3 bg-red-600 hover:bg-red-700 font-bold rounded"
          >
            Start Hold Pos
          </button>
        )}

        {countDown != undefined && (
          <div className="mt-4 px-6 py-3 bg-red-600 hover:bg-red-700 font-bold rounded">
            {countDown}
          </div>
        )}

        {countDown != undefined && step == "repetition" && (
          <div className="mt-4 px-6 py-3  bg-green-600 hover:bg-green-700 font-bold rounded">
            Do it for 30 sec
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
