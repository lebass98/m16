import { Box, Typography, LinearProgress } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { FlatCard, DashboardStat } from '../../hooks/useFilteredData';
import GlassCard from '../GlassCard';

interface Props {
  hidden: boolean;
  overallPc: number;
  overallMo: number;
  flatCards: FlatCard[];
  latestDate: string;
  bookmarks: Set<string>;
  dashboardStats: DashboardStat[];
  totalCount: number;
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
}: Props) {
  return (
    <Box sx={{
      width: { md: 280, lg: 320 }, flexShrink: 0,
      display: hidden ? 'none' : 'flex', flexDirection: 'column', gap: 'var(--card-gap, 20px)',
      position: 'sticky',
      top: 88,
      alignSelf: 'flex-start',
      overflow: 'visible',
    }}>
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
        <LinearProgress variant="determinate" value={overallPc} sx={{ height: 6, borderRadius: 3, bgcolor: 'rgb(var(--palette-grey-500Channel) / 0.16)', '& .MuiLinearProgress-bar': { bgcolor: 'primary.main', borderRadius: 3 } }} />
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
              return (
                <Box key={i} className="reveal-right" style={{ animationDelay: `${220 + i * 60}ms` }} sx={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: card.item.path ? 'pointer' : 'default', '&:hover': card.item.path ? { '& .activity-title': { color: 'primary.main' } } : {} }} onClick={() => { if (card.item.path) window.open(card.item.path, '_blank', 'noopener,noreferrer'); }}>
                  <Box sx={(theme) => ({ width: 40, height: 40, borderRadius: '10px', bgcolor: alpha(theme.palette[statusKey].main, 0.12), color: `${statusKey}.main`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 })}>
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
            {flatCards.filter((c) => bookmarks.has(c.item.id)).slice(0, 5).map((card, i) => (
              <Box key={i} onClick={() => { if (card.item.path) window.open(card.item.path, '_blank', 'noopener,noreferrer'); }} sx={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: card.item.path ? 'pointer' : 'default', '&:hover': { '& .bm-title': { color: 'primary.main' } } }}>
                <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: 'rgb(var(--palette-primary-mainChannel) / 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'primary.main', flexShrink: 0 }}>
                  {(card.sectionTitle?.charAt(0) || '?').toUpperCase()}
                </Box>
                <Typography className="bm-title" sx={{ fontSize: 13, color: 'text.primary', fontWeight: 600, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', transition: 'color 0.2s' }}>{card.item.pageTitle || card.item.id}</Typography>
              </Box>
            ))}
          </Box>
        </GlassCard>
      )}

      {/* 완성도 요약 */}
      <GlassCard className="reveal-up" style={{ animationDelay: '320ms' }}>
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
                  <LinearProgress variant="determinate" value={stat.avgPc} sx={{ flex: 1, height: 5, borderRadius: 3, bgcolor: 'rgb(var(--palette-grey-500Channel) / 0.16)', '& .MuiLinearProgress-bar': { bgcolor: stat.avgPc === 100 ? 'success.main' : 'primary.main', borderRadius: 3 } }} />
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: stat.avgPc === 100 ? 'success.main' : 'primary.main', width: 32, textAlign: 'right', flexShrink: 0 }}>{stat.avgPc}%</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Typography sx={{ fontSize: 10, color: 'text.secondary', fontWeight: 700, width: 22, flexShrink: 0, letterSpacing: '0.04em' }}>MO</Typography>
                  <LinearProgress variant="determinate" value={stat.avgMo} sx={{ flex: 1, height: 5, borderRadius: 3, bgcolor: 'rgb(var(--palette-grey-500Channel) / 0.16)', '& .MuiLinearProgress-bar': { bgcolor: stat.avgMo === 100 ? 'success.main' : 'info.main', borderRadius: 3 } }} />
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
