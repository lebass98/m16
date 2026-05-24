import { useCallback, useState } from 'react';

const STORAGE_KEY = 'bookmarks';

function load(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));
  } catch {
    return new Set();
  }
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Set<string>>(load);

  const toggle = useCallback((id: string) => {
    setBookmarks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      return next;
    });
  }, []);

  return { bookmarks, toggle };
}
