import Link from "next/link";
import type { ReactNode } from "react";
import Container from "@/components/layout/Container";
import Logo from "@/components/layout/Logo";

export default function AuthLayout({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="px-6 pt-8 sm:px-10 sm:pt-10">
        <Logo />
      </div>
      <Container className="flex flex-1 items-center justify-center py-16 sm:py-20">
        <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.24em] text-sage">{eyebrow}</p>
          <h1 className="mt-4 font-serif text-5xl italic sm:text-6xl">{title}</h1>
          <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-white/60">{description}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-6 shadow-2xl shadow-black/20 sm:p-8">
          {children}
        </div>
        <Link href="/" className="mt-8 block text-center font-serif text-lg italic text-white/60 hover:text-white">
          Return to Jeroso
        </Link>
        </div>
      </Container>
      <footer className="border-t border-ink-line py-5 text-center text-xs text-white/40">
        © 2026 Jeroso
      </footer>
    </div>
  );
}
