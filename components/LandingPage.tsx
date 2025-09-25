"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [activeTab, setActiveTab] = useState("waitlist");

  const handleJoinWaitlist = () => {
    console.log("Email submitted:", email);
    window.location.href = '/product';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 via-purple-600 to-purple-200 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/80 via-purple-700/60 to-purple-300/40"></div>
          <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-8">
        {/* Top Navigation Bar */}
        <div className="mb-8">
          <div className="flex bg-gray-800/90 backdrop-blur-sm rounded-full px-1 py-1 shadow-lg">
            <button
              onClick={() => setActiveTab("waitlist")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${
                activeTab === "waitlist"
                  ? "bg-gray-900 text-white shadow-sm"
                  : "text-white/80 hover:text-white"
              }`}
            >
              Waitlist
            </button>
            <button
              onClick={() => { window.location.href = '/product' }}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${
                activeTab === "product"
                  ? "bg-gray-900 text-white shadow-sm"
                  : "text-white/80 hover:text-white"
              }`}
            >
              Product
            </button>
          </div>
        </div>

        {/* Main Card */}
        <div className="w-full max-w-2xl">
          <div className="bg-gray-800 rounded-3xl pt-4 pb-8 px-8 md:pt-6 md:pb-12 md:px-12 shadow-2xl">
              {/* Logo */}
              <div className="flex items-center justify-center mb-0">
                <div className="flex items-center space-x-1">
                  <div className="w-50 h-50 relative">
                    <Image
                      src="/logo.png"
                      alt="Business Orbit Logo"
                      width={60}
                      height={60}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-6 leading-tight -mt-10">
              Grow Faster With Smart Business Networking
            </h1>

            {/* Description */}
            <p className="text-lg text-gray-200 text-center mb-10 max-w-xl mx-auto leading-relaxed">
              Business Orbit uses AI to simplify professional networking connecting you with people who matter most for your business success.
            </p>

            {/* Email Input and Button */}
            <div className="max-w-md mx-auto mb-8">
              <div className="flex bg-gray-700 border border-white rounded-xl p-1">
                <input
                  type="email"
                  placeholder="Your work email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-transparent text-white placeholder:text-gray-400 px-4 py-3 focus:outline-none rounded-l-lg"
                />
                <button
                  onClick={handleJoinWaitlist}
                  className="bg-gray-200 text-gray-800 hover:bg-gray-100 font-semibold px-6 py-3 whitespace-nowrap transition-colors rounded-xl ml-2 cursor-pointer"
                >
                  Join waitlist
                </button>
              </div>
            </div>

            {/* Footer strip with slightly different background (like screenshot) */}
            <div className="mt-16 -mx-8 md:-mx-12 -mb-8 md:-mb-12 rounded-b-3xl bg-gray-700/60 border-t border-white/10 px-8 md:px-12 py-4">
              <div className="flex flex-col sm:flex-row items-center justify-between text-sm">
                {/* LinkedIn Link */}
                <div className="text-white/80 mb-4 sm:mb-0">
                  Follow Business Orbit on{" "}
                  <a
                    href="#"
                    className="text-white underline hover:text-gray-200 transition-colors"
                  >
                    LinkedIn
                  </a>
                </div>

                {/* Theme Switcher */}
                <div className="flex items-center space-x-2 text-white/80">
                  <span className="text-sm">Dark</span>
                  <span className="text-sm">/</span>
                  <span className="text-sm font-semibold text-white">System</span>
                  <span className="text-sm">/</span>
                  <span className="text-sm">Light</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
