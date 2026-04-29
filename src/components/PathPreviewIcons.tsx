import { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Box, Dialog, IconButton, Tooltip } from '@mui/material';
import pcIcon from '../assets/pc-svgrepo-com.svg';
import tabletIcon from '../assets/ipad-svgrepo-com.svg';
import mobileIcon from '../assets/mobile-svgrepo-com.svg';
import copyIcon from '../assets/copy-success-svgrepo-com.svg';
import CloseIcon from '@mui/icons-material/Close';
import PreviewFrame from './PreviewFrame';

type HoverType = 'pc' | 'tablet' | 'mobile' | null;

const PC_W = 1024;
const PC_H = Math.round(1080 * (PC_W / 1920));
const TABLET_W = 500;
const TABLET_H = Math.round(1024 * (TABLET_W / 768));
const MOBILE_W = 375;
const MOBILE_H = 667;
const MOBILE_SPEED = 2;

const IFRAME_W = 1920;
const IFRAME_H = 1080;

const MODAL_PC_W = 1024;
const MODAL_TABLET_W = 768;
const MODAL_MOBILE_OUTER_W = 400;
const MODAL_MOBILE_INNER_W = 375;



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

      const iframe = iframeRef.current;
      if (iframe) {
        try {
          const doc = iframe.contentDocument;
          if (doc) {
            const sh = Math.max(doc.documentElement?.scrollHeight || 0, doc.body?.scrollHeight || 0);
            if (sh > MOBILE_H) {
              const currentH = parseInt(iframe.style.height) || 0;
              if (sh !== currentH) {
                iframe.style.height = `${sh}px`;
                maxScroll = Math.max(sh - MOBILE_H, 0);
              }
            } else if (sh > 0 && sh <= MOBILE_H) {
              maxScroll = 0;
            }
          }
        } catch { /* cross-origin */ }
      }

      y += MOBILE_SPEED * dir;
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
      let contentH = MOBILE_H * 3; // cross-origin 기본값 (너무 길지 않게 수정)
      try {
        const doc = iframe.contentDocument;
        const sh = Math.max(doc?.documentElement?.scrollHeight || 0, doc?.body?.scrollHeight || 0);
        if (sh > 0) {
          contentH = Math.max(sh, MOBILE_H);
        }
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

function TabletModalContent({ src }: { src: string }) {
  const scale = MODAL_TABLET_W / 768;
  const IFRAME_W = 768;
  const IFRAME_H = 1024;
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
    <div style={{ width: MODAL_TABLET_W, maxHeight: '80vh', overflowY: 'auto', background: '#fff' }}>
      <div ref={containerRef} style={{ width: MODAL_TABLET_W, height: Math.round(FALLBACK_H * scale), position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
        <div ref={wrapperRef} style={{ position: 'absolute', top: 0, left: 0, width: IFRAME_W, height: FALLBACK_H, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
          <iframe
            ref={iframeRef}
            src={src}
            title="Tablet modal preview"
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
  previewEnabled?: boolean;
}

export default function PathPreviewIcons({ path, previewEnabled = true }: Props) {
  const [hovered, setHovered] = useState<HoverType>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [clicked, setClicked] = useState<HoverType>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(path);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px', width: '100%', justifyContent: 'center' }}>

      <Box sx={{ display: 'flex', gap: '5px', flexShrink: 0, alignItems: 'center' }}>
        <Tooltip title={copied ? 'url 복사됨' : 'url 복사하기'} placement="top" arrow>
          <Box
            component="span"
            onClick={handleCopy}
            onMouseLeave={() => setTimeout(() => setCopied(false), 200)}
            sx={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              p: '4px', borderRadius: '4px',
              cursor: 'pointer', userSelect: 'none',
              transition: 'background 0.15s',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' }
            }}
          >
            <Box component="img" src={copyIcon} alt="Copy URL" sx={{ width: 16, height: 16 }} />
          </Box>
        </Tooltip>

        {previewEnabled && (
          <>
            <Box
              component="span"
              sx={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                p: '4px', borderRadius: '4px',
                bgcolor: hovered === 'pc' ? '#066cb3' : 'transparent',
                cursor: 'pointer', userSelect: 'none',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => { setHovered('pc'); setPos(calcPos(e, PC_W, PC_H)); }}
              onMouseLeave={() => setHovered(null)}
              onMouseMove={(e) => setPos(calcPos(e, PC_W, PC_H))}
              onClick={(e) => { e.stopPropagation(); setClicked('pc'); setHovered(null); }}
            >
              <Box component="img" src={pcIcon} alt="PC" sx={{ width: 18, height: 18, filter: hovered === 'pc' ? 'brightness(0) invert(1)' : 'none', transition: 'filter 0.15s' }} />
            </Box>

            <Box
              component="span"
              sx={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                p: '4px', borderRadius: '4px',
                bgcolor: hovered === 'tablet' ? '#066cb3' : 'transparent',
                cursor: 'pointer', userSelect: 'none',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => { setHovered('tablet'); setPos(calcPos(e, TABLET_W, TABLET_H)); }}
              onMouseLeave={() => setHovered(null)}
              onMouseMove={(e) => setPos(calcPos(e, TABLET_W, TABLET_H))}
              onClick={(e) => { e.stopPropagation(); setClicked('tablet'); setHovered(null); }}
            >
              <Box component="img" src={tabletIcon} alt="Tablet" sx={{ width: 18, height: 18, filter: hovered === 'tablet' ? 'brightness(0) invert(1)' : 'none', transition: 'filter 0.15s' }} />
            </Box>

            <Box
              component="span"
              sx={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                p: '4px', borderRadius: '4px',
                bgcolor: hovered === 'mobile' ? '#066cb3' : 'transparent',
                cursor: 'pointer', userSelect: 'none',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => { setHovered('mobile'); setPos(calcPos(e, MOBILE_W, MOBILE_H)); }}
              onMouseLeave={() => setHovered(null)}
              onMouseMove={(e) => setPos(calcPos(e, MOBILE_W, MOBILE_H))}
              onClick={(e) => { e.stopPropagation(); setClicked('mobile'); setHovered(null); }}
            >
              <Box component="img" src={mobileIcon} alt="Mobile" sx={{ width: 18, height: 18, filter: hovered === 'mobile' ? 'brightness(0) invert(1)' : 'none', transition: 'filter 0.15s' }} />
            </Box>
          </>
        )}
      </Box>

      {/* 호버 팝업 — DataGrid transform 클리핑 방지를 위해 body에 Portal로 렌더링 */}
      {hovered === 'pc' && createPortal(
        <Box sx={{ position: 'fixed', zIndex: 9999, left: pos.x, top: pos.y, borderRadius: '8px', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.25)', border: '1px solid #ddd', pointerEvents: 'none' }}>
          <PreviewFrame src={path} displayWidth={PC_W} animate />
        </Box>,
        document.body
      )}
      {hovered === 'tablet' && createPortal(
        <Box sx={{ position: 'fixed', zIndex: 9999, left: pos.x, top: pos.y, borderRadius: '12px', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.3)', border: '1px solid #ddd', pointerEvents: 'none' }}>
          <PreviewFrame src={path} displayWidth={TABLET_W} iframeWidth={768} iframeHeight={1024} animate />
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
        ) : clicked === 'tablet' ? (
          <TabletModalContent src={path} />
        ) : clicked === 'mobile' ? (
          <MobileModalContent src={path} />
        ) : null}
      </Dialog>
    </Box>
  );
}
