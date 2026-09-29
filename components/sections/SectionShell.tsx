import type { ReactNode } from "react";
import Container from "@/components/layout/Container";
import Reveal from "@/components/motion/Reveal";
import type { SectionId } from "@/lib/sections";

export type SectionContext = "home" | "page";

type SectionShellProps = {
  id: SectionId;
  /** Small label above the heading. */
  eyebrow: string;
  title: string;
  /** Optional one-line intro under the heading. */
  intro?: string;
  /** "home": part of the homepage scroll (h2). "page": its own route (h1). */
  context: SectionContext;
  children: ReactNode;
};

/*
  Shared wrapper for every homepage section and its standalone page.
  - id + scroll-mt-24 (96px, matches SECTION_OFFSET_PX): anchor jumps land below the navbar.
  - tabIndex -1: focus moves here after a navbar jump, so keyboard users continue from it.
*/
export default function SectionShell({ id, eyebrow, title, intro, context, children }: SectionShellProps) {
  const Heading = context === "page" ? "h1" : "h2";
  const headingId = `${id}-heading`;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      tabIndex={-1}
      className={`scroll-mt-24 focus:outline-none ${
        context === "home" ? "border-t border-ink-line py-24 sm:py-32" : "py-16 sm:py-24"
      }`}
    >
      <Container>
        <Reveal>
          <p className="text-xs uppercase tracking-[0.2em] text-sage">{eyebrow}</p>
          <Heading id={headingId} className="mt-4 font-serif text-4xl italic sm:text-5xl">
            {title}
          </Heading>
          {intro && <p className="mt-5 max-w-2xl leading-relaxed text-white/70">{intro}</p>}
        </Reveal>
        <div className="mt-12">{children}</div>
      </Container>
    </section>
  );
}
