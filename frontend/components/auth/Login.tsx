"use client";

import { useState } from "react";
import OTPInput from "./OTPInput";

export default function Login() {
  const [otp, setOtp] = useState("");
  return (
    <form className="flex flex-col gap-6">

      {/* Email */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Email Address
        </label>

        <input
          type="email"
          placeholder="Enter your email"
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

      {/* Login */}
      <button
        type="submit"
        className="w-full h-11 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
      >
        Login
      </button>

    </form>
  );
}
