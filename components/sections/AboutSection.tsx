import Reveal from "@/components/motion/Reveal";
import SectionShell, { type SectionContext } from "@/components/sections/SectionShell";

/*
  About: only the J.E.N. idea. Everything else is a labelled placeholder for the
  owner's real story, photos and founder details; nothing here is invented.
*/

const pillars = [
  { letter: "J", word: "Journey", line: "Every bottle comes from a place, a season and the people who made it." },
  { letter: "E", word: "Essence", line: "What a region and a grape give to the glass." },
  { letter: "N", word: "Nectar", line: "The moment it is poured and shared." },
];

const placeholders = [
  { title: "Our story", note: "The real story of Jeroso goes here." },
  { title: "Photos", note: "Photos of the team, the shop or the cellar go here." },
  { title: "Founder", note: "Founder name, photo and a short introduction go here." },
];

export default function AboutSection({ context }: { context: SectionContext }) {
  return (
    <SectionShell
      id="about"
      context={context}
      eyebrow="About"
      title="Jeroso"
      intro="The journey, the essence, the nectar."
    >
      <ul className="grid gap-6 md:grid-cols-3">
        {pillars.map((pillar, i) => (
          <li key={pillar.word}>
            <Reveal delay={i * 90} className="h-full">
              <div className="h-full border-l border-sage-dark pl-6">
                <p aria-hidden="true" className="font-serif text-6xl italic leading-none text-sage-light">
                  {pillar.letter}
                </p>
                <h3 className="mt-4 font-serif text-3xl italic">{pillar.word}</h3>
                <p className="mt-3 leading-relaxed text-white/70">{pillar.line}</p>
              </div>
            </Reveal>
          </li>
        ))}
      </ul>

      {/* PLACEHOLDER: replace each block with real content. */}
      <ul className="mt-16 grid gap-6 md:grid-cols-3">
        {placeholders.map((block) => (
          <li
            key={block.title}
            className="flex min-h-48 flex-col justify-center rounded-3xl border border-dashed border-white/20 p-6 text-center"
          >
            <p className="font-serif text-2xl italic">{block.title}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.2em] text-sage">To be filled in</p>
            <p className="mt-3 text-sm text-white/50">{block.note}</p>
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}
