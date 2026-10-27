"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

type AccountData = Record<string, any>;

function formatLabel(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function isInternalField(key: string): boolean {
  return /(^id$|id$|userid|resumeid|skillid|createdat|updatedat|deletedat|password|token)/i.test(
    key
  );
}

function parseData(value: unknown): unknown {
  if (typeof value !== "string") return value;

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function displayPrimitive(value: unknown): ReactNode {
  if (value === null || value === undefined || value === "") {
    return <span className="text-slate-400">Not provided</span>;
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return String(value);
}

function ResumeFields({ data }: { data: unknown }) {
  const parsed = parseData(data);

  if (parsed === null || parsed === undefined) {
    return <p className="text-sm text-slate-500">No information available.</p>;
  }

  if (typeof parsed !== "object") {
    return (
      <p className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">
        {String(parsed)}
      </p>
    );
  }

  if (Array.isArray(parsed)) {
    const items = parsed.filter(
      (item) => item !== null && item !== undefined
    );

    if (!items.length) {
      return <p className="text-sm text-slate-400">None provided.</p>;
    }

    const simpleItems = items.every(
      (item) => typeof item !== "object"
    );

    if (simpleItems) {
      return (
        <div className="flex flex-wrap gap-2">
          {items.map((item, index) => (
            <span
              key={index}
              className="rounded-full bg-blue-50 px-3 py-1.5 text-sm text-blue-700"
            >
              {String(item)}
            </span>
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {items.map((item, index) => (
          <div
            key={index}
            className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5"
          >
            <ResumeFields data={item} />
          </div>
        ))}
      </div>
    );
  }

  const entries = Object.entries(parsed as Record<string, unknown>).filter(
    ([key, value]) =>
      !isInternalField(key) &&
      value !== undefined &&
      key.toLowerCase() !== "__v"
  );

  if (!entries.length) return null;

  return (
    <div className="space-y-4">
      {entries.map(([key, value]) => {
        const isArray = Array.isArray(value);
        const isObject = value !== null && typeof value === "object";

        return (
          <div
            key={key}
            className="min-w-0 border-b border-slate-100 pb-4 last:border-b-0 last:pb-0"
          >
            {isArray || isObject ? (
              <>
                <h4 className="mb-3 text-sm font-semibold text-slate-800">
                  {formatLabel(key)}
                </h4>
                <ResumeFields data={value} />
              </>
            ) : (
              <div className="grid grid-cols-1 gap-1 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-6">
                <span className="text-sm font-medium text-slate-500">
                  {formatLabel(key)}
                </span>
                <div className="min-w-0 break-words text-sm leading-7 text-slate-800">
                  {displayPrimitive(value)}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function AccountPage() {
  const [user, setUser] = useState<AccountData | null>(null);
  const [resumeData, setResumeData] = useState<unknown>(null);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [resume, setResume] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [loading, setLoading] = useState(true);
  const [fetchingResume, setFetchingResume] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadAccount() {
    setLoading(true);
    setError("");

    try {
      const result = await api.getAccount();
      const account = result?.data?.user ?? result?.data;

      if (!account || typeof account !== "object") {
        throw new Error("Unexpected account response from the server.");
      }

      setUser(account);
      setName(account.name ?? account.username ?? "");
      setMobileNo(account.mobileNo ?? "");

      const savedResumes = account.resumes;

      if (
        savedResumes &&
        (Array.isArray(savedResumes)
          ? savedResumes.length > 0
          : typeof savedResumes === "object" &&
            Object.keys(savedResumes).length > 0)
      ) {
        setResumeData(savedResumes);
      } else {
        setResumeData(null);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not load your account."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAccount();
  }, []);

  async function handleFetchResume() {
    setFetchingResume(true);
    setError("");
    setMessage("");

    try {
      const result = await api.fetchResume();
      const extractedData = parseData(result?.data ?? result);

      setResumeData(extractedData);
      setMessage("Resume data fetched successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not fetch resume data."
      );
    } finally {
      setFetchingResume(false);
    }
  }

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("mobileNo", mobileNo);

    if (avatar) formData.append("avatar", avatar);
    if (resume) formData.append("resume", resume);

    try {
      await api.updateProfile(formData);
      setMessage("Your profile was updated successfully.");
      setAvatar(null);
      setResume(null);
      await loadAccount();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not update your profile."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-5 py-12">
        <p className="text-sm text-slate-500">Loading your account...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-12">
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h1 className="text-xl font-bold text-slate-900">
            Unable to load your account
          </h1>
          <p className="mt-3 text-sm text-red-600">{error}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => void loadAccount()}
              className="rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white"
            >
              Try again
            </button>
            <Link
              href="/login"
              className="rounded-lg border border-slate-300 px-4 py-2.5 font-semibold text-slate-700"
            >
              Sign in
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
          Your workspace
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          Account
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Manage your profile and view your extracted resume information.
        </p>
      </header>

      {error && (
        <div
          role="alert"
          className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {message && (
        <div
          role="status"
          className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700"
        >
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(320px,0.85fr)_minmax(0,1.4fr)]">
        <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-100 text-xl font-bold text-blue-700">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt="Profile avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                (name || user.email || "U").charAt(0).toUpperCase()
              )}
            </div>

            <div className="min-w-0">
              <h2 className="break-words text-xl font-bold text-slate-900">
                {name || user.username || "Your profile"}
              </h2>
              <p className="break-all text-sm text-slate-500">
                {user.email || "No email available"}
              </p>
            </div>
          </div>

          <div className="my-6 space-y-4 border-y border-slate-100 py-5">
            {[
              ["Name", name || "Not provided"],
              ["Email", user.email || "—"],
              ["Mobile", mobileNo || "Not provided"],
              ["Resume", user.resume ? "Available" : "Not uploaded"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="grid grid-cols-[90px_minmax(0,1fr)] gap-4 text-sm sm:grid-cols-[100px_minmax(0,1fr)]"
              >
                <span className="text-slate-500">{label}</span>
                <span className="break-words text-right font-semibold text-slate-800">
                  {value}
                </span>
              </div>
            ))}
          </div>

          <h3 className="mb-5 text-lg font-bold text-slate-900">
            Update profile
          </h3>

          <form onSubmit={handleUpdate} className="space-y-5">
            <div>
              <label
                htmlFor="account-name"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Name
              </label>
              <input
                id="account-name"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>

            <div>
              <label
                htmlFor="account-mobile"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Mobile number
              </label>
              <input
                id="account-mobile"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                value={mobileNo}
                onChange={(event) => setMobileNo(event.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="avatar"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Profile avatar
              </label>
              <input
                id="avatar"
                className="block w-full min-w-0 rounded-xl border border-slate-300 p-2.5 text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:font-medium file:text-blue-700"
                type="file"
                accept="image/*"
                onChange={(event) =>
                  setAvatar(event.target.files?.[0] ?? null)
                }
              />
            </div>

            <div>
              <label
                htmlFor="resume"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Upload or replace resume
              </label>
              <input
                id="resume"
                className="block w-full min-w-0 rounded-xl border border-slate-300 p-2.5 text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:font-medium file:text-blue-700"
                type="file"
                accept=".pdf,application/pdf"
                onChange={(event) =>
                  setResume(event.target.files?.[0] ?? null)
                }
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving changes..." : "Save Changes"}
            </button>
          </form>
        </section>

        <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Resume workspace
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                Review the extracted information from your resume.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void handleFetchResume()}
              disabled={fetchingResume || !user.resume}
              className="shrink-0 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {fetchingResume ? "Fetching..." : "Fetch Resume"}
            </button>
          </div>

          <div className="mt-6 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
            <span className="font-semibold text-slate-800">
              Saved resume:
            </span>{" "}
            {user.resume ? "Resume reference available" : "No resume uploaded"}
          </div>

          {!user.resume && (
            <p className="mt-4 text-sm leading-6 text-slate-500">
              Upload a PDF resume and save your profile before fetching its
              information.
            </p>
          )}

          {resumeData !== null ? (
            <div className="mt-7 min-w-0">
              <h3 className="mb-5 text-lg font-bold text-slate-900">
                Extracted resume information
              </h3>
              <ResumeFields data={resumeData} />
            </div>
          ) : (
            user.resume && (
              <div className="mt-7 rounded-xl border border-dashed border-slate-300 px-5 py-10 text-center">
                <h3 className="font-semibold text-slate-800">
                  No resume details loaded
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Select Fetch Resume to extract and display your resume
                  information.
                </p>
              </div>
            )
          )}
        </section>
      </div>
    </main>
  );
}

