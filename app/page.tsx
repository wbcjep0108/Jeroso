import Hero from "@/components/home/Hero";
import Container from "@/components/layout/Container";
import HomeSectionScroller from "@/components/navigation/HomeSectionScroller";
import AboutSection from "@/components/sections/AboutSection";
import ContactSection from "@/components/sections/ContactSection";
import InsightsSection from "@/components/sections/InsightsSection";
import TastingsSection from "@/components/sections/TastingsSection";
import WineCollection from "@/components/wines/WineCollection";
import { getFeaturedWines, getWeeklyPick } from "@/lib/wines";

export default async function HomePage() {
  const [weeklyPick, featured] = await Promise.all([getWeeklyPick(), getFeaturedWines()]);

  return (
    <>
      <Hero weeklyPick={weeklyPick} />
      <Container className="py-24 sm:py-32">
        <WineCollection wines={featured} />
      </Container>
      {/* Same components as /tastings, /insights, /about and /contact. */}
      <TastingsSection context="home" />
      <InsightsSection context="home" />
      <AboutSection context="home" />
      <ContactSection context="home" />
      <HomeSectionScroller />
    </>
  );
}
