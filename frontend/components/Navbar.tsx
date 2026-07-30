"use client";

import Link from "next/link";
import { useState } from "react";
import AuthModal from "./auth/AuthModal";

export default function Navbar() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <>
      <header className="w-full h-16 bg-[#f7f7f7] border-b border-gray-200">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-6">

          {/* Left Side */}
          <div className="flex items-center gap-4">
            <button className="text-2xl">
              ☰
            </button>

            <h1 className="text-2xl font-bold">
              ResumeGenie-Mail
            </h1>
          </div>

          {/* Right Side */}
          <nav
            className="flex items-center gap-8
              [&>a]:transition-all
              [&>a]:duration-300
              [&>a]:ease-in-out
              [&>a]:hover:scale-110
              [&>a]:hover:text-blue-600"
          >
            <Link href="/">Home</Link>

            <Link href="/resume">Resume</Link>

            <button
              onClick={() => setIsAuthOpen(true)}
              className="transition-all duration-300 ease-in-out hover:scale-110 hover:text-blue-600"
            >
              Login
            </button>
          </nav>

        </div>
      </header>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
    </>
  );
}
