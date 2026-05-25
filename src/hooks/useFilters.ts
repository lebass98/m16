import { useCallback, useState } from 'react';
import { useDebouncedValue } from './useDebouncedValue';

export interface FiltersState {
  searchFilter: string;
  setSearchFilter: (v: string) => void;
  /** 슬라이더 즉시값 — UI 표시용. 필터 계산은 debouncedProgressRange 사용. */
  progressRange: number[];
  setProgressRange: (v: number[]) => void;
  /** 100ms 안정된 값. useFilteredData에 전달. */
  debouncedProgressRange: number[];
  showIncomplete: boolean;
  setShowIncomplete: React.Dispatch<React.SetStateAction<boolean>>;
  sectionFilter: Set<string>;
  toggleSectionFilter: (key: string) => void;
  clearSectionFilter: () => void;
  clearSearchFilter: () => void;
}

export function useFilters(): FiltersState {
  const [searchFilter, setSearchFilter] = useState('');
  const [progressRange, setProgressRange] = useState<number[]>([0, 100]);
  const debouncedProgressRange = useDebouncedValue(progressRange, 100);
  const [showIncomplete, setShowIncomplete] = useState(false);
  const [sectionFilter, setSectionFilter] = useState<Set<string>>(new Set());

  const toggleSectionFilter = useCallback((key: string) => {
    setSectionFilter((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }, []);

  const clearSearchFilter = useCallback(() => setSearchFilter(''), []);
  const clearSectionFilter = useCallback(() => setSectionFilter(new Set()), []);

  return {
    searchFilter, setSearchFilter,
    progressRange, setProgressRange, debouncedProgressRange,
    showIncomplete, setShowIncomplete,
    sectionFilter, toggleSectionFilter, clearSectionFilter,
    clearSearchFilter,
  };
}
