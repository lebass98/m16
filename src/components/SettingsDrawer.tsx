import { Drawer, Box, Typography, IconButton, Switch, Tooltip, Slider } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import type { SxProps, Theme } from '@mui/material/styles';
import type { ReactElement } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import ContrastIcon from '@mui/icons-material/Contrast';
import FormatTextdirectionLToRIcon from '@mui/icons-material/FormatTextdirectionLToR';
import ViewCompactIcon from '@mui/icons-material/ViewCompact';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import VerticalSplitOutlinedIcon from '@mui/icons-material/VerticalSplitOutlined';
import CheckIcon from '@mui/icons-material/Check';
import { PRESET_LIST, type PresetKey } from '../theme/presets';

const DRAWER_WIDTH = 360;

interface Props {
  open: boolean;
  onClose: () => void;
  // 기능형 토글
  darkMode: boolean;
  onToggleDarkMode: () => void;
  previewEnabled: boolean;
  onTogglePreview: () => void;
  showIncomplete: boolean;
  onToggleIncomplete: () => void;
  compact: boolean;
  onToggleCompact: () => void;
  rightSidebarHidden: boolean;
  onToggleRightSidebar: () => void;
  // 자리표시(placeholder) 토글
  contrast: boolean;
  onToggleContrast: () => void;
  rtl: boolean;
  onToggleRtl: () => void;
  onReset: () => void;
  // Presets · Font Size
  preset: PresetKey;
  onSelectPreset: (key: PresetKey) => void;
  fontSize: number;
  onChangeFontSize: (value: number) => void;
}

interface ToggleCardProps {
  icon: ReactElement;
  label: string;
  value: boolean;
  onChange: () => void;
  selected?: boolean;
  disabledHint?: string;
}

function ToggleCard({ icon, label, value, onChange, selected, disabledHint }: ToggleCardProps) {
  const isOn = selected ?? value;
  return (
    <Box
      onClick={onChange}
      sx={(theme) => ({
        cursor: 'pointer',
        position: 'relative',
        bgcolor: isOn ? alpha(theme.palette.primary.main, 0.06) : 'background.paper',
        border: '1px solid',
        borderColor: isOn ? alpha(theme.palette.primary.main, 0.24) : 'rgb(var(--palette-grey-500Channel) / 0.16)',
        borderRadius: '12px',
        p: '14px',
        minHeight: 96,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'background 0.15s, border-color 0.15s, transform 0.15s',
        '&:hover': { borderColor: alpha(theme.palette.primary.main, 0.4) },
      })}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box sx={{ color: isOn ? 'primary.main' : 'text.secondary', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36 }}>
          {icon}
        </Box>
        <Switch
          size="small"
          checked={isOn}
          onChange={onChange}
          onClick={(e) => e.stopPropagation()}
        />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'text.primary' }}>{label}</Typography>
        {disabledHint && (
          <Tooltip title={disabledHint} arrow placement="top">
            <Box sx={{ color: 'text.disabled', fontSize: 14, lineHeight: 1, cursor: 'help' }}>ⓘ</Box>
          </Tooltip>
        )}
      </Box>
    </Box>
  );
}

function SectionLabel({ children, info }: { children: React.ReactNode; info?: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', mb: '10px', mt: '20px' }}>
      <Box sx={{ bgcolor: 'text.primary', color: 'background.paper', px: '8px', py: '3px', borderRadius: '6px', fontSize: 11, fontWeight: 700 }}>
        {children}
      </Box>
      {info && (
        <Tooltip title={info} arrow placement="top">
          <Box sx={{ color: 'text.disabled', fontSize: 14, lineHeight: 1, cursor: 'help' }}>ⓘ</Box>
        </Tooltip>
      )}
    </Box>
  );
}

