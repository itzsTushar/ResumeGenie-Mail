"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.login({ email, password });
      router.push("/account");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-container auth-wrapper">
      <aside className="auth-aside">
        <span className="eyebrow">WELCOME BACK</span>
        <h2>Your next opportunity starts with a good application.</h2>
        <p className="muted">
          Return to your account to manage your resume and prepare personalized
          job application emails.
        </p>
      </aside>

      <section className="panel auth-form">
        <h1>Sign in</h1>
        <p className="muted">
          Enter your account details to continue.
        </p>

        <form className="auth-fields" onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              className="input"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              className="input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="status-message status-error" role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="button button-primary"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="muted" style={{ marginTop: 24, fontSize: 14 }}>
          First time here?{" "}
          <Link href="/register" className="text-primary">
            Create an account
          </Link>
        </p>
      </section>
    </div>
  );
}
