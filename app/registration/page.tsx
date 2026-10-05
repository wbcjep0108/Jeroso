import type { Metadata } from "next";
import RegistrationForm from "@/components/auth/RegistrationForm";

export const metadata: Metadata = { title: "Register" };

export default function RegistrationPage() {
  return <RegistrationForm />;
}
