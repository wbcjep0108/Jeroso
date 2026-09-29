import Hero from "@/components/home/Hero";
import Container from "@/components/layout/Container";
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
    </>
  );
}
