"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import AuthLayout from "@/components/auth/AuthLayout";
import { ErrorMessage, fieldClass, SubmitButton } from "@/components/auth/AuthControls";
import { authErrorMessage } from "@/lib/auth-errors";
import { auth } from "@/lib/firebase";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess(false);
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSuccess(true);
    } catch (authError) {
      setError(authErrorMessage(authError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout eyebrow="A fresh start" title="Reset password" description="We’ll send a secure link to the email attached to your Jeroso account.">
      <form onSubmit={handleSubmit} className="grid gap-5" noValidate>
        {error && <ErrorMessage message={error} />}
        {success && <p role="status" className="rounded-xl border border-sage/30 bg-sage/10 px-4 py-3 text-sm text-sage-light">Check your inbox for a password reset link. It may take a minute to arrive.</p>}
        <div><label htmlFor="reset-email" className="text-sm text-white/75">Email</label><input id="reset-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" className={fieldClass} placeholder="you@example.com" required /></div>
        <SubmitButton loading={loading}>Send reset link</SubmitButton>
      </form>
      <p className="mt-7 text-center text-sm text-white/55"><Link href="/login" className="text-sage-light hover:text-white">Back to log in</Link></p>
    </AuthLayout>
  );
}
