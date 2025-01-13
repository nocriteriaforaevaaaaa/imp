"use client"
import React from "react";
import { PartyPopper, Star, Crown, Gift } from "lucide-react";

const CelebrationPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 animate-gradient-xy" />

      {/* Floating particles animation */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className={`absolute animate-float-slow bg-white rounded-full opacity-20`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 10 + 5}px`,
              height: `${Math.random() * 10 + 5}px`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 10 + 10}s`,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 bg-white bg-opacity-95 p-8 rounded-2xl shadow-2xl max-w-lg w-full mx-4 text-center transform transition-all duration-700 hover:scale-105">
        {/* Celebration icon with animation */}
        <div className="mb-6 relative">
          <div className="absolute inset-0 animate-spin-slow">
            <Star className="w-16 h-16 text-yellow-400 absolute -top-8 -left-8" />
            <Star className="w-16 h-16 text-yellow-400 absolute -top-8 -right-8" />
            <Star className="w-16 h-16 text-yellow-400 absolute -bottom-8 -left-8" />
            <Star className="w-16 h-16 text-yellow-400 absolute -bottom-8 -right-8" />
          </div>
          <div className="animate-bounce">
            <PartyPopper className="w-20 h-20 text-yellow-500 mx-auto" />
          </div>
        </div>

        {/* Celebration text */}
        <h1 className="text-4xl font-bold text-gray-800 mb-4 animate-fade-in">
          Congratulations!
        </h1>
        <p className="text-xl text-gray-600 mb-8 animate-fade-in-delay">
          You've completed the trial period! 🎉
        </p>

        {/* Premium features */}
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-6 rounded-xl mb-8">
          <Crown className="w-12 h-12 text-purple-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Unlock Premium Features
          </h2>
          <ul className="text-left space-y-3 mb-6">
            <li className="flex items-center">
              <Gift className="w-5 h-5 text-purple-500 mr-2" />
              <span>Access to 100+ exclusive exercises</span>
            </li>
            <li className="flex items-center">
              <Gift className="w-5 h-5 text-purple-500 mr-2" />
              <span>Personalized workout plans</span>
            </li>
            <li className="flex items-center">
              <Gift className="w-5 h-5 text-purple-500 mr-2" />
              <span>Progress tracking & analytics</span>
            </li>
          </ul>
        </div>

        {/* CTA Button */}
        <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 px-8 rounded-full shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl animate-pulse">
          Join Premium Now
        </button>
      </div>

      <style jsx>{`
        @keyframes gradient-xy {
          0%,
          100% {
            background-size: 400% 400%;
            background-position: left top;
          }
          50% {
            background-size: 200% 200%;
            background-position: right bottom;
          }
        }
        .animate-gradient-xy {
          animation: gradient-xy 15s ease infinite;
        }
        .animate-float-slow {
          animation: float 20s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin 10s linear infinite;
        }
        .animate-fade-in {
          animation: fadeIn 1s ease-out;
        }
        .animate-fade-in-delay {
          animation: fadeIn 1s ease-out 0.5s backwards;
        }
        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-100px);
          }
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default CelebrationPage;
