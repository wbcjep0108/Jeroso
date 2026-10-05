"use client";

import { doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { LogOut, Mail, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AuthGuard from "@/components/auth/AuthGuard";
import Container from "@/components/layout/Container";
import { useAuth } from "@/contexts/AuthContext";
import { auth, db } from "@/lib/firebase";

type Profile = {
  fullName?: string;
  email?: string;
  photoURL?: string | null;
  authProvider?: string;
};

function AccountContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (!user) return;
    let active = true;

    getDoc(doc(db, "users", user.uid))
      .then((snapshot) => {
        if (active) setProfile(snapshot.exists() ? (snapshot.data() as Profile) : null);
      })
      .catch(() => {
        if (active) setProfile(null);
      })
      .finally(() => {
        if (active) setLoadingProfile(false);
      });

    return () => {
      active = false;
    };
  }, [user]);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await signOut(auth);
      router.replace("/");
    } finally {
      setLoggingOut(false);
    }
  }

  if (!user) return null;

  const name = profile?.fullName || user.displayName || "Jeroso member";
  const email = profile?.email || user.email || "No email available";
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Container className="py-24 sm:py-32">
      <div className="mx-auto max-w-2xl">
        <p className="text-xs uppercase tracking-[0.24em] text-sage">Your account</p>
        <div className="mt-4 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <h1 className="font-serif text-5xl italic sm:text-6xl">Profile</h1>
            <p className="mt-4 text-sm text-white/60">Your personal details for the Jeroso wine house.</p>
          </div>
        </div>

        <section className="mt-12 rounded-2xl border border-white/10 bg-white/[0.035] p-6 sm:p-8" aria-labelledby="profile-heading">
          <h2 id="profile-heading" className="sr-only">User profile details</h2>
          <div className="flex items-center gap-5 border-b border-white/10 pb-7">
            {profile?.photoURL || user.photoURL ? (
              // Firebase-hosted profile images are user-controlled URLs, so use a normal img element here.
              <img src={profile?.photoURL || user.photoURL || undefined} alt="" className="h-20 w-20 rounded-full object-cover" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-sage-dark text-xl text-white" aria-hidden="true">{initials}</div>
            )}
            <div>
              <h2 className="font-serif text-3xl italic text-white">{name}</h2>
              <p className="mt-1 text-sm text-white/50">{loadingProfile ? "Loading profile…" : "Jeroso member"}</p>
            </div>
          </div>

          <dl className="grid gap-5 pt-7 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <UserRound size={18} className="mt-0.5 text-sage" aria-hidden="true" />
              <div><dt className="text-xs uppercase tracking-[0.16em] text-white/40">Full name</dt><dd className="mt-1 text-sm text-white/85">{name}</dd></div>
            </div>
            <div className="flex items-start gap-3">
              <Mail size={18} className="mt-0.5 text-sage" aria-hidden="true" />
              <div><dt className="text-xs uppercase tracking-[0.16em] text-white/40">Email</dt><dd className="mt-1 break-all text-sm text-white/85">{email}</dd></div>
            </div>
          </dl>
        </section>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/15 px-5 text-sm text-white/75 transition-colors hover:border-white/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogOut size={16} aria-hidden="true" />
            {loggingOut ? "Signing out…" : "Log out"}
          </button>
        </div>
      </div>
    </Container>
  );
}

export default function AccountProfile() {
  return <AuthGuard><AccountContent /></AuthGuard>;
}
