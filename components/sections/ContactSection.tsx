import ContactForm from "@/components/contact/ContactForm";
import AnimatedFooter from "@/components/animated-footer";
import Container from "@/components/layout/Container";
import Reveal from "@/components/motion/Reveal";
import type { SectionContext } from "@/components/sections/SectionShell";
import { siteInfo } from "@/lib/site-info";

const TO_BE_FILLED = "To be filled in";

const details = [
  { label: "Email", value: siteInfo.email },
  { label: "Opening hours", value: siteInfo.hours },
];

function ContactDetailsAndForm() {
  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_1.6fr]">
      <Reveal>
        <dl className="space-y-6">
          {details.map((item) => (
            <div key={item.label}>
              <dt className="text-xs uppercase tracking-[0.2em] text-sage">{item.label}</dt>
              <dd className={`mt-2 ${item.value === TO_BE_FILLED ? "italic text-white/40" : "text-white/80"}`}>
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      </Reveal>
      <Reveal delay={120}>
        <ContactForm />
      </Reveal>
    </div>
  );
}

export default function ContactSection({ context }: { context: SectionContext }) {
  const Heading = context === "page" ? "h1" : "h2";

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      data-contact-context={context}
      tabIndex={-1}
      className="scroll-mt-24 focus:outline-none"
    >
      <div className="relative z-0 h-[50vh] min-h-[320px] max-h-[560px] w-full">
        <AnimatedFooter
          headingLines={[]}
          leftImage="/animated-footer/left%20hand.png"
          rightImage="/animated-footer/right%20hand.png"
          background="var(--color-ink)"
          textColor="rgb(255 255 255)"
          charColor="rgb(255 255 255 / 0.6)"
          hoverColor="rgb(255 255 255)"
          hoverCharColor="var(--color-ink)"
          parallaxStrength={10}
          className="[mask-image:linear-gradient(to_bottom,transparent_0%,black_12%,black_88%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_12%,black_88%,transparent_100%)]"
        />
      </div>
      <Container className="relative z-10 py-16 sm:py-24">
        <Reveal>
          <Heading id="contact-heading" className="font-serif text-4xl italic sm:text-5xl">
            Get in touch
          </Heading>
          <p className="mt-5 max-w-2xl leading-relaxed text-white/70">
            Questions about a wine, or planning a private tasting? Send us a note.
          </p>
        </Reveal>
        <div className="mt-12">
          <ContactDetailsAndForm />
        </div>
      </Container>
    </section>
  );
}
