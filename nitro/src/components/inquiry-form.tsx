import { useId, useState, type FormEvent } from "react";
import { track } from "@/lib/analytics";
import { BUSINESS } from "@/lib/site";

/**
 * One form, three certified variants. The JSON payload and messages are the same as the certified
 * app.js, so /api/contact (unchanged) receives exactly what it did before:
 *   { name, email, company, siteUrl, message, website }  — `website` is the honeypot.
 * Booking requests fold date / time / time zone into `message`, as before.
 */
export type FormVariant = "inquiry" | "audit" | "booking";

const FALLBACK = `The message could not be sent. Email ${BUSINESS.email} instead.`;

type Copy = { message: string; messageRequired: boolean; submit: string; sending: string; done: string; note: string };

const COPY: Record<FormVariant, Copy> = {
  inquiry: {
    message: "Tell me about the business (why did you start it?)",
    messageRequired: true,
    submit: "Send your story",
    sending: "Sending your inquiry…",
    done: "Received. I’ll reply with three practical fixes within 24 hours.",
    note: "Used to reply to your inquiry and keep the request in FORGE’s private lead queue.",
  },
  audit: {
    message: "What feels stuck? (optional)",
    messageRequired: false,
    submit: "Get my Forge-CT Audit",
    sending: "Sending your inquiry…",
    done: "Received. I’ll reply with three practical fixes within 24 hours.",
    note: "Used to reply with your audit and keep the request in FORGE’s private lead queue.",
  },
  booking: {
    message: "What should we cover? (optional)",
    messageRequired: false,
    submit: "Request this time",
    sending: "Sending your appointment request…",
    done: "Request received. I’ll confirm the appointment by email.",
    note: "Used to coordinate the appointment and keep the request in FORGE’s private lead queue. The time is confirmed by email — not held until then.",
  },
};

const TIME_ZONES = ["Eastern Time", "Central Time", "Mountain Time", "Pacific Time", "UTC"];

const text = (d: FormData, key: string) => String(d.get(key) ?? "").trim();

export function InquiryForm({
  variant,
  source,
  messageLabel,
  submitLabel,
}: {
  variant: FormVariant;
  source: string;
  messageLabel?: string;
  submitLabel?: string;
}) {
  const id = useId();
  const copy = COPY[variant];
  const [status, setStatus] = useState<{ tone: "idle" | "ok" | "error"; text: string }>({ tone: "idle", text: "" });
  const [sending, setSending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) {
      setStatus({ tone: "error", text: "Please complete the required fields before sending." });
      return;
    }
    const d = new FormData(form);
    const message =
      variant === "booking"
        ? [
            "Appointment request:",
            `Preferred date: ${text(d, "preferredDate")}`,
            `Preferred time: ${text(d, "preferredTime")}`,
            `Time zone: ${text(d, "timezone")}`,
            "",
            text(d, "message"),
          ].join("\n")
        : text(d, "message");
    const payload = {
      name: text(d, "name"),
      email: text(d, "email"),
      company: text(d, "company"),
      siteUrl: text(d, "siteUrl"),
      message,
      website: text(d, "website"),
      source: variant,
    };

    setSending(true);
    setStatus({ tone: "idle", text: copy.sending });
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!response.ok || !result.ok) {
        setStatus({ tone: "error", text: result.error || FALLBACK });
        return;
      }
      form.reset();
      track("lead_form_success", { source });
      setStatus({ tone: "ok", text: copy.done });
    } catch {
      setStatus({ tone: "error", text: FALLBACK });
    } finally {
      setSending(false);
    }
  }

  const f = (name: string) => `${id}-${name}`;

  return (
    <form className="form" onSubmit={onSubmit} noValidate={false} data-form-source={source}>
      <div className="pair">
        <div className="field">
          <label htmlFor={f("name")}>{variant === "audit" ? "Your name" : "Name"}</label>
          <input id={f("name")} name="name" type="text" autoComplete="name" required minLength={2} maxLength={100} />
        </div>
        <div className="field">
          <label htmlFor={f("email")}>Email</label>
          <input id={f("email")} name="email" type="email" autoComplete="email" required maxLength={254} />
        </div>
      </div>
      <div className="field">
        <label htmlFor={f("company")}>{variant === "audit" ? "Shop or business name (optional)" : "Company (optional)"}</label>
        <input id={f("company")} name="company" type="text" autoComplete="organization" maxLength={120} />
      </div>
      {variant === "audit" ? (
        <div className="field">
          <label htmlFor={f("siteUrl")}>Your website URL</label>
          <input
            id={f("siteUrl")}
            name="siteUrl"
            type="url"
            inputMode="url"
            placeholder="https://"
            required
            maxLength={500}
          />
        </div>
      ) : null}
      {variant === "booking" ? (
        <div className="pair">
          <div className="field">
            <label htmlFor={f("date")}>Preferred date</label>
            <input id={f("date")} name="preferredDate" type="date" required />
          </div>
          <div className="field">
            <label htmlFor={f("time")}>Preferred time</label>
            <input id={f("time")} name="preferredTime" type="time" required />
          </div>
        </div>
      ) : null}
      {variant === "booking" ? (
        <div className="field">
          <label htmlFor={f("tz")}>Time zone</label>
          <select id={f("tz")} name="timezone" required defaultValue="Eastern Time">
            {TIME_ZONES.map((tz) => (
              <option key={tz}>{tz}</option>
            ))}
          </select>
        </div>
      ) : null}
      <div className="trap" aria-hidden="true">
        <label htmlFor={f("website")}>Website</label>
        <input id={f("website")} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="field">
        <label htmlFor={f("message")}>{messageLabel ?? copy.message}</label>
        <textarea id={f("message")} name="message" required={copy.messageRequired} maxLength={4000} />
      </div>
      <div>
        <button className="btn" type="submit" disabled={sending} data-track={`${source}_form_submit`}>
          {submitLabel ?? copy.submit}
          <span className="arrow" aria-hidden="true">
            →
          </span>
        </button>
      </div>
      <p className="form-status" role="status" aria-live="polite" data-tone={status.tone}>
        {status.text}
      </p>
      <p className="fine">
        {copy.note} Prefer email? <a className="link" href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>
      </p>
    </form>
  );
}
