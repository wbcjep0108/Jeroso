/**
 * Store and contact details. Every value below is a placeholder: replace each
 * "To be filled in" with the real detail before launch.
 */


export const siteInfo = {
  email: "bcueva1217@gmail.com",
  hours: "Business Hours",
};

/* ---------- contact form topics ---------- */

export const CONTACT_TOPICS = [
  { value: "general", label: "General question" },
  { value: "private-tasting", label: "Private tasting" },
  { value: "wine-question", label: "A wine in the collection" },
] as const;

export type ContactTopic = (typeof CONTACT_TOPICS)[number]["value"];

export const DEFAULT_CONTACT_TOPIC: ContactTopic = "general";

export function isContactTopic(value: string | null | undefined): value is ContactTopic {
  return CONTACT_TOPICS.some((topic) => topic.value === value);
}
