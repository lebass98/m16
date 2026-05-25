import type { SxProps, Theme } from '@mui/material/styles';

/**
 * Minimals UI 글래스모피즘 카드의 공통 sx 토큰.
 * App 곳곳에 반복되던 6개 속성 묶음을 한 곳에서 관리.
 * border는 --glass-border CSS 변수로 라이트/다크 자동 전환.
 */
export const glassCardSx: SxProps<Theme> = {
  bgcolor: 'background.paper',
  backdropFilter: 'var(--glass-blur)',
  WebkitBackdropFilter: 'var(--glass-blur)',
  border: 'var(--glass-border)',
  borderRadius: '16px',
  p: 'var(--card-pad, 24px)',
  boxShadow: 'var(--glass-shadow)',
};

/** padding 없이 boxShadow/border/blur만 적용한 경량 변형. */
export const glassPanelSx: SxProps<Theme> = {
  bgcolor: 'background.paper',
  backdropFilter: 'var(--glass-blur)',
  WebkitBackdropFilter: 'var(--glass-blur)',
  border: 'var(--glass-border)',
  borderRadius: '16px',
  boxShadow: 'var(--glass-shadow)',
};

/**
 * 진행도(ProgressBar / LinearProgress / Chip) 색상 토큰.
 * 다크 모드는 useTheme().palette.mode === 'dark'로 분기해 사용.
 *
 * 사용 예:
 *   const { palette } = useTheme();
 *   const fill = progressColors.fill(palette.mode);
 */
export const progressColors = {
  done: '#22c55e',                                              // 100% — 라이트/다크 공통 (대비 충분)
  fill: (mode: 'light' | 'dark') => (mode === 'dark' ? '#3b8fd6' : '#066cb3'),
  empty: (mode: 'light' | 'dark') => (mode === 'dark' ? 'rgba(255,255,255,0.12)' : '#e0e0e0'),
  pcAccent: (mode: 'light' | 'dark') => (mode === 'dark' ? '#6b9ad8' : '#4a7ab5'),
  moAccent: (mode: 'light' | 'dark') => (mode === 'dark' ? '#a3c3e8' : '#7c9fd4'),
};

/**
 * Minimals UI 디자인 시스템의 카드 그림자 토큰.
 * - cardShadow: 기본 (살짝 떠 있는 느낌)
 * - cardShadowHover: 호버 시 더 깊은 그림자 (인터랙티브 카드용)
 * 라이트/다크 모드별 분기 — 다크는 더 짙은 검정 기반.
 */
export const cardShadow = (mode: 'light' | 'dark'): string =>
  mode === 'dark'
    ? '0 0 2px 0 rgba(0, 0, 0, 0.5), 0 12px 24px -4px rgba(0, 0, 0, 0.4)'
    : '0 0 2px 0 rgba(145, 158, 171, 0.20), 0 12px 24px -4px rgba(145, 158, 171, 0.12)';

export const cardShadowHover = (mode: 'light' | 'dark'): string =>
  mode === 'dark'
    ? '0 0 2px 0 rgba(0, 0, 0, 0.6), 0 24px 48px -8px rgba(0, 0, 0, 0.5)'
    : '0 0 2px 0 rgba(145, 158, 171, 0.20), 0 24px 48px -8px rgba(145, 158, 171, 0.20)';

/**
 * StatusBadge(작업중/완료/제거 등) 색상 토큰.
 * StatusType별 (배경, 텍스트) 조합. 다크 모드는 약간 톤 조정.
 */
type StatusToken = { bg: string; fg: string };
const statusTokensLight: Record<'ing' | 'end' | 'except' | 'moding' | 'stay' | 'pc', StatusToken> = {
  ing:    { bg: '#ffb01a', fg: '#000' },
  end:    { bg: '#bfff11', fg: '#000' },
  except: { bg: '#dddddd', fg: '#000' },
  moding: { bg: '#ff4594', fg: '#fff' },
  stay:   { bg: '#dddddd', fg: '#000' },
  pc:     { bg: '#0c1844', fg: '#fff' },
};
const statusTokensDark: Record<'ing' | 'end' | 'except' | 'moding' | 'stay' | 'pc', StatusToken> = {
  ing:    { bg: '#d99000', fg: '#000' },
  end:    { bg: '#9fdc00', fg: '#000' },
  except: { bg: '#4a4a4a', fg: '#fff' },
  moding: { bg: '#e63a82', fg: '#fff' },
  stay:   { bg: '#4a4a4a', fg: '#fff' },
  pc:     { bg: '#2c3e6e', fg: '#fff' },
};
export function statusColor(key: keyof typeof statusTokensLight, mode: 'light' | 'dark'): StatusToken {
  return (mode === 'dark' ? statusTokensDark : statusTokensLight)[key];
}
