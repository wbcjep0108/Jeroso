import type { Metadata } from "next";
import ComingSoon from "@/components/ui/ComingSoon";

export const metadata: Metadata = { title: "Register" };

export default function RegistrationPage() {
  return (
    <ComingSoon
      title="Register"
      description="User registration is coming soon."
    />
  );
}
