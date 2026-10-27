
"use client";

import { useEffect } from "react";
import Link from "next/link";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({
  isOpen,
  onClose,
}: AuthModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close authentication modal"
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
        className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-900 shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 text-2xl text-slate-500 hover:text-slate-900"
        >
          ×
        </button>

        <h2 id="auth-title" className="text-2xl font-bold">
          ResumeGenie<span className="text-blue-600">-Mail</span>
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Your AI-powered job application assistant
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/register"
            onClick={onClose}
            className="rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Create account
          </Link>

          <Link
            href="/login"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Sign in
          </Link>
        </div>
      </section>
    </div>
  );
}

