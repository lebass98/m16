import { Drawer, Box, Typography, IconButton, Switch, Tooltip, Slider } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import type { SxProps, Theme } from '@mui/material/styles';
import type { ReactElement } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import FormatTextdirectionLToRIcon from '@mui/icons-material/FormatTextdirectionLToR';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import VerticalSplitOutlinedIcon from '@mui/icons-material/VerticalSplitOutlined';
import CheckIcon from '@mui/icons-material/Check';
import { PRESET_LIST, type PresetKey } from '../theme/presets';
import { FONT_FAMILY_KEYS, type FontFamilyKey } from '../theme/fonts';

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
  rightSidebarHidden: boolean;
  onToggleRightSidebar: () => void;
  // 자리표시(placeholder) 토글
  rtl: boolean;
  onToggleRtl: () => void;
  onReset: () => void;
  // Presets · Font
  preset: PresetKey;
  onSelectPreset: (key: PresetKey) => void;
  fontSize: number;
  onChangeFontSize: (value: number) => void;
  fontFamily: FontFamilyKey;
  onSelectFontFamily: (key: FontFamilyKey) => void;
  // Color (좌측 사이드바 대비)
  contrast: 'default' | 'hot';
  onSelectContrast: (v: 'default' | 'hot') => void;
  // 온보딩 가이드 다시 시작
  onStartTour: () => void;
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

function ContrastIcon({ selected }: { selected: boolean }) {
  // 작은 사이드 패널이 있는 디바이스(=좌측 사이드바) 모양 아이콘.
  // 선택 시: primary.main 컬러로 강조, 비선택 시: 회색
  const accent = selected ? 'currentColor' : '#919EAB';
  const stroke = selected ? 'currentColor' : '#919EAB';
  return (
    <Box sx={{ color: selected ? 'primary.main' : 'text.disabled', display: 'inline-flex' }}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="4" width="18" height="16" rx="3" stroke={stroke} strokeWidth="1.6" />
        <rect x="3" y="4" width="6" height="16" rx="3" fill={accent} opacity={selected ? 0.9 : 0.55} />
      </svg>
    </Box>
  );
}

