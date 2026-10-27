"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  const [otpStep, setOtpStep] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const result = await api.register({
        name,
        username,
        email,
        password,
      });

      setOtpStep(true);
      setMessage(
        result?.message ??
          "Registration successful. Check your email for the OTP.",
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Registration failed.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    try {
      await api.verifyRegistrationOtp({ otp });

      router.push("/account");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "OTP verification failed.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-container auth-wrapper">
      <aside className="auth-aside">
        <span className="eyebrow">GET STARTED</span>

        <h2>
          One workspace for your resume and application emails.
        </h2>

        <p className="muted">
          Create an account to access your profile, resume tools, and
          job application email generation service.
        </p>
      </aside>

      <section className="panel auth-form">
        {!otpStep ? (
          <>
            <h1>Create your account</h1>

            <p className="muted">
              Fill in your details to get started.
            </p>

            <form className="auth-fields" onSubmit={handleRegister}>
              <div className="form-field">
                <label htmlFor="name">Full name</label>
                <input
                  id="name"
                  className="input"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  className="input"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="register-email">Email address</label>
                <input
                  id="register-email"
                  className="input"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="register-password">Password</label>
                <input
                  id="register-password"
                  className="input"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>

              {error && (
                <div
                  className="status-message status-error"
                  role="alert"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="button button-primary"
                disabled={loading}
              >
                {loading ? "Creating account..." : "Register"}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1>Verify your email</h1>

            <p className="muted">
              Enter the OTP sent to <strong>{email}</strong>.
            </p>

            <form className="auth-fields" onSubmit={handleVerify}>
              <div className="form-field">
                <label htmlFor="otp">Verification code</label>
                <input
                  id="otp"
                  className="input"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={otp}
                  onChange={(event) => setOtp(event.target.value)}
                  required
                />
              </div>

              {error && (
                <div
                  className="status-message status-error"
                  role="alert"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="button button-primary"
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </form>
          </>
        )}

        {message && (
          <div className="status-message" role="status">
            {message}
          </div>
        )}

        <p className="muted" style={{ marginTop: 24, fontSize: 14 }}>
          Already registered?{" "}
          <Link href="/login" className="text-primary">
            Sign in
          </Link>
        </p>
      </section>
    </div>
  );
}
