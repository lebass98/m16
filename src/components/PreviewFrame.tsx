import { useRef, useEffect, useState } from 'react';

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
    if (!animate) return;

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
      y += speed * dir;

      if (y >= maxScroll) {
        y = maxScroll;
        applyY();
        pause(() => { dir = -1; rafId = requestAnimationFrame(tick); });
        return;
      }
      if (y <= 0) {
        y = 0;
        applyY();
        pause(() => { dir = 1; rafId = requestAnimationFrame(tick); });
        return;
      }
      applyY();
      rafId = requestAnimationFrame(tick);
    }

    const iframe = iframeRef.current;
    if (!iframe) return;

    iframe.onload = () => {
      // 실제 콘텐츠 높이 측정 (same-origin만 가능)
      let contentH = iframeHeight * 5; // cross-origin 기본값
      try {
        const sh = iframe.contentDocument?.documentElement?.scrollHeight ?? 0;
        if (sh > iframeHeight) contentH = sh;
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
  }, [animate, src, speed]);

  return (
    <div
      ref={containerRef}
      style={{
        width: displayWidth,
        height: fillHeight ? '100%' : displayHeight,
        overflow: 'hidden',
        flexShrink: 0,
        background: 'transparent',
        position: 'relative',
      }}
    >
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
          style={{
            display: 'block',
            width: iframeWidth,
            height: animate ? iframeHeight : dynamicIframeHeight,
            border: 'none',
            pointerEvents: allowScroll ? 'auto' : 'none',
          }}
          tabIndex={-1}
        />
      </div>
    </div>
  );
}
