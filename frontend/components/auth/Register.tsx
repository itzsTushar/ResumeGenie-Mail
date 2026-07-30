"use client";
import { useState } from "react";
import OTPInput from "./OTPInput";

export default function Register() {
  const [otp, setOtp] = useState("");
  return (
    <form className="flex flex-col gap-5">

      {/* Name */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Full Name
        </label>

        <input
          type="text"
          placeholder="Enter your name"
          className="w-full h-11 px-4 rounded-lg border border-gray-300 outline-none focus:border-blue-500"
        />
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Phone Number
        </label>

        <input
          type="tel"
          placeholder="Enter phone number"
          className="w-full h-11 px-4 rounded-lg border border-gray-300 outline-none focus:border-blue-500"
        />
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Email Address
        </label>

        <input
          type="email"
          placeholder="Enter email"
          className="w-full h-11 px-4 rounded-lg border border-gray-300 outline-none focus:border-blue-500"
        />
      </div>

      {/* Send OTP */}
      <button
        type="button"
        className="w-full h-11 rounded-lg bg-gray-900 text-white hover:bg-black transition"
      >
        Send OTP
      </button>

	<OTPInput
		value={otp}
		onChange={setOtp}
	/>

      {/* Register */}
      <button
        type="submit"
        className="w-full h-11 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
      >
        Register
      </button>

    </form>
  );
}
