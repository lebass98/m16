import { useEffect, useState } from 'react';

/**
 * 입력값이 안정되면 ms 후 반환값이 갱신.
 * 슬라이더/검색어처럼 빠르게 변하는 입력을 무거운 계산(필터/정렬)에 직접 넣지 않을 때 사용.
 */
export function useDebouncedValue<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);

  return debounced;
}
