// Parses period strings like "August 2023 – Present" into tenure info that
// drives the Career Forest visual grammar (tree size = time at the job).

const MONTHS: Record<string, number> = {
  january: 0,
  february: 1,
  march: 2,
  april: 3,
  may: 4,
  june: 5,
  july: 6,
  august: 7,
  september: 8,
  october: 9,
  november: 10,
  december: 11,
};

function parseDate(text: string): Date | null {
  const trimmed = text.trim().toLowerCase();
  if (trimmed === 'present') return new Date();
  const match = trimmed.match(/([a-z]+)\s+(\d{4})/);
  if (!match) return null;
  const month = MONTHS[match[1]];
  if (month === undefined) return null;
  return new Date(Number(match[2]), month, 1);
}

export function tenureMonths(period: string): number | null {
  const parts = period.split(/[–—]/);
  if (parts.length !== 2) return null;
  const start = parseDate(parts[0]);
  const end = parseDate(parts[1]);
  if (!start || !end) return null;
  return Math.max(
    1,
    (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()),
  );
}

export function tenureLabel(months: number | null): string | null {
  if (months === null) return null;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const parts: string[] = [];
  if (years > 0) parts.push(`${years} yr${years > 1 ? 's' : ''}`);
  if (rest > 0) parts.push(`${rest} mo${rest > 1 ? 's' : ''}`);
  return parts.join(' ');
}

export type TreeSize = 's' | 'm' | 'l';

// sapling < 18 months, young < 30 months, mature otherwise
export function tenureTreeSize(months: number | null): TreeSize {
  if (months === null) return 'm';
  if (months < 18) return 's';
  if (months < 30) return 'm';
  return 'l';
}
