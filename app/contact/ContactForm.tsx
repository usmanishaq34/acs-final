"use client";

import { useState } from "react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_RE = /^[\p{L}\s'.,]+$/u;
const NAME_ALLOWED_RE = /[^\p{L}\s'.,]/gu;

type FieldErrors = {
  name?: string;
  company?: string;
  email?: string;
  message?: string;
};

function RequiredMark() {
  return <span className="text-red-600" aria-hidden="true"> *</span>;
}

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value.replace(NAME_ALLOWED_RE, "");
    setName(cleaned);
    if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
  };

  const handleEmailBlur = () => {
    const value = email.trim();
    if (value.length === 0) {
      setErrors((prev) => ({ ...prev, email: undefined }));
      return;
    }
    if (!EMAIL_RE.test(value)) {
      setErrors((prev) => ({ ...prev, email: "Enter a valid email address." }));
    } else {
      setErrors((prev) => ({ ...prev, email: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;

    const nameValue = name.trim();
    const company = (data.company ?? "").trim();
    const emailValue = email.trim();
    const message = (data.message ?? "").trim();

    const nextErrors: FieldErrors = {};
    if (!nameValue) nextErrors.name = "Name is required.";
    else if (!NAME_RE.test(nameValue)) nextErrors.name = "Name can only include letters, spaces, and ' , .";
    if (!company) nextErrors.company = "Company is required.";
    if (!emailValue) nextErrors.email = "Email is required.";
    else if (!EMAIL_RE.test(emailValue)) nextErrors.email = "Enter a valid email address.";
    if (!message) nextErrors.message = "Message is required.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, name: nameValue, company, email: emailValue, message }),
      });
      setStatus(res.ok ? "success" : "error");
    } catch (err) {
      console.error("Contact form submit failed:", err);
      setStatus("error");
    }
  };

  if (status === "success") return (
    <div className="card p-8 lg:p-10 bg-white border-2 border-black flex flex-col items-center justify-center text-center gap-4 min-h-[380px]">
      <div className="w-14 h-14 rounded-full bg-lime flex items-center justify-center text-black text-2xl font-bold">✓</div>
      <h3 className="text-2xl font-bold text-black">Message sent!</h3>
      <p className="text-sm text-ink-60 leading-relaxed max-w-xs">We'll be in touch within one business day.</p>
    </div>
  );

  const fieldClass = (hasError?: string) =>
    `w-full px-4 py-3 border rounded-md text-black focus:outline-none ${
      hasError ? "border-red-500 focus:border-red-500" : "border-ink-20 focus:border-black"
    }`;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-black uppercase tracking-wider mb-2" htmlFor="name">
            Name<RequiredMark />
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={name}
            onChange={handleNameChange}
            inputMode="text"
            aria-invalid={!!errors.name}
            className={fieldClass(errors.name)}
          />
          {errors.name && <p className="mt-1.5 text-xs text-red-600">{errors.name}</p>}
        </div>
        <div>
          <label className="block text-xs font-bold text-black uppercase tracking-wider mb-2" htmlFor="company">
            Company<RequiredMark />
          </label>
          <input id="company" name="company" type="text" required aria-invalid={!!errors.company} className={fieldClass(errors.company)} />
          {errors.company && <p className="mt-1.5 text-xs text-red-600">{errors.company}</p>}
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-black uppercase tracking-wider mb-2" htmlFor="email">
          Email<RequiredMark />
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={email}
          onChange={handleEmailChange}
          onBlur={handleEmailBlur}
          aria-invalid={!!errors.email}
          className={fieldClass(errors.email)}
        />
        {errors.email && <p className="mt-1.5 text-xs text-red-600">{errors.email}</p>}
      </div>

      <div>
        <label className="block text-xs font-bold text-black uppercase tracking-wider mb-2" htmlFor="revenue">Project Size</label>
        <select id="revenue" name="revenue" className="w-full px-4 py-3 border border-ink-20 rounded-md text-black focus:border-black focus:outline-none bg-white">
          <option>Select Project Size</option>
          <option>Small ($5K - 10K)</option>
          <option>Medium ($10K - 50K)</option>
          <option>Large ($50K - 100K)</option>
          <option>Enterprise ($50M+)</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-bold text-black uppercase tracking-wider mb-2" htmlFor="message">
          What is eating the most hours?<RequiredMark />
        </label>
        <textarea id="message" name="message" rows={4} required aria-invalid={!!errors.message} className={fieldClass(errors.message)} />
        {errors.message && <p className="mt-1.5 text-xs text-red-600">{errors.message}</p>}
      </div>

      {status === "error" && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-4 py-3">
          Something went wrong. Please try again or email directly.
        </p>
      )}

      <button type="submit" disabled={status === "loading"} className="btn-primary w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed">
        {status === "loading" ? "Sending..." : "Send request →"}
      </button>
    </form>
  );
}
