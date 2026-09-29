import type { ReactNode } from "react";

type ContainerProps = {
  children: ReactNode;
  /** Extra classes for vertical rhythm or flex/grid only. Never override width or horizontal padding. */
  className?: string;
};

/**
 * The single width system for the whole site.
 * width: 100%; max-width: 1400px; margin: 0 auto; padding: 0 2rem (1.25rem on mobile).
 */
export default function Container({ children, className = "" }: ContainerProps) {
  return (
    <div className={`mx-auto w-full max-w-[1400px] px-5 sm:px-8 ${className}`}>
      {children}
    </div>
  );
}
