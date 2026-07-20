import { Box, Typography, Tooltip, IconButton } from '@mui/material';
import GridViewIcon from '@mui/icons-material/GridView';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { motion } from 'framer-motion';

interface Props {
  siteTitle: string;
  totalCount: number;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onOpenSiteModal: () => void;
  depth1Categories: { key: string; count: number }[];
  sectionFilter: Set<string>;
  onToggleSectionFilter: (key: string) => void;
  /** 뷰포트가 lg 미만일 때 강제 축소 — 사용자 설정과 무관하게 좁은 화면에서 콘텐츠 영역 확보 */
  forceCollapsed?: boolean;
}

export default function LeftSidebar({
  siteTitle,
  totalCount,
  collapsed,
  onToggleCollapsed,
  onOpenSiteModal,
  depth1Categories,
  sectionFilter,
  onToggleSectionFilter,
  forceCollapsed = false,
}: Props) {
  const effectiveCollapsed = forceCollapsed || collapsed;
  const isPagesActive = sectionFilter.size === 0;
  return (
    <>
      <Box
        component="nav"
        className="app-left-nav"
        id="onboarding-sidebar-nav"
        aria-label="사이트 네비게이션"
        sx={{ width: effectiveCollapsed ? 88 : 260, transition: 'width 0.25s ease', flexShrink: 0, bgcolor: 'background.paper', backdropFilter: 'var(--glass-blur)', WebkitBackdropFilter: 'var(--glass-blur)', color: 'text.primary', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto', overflowX: 'hidden', borderRight: '1px solid rgba(255,255,255,0.18)' }}
      >
        <Tooltip title={effectiveCollapsed ? siteTitle : ''} placement="right" arrow>
          <Box
            onClick={onOpenSiteModal}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpenSiteModal(); } }}
            role="button"
            tabIndex={0}
            id="onboarding-site-selector"
            aria-label={`${siteTitle} 사이트 변경`}
            sx={{ display: 'flex', alignItems: 'center', gap: '12px', m: '16px', p: '12px', borderRadius: '12px', bgcolor: 'rgb(var(--palette-grey-500Channel) / 0.08)', cursor: 'pointer', justifyContent: effectiveCollapsed ? 'center' : 'flex-start', '&:hover': { bgcolor: 'rgb(var(--palette-grey-500Channel) / 0.16)' }, '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2 } }}
          >
            <Box aria-hidden="true" sx={{ width: 40, height: 40, borderRadius: '10px', bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'background.paper', fontSize: 16, fontWeight: 800, flexShrink: 0 }}>
              {siteTitle.charAt(0)}
            </Box>
            {!effectiveCollapsed && (
              <>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: 14, fontWeight: 600, color: 'text.primary', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{siteTitle}</Typography>
                  <Typography sx={{ fontSize: 12, color: 'text.secondary', lineHeight: 1.4 }}>{totalCount} pages</Typography>
                </Box>
                <KeyboardArrowDownIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              </>
            )}
          </Box>
        </Tooltip>

        <Box sx={{ p: '0 16px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {!effectiveCollapsed && (
            <Typography sx={{ fontSize: 11, color: 'text.secondary', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 700, px: '12px', py: '10px', mt: '6px' }}>Overview</Typography>
          )}
          <Tooltip title={effectiveCollapsed ? 'Pages' : ''} placement="right" arrow>
            <Box className="reveal-right" style={{ animationDelay: '60ms' }} sx={{
              display: 'flex', alignItems: 'center', gap: '14px', px: '12px', py: '8px', borderRadius: '8px', cursor: 'pointer',
              justifyContent: effectiveCollapsed ? 'center' : 'flex-start',
              bgcolor: isPagesActive ? 'rgb(var(--palette-primary-mainChannel) / 0.08)' : 'transparent',
              color: isPagesActive ? 'primary.main' : 'text.secondary',
              fontWeight: 600,
              position: 'relative',
              '&:hover': { bgcolor: isPagesActive ? 'rgb(var(--palette-primary-mainChannel) / 0.16)' : 'rgb(var(--palette-grey-500Channel) / 0.08)', color: isPagesActive ? 'primary.main' : 'text.primary' },
            }}>
              <GridViewIcon sx={{ fontSize: 20 }} />
              {!effectiveCollapsed && (
                <Typography sx={{ fontSize: 14, fontWeight: 'inherit', color: 'inherit', flex: 1 }}>Pages</Typography>
              )}
              {isPagesActive && !effectiveCollapsed && (
                <Box
                  component={motion.div}
                  layoutId="active-sidebar-line"
                  sx={{
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translate(-16px,-50%)',
                    width: 3,
                    height: 20,
                    borderRadius: '0 2px 2px 0',
                    bgcolor: 'primary.main',
                  }}
                />
              )}
            </Box>
          </Tooltip>

          {!effectiveCollapsed && (
            <Box component="ul" role="list" aria-label="섹션 필터" sx={{ listStyle: 'none', m: 0, p: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <Typography component="li" sx={{ fontSize: 11, color: 'text.secondary', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 700, px: '12px', py: '10px', mt: '14px' }}>섹션</Typography>
              {depth1Categories.map(({ key, count }, i) => {
                const isActive = sectionFilter.has(key);
                const label = key || '(미분류)';
                return (
                  <Box
                    component="li"
                    key={key || `__empty_${i}`}
                    onClick={() => onToggleSectionFilter(key)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggleSectionFilter(key); } }}
                    role="button"
                    tabIndex={0}
                    aria-pressed={isActive}
                    aria-label={`${label} 섹션 필터${isActive ? ' (선택됨)' : ''}, ${count}개 항목`}
                    className="reveal-right"
                    style={{ animationDelay: `${260 + i * 40}ms` }}
                    sx={{
                      display: 'flex', alignItems: 'center', gap: '12px', px: '12px', py: '8px', borderRadius: '8px', cursor: 'pointer', position: 'relative',
                      bgcolor: isActive ? 'rgb(var(--palette-primary-mainChannel) / 0.08)' : 'transparent',
                      color: isActive ? 'primary.main' : 'text.secondary',
                      '&:hover': { bgcolor: isActive ? 'rgb(var(--palette-primary-mainChannel) / 0.16)' : 'rgb(var(--palette-grey-500Channel) / 0.08)', color: isActive ? 'primary.main' : 'text.primary' },
                      '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2 },
                    }}
                  >
                    {isActive && (
                      <Box
                        component={motion.div}
                        layoutId="active-sidebar-line"
                        sx={{
                          position: 'absolute',
                          left: 0,
                          top: '50%',
                          transform: 'translate(-16px,-50%)',
                          width: 3,
                          height: 18,
                          borderRadius: '0 2px 2px 0',
                          bgcolor: 'primary.main',
                        }}
                      />
                    )}
                    <Box aria-hidden="true" sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: isActive ? 'primary.main' : 'grey.400', flexShrink: 0 }} />
                    <Typography sx={{ fontSize: 13, flex: 1, color: 'inherit', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: isActive ? 600 : 500 }} title={label}>{label}</Typography>
                    <Box aria-hidden="true" sx={{ fontSize: 10, fontWeight: 700, color: isActive ? 'primary.main' : 'text.disabled', bgcolor: isActive ? 'rgb(var(--palette-primary-mainChannel) / 0.16)' : 'rgb(var(--palette-grey-500Channel) / 0.12)', px: '6px', py: '2px', borderRadius: '6px', lineHeight: 1.4 }}>{count}</Box>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>

        <Box sx={{ flex: 1 }} />
        <Box sx={{ m: '16px', p: '16px', borderRadius: '16px', bgcolor: 'rgb(var(--palette-primary-mainChannel) / 0.08)', display: 'flex', alignItems: 'center', justifyContent: effectiveCollapsed ? 'center' : 'flex-start', gap: '12px' }}>
          <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'background.paper', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
            K
          </Box>
          {!effectiveCollapsed && (
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: 13, color: 'text.primary', fontWeight: 600, lineHeight: 1.4 }}>JaeKwang</Typography>
              <Typography sx={{ fontSize: 11, color: 'text.secondary', lineHeight: 1.4 }}>Online</Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* lg 미만에서는 강제 축소이므로 토글 버튼 자체를 숨김 */}
      {!forceCollapsed && (
        <Tooltip title={collapsed ? '사이드바 펼치기' : '사이드바 접기'} placement="right" arrow>
          <IconButton
            onClick={onToggleCollapsed}
            aria-label={collapsed ? '사이드바 펼치기' : '사이드바 접기'}
            aria-expanded={!collapsed}
            sx={{
              position: 'fixed',
              top: 28,
              left: collapsed ? 88 : 260,
              transform: 'translate(-50%, 0)',
              transition: 'left 0.25s ease',
              width: 24,
              height: 24,
              zIndex: 1100,
              bgcolor: 'background.paper',
              border: '1px solid rgb(var(--palette-grey-500Channel) / 0.32)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
              color: 'text.secondary',
              '&:hover': { bgcolor: 'background.paper', color: 'primary.main' },
            }}
          >
            {collapsed ? <ChevronRightIcon sx={{ fontSize: 16 }} /> : <ChevronLeftIcon sx={{ fontSize: 16 }} />}
          </IconButton>
        </Tooltip>
      )}
    </>
  );
}
