import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Jeroso about a wine or a private tasting.",
};

type ContactPageProps = {
  searchParams: Promise<{ topic?: string | string[] }>;
};

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const { topic } = await searchParams;
  const value = Array.isArray(topic) ? topic[0] : topic;
  redirect(value ? `/?topic=${encodeURIComponent(value)}#contact` : "/#contact");
}
