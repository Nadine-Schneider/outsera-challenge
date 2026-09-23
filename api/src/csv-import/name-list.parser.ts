/**
 * Matches the separators used in the `producers` and `studios` columns:
 * ", and ", "," and " and ", in any letter case ("and", "AND", "aNd"...).
 * The "and" must be a whole word surrounded by whitespace, so names such as
 * "Andrew Bergman" or "Alexander" stay intact.
 */
const NAME_SEPARATOR = /\s*,\s*(?:and\s+)?|\s+and\s+/i;
const WHITESPACE_RUN = /\s+/g;

/**
 * Splits a raw list of names ("A, B, and C", "A, B and C", "A and B") into
 * trimmed, non-empty and unique names, preserving the order of appearance.
 */
export function parseNameList(raw: string | undefined): string[] {
  if (!raw) {
    return [];
  }

  const names = raw
    .split(NAME_SEPARATOR)
    .map((name) => name.replace(WHITESPACE_RUN, ' ').trim())
    .filter((name) => name.length > 0);

  return [...new Set(names)];
}
