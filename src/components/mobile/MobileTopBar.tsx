import type { ReactNode } from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import { alpha } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import LinkIcon from '@mui/icons-material/Link';
import SettingsIcon from '@mui/icons-material/Settings';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import KeyboardOutlinedIcon from '@mui/icons-material/KeyboardOutlined';
import ChecklistIcon from '@mui/icons-material/Checklist';
import HistoryIcon from '@mui/icons-material/History';

import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import AddIcon from '@mui/icons-material/Add';

interface Props {
  darkMode: boolean;
  settingsOpen: boolean;
  selectMode: boolean;
  hasHistory: boolean;
  hideUi: boolean;
  onOpenDrawer: () => void;
  onOpenSearch: () => void;
  onCopyShareLink: () => void;
  onOpenSettings: () => void;
  onToggleDarkMode: () => void;
  onOpenShortcuts: () => void;
  onToggleSelectMode: () => void;
  onOpenHistory: () => void;
  /** Refresh + Export 같이 그룹화된 슬롯 — 사이트가 시트 기반일 때만 노출 */
  rightSlot?: ReactNode;
  
  // Firebase CMS 관련 추가
  isAdmin?: boolean;
  onLoginClick?: () => void;
  onLogoutClick?: () => void;
  onAddPageClick?: () => void;
}

/**
 * 모바일 상단 바.
 * - 좌: 햄버거 메뉴 (좌측 Drawer 토글)
 * - 우: 데스크탑 TopHeader 우측 액션을 그대로 압축 배치
 * - hideUi(미리보기 스크롤 다운 시) true → maxHeight=0으로 자동 숨김
 *
 * 데스크탑 영역(md+)에서는 표시 안 됨.
 */
export default function MobileTopBar({
  darkMode,
  settingsOpen,
  selectMode,
  hasHistory,
  hideUi,
  onOpenDrawer,
  onOpenSearch,
  onCopyShareLink,
  onOpenSettings,
  onToggleDarkMode,
  onOpenShortcuts,
  onToggleSelectMode,
  onOpenHistory,
  rightSlot,
  isAdmin = false,
  onLoginClick,
  onLogoutClick,
  onAddPageClick,
}: Props) {
  const btnSx = {
    width: 36,
    height: 36,
    color: 'text.secondary',
    '&:hover': { bgcolor: 'rgb(var(--palette-grey-500Channel) / 0.08)', color: 'text.primary' },
  };

  return (
    <Box
      sx={{
        display: { xs: 'flex', md: 'none' },
        alignItems: 'center',
        justifyContent: 'space-between',
        px: '8px',
        bgcolor: 'rgb(var(--palette-background-paperChannel) / 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: hideUi ? 'none' : '1px dashed rgb(var(--palette-grey-500Channel) / 0.2)',
        position: 'sticky',
        top: 0,
        zIndex: 20,
        // 스크롤 다운 시 자동 숨김
        maxHeight: hideUi ? 0 : 56,
        minHeight: hideUi ? 0 : 48,
        opacity: hideUi ? 0 : 1,
        overflow: 'hidden',
        transition: 'all 0.25s ease-in-out',
        flexShrink: 0,
      }}
    >
      {/* 좌: 햄버거 */}
      <Tooltip title="메뉴 열기" arrow>
        <IconButton
          id="onboarding-sidebar-nav-mobile"
          onClick={onOpenDrawer}
          aria-label="좌측 메뉴 열기"
          sx={btnSx}
        >
          <MenuIcon sx={{ fontSize: 22 }} />
        </IconButton>
      </Tooltip>

      {/* 우: 데스크탑 우측 액션 묶음 — 가로 스크롤 가능하게 (작은 화면 대비) */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: '2px',
          overflowX: 'auto',
          // 스크롤바 숨김
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {isAdmin && (
          <Tooltip title="새 페이지 등록" arrow>
            <IconButton onClick={onAddPageClick} aria-label="새 페이지 등록" sx={{ ...btnSx, color: 'primary.main' }}>
              <AddIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
        )}

        {isAdmin ? (
          <Tooltip title="관리자 로그아웃" arrow>
            <IconButton onClick={onLogoutClick} aria-label="관리자 로그아웃" sx={{ ...btnSx, color: 'error.main' }}>
              <LogoutIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title="관리자 로그인" arrow>
            <IconButton onClick={onLoginClick} aria-label="관리자 로그인" sx={btnSx}>
              <LoginIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
        )}

        {rightSlot}

        <Tooltip title="선택 모드" arrow>
          <IconButton
            onClick={onToggleSelectMode}
            aria-label={selectMode ? '선택 모드 종료' : '선택 모드 시작'}
            aria-pressed={selectMode}
            sx={(theme) => ({
              ...btnSx,
              color: selectMode ? 'primary.main' : btnSx.color,
              bgcolor: selectMode ? alpha(theme.palette.primary.main, 0.12) : 'transparent',
            })}
          >
            <ChecklistIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Tooltip>

        {hasHistory && (
          <Tooltip title="진행도 변경 히스토리" arrow>
            <IconButton onClick={onOpenHistory} aria-label="진행도 변경 히스토리 열기" sx={btnSx}>
              <HistoryIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
        )}

        <Tooltip title="검색 (/ 또는 Cmd+K)" arrow>
          <IconButton id="onboarding-search-button-mobile" onClick={onOpenSearch} aria-label="검색 열기" sx={btnSx}>
            <SearchIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Tooltip>

        <Tooltip title="공유 링크 복사" arrow>
          <IconButton onClick={onCopyShareLink} aria-label="현재 보기 공유 링크 복사" sx={btnSx}>
            <LinkIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Tooltip>

        <Tooltip title="키보드 단축키" arrow>
          <IconButton onClick={onOpenShortcuts} aria-label="키보드 단축키 도움말" sx={btnSx}>
            <KeyboardOutlinedIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Tooltip>

        <Tooltip title="설정" arrow>
          <IconButton
            id="onboarding-settings-button"
            onClick={onOpenSettings}
            aria-label="설정 패널 열기"
            aria-expanded={settingsOpen}
            sx={(theme) => ({
              ...btnSx,
              color: settingsOpen ? 'primary.main' : btnSx.color,
              bgcolor: settingsOpen ? alpha(theme.palette.primary.main, 0.12) : 'transparent',
            })}
          >
            <SettingsIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Tooltip>

        <Tooltip title={darkMode ? '라이트 모드' : '다크 모드'} arrow>
          <IconButton
            onClick={onToggleDarkMode}
            aria-label={darkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
            aria-pressed={darkMode}
            sx={btnSx}
          >
            {darkMode ? <LightModeIcon sx={{ fontSize: 20 }} /> : <DarkModeIcon sx={{ fontSize: 20 }} />}
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}
