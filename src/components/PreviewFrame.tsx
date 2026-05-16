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
              transition: 'opacity 0.45s ease',
            }}
            tabIndex={-1}
          />
        </div>
      )}
    </div>
  );
}
