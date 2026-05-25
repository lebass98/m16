import { Drawer, Box, Typography, IconButton, Switch, FormControlLabel, Divider, Tooltip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import GridViewIcon from '@mui/icons-material/GridView';
import BarChartIcon from '@mui/icons-material/BarChart';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

interface Props {
  open: boolean;
  onClose: () => void;
  siteTitle: string;
  totalCount: number;
  depth1Categories: { key: string; count: number }[];
  sectionFilter: Set<string>;
  onToggleSectionFilter: (key: string) => void;
  onOpenSiteModal: () => void;
  onOpenDashboard: () => void;
  /** 모바일 quick toggle — 미리보기 iframe 표시 여부 */
  previewEnabled: boolean;
  onTogglePreview: () => void;
  /** 모바일 quick toggle — 미완료 항목만 표시 */
  showIncomplete: boolean;
  onToggleIncomplete: () => void;
}

/**
 * 모바일 좌측 햄버거 메뉴 Drawer.
 * 데스크탑 LeftSidebar의 핵심(사이트 + 섹션 필터)과
 * 기존 MobileTopControls에 있던 빠른 토글(미리보기/미완료)을 한 곳에.
 *
 * 320px 너비 + 글래스 효과 (--glass-* 변수).
 */
export default function MobileLeftDrawer({
  open,
  onClose,
  siteTitle,
  totalCount,
  depth1Categories,
  sectionFilter,
  onToggleSectionFilter,
  onOpenSiteModal,
  onOpenDashboard,
  previewEnabled,
  onTogglePreview,
  showIncomplete,
  onToggleIncomplete,
}: Props) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      anchor="left"
      slotProps={{
        paper: {
          sx: {
            width: 'min(85vw, 320px)',
            bgcolor: 'background.paper',
            backdropFilter: 'var(--glass-blur)',
            WebkitBackdropFilter: 'var(--glass-blur)',
            display: 'flex',
            flexDirection: 'column',
          },
        },
      }}
    >
      {/* 헤더 — 사이트 선택 트리거 + 닫기 */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', m: '16px', p: '12px', borderRadius: '12px', bgcolor: 'rgb(var(--palette-grey-500Channel) / 0.08)' }}>
        <Box
          role="button"
          tabIndex={0}
          onClick={() => { onOpenSiteModal(); onClose(); }}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpenSiteModal(); onClose(); } }}
          aria-label={`${siteTitle} 사이트 변경`}
          sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2, borderRadius: '8px' } }}
        >
          <Box aria-hidden="true" sx={{ width: 40, height: 40, borderRadius: '10px', bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'background.paper', fontSize: 16, fontWeight: 800, flexShrink: 0 }}>
            {siteTitle.charAt(0)}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: 14, fontWeight: 600, color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {siteTitle}
            </Typography>
            <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{totalCount} pages</Typography>
          </Box>
          <KeyboardArrowRightIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
        </Box>
        <Tooltip title="닫기" arrow>
          <IconButton size="small" onClick={onClose} aria-label="메뉴 닫기" sx={{ flexShrink: 0 }}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* 빠른 액션 — Pages / 대시보드 */}
      <Box sx={{ px: '16px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <Typography sx={{ fontSize: 11, color: 'text.secondary', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 700, px: '12px', py: '8px' }}>Overview</Typography>
        <Box
          role="button"
          tabIndex={0}
          onClick={onClose}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClose(); } }}
          aria-label="Pages 보기 (메뉴 닫고 본문으로)"
          sx={{ display: 'flex', alignItems: 'center', gap: '14px', px: '12px', py: '10px', borderRadius: '8px', cursor: 'pointer', color: 'primary.main', fontWeight: 600, bgcolor: 'rgb(var(--palette-primary-mainChannel) / 0.08)', '&:hover': { bgcolor: 'rgb(var(--palette-primary-mainChannel) / 0.16)' } }}
        >
          <GridViewIcon sx={{ fontSize: 20 }} />
          <Typography sx={{ fontSize: 14, fontWeight: 'inherit', color: 'inherit', flex: 1 }}>Pages</Typography>
        </Box>
        <Box
          role="button"
          tabIndex={0}
          onClick={() => { onOpenDashboard(); onClose(); }}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpenDashboard(); onClose(); } }}
          aria-label="완성도 요약 대시보드 열기"
          sx={{ display: 'flex', alignItems: 'center', gap: '14px', px: '12px', py: '10px', borderRadius: '8px', cursor: 'pointer', color: 'text.secondary', '&:hover': { bgcolor: 'rgb(var(--palette-grey-500Channel) / 0.08)', color: 'text.primary' } }}
        >
          <BarChartIcon sx={{ fontSize: 20 }} />
          <Typography sx={{ fontSize: 14, color: 'inherit', flex: 1 }}>완성도 요약</Typography>
        </Box>
      </Box>

      {/* 섹션 필터 */}
      <Box sx={{ px: '16px', mt: '8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <Typography sx={{ fontSize: 11, color: 'text.secondary', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 700, px: '12px', py: '8px' }}>섹션</Typography>
        {depth1Categories.length === 0 ? (
          <Typography sx={{ fontSize: 12, color: 'text.disabled', px: '12px', py: '6px' }}>섹션 없음</Typography>
        ) : depth1Categories.map(({ key, count }) => {
          const isActive = sectionFilter.has(key);
          const label = key || '(미분류)';
          return (
            <Box
              key={key || `__empty_${label}`}
              role="button"
              tabIndex={0}
              onClick={() => onToggleSectionFilter(key)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggleSectionFilter(key); } }}
              aria-pressed={isActive}
              aria-label={`${label} 섹션 필터${isActive ? ' (선택됨)' : ''}, ${count}개 항목`}
              sx={{
                display: 'flex', alignItems: 'center', gap: '12px', px: '12px', py: '10px', borderRadius: '8px', cursor: 'pointer',
                bgcolor: isActive ? 'rgb(var(--palette-primary-mainChannel) / 0.08)' : 'transparent',
                color: isActive ? 'primary.main' : 'text.secondary',
                '&:hover': { bgcolor: isActive ? 'rgb(var(--palette-primary-mainChannel) / 0.16)' : 'rgb(var(--palette-grey-500Channel) / 0.08)', color: isActive ? 'primary.main' : 'text.primary' },
                '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2 },
              }}
            >
              <Box aria-hidden="true" sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: isActive ? 'primary.main' : 'grey.400', flexShrink: 0 }} />
              <Typography sx={{ fontSize: 13, flex: 1, color: 'inherit', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: isActive ? 600 : 500 }} title={label}>{label}</Typography>
              <Box aria-hidden="true" sx={{ fontSize: 10, fontWeight: 700, color: isActive ? 'primary.main' : 'text.disabled', bgcolor: isActive ? 'rgb(var(--palette-primary-mainChannel) / 0.16)' : 'rgb(var(--palette-grey-500Channel) / 0.12)', px: '6px', py: '2px', borderRadius: '6px' }}>{count}</Box>
            </Box>
          );
        })}
      </Box>

      <Box sx={{ flex: 1 }} />

      <Divider sx={{ mx: '16px' }} />

      {/* 빠른 토글 — 기존 MobileTopControls의 미리보기·미완료 유지 */}
      <Box sx={{ px: '16px', py: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <Typography sx={{ fontSize: 11, color: 'text.secondary', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 700, px: '12px', pb: '4px' }}>보기 옵션</Typography>
        <FormControlLabel
          control={<Switch size="small" checked={previewEnabled} onChange={onTogglePreview} />}
          label="미리보기"
          slotProps={{ typography: { sx: { fontSize: 13, color: 'text.primary' } } }}
          sx={{ m: 0, px: '12px', py: '4px', justifyContent: 'space-between', '& .MuiFormControlLabel-label': { flex: 1 } }}
          labelPlacement="start"
        />
        <FormControlLabel
          control={<Switch size="small" checked={showIncomplete} onChange={onToggleIncomplete} />}
          label="미완료만"
          slotProps={{ typography: { sx: { fontSize: 13, color: 'text.primary' } } }}
          sx={{ m: 0, px: '12px', py: '4px', justifyContent: 'space-between', '& .MuiFormControlLabel-label': { flex: 1 } }}
          labelPlacement="start"
        />
      </Box>
    </Drawer>
  );
}
