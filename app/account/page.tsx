import type { Metadata } from "next";
import AccountProfile from "@/components/account/AccountProfile";

export const metadata: Metadata = { title: "Account" };

export default function AccountPage() {
  return <AccountProfile />;
}
