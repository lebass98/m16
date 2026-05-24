import type { SxProps, Theme } from '@mui/material/styles';

/**
 * Minimals UI 글래스모피즘 카드의 공통 sx 토큰.
 * App 곳곳에 반복되던 6개 속성 묶음을 한 곳에서 관리.
 */
export const glassCardSx: SxProps<Theme> = {
  bgcolor: 'background.paper',
  backdropFilter: 'var(--glass-blur)',
  WebkitBackdropFilter: 'var(--glass-blur)',
  border: '1px solid rgba(255,255,255,0.18)',
  borderRadius: '16px',
  p: 'var(--card-pad, 24px)',
  boxShadow: 'var(--glass-shadow)',
};

/** padding 없이 boxShadow/border/blur만 적용한 경량 변형. */
export const glassPanelSx: SxProps<Theme> = {
  bgcolor: 'background.paper',
  backdropFilter: 'var(--glass-blur)',
  WebkitBackdropFilter: 'var(--glass-blur)',
  border: '1px solid rgba(255,255,255,0.18)',
  borderRadius: '16px',
  boxShadow: 'var(--glass-shadow)',
};
