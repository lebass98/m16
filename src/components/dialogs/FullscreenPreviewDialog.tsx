import { useState } from 'react';
import { Dialog, Box, Typography, IconButton, ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
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
  item: TableItem | null;
}

/**
 * 단일 항목을 전체화면으로 미리보기.
 * ComparePreviewDialog와 같은 구조 — 단일 패널 + 디바이스 토글.
 */
export default function FullscreenPreviewDialog({ open, onClose, item }: Props) {
  const [device, setDevice] = useState<Device>('pc');
  if (!item) return null;
  const dims = DEVICE_DIMS[device];

  return (
    <Dialog open={open} onClose={onClose} fullScreen slotProps={{ paper: { sx: { bgcolor: 'background.default' } } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', px: '20px', py: '12px', borderBottom: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 15, fontWeight: 700, color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {item.pageTitle || item.id}
          </Typography>
          <Typography sx={{ fontSize: 11, color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {item.path || '경로 없음'}
          </Typography>
        </Box>

        <ToggleButtonGroup
          size="small"
          value={device}
          exclusive
          onChange={(_, v) => { if (v) setDevice(v as Device); }}
          aria-label="미리보기 디바이스 선택"
        >
          <ToggleButton value="pc" aria-label="PC 화면"><DesktopWindowsOutlinedIcon sx={{ fontSize: 18 }} /></ToggleButton>
          <ToggleButton value="tablet" aria-label="태블릿 화면"><TabletMacOutlinedIcon sx={{ fontSize: 18 }} /></ToggleButton>
          <ToggleButton value="mobile" aria-label="모바일 화면"><SmartphoneOutlinedIcon sx={{ fontSize: 18 }} /></ToggleButton>
        </ToggleButtonGroup>

        {item.path && (
          <Tooltip title="새 탭에서 열기" arrow>
            <IconButton component="a" href={item.path} target="_blank" rel="noopener noreferrer" aria-label="새 탭에서 열기">
              <OpenInNewIcon />
            </IconButton>
          </Tooltip>
        )}

        <IconButton onClick={onClose} aria-label="전체화면 미리보기 닫기">
          <CloseIcon />
        </IconButton>
      </Box>

      <Box sx={{ flex: 1, position: 'relative', overflow: 'hidden', bgcolor: 'background.paper', minHeight: 0 }}>
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
          <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.disabled' }}>
            미리보기 없음
          </Box>
        )}
      </Box>
    </Dialog>
  );
}
