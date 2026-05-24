import { useEffect, useRef, type RefObject } from 'react';

interface Options {
  containerRef: RefObject<HTMLDivElement | null>;
  enabled: boolean;
  index: number;
  onChange: (idx: number) => void;
  debounceMs?: number;
}

/**
 * scroll-snap 가로 스크롤 컨테이너의 현재 카드 인덱스를 추적·동기화.
 * - enabled가 켜질 때 현재 index 위치로 즉시 점프
 * - 사용자가 스크롤하면 debounce 후 onChange 호출
 */
export function useScrollSnapIndex({ containerRef, enabled, index, onChange, debounceMs = 60 }: Options) {
  const indexRef = useRef(index);
  useEffect(() => { indexRef.current = index; }, [index]);

  // enabled가 켜지면 현재 인덱스 위치로 점프
  useEffect(() => {
    if (!enabled) return;
    requestAnimationFrame(() => {
      const container = containerRef.current;
      if (container) container.scrollTo({ left: indexRef.current * container.clientWidth, behavior: 'instant' });
    });
  }, [enabled, containerRef]);

  // 스크롤 → onChange
  useEffect(() => {
    if (!enabled) return;
    const container = containerRef.current;
    if (!container) return;

    let timer: ReturnType<typeof setTimeout> | undefined;
    const handleScroll = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const idx = Math.round(container.scrollLeft / container.clientWidth);
        if (idx !== indexRef.current) onChange(idx);
      }, debounceMs);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      container.removeEventListener('scroll', handleScroll);
    };
  }, [enabled, containerRef, onChange, debounceMs]);
}
