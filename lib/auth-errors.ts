export function authErrorMessage(error: unknown) {
  const code = typeof error === "object" && error !== null && "code" in error ? String(error.code) : "";
  const messages: Record<string, string> = {
    "auth/email-already-in-use": "An account already exists with this email. Try logging in instead.",
    "auth/invalid-credential": "The email or password is incorrect.",
    "auth/invalid-email": "Enter a valid email address.",
    "auth/weak-password": "Choose a stronger password with at least 6 characters.",
    "auth/user-disabled": "This account has been disabled. Please contact Jeroso.",
    "auth/popup-closed-by-user": "The Google sign-in window was closed before completion.",
    "auth/popup-blocked": "Your browser blocked the Google sign-in window. Allow popups and try again.",
    "auth/network-request-failed": "A network error occurred. Check your connection and try again.",
    "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
    "auth/operation-not-allowed": "Google sign-in is not enabled yet. Enable Google under Firebase Console → Authentication → Sign-in method.",
    "auth/unauthorized-domain": "This website domain is not authorized for Firebase sign-in. Add it under Firebase Authentication → Settings → Authorized domains.",
    "auth/account-exists-with-different-credential": "An account already exists with this email using another sign-in method. Log in with that method first.",
    "auth/app-not-authorized": "This app is not authorized to use the configured Firebase project.",
    "auth/invalid-api-key": "The Firebase API key is invalid. Check the project environment configuration.",
    "permission-denied": "Your account signed in, but Firestore rejected the profile save. Check the Firestore database and security rules for users/{uid}.",
    "failed-precondition": "Firestore is not ready for this project. Create or enable the Firestore database in Firebase Console.",
    "unavailable": "Firebase is temporarily unavailable. Check your connection and try again.",
  };
  return messages[code] ?? "Something went wrong while signing you in. Please try again.";
}
