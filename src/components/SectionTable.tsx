import { useRef } from 'react';
import type { TableSection } from '../types';
import ProgressBar from './ProgressBar';
import PathPreviewIcons from './PathPreviewIcons';
import PreviewFrame from './PreviewFrame';

interface Props {
  section: TableSection;
  sectionIndex: number;
  latestDate: string;
}

export default function SectionTable({ section, sectionIndex, latestDate }: Props) {
  const sectionRef = useRef<HTMLDivElement>(null);

  function getDisplayValue(
    items: TableSection['data'],
    index: number,
    key: keyof TableSection['data'][0],
    secondKey?: keyof TableSection['data'][0]
  ): string {
    const val = String(items[index][key] || '');
    if (index === 0) return val;
    const prev = items[index - 1];
    const isPrevSameVal = String(prev[key]) === String(items[index][key]);

    if (secondKey) {
      if (!items[index].depthOnly) {
        const isPrevSameSecond = String(prev[secondKey]) === String(items[index][secondKey]);
        if (isPrevSameVal && isPrevSameSecond) return '';
        return val;
      }
    }
    if (isPrevSameVal) return '';
    return val;
  }

  const hasDepth1 = section.data.some(item => item.depth1);
  const hasDepth2 = section.data.some(item => item.depth2);
  const hasDepth3 = section.data.some(item => item.depth3);

  return (
    <div className="index-section" id={`section-${sectionIndex}`} ref={sectionRef}>
      <h2 className="index-section__title">
        {section.depth1} ({section.data.length})
      </h2>

      {/* 데스크탑: 테이블 */}
      <div className="index-table">
        <table>
          <colgroup>
            <col style={{ width: 40 }} />
            <col style={{ width: 150 }} />
            <col style={{ width: 80 }} />
            {hasDepth1 && <col style={{ width: 120 }} />}
            {hasDepth2 && <col style={{ width: 120 }} />}
            {hasDepth3 && <col style={{ width: 120 }} />}
            <col style={{ width: 200 }} />
            <col style={{ width: 70 }} />
            <col style={{ width: 80 }} />
            <col style={{ width: 80 }} />
            <col style={{ width: 80 }} />
            <col style={{ width: 120 }} />
          </colgroup>
          <thead>
            <tr>
              <th>No</th>
              <th>페이지제목</th>
              <th>ID</th>
              {hasDepth1 && <th>depth1</th>}
              {hasDepth2 && <th>depth2</th>}
              {hasDepth3 && <th>depth3</th>}
              <th>경로</th>
              <th>진행도</th>
              <th>생성일</th>
              <th>최근 업데이트</th>
              <th>완료일</th>
              <th>비고</th>
            </tr>
          </thead>
          <tbody>
            {section.data.map((item, j) => (
              <tr key={j}>
                <td>{j + 1}</td>
                <td>{item.pageTitle}</td>
                <td>{getDisplayValue(section.data, j, 'id')}</td>
                {hasDepth1 && <td>{getDisplayValue(section.data, j, 'depth1', 'depth2')}</td>}
                {hasDepth2 && <td>{getDisplayValue(section.data, j, 'depth2', 'depth3')}</td>}
                {hasDepth3 && <td>{getDisplayValue(section.data, j, 'depth3')}</td>}
                <td>
                  {item.path ? <PathPreviewIcons path={item.path} /> : null}
                </td>
                <td>
                  <ProgressBar value={item.progress} />
                </td>
                <td className={item.start === latestDate ? 'is-emphasis' : ''}>
                  {item.start}
                </td>
                <td className={item.updatedAt === latestDate ? 'is-emphasis' : ''}>
                  {item.updatedAt}
                </td>
                <td className={item.end === latestDate ? 'is-emphasis' : ''}>
                  {item.end}
                </td>
                <td>{item.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 모바일: 카드 */}
      <div className="index-cards">
        {section.data.map((item, j) => (
          <div className="index-card" key={j}>
            <div className="index-card__header">
              <span className="index-card__num">{j + 1}</span>
              <span className="index-card__title">{item.pageTitle || item.id}</span>
              <ProgressBar value={item.progress} />
            </div>
            <div className="index-card__body">
              <div className="index-card__info">
                {item.id && (
                  <div className="index-card__row">
                    <span className="index-card__label">ID</span>
                    <span className="index-card__value">{item.id}</span>
                  </div>
                )}
                {(item.depth1 || item.depth2 || item.depth3) && (
                  <div className="index-card__row">
                    <span className="index-card__label">메뉴</span>
                    <span className="index-card__value">
                      {[item.depth1, item.depth2, item.depth3].filter(Boolean).join(' > ')}
                    </span>
                  </div>
                )}
                {item.path && (
                  <div className="index-card__row">
                    <span className="index-card__label">경로</span>
                    <a className="index-card__value" href={item.path} target="_blank" rel="noreferrer">
                      {(() => { try { return new URL(item.path).pathname; } catch { return item.path; } })()}
                    </a>
                  </div>
                )}
                <div className="index-card__dates">
                  {item.start && (
                    <div className="index-card__date">
                      <span className="index-card__label">생성일</span>
                      <span className={`index-card__value${item.start === latestDate ? ' is-emphasis' : ''}`}>
                        {item.start}
                      </span>
                    </div>
                  )}
                  {item.updatedAt && (
                    <div className="index-card__date">
                      <span className="index-card__label">업데이트</span>
                      <span className={`index-card__value${item.updatedAt === latestDate ? ' is-emphasis' : ''}`}>
                        {item.updatedAt}
                      </span>
                    </div>
                  )}
                  {item.end && (
                    <div className="index-card__date">
                      <span className="index-card__label">완료일</span>
                      <span className={`index-card__value${item.end === latestDate ? ' is-emphasis' : ''}`}>
                        {item.end}
                      </span>
                    </div>
                  )}
                </div>
                {item.note && (
                  <div className="index-card__row">
                    <span className="index-card__label">비고</span>
                    <span className="index-card__value">{item.note}</span>
                  </div>
                )}
              </div>
              {item.path && (
                <a
                  className="index-card__thumb"
                  href={item.path}
                  target="_blank"
                  rel="noreferrer"
                >
                  <PreviewFrame src={item.path} displayWidth={130} animate fillHeight speed={2} />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
