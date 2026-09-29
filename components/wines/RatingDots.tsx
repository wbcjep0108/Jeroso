type RatingDotsProps = {
  label: string;
  value: number;
  max?: number;
};

/** Filled-dot rating, e.g. Body 4 / 5. */
export default function RatingDots({ label, value, max = 5 }: RatingDotsProps) {
  return (
    <div className="flex items-center justify-between gap-6 border-b border-ink-line py-3">
      <dt className="text-sm text-white/75">{label}</dt>
      <dd className="flex items-center gap-1.5">
        <span className="sr-only">
          {value} out of {max}
        </span>
        {Array.from({ length: max }, (_, i) => (
          <span
            key={i}
            aria-hidden="true"
            className={`h-2.5 w-2.5 rounded-full ${
              i < value ? "bg-sage-light" : "border border-white/25"
            }`}
          />
        ))}
      </dd>
    </div>
  );
}
