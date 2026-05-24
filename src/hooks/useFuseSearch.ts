import { useMemo } from 'react';
import Fuse from 'fuse.js';
import type { FlatCard } from './useFilteredData';

// fuzzy 매칭 threshold — 0=완전일치, 1=뭐든 매치. 0.3 이면 약간의 오타 허용.
const FUSE_THRESHOLD = 0.3;

const FUSE_KEYS: { name: keyof FlatCard['item']; weight: number }[] = [
  { name: 'pageTitle', weight: 0.4 },
  { name: 'id', weight: 0.25 },
  { name: 'depth1', weight: 0.1 },
  { name: 'depth2', weight: 0.1 },
  { name: 'depth3', weight: 0.1 },
  { name: 'note', weight: 0.05 },
];

/**
 * Fuse.js 기반 카드 검색.
 * - 오타 약간 허용 (threshold 0.3)
 * - pageTitle/id 가중치 ↑, depth/note ↓
 * - 빈 query면 빈 배열
 */
export function useFuseSearch(cards: FlatCard[], query: string, limit = 30): FlatCard[] {
  const fuse = useMemo(() =>
    new Fuse(cards, {
      keys: FUSE_KEYS.map((k) => ({ name: `item.${k.name}`, weight: k.weight })),
      threshold: FUSE_THRESHOLD,
      ignoreLocation: true,
      minMatchCharLength: 1,
    }),
    [cards],
  );

  return useMemo(() => {
    const q = query.trim();
    if (!q) return [];
    return fuse.search(q, { limit }).map((r) => r.item);
  }, [fuse, query, limit]);
}
