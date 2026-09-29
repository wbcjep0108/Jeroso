"use client";

import { Suspense, useId, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import {
  CONTACT_TOPICS,
  DEFAULT_CONTACT_TOPIC,
  isContactTopic,
  type ContactTopic,
} from "@/lib/site-info";

/*
  Contact form, Phase 1: fields, labels and topic prefill from ?topic=...
  Sending is not implemented yet (Phase 2: Server Action, validation, spam checks,
  email), so the submit button is disabled and says so.
*/

const fieldClass =
  "mt-2 block w-full rounded-xl border border-white/15 bg-white/[0.03] px-4 py-3 text-white placeholder:text-white/30 focus-visible:border-sage-light focus-visible:outline-none motion-safe:transition-colors";
const labelClass = "text-sm text-white/70";

function topicFromParam(value: string | null): ContactTopic {
  return isContactTopic(value) ? value : DEFAULT_CONTACT_TOPIC;
}

function FormView({ initialTopic }: { initialTopic: ContactTopic }) {
  const id = useId();
  const [topic, setTopic] = useState<ContactTopic>(initialTopic);
  // Follow later URL changes (e.g. "Ask about a private tasting") without overriding the visitor's own choice otherwise.
  const [seenTopic, setSeenTopic] = useState<ContactTopic>(initialTopic);
  if (initialTopic !== seenTopic) {
    setSeenTopic(initialTopic);
    setTopic(initialTopic);
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5 sm:grid-cols-2">
      <div>
        <label htmlFor={`${id}-name`} className={labelClass}>
          Name
        </label>
        <input id={`${id}-name`} name="name" type="text" autoComplete="name" maxLength={100} className={fieldClass} />
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
        <textarea id={`${id}-message`} name="message" rows={5} maxLength={2000} className={`${fieldClass} resize-y`} />
      </div>
      <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center">
        {/* PLACEHOLDER: enabled in Phase 2 once the Server Action and email sending exist. */}
        <button
          type="submit"
          disabled
          aria-describedby={`${id}-note`}
          className="inline-flex h-12 items-center justify-center rounded-xl border border-white/15 bg-white/[0.03] px-6 text-sm text-white/60 disabled:cursor-not-allowed"
        >
          Sending available soon
        </button>
        <p id={`${id}-note`} className="text-sm text-white/50">
          The form is not connected yet. Messages cannot be sent at the moment.
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
