import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import type { User } from "firebase/auth";
import { db } from "@/lib/firebase";

export type AuthProviderName = "password" | "google";

export async function syncUserProfile(
  user: User,
  provider: AuthProviderName,
  fullName?: string,
) {
  const profileRef = doc(db, "users", user.uid);
  const existingProfile = await getDoc(profileRef);
  const existingData = existingProfile.data();
  const fallbackName = user.displayName?.trim() || user.email?.split("@")[0] || "Jeroso member";

  const profile = {
    uid: user.uid,
    email: user.email ?? "",
    fullName:
      typeof existingData?.fullName === "string" && existingData.fullName.trim()
        ? existingData.fullName
        : fullName?.trim() || fallbackName,
    photoURL: user.photoURL ?? existingData?.photoURL ?? null,
    updatedAt: serverTimestamp(),
  };

  if (!existingProfile.exists()) {
    await setDoc(profileRef, {
      ...profile,
      authProvider: provider,
      createdAt: serverTimestamp(),
    });
    return;
  }

  // Merge only current contact details. Existing profile identity and createdAt remain intact.
  await setDoc(profileRef, profile, { merge: true });
}
