import { useCallback, useState } from 'react';

export interface FiltersState {
  searchFilter: string;
  setSearchFilter: (v: string) => void;
  progressRange: number[];
  setProgressRange: (v: number[]) => void;
  showIncomplete: boolean;
  setShowIncomplete: React.Dispatch<React.SetStateAction<boolean>>;
  sectionFilter: Set<string>;
  toggleSectionFilter: (key: string) => void;
  clearSearchFilter: () => void;
}

export function useFilters(): FiltersState {
  const [searchFilter, setSearchFilter] = useState('');
  const [progressRange, setProgressRange] = useState<number[]>([0, 100]);
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

  return {
    searchFilter, setSearchFilter,
    progressRange, setProgressRange,
    showIncomplete, setShowIncomplete,
    sectionFilter, toggleSectionFilter,
    clearSearchFilter,
  };
}
