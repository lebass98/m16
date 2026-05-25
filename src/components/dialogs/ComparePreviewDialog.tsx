import { useEffect, useRef, useState } from 'react';
import { Dialog, Box, Typography, IconButton, ToggleButton, ToggleButtonGroup, Tooltip, FormControlLabel, Switch } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DesktopWindowsOutlinedIcon from '@mui/icons-material/DesktopWindowsOutlined';
import TabletMacOutlinedIcon from '@mui/icons-material/TabletMacOutlined';
import SmartphoneOutlinedIcon from '@mui/icons-material/SmartphoneOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import RefreshIcon from '@mui/icons-material/Refresh';
import type { TableItem } from '../../types';
import PreviewFrame from '../PreviewFrame';

type Device = 'pc' | 'tablet' | 'mobile';

const DEVICE_DIMS = {
  pc: { w: 1920, h: 1080 },
  tablet: { w: 1024, h: 768 },
  mobile: { w: 375, h: 667 },
} as const;

interface Props {
  open: boolean;
  onClose: () => void;
  items: TableItem[];
}

/**
 * 2~4개 항목을 좌우(또는 그리드)로 동시 미리보기 비교.
 * 상단에 디바이스(PC/태블릿/모바일) 토글 — 모든 프레임에 일괄 적용.
 */
export default function ComparePreviewDialog({ open, onClose, items }: Props) {
  const [device, setDevice] = useState<Device>('pc');
  const dims = DEVICE_DIMS[device];

  // 2개면 좌우, 3~4개면 2x2 그리드
  const cols = items.length <= 2 ? items.length : 2;

  // 전체 새로고침 — iframe key를 증가시켜 PreviewFrame을 완전히 remount
  const [reloadKey, setReloadKey] = useState(0);
  const reloadAll = () => setReloadKey((k) => k + 1);

  // 동시 스크롤 동기화 (same-origin iframe만 동작 — cross-origin은 보안상 불가).
  // 사용자가 켤 때만 활성. 내부 컨테이너 스크롤도 가능하지만 iframe 내부 스크롤이 더 흔함.
  const [syncScroll, setSyncScroll] = useState(false);
  const containerRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    if (!syncScroll) return;
    const cleanups: Array<() => void> = [];
    let suppressing = false;

    containerRefs.current.forEach((container, idx) => {
      if (!container) return;
      const iframe = container.querySelector<HTMLIFrameElement>('iframe');
      if (!iframe) return;
      // Same-origin이면 contentWindow.scroll 이벤트, 아니면 컨테이너 자체 스크롤 동기화 시도.
      let scrollTarget: HTMLElement | Window | null = container;
      try {
        // cross-origin 접근 시 SecurityError → catch로 fallback
        scrollTarget = iframe.contentWindow ?? container;
      } catch { scrollTarget = container; }

      const handler = () => {
        if (suppressing) return;
        const sy = (scrollTarget as Window).scrollY ?? (scrollTarget as HTMLElement).scrollTop ?? 0;
        suppressing = true;
        containerRefs.current.forEach((otherContainer, j) => {
          if (j === idx || !otherContainer) return;
          const otherIframe = otherContainer.querySelector<HTMLIFrameElement>('iframe');
          let otherTarget: HTMLElement | Window | null = otherContainer;
          try { otherTarget = otherIframe?.contentWindow ?? otherContainer; }
          catch { otherTarget = otherContainer; }
          try {
            if ((otherTarget as Window).scrollTo) (otherTarget as Window).scrollTo(0, sy);
            else (otherTarget as HTMLElement).scrollTop = sy;
          } catch { /* cross-origin — silently ignore */ }
        });
        // 동기 호출 끝나면 즉시 해제 (RAF에서 풀어주면 안전)
        requestAnimationFrame(() => { suppressing = false; });
      };

      try {
        (scrollTarget as Window).addEventListener('scroll', handler, { passive: true });
        cleanups.push(() => (scrollTarget as Window).removeEventListener('scroll', handler));
      } catch { /* cross-origin */ }
    });

    return () => { cleanups.forEach((c) => c()); };
  }, [syncScroll, reloadKey, items, device]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      slotProps={{ paper: { sx: { bgcolor: 'background.default' } } }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', px: '20px', py: '12px', borderBottom: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Typography sx={{ fontSize: 16, fontWeight: 700, color: 'text.primary' }}>
            미리보기 비교
          </Typography>
          <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
            {items.length}개 항목
          </Typography>
        </Box>

        <ToggleButtonGroup
          size="small"
          value={device}
          exclusive
          onChange={(_, v) => { if (v) setDevice(v as Device); }}
          aria-label="비교 미리보기 디바이스 선택"
        >
          <ToggleButton value="pc" aria-label="PC 화면"><DesktopWindowsOutlinedIcon sx={{ fontSize: 18 }} /></ToggleButton>
          <ToggleButton value="tablet" aria-label="태블릿 화면"><TabletMacOutlinedIcon sx={{ fontSize: 18 }} /></ToggleButton>
          <ToggleButton value="mobile" aria-label="모바일 화면"><SmartphoneOutlinedIcon sx={{ fontSize: 18 }} /></ToggleButton>
        </ToggleButtonGroup>

        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={syncScroll}
              onChange={(e) => setSyncScroll(e.target.checked)}
            />
          }
          label="동시 스크롤"
          slotProps={{ typography: { sx: { fontSize: 12, color: 'text.secondary' } } }}
          sx={{ m: 0, ml: '4px' }}
        />

        <Tooltip title="모든 미리보기 동시 새로고침" arrow>
          <IconButton onClick={reloadAll} aria-label="모든 미리보기 새로고침">
            <RefreshIcon />
          </IconButton>
        </Tooltip>

        <IconButton onClick={onClose} aria-label="비교 미리보기 닫기">
          <CloseIcon />
        </IconButton>
      </Box>

      <Box
        sx={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridAutoRows: '1fr',
          gap: '12px',
          p: '12px',
          overflow: 'hidden',
        }}
      >
        {items.map((item, idx) => (
          <Box
            key={item.id}
            ref={(el: HTMLDivElement | null) => { containerRefs.current[idx] = el; }}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '12px',
              overflow: 'hidden',
              bgcolor: 'background.paper',
              minHeight: 0,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', px: '12px', py: '8px', bgcolor: 'action.hover', borderBottom: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.pageTitle || item.id}
                </Typography>
                <Typography sx={{ fontSize: 11, color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.path}
                </Typography>
              </Box>
              {item.path && (
                <IconButton
                  size="small"
                  component="a"
                  href={item.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${item.pageTitle || item.id} 새 탭에서 열기`}
                  sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
                >
                  <OpenInNewIcon sx={{ fontSize: 16 }} />
                </IconButton>
              )}
            </Box>

            <Box sx={{ flex: 1, position: 'relative', overflow: 'hidden', minHeight: 0 }}>
              {item.path ? (
                <PreviewFrame
                  key={`${item.id}-${device}-${reloadKey}`}
                  src={item.path}
                  displayWidth="100%"
                  fillHeight
                  iframeWidth={dims.w}
                  iframeHeight={dims.h}
                  allowScroll
                />
              ) : (
                <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.disabled', fontSize: 13 }}>
                  미리보기 없음
                </Box>
              )}
            </Box>
          </Box>
        ))}
      </Box>
    </Dialog>
  );
}
