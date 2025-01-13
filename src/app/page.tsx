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
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const router = useRouter();

  const features = [
    {
      title: "Emergency Location",
      icon: <Navigation2 size={32} className="text-red-600" />,
      description: "Share your real-time location with trusted contacts",
      route: "/sos",
    },
    {
      title: "Self Defense",
      icon: <Shield size={36} className="text-red-600 text-xl" />,
      description: "Learn professional defense techniques",
      route: "/defense",
    },
    {
      title: "AI Therapy",
      icon: <Heart size={32} className="text-red-600" />,
      description: "Talk to our empathetic AI therapist anytime",
      route: "/therapist",
    },
  ];

  const handleNavigation = (route: string) => {
    router.push(route);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto p-6">
        <header className="text-center mb-16 pt-12 animate-fade-in">
          <h1 className="text-5xl font-bold text-red-600 mb-4">
            Your Personal Safety Companion
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Feel secure and supported with our comprehensive personal safety
            solution. We're here for you 24/7, whenever you need us.
          </p>
        </header>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => (
            <button
              key={index}
              onClick={() => handleNavigation(feature.route)}
              className="group p-6 rounded-2xl shadow-lg 
                         bg-white hover:bg-red-50
                         transform hover:scale-105 transition-all duration-300 
                         border border-gray-100 hover:border-red-200"
            >
              <div className="flex flex-col items-center text-center gap-4">
                <div
                  className="bg-red-50 p-4 rounded-xl group-hover:bg-red-100 
                              transition-all duration-300"
                >
                  {feature.icon}
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2 text-red-600">
                    {feature.title}
                  </h2>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
                <ArrowRight
                  className="text-red-600 opacity-0 group-hover:opacity-100 
                           transform group-hover:translate-x-2 
                           transition-all duration-300"
                />
              </div>
            </button>
          ))}
        </div>

        <div className="text-center">
          <Button
            className="bg-red-600 hover:bg-red-700
                       text-white text-lg py-6 px-8 rounded-xl
                       transform hover:scale-105 
                       transition-all duration-300
                       shadow-lg shadow-red-100"
            onClick={() => router.push("/sign-up")}
          >
            Get Started Now
          </Button>
        </div>

        <div className="fixed bottom-6 right-6">
          <button
            onClick={() => router.push("/sos")}
            className="bg-red-600 w-20 h-20 rounded-full 
                       hover:bg-red-700 animate-pulse 
                       flex items-center justify-center
                       transform hover:scale-110 
                       transition-all duration-300
                       shadow-xl shadow-red-200
                       text-white"
          >
            <LocateIcon className="w-10 h-10" />
          </button>
        </div>
      </div>
    </div>
  );
}
