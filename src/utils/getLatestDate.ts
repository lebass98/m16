import type { TableSection } from '../types';

export function getLatestDate(data: TableSection[]): string {
  const dates = data.flatMap((s) => s.data.map((item) => item.start)).filter(Boolean);
  return [...new Set(dates)].sort().at(-1) ?? '';
}
