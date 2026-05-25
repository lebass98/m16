import { useState } from 'react';
import { Box, Button, Select, MenuItem, Typography, IconButton, Tooltip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CompareIcon from '@mui/icons-material/Compare';
import SaveIcon from '@mui/icons-material/Save';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import DeselectIcon from '@mui/icons-material/Deselect';
import type { ProgressValue } from '../types';

const PROGRESS_OPTIONS: { value: ProgressValue | 'noop'; label: string }[] = [
  { value: 'noop', label: '변경 안 함' },
  { value: 0, label: '0% (미시작)' },
  { value: 20, label: '20%' },
  { value: 40, label: '40%' },
  { value: 60, label: '60%' },
  { value: 80, label: '80% (거의 완료)' },
  { value: 100, label: '100% (완료)' },
];

interface Props {
  selectedCount: number;
  /** 현재 필터 결과 항목 수 — "전체 선택"이 모두 선택했는지 비교에 사용. */
  visibleCount: number;
  onCancel: () => void;
  onApply: (nextPc?: ProgressValue, nextMo?: ProgressValue) => void;
  onCompare: () => void;
  onSelectAllVisible: () => void;
  onDeselectAll: () => void;
  /** 비교는 2~4개에서만 활성화. */
  canCompare: boolean;
}

/**
 * 화면 하단에 sticky로 고정되는 일괄 편집 툴바.
 * 선택된 항목 수, PC/MO 진행도 변경 셀렉트, 비교/적용/취소 액션.
 */
export default function BulkEditBar({ selectedCount, visibleCount, onCancel, onApply, onCompare, onSelectAllVisible, onDeselectAll, canCompare }: Props) {
  const [nextPc, setNextPc] = useState<ProgressValue | 'noop'>('noop');
  const [nextMo, setNextMo] = useState<ProgressValue | 'noop'>('noop');

  const apply = () => {
    onApply(
      nextPc === 'noop' ? undefined : nextPc,
      nextMo === 'noop' ? undefined : nextMo,
    );
    setNextPc('noop');
    setNextMo('noop');
  };

  const canApply = nextPc !== 'noop' || nextMo !== 'noop';

  return (
    <Box
      role="region"
      aria-label={`일괄 편집 (${selectedCount}개 선택됨)`}
      sx={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1200,
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        px: '20px',
        py: '12px',
        bgcolor: 'background.paper',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: 'var(--glass-border)',
        borderRadius: '16px',
        boxShadow: '0 16px 48px 0 rgba(0,0,0,0.18)',
        maxWidth: 'calc(100vw - 40px)',
        flexWrap: 'wrap',
      }}
    >
      <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'text.primary', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Box component="span" sx={{ bgcolor: 'primary.main', color: 'background.paper', borderRadius: '6px', px: '8px', py: '2px', fontSize: 12 }}>
          {selectedCount}
        </Box>
        / {visibleCount} 선택
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <Tooltip title={`현재 결과 ${visibleCount}개 모두 선택`} arrow>
          <span>
            <IconButton
              size="small"
              onClick={onSelectAllVisible}
              disabled={visibleCount === 0 || selectedCount === visibleCount}
              aria-label="현재 결과 모두 선택"
              sx={{ color: 'text.secondary' }}
            >
              <DoneAllIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="모든 선택 해제 (선택 모드 유지)" arrow>
          <span>
            <IconButton
              size="small"
              onClick={onDeselectAll}
              disabled={selectedCount === 0}
              aria-label="모든 선택 해제"
              sx={{ color: 'text.secondary' }}
            >
              <DeselectIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Typography sx={{ fontSize: 11, color: 'text.secondary', fontWeight: 700 }}>PC</Typography>
        <Select
          size="small"
          value={nextPc}
          onChange={(e) => setNextPc(e.target.value as ProgressValue | 'noop')}
          aria-label="PC 진행도를 일괄 변경"
          sx={{ minWidth: 130, height: 32, fontSize: 12, '& .MuiSelect-select': { py: '6px' } }}
        >
          {PROGRESS_OPTIONS.map((o) => (
            <MenuItem key={String(o.value)} value={o.value} sx={{ fontSize: 12 }}>{o.label}</MenuItem>
          ))}
        </Select>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Typography sx={{ fontSize: 11, color: 'text.secondary', fontWeight: 700 }}>MO</Typography>
        <Select
          size="small"
          value={nextMo}
          onChange={(e) => setNextMo(e.target.value as ProgressValue | 'noop')}
          aria-label="모바일 진행도를 일괄 변경"
          sx={{ minWidth: 130, height: 32, fontSize: 12, '& .MuiSelect-select': { py: '6px' } }}
        >
          {PROGRESS_OPTIONS.map((o) => (
            <MenuItem key={String(o.value)} value={o.value} sx={{ fontSize: 12 }}>{o.label}</MenuItem>
          ))}
        </Select>
      </Box>

      <Button
        startIcon={<SaveIcon sx={{ fontSize: 16 }} />}
        variant="contained"
        size="small"
        disabled={!canApply}
        onClick={apply}
        sx={{ textTransform: 'none', fontWeight: 700 }}
      >
        적용
      </Button>

      <Tooltip title={canCompare ? '선택한 항목들을 미리보기로 비교' : '비교는 2~4개 선택 시 가능'} arrow>
        <span>
          <Button
            startIcon={<CompareIcon sx={{ fontSize: 16 }} />}
            variant="outlined"
            size="small"
            disabled={!canCompare}
            onClick={onCompare}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            비교
          </Button>
        </span>
      </Tooltip>

      <Tooltip title="선택 해제" arrow>
        <IconButton size="small" onClick={onCancel} aria-label="선택 해제하고 일괄 편집 종료">
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
