import type { TableSection } from '../types';

export const CSV_COLUMNS = [
  'section',
  'pageTitle',
  'id',
  'depth1',
  'depth2',
  'depth3',
  'path',
  'progressPc',
  'progressMobile',
  'start',
  'updatedAt',
  'end',
  'note',
  'depthOnly',
] as const;

export function csvEscape(value: unknown): string {
  if (value === undefined || value === null) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/** TableSection[] → 한 장의 CSV 문자열. CLI 스크립트와 인앱 내보내기 모두 이걸 사용. */
export function sectionsToCsv(sections: TableSection[]): string {
  const lines: string[] = [CSV_COLUMNS.join(',')];
  for (const section of sections) {
    for (const item of section.data) {
      lines.push([
        csvEscape(section.depth1),
        csvEscape(item.pageTitle),
        csvEscape(item.id),
        csvEscape(item.depth1),
        csvEscape(item.depth2),
        csvEscape(item.depth3),
        csvEscape(item.path),
        csvEscape(item.progressPc),
        csvEscape(item.progressMobile),
        csvEscape(item.start),
        csvEscape(item.updatedAt),
        csvEscape(item.end),
        csvEscape(item.note),
        csvEscape(item.depthOnly ?? ''),
      ].join(','));
    }
  }
  return lines.join('\n');
}

/** JSON 직렬화 — 사이트별 메타 + 섹션 데이터. */
export function sectionsToJson(sections: TableSection[], siteKey: string, siteTitle: string): string {
  return JSON.stringify({
    site: { key: siteKey, title: siteTitle, exportedAt: new Date().toISOString() },
    sections,
  }, null, 2);
}

/** 브라우저에서 파일 다운로드 트리거. */
export function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime + ';charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // 메모리 누수 방지 — 약간의 지연 후 revoke (브라우저가 다운로드 시작할 시간 확보)
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
