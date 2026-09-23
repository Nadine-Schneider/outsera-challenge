const YEAR_PATTERN = /^\d{4}$/;

/** Returns the year typed in a filter field, or `undefined` unless it has exactly 4 digits. */
export function parseYear(value: string): number | undefined {
  const trimmed = value.trim();
  return YEAR_PATTERN.test(trimmed) ? Number(trimmed) : undefined;
}

/** Keeps only the digits of a year field, up to 4 characters. */
export function toYearDigits(value: string): string {
  return value.replace(/\D/g, '').slice(0, 4);
}
