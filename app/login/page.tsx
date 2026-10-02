import type { Metadata } from "next";
import ComingSoon from "@/components/ui/ComingSoon";

export const metadata: Metadata = { title: "Sign In" };

export default function LoginPage() {
  return (
    <ComingSoon
      title="Sign In"
      description="User login and authentication are coming soon."
    />
  );
}
