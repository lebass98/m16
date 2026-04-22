import type { LogItem } from '../types';

interface Props {
  logs: LogItem[];
  latestDate: string;
}

export default function LogList({ logs, latestDate }: Props) {
  return (
    <ul className="index-log">
      {logs.map((log, i) => (
        <li
          key={i}
          className={`index-log__item${log.date === latestDate ? ' is-emphasis' : ''}`}
        >
          <div className="index-log__item__date">[{log.date}]</div>
          <span dangerouslySetInnerHTML={{ __html: log.text }} />
        </li>
      ))}
    </ul>
  );
}
