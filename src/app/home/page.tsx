"use client"
import React from 'react';
import { Navigation2, Heart, Shield, ArrowRight } from 'lucide-react';

export default function Dashboard() {
  const features = [
    {
      title: "Emergency Location",
      icon: <Navigation2 size={32} />,
      description: "Share your real-time location with trusted contacts",
      route: "/location",
      color: "bg-red-600"
    },
    {
      title: "AI Therapy",
      icon: <Heart size={32} />,
      description: "Talk to our empathetic AI therapist anytime",
      route: "/therapy",
      color: "bg-red-700"
    },
    {
      title: "Self Defense",
      icon: <Shield size={32} />,
      description: "Learn professional defense techniques",
      route: "/defense",
      color: "bg-red-800"
    }
  ];

  const handleNavigation = (route) => {
    // Navigation logic here
    console.log(`Navigating to ${route}`);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto p-6">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-500 to-white bg-clip-text text-transparent">
            Your Safety Hub
          </h1>
        </header>

        <div className="grid gap-6">
          {features.map((feature, index) => (
            <button
              key={index}
              onClick={() => handleNavigation(feature.route)}
              className={`${feature.color} hover:opacity-90 p-6 rounded-2xl shadow-lg transform hover:scale-[1.02] transition-all duration-300`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-white/10 p-3 rounded-xl">
                    {feature.icon}
                  </div>
                  <div className="text-left">
                    <h2 className="text-2xl font-bold mb-1">{feature.title}</h2>
                    <p className="text-red-100">{feature.description}</p>
                  </div>
                </div>
                <ArrowRight className="opacity-70" />
              </div>
            </button>
          ))}
        </div>

        <div className="fixed bottom-6 right-6">
          <button className="bg-red-600 w-16 h-16 rounded-full shadow-lg hover:bg-red-700 animate-pulse flex items-center justify-center">
            <Shield className="w-8 h-8" />
          </button>
        </div>
      </div>
    </div>
  );
}