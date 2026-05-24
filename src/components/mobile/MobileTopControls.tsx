import { Box, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import BarChartIcon from '@mui/icons-material/BarChart';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

interface Props {
  darkMode: boolean;
  previewEnabled: boolean;
  showIncomplete: boolean;
  onOpenSearch: () => void;
  onOpenDashboard: () => void;
  onToggleDarkMode: () => void;
  onTogglePreview: () => void;
  onToggleIncomplete: () => void;
}

export default function MobileTopControls({
  darkMode,
  previewEnabled,
  showIncomplete,
  onOpenSearch,
  onOpenDashboard,
  onToggleDarkMode,
  onTogglePreview,
  onToggleIncomplete,
}: Props) {
  const ctrlBtnSx = { p: '4px', color: darkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.6)' };
  const ctrlPanelSx = {
    bgcolor: darkMode ? 'rgba(30,30,50,0.85)' : 'rgba(255,255,255,0.75)',
    border: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
  };
  const toggleBtnSx = (active: boolean) => ({
    border: 'none',
    cursor: 'pointer',
    px: '12px',
    py: '5px',
    borderRadius: '14px',
    fontSize: { xs: 11, md: 12 },
    fontWeight: 600,
    fontFamily: 'inherit',
    lineHeight: 1.2,
    bgcolor: active ? '#4a7ab5' : 'transparent',
    color: active ? 'background.paper' : (darkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'),
    transition: 'background 0.15s, color 0.15s',
    '&:hover': {
      bgcolor: active ? '#3d6699' : (darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'),
    },
  });

  return (
    <>
      <Box sx={{ display: { xs: 'flex', md: 'none' }, position: 'fixed', top: 6, left: 10, zIndex: 1200, alignItems: 'center', backdropFilter: 'blur(8px)', borderRadius: '20px', px: '4px', py: '2px', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', ...ctrlPanelSx }}>
        <IconButton size="small" onClick={onOpenSearch} sx={ctrlBtnSx} title="검색" aria-label="검색 열기">
          <SearchIcon sx={{ fontSize: 18 }} />
        </IconButton>
        <IconButton size="small" onClick={onOpenDashboard} sx={ctrlBtnSx} title="완성도" aria-label="완성도 대시보드 열기">
          <BarChartIcon sx={{ fontSize: 18 }} />
        </IconButton>
        <IconButton size="small" onClick={onToggleDarkMode} sx={ctrlBtnSx} title="다크모드" aria-label={darkMode ? '라이트 모드로 전환' : '다크 모드로 전환'} aria-pressed={darkMode}>
          {darkMode ? <LightModeIcon sx={{ fontSize: 18 }} /> : <DarkModeIcon sx={{ fontSize: 18 }} />}
        </IconButton>
      </Box>

      <Box sx={{ display: { xs: 'flex', md: 'none' }, position: 'fixed', top: 6, right: 10, zIndex: 1200, alignItems: 'center', gap: '4px', backdropFilter: 'blur(8px)', borderRadius: '20px', px: '4px', py: '3px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', ...ctrlPanelSx }}>
        <Box component="button" type="button" onClick={onTogglePreview} aria-pressed={previewEnabled} sx={toggleBtnSx(previewEnabled)}>미리보기</Box>
        <Box component="button" type="button" onClick={onToggleIncomplete} aria-pressed={showIncomplete} sx={toggleBtnSx(showIncomplete)}>미완료 보기</Box>
      </Box>
    </>
  );
}