export default function SettingsDrawer({
  open, onClose,
  darkMode, onToggleDarkMode,
  previewEnabled, onTogglePreview,
  showIncomplete, onToggleIncomplete,
  compact, onToggleCompact,
  rightSidebarHidden, onToggleRightSidebar,
  contrast, onToggleContrast,
  rtl, onToggleRtl,
  onReset,
  preset, onSelectPreset,
  fontSize, onChangeFontSize,
}: Props) {
  const theme = useTheme();

  const headerBtnSx: SxProps<Theme> = {
    width: 32, height: 32,
    color: 'text.secondary',
    '&:hover': { bgcolor: alpha(theme.palette.action.active, 0.08) },
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: DRAWER_WIDTH,
            bgcolor: 'background.default',
            borderTopLeftRadius: '16px',
            borderBottomLeftRadius: '16px',
            overflow: 'hidden',
          },
        },
      }}
    >
      {/* 헤더 */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: '20px', py: '16px', flexShrink: 0 }}>
        <Typography sx={{ fontSize: 18, fontWeight: 700, color: 'text.primary' }}>Settings</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Tooltip title="전체화면" arrow>
            <IconButton size="small" sx={headerBtnSx} onClick={() => {
              if (document.fullscreenElement) document.exitFullscreen();
              else document.documentElement.requestFullscreen();
            }}>
              <FullscreenIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="모든 설정 초기화" arrow>
            <IconButton size="small" sx={headerBtnSx} onClick={onReset}>
              <RefreshIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="닫기" arrow>
            <IconButton size="small" sx={headerBtnSx} onClick={onClose}>
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* 본문 (스크롤) */}
      <Box sx={{
        flex: 1, overflowY: 'auto', px: '20px', pb: '24px',
        '&::-webkit-scrollbar': { width: '4px' },
        '&::-webkit-scrollbar-thumb': { background: alpha(theme.palette.text.primary, 0.2), borderRadius: '4px' },
      }}>
        {/* 표시 (4 토글 2x2) */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          <ToggleCard
            icon={darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            label="Mode"
            value={darkMode}
            onChange={onToggleDarkMode}
          />
          <ToggleCard
            icon={<ContrastIcon />}
            label="Contrast"
            value={contrast}
            onChange={onToggleContrast}
            disabledHint="아직 적용되지 않음 — 추후 고대비 테마 연결"
          />
          <ToggleCard
            icon={<FormatTextdirectionLToRIcon />}
            label="Right to left"
            value={rtl}
            onChange={onToggleRtl}
            disabledHint="아직 적용되지 않음 — 추후 RTL 레이아웃 연결"
          />
          <ToggleCard
            icon={<ViewCompactIcon />}
            label="Compact"
            value={compact}
            onChange={onToggleCompact}
            disabledHint="카드 여백을 줄여 한 화면에 더 많이 표시"
          />
        </Box>

        {/* 콘텐츠 — 프로젝트 고유 토글 */}
        <SectionLabel info="현재 페이지 카드에 영향">콘텐츠</SectionLabel>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          <ToggleCard
            icon={<VisibilityOutlinedIcon />}
            label="미리보기"
            value={previewEnabled}
            onChange={onTogglePreview}
          />
          <ToggleCard
            icon={<PendingActionsOutlinedIcon />}
            label="미완료 보기"
            value={showIncomplete}
            onChange={onToggleIncomplete}
          />
          <ToggleCard
            icon={<VerticalSplitOutlinedIcon />}
            label="우측 사이드바 숨김"
            value={rightSidebarHidden}
            onChange={onToggleRightSidebar}
            disabledHint="우측 정보/활동 패널을 숨겨 본문 영역을 넓게 사용"
          />
        </Box>

        {/* Presets — 6 컬러 */}
        <SectionLabel>Presets</SectionLabel>
        <Box sx={{ p: '14px', borderRadius: '12px', border: '1px solid rgb(var(--palette-grey-500Channel) / 0.16)', bgcolor: 'background.paper' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            {PRESET_LIST.map((p) => {
              const isSelected = preset === p.key;
              return (
                <Tooltip key={p.key} title={p.label} arrow placement="top">
                  <Box
                    onClick={() => onSelectPreset(p.key)}
                    sx={{
                      cursor: 'pointer',
                      bgcolor: alpha(p.color.main, isSelected ? 0.16 : 0.08),
                      border: '1px solid',
                      borderColor: isSelected ? p.color.main : alpha(p.color.main, 0.2),
                      borderRadius: '10px',
                      height: 56,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'background 0.15s, border-color 0.15s, transform 0.15s',
                      '&:hover': { borderColor: p.color.main },
                    }}
                  >
                    {/* 컬러 chip / 선택 시 체크 */}
                    <Box sx={{
                      position: 'relative',
                      width: 26, height: 26, borderRadius: '50%',
                      bgcolor: p.color.main,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: isSelected ? `0 0 0 3px ${alpha(p.color.main, 0.24)}` : 'none',
                    }}>
                      {isSelected && <CheckIcon sx={{ fontSize: 16, color: p.color.contrastText }} />}
                    </Box>
                  </Box>
                </Tooltip>
              );
            })}
          </Box>
        </Box>

        {/* Font Size 슬라이더 */}
        <SectionLabel info="앱 전체 글자 크기 (rem 기반 — Typography 변환 자동 스케일)">Font</SectionLabel>
        <Box sx={{ p: '16px 20px 8px', borderRadius: '12px', border: '1px solid rgb(var(--palette-grey-500Channel) / 0.16)', bgcolor: 'background.paper' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '4px' }}>
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary' }}>Size</Typography>
            <Box sx={{ fontSize: 11, fontWeight: 700, lineHeight: 1.4, color: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.12), px: '8px', py: '2px', borderRadius: '6px' }}>
              {fontSize}px
            </Box>
          </Box>
          <Slider
            size="small"
            value={fontSize}
            min={12}
            max={20}
            step={1}
            marks={[
              { value: 12, label: '12' },
              { value: 14, label: '14' },
              { value: 16, label: '16' },
              { value: 18, label: '18' },
              { value: 20, label: '20' },
            ]}
            onChange={(_, v) => onChangeFontSize(v as number)}
            valueLabelDisplay="auto"
            valueLabelFormat={(v) => `${v}px`}
            sx={{
              color: 'primary.main',
              mt: '4px',
              '& .MuiSlider-mark': {
                bgcolor: alpha(theme.palette.text.primary, 0.3),
                height: 6,
                width: 2,
                borderRadius: 1,
              },
              '& .MuiSlider-markActive': {
                bgcolor: alpha(theme.palette.primary.contrastText, 0.6),
              },
              '& .MuiSlider-markLabel': {
                fontSize: 10,
                color: 'text.disabled',
                top: 22,
              },
            }}
          />
        </Box>
      </Box>
    </Drawer>
  );
}
