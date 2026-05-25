import { Chip, Box, useTheme } from '@mui/material';
import type { ProgressValue } from '../types';
import { progressColors } from '../theme/tokens';

interface Props {
  value: ProgressValue;
}

export default function ProgressBar({ value }: Props) {
  const { palette } = useTheme();
  const mode = palette.mode;

  if (value === 100) {
    return (
      <Chip
        label="완료"
        size="small"
        role="progressbar"
        aria-valuenow={100}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="진행도 100% (완료)"
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
    );
  }

  const filled = value / 20;
  const fillColor = progressColors.fill(mode);
  const emptyColor = progressColors.empty(mode);

  return (
    <Box
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`진행도 ${value}%`}
      sx={{ display: 'flex', gap: '3px', alignItems: 'center', justifyContent: 'center' }}
      title={`${value}%`}
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
  );
}
