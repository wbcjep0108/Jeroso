import Image from "next/image";
import Container from "@/components/layout/Container";
import Reveal from "@/components/motion/Reveal";
import GradualBlur from "@/components/ui/GradualBlur";
import type { SectionContext } from "@/components/sections/SectionShell";

const aboutChapters = [
  {
    letter: "J",
    label: "Journey",
    heading: "Where every bottle begins",
    text: "Every bottle comes from a place, a season, and the people who made it. Jeroso begins with respect for the vineyard, where soil, sunlight, and patience shape every first pour.",
    images: [
      "/images/about_images/j1.png",
      "/images/about_images/j2.png",
      "/images/about_images/j3.png",
    ],
    alt: "vineyard and origin",
  },
  {
    letter: "E",
    label: "Essence",
    heading: "Crafted with intention",
    text: "From the first harvest to the final seal, every detail is considered. Our wines are made to carry character, balance, and the quiet confidence of thoughtful craftsmanship.",
    images: ["/images/about_images/e1.png", "/images/about_images/e2.png"],
    alt: "craft and winemaking",
  },
  {
    letter: "N",
    label: "Nectar",
    heading: "Made for the moment",
    text: "Wine becomes meaningful when it is shared. Jeroso is created for long conversations, simple celebrations, and the moments you will want to remember.",
    images: ["/images/about_images/n1.png", "/images/about_images/n2.png"],
    alt: "wine shared at the table",
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
          {aboutChapters.map((chapter) => (
            <article
              key={chapter.letter}
              aria-labelledby={`about-${chapter.label.toLowerCase()}-heading`}
              className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(18rem,0.95fr)] lg:gap-16"
            >
              <div className="space-y-6">
                {chapter.images.map((src, imageIndex) => (
                  <Reveal
                    key={src}
                    once
                    subtle
                    delay={imageIndex * 85}
                    className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/15 bg-ink-soft shadow-[0_20px_50px_-30px_rgba(0,0,0,0.9)]"
                    style={{ transitionDuration: "500ms" }}
                  >
                    <Image
                      src={src}
                      alt={`Jeroso ${chapter.label} — ${chapter.alt}`}
                      fill
                      loading="lazy"
                      sizes="(min-width: 1024px) 52vw, 100vw"
                      className="object-cover"
                    />
                    <GradualBlur
                      target="parent"
                      position="bottom"
                      height="3rem"
                      strength={0.8}
                      divCount={3}
                      curve="bezier"
                      opacity={0.65}
                      className="hidden md:block"
                    />
                  </Reveal>
                ))}
              </div>

              <Reveal once className="max-w-xl lg:sticky lg:top-28 lg:self-start">
                <p
                  aria-hidden="true"
                  className="font-serif text-[clamp(4.5rem,10vw,8rem)] italic leading-[0.78] text-sage-light"
                >
                  {chapter.label}
                </p>
                <div className="mt-8 lg:pb-2">
                  <p className="text-xs uppercase tracking-[0.2em] text-sage">Chapter {chapter.label}</p>
                  <h2
                    id={`about-${chapter.label.toLowerCase()}-heading`}
                    className="mt-4 font-serif text-4xl italic leading-tight text-sage-light sm:text-5xl"
                  >
                    {chapter.heading}
                  </h2>
                  <p className="mt-6 max-w-lg text-base leading-relaxed text-white/70 sm:text-lg">
                    {chapter.text}
                  </p>
                </div>
              </Reveal>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
