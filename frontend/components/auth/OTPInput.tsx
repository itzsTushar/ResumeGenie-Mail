"use client";

interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function OTPInput({
  value,
  onChange,
}: OTPInputProps) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">
        OTP
      </label>

      <input
        type="text"
        maxLength={6}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter 6-digit OTP"
        className="w-full h-11 px-4 rounded-lg border border-gray-300 outline-none focus:border-blue-500"
      />
    </div>
  );
}
