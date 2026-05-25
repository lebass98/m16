import { useMemo } from 'react';
import { Dialog, Box, Typography, IconButton, LinearProgress, useTheme } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import HistoryIcon from '@mui/icons-material/History';
import TodayIcon from '@mui/icons-material/Today';
import DateRangeIcon from '@mui/icons-material/DateRange';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import type { DashboardStat, FlatCard } from '../../hooks/useFilteredData';
import type { HistoryEntry } from '../../hooks/useProgressOverrides';
import { progressColors } from '../../theme/tokens';

interface RecentEntry {
  id: string;
  viewedAt: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  totalCount: number;
  overallPc: number;
  overallMo: number;
  dashboardStats: DashboardStat[];
  /** 최근 본 항목 — 빈 배열이면 위젯 자체를 숨김 */
  recentlyViewed?: RecentEntry[];
  /** id → 매칭되는 카드(없으면 null). RightPanel과 동일 패턴. */
  flatCards?: FlatCard[];
  onItemOpen?: (id: string, path?: string) => void;
  /** 진행도 변경 히스토리 — 오늘/이번주 통계 계산용 */
  progressHistory?: Record<string, HistoryEntry[]>;
}

function relativeTime(iso: string): string {
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return '';
  const diffSec = Math.round((Date.now() - t) / 1000);
  if (diffSec < 60) return '방금';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}분 전`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}시간 전`;
  return `${Math.floor(diffSec / 86400)}일 전`;
}