function ContrastCard({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <Box
      onClick={onClick}
      sx={(theme) => ({
        cursor: 'pointer',
        bgcolor: selected ? 'background.paper' : 'transparent',
        border: '1px solid',
        borderColor: selected ? alpha(theme.palette.primary.main, 0.32) : 'rgb(var(--palette-grey-500Channel) / 0.16)',
        boxShadow: selected ? '0 2px 8px 0 rgb(var(--palette-grey-500Channel) / 0.12)' : 'none',
        borderRadius: '12px',
        px: '16px',
        py: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        transition: 'background 0.15s, border-color 0.15s, box-shadow 0.15s',
        '&:hover': { borderColor: alpha(theme.palette.primary.main, 0.4) },
      })}
    >
      <ContrastIcon selected={selected} />
      <Typography sx={{ fontSize: 14, fontWeight: 700, color: selected ? 'text.primary' : 'text.disabled' }}>
        {label}
      </Typography>
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
  rightSidebarHidden, onToggleRightSidebar,
  rtl, onToggleRtl,
  onReset,
  preset, onSelectPreset,
  fontSize, onChangeFontSize,
  fontFamily, onSelectFontFamily,
  contrast, onSelectContrast,
  onStartTour,
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
      // 모든 디바이스에서 우측 슬라이드 인 애니메이션을 명시. MUI 기본은 250ms,
      // 320/260으로 살짝 늘려 더 또렷한 슬라이드 효과. prefers-reduced-motion은
      // App.css의 글로벌 미디어 쿼리가 0.01ms로 덮어쓰므로 접근성도 자동 대응.
      transitionDuration={{ enter: 320, exit: 260 }}
      slotProps={{
        paper: {
          sx: {
            // 모바일: 화면의 88% — 슬라이드 거리가 시각적으로 보이고
            // 닫기 위한 좌측 backdrop 영역 확보. sm 이상은 고정 360px.
            width: { xs: '88vw', sm: DRAWER_WIDTH },
            maxWidth: DRAWER_WIDTH,
            bgcolor: 'background.paper',
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
        {/* 표시 (2 토글) */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          <ToggleCard
            icon={darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            label="Mode"
            value={darkMode}
            onChange={onToggleDarkMode}
          />
          <ToggleCard
            icon={<FormatTextdirectionLToRIcon />}
            label="Right to left"
            value={rtl}
            onChange={onToggleRtl}
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

        {/* Color — 좌측 사이드바 대비 (Integrate / Apparent) */}
        <SectionLabel info="좌측 사이드바를 다크 톤으로 전환">Color</SectionLabel>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          <ContrastCard
            label="Integrate"
            selected={contrast === 'default'}
            onClick={() => onSelectContrast('default')}
          />
          <ContrastCard
            label="Apparent"
            selected={contrast === 'hot'}
            onClick={() => onSelectContrast('hot')}
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

        {/* Font — Family + Size */}
        <SectionLabel info="앱 전체 폰트와 크기 설정">Font</SectionLabel>
        <Box sx={{ p: '20px', borderRadius: '12px', border: '1px solid rgb(var(--palette-grey-500Channel) / 0.16)', bgcolor: 'background.paper' }}>
          {/* Family */}
          <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', mb: '12px' }}>Family</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {FONT_FAMILY_KEYS.map((f) => {
              const selected = fontFamily === f;
              return (
                <Box
                  key={f}
                  onClick={() => onSelectFontFamily(f)}
                  sx={{
                    cursor: 'pointer',
                    bgcolor: selected ? alpha(theme.palette.primary.main, 0.04) : 'transparent',
                    border: '1px solid',
                    borderColor: selected ? alpha(theme.palette.primary.main, 0.48) : 'rgb(var(--palette-grey-500Channel) / 0.16)',
                    borderRadius: '10px',
                    p: '14px 8px 10px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'background 0.15s, border-color 0.15s',
                    '&:hover': { borderColor: alpha(theme.palette.primary.main, 0.32) },
                  }}
                >
                  <Box sx={{ fontFamily: `"${f}", sans-serif`, fontSize: 30, fontWeight: 600, lineHeight: 1, letterSpacing: '-0.02em' }}>
                    <Box component="span" sx={{ color: selected ? 'primary.main' : 'text.disabled' }}>A</Box>
                    <Box component="span" sx={{ color: selected ? alpha(theme.palette.primary.main, 0.45) : alpha(theme.palette.text.disabled, 0.55) }}>a</Box>
                  </Box>
                  <Typography sx={{ fontFamily: `"${f}", sans-serif`, fontSize: 13, fontWeight: 600, color: selected ? 'text.primary' : 'text.disabled' }}>
                    {f}
                  </Typography>
                </Box>
              );
            })}
          </Box>

          {/* Size */}
          <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', mt: '24px', mb: '4px' }}>Size</Typography>
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
            valueLabelDisplay="on"
            valueLabelFormat={(v) => `${v}px`}
            sx={{
              color: 'primary.main',
              mt: '24px',
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
              '& .MuiSlider-valueLabel': {
                bgcolor: theme.palette.text.primary,
                color: theme.palette.background.paper,
                borderRadius: '8px',
                fontSize: 11,
                fontWeight: 700,
                px: '8px',
                py: '4px',
                top: -6,
                '&::before': { display: 'none' },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -3,
                  left: '50%',
                  transform: 'translateX(-50%) rotate(45deg)',
                  width: 8,
                  height: 8,
                  bgcolor: theme.palette.text.primary,
                },
              },
            }}
          />
        </Box>

        {/* 가이드 — 온보딩 다시보기 */}
        <SectionLabel info="처음 방문 시 제공되는 도움말 가이드">가이드</SectionLabel>
        <Box
          onClick={() => {
            onClose();
            onStartTour();
          }}
          sx={{
            cursor: 'pointer',
            p: '14px',
            borderRadius: '12px',
            border: '1px solid rgb(var(--palette-grey-500Channel) / 0.16)',
            bgcolor: 'background.paper',
            textAlign: 'center',
            '&:hover': { borderColor: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.04) },
            transition: 'background 0.15s, border-color 0.15s'
          }}
        >
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'primary.main' }}>
            도움말 가이드 다시 보기
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
}
