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

  return {
    selected,
    has,
    toggle,
    add,
    remove,
    clear,
    setAll,
    size: selected.size,
  };
}
