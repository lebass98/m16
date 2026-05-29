import { Box, Chip, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

interface Props {
  searchFilter: string;
  sectionFilter: Set<string>;
  showIncomplete: boolean;
  progressRange: number[];
  onClearSearch: () => void;
  onToggleSection: (key: string) => void;
  onToggleIncomplete: () => void;
  onResetProgress: () => void;
  onClearAll: () => void;
}

/**
 * 활성 필터 상태를 칩(Chip)으로 나열.
 * 사용자가 칩 한 번 클릭으로 개별 해제 + "전체 초기화" 버튼.
 * 활성 필터가 하나도 없으면 null을 반환해 자리만 차지하지 않는다.
 */
export default function ActiveFilterChips({
  searchFilter,
  sectionFilter,
  showIncomplete,
  progressRange,
  onClearSearch,
  onToggleSection,
  onToggleIncomplete,
  onResetProgress,
  onClearAll,
}: Props) {
  const hasSearch = searchFilter.trim() !== '';
  const hasSections = sectionFilter.size > 0;
  const hasProgress = progressRange[0] !== 0 || progressRange[1] !== 100;
  const hasAny = hasSearch || hasSections || !showIncomplete || hasProgress;

  if (!hasAny) return null;

  const chipSx = {
    height: 26,
    fontSize: 12,
    fontWeight: 600,
    bgcolor: 'rgb(var(--palette-primary-mainChannel) / 0.12)',
    color: 'primary.main',
    border: 'none',
    '& .MuiChip-deleteIcon': {
      color: 'primary.main',
      fontSize: 16,
      '&:hover': { color: 'primary.dark' },
    },
    '&:hover': { bgcolor: 'rgb(var(--palette-primary-mainChannel) / 0.2)' },
  };

  return (
    <Box
      role="region"
      aria-label="활성 필터"
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '8px',
        px: '4px',
        py: '2px',
      }}
    >
      <Box component="span" sx={{ fontSize: 11, color: 'text.secondary', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', mr: '4px' }}>
        활성 필터
      </Box>

      {hasSearch && (
        <Chip
          label={`"${searchFilter}"`}
          size="small"
          deleteIcon={<CloseIcon />}
          onDelete={onClearSearch}
          sx={chipSx}
        />
      )}

      {Array.from(sectionFilter).map((key) => (
        <Chip
          key={key}
          label={key || '(미분류)'}
          size="small"
          deleteIcon={<CloseIcon />}
          onDelete={() => onToggleSection(key)}
          sx={chipSx}
        />
      ))}

      {!showIncomplete && (
        <Chip
          label="미완료 숨김"
          size="small"
          deleteIcon={<CloseIcon />}
          onDelete={onToggleIncomplete}
          sx={chipSx}
        />
      )}

      {hasProgress && (
        <Chip
          label={`진행도 ${progressRange[0]}–${progressRange[1]}%`}
          size="small"
          deleteIcon={<CloseIcon />}
          onDelete={onResetProgress}
          sx={chipSx}
        />
      )}

      <Button
        size="small"
        startIcon={<RestartAltIcon sx={{ fontSize: 14 }} />}
        onClick={onClearAll}
        sx={{
          ml: 'auto',
          textTransform: 'none',
          fontSize: 12,
          fontWeight: 600,
          color: 'text.secondary',
          '&:hover': { color: 'error.main', bgcolor: 'transparent' },
        }}
      >
        전체 초기화
      </Button>
    </Box>
  );
}
