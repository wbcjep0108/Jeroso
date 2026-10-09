import Link from "next/link";
import Container from "@/components/layout/Container";

export default function NotFound() {
  return (
    <div data-not-found className="flex min-h-svh items-center">
      <Container className="flex flex-col items-center py-16 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-sage">404</p>
        <h1 className="mt-4 font-serif text-5xl italic sm:text-6xl">This bottle is not in our cellar.</h1>
        <p className="mt-6 max-w-xl text-white/70">
          The page you are looking for does not exist or has moved.
        </p>
        <Link
          href="/wines"
          className="mt-10 inline-flex h-12 items-center rounded-full bg-white px-6 text-sm font-medium text-ink hover:bg-sage-light"
        >
          Back to Catalog
        </Link>
      </Container>
    </div>
  );
}
