import { useRef, useEffect, useState } from 'react';
import { useIframeAutoScroll } from '../hooks/useIframeAutoScroll';
import { PREVIEW_SCROLL_DIR_EVENT } from '../types/events';
import '../App.css';

interface Props {
  src: string;
  displayWidth: number | string;
  animate?: boolean;
  fillHeight?: boolean;
  speed?: number;
  iframeWidth?: number;
  iframeHeight?: number;
  allowScroll?: boolean;
}

const LOAD_MARGIN = '200px';
const UNLOAD_MARGIN = '1200px';

export default function PreviewFrame({
  src,
  displayWidth,
  animate = false,
  fillHeight = false,
  speed = 4,
  iframeWidth = 1920,
  iframeHeight = 1080,
  allowScroll = false,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // 측정 가능한 폭만 별도 상태로 추적. displayWidth가 숫자면 그대로 사용해 setState 불필요.
  const [resizeWidth, setResizeWidth] = useState(375);
  const [resizeHeight, setResizeHeight] = useState(0);
  const actualWidth = typeof displayWidth === 'number' ? displayWidth : resizeWidth;
  const actualHeight = typeof displayWidth === 'number' ? 0 : resizeHeight;

  const [shouldLoad, setShouldLoad] = useState(false);
  // 현재 src와 마지막 로드 완료된 src를 비교해 isLoading을 파생값으로 계산.
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const isLoading = !shouldLoad || loadedSrc !== src;

  // 진입 시 load, 멀리 벗어나면 unload (히스테리시스로 스크롤 시 깜박임 방지)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const loadObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setShouldLoad(true);
    }, { rootMargin: LOAD_MARGIN });

    const unloadObserver = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) {
        setShouldLoad(false);
        setLoadedSrc(null);
      }
    }, { rootMargin: UNLOAD_MARGIN });

    loadObserver.observe(el);
    unloadObserver.observe(el);

    return () => {
      loadObserver.disconnect();
      unloadObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if (typeof displayWidth === 'number') return; // 숫자면 ResizeObserver 불필요
    const target = containerRef.current;
    if (!target) return;
    const ob = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (rect && rect.width > 0) {
        setResizeWidth(rect.width);
        setResizeHeight(rect.height);
      }
    });
    ob.observe(target);
    return () => ob.disconnect();
  }, [displayWidth]);

  const scale = actualWidth / iframeWidth;
  const displayHeight = Math.round(iframeHeight * scale);
  const dynamicIframeHeight = fillHeight && actualHeight > 0 ? actualHeight / scale : iframeHeight;

  // 로드 완료 시 loadedSrc 갱신 + iframe 내부 스크롤 방향을 외부로 전파
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !shouldLoad) return;

    const handleLoad = () => {
      setLoadedSrc(src);
      try {
        const win = iframe.contentWindow;
        if (win) {
          let lastY = win.scrollY;
          win.addEventListener('scroll', () => {
            const currentY = win.scrollY;
            if (currentY > lastY + 5) {
              window.dispatchEvent(new CustomEvent(PREVIEW_SCROLL_DIR_EVENT, { detail: 'down' }));
              lastY = currentY;
            } else if (currentY < lastY - 5) {
              window.dispatchEvent(new CustomEvent(PREVIEW_SCROLL_DIR_EVENT, { detail: 'up' }));
              lastY = currentY;
            }
          });
        }
      } catch { /* cross-origin */ }
    };

    iframe.addEventListener('load', handleLoad);
    return () => iframe.removeEventListener('load', handleLoad);
  }, [src, shouldLoad]);

  // 자동 스크롤 (animate=true 일 때만)
  useIframeAutoScroll({
    iframeRef,
    wrapperRef,
    enabled: animate && shouldLoad,
    speed,
    iframeHeight,
    fallbackHeightMultiplier: 2.5,
    resetKey: src,
  });

  // 마우스 휠 스크롤 수동 처리 (allowScroll이 false이거나 pointerEvents가 none일 때 외부 휠 스크롤 가능하도록 지원)
  const scrollYRef = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || animate || !shouldLoad) return;

    // src가 바뀌면 스크롤 위치 초기화
    scrollYRef.current = 0;
    const iframe = iframeRef.current;
    if (iframe) {
      iframe.style.transform = 'translateY(0px)';
    }

    const handleWheel = (e: WheelEvent) => {
      const iframe = iframeRef.current;
      if (!iframe) return;

      let contentH = iframeHeight;
      try {
        const doc = iframe.contentDocument;
        const sh = Math.max(doc?.documentElement?.scrollHeight || 0, doc?.body?.scrollHeight || 0);
        if (sh > 0) contentH = Math.max(sh, iframeHeight);
      } catch {
        // Cross-Origin인 경우 fallbackHeightMultiplier * iframeHeight
        contentH = iframeHeight * 2.5;
      }
      
      const currentIframeHeight = parseInt(iframe.style.height) || iframeHeight;
      if (contentH !== currentIframeHeight) {
        iframe.style.height = `${contentH}px`;
        if (wrapperRef.current) wrapperRef.current.style.height = `${contentH}px`;
      }

      const visibleHeight = fillHeight && actualHeight > 0 ? actualHeight / scale : iframeHeight;
      const maxScroll = Math.max(contentH - visibleHeight, 0);
      if (maxScroll <= 0) return;

      // 휠 입력에 따라 스크롤 위치 계산
      const delta = e.deltaY;
      const nextY = Math.max(0, Math.min(scrollYRef.current + delta, maxScroll));
      
      if (nextY !== scrollYRef.current) {
        e.preventDefault();
        e.stopPropagation();
        scrollYRef.current = nextY;
        iframe.style.transform = `translateY(-${scrollYRef.current}px)`;
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [animate, shouldLoad, iframeHeight, fillHeight, actualHeight, scale, src]);

  return (
    <div
      ref={containerRef}
      style={{
        width: displayWidth,
        height: fillHeight ? '100%' : displayHeight,
        overflow: 'hidden',
        flexShrink: 0,
        background: '#fff',
        position: 'relative',
      }}
    >
      {isLoading && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 10, overflow: 'hidden', background: '#f0f2f5' }}>
          <div className="skeleton-shimmer" style={{ width: '100%', height: '38%' }} />
          <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div className="skeleton-shimmer" style={{ height: 12, borderRadius: 6, width: '70%' }} />
            <div className="skeleton-shimmer" style={{ height: 10, borderRadius: 6, width: '90%' }} />
            <div className="skeleton-shimmer" style={{ height: 10, borderRadius: 6, width: '55%' }} />
          </div>
        </div>
      )}
      {shouldLoad && (
        <div
          ref={wrapperRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: iframeWidth,
            height: animate ? iframeHeight : dynamicIframeHeight,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          <iframe
            ref={iframeRef}
            src={src}
            title="preview"
            loading="lazy"
            style={{
              display: 'block',
              width: iframeWidth,
              height: animate ? iframeHeight : dynamicIframeHeight,
              border: 'none',
              pointerEvents: allowScroll ? 'auto' : 'none',
              opacity: isLoading ? 0 : 1,
              transition: 'opacity 0.45s ease, transform 0.1s ease-out',
            }}
            tabIndex={-1}
          />
        </div>
      )}
    </div>
  );
}
