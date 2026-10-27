"use client";

import { useState, type FormEvent } from "react";
import { api } from "@/lib/api";

type MailForm = {
  companyname: string;
  hrname: string;
  hrmail: string;
  desc: string;
};

export default function MailGenerationPage() {
  const [form, setForm] = useState<MailForm>({
    companyname: "",
    hrname: "",
    hrmail: "",
    desc: "",
  });

  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [copyMessage, setCopyMessage] = useState("");
  const [error, setError] = useState("");

  function updateField(
    field: keyof MailForm,
    value: string,
  ) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  async function handleGenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setCopyMessage("");

    try {
      const result = await api.generateMail(form);

      if (typeof result?.data?.content !== "string") {
        throw new Error("The server response did not contain email content.");
      }

      setContent(result.data.content);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not generate the email.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!content.trim()) return;

    try {
      await navigator.clipboard.writeText(content);
      setCopyMessage("Your edited email has been copied.");
    } catch {
      setCopyMessage(
        "Copy was blocked by the browser. Select the email text and copy it manually.",
      );
    }
  }

  return (
    <div className="page-container">
      <div className="page-heading">
        <span className="eyebrow">AI EMAIL ASSISTANT</span>
        <h1>Mail Generation</h1>
        <p className="muted">
          Describe the opportunity, generate a draft, then make it your own.
        </p>
      </div>

      <div className="panel" style={{ marginBottom: 24 }}>
        <form onSubmit={handleGenerate}>
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="companyname">Company name</label>
              <input
                className="input"
                id="companyname"
                value={form.companyname}
                onChange={(e) => updateField("companyname", e.target.value)}
                placeholder="e.g. Acme Technologies"
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="hrname">HR name</label>
              <input
                className="input"
                id="hrname"
                value={form.hrname}
                onChange={(e) => updateField("hrname", e.target.value)}
                placeholder="e.g. Priya Sharma"
                required
              />
            </div>

            <div className="form-field form-field-full">
              <label htmlFor="hrmail">HR email address</label>
              <input
                className="input"
                id="hrmail"
                type="email"
                value={form.hrmail}
                onChange={(e) => updateField("hrmail", e.target.value)}
                placeholder="hr@company.com"
                required
              />
            </div>

            <div className="form-field form-field-full">
              <label htmlFor="desc">Job description</label>
              <textarea
                className="textarea"
                id="desc"
                value={form.desc}
                onChange={(e) => updateField("desc", e.target.value)}
                placeholder="Paste the job description, requirements and role details..."
                required
              />
            </div>
          </div>

          {error && (
            <div className="status-message status-error" role="alert">
              {error}
            </div>
          )}

          <div className="action-row">
            <button
              className="button button-primary"
              type="submit"
              disabled={loading}
            >
              {loading ? "Generating email..." : "✳ Generate Email"}
            </button>
          </div>
        </form>
      </div>

      <section className="panel" style={{ marginBottom: 48 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: 21 }}>Your email draft</h2>
            <p className="muted" style={{ margin: "4px 0 0", fontSize: 13 }}>
              Editable. Review it before copying.
            </p>
          </div>

          <button
            className="button button-secondary"
            type="button"
            onClick={handleCopy}
            disabled={!content.trim()}
          >
            Copy Email
          </button>
        </div>

        <label
          htmlFor="generated-content"
          style={{
            display: "block",
            fontSize: 13,
            fontWeight: 700,
            marginBottom: 8,
          }}
        >
          Generated content
        </label>

        <textarea
          id="generated-content"
          className="textarea email-editor"
          value={content}
          onChange={(event) => {
            setContent(event.target.value);
            setCopyMessage("");
          }}
          placeholder="Your generated email will appear here. You can also write or paste your own email."
          spellCheck
        />

        {copyMessage && (
          <div className="status-message status-success" role="status">
            {copyMessage}
          </div>
        )}
      </section>
    </div>
  );
}
