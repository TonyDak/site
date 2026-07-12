"use client";

import { FormEvent, useState } from "react";
import { useLanguage } from "@/components/language/LanguageProvider";

type Status = "idle" | "loading" | "success" | "error";

export function ContactForm() {
    const [status, setStatus] = useState<Status>("idle");
    const [message, setMessage] = useState("");
    const { content } = useLanguage();
    const copy = content.contactForm;

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);
        setStatus("loading");

        try {
            const name = String(formData.get("name") ?? "").trim();
            const email = String(formData.get("email") ?? "").trim();
            const detail = String(formData.get("detail") ?? "").trim();
            const query = new URLSearchParams({
                view: "cm",
                fs: "1",
                to: "duckg2083@gmail.com",
                su: `Portfolio inquiry from ${name}`,
                body: `Name: ${name}\nEmail: ${email}\n\nProject details:\n${detail}`,
            });
            const gmailUrl = `https://mail.google.com/mail/?${query.toString()}`;
            const openedWindow = window.open(gmailUrl, "_blank");

            if (openedWindow) {
                openedWindow.opener = null;
            } else {
                window.location.assign(gmailUrl);
            }

            setStatus("success");
            setMessage(copy.successMessage);
            form.reset();
        } catch {
            setStatus("error");
            setMessage(copy.networkError);
        }
    }

    return (
        <form className="c--contact-form" onSubmit={handleSubmit}>
            <label className="c--field">
                {copy.nameLabel}
                <input name="name" required />
            </label>

            <label className="c--field">
                {copy.emailLabel}
                <input name="email" type="email" required />
            </label>

            <label className="c--field">
                {copy.detailsLabel}
                <textarea name="detail" rows={6} required />
            </label>

            <input
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                style={{ display: "none" }}
            />

            <button className="c--btn c--btn-primary" type="submit" disabled={status === "loading"}>
                {status === "loading" ? copy.sendingLabel : copy.submitLabel}
            </button>

            <p className="u--muted c--status-msg">{status !== "idle" ? message : ""}</p>
        </form>
    );
}
