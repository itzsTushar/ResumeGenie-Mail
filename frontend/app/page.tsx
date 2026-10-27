
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

const features = [
  {
    icon: "▤",
    title: "Resume management",
    description:
      "Keep your resume and profile information together, ready for your next application.",
  },
  {
    icon: "✳",
    title: "AI-powered email writing",
    description:
      "Generate a personalized job application email using company, HR and job description details.",
  },
  {
    icon: "✎",
    title: "Edit before you use it",
    description:
      "Review the generated email, make your own changes, and copy the final version.",
  },
];

const steps = [
  {
    number: "STEP 01",
    title: "Set up your account",
    description: "Register and provide your account details.",
  },
  {
    number: "STEP 02",
    title: "Add your resume",
    description: "Upload your resume and fetch its available data.",
  },
  {
    number: "STEP 03",
    title: "Enter job details",
    description: "Provide the company, HR contact and job description.",
  },
  {
    number: "STEP 04",
    title: "Generate and refine",
    description: "Edit the generated email and copy your final draft.",
  },
];

export default function HomePage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    let active = true;

    async function checkAuthentication() {
      try {
        await api.getAccount();

        if (active) {
          setAuthenticated(true);
        }
      } catch {
        if (active) {
          setAuthenticated(false);
        }
      } finally {
        if (active) {
          setCheckingAuth(false);
        }
      }
    }

    void checkAuthentication();

    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <section className="hero">
        <div className="page-container hero-grid">
          <div>
            <span className="eyebrow">
              YOUR JOB APPLICATION WORKSPACE
            </span>

            <h1>
              Make your next application
              <span className="text-primary"> more personal.</span>
            </h1>

            <p className="hero-copy">
              Manage your resume and create tailored job application emails
              with one simple workspace. Spend less time drafting and more
              time preparing for your next opportunity.
            </p>

            <div className="hero-actions">
              {checkingAuth ? (
                <span className="muted">Checking account...</span>
              ) : authenticated ? (
                <>
                  <Link
                    href="/account"
                    className="button button-primary"
                  >
                    My Account <span aria-hidden="true">→</span>
                  </Link>

                  <Link
                    href="/mail-generation"
                    className="button button-secondary"
                  >
                    Generate an email
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="button button-primary"
                  >
                    Sign In <span aria-hidden="true">→</span>
                  </Link>

                  <Link
                    href="/register"
                    className="button button-secondary"
                  >
                    Create an account
                  </Link>
                </>
              )}
            </div>

            <p className="trust-note">
              Your details. Your email. Your final edit.
            </p>
          </div>

          <div
            className="preview-window"
            aria-label="Example email preview"
          >
            <div className="preview-top">
              <span className="preview-dot" />
              <span className="preview-dot" />
              <span className="preview-dot" />
              <span className="preview-title">
                Application email preview
              </span>
            </div>

            <div className="preview-card">
              <div className="preview-label">To</div>
              <div className="preview-line medium" />

              <div
                className="preview-label"
                style={{ marginTop: 22 }}
              >
                Subject
              </div>
              <div className="preview-line" />

              <div
                className="preview-label"
                style={{ marginTop: 22 }}
              >
                Message
              </div>
              <div className="preview-line medium" />
              <div className="preview-line" />
              <div className="preview-line short" />
              <div className="preview-line" />

              <span className="preview-chip">
                Editable email draft
              </span>
            </div>

            <div className="preview-card">
              <div className="preview-label">Your workflow</div>
              <p style={{ marginBottom: 0, fontSize: 13 }}>
                Job details{" "}
                <span className="text-primary">→</span> Generated email{" "}
                <span className="text-primary">→</span> Your final draft
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="services">
        <div className="page-container">
          <div className="section-heading">
            <span className="eyebrow">WHAT YOU CAN DO</span>
            <h2>A simpler way to prepare job applications</h2>
            <p>
              Keep the important parts of your application workflow in one
              place, with you in control of the final email.
            </p>
          </div>

          <div className="feature-grid">
            {features.map((feature) => (
              <article
                className="feature-card"
                key={feature.title}
              >
                <div className="feature-icon" aria-hidden="true">
                  {feature.icon}
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        className="section workflow"
        id="how-it-works"
      >
        <div className="page-container">
          <div className="section-heading">
            <span className="eyebrow">HOW IT WORKS</span>
            <h2>From resume to a ready-to-use email</h2>
            <p>
              A straightforward workflow designed around your existing
              account and email-generation services.
            </p>
          </div>

          <div className="workflow-grid">
            {steps.map((step) => (
              <article
                className="workflow-step"
                key={step.number}
              >
                <span className="step-number">
                  {step.number}
                </span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="page-container">
          <div className="cta-panel">
            <div>
              <h2>
                Ready to prepare your next application?
              </h2>
              <p className="muted">
                {authenticated
                  ? "Continue to your resume tools and mail generation workspace."
                  : "Create an account or sign in to access your resume tools and mail generation workspace."}
              </p>
            </div>

            {!checkingAuth && (
              <Link
                href={
                  authenticated
                    ? "/mail-generation"
                    : "/login"
                }
                className="button button-primary"
              >
                {authenticated
                  ? "Generate an email"
                  : "Get started"}
                <span aria-hidden="true"> →</span>
              </Link>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

