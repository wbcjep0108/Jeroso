export const INSIGHTS_BACKGROUND_IMAGE = "/images/insight_bg.png";

export function getInsightBackgroundOpacity(progress: number): number {
  const clampedProgress = Math.min(1, Math.max(0, progress));
  return Math.min(1, Math.max(0, (clampedProgress - 0.9) / 0.1));
}
