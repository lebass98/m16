import { Chip, useTheme } from '@mui/material';
import type { StatusType } from '../types';
import { statusColor } from '../theme/tokens';

const LABEL_MAP: Record<NonNullable<StatusType>, string> = {
  ing: '작업중',
  end: '작업완료',
  except: '제거',
  moding: '수정중',
  stay: '대기중',
  pc: 'PC완료',
  '': '',
};

interface Props {
  status: StatusType;
}

export default function StatusBadge({ status }: Props) {
  const { palette } = useTheme();
  if (!status) return null;
  const label = LABEL_MAP[status];
  const { bg, fg } = statusColor(status, palette.mode);
  return (
    <Chip
      label={label}
      size="small"
      sx={{
        bgcolor: bg,
        color: fg,
        fontWeight: 500,
        fontSize: 12,
        height: 22,
        borderRadius: '5px',
      }}
    />
  );
}
