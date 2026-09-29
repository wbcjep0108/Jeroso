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
      <Wine aria-hidden="true" className="h-5 w-5 text-sage-light" strokeWidth={1.5} />
      <span className="font-serif text-2xl italic leading-none tracking-wide">Jeroso</span>
    </Link>
  );
}
