import type { ReactNode } from 'react';
import { Box, Typography, CircularProgress, Button } from '@mui/material';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import FilterAltOffOutlinedIcon from '@mui/icons-material/FilterAltOffOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import GlassCard from './GlassCard';

export type StateKind = 'loading' | 'empty' | 'no-results' | 'error';

interface Props {
  kind: StateKind;
  /** 메인 메시지. 기본 메시지를 덮어쓰기 위해 제공. */
  title?: string;
  /** 보조 설명. 사용자가 다음에 할 일을 안내. */
  description?: string;
  /** 1차 액션 (예: "필터 초기화", "다시 시도"). */
  action?: { label: string; onClick: () => void };
  /** 부가 슬롯 (검색어 표시 등) */
  children?: ReactNode;
}

const DEFAULTS: Record<StateKind, { title: string; description: string }> = {
  loading:      { title: '불러오는 중…',         description: '잠시만 기다려주세요.' },
  empty:        { title: '표시할 항목이 없습니다', description: '이 사이트에 등록된 페이지가 아직 없어요.' },
  'no-results': { title: '조건에 맞는 결과가 없어요', description: '필터를 완화하거나 검색어를 다시 확인해보세요.' },
  error:        { title: '데이터를 불러오지 못했어요', description: '네트워크 또는 데이터 소스를 확인해주세요.' },
};

function Icon({ kind }: { kind: StateKind }) {
  const sx = { fontSize: 44, color: 'text.disabled' } as const;
  if (kind === 'loading') return <CircularProgress size={36} thickness={4} />;
  if (kind === 'empty') return <InboxOutlinedIcon sx={sx} aria-hidden="true" />;
  if (kind === 'no-results') return <FilterAltOffOutlinedIcon sx={sx} aria-hidden="true" />;
  return <ErrorOutlineOutlinedIcon sx={{ ...sx, color: 'error.main' }} aria-hidden="true" />;
}

/**
 * 비어있음 / 결과 없음 / 로딩 / 에러 상태를 일관되게 표현하는 공통 컴포넌트.
 * GlassCard 내부에서 중앙 정렬, 아이콘 + 타이틀 + 설명 + 선택적 액션 버튼.
 *
 * 사용 예:
 *   <StateMessage kind="no-results" action={{ label: '필터 초기화', onClick: reset }} />
 */
export default function StateMessage({ kind, title, description, action, children }: Props) {
  const d = DEFAULTS[kind];
  const isError = kind === 'error';
  return (
    <GlassCard
      role={isError ? 'alert' : 'status'}
      aria-live={isError ? 'assertive' : 'polite'}
      aria-busy={kind === 'loading' ? true : undefined}
      sx={{ py: '64px', px: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}
    >
      <Icon kind={kind} />
      <Box>
        <Typography sx={{ fontSize: 16, fontWeight: 700, color: 'text.primary', lineHeight: 1.4 }}>
          {title ?? d.title}
        </Typography>
        <Typography sx={{ fontSize: 13, color: 'text.secondary', mt: '4px', lineHeight: 1.5 }}>
          {description ?? d.description}
        </Typography>
      </Box>
      {children}
      {action && (
        <Button onClick={action.onClick} size="small" variant="outlined" sx={{ mt: '4px', textTransform: 'none', fontWeight: 600 }}>
          {action.label}
        </Button>
      )}
    </GlassCard>
  );
}
