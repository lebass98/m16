/**
 * src/data/sites.ts 의 모든 사이트 데이터 → exports/<key>.csv 변환 스크립트.
 *
 * 실행:
 *   npm run export:csv
 *
 * 결과 CSV를 Google Sheets 에서 "파일 > 가져오기 > 업로드" 하면 됩니다.
 * 첫 행이 컬럼명이며, 앱이 이 컬럼명으로 데이터를 파싱합니다 — 임의로 변경 X.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { sites } from '../src/data/sites.ts';
import type { TableSection } from '../src/types/index.ts';

const COLUMNS = [
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

function csvEscape(value: unknown): string {
  if (value === undefined || value === null) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function sectionsToCsv(sections: TableSection[]): string {
  const lines: string[] = [COLUMNS.join(',')];
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

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, '..', 'exports');
mkdirSync(outDir, { recursive: true });

for (const site of sites) {
  const data = site.data;
  const csv = sectionsToCsv(data);
  const outPath = join(outDir, `${site.key}.csv`);
  writeFileSync(outPath, csv, 'utf-8');
  const rowCount = data.reduce((n, s) => n + s.data.length, 0);
  console.log(`✓ ${site.key}: ${rowCount} rows → ${outPath}`);
}
