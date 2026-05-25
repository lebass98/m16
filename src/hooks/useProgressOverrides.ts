import { useCallback, useEffect, useState } from 'react';
import type { ProgressValue, TableSection } from '../types';

const OVERRIDES_KEY = 'progressOverrides';
const HISTORY_KEY = 'progressHistory';
const MAX_HISTORY_PER_ITEM = 20;

export interface ProgressOverride {
  progressPc?: ProgressValue;
  progressMobile?: ProgressValue;
  /** 마지막 수정 시각 (ISO) */
  updatedAt: string;
}

export interface HistoryEntry {
  /** 변경 시각 (ISO) */
  at: string;
  field: 'progressPc' | 'progressMobile';
  from: ProgressValue | null;
  to: ProgressValue;
}

type Overrides = Record<string, ProgressOverride>;
type History = Record<string, HistoryEntry[]>;

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') return parsed as T;
    return fallback;
  } catch {
    return fallback;
  }
}

/**
 * 사용자가 인앱에서 진행도를 수정한 내역을 관리.
 * 원본 데이터(시트/정적)는 읽기 전용 — 변경은 localStorage에 오버레이로 저장.
 * 모든 변경은 동시에 히스토리(HistoryEntry[])에도 기록되어 진행도 변경 시점을 추적 가능.
 *
 * apply(rawSections, overrides) → 오버레이가 적용된 새 sections 반환.
 */
export function useProgressOverrides() {
  const [overrides, setOverrides] = useState<Overrides>(() => loadJson(OVERRIDES_KEY, {} as Overrides));
  const [history, setHistory] = useState<History>(() => loadJson(HISTORY_KEY, {} as History));

  useEffect(() => {
    try { localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides)); } catch { /* ignore */ }
  }, [overrides]);

  useEffect(() => {
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history)); } catch { /* ignore */ }
  }, [history]);

  /**
   * 여러 항목의 진행도를 한 번에 수정.
   * - currentValues는 변경 전 값(히스토리의 'from' 기록용). 모르면 null 전달.
   * - field 둘 다 undefined면 아무 작업도 안 함.
   */
  const setProgress = useCallback((
    updates: Array<{ id: string; currentPc: ProgressValue | null; currentMo: ProgressValue | null; nextPc?: ProgressValue; nextMo?: ProgressValue }>,
  ) => {
    const now = new Date().toISOString();

    setOverrides((prev) => {
      const next: Overrides = { ...prev };
      for (const u of updates) {
        if (u.nextPc === undefined && u.nextMo === undefined) continue;
        const existing = next[u.id] ?? { updatedAt: now };
        next[u.id] = {
          ...existing,
          ...(u.nextPc !== undefined ? { progressPc: u.nextPc } : {}),
          ...(u.nextMo !== undefined ? { progressMobile: u.nextMo } : {}),
          updatedAt: now,
        };
      }
      return next;
    });

    setHistory((prev) => {
      const next: History = { ...prev };
      for (const u of updates) {
        const entries: HistoryEntry[] = [];
        if (u.nextPc !== undefined && u.nextPc !== u.currentPc) {
          entries.push({ at: now, field: 'progressPc', from: u.currentPc, to: u.nextPc });
        }
        if (u.nextMo !== undefined && u.nextMo !== u.currentMo) {
          entries.push({ at: now, field: 'progressMobile', from: u.currentMo, to: u.nextMo });
        }
        if (entries.length === 0) continue;
        const prevList = next[u.id] ?? [];
        next[u.id] = [...entries, ...prevList].slice(0, MAX_HISTORY_PER_ITEM);
      }
      return next;
    });
  }, []);

  /** 단일 항목의 오버라이드를 제거(원본 값으로 되돌림). 히스토리는 보존. */
  const revert = useCallback((id: string) => {
    setOverrides((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  /** 모든 오버라이드 + 히스토리 삭제. */
  const clearAll = useCallback(() => {
    setOverrides({});
    setHistory({});
  }, []);

  return { overrides, history, setProgress, revert, clearAll };
}

/**
 * 원본 sections에 overrides를 적용한 새 sections 반환.
 * overrides가 비어있으면 원본을 그대로 반환 (참조 동일성 유지 → 다운스트림 메모이즈 보호).
 */
export function applyOverrides(sections: TableSection[], overrides: Overrides): TableSection[] {
  if (Object.keys(overrides).length === 0) return sections;
  return sections.map((section) => ({
    ...section,
    data: section.data.map((item) => {
      const o = overrides[item.id];
      if (!o) return item;
      return {
        ...item,
        ...(o.progressPc !== undefined ? { progressPc: o.progressPc } : {}),
        ...(o.progressMobile !== undefined ? { progressMobile: o.progressMobile } : {}),
        // 사용자가 수정한 항목은 updatedAt도 갱신해 "최근 업데이트" 위젯에 반영
        updatedAt: o.updatedAt.slice(0, 10).replace(/-/g, '.'),
      };
    }),
  }));
}
