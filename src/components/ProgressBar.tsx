import type { ProgressValue } from '../types';

interface Props {
  value: ProgressValue;
}

export default function ProgressBar({ value }: Props) {
  const filled = value / 20;

  return (
    <div className="progress-bar" title={`${value}%`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={`progress-bar__segment${i < filled ? ' progress-bar__segment--on' : ''}`}
        />
      ))}
    </div>
  );
}
