import Link from "next/link";
import Container from "@/components/layout/Container";
import Reveal from "@/components/motion/Reveal";

type ComingSoonProps = {
  title: string;
  description: string;
};

/** Shared placeholder for sections that are linked from the navbar but not built yet. */
export default function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <Container className="py-24 sm:py-32">
      <Reveal>
      <p className="text-xs uppercase tracking-[0.2em] text-sage">Coming soon</p>
      <h1 className="mt-4 font-serif text-5xl italic sm:text-6xl">{title}</h1>
      <p className="mt-6 max-w-xl text-base leading-relaxed text-white/70">{description}</p>
      <Link
        href="/wines"
        className="mt-10 inline-flex h-12 items-center rounded-full border border-white/30 px-6 text-sm hover:border-white"
      >
        Browse the collection
      </Link>
      </Reveal>
    </Container>
  );
}
