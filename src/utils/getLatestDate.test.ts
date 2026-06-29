import { describe, it, expect } from 'vitest';
import { getLatestDate } from './getLatestDate';
import type { TableSection } from '../types';

describe('getLatestDate', () => {
  it('빈 데이터에서 빈 문자열 반환', () => {
    expect(getLatestDate([])).toBe('');
  });

  it('아이템이 없는 섹션은 무시', () => {
    const data: TableSection[] = [{ depth1: 'A', data: [] }];
    expect(getLatestDate(data)).toBe('');
  });

  it('가장 큰 start 날짜 반환', () => {
    const data: TableSection[] = [
      { depth1: 'A', data: [
        { pageTitle: 'p1', id: '1', depth1: '', depth2: '', depth3: '', path: '', progressPc: 0, progressMobile: 0, start: '2026.01.10', updatedAt: '', end: '', note: '' },
        { pageTitle: 'p2', id: '2', depth1: '', depth2: '', depth3: '', path: '', progressPc: 0, progressMobile: 0, start: '2026.05.21', updatedAt: '', end: '', note: '' },
      ]},
      { depth1: 'B', data: [
        { pageTitle: 'p3', id: '3', depth1: '', depth2: '', depth3: '', path: '', progressPc: 0, progressMobile: 0, start: '2026.03.05', updatedAt: '', end: '', note: '' },
      ]},
    ];
    expect(getLatestDate(data)).toBe('2026.05.21');
  });

  it('빈 start 필드는 제외', () => {
    const data: TableSection[] = [{ depth1: 'A', data: [
      { pageTitle: 'p', id: '1', depth1: '', depth2: '', depth3: '', path: '', progressPc: 0, progressMobile: 0, start: '', updatedAt: '', end: '', note: '' },
      { pageTitle: 'p2', id: '2', depth1: '', depth2: '', depth3: '', path: '', progressPc: 0, progressMobile: 0, start: '2026.04.01', updatedAt: '', end: '', note: '' },
    ]}];
    expect(getLatestDate(data)).toBe('2026.04.01');
  });
});
