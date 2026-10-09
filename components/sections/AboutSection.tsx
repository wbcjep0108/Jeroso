import Container from "@/components/layout/Container";
import Reveal from "@/components/motion/Reveal";
import type { SectionContext } from "@/components/sections/SectionShell";

const chapters = [
  {
    letter: "Journey",
    heading: "Where every bottle begins",
    text: "Every bottle comes from a place, a season, and the people who made it. Jeroso begins with respect for the vineyard, where soil, sunlight, and patience shape every first pour.",
  },
  {
    letter: "Essence",
    heading: "Crafted with intention",
    text: "From the first harvest to the final seal, every detail is considered. Our wines are made to carry character, balance, and the quiet confidence of thoughtful craftsmanship.",
  },
  {
    letter: "Nectar",
    heading: "Made for the moment",
    text: "Wine becomes meaningful when it is shared. Jeroso is created for long conversations, simple celebrations, and the moments you will want to remember.",
  },
];

export default function AboutSection({ context }: { context: SectionContext }) {
  const Heading = context === "page" ? "h1" : "h2";

  return (
    <section id="about" className="scroll-mt-24 py-16 sm:py-24" tabIndex={-1}>
      <Container>
        <Reveal>
          <p className="text-xs uppercase tracking-[0.2em] text-sage">About</p>
          <Heading className="mt-4 font-serif text-5xl italic sm:text-6xl">Jeroso</Heading>
          <p className="mt-5 max-w-2xl leading-relaxed text-white/70">
            The journey, the essence, the nectar.
          </p>
        </Reveal>

        <div className="mt-20 space-y-24 sm:mt-28 sm:space-y-36">
          {chapters.map((chapter, index) => (
            <Reveal key={chapter.letter} delay={index * 100}>
              <article aria-labelledby={`about-${chapter.letter.toLowerCase()}-heading`}>
                <p
                  aria-hidden="true"
                  className="font-serif text-[clamp(4.5rem,10vw,8rem)] italic leading-[0.78] text-sage-light"
                >
                  {chapter.letter}
                </p>

                <div className="mt-8 grid items-center gap-10 lg:grid-cols-[55fr_45fr] lg:gap-16">
                  <div
                    role="img"
                    aria-label={`${chapter.letter} chapter image coming soon`}
                    className="relative flex aspect-[4/3] min-h-[18rem] items-center justify-center overflow-hidden rounded-3xl border border-[#b6aa94]/40 bg-[#b6aa94] text-[#332d25] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)] sm:min-h-[24rem]"
                  >
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 opacity-50 [background-image:radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.28),transparent_32%),radial-gradient(circle_at_80%_75%,rgba(75,58,38,0.18),transparent_34%)]"
                    />
                    <p className="relative text-xs uppercase tracking-[0.24em]">Image coming soon</p>
                  </div>

                  <div className="max-w-xl lg:pb-2">
                    <p className="text-xs uppercase tracking-[0.2em] text-sage">Chapter {chapter.letter}</p>
                    <h2
                      id={`about-${chapter.letter.toLowerCase()}-heading`}
                      className="mt-4 font-serif text-4xl italic leading-tight text-sage-light sm:text-5xl"
                    >
                      {chapter.heading}
                    </h2>
                    <p className="mt-6 max-w-lg text-base leading-relaxed text-white/70 sm:text-lg">
                      {chapter.text}
                    </p>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
