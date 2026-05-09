const RELATIVE_UNITS = [
  ["year", 31_536_000],
  ["month", 2_592_000],
  ["day", 86_400],
  ["hour", 3_600],
  ["minute", 60],
  ["second", 1],
] as const;

export function formatRelativeAge(seconds: number) {
  const age = Math.max(0, Math.floor(seconds));
  const [unit, unitSeconds] =
    RELATIVE_UNITS.find(([, threshold]) => age >= threshold) ??
    RELATIVE_UNITS[RELATIVE_UNITS.length - 1];
  const value = Math.max(1, Math.floor(age / unitSeconds));

  return `${value} ${unit}${value === 1 ? "" : "s"} ago`;
}
