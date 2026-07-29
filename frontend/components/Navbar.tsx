"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <header className="w-full h-16 border-g bg-#f7f7f7">
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
	<nav className="flex items-center gap-8
                [&>a]:transition-all
                [&>a]:duration-300
                [&>a]:ease-in-out
                [&>a]:hover:scale-110
                [&>a]:hover:text-blue-600">
	  <Link href="/">Home</Link>
	  <Link href="/resume">Resume</Link>
	  <Link href="/login">Login</Link>
	</nav>

      </div>
    </header>
  );
}
