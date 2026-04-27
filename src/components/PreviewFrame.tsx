import { useRef, useEffect, useState } from 'react';
import '../App.css';

const PAUSE_MS = 800;

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

export default function PreviewFrame({ src, displayWidth, animate = false, fillHeight = false, speed = 4, iframeWidth = 1920, iframeHeight = 1080, allowScroll = false }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [actualWidth, setActualWidth] = useState(typeof displayWidth === 'number' ? displayWidth : 375);
  const [actualHeight, setActualHeight] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasEnteredView, setHasEnteredView] = useState(false);

  useEffect(() => { setIsLoading(true); }, [src]);

  useEffect(() => {
    const ob = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setHasEnteredView(true);
        ob.disconnect();
      }
    }, { rootMargin: '300px' });
    if (containerRef.current) ob.observe(containerRef.current);
    return () => ob.disconnect();
  }, []);

  useEffect(() => {
    if (typeof displayWidth === 'number') {
      setActualWidth(displayWidth);
      return;
    }
    const ob = new ResizeObserver((entries) => {
      if (entries[0] && entries[0].contentRect.width > 0) {
        setActualWidth(entries[0].contentRect.width);
        setActualHeight(entries[0].contentRect.height);
      }
    });
    if (containerRef.current) ob.observe(containerRef.current);
    return () => ob.disconnect();
  }, [displayWidth]);

  const scale = actualWidth / iframeWidth;
  const displayHeight = Math.round(iframeHeight * scale);
  const dynamicIframeHeight = fillHeight && actualHeight > 0 ? actualHeight / scale : iframeHeight;
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !hasEnteredView) return;

    const handleLoad = () => {
      setIsLoading(false);
      try {
        const win = iframe.contentWindow;
        if (win) {
          let lastY = win.scrollY;
          win.addEventListener('scroll', () => {
            const currentY = win.scrollY;
            if (currentY > lastY + 5) {
              window.dispatchEvent(new CustomEvent('preview-scroll-dir', { detail: 'down' }));
              lastY = currentY;
            } else if (currentY < lastY - 5) {
              window.dispatchEvent(new CustomEvent('preview-scroll-dir', { detail: 'up' }));
              lastY = currentY;
            }
          });
        }
      } catch (e) { /* ignore cross-origin */ }
    };

    iframe.addEventListener('load', handleLoad);
    return () => iframe.removeEventListener('load', handleLoad);
  }, [src, hasEnteredView]);

  useEffect(() => {
    if (!animate || !hasEnteredView) return;

    let y = 0;
    let dir = 1;
    let rafId = 0;
    let paused = false;
    let maxScroll = 0;

    function applyY() {
      if (iframeRef.current) iframeRef.current.style.transform = `translateY(-${y}px)`;
    }

    function pause(callback: () => void) {
      paused = true;
      setTimeout(() => { paused = false; callback(); }, PAUSE_MS);
    }

    function tick() {
      if (paused) return;

      const iframe = iframeRef.current;
      if (iframe) {
        try {
          const doc = iframe.contentDocument;
          if (doc) {
            const sh = Math.max(doc.documentElement?.scrollHeight || 0, doc.body?.scrollHeight || 0);
            if (sh > iframeHeight) {
              const currentH = parseInt(iframe.style.height) || 0;
              if (sh !== currentH) {
                iframe.style.height = `${sh}px`;
                if (wrapperRef.current) wrapperRef.current.style.height = `${sh}px`;
                maxScroll = Math.max(sh - iframeHeight, 0);
              }
            } else if (sh > 0 && sh <= iframeHeight) {
              maxScroll = 0;
            }
          }
        } catch { /* ignore cross-origin */ }
      }

      y += speed * dir;

      if (y >= maxScroll) {
        y = maxScroll;
        applyY();
        if (maxScroll > 0) {
          pause(() => { dir = -1; rafId = requestAnimationFrame(tick); });
        } else {
          rafId = requestAnimationFrame(tick);
        }
        return;
      }
      if (y <= 0) {
        y = 0;
        applyY();
        if (maxScroll > 0) {
          pause(() => { dir = 1; rafId = requestAnimationFrame(tick); });
        } else {
          rafId = requestAnimationFrame(tick);
        }
        return;
      }
      applyY();
      rafId = requestAnimationFrame(tick);
    }

    const iframe = iframeRef.current;
    if (!iframe) return;

    iframe.onload = () => {
      let contentH = iframeHeight * 2.5; // cross-origin 기본값 (너무 길지 않게 수정)
      try {
        const doc = iframe.contentDocument;
        const sh = Math.max(doc?.documentElement?.scrollHeight || 0, doc?.body?.scrollHeight || 0);
        if (sh > 0) {
          contentH = Math.max(sh, iframeHeight);
        }
      } catch { /* cross-origin */ }

      // iframe과 스케일 래퍼를 실제 높이로 조정
      iframe.style.height = `${contentH}px`;
      if (wrapperRef.current) wrapperRef.current.style.height = `${contentH}px`;

      maxScroll = Math.max(contentH - iframeHeight, 0);
      rafId = requestAnimationFrame(tick);
    };

    return () => {
      cancelAnimationFrame(rafId);
      if (iframe) iframe.onload = null;
    };
  }, [animate, src, speed, hasEnteredView]);

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
          src={hasEnteredView ? src : undefined}
          title="preview"
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
    </div>
  );
}
