"use client";
import React, { useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import * as posenet from "@tensorflow-models/posenet";
import Webcam from "react-webcam";
import { Camera, Activity, Clock } from "lucide-react";
import FBXViewer from "./3dmodel";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const frontReferenceCanvasRef = useRef(null);
  const sideReferenceCanvasRef = useRef(null);
  const router = useRouter();

  const [step, setStep] = useState("scan");

  const [countDown, setCountDown] = useState(undefined);

  const [straightPosScan, setStraightPosScan] = useState([]);

  const [holdPosScan, setHoldPosScan] = useState([]);

  const [repetitionCounter, setRepetitionCounter] = useState(0);
  const handleNextExercise = () => {
    try {
      router.push("/defense2");
    } catch (error) {
      console.error("Navigation error:", error);
    }
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
    const message = "Are you ready to break some bones?";
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
    setCountDown(10);

    for (let i = 0; i <= 10; i++) {
      setTimeout(() => {
        if (i == 10) {
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

  const renderRightPanel = () => {
    return (
      <div className="relative h-[calc(100%-2rem)] w-full">
        <div className="absolute inset-0">
          <FBXViewer modelPath="/model.fbx" width={200} height={400} />
        </div>

        {(step === "holdPos" || step === "scan") && (
          <div className="absolute inset-0 bg-red-50 rounded-lg overflow-hidden z-10">
            <img
              src={step === "holdPos" ? "/pause.png" : "/scan.png"}
              alt={
                step === "holdPos"
                  ? "Hold position reference"
                  : "Initial position reference"
              }
              className="w-full h-full object-contain"
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-full mx-auto p-4">
        <div className="flex gap-4 h-[85vh]">
          <div className="w-[50%]">
            <div className="relative h-full rounded-xl overflow-hidden bg-gray-900 shadow-xl">
              <Webcam
                ref={webcamRef}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
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

              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                {step === "scan" && (
                  <button
                    onClick={scanStart}
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Camera className="w-5 h-5" />
                    Scan Position
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="w-[25%] flex flex-col gap-4">
            <div className="bg-white rounded-xl shadow-lg border-2 border-red-100 h-full p-4">
              <h2 className="text-red-600 font-semibold mb-3 flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Reference Pose
              </h2>
              <canvas
                ref={sideReferenceCanvasRef}
                className="w-full h-[calc(100%-2rem)] rounded-lg bg-white"
                style={{
                  border: "2px solid #fee2e2",
                }}
              />
            </div>

            {(countDown !== undefined || step === "repetition") && (
              <div className="bg-white rounded-xl shadow-lg border-2 border-red-100 p-4 flex gap-4">
                {countDown !== undefined && (
                  <div className="flex-1 bg-red-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {countDown}
                    </div>
                    <div className="text-sm text-red-500">
                      {step === "repetition" ? "Seconds Left" : "Countdown"}
                    </div>
                  </div>
                )}
                {step === "repetition" && (
                  <div className="flex-1 bg-red-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {repetitionCounter}
                    </div>
                    <div className="text-sm text-red-500">Reps</div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="w-[25%] bg-white rounded-xl shadow-lg border-2 border-red-100 p-4">
            <h2 className="text-red-600 font-semibold mb-3">
              {step === "holdPos"
                ? "Hold Position"
                : step === "scan"
                ? "Initial Position"
                : "Exercise Model"}
            </h2>
            <div className="h-[calc(100%-2rem)]">{renderRightPanel()}</div>
          </div>
        </div>

        <div className="mt-4 flex justify-center">
          {step === "holdPos" && (
            <button
              onClick={holdPosHandler}
              className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors flex items-center gap-2"
            >
              <Clock className="w-5 h-5" />
              Start Hold Position
            </button>
          )}
        </div>
        <Button
          onClick={handleNextExercise}
          className="bg-red-600 hover:bg-red-700"
        >
          Next Exercise
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default App;
