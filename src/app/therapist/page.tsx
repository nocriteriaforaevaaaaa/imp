"use client"
import React, { useState, useEffect, useCallback, useRef } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Mic, Send } from "lucide-react";

interface Message {
  type: "user" | "bot";
  content: string;
  timestamp: string;
}

interface TherapyResponse {
  question: string;
  response: string;
  timestamp: string;
}

const TherapistBot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [therapyState, setTherapyState] = useState<"initial" | "ready" | "session" | "complete">("initial");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<string[]>([]);
  const [responses, setResponses] = useState<TherapyResponse[]>([]);

  const speechSynthRef = useRef<SpeechSynthesis | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const genAI = new GoogleGenerativeAI("AIzaSyBYl-MSPpfn_ClaR-3fIbmxVUtyeW0rKuY");
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // Initialize speech synthesis
  useEffect(() => {
    speechSynthRef.current = window.speechSynthesis;
    
    const loadVoices = () => {
      voicesRef.current = speechSynthRef.current?.getVoices() || [];
      if (voicesRef.current.length > 0 && therapyState === "initial") {
        startSession();
      }
    };

    loadVoices();
    speechSynthRef.current?.addEventListener("voiceschanged", loadVoices);
    
    return () => {
      speechSynthRef.current?.cancel();
      speechSynthRef.current?.removeEventListener("voiceschanged", loadVoices);
      recognitionRef.current?.abort();
    };
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages]);

  const speakText = useCallback(async (text: string): Promise<void> => {
    if (!speechSynthRef.current || !voicesRef.current.length) return;

    return new Promise((resolve) => {
      speechSynthRef.current?.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      const englishVoice = voicesRef.current.find(voice => 
        voice.lang.startsWith('en') && voice.name.includes('Natural')
      ) || voicesRef.current.find(voice => 
        voice.lang.startsWith('en')
      ) || voicesRef.current[0];
      
      utterance.voice = englishVoice;
      utterance.rate = 0.9;
      utterance.pitch = 1;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        if (therapyState === "session") {
          setTimeout(() => startListening(), 500);
        }
        resolve();
      };
      
      speechSynthRef.current?.speak(utterance);
    });
  }, [therapyState]);

  const startListening = useCallback(() => {
    if (isSpeaking || !window.SpeechRecognition) return;

    if (!recognitionRef.current) {
      recognitionRef.current = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
    }

    recognitionRef.current.onstart = () => setIsRecording(true);
    recognitionRef.current.onend = () => setIsRecording(false);
    recognitionRef.current.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
      await handleUserResponse(transcript);
    };

    recognitionRef.current.start();
  }, [isSpeaking]);

  const handleUserResponse = async (userInput: string) => {
    if (!userInput.trim()) return;
    
    addMessage("user", userInput);
    
    if (therapyState === "ready") {
      if (userInput.toLowerCase().includes("yes")) {
        await speakText("I'm here to listen and help. Let's begin our session.");
        setTherapyState("session");
        return;
      }
      await speakText("Please let me know when you're ready to start.");
      return;
    }

    if (therapyState === "session") {
      setResponses(prev => [...prev, {
        question: questions[currentQuestionIndex],
        response: userInput,
        timestamp: new Date().toISOString()
      }]);

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        concludeSession();
      }
    }
  };

  const fetchTherapyQuestions = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const result = await model.generateContent(
        `Generate 5 empathetic therapy questions focused on mental well-being and emotional support. 
         Make questions natural and conversational.`
      );
      const questionsList = result.response.text()
        .split(/\d+\.\s+/)
        .filter(q => q.trim().length > 0)
        .map(q => q.trim());
      
      setQuestions(questionsList);
    } catch (error) {
      setQuestions([
        "How have you been feeling lately?",
        "What brings you here today?",
        "Can you tell me about any challenges you're facing?",
        "How do you usually cope with stress?",
        "What would you like to achieve from our sessions?"
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const startSession = async () => {
    await fetchTherapyQuestions();
    const greeting = "Hello, I'm your AI therapist. I'm here to listen and support you. Would you like to begin our session?";
    addMessage("bot", greeting);
    await speakText(greeting);
    setTherapyState("ready");
  };

  const concludeSession = async () => {
    setTherapyState("complete");
    const conclusion = "Thank you for sharing with me today. Remember, seeking help is a sign of strength.";
    addMessage("bot", conclusion);
    await speakText(conclusion);
    
    console.log("Session Summary:", {
      timestamp: new Date().toISOString(),
      questions,
      responses
    });
  };

  const addMessage = (type: "user" | "bot", content: string) => {
    setMessages(prev => [...prev, {
      type,
      content,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 bg-gray-50 rounded-lg shadow-lg">
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">AI Therapy Session</h2>
          {therapyState === "session" && (
            <p className="text-sm text-gray-600">
              Question {currentQuestionIndex + 1} of {questions.length}
            </p>
          )}
        </div>
        
        <div ref={chatContainerRef} className="h-96 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
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
            onClick={startListening}
            disabled={isSpeaking || isLoading}
            className={`p-2 rounded-full ${
              isRecording 
                ? "bg-red-500 text-white" 
                : "bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100"
            }`}
          >
            <Mic size={20} />
          </button>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleUserResponse(inputText)}
            placeholder="Speak or type your response..."
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isRecording || isSpeaking || isLoading}
          />
          <button
            onClick={() => handleUserResponse(inputText)}
            disabled={!inputText.trim() || isRecording || isSpeaking || isLoading}
            className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-gray-300"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TherapistBot;