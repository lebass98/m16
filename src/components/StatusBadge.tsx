import { Chip } from '@mui/material';
import type { StatusType } from '../types';

const STATUS_MAP: Record<NonNullable<StatusType>, { label: string; bgcolor: string; color?: string }> = {
  ing:    { label: '작업중',   bgcolor: '#ffb01a', color: '#000' },
  end:    { label: '작업완료', bgcolor: '#bfff11', color: '#000' },
  except: { label: '제거',     bgcolor: '#ddd',    color: '#000' },
  moding: { label: '수정중',   bgcolor: '#ff4594', color: '#fff' },
  stay:   { label: '대기중',   bgcolor: '#ddd',    color: '#000' },
  pc:     { label: 'PC완료',   bgcolor: '#0c1844', color: '#fff' },
  '':     { label: '',         bgcolor: 'transparent' },
};

interface Props {
  status: StatusType;
}

export default function StatusBadge({ status }: Props) {
  if (!status) return null;
  const { label, bgcolor, color = '#000' } = STATUS_MAP[status];
  return (
    <Chip
      label={label}
      size="small"
      sx={{
        bgcolor,
        color,
        fontWeight: 500,
        fontSize: 12,
        height: 22,
        borderRadius: '5px',
      }}
    />
  );
}
