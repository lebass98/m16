import { Box, Typography, LinearProgress, IconButton, Tooltip } from '@mui/material';
import { alpha } from '@mui/material/styles';
import HistoryIcon from '@mui/icons-material/History';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined';
import type { FlatCard, DashboardStat } from '../../hooks/useFilteredData';
import GlassCard from '../GlassCard';

interface RecentEntry {
  id: string;
  viewedAt: string;
}

interface Props {
  hidden: boolean;
  overallPc: number;
  overallMo: number;
  flatCards: FlatCard[];
  latestDate: string;
  bookmarks: Set<string>;
  dashboardStats: DashboardStat[];
  totalCount: number;
  recentlyViewed: RecentEntry[];
  onClearRecentlyViewed: () => void;
  /** 카드 클릭 시 호출 — 외부 링크를 열기 전에 '최근 본' 로그를 남기기 위함 */
  onItemOpen: (id: string, path?: string) => void;
}

/** "2시간 전" 같은 상대 시간 라벨. */
function relativeTime(iso: string): string {
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return '';
  const diffSec = Math.round((Date.now() - t) / 1000);
  if (diffSec < 60) return '방금';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}분 전`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}시간 전`;
  return `${Math.floor(diffSec / 86400)}일 전`;
}

type StatusKey = 'success' | 'info' | 'error' | 'primary';

