import { Chip, Box, Tooltip, useTheme } from '@mui/material';
import type { ProgressValue } from '../types';
import { progressColors } from '../theme/tokens';

interface Props {
  value: ProgressValue;
}

/**
 * 진행도를 0~100% 사이 6단계로 표시.
 * - 100%: "완료" Chip
 * - 그 외: 5개 바 (20%씩 채워짐)
 * 호버 시 Tooltip으로 "진행도 N% (상태 라벨)" 표시 → 화면이 작아도 정확한 값 확인 가능.
 */
const STATUS_LABEL: Record<ProgressValue, string> = {
  0:   '미시작',
  20:  '시작',
  40:  '진행중',
  60:  '진행중',
  80:  '거의 완료',
  100: '완료',
};

export default function ProgressBar({ value }: Props) {
  const { palette } = useTheme();
  const mode = palette.mode;
  const statusLabel = STATUS_LABEL[value];
  const ariaText = `진행도 ${value}% (${statusLabel})`;
  const tooltipText = `${value}% · ${statusLabel}`;

  if (value === 100) {
    return (
      <Tooltip title={tooltipText} arrow placement="top">
        <Chip
          label="완료"
          size="small"
          role="progressbar"
          aria-valuenow={100}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuetext={ariaText}
          aria-label={ariaText}
          sx={{
            bgcolor: progressColors.done,
            color: '#fff',
            fontWeight: 700,
            fontSize: 10,
            height: 16,
            display: 'flex',
            mx: 'auto',
            '& .MuiChip-label': { px: '6px' },
          }}
        />
      </Tooltip>
    );
  }

  const filled = value / 20;
  const fillColor = progressColors.fill(mode);
  const emptyColor = progressColors.empty(mode);

  return (
    <Tooltip title={tooltipText} arrow placement="top">
      <Box
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={ariaText}
        aria-label={ariaText}
        sx={{
          display: 'flex',
          gap: '3px',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'help',
        }}
      >
        {Array.from({ length: 5 }, (_, i) => (
          <Box
            key={i}
            component="span"
            aria-hidden="true"
            sx={{
              display: 'block',
              width: 6,
              height: 16,
              borderRadius: '3px',
              bgcolor: i < filled ? fillColor : emptyColor,
            }}
          />
        ))}
      </Box>
    </Tooltip>
  );
}
