import type { StatusType } from '../types';

const STATUS_MAP: Record<NonNullable<StatusType>, string> = {
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
  if (!status) return null;
  return (
    <span className={`index-status index-status--${status}`}>
      {STATUS_MAP[status]}
    </span>
  );
}