export default function RightPanel({
  hidden,
  overallPc,
  overallMo,
  flatCards,
  latestDate,
  bookmarks,
  dashboardStats,
  totalCount,
  recentlyViewed,
  onClearRecentlyViewed,
  onItemOpen,
}: Props) {
  // 최근 본 항목을 flatCards와 조인 (id 매칭). 매칭 실패한 항목은 스킵.
  const recentCards = recentlyViewed
    .map((e) => {
      const card = flatCards.find((c) => c.item.id === e.id);
      return card ? { card, viewedAt: e.viewedAt } : null;
    })
    .filter((x): x is { card: FlatCard; viewedAt: string } => x !== null)
    .slice(0, 5);
  return (
    <Box
      component="aside"
      aria-label="진행도 요약 패널"
      id="onboarding-right-panel"
      sx={{
        width: { md: 280, lg: 320 }, flexShrink: 0,
        display: hidden ? 'none' : 'flex', flexDirection: 'column', gap: 'var(--card-gap, 20px)',
        position: 'sticky',
        top: 88,
        alignSelf: 'flex-start',
        overflow: 'visible',
      }}
    >
      {/* 통계 카드 */}
      <GlassCard className="reveal-up" style={{ animationDelay: '80ms' }} sx={{ position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', bgcolor: 'rgb(var(--palette-primary-mainChannel) / 0.08)' }} />
        <Typography sx={{ position: 'relative', fontSize: 14, color: 'text.secondary', fontWeight: 600, mb: '4px' }}>Overall progress</Typography>
        <Box sx={{ position: 'relative', display: 'flex', alignItems: 'baseline', gap: '8px', mb: '8px' }}>
          <Typography sx={{ fontSize: 32, fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>{overallPc}%</Typography>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: '2px', bgcolor: 'rgb(var(--palette-success-mainChannel) / 0.16)', color: 'success.dark', px: '8px', py: '3px', borderRadius: '6px', fontSize: 11, fontWeight: 700 }}>
            <Box component="span" sx={{ fontSize: 12 }}>↑</Box>PC
          </Box>
        </Box>
        <Typography sx={{ position: 'relative', fontSize: 13, color: 'text.secondary', mb: '14px' }}>모바일 진행도 <Box component="span" sx={{ color: 'text.primary', fontWeight: 700 }}>{overallMo}%</Box></Typography>
        <LinearProgress
          variant="determinate"
          value={overallPc}
          aria-label={`전체 PC 진행도 ${overallPc}%`}
          sx={{ height: 6, borderRadius: 3, bgcolor: 'rgb(var(--palette-grey-500Channel) / 0.16)', '& .MuiLinearProgress-bar': { bgcolor: 'primary.main', borderRadius: 3 } }}
        />
      </GlassCard>

      {/* 최근 업데이트 활동 */}
      <GlassCard className="reveal-up" style={{ animationDelay: '160ms' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '16px' }}>
          <Typography sx={{ fontSize: 16, fontWeight: 700, color: 'text.primary' }}>최근 업데이트</Typography>
          <Typography sx={{ fontSize: 13, color: 'primary.main', cursor: 'pointer', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}>전체보기</Typography>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {flatCards
            .filter((c) => c.item.updatedAt)
            .sort((a, b) => (b.item.updatedAt || '').localeCompare(a.item.updatedAt || ''))
            .slice(0, 5)
            .map((card, i) => {
              const isLatest = card.item.updatedAt === latestDate;
              const isDone = (card.item.progressPc ?? 0) >= 100;
              const statusKey: StatusKey = isDone ? 'success' : isLatest ? 'info' : (card.item.progressPc ?? 0) === 0 ? 'error' : 'primary';
              const openItem = () => onItemOpen(card.item.id, card.item.path);
              const interactive = !!card.item.path;
              return (
                <Box
                  key={i}
                  className="reveal-right"
                  style={{ animationDelay: `${220 + i * 60}ms` }}
                  onClick={openItem}
                  onKeyDown={interactive ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openItem(); } } : undefined}
                  role={interactive ? 'link' : undefined}
                  tabIndex={interactive ? 0 : undefined}
                  aria-label={interactive ? `${card.item.pageTitle || card.item.id} 새 탭에서 열기` : undefined}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    cursor: interactive ? 'pointer' : 'default',
                    '&:hover': interactive ? { '& .activity-title': { color: 'primary.main' } } : {},
                    '&:focus-visible': interactive ? { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2, borderRadius: '8px' } : {},
                  }}
                >
                  <Box aria-hidden="true" sx={(theme) => ({ width: 40, height: 40, borderRadius: '10px', bgcolor: alpha(theme.palette[statusKey].main, 0.12), color: `${statusKey}.main`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 })}>
                    {(card.sectionTitle?.charAt(0) || '?').toUpperCase()}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography className="activity-title" sx={{ fontSize: 13, fontWeight: 600, color: 'text.primary', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', transition: 'color 0.2s' }}>{card.item.pageTitle || card.item.id}</Typography>
                    <Typography sx={{ fontSize: 12, color: 'text.secondary', lineHeight: 1.4, mt: '2px' }}>{card.sectionTitle} · {card.item.updatedAt}</Typography>
                  </Box>
                </Box>
              );
            })}
        </Box>
      </GlassCard>

      {/* 북마크 */}
      {bookmarks.size > 0 && (
        <GlassCard className="reveal-up" style={{ animationDelay: '240ms' }}>
          <Typography sx={{ fontSize: 16, fontWeight: 700, color: 'text.primary', mb: '16px' }}>북마크 <Box component="span" sx={{ color: 'text.secondary', fontWeight: 500 }}>({bookmarks.size})</Box></Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {flatCards.filter((c) => bookmarks.has(c.item.id)).slice(0, 5).map((card, i) => {
              const openItem = () => onItemOpen(card.item.id, card.item.path);
              const interactive = !!card.item.path;
              return (
                <Box
                  key={i}
                  onClick={openItem}
                  onKeyDown={interactive ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openItem(); } } : undefined}
                  role={interactive ? 'link' : undefined}
                  tabIndex={interactive ? 0 : undefined}
                  aria-label={interactive ? `북마크된 ${card.item.pageTitle || card.item.id} 새 탭에서 열기` : undefined}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    cursor: interactive ? 'pointer' : 'default',
                    '&:hover': { '& .bm-title': { color: 'primary.main' } },
                    '&:focus-visible': interactive ? { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2, borderRadius: '8px' } : {},
                  }}
                >
                  <Box aria-hidden="true" sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: 'rgb(var(--palette-primary-mainChannel) / 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'primary.main', flexShrink: 0 }}>
                    {(card.sectionTitle?.charAt(0) || '?').toUpperCase()}
                  </Box>
                  <Typography className="bm-title" sx={{ fontSize: 13, color: 'text.primary', fontWeight: 600, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', transition: 'color 0.2s' }}>{card.item.pageTitle || card.item.id}</Typography>
                </Box>
              );
            })}
          </Box>
        </GlassCard>
      )}

      {/* 최근 본 항목 */}
      {recentCards.length > 0 && (
        <GlassCard className="reveal-up" style={{ animationDelay: '280ms' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '14px' }}>
            <Typography sx={{ fontSize: 16, fontWeight: 700, color: 'text.primary', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <HistoryIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              최근 본
            </Typography>
            <Tooltip title="기록 비우기" arrow>
              <IconButton size="small" onClick={onClearRecentlyViewed} aria-label="최근 본 항목 기록 비우기" sx={{ color: 'text.disabled', '&:hover': { color: 'error.main' } }}>
                <DeleteOutlineIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentCards.map(({ card, viewedAt }, i) => {
              const openItem = () => onItemOpen(card.item.id, card.item.path);
              const interactive = !!card.item.path;
              return (
                <Box
                  key={card.item.id}
                  onClick={openItem}
                  onKeyDown={interactive ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openItem(); } } : undefined}
                  role={interactive ? 'link' : undefined}
                  tabIndex={interactive ? 0 : undefined}
                  aria-label={interactive ? `${card.item.pageTitle || card.item.id} 다시 열기` : undefined}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    cursor: interactive ? 'pointer' : 'default',
                    '&:hover': { '& .recent-title': { color: 'primary.main' } },
                    '&:focus-visible': interactive ? { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2, borderRadius: '8px' } : {},
                  }}
                  style={{ animationDelay: `${320 + i * 60}ms` }}
                  className="reveal-right"
                >
                  <Box aria-hidden="true" sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: 'rgb(var(--palette-grey-500Channel) / 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'text.secondary', flexShrink: 0 }}>
                    {(card.sectionTitle?.charAt(0) || '?').toUpperCase()}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography className="recent-title" sx={{ fontSize: 13, fontWeight: 600, color: 'text.primary', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', transition: 'color 0.2s' }}>
                      {card.item.pageTitle || card.item.id}
                    </Typography>
                    <Typography sx={{ fontSize: 11, color: 'text.disabled', lineHeight: 1.4, mt: '2px' }}>
                      {relativeTime(viewedAt)}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </GlassCard>
      )}

      {/* 완성도 요약 */}
      <GlassCard className="reveal-up" style={{ animationDelay: '360ms' }}>
        <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mb: '16px' }}>
          <Typography sx={{ fontSize: 16, fontWeight: 700, color: 'text.primary' }}>완성도 요약</Typography>
          <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>{totalCount} pages</Typography>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {dashboardStats.map((stat, i) => (
            <Box key={i}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: '8px', gap: '8px' }}>
                <Typography sx={{ fontSize: 12.5, color: 'text.primary', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: 0 }} title={stat.title}>{stat.title}</Typography>
                <Typography sx={{ fontSize: 11, color: 'text.secondary', flexShrink: 0 }}>{stat.count}p</Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Typography sx={{ fontSize: 10, color: 'text.secondary', fontWeight: 700, width: 22, flexShrink: 0, letterSpacing: '0.04em' }}>PC</Typography>
                  <LinearProgress
                    variant="determinate"
                    value={stat.avgPc}
                    aria-label={`${stat.title} PC 평균 진행도 ${stat.avgPc}%`}
                    sx={{ flex: 1, height: 5, borderRadius: 3, bgcolor: 'rgb(var(--palette-grey-500Channel) / 0.16)', '& .MuiLinearProgress-bar': { bgcolor: stat.avgPc === 100 ? 'success.main' : 'primary.main', borderRadius: 3 } }}
                  />
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: stat.avgPc === 100 ? 'success.main' : 'primary.main', width: 32, textAlign: 'right', flexShrink: 0 }}>{stat.avgPc}%</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Typography sx={{ fontSize: 10, color: 'text.secondary', fontWeight: 700, width: 22, flexShrink: 0, letterSpacing: '0.04em' }}>MO</Typography>
                  <LinearProgress
                    variant="determinate"
                    value={stat.avgMo}
                    aria-label={`${stat.title} 모바일 평균 진행도 ${stat.avgMo}%`}
                    sx={{ flex: 1, height: 5, borderRadius: 3, bgcolor: 'rgb(var(--palette-grey-500Channel) / 0.16)', '& .MuiLinearProgress-bar': { bgcolor: stat.avgMo === 100 ? 'success.main' : 'info.main', borderRadius: 3 } }}
                  />
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: stat.avgMo === 100 ? 'success.main' : 'info.main', width: 32, textAlign: 'right', flexShrink: 0 }}>{stat.avgMo}%</Typography>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </GlassCard>
    </Box>
  );
}
