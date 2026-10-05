"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import AuthLayout from "@/components/auth/AuthLayout";
import { Divider, ErrorMessage, fieldClass, GoogleButton, PasswordField, SubmitButton } from "@/components/auth/AuthControls";
import { authErrorMessage } from "@/lib/auth-errors";
import { auth } from "@/lib/firebase";
import { syncUserProfile } from "@/lib/user-profile";

function safeDestination(value: string | null) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/";
}

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const destination = safeDestination(searchParams.get("next"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleEmailLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Enter your email and password to continue.");
      return;
    }
    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email.trim(), password);
      await syncUserProfile(result.user, "password");
      router.replace(destination);
    } catch (authError) {
      setError(authErrorMessage(authError));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setError("");
    setGoogleLoading(true);
    try {
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      await syncUserProfile(result.user, "google");
      router.replace(destination);
    } catch (authError) {
      setError(authErrorMessage(authError));
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <AuthLayout eyebrow="Welcome back" title="Sign in" description="Return to your cellar, saved bottles, and tasting notes.">
      <form onSubmit={handleEmailLogin} className="grid gap-5" noValidate>
        {error && <ErrorMessage message={error} />}
        <div>
          <label htmlFor="login-email" className="text-sm text-white/75">Email</label>
          <input id="login-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" className={fieldClass} placeholder="you@example.com" required />
        </div>
        <PasswordField id="login-password" label="Password" value={password} onChange={setPassword} visible={showPassword} onToggle={() => setShowPassword((value) => !value)} autoComplete="current-password" />
        <div className="-mt-2 text-right"><Link href="/forgot-password" className="text-xs text-sage-light hover:text-white">Forgot password?</Link></div>
        <SubmitButton loading={loading}>Log in</SubmitButton>
      </form>
      <Divider />
      <GoogleButton onClick={handleGoogleLogin} loading={googleLoading} />
      <p className="mt-7 text-center text-sm text-white/55">Don&apos;t have an account? <Link href="/registration" className="text-sage-light hover:text-white">Register</Link></p>
    </AuthLayout>
  );
}
