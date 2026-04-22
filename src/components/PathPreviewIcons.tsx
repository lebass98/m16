import { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Box, Dialog, IconButton, Tooltip } from '@mui/material';
import MonitorIcon from '@mui/icons-material/Monitor';
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import CloseIcon from '@mui/icons-material/Close';
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
      if (y >= maxScroll) { y = maxScroll; applyY(); pause(() => { dir = -1; rafId = requestAnimationFrame(tick); }); return; }
      if (y <= 0) { y = 0; applyY(); pause(() => { dir = 1; rafId = requestAnimationFrame(tick); }); return; }
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
    return () => { cancelAnimationFrame(rafId); if (iframe) iframe.onload = null; };
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
      } catch { /* cross-origin */ }
      iframe.style.height = `${contentH}px`;
      if (wrapperRef.current) wrapperRef.current.style.height = `${contentH}px`;
      if (containerRef.current) containerRef.current.style.height = `${Math.round(contentH * scale)}px`;
    };
    return () => { if (iframe) iframe.onload = null; };
  }, [src, scale]);

  return (
    <div style={{ width: MODAL_PC_W, maxHeight: '80vh', overflowY: 'auto', background: '#fff' }}>
      <div ref={containerRef} style={{ width: MODAL_PC_W, height: Math.round(FALLBACK_H * scale), position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
        <div ref={wrapperRef} style={{ position: 'absolute', top: 0, left: 0, width: IFRAME_W, height: FALLBACK_H, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
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
          iframe.style.height = `${sh}px`;
          iframe.style.pointerEvents = 'none';
          if (outerRef.current) outerRef.current.style.overflowY = 'auto';
        }
      } catch { /* cross-origin */ }
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

interface Props {
  path: string;
}

export default function PathPreviewIcons({ path }: Props) {
  const [hovered, setHovered] = useState<HoverType>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [clicked, setClicked] = useState<HoverType>(null);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px', width: '100%', justifyContent: 'space-between' }}>
      <Box
        component="a"
        href={path}
        target="_blank"
        rel="noreferrer"
        sx={{ flex: 1, wordBreak: 'break-all', color: 'inherit', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
      >
        {displayPath(path)}
      </Box>

      <Box sx={{ display: 'flex', gap: '5px', flexShrink: 0 }}>
          <Box
            component="span"
            sx={{
              display: 'inline-flex', alignItems: 'center', gap: '3px',
              px: '8px', py: '3px', fontSize: 12, borderRadius: '4px',
              bgcolor: hovered === 'pc' ? '#066cb3' : '#eee',
              color: hovered === 'pc' ? '#fff' : '#555',
              cursor: 'pointer', userSelect: 'none',
              transition: 'background 0.15s, color 0.15s',
            }}
            onMouseEnter={(e) => { setHovered('pc'); setPos(calcPos(e, PC_W, PC_H)); }}
            onMouseLeave={() => setHovered(null)}
            onMouseMove={(e) => setPos(calcPos(e, PC_W, PC_H))}
            onClick={(e) => { e.stopPropagation(); setClicked('pc'); setHovered(null); }}
          >
            <MonitorIcon sx={{ fontSize: 18 }} /> PC
          </Box>

          <Box
            component="span"
            sx={{
              display: 'inline-flex', alignItems: 'center', gap: '3px',
              px: '8px', py: '3px', fontSize: 12, borderRadius: '4px',
              bgcolor: hovered === 'mobile' ? '#066cb3' : '#eee',
              color: hovered === 'mobile' ? '#fff' : '#555',
              cursor: 'pointer', userSelect: 'none',
              transition: 'background 0.15s, color 0.15s',
            }}
            onMouseEnter={(e) => { setHovered('mobile'); setPos(calcPos(e, MOBILE_W, MOBILE_H)); }}
            onMouseLeave={() => setHovered(null)}
            onMouseMove={(e) => setPos(calcPos(e, MOBILE_W, MOBILE_H))}
            onClick={(e) => { e.stopPropagation(); setClicked('mobile'); setHovered(null); }}
          >
            <SmartphoneIcon sx={{ fontSize: 15 }} /> 모바일
          </Box>
      </Box>

      {/* 호버 팝업 — DataGrid transform 클리핑 방지를 위해 body에 Portal로 렌더링 */}
      {hovered === 'pc' && createPortal(
        <Box sx={{ position: 'fixed', zIndex: 9999, left: pos.x, top: pos.y, borderRadius: '8px', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.25)', border: '1px solid #ddd', pointerEvents: 'none' }}>
          <PreviewFrame src={path} displayWidth={PC_W} animate />
        </Box>,
        document.body
      )}
      {hovered === 'mobile' && createPortal(
        <Box sx={{ position: 'fixed', zIndex: 9999, left: pos.x, top: pos.y, borderRadius: '20px', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', border: '6px solid #222', pointerEvents: 'none' }}>
          <MobilePreviewFrame src={path} />
        </Box>,
        document.body
      )}

      {/* 클릭 모달 */}
      <Dialog
        open={!!clicked}
        onClose={() => setClicked(null)}
        maxWidth={false}
        slotProps={{
          paper: {
            sx: {
              borderRadius: clicked === 'mobile' ? '28px' : '12px',
              border: clicked === 'mobile' ? '8px solid #222' : '1px solid #ccc',
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              m: 0,
            },
          },
        }}
      >
        <IconButton
          onClick={() => setClicked(null)}
          size="small"
          sx={{
            position: 'absolute', top: 8, right: 8, zIndex: 10,
            width: 32, height: 32,
            bgcolor: 'rgba(0,0,0,0.55)', color: '#fff',
            '&:hover': { bgcolor: 'rgba(0,0,0,0.85)' },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
        {clicked === 'pc' ? (
          <PCModalContent src={path} />
        ) : clicked === 'mobile' ? (
          <MobileModalContent src={path} />
        ) : null}
      </Dialog>
    </Box>
  );
}
