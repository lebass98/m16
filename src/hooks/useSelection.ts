import { useCallback, useState } from 'react';

/**
 * 다중 선택(체크박스 모델)을 관리.
 * 휘발성(localStorage 비저장) — 새로고침하면 초기화.
 *
 * usage:
 *   const { selected, toggle, clear, has, size } = useSelection<string>();
 */
export function useSelection<T>() {
  const [selected, setSelected] = useState<Set<T>>(() => new Set());

  const has = useCallback((id: T) => selected.has(id), [selected]);

  const toggle = useCallback((id: T) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const add = useCallback((id: T) => {
    setSelected((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const remove = useCallback((id: T) => {
    setSelected((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const clear = useCallback(() => setSelected(new Set()), []);

  const setAll = useCallback((ids: T[]) => setSelected(new Set(ids)), []);

  /**
   * orderedIds 배열 안에서 anchor~target 사이의 모든 id를 일괄 선택 추가.
   * Shift+Click 범위 선택용. anchor가 없거나 둘 중 하나가 배열에 없으면 target만 토글.
   */
  const selectRange = useCallback((orderedIds: T[], anchor: T | null, target: T) => {
    setSelected((prev) => {
      if (anchor === null || anchor === target) {
        const next = new Set(prev);
        if (next.has(target)) next.delete(target); else next.add(target);
        return next;
      }
      const aIdx = orderedIds.indexOf(anchor);
      const tIdx = orderedIds.indexOf(target);
      if (aIdx < 0 || tIdx < 0) {
        const next = new Set(prev);
        if (next.has(target)) next.delete(target); else next.add(target);
        return next;
      }
      const [from, to] = aIdx < tIdx ? [aIdx, tIdx] : [tIdx, aIdx];
      const next = new Set(prev);
      for (let i = from; i <= to; i++) next.add(orderedIds[i]);
      return next;
    });
  }, []);

  return {
    selected,
    has,
    toggle,
    add,
    remove,
    clear,
    setAll,
    selectRange,
    size: selected.size,
  };
}
