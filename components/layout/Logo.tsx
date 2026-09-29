import Link from "next/link";
import { Wine } from "lucide-react";

type LogoProps = {
  className?: string;
};

/** Brand mark: small wine glass icon plus "Jeroso" in italic serif. Used everywhere. */
export default function Logo({ className = "" }: LogoProps) {
  return (
    <Link
      href="/"
      aria-label="Jeroso, home"
      className={`inline-flex items-center gap-2 text-white ${className}`}
    >
      {/*
        data-brand-icon: landing spot for the splash screen's glass. Hidden while the
        splash is up, then fades in as the flying glass arrives (data-splash-landing).
      */}
      <Wine
        aria-hidden="true"
        data-brand-icon
        className="h-5 w-5 text-sage-light transition-opacity duration-300 [html:has([data-splash-overlay]:not([data-splash-landing]))_&]:opacity-0"
        strokeWidth={1.5}
      />
      {/*
        data-brand-logo: landing spot for the splash screen's "Jeroso", which flies here.
        Hidden while the splash overlay exists so only the flying copy is visible.
      */}
      <span
        data-brand-logo
        className="font-serif text-2xl italic leading-none tracking-wide [html:has([data-splash-overlay])_&]:opacity-0"
      >
        Jeroso
      </span>
    </Link>
  );
}
