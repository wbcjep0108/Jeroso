import Link from "next/link";
import Container from "@/components/layout/Container";
import Logo from "@/components/layout/Logo";
import SectionLink from "@/components/navigation/SectionLink";
import { accountLinks, primaryLinks } from "@/lib/navigation";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-ink-line bg-ink-soft">
      <Container className="grid gap-10 py-14 md:grid-cols-[2fr_1fr_1fr]">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-4 text-sm leading-relaxed text-white/60">
            J.E.N. - the journey, the essence, the nectar. Bottles chosen by
            sommeliers, with the story behind every pour.
          </p>
        </div>

        <nav aria-label="Explore">
          <h2 className="text-xs uppercase tracking-[0.2em] text-sage">Explore</h2>
          <ul className="mt-4 space-y-2">
            {primaryLinks.map((link) => (
              <li key={link.href}>
                {link.section ? (
                  <SectionLink section={link.section} className="text-sm text-white/70 hover:text-white">
                    {link.label}
                  </SectionLink>
                ) : (
                  <Link href={link.href} className="text-sm text-white/70 hover:text-white">
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Your account">
          <h2 className="text-xs uppercase tracking-[0.2em] text-sage">Your Account</h2>
          <ul className="mt-4 space-y-2">
            {accountLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-white/70 hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>

      <div className="border-t border-ink-line">
        <Container className="flex flex-col gap-2 py-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {year} Jeroso. All rights reserved.</p>
          <p>Must be 18 or older to purchase alcohol. Please enjoy responsibly.</p>
        </Container>
      </div>
    </footer>
  );
}
