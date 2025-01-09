"use client";
import React from "react";
import {
  Navigation2,
  Heart,
  Shield,
  ArrowRight,
  LocateIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();

  const features = [
    {
      title: "Emergency Location",
      icon: <Navigation2 size={32} className="text-red-900" />,
      description: "Share your real-time location with trusted contacts",
      route: "/location",
    },
    {
      title: "AI Therapy",
      icon: <Heart size={32} className="text-red-900" />,
      description: "Talk to our empathetic AI therapist anytime",
      route: "/therapist",
    },
    {
      title: "Self Defense",
      icon: <Shield size={32} className="text-red-900" />,
      description: "Learn professional defense techniques",
      route: "/defense",
    },
  ];

  const handleNavigation = (route) => {
    router.push(route);
  };

  return (
    <div className="min-h-screen text-white">
      <div className="max-w-4xl mx-auto p-6">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-red-900 bg-clip-text text-transparent">
            Your Personal Safety Companion
          </h1>
        </header>

        <div className="grid gap-6">
          {features.map((feature, index) => (
            <button
              key={index}
              onClick={() => handleNavigation(feature.route)}
              className="hover:opacity-90 p-6 rounded-2xl shadow-lg transform hover:bg-gray-200 scale-[1.02] transition-all duration-300 border border-red-500"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-white/10 p-3 rounded-xl">
                    {feature.icon}
                  </div>
                  <div className="text-left">
                    <h2 className="text-2xl font-bold mb-1 text-red-500">
                      {feature.title}
                    </h2>
                    <p className="text-red-900">{feature.description}</p>
                  </div>
                </div>
                <ArrowRight className="opacity-70" />
              </div>
            </button>
          ))}
        </div>

        <div className="fixed bottom-6 right-6">
          <button
            onClick={() => {
              router.push("/sos");
            }}
            className="bg-red-600 w-16 h-16 rounded-full shadow-lg hover:bg-red-700 animate-pulse flex items-center justify-center"
          >
            <LocateIcon className="w-8 h-8" />
          </button>
        </div>
      </div>
    </div>
  );
}
