/**
 * Tasting events.
 *
 * Empty on purpose: no events are scheduled, and none may be invented. Add real
 * events to `upcomingTastings` (or replace getUpcomingTastings with a CMS or database
 * query) and they render in the Tastings section automatically.
 */

export type TastingEvent = {
  slug: string;
  title: string;
  /** ISO date, e.g. "2026-11-14" */
  date: string;
  /** Display time, e.g. "7:00 PM" */
  time?: string;
  venue: string;
  /** Price in Philippine pesos; omit for free events. */
  price?: number;
  description: string;
};

const upcomingTastings: TastingEvent[] = [];

export async function getUpcomingTastings(): Promise<TastingEvent[]> {
  return upcomingTastings;
}
