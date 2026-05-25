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
import { sectionsToCsv } from '../src/utils/exportData.ts';

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
