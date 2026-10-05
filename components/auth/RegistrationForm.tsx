"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, updateProfile } from "firebase/auth";
import AuthLayout from "@/components/auth/AuthLayout";
import { Divider, ErrorMessage, fieldClass, GoogleButton, PasswordField, SubmitButton } from "@/components/auth/AuthControls";
import { authErrorMessage } from "@/lib/auth-errors";
import { auth } from "@/lib/firebase";
import { syncUserProfile } from "@/lib/user-profile";

export default function RegistrationForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleRegistration(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const name = fullName.trim();
    if (!name) return setError("Enter your full name.");
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) return setError("Enter a valid email address.");
    if (password.length < 6) return setError("Your password must be at least 6 characters.");
    if (password !== confirmPassword) return setError("Your passwords do not match.");

    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(result.user, { displayName: name });
      await syncUserProfile(result.user, "password", name);
      router.replace("/");
    } catch (authError) {
      setError(authErrorMessage(authError));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleRegistration() {
    setError("");
    setGoogleLoading(true);
    try {
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      await syncUserProfile(result.user, "google");
      router.replace("/");
    } catch (authError) {
      setError(authErrorMessage(authError));
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <AuthLayout eyebrow="Join the house" title="Create account" description="Make room for better bottles, stories, and evenings well spent.">
      <form onSubmit={handleRegistration} className="grid gap-5" noValidate>
        {error && <ErrorMessage message={error} />}
        <div><label htmlFor="full-name" className="text-sm text-white/75">Full name</label><input id="full-name" type="text" value={fullName} onChange={(event) => setFullName(event.target.value)} autoComplete="name" className={fieldClass} placeholder="Your name" required /></div>
        <div><label htmlFor="registration-email" className="text-sm text-white/75">Email</label><input id="registration-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" className={fieldClass} placeholder="you@example.com" required /></div>
        <PasswordField id="registration-password" label="Password" value={password} onChange={setPassword} visible={showPassword} onToggle={() => setShowPassword((value) => !value)} autoComplete="new-password" />
        <PasswordField id="confirm-password" label="Confirm password" value={confirmPassword} onChange={setConfirmPassword} visible={showConfirm} onToggle={() => setShowConfirm((value) => !value)} autoComplete="new-password" />
        <SubmitButton loading={loading}>Create account</SubmitButton>
      </form>
      <Divider />
      <GoogleButton onClick={handleGoogleRegistration} loading={googleLoading} />
      <p className="mt-7 text-center text-sm text-white/55">Already have an account? <Link href="/login" className="text-sage-light hover:text-white">Log in</Link></p>
    </AuthLayout>
  );
}
