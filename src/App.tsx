import { useMemo } from 'react';
import { tableData } from './data/tableData';
import SectionTable from './components/SectionTable';
import BottomNav from './components/BottomNav';
import './App.css';

function getLatestDate(data: typeof tableData): string {
  const dates = data.flatMap((s) => s.data.map((item) => item.start)).filter(Boolean);
  return [...new Set(dates)].sort().at(-1) ?? '';
}

export default function App() {
  const latestDate = useMemo(() => getLatestDate(tableData), []);
  const totalCount = useMemo(
    () => tableData.reduce((sum, s) => sum + s.data.length, 0),
    []
  );

  return (
    <div className="index-wrap">
      <h1 className="index-title">{`사이트제목 (${totalCount})`}</h1>

      <div className="index-gnb">
        <div className="index-links">
          <a href="guide-component.html" target="_blank" rel="noreferrer">
            컴포넌트 가이드
          </a>
        </div>
      </div>

      <BottomNav sections={tableData} />

      <div className="index-datas">
        {tableData.map((section, i) => (
          <SectionTable
            key={i}
            section={section}
            sectionIndex={i}
            latestDate={latestDate}
          />
        ))}
      </div>
    </div>
  );
}
