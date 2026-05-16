import type { ProgressValue, TableItem, TableSection } from '../types';

/**
 * RFC 4180 호환 미니멀 CSV 파서.
 * - 따옴표로 감싼 필드 (내부에 콤마/줄바꿈 허용)
 * - 따옴표 이스케이프 ("")
 * - LF / CRLF 줄바꿈
 */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(field);
      field = '';
    } else if (ch === '\r') {
      // ignore — \n 다음 처리에서 줄바꿈 인식
    } else if (ch === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += ch;
    }
  }

  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

const VALID_PROGRESS = new Set<ProgressValue>([0, 20, 40, 60, 80, 100]);

function parseProgress(raw: string): ProgressValue {
  const n = Number(raw);
  if (Number.isFinite(n) && VALID_PROGRESS.has(n as ProgressValue)) {
    return n as ProgressValue;
  }
  return 0;
}

function parseBool(raw: string): boolean | undefined {
  if (raw === '' || raw === undefined) return undefined;
  const lower = raw.trim().toLowerCase();
  if (lower === 'true' || lower === '1' || lower === 'y') return true;
  if (lower === 'false' || lower === '0' || lower === 'n') return false;
  return undefined;
}

/**
 * CSV 텍스트 → TableSection[]. 첫 행은 컬럼명, `section` 컬럼 기준으로 그룹핑.
 */
export function csvToSections(csvText: string): TableSection[] {
  const rows = parseCsv(csvText).filter(r => r.some(cell => cell.trim() !== ''));
  if (rows.length < 2) return [];

  const headers = rows[0].map(h => h.trim());
  const idx = (name: string) => headers.indexOf(name);

  const colSection = idx('section');
  const colPageTitle = idx('pageTitle');
  const colId = idx('id');
  const colDepth1 = idx('depth1');
  const colDepth2 = idx('depth2');
  const colDepth3 = idx('depth3');
  const colPath = idx('path');
  const colProgressPc = idx('progressPc');
  const colProgressMobile = idx('progressMobile');
  const colStart = idx('start');
  const colUpdatedAt = idx('updatedAt');
  const colEnd = idx('end');
  const colNote = idx('note');
  const colDepthOnly = idx('depthOnly');

  if (colSection === -1) {
    throw new Error('[parseSheetCsv] "section" 컬럼이 없습니다. 시트 헤더를 확인하세요.');
  }

  const groups = new Map<string, TableItem[]>();
  const order: string[] = [];
  const cell = (row: string[], i: number) => (i === -1 ? '' : row[i] ?? '');

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const sectionName = cell(row, colSection).trim();
    if (!sectionName) continue;

    const item: TableItem = {
      pageTitle: cell(row, colPageTitle),
      id: cell(row, colId),
      depth1: cell(row, colDepth1),
      depth2: cell(row, colDepth2),
      depth3: cell(row, colDepth3),
      path: cell(row, colPath),
      progressPc: parseProgress(cell(row, colProgressPc)),
      progressMobile: parseProgress(cell(row, colProgressMobile)),
      start: cell(row, colStart),
      updatedAt: cell(row, colUpdatedAt),
      end: cell(row, colEnd),
      note: cell(row, colNote),
    };
    const depthOnly = parseBool(cell(row, colDepthOnly));
    if (depthOnly !== undefined) item.depthOnly = depthOnly;

    if (!groups.has(sectionName)) {
      groups.set(sectionName, []);
      order.push(sectionName);
    }
    groups.get(sectionName)!.push(item);
  }

  return order.map(name => ({ depth1: name, data: groups.get(name)! }));
}

/**
 * Google Sheets "웹에 게시" CSV URL 에서 데이터를 받아 TableSection[] 으로 변환.
 * fallback 이 있으면 네트워크 실패 시 fallback 반환 + 콘솔 경고.
 */
export async function loadSheetCsv(
  url: string,
  fallback?: TableSection[] | (() => Promise<TableSection[]>),
): Promise<TableSection[]> {
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    return csvToSections(text);
  } catch (err) {
    console.warn('[loadSheetCsv] 시트 로드 실패, fallback 사용:', err);
    if (typeof fallback === 'function') return fallback();
    if (fallback) return fallback;
    return [];
  }
}