export default function DashboardDialog({ open, onClose, totalCount, overallPc, overallMo, dashboardStats, recentlyViewed = [], flatCards = [], onItemOpen, progressHistory = {} }: Props) {
  const { palette } = useTheme();
  const mode = palette.mode;
  const pcAccent = progressColors.pcAccent(mode);
  const moAccent = progressColors.moAccent(mode);
  const doneColor = progressColors.done;

  // 최근 본 항목 — flatCards와 id로 매칭하고 매칭 실패한 항목은 스킵, 최대 5개
  const recentCards = recentlyViewed
    .map((e) => {
      const card = flatCards.find((c) => c.item.id === e.id);
      return card ? { card, viewedAt: e.viewedAt } : null;
    })
    .filter((x): x is { card: FlatCard; viewedAt: string } => x !== null)
    .slice(0, 5);

  // 오늘/이번 주 변경 수 — 모든 항목의 히스토리 엔트리를 시간 기준으로 카운트.
  // Date.now/new Date는 impure지만 다이얼로그가 열리는 시점의 스냅샷이면 충분.
  // useMemo + open를 의존성에 포함시켜 다이얼로그가 새로 열릴 때마다 재계산.
  /* eslint-disable react-hooks/purity */
  const { editsToday, editsThisWeek } = useMemo(() => {
    const nowMs = Date.now();
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const weekAgo = nowMs - 7 * 24 * 3600_000;
    let today = 0;
    let week = 0;
    for (const entries of Object.values(progressHistory)) {
      for (const e of entries) {
        const t = new Date(e.at).getTime();
        if (!Number.isFinite(t)) continue;
        if (t >= startOfToday.getTime()) today += 1;
        if (t >= weekAgo) week += 1;
      }
    }
    return { editsToday: today, editsThisWeek: week };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progressHistory, open]);
  /* eslint-enable react-hooks/purity */

  // 정체 항목 Top 5 — progressPc < 100 이고 updatedAt(또는 start)이 가장 오래된 순서
  const stagnant = flatCards
    .filter((c) => (c.item.progressPc ?? 0) < 100)
    .map((c) => ({
      card: c,
      // 비교용 ISO-ish 문자열 (YYYY.MM.DD) — 빈값은 가장 오래된 것으로 간주
      stamp: c.item.updatedAt || c.item.start || '0000.00.00',
    }))
    .sort((a, b) => a.stamp.localeCompare(b.stamp))
    .slice(0, 5);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs" slotProps={{ paper: { sx: { m: 2, maxHeight: '85vh' } } }}>
      <Box sx={{ p: '14px 16px', borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography sx={{ fontSize: 16, fontWeight: 700 }}>완성도 요약</Typography>
        <IconButton size="small" onClick={onClose} aria-label="완성도 요약 닫기"><CloseIcon sx={{ fontSize: 18 }} /></IconButton>
      </Box>
      <Box sx={{ overflowY: 'auto', p: '12px 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {recentCards.length > 0 && (
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 700, mb: '8px', color: 'text.primary', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <HistoryIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              최근 본
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {recentCards.map(({ card, viewedAt }) => {
                const interactive = !!card.item.path;
                const openItem = () => {
                  if (onItemOpen) onItemOpen(card.item.id, card.item.path);
                  else if (card.item.path) window.open(card.item.path, '_blank', 'noopener,noreferrer');
                  onClose();
                };
                return (
                  <Box
                    key={card.item.id}
                    onClick={openItem}
                    onKeyDown={interactive ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openItem(); } } : undefined}
                    role={interactive ? 'link' : undefined}
                    tabIndex={interactive ? 0 : undefined}
                    aria-label={interactive ? `${card.item.pageTitle || card.item.id} 다시 열기` : undefined}
                    sx={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      px: '10px', py: '8px', borderRadius: '8px',
                      cursor: interactive ? 'pointer' : 'default',
                      '&:hover': { bgcolor: 'action.hover' },
                      '&:focus-visible': interactive ? { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: -2 } : {},
                    }}
                  >
                    <Box aria-hidden="true" sx={{ width: 28, height: 28, borderRadius: '6px', bgcolor: 'rgb(var(--palette-grey-500Channel) / 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'text.secondary', flexShrink: 0 }}>
                      {(card.sectionTitle?.charAt(0) || '?').toUpperCase()}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {card.item.pageTitle || card.item.id}
                      </Typography>
                      <Typography sx={{ fontSize: 10.5, color: 'text.disabled' }}>{relativeTime(viewedAt)}</Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}

        {/* 오늘/이번 주 변경 수 — 진행도 히스토리 기반. 0이면 표시 안 함. */}
        {(editsToday > 0 || editsThisWeek > 0) && (
          <Box sx={{ display: 'flex', gap: '8px' }}>
            <Box sx={{ flex: 1, p: '10px 12px', bgcolor: 'action.hover', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <TodayIcon sx={{ fontSize: 22, color: 'primary.main' }} />
              <Box>
                <Typography sx={{ fontSize: 11, color: 'text.secondary', fontWeight: 600 }}>오늘 편집</Typography>
                <Typography sx={{ fontSize: 18, fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>{editsToday}</Typography>
              </Box>
            </Box>
            <Box sx={{ flex: 1, p: '10px 12px', bgcolor: 'action.hover', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <DateRangeIcon sx={{ fontSize: 22, color: 'info.main' }} />
              <Box>
                <Typography sx={{ fontSize: 11, color: 'text.secondary', fontWeight: 600 }}>최근 7일</Typography>
                <Typography sx={{ fontSize: 18, fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>{editsThisWeek}</Typography>
              </Box>
            </Box>
          </Box>
        )}

        <Box sx={{ p: '12px 14px', bgcolor: 'action.hover', borderRadius: '10px' }}>
          <Typography sx={{ fontSize: 13, fontWeight: 700, mb: '10px', color: 'text.primary' }}>
            전체 ({totalCount} pages)
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Typography sx={{ fontSize: 11, color: 'text.secondary', width: 24, flexShrink: 0 }}>PC</Typography>
              <LinearProgress variant="determinate" value={overallPc} aria-label={`전체 PC 평균 진행도 ${overallPc}%`} sx={{ flex: 1, height: 8, borderRadius: 4, bgcolor: 'action.selected', '& .MuiLinearProgress-bar': { bgcolor: pcAccent } }} />
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: pcAccent, width: 34, textAlign: 'right', flexShrink: 0 }}>{overallPc}%</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Typography sx={{ fontSize: 11, color: 'text.secondary', width: 24, flexShrink: 0 }}>MO</Typography>
              <LinearProgress variant="determinate" value={overallMo} aria-label={`전체 모바일 평균 진행도 ${overallMo}%`} sx={{ flex: 1, height: 8, borderRadius: 4, bgcolor: 'action.selected', '& .MuiLinearProgress-bar': { bgcolor: moAccent } }} />
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: moAccent, width: 34, textAlign: 'right', flexShrink: 0 }}>{overallMo}%</Typography>
            </Box>
          </Box>
        </Box>
        {dashboardStats.map((stat, i) => (
          <Box key={i}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: '6px' }}>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'text.primary' }}>{stat.title}</Typography>
              <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>{stat.count} pages</Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Typography sx={{ fontSize: 11, color: 'text.secondary', width: 24, flexShrink: 0 }}>PC</Typography>
                <LinearProgress variant="determinate" value={stat.avgPc} aria-label={`${stat.title} PC 평균 진행도 ${stat.avgPc}%`} sx={{ flex: 1, height: 6, borderRadius: 3, bgcolor: 'action.selected', '& .MuiLinearProgress-bar': { bgcolor: stat.avgPc === 100 ? doneColor : pcAccent } }} />
                <Typography sx={{ fontSize: 11, fontWeight: 600, color: 'text.secondary', width: 34, textAlign: 'right', flexShrink: 0 }}>{stat.avgPc}%</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Typography sx={{ fontSize: 11, color: 'text.secondary', width: 24, flexShrink: 0 }}>MO</Typography>
                <LinearProgress variant="determinate" value={stat.avgMo} aria-label={`${stat.title} 모바일 평균 진행도 ${stat.avgMo}%`} sx={{ flex: 1, height: 6, borderRadius: 3, bgcolor: 'action.selected', '& .MuiLinearProgress-bar': { bgcolor: stat.avgMo === 100 ? doneColor : moAccent } }} />
                <Typography sx={{ fontSize: 11, fontWeight: 600, color: 'text.secondary', width: 34, textAlign: 'right', flexShrink: 0 }}>{stat.avgMo}%</Typography>
              </Box>
            </Box>
          </Box>
        ))}

        {/* 정체 항목 — 완료되지 않았고 업데이트가 가장 오래된 5개 */}
        {stagnant.length > 0 && (
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 700, mb: '8px', color: 'text.primary', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <HourglassEmptyIcon sx={{ fontSize: 16, color: 'warning.main' }} />
              정체 항목 (오래된 순)
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {stagnant.map(({ card }) => {
                const interactive = !!card.item.path;
                const openItem = () => {
                  if (onItemOpen) onItemOpen(card.item.id, card.item.path);
                  else if (card.item.path) window.open(card.item.path, '_blank', 'noopener,noreferrer');
                  onClose();
                };
                return (
                  <Box
                    key={card.item.id}
                    onClick={openItem}
                    onKeyDown={interactive ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openItem(); } } : undefined}
                    role={interactive ? 'link' : undefined}
                    tabIndex={interactive ? 0 : undefined}
                    sx={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      px: '10px', py: '6px', borderRadius: '8px',
                      cursor: interactive ? 'pointer' : 'default',
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {card.item.pageTitle || card.item.id}
                      </Typography>
                      <Typography sx={{ fontSize: 10.5, color: 'text.disabled' }}>
                        {card.item.updatedAt || card.item.start || '날짜 미정'} · PC {card.item.progressPc ?? 0}%
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}
      </Box>
    </Dialog>
  );
}
