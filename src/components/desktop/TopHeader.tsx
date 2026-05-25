import { Box, Typography, Tooltip, IconButton } from '@mui/material';
import { alpha } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/Settings';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import KeyboardOutlinedIcon from '@mui/icons-material/KeyboardOutlined';

interface Props {
  siteTitle: string;
  darkMode: boolean;
  settingsOpen: boolean;
  onOpenSearch: () => void;
  onOpenSettings: () => void;
  onToggleDarkMode: () => void;
  onOpenShortcuts: () => void;
}

export default function TopHeader({ siteTitle, darkMode, settingsOpen, onOpenSearch, onOpenSettings, onToggleDarkMode, onOpenShortcuts }: Props) {
  return (
    <Box sx={{ bgcolor: 'rgb(var(--palette-background-paperChannel) / 0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px dashed rgb(var(--palette-grey-500Channel) / 0.2)', px: { md: '16px', lg: '32px' }, py: '14px', display: 'flex', alignItems: 'center', gap: { md: '12px', lg: '20px' }, position: 'sticky', top: 0, zIndex: 10 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Typography sx={{ fontSize: 11, color: 'text.secondary', letterSpacing: '0.06em', fontWeight: 700, textTransform: 'uppercase' }}>Workspace</Typography>
        <Typography sx={{ fontSize: 18, fontWeight: 700, color: 'text.primary', lineHeight: 1.4 }}>{siteTitle}</Typography>
      </Box>
      <Box sx={{ flex: 1 }} />
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Tooltip title="검색 (Cmd/Ctrl+K 또는 /)" arrow>
          <IconButton
            onClick={onOpenSearch}
            aria-label="검색 열기 (Cmd 또는 Ctrl + K, 또는 / 키)"
            sx={{ width: 40, height: 40, color: 'text.secondary', '&:hover': { bgcolor: 'rgb(var(--palette-grey-500Channel) / 0.08)', color: 'text.primary' } }}
          >
            <SearchIcon sx={{ fontSize: 24 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="키보드 단축키 (? 키)" arrow>
          <IconButton
            onClick={onOpenShortcuts}
            aria-label="키보드 단축키 도움말 열기 (? 키)"
            sx={{ width: 40, height: 40, color: 'text.secondary', '&:hover': { bgcolor: 'rgb(var(--palette-grey-500Channel) / 0.08)', color: 'text.primary' } }}
          >
            <KeyboardOutlinedIcon sx={{ fontSize: 24 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="설정" arrow>
          <IconButton
            onClick={onOpenSettings}
            aria-label="설정 패널 열기"
            aria-expanded={settingsOpen}
            sx={(theme) => ({
              width: 40, height: 40,
              color: settingsOpen ? 'primary.main' : 'text.secondary',
              bgcolor: settingsOpen ? alpha(theme.palette.primary.main, 0.12) : 'transparent',
              '&:hover': { bgcolor: settingsOpen ? alpha(theme.palette.primary.main, 0.16) : 'rgb(var(--palette-grey-500Channel) / 0.08)', color: settingsOpen ? 'primary.main' : 'text.primary' },
            })}
          >
            <SettingsIcon sx={{ fontSize: 24 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title={darkMode ? '라이트 모드' : '다크 모드'} arrow>
          <IconButton
            onClick={onToggleDarkMode}
            aria-label={darkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
            aria-pressed={darkMode}
            sx={{ width: 40, height: 40, color: 'text.secondary', '&:hover': { bgcolor: 'rgb(var(--palette-grey-500Channel) / 0.08)', color: 'text.primary' } }}
          >
            {darkMode ? <LightModeIcon sx={{ fontSize: 24 }} /> : <DarkModeIcon sx={{ fontSize: 24 }} />}
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}
