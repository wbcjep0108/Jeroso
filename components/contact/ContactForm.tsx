"use client";

import { Suspense, useId, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import {
  CONTACT_TOPICS,
  DEFAULT_CONTACT_TOPIC,
  isContactTopic,
  type ContactTopic,
} from "@/lib/site-info";

const fieldClass =
  "mt-2 block w-full rounded-xl border border-white/15 bg-white/[0.03] px-4 py-3 text-white placeholder:text-white/30 focus-visible:border-sage-light focus-visible:outline-none motion-safe:transition-colors";
const labelClass = "text-sm text-white/70";

function topicFromParam(value: string | null): ContactTopic {
  return isContactTopic(value) ? value : DEFAULT_CONTACT_TOPIC;
}

function FormView({ initialTopic }: { initialTopic: ContactTopic }) {
  const id = useId();
  const [topic, setTopic] = useState<ContactTopic>(initialTopic);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState("");
  // Follow later URL changes (e.g. "Ask about a private tasting") without overriding the visitor's own choice otherwise.
  const [seenTopic, setSeenTopic] = useState<ContactTopic>(initialTopic);
  if (initialTopic !== seenTopic) {
    setSeenTopic(initialTopic);
    setTopic(initialTopic);
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    setStatus("sending");
    setFeedback("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          topic: formData.get("topic"),
          message: formData.get("message"),
          website: formData.get("website"),
        }),
      });
      const result = (await response.json()) as { success?: boolean; error?: string };

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Your message could not be sent. Please try again.");
      }

      form.reset();
      setTopic(initialTopic);
      setStatus("success");
      setFeedback("Thanks — your message has been sent.");
    } catch (error) {
      setStatus("error");
      setFeedback(error instanceof Error ? error.message : "Your message could not be sent. Please try again.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5 sm:grid-cols-2">
      <div>
        <label htmlFor={`${id}-name`} className={labelClass}>
          Name
        </label>
        <input id={`${id}-name`} name="name" type="text" autoComplete="name" minLength={2} maxLength={100} className={fieldClass} required />
      </div>
      <div>
        <label htmlFor={`${id}-email`} className={labelClass}>
          Email
        </label>
        <input
          id={`${id}-email`}
          name="email"
          type="email"
          autoComplete="email"
          maxLength={254}
          className={fieldClass}
          required
        />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor={`${id}-topic`} className={labelClass}>
          Topic
        </label>
        <select
          id={`${id}-topic`}
          name="topic"
          value={topic}
          onChange={(e) => {
            if (isContactTopic(e.target.value)) setTopic(e.target.value);
          }}
          className={`${fieldClass} appearance-none`}
        >
          {CONTACT_TOPICS.map((option) => (
            <option key={option.value} value={option.value} className="bg-ink">
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="sm:col-span-2">
        <label htmlFor={`${id}-message`} className={labelClass}>
          Message
        </label>
        <textarea id={`${id}-message`} name="message" rows={5} minLength={10} maxLength={2000} className={`${fieldClass} resize-y`} required />
      </div>
      <div className="hidden" aria-hidden="true">
        <label htmlFor={`${id}-website`}>Website</label>
        <input id={`${id}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={status === "sending"}
          aria-describedby={`${id}-status`}
          className="inline-flex h-12 items-center justify-center rounded-xl bg-white px-6 text-sm font-medium text-ink hover:bg-sage-light disabled:cursor-wait disabled:opacity-60 motion-safe:transition-colors"
        >
          {status === "sending" ? "Sending…" : "Send message"}
        </button>
        <p
          id={`${id}-status`}
          role="status"
          aria-live="polite"
          className={`text-sm ${status === "error" ? "text-red-300" : status === "success" ? "text-sage-light" : "text-white/50"}`}
        >
          {feedback || "We’ll reply to the email address you provide."}
        </p>
      </div>
    </form>
  );
}

function FormWithParams() {
  const searchParams = useSearchParams();
  return <FormView initialTopic={topicFromParam(searchParams.get("topic"))} />;
}

/** useSearchParams needs a Suspense boundary; the fallback is the same form, so nothing shifts. */
export default function ContactForm() {
  return (
    <Suspense fallback={<FormView initialTopic={DEFAULT_CONTACT_TOPIC} />}>
      <FormWithParams />
    </Suspense>
  );
}
