"use client";
import React, { useState, useEffect, useRef } from "react";
import { Mic, Send } from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";

const TherapyBot = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [conversation, setConversation] = useState("");
  const chatContainerRef = useRef(null);
  const speechSynthRef = useRef(null);
  const voicesRef = useRef([]);

  const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  useEffect(() => {
    initializeSpeech();
    startSession();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeSpeech = () => {
    speechSynthRef.current = window.speechSynthesis;
    voicesRef.current = speechSynthRef.current?.getVoices() || [];
    speechSynthRef.current?.addEventListener("voiceschanged", () => {
      voicesRef.current = speechSynthRef.current.getVoices();
    });
  };

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  };

  const speakText = async (text) => {
    if (!speechSynthRef.current) return;
    speechSynthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voice =
      voicesRef.current.find(
        (v) => v.lang.startsWith("en") && v.name.includes("Female")
      ) || voicesRef.current[0];
    utterance.voice = voice;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    speechSynthRef.current.speak(utterance);
  };

  const startSession = async () => {
    const greeting =
      "Hello, I'm Dr. Sarah, your therapeutic AI assistant. I'm here to listen and support you. How are you feeling today?";
    addMessage("bot", greeting);
    await speakText(greeting);
  };

  const generateResponse = async (userInput) => {
    const prompt = `As Dr. Sarah, a professional therapist, respond empathetically to: "${userInput}". Context of conversation: ${conversation}. 
    Be warm, supportive, and insightful. Focus on understanding emotions and providing therapeutic insights. Keep response concise but meaningful.Console them with positive words make them feel good.`;

    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      return "I hear you. Can you tell me more about how that makes you feel?";
    }
  };

  const handleUserResponse = async (userInput) => {
    if (!userInput.trim() || isSpeaking) return;
    setInputText("");
    addMessage("user", userInput);
    setConversation((prev) => `${prev} User: ${userInput} `);

    setIsSpeaking(true);
    const response = await generateResponse(userInput);
    addMessage("bot", response);
    await speakText(response);
    setConversation((prev) => `${prev} Dr. Sarah: ${response} `);
  };

  const handleRecord = () => {
    if (isSpeaking) return;
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      await handleUserResponse(transcript);
    };
    recognition.start();
  };

  const addMessage = (type, content) => {
    setMessages((prev) => [
      ...prev,
      {
        type,
        content,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-xl">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            Therapy Session with Dr. Sarah
          </h2>
        </div>

        <div
          ref={chatContainerRef}
          className="h-96 overflow-y-auto p-4 space-y-4"
        >
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.type === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                <p>{message.content}</p>
                <span className="text-xs opacity-75 block mt-1">
                  {message.timestamp}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t p-4 flex items-center space-x-2">
          <button
            onClick={handleRecord}
            disabled={isSpeaking}
            className={`p-2 rounded-full ${
              isRecording ? "bg-red-500" : "bg-gray-200 hover:bg-gray-300"
            } disabled:opacity-50`}
          >
            <Mic className="w-5 h-5 text-gray-700" />
          </button>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) =>
              e.key === "Enter" && handleUserResponse(inputText)
            }
            placeholder="Share your thoughts..."
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isRecording || isSpeaking}
          />
          <button
            onClick={() => handleUserResponse(inputText)}
            disabled={!inputText.trim() || isRecording || isSpeaking}
            className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-gray-300"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TherapyBot;
