import Link from "next/link";
import { CalendarDays } from "lucide-react";
import SectionLink from "@/components/navigation/SectionLink";
import Reveal from "@/components/motion/Reveal";
import SectionShell, { type SectionContext } from "@/components/sections/SectionShell";
import { getUpcomingTastings, type TastingEvent } from "@/lib/tastings";
import { formatPrice } from "@/lib/wines";

const dateFormatter = new Intl.DateTimeFormat("en-PH", {
  weekday: "short",
  month: "long",
  day: "numeric",
  year: "numeric",
});

const ctaClass =
  "inline-flex h-12 items-center rounded-full bg-white px-6 text-sm font-medium text-ink hover:bg-sage-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-light motion-safe:transition-colors";

function PrivateTastingLink({ context }: { context: SectionContext }) {
  const label = "Ask about a private tasting";
  // On the homepage, stay in the scroll; on /tastings, go to the standalone contact page.
  return context === "home" ? (
    <SectionLink section="contact" query={{ topic: "private-tasting" }} className={ctaClass}>
      {label}
    </SectionLink>
  ) : (
    <Link href="/contact?topic=private-tasting" className={ctaClass}>
      {label}
    </Link>
  );
}

function EventItem({ event }: { event: TastingEvent }) {
  return (
    <li className="rounded-3xl border border-ink-line bg-ink-soft p-6">
      <p className="text-xs uppercase tracking-[0.2em] text-sage">
        {dateFormatter.format(new Date(`${event.date}T00:00:00`))}
        {event.time ? ` / ${event.time}` : ""}
      </p>
      <h3 className="mt-3 font-serif text-2xl italic">{event.title}</h3>
      <p className="mt-2 text-sm text-white/60">{event.venue}</p>
      <p className="mt-4 leading-relaxed text-white/75">{event.description}</p>
      {event.price !== undefined && <p className="mt-4 font-serif text-xl">{formatPrice(event.price)}</p>}
    </li>
  );
}

export default async function TastingsSection({ context }: { context: SectionContext }) {
  const events = await getUpcomingTastings();

  return (
    <SectionShell
      id="tastings"
      context={context}
      eyebrow="Tastings"
      title="Taste with us"
      intro="Guided tastings and private sessions, announced here once they are confirmed."
    >
      {events.length > 0 ? (
        <>
          <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventItem key={event.slug} event={event} />
            ))}
          </ul>
          <div className="mt-10">
            <PrivateTastingLink context={context} />
          </div>
        </>
      ) : (
        <Reveal>
          <div className="flex flex-col items-start gap-6 rounded-3xl border border-ink-line bg-ink-soft p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
            <div className="flex items-start gap-4">
              <CalendarDays aria-hidden="true" className="mt-1 h-6 w-6 shrink-0 text-sage-light" strokeWidth={1.5} />
              <div>
                <h3 className="font-serif text-2xl italic">No events scheduled yet</h3>
                <p className="mt-2 max-w-xl leading-relaxed text-white/70">
                  New tastings will be listed here as soon as they are confirmed. Planning a gathering?
                  We can talk about a private tasting for your group.
                </p>
              </div>
            </div>
            <PrivateTastingLink context={context} />
          </div>
        </Reveal>
      )}
    </SectionShell>
  );
}
