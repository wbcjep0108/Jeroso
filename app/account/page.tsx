import type { Metadata } from "next";
import ComingSoon from "@/components/ui/ComingSoon";

export const metadata: Metadata = { title: "Account" };

export default function AccountPage() {
  return (
    <ComingSoon
      title="Account"
      description="Sign-in, orders, and preferences are coming soon."
    />
  );
}
