import { Chip, Box } from '@mui/material';
import type { ProgressValue } from '../types';

interface Props {
  value: ProgressValue;
}

export default function ProgressBar({ value }: Props) {
  if (value === 100) {
    return (
      <Chip
        label="완료"
        size="small"
        sx={{
          bgcolor: '#22c55e',
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

  return (
    <Box sx={{ display: 'flex', gap: '3px', alignItems: 'center', justifyContent: 'center' }} title={`${value}%`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Box
          key={i}
          component="span"
          sx={{
            display: 'block',
            width: 6,
            height: 16,
            borderRadius: '3px',
            bgcolor: i < filled ? '#066cb3' : '#e0e0e0',
          }}
        />
      ))}
    </Box>
  );
}
