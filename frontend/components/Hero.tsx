"use client";

import { useState } from "react";
import AuthModal from "./auth/AuthModal";

export default function Hero() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <>
      <main className="overflow-hidden">
        <section className="relative isolate">
          <div className="pointer-events-none absolute -left-40 top-10 -z-10 h-96 w-96 rounded-full bg-violet-600/20 blur-[120px]" />
          <div className="pointer-events-none absolute -right-40 top-32 -z-10 h-96 w-96 rounded-full bg-indigo-500/20 blur-[120px]" />

          <div className="mx-auto grid min-h-[690px] max-w-7xl items-center gap-16 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:py-24">
            <div>
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/[0.08] px-4 py-2 text-sm text-violet-200">
                <span className="h-2 w-2 rounded-full bg-violet-400" />
                Your AI-powered job application assistant
              </div>

              <h1 className="max-w-2xl text-5xl font-bold leading-[1.1] tracking-tight text-white sm:text-6xl lg:text-7xl">
                Your resume.
                <br />
                Your next job.
                <br />
                <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-indigo-400 bg-clip-text text-transparent">
                  One smart email.
                </span>
              </h1>

              <p className="mt-7 max-w-xl text-base leading-8 text-slate-400 sm:text-lg">
                Stop writing the same job application emails over and over.
                Let AI turn your resume and job details into personalized,
                professional emails ready for you to review and send.
              </p>

              <div className="mt-9 flex flex-col gap-4 sm:flex-row">
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="inline-flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-7 py-4 font-semibold text-white shadow-xl shadow-violet-900/30 transition hover:-translate-y-0.5 hover:shadow-violet-800/40"
                >
                  Create your first email
                  <span aria-hidden="true">→</span>
                </button>

                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] px-7 py-4 font-medium text-slate-200 transition hover:bg-white/[0.07]"
                >
                  See how it works
                </a>
              </div>

              <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-400">
                <span><span className="mr-2 text-violet-400">✓</span>Personalized emails</span>
                <span><span className="mr-2 text-violet-400">✓</span>Resume-based content</span>
                <span><span className="mr-2 text-violet-400">✓</span>You stay in control</span>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-xl">
              <div className="absolute -inset-5 rounded-[2rem] bg-gradient-to-br from-violet-600/20 to-indigo-600/10 blur-2xl" />

              <div className="relative rounded-2xl border border-white/10 bg-[#101525] p-4 shadow-2xl shadow-black/40 sm:p-6">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-lg text-violet-300">
                      ✳
                    </div>
                    <div>
                      <p className="font-semibold text-white">Email Studio</p>
                      <p className="mt-1 text-xs text-slate-500">Personalized application</p>
                    </div>
                  </div>

                  <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
                    Preview
                  </span>
                </div>

                <div className="mt-6 space-y-5">
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">
                      Company
                    </p>
                    <div className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.025] p-3.5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/15 font-bold text-indigo-300">
                        C
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">Your dream company</p>
                        <p className="mt-1 text-xs text-slate-500">Software Developer · Fresher</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">
                      Generated email
                    </p>

                    <div className="rounded-xl border border-white/[0.08] bg-[#0b0f1b] p-4 sm:p-5">
                      <p className="text-sm font-semibold text-slate-100">
                        Subject: Application for Software Developer
                      </p>

                      <div className="my-4 h-px bg-white/[0.07]" />

                      <div className="space-y-3 text-sm leading-6 text-slate-400">
                        <p>Dear Hiring Team,</p>
                        <p>
                          I am writing to express my interest in the Software
                          Developer position. My background in computer
                          science and experience building Python-based
                          applications align with the role.
                        </p>
                        <p>
                          I would welcome the opportunity to discuss how I
                          could contribute to your team...
                        </p>
                      </div>

                      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] pt-4">
                        <span className="text-xs text-slate-500">AI-generated preview</span>
                        <span className="rounded-lg bg-violet-500/15 px-3 py-2 text-xs font-medium text-violet-300">
                          Ready to review
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-3 rounded-xl border border-violet-400/15 bg-violet-400/[0.06] p-3.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-400/10 text-violet-300">
                    ✦
                  </span>
                  <div>
                    <p className="text-sm font-medium text-white">Tailored to your profile</p>
                    <p className="mt-1 text-xs text-slate-400">
                      Generated using your resume and job details
                    </p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-5 -left-4 hidden rounded-xl border border-white/10 bg-[#151b2c] px-4 py-3 shadow-xl sm:block">
                <p className="text-xs text-slate-400">Your next application</p>
                <p className="mt-1 text-sm font-semibold text-white">A little less work. A lot more focus.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="border-t border-white/[0.07] bg-white/[0.015]">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-400">
                Built for your job search
              </p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Less repetitive writing.
                <br />
                More time for opportunities.
              </h2>
              <p className="mt-5 leading-7 text-slate-400">
                Everything you need to prepare personalized job application
                emails in one simple workflow.
              </p>
            </div>

            <div className="mt-14 grid gap-5 md:grid-cols-3">
              <Feature
                number="01"
                title="Your resume, ready"
                description="Keep your resume and professional profile available to use when preparing your next application."
              />
              <Feature
                number="02"
                title="AI-written emails"
                description="Generate a professional email tailored to the company, position, and information you provide."
              />
              <Feature
                number="03"
                title="Your applications"
                description="Manage company and HR details, review generated messages, and send emails through your connected workflow."
              />
            </div>
          </div>
        </section>

        <section id="how-it-works" className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-400">
                Simple workflow
              </p>
              <h2 className="mt-4 text-3xl font-bold leading-tight text-white sm:text-4xl">
                From resume to application in three steps.
              </h2>
              <p className="mt-5 max-w-lg leading-7 text-slate-400">
                Spend less time on repetitive tasks and more time preparing
                for the opportunities that matter.
              </p>
            </div>

            <div className="space-y-4">
              <Step number="01" title="Upload your resume" description="Provide your resume so the application can use your professional background." />
              <Step number="02" title="Enter company details" description="Add the company, HR contact, and job description for your application." />
              <Step number="03" title="Generate, review, and send" description="Let AI draft your email, check the content, and send it using your configured email service." />
            </div>
          </div>
        </section>

        <section className="px-5 pb-20 sm:px-8">
          <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-violet-400/20 bg-gradient-to-br from-violet-600/20 via-[#15142b] to-indigo-600/10 px-6 py-14 text-center sm:px-12">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Make your next application count.
            </h2>
            <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-300">
              Set up your profile and prepare your first personalized job
              application email.
            </p>
            <button
              onClick={() => setIsAuthOpen(true)}
              className="mt-8 rounded-xl bg-white px-7 py-3.5 font-semibold text-slate-950 transition hover:bg-violet-100"
            >
              Get started for free <span aria-hidden="true">→</span>
            </button>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/[0.08]">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-7 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>© {new Date().getFullYear()} ResumeGenie-Mail</p>
          <p>Make every application more personal.</p>
        </div>
      </footer>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
    </>
  );
}

function Feature({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-7 transition hover:-translate-y-1 hover:border-violet-400/30 hover:bg-white/[0.04]">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/15 text-sm font-bold text-violet-300">
        {number}
      </div>
      <h3 className="mt-6 text-lg font-semibold text-white">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-400">{description}</p>
    </div>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-5 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-sm font-bold text-violet-300">
        {number}
      </div>
      <div>
        <h3 className="font-semibold text-white">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
      </div>
    </div>
  );
}
