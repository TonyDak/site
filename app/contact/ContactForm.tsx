"use client";

import { useState, type FormEvent } from "react";
import { useLanguage } from "@/components/language/LanguageProvider";
import { Icon } from "@/components/ide/icons";

type Status = "idle" | "loading" | "success" | "error";

export function ContactForm() {
  const { content } = useLanguage();
  const copy = content.contactForm;
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setStatus("loading");
    setMessage("");

    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const detail = String(formData.get("detail") ?? "").trim();

    try {
      // 1. Try sending via backend API (Resend if configured)
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, detail }),
      });

      if (res.ok) {
        setStatus("success");
        setMessage(copy.successMessage || "Message dispatched successfully.");
        form.reset();
        return;
      }
    } catch {
      // Fallback to mailto/gmail draft
    }

    // Fallback: direct Gmail compose
    try {
      const query = new URLSearchParams({
        view: "cm",
        fs: "1",
        to: "duckg2083@gmail.com",
        su: `Portfolio inquiry from ${name}`,
        body: `Hi Duc,\n\n${detail}\n\nFrom: ${name} (${email})`,
      });
      const url = `https://mail.google.com/mail/?${query.toString()}`;
      window.open(url, "_blank", "noopener,noreferrer");
      setStatus("success");
      setMessage(copy.successMessage);
      form.reset();
    } catch {
      setStatus("error");
      setMessage(copy.genericError);
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="form-row">
        <label className="field">
          <span>{copy.nameLabel}</span>
          <input
            className="input"
            name="name"
            required
            autoComplete="name"
            placeholder="Nguyen Van A"
          />
        </label>

        <label className="field">
          <span>{copy.emailLabel}</span>
          <input
            className="input"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="name@company.com"
          />
        </label>
      </div>

      <label className="field">
        <span>{copy.detailsLabel}</span>
        <textarea
          className="textarea"
          name="detail"
          rows={5}
          required
          placeholder="Briefly describe what you are building, timeline, or tech stack..."
        />
      </label>

      {/* Honeypot */}
      <input
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ display: "none" }}
      />

      <div className="form-foot">
        <button type="submit" className="btn btn-cobalt" disabled={status === "loading"}>
          <Icon name="contact" size={14} />
          {status === "loading" ? copy.sendingLabel : copy.submitLabel}
        </button>

        {status === "success" && (
          <span className="form-msg ok">
            <Icon name="check" size={13} style={{ verticalAlign: "-2px", marginRight: "4px" }} />
            {message}
          </span>
        )}
        {status === "error" && <span className="form-msg err">{message}</span>}
      </div>
    </form>
  );
}
