import { Dialog, Box, Typography, IconButton, Chip, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import RestoreIcon from '@mui/icons-material/Restore';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import type { HistoryEntry } from '../../hooks/useProgressOverrides';
import StateMessage from '../StateMessage';

interface Props {
  open: boolean;
  onClose: () => void;
  history: Record<string, HistoryEntry[]>;
  /** id → 표시 이름(pageTitle 또는 id) 매핑. */
  itemLabel: (id: string) => string;
  onRevert: (id: string) => void;
  onClearAll: () => void;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return iso;
  return d.toLocaleString('ko-KR', { dateStyle: 'short', timeStyle: 'short' });
}

/**
 * 진행도 변경 히스토리 다이얼로그.
 * - 항목별로 묶어서 시간순(최신 우선) 표시.
 * - 항목별로 "원본으로 되돌리기" 액션 제공.
 * - 전체 히스토리 비우기 액션 (오버라이드까지 함께 삭제).
 */
export default function ProgressHistoryDialog({ open, onClose, history, itemLabel, onRevert, onClearAll }: Props) {
  const itemIds = Object.keys(history).filter((id) => (history[id]?.length ?? 0) > 0);
  // 항목별로 가장 최근 변경 시각을 기준으로 정렬
  itemIds.sort((a, b) => (history[b][0]?.at ?? '').localeCompare(history[a][0]?.at ?? ''));

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" slotProps={{ paper: { sx: { borderRadius: '16px', maxHeight: '85vh' } } }}>
      <Box sx={{ p: '14px 16px', borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography sx={{ fontSize: 16, fontWeight: 700 }}>
          진행도 변경 히스토리
          {itemIds.length > 0 && (
            <Box component="span" sx={{ ml: '8px', fontSize: 12, color: 'text.secondary', fontWeight: 500 }}>({itemIds.length}개 항목)</Box>
          )}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {itemIds.length > 0 && (
            <Button
              size="small"
              onClick={() => { if (window.confirm('모든 변경 내역과 사용자 수정값을 삭제할까요? 원본 데이터로 되돌아갑니다.')) onClearAll(); }}
              sx={{ textTransform: 'none', fontSize: 12, color: 'error.main', '&:hover': { bgcolor: 'rgb(var(--palette-error-mainChannel) / 0.08)' } }}
            >
              전체 삭제
            </Button>
          )}
          <IconButton size="small" onClick={onClose} aria-label="히스토리 닫기">
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </Box>

      <Box sx={{ overflowY: 'auto', p: itemIds.length === 0 ? '24px' : '8px 0' }}>
        {itemIds.length === 0 ? (
          <StateMessage
            kind="empty"
            title="아직 변경 내역이 없어요"
            description="진행도를 수정하면 여기에 시점별 기록이 남습니다."
          />
        ) : (
          itemIds.map((id) => {
            const entries = history[id] ?? [];
            return (
              <Box key={id} sx={{ px: '16px', py: '12px', borderBottom: '1px dashed rgb(var(--palette-grey-500Channel) / 0.16)', '&:last-of-type': { borderBottom: 'none' } }}>
                <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '12px', mb: '8px' }}>
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }} title={itemLabel(id)}>
                    {itemLabel(id)}
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<RestoreIcon sx={{ fontSize: 14 }} />}
                    onClick={() => onRevert(id)}
                    sx={{ textTransform: 'none', fontSize: 11, color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
                  >
                    원본으로
                  </Button>
                </Box>
                <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {entries.map((e, i) => (
                    <Box key={i} component="li" sx={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <Chip
                        label={e.field === 'progressPc' ? 'PC' : 'MO'}
                        size="small"
                        sx={{ height: 18, fontSize: 10, fontWeight: 700, bgcolor: 'rgb(var(--palette-grey-500Channel) / 0.12)' }}
                      />
                      <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                        {e.from === null ? '원본' : `${e.from}%`}
                      </Typography>
                      <ArrowForwardIcon sx={{ fontSize: 14, color: 'text.disabled' }} aria-hidden="true" />
                      <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'primary.main' }}>{e.to}%</Typography>
                      <Typography sx={{ ml: 'auto', fontSize: 11, color: 'text.disabled' }}>
                        {formatTime(e.at)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            );
          })
        )}
      </Box>
    </Dialog>
  );
}
