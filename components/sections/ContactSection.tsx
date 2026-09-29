import ContactForm from "@/components/contact/ContactForm";
import Reveal from "@/components/motion/Reveal";
import SectionShell, { type SectionContext } from "@/components/sections/SectionShell";
import { siteInfo, TO_BE_FILLED } from "@/lib/site-info";

const details = [
  { label: "Address", value: siteInfo.address },
  { label: "Phone", value: siteInfo.phone },
  { label: "Email", value: siteInfo.email },
  { label: "Opening hours", value: siteInfo.hours },
];

export default function ContactSection({ context }: { context: SectionContext }) {
  return (
    <SectionShell
      id="contact"
      context={context}
      eyebrow="Contact"
      title="Get in touch"
      intro="Questions about a wine, or planning a private tasting? Send us a note."
    >
      <div className="grid gap-12 lg:grid-cols-[1fr_1.6fr]">
        <Reveal>
          {/* PLACEHOLDER: real details go in lib/site-info.ts. */}
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
    </SectionShell>
  );
}
