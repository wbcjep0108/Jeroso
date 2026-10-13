import type { CSSProperties } from "react";

type GradualBlurProps = {
  target?: "parent";
  position?: "top" | "bottom";
  height?: string;
  strength?: number;
  divCount?: number;
  curve?: "linear" | "bezier";
  opacity?: number;
  className?: string;
};

/** A small, pointer-inert backdrop blur that fades over an edge of its relative parent. */
export default function GradualBlur({
  target = "parent",
  position = "bottom",
  height = "3rem",
  strength = 0.8,
  divCount = 3,
  curve = "bezier",
  opacity = 0.65,
  className = "",
}: GradualBlurProps) {
  const fromBottom = position === "bottom";
  const maskDirection = fromBottom ? "to top" : "to bottom";
  const easing = curve === "bezier" ? "cubic-bezier(0.22, 1, 0.36, 1)" : "linear";

  return (
    <div
      aria-hidden="true"
      data-blur-target={target}
      className={`pointer-events-none absolute inset-x-0 z-10 ${fromBottom ? "bottom-0" : "top-0"} ${className}`}
      style={{ height, opacity }}
    >
      {Array.from({ length: divCount }, (_, index) => {
        const layer = index + 1;
        const style: CSSProperties = {
          [fromBottom ? "bottom" : "top"]: 0,
          height: `${(layer / divCount) * 100}%`,
          backdropFilter: `blur(${strength * layer * 1.4}px)`,
          WebkitBackdropFilter: `blur(${strength * layer * 1.4}px)`,
          maskImage: `linear-gradient(${maskDirection}, black 0%, transparent 100%)`,
          WebkitMaskImage: `linear-gradient(${maskDirection}, black 0%, transparent 100%)`,
          transitionTimingFunction: easing,
        };

        return <span key={layer} className="absolute inset-x-0" style={style} />;
      })}
    </div>
  );
}
