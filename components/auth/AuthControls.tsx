"use client";

import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import type { ReactNode } from "react";

export const fieldClass =
  "mt-2 block h-12 w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-sage-light";

export function PasswordField({
  id,
  label,
  value,
  onChange,
  visible,
  onToggle,
  autoComplete,
  error,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  onToggle: () => void;
  autoComplete: string;
  error?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm text-white/75">{label}</label>
      <div className="relative">
        <input id={id} name={id} type={visible ? "text" : "password"} value={value} onChange={(event) => onChange(event.target.value)} autoComplete={autoComplete} className={`${fieldClass} pr-12 ${error ? "border-red-400/80" : ""}`} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} />
        <button type="button" onClick={onToggle} className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full text-white/50 hover:bg-white/10 hover:text-white" aria-label={visible ? "Hide password" : "Show password"}>
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
      {error && <p id={`${id}-error`} className="mt-1.5 text-xs text-red-300">{error}</p>}
    </div>
  );
}

export function SubmitButton({ children, loading }: { children: ReactNode; loading: boolean }) {
  return (
    <button type="submit" disabled={loading} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-medium text-ink transition-colors hover:bg-sage-light disabled:cursor-not-allowed disabled:opacity-60">
      {loading && <LoaderCircle size={17} className="animate-spin" aria-hidden="true" />}
      {loading ? "Please wait…" : children}
    </button>
  );
}

export function Divider() {
  return <div className="my-6 flex items-center gap-4 text-[10px] uppercase tracking-[0.22em] text-white/35"><span className="h-px flex-1 bg-white/10" /><span>Or</span><span className="h-px flex-1 bg-white/10" /></div>;
}

export function GoogleButton({ onClick, loading }: { onClick: () => void; loading: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={loading} className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-white/15 bg-white/[0.04] px-5 text-sm text-white transition-colors hover:border-white/35 hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-60">
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5"><path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.55-.2-2.27H12v4.3h6.44a5.5 5.5 0 0 1-2.39 3.61v3h3.87c2.27-2.09 3.57-5.17 3.57-8.64Z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.07 7.93-2.9l-3.87-3c-1.07.72-2.44 1.15-4.06 1.15-3.12 0-5.76-2.11-6.7-4.95H1.3v3.1A12 12 0 0 0 12 24Z"/><path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6H1.3a12 12 0 0 0 0 10.8l4-3.1Z"/><path fill="#EA4335" d="M12 4.75c1.76 0 3.34.6 4.58 1.8l3.43-3.43C17.95 1.09 15.24 0 12 0A12 12 0 0 0 1.3 6.6l4 3.1c.94-2.84 3.58-4.95 6.7-4.95Z"/></svg>
      {loading ? "Connecting…" : "Continue with Google"}
    </button>
  );
}

export function ErrorMessage({ message }: { message: string }) {
  return <p role="alert" className="rounded-xl border border-red-400/25 bg-red-400/10 px-4 py-3 text-sm text-red-200">{message}</p>;
}
