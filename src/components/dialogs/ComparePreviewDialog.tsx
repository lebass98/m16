import { useState } from 'react';
import { Dialog, Box, Typography, IconButton, ToggleButton, ToggleButtonGroup } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DesktopWindowsOutlinedIcon from '@mui/icons-material/DesktopWindowsOutlined';
import TabletMacOutlinedIcon from '@mui/icons-material/TabletMacOutlined';
import SmartphoneOutlinedIcon from '@mui/icons-material/SmartphoneOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
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
        {items.map((item) => (
          <Box
            key={item.id}
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
                  key={`${item.id}-${device}`}
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
