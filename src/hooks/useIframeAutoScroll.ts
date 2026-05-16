import { useEffect, type RefObject } from 'react';

interface Options {
  iframeRef: RefObject<HTMLIFrameElement | null>;
  wrapperRef?: RefObject<HTMLDivElement | null>;
  enabled: boolean;
  speed: number;
  iframeHeight: number;
  fallbackHeightMultiplier?: number;
  pauseMs?: number;
  resetKey?: unknown;
}

export function useIframeAutoScroll({
  iframeRef,
  wrapperRef,
  enabled,
  speed,
  iframeHeight,
  fallbackHeightMultiplier = 2.5,
  pauseMs = 800,
  resetKey,
}: Options) {
  useEffect(() => {
    if (!enabled) return;
    const iframe = iframeRef.current;
    if (!iframe) return;

    let y = 0;
    let dir = 1;
    let rafId = 0;
    let paused = false;
    let maxScroll = 0;
    let pauseTimer: ReturnType<typeof setTimeout> | null = null;

    const applyY = () => {
      const el = iframeRef.current;
      if (el) el.style.transform = `translateY(-${y}px)`;
    };

    const pause = (cb: () => void) => {
      paused = true;
      pauseTimer = setTimeout(() => {
        paused = false;
        pauseTimer = null;
        cb();
      }, pauseMs);
    };

    const tick = () => {
      if (paused) return;
      const el = iframeRef.current;
      if (el) {
        try {
          const doc = el.contentDocument;
          if (doc) {
            const sh = Math.max(doc.documentElement?.scrollHeight || 0, doc.body?.scrollHeight || 0);
            if (sh > iframeHeight) {
              const currentH = parseInt(el.style.height) || 0;
              if (sh !== currentH) {
                el.style.height = `${sh}px`;
                if (wrapperRef?.current) wrapperRef.current.style.height = `${sh}px`;
                maxScroll = Math.max(sh - iframeHeight, 0);
              }
            } else if (sh > 0 && sh <= iframeHeight) {
              maxScroll = 0;
            }
          }
        } catch { /* cross-origin */ }
      }

      y += speed * dir;
      if (y >= maxScroll) {
        y = maxScroll;
        applyY();
        if (maxScroll > 0) pause(() => { dir = -1; rafId = requestAnimationFrame(tick); });
        else rafId = requestAnimationFrame(tick);
        return;
      }
      if (y <= 0) {
        y = 0;
        applyY();
        if (maxScroll > 0) pause(() => { dir = 1; rafId = requestAnimationFrame(tick); });
        else rafId = requestAnimationFrame(tick);
        return;
      }
      applyY();
      rafId = requestAnimationFrame(tick);
    };

    const handleLoad = () => {
      let contentH = iframeHeight * fallbackHeightMultiplier;
      try {
        const doc = iframe.contentDocument;
        const sh = Math.max(doc?.documentElement?.scrollHeight || 0, doc?.body?.scrollHeight || 0);
        if (sh > 0) contentH = Math.max(sh, iframeHeight);
      } catch { /* cross-origin */ }
      iframe.style.height = `${contentH}px`;
      if (wrapperRef?.current) wrapperRef.current.style.height = `${contentH}px`;
      maxScroll = Math.max(contentH - iframeHeight, 0);
      rafId = requestAnimationFrame(tick);
    };

    iframe.addEventListener('load', handleLoad);
    return () => {
      cancelAnimationFrame(rafId);
      if (pauseTimer) clearTimeout(pauseTimer);
      iframe.removeEventListener('load', handleLoad);
    };
  }, [enabled, speed, iframeHeight, fallbackHeightMultiplier, pauseMs, resetKey, iframeRef, wrapperRef]);
}
