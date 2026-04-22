import { useRef, useEffect, useState } from 'react';
import PreviewFrame from './PreviewFrame';

type HoverType = 'pc' | 'mobile' | null;

const PC_W = 650;
const PC_H = Math.round(1080 * (PC_W / 1920));
const MOBILE_W = 375;
const MOBILE_H = 667;
const MOBILE_TALL = 4000;
const MOBILE_SPEED = 2;

const IFRAME_W = 1920;
const IFRAME_H = 1080;

const MODAL_PC_W = 800;
const MODAL_MOBILE_OUTER_W = 400;
const MODAL_MOBILE_INNER_W = 375;

function displayPath(path: string) {
  try { return new URL(path).pathname; } catch { return path; }
}

function calcPos(e: React.MouseEvent, w: number, h: number) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  let x = e.clientX + 16;
  let y = e.clientY - Math.round(h / 2);
  if (x + w > vw) x = e.clientX - w - 16;
  if (y < 8) y = 8;
  if (y + h > vh - 8) y = vh - h - 8;
  return { x, y };
}

function MobilePreviewFrame({ src }: { src: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    let y = 0;
    let dir = 1;
    let rafId = 0;
    let paused = false;
    let maxScroll = 0;
    const PAUSE_MS = 800;

    function applyY() {
      if (iframeRef.current) iframeRef.current.style.transform = `translateY(-${y}px)`;
    }

    function pause(callback: () => void) {
      paused = true;
      setTimeout(() => { paused = false; callback(); }, PAUSE_MS);
    }

    function tick() {
      if (paused) return;
      y += MOBILE_SPEED * dir;

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
      let contentH = MOBILE_TALL;
      try {
        const sh = iframe.contentDocument?.documentElement?.scrollHeight ?? 0;
        if (sh > MOBILE_H) contentH = sh;
      } catch { /* cross-origin */ }

      iframe.style.height = `${contentH}px`;
      maxScroll = Math.max(contentH - MOBILE_H, 0);
      rafId = requestAnimationFrame(tick);
    };

    return () => {
      cancelAnimationFrame(rafId);
      if (iframe) iframe.onload = null;
    };
  }, [src]);

  return (
    <div style={{ width: MOBILE_W, height: MOBILE_H, overflow: 'hidden', position: 'relative', background: '#fff' }}>
      <iframe
        ref={iframeRef}
        src={src}
        title="mobile preview"
        style={{ display: 'block', width: MOBILE_W, height: MOBILE_H, border: 'none', pointerEvents: 'none' }}
        tabIndex={-1}
      />
    </div>
  );
}

function PCModalContent({ src }: { src: string }) {
  const scale = MODAL_PC_W / IFRAME_W;
  const FALLBACK_H = IFRAME_H * 5;
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    iframe.onload = () => {
      let contentH = FALLBACK_H;
      try {
        const sh = iframe.contentDocument?.documentElement?.scrollHeight ?? 0;
        if (sh > IFRAME_H) contentH = sh;
      } catch { /* cross-origin: fallback 유지 */ }
      iframe.style.height = `${contentH}px`;
      if (wrapperRef.current) wrapperRef.current.style.height = `${contentH}px`;
      if (containerRef.current) containerRef.current.style.height = `${Math.round(contentH * scale)}px`;
    };
    return () => { if (iframe) iframe.onload = null; };
  }, [src, scale]);

  return (
    <div style={{ width: MODAL_PC_W, maxHeight: '80vh', overflowY: 'auto', background: '#fff' }}>
      <div
        ref={containerRef}
        style={{ width: MODAL_PC_W, height: Math.round(FALLBACK_H * scale), position: 'relative', overflow: 'hidden', flexShrink: 0 }}
      >
        <div
          ref={wrapperRef}
          style={{
            position: 'absolute', top: 0, left: 0,
            width: IFRAME_W, height: FALLBACK_H,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          <iframe
            ref={iframeRef}
            src={src}
            title="PC modal preview"
            style={{ display: 'block', width: IFRAME_W, height: FALLBACK_H, border: 'none', pointerEvents: 'none' }}
            tabIndex={-1}
          />
        </div>
      </div>
    </div>
  );
}

function MobileModalContent({ src }: { src: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const outerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    iframe.onload = () => {
      try {
        const sh = iframe.contentDocument?.documentElement?.scrollHeight ?? 0;
        if (sh > MOBILE_H) {
          // 같은 오리진: 실제 높이 감지 → 외부 컨테이너 스크롤
          iframe.style.height = `${sh}px`;
          iframe.style.pointerEvents = 'none';
          if (outerRef.current) outerRef.current.style.overflowY = 'auto';
        }
      } catch {
        // 크로스 오리진: iframe 자체 스크롤 유지
      }
    };
    return () => { if (iframe) iframe.onload = null; };
  }, [src]);

  return (
    <div ref={outerRef} style={{ width: MODAL_MOBILE_OUTER_W, maxHeight: '80vh', overflowY: 'hidden', background: '#fff' }}>
      <div style={{ width: MODAL_MOBILE_INNER_W, margin: '0 auto' }}>
        <iframe
          ref={iframeRef}
          src={src}
          title="Mobile modal preview"
          style={{ display: 'block', width: MODAL_MOBILE_INNER_W, height: '80vh', border: 'none' }}
          tabIndex={-1}
        />
      </div>
    </div>
  );
}

function MonitorIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <polyline points="8 21 12 17 16 21" />
    </svg>
  );
}

function SmartphoneIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <circle cx="12" cy="18" r="0.5" fill="currentColor" />
    </svg>
  );
}

interface Props {
  path: string;
}

export default function PathPreviewIcons({ path }: Props) {
  const [hovered, setHovered] = useState<HoverType>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [clicked, setClicked] = useState<HoverType>(null);

  useEffect(() => {
    if (!clicked) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setClicked(null);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [clicked]);

  return (
    <div className="path-cell">
      <a href={path} target="_blank" rel="noreferrer" className="path-cell__link">{displayPath(path)}</a>
      <div className="path-cell__icons">
        <span
          className={`path-cell__icon${hovered === 'pc' ? ' is-active' : ''}`}
          title="PC 미리보기"
          onMouseEnter={(e) => { setHovered('pc'); setPos(calcPos(e, PC_W, PC_H)); }}
          onMouseLeave={() => setHovered(null)}
          onMouseMove={(e) => setPos(calcPos(e, PC_W, PC_H))}
          onClick={(e) => { e.stopPropagation(); setClicked('pc'); setHovered(null); }}
        >
          <MonitorIcon /> PC
        </span>
        <span
          className={`path-cell__icon${hovered === 'mobile' ? ' is-active' : ''}`}
          title="모바일 미리보기"
          onMouseEnter={(e) => { setHovered('mobile'); setPos(calcPos(e, MOBILE_W, MOBILE_H)); }}
          onMouseLeave={() => setHovered(null)}
          onMouseMove={(e) => setPos(calcPos(e, MOBILE_W, MOBILE_H))}
          onClick={(e) => { e.stopPropagation(); setClicked('mobile'); setHovered(null); }}
        >
          <SmartphoneIcon /> 모바일
        </span>
      </div>

      {hovered === 'pc' && (
        <div className="path-hover-popup" style={{ left: pos.x, top: pos.y }}>
          <PreviewFrame src={path} displayWidth={PC_W} animate />
        </div>
      )}
      {hovered === 'mobile' && (
        <div className="path-hover-popup path-hover-popup--mobile" style={{ left: pos.x, top: pos.y }}>
          <MobilePreviewFrame src={path} />
        </div>
      )}

      {clicked && (
        <div className="preview-modal-overlay" onClick={() => setClicked(null)}>
          <div
            className={`preview-modal${clicked === 'mobile' ? ' preview-modal--mobile' : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="preview-modal__close" onClick={() => setClicked(null)}>×</button>
            {clicked === 'pc' ? (
              <PCModalContent src={path} />
            ) : (
              <MobileModalContent src={path} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
