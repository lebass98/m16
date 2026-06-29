import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'recentlyViewed';
const MAX_ITEMS = 10;

interface RecentEntry {
  id: string;
  viewedAt: string; // ISO timestamp
}

/**
 * 최근 본 항목을 LRU 순으로 추적.
 * 외부 링크 열기·검색결과 클릭 등에서 record()를 호출.
 * 동일 id 재기록 시 viewedAt만 갱신되고 가장 앞으로 이동.
 *
 * usePersistedState를 쓸 수도 있으나 LRU 갱신/중복 제거 로직이 있어 직접 관리.
 */
export function useRecentlyViewed() {
  const [entries, setEntries] = useState<RecentEntry[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      // 보수적인 유효성 검사 — 깨진 데이터로 죽지 않도록
      return parsed
        .filter((e): e is RecentEntry => typeof e?.id === 'string' && typeof e?.viewedAt === 'string')
        .slice(0, MAX_ITEMS);
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(entries)); }
    catch { /* localStorage 차단 환경 */ }
  }, [entries]);

  const record = useCallback((id: string) => {
    if (!id) return;
    setEntries((prev) => {
      const filtered = prev.filter((e) => e.id !== id);
      return [{ id, viewedAt: new Date().toISOString() }, ...filtered].slice(0, MAX_ITEMS);
    });
  }, []);

  const clear = useCallback(() => setEntries([]), []);

  return { entries, record, clear };
}
