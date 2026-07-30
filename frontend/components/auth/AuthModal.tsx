"use client";

import { useState } from "react";
import Register from "./Register";
import Login from "./Login";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({
  isOpen,
  onClose,
}: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<"register" | "login">(
    "register"
  );

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50">

        <div className="w-[600px] h-[650px] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">

          {/* Header */}
          <div className="relative p-6 border-b flex-shrink-0">

            <button
              onClick={onClose}
              className="absolute top-5 right-5 text-2xl text-gray-500 hover:text-black transition"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold text-center">
              ResumeGenie-Mail
            </h2>

            <p className="text-center text-gray-500 text-sm mt-2">
              AI Powered Job Assistant
            </p>

          </div>

          {/* Tabs */}
          <div className="grid grid-cols-2 border-b flex-shrink-0">

            <button
              onClick={() => setActiveTab("register")}
              className={`py-4 font-semibold transition-all ${
                activeTab === "register"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              Register
            </button>

            <button
              onClick={() => setActiveTab("login")}
              className={`py-4 font-semibold transition-all ${
                activeTab === "login"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              Login
            </button>

          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-6">

            {activeTab === "register" ? (
              <Register />
            ) : (
              <Login />
            )}

          </div>

        </div>

      </div>
    </>
  );
}
