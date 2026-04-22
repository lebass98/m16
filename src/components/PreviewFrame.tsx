import { useRef, useEffect } from 'react';

const IFRAME_W = 1920;
const IFRAME_H = 1080;
const PAUSE_MS = 800;

interface Props {
  src: string;
  displayWidth: number;
  animate?: boolean;
  fillHeight?: boolean;
  speed?: number;
}

export default function PreviewFrame({ src, displayWidth, animate = false, fillHeight = false, speed = 4 }: Props) {
  const scale = displayWidth / IFRAME_W;
  const displayHeight = Math.round(IFRAME_H * scale);
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
      let contentH = IFRAME_H * 5; // cross-origin 기본값
      try {
        const sh = iframe.contentDocument?.documentElement?.scrollHeight ?? 0;
        if (sh > IFRAME_H) contentH = sh;
      } catch { /* cross-origin */ }

      // iframe과 스케일 래퍼를 실제 높이로 조정
      iframe.style.height = `${contentH}px`;
      if (wrapperRef.current) wrapperRef.current.style.height = `${contentH}px`;

      maxScroll = Math.max(contentH - IFRAME_H, 0);
      rafId = requestAnimationFrame(tick);
    };

    return () => {
      cancelAnimationFrame(rafId);
      if (iframe) iframe.onload = null;
    };
  }, [animate, src, speed]);

  return (
    <div
      style={{
        width: displayWidth,
        height: fillHeight ? '100%' : displayHeight,
        overflow: 'hidden',
        flexShrink: 0,
        background: '#fff',
        position: 'relative',
      }}
    >
      <div
        ref={wrapperRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: IFRAME_W,
          height: IFRAME_H, // onload 후 동적으로 변경됨
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
            width: IFRAME_W,
            height: IFRAME_H, // onload 후 동적으로 변경됨
            border: 'none',
            pointerEvents: 'none',
          }}
          tabIndex={-1}
        />
      </div>
    </div>
  );
}
