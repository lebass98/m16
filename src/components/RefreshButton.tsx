import { useEffect, useState } from 'react';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

interface Props {
  /** 마지막 fetch 시각 (ms). null이면 "방금" 또는 "—". */
  lastFetched: number | null;
  loading: boolean;
  isFallback: boolean;
  onRefresh: () => void;
}

function formatRelative(ms: number | null): string {
  if (!ms) return '—';
  const diff = Math.max(0, Date.now() - ms);
  if (diff < 60_000) return '방금';
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  return `${Math.floor(hours / 24)}일 전`;
}

/**
 * 데이터 새로고침 버튼 + 마지막 갱신 시각.
 * 1초마다 상대 시간을 다시 그려서 "방금 → 1분 전" 자연스럽게 갱신.
 * 실패 시(isFallback) 텍스트 색상으로 표시.
 */
export default function RefreshButton({ lastFetched, loading, isFallback, onRefresh }: Props) {
  // 1초마다 강제 리렌더 — 상대 시간 표시 업데이트용
  const [, force] = useState(0);
  useEffect(() => {
    const t = setInterval(() => force((n) => n + 1), 30_000);
    return () => clearInterval(t);
  }, []);

  const relative = formatRelative(lastFetched);
  const tooltip = loading
    ? '시트 데이터 불러오는 중…'
    : isFallback
    ? `시트 fetch 실패 — 정적 데이터 사용 중 (${relative})`
    : `마지막 갱신: ${relative} — 클릭해서 새로고침`;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <Typography
        sx={{
          fontSize: 11,
          color: isFallback ? 'error.main' : 'text.secondary',
          fontWeight: 500,
          display: { xs: 'none', md: 'block' },
          whiteSpace: 'nowrap',
        }}
        aria-live="polite"
      >
        {loading ? '로딩…' : relative}
      </Typography>
      <Tooltip title={tooltip} arrow>
        <span>
          <IconButton
            onClick={onRefresh}
            disabled={loading}
            aria-label="데이터 새로고침"
            sx={{
              width: 36, height: 36,
              color: isFallback ? 'error.main' : 'text.secondary',
              '&:hover': { bgcolor: 'rgb(var(--palette-grey-500Channel) / 0.08)', color: 'text.primary' },
            }}
          >
            <RefreshIcon
              sx={{
                fontSize: 20,
                animation: loading ? 'previewSpin 0.8s linear infinite' : 'none',
              }}
            />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  );
}
