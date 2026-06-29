import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useFilteredData } from './useFilteredData';
import type { TableSection } from '../types';

const item = (over: Partial<TableSection['data'][number]>): TableSection['data'][number] => ({
  pageTitle: '', id: '', depth1: '', depth2: '', depth3: '', path: '',
  progressPc: 0, progressMobile: 0, start: '', updatedAt: '', end: '', note: '',
  ...over,
});

const baseData: TableSection[] = [
  { depth1: '메인', data: [
    item({ pageTitle: '홈', id: 'A1', depth1: '메인', progressPc: 100 }),
    item({ pageTitle: '소개', id: 'A2', depth1: '메인', progressPc: 0 }),
  ]},
  { depth1: '평가', data: [
    item({ pageTitle: '리스트', id: 'B1', depth1: '평가', progressPc: 60 }),
  ]},
];

const base = {
  rawTableData: baseData,
  showIncomplete: true,
  sectionFilter: new Set<string>(),
  progressRange: [0, 100],
  sortBy: 'no' as const,
  searchFilter: '',
};

describe('useFilteredData', () => {
  it('필터 없이 전체 데이터 반환', () => {
    const { result } = renderHook(() => useFilteredData(base));
    expect(result.current.totalCount).toBe(3);
    expect(result.current.tableData).toHaveLength(2);
  });

  it('showIncomplete=false → 진행도 0 항목 숨김', () => {
    const { result } = renderHook(() => useFilteredData({ ...base, showIncomplete: false }));
    expect(result.current.totalCount).toBe(2);
    expect(result.current.tableData[0].data.map((i) => i.id)).toEqual(['A1']);
  });

  it('sectionFilter 매칭 항목만 표시', () => {
    const { result } = renderHook(() => useFilteredData({ ...base, sectionFilter: new Set(['평가']) }));
    expect(result.current.totalCount).toBe(1);
    expect(result.current.tableData[0].depth1).toBe('평가');
  });

  it('progressRange로 필터링', () => {
    const { result } = renderHook(() => useFilteredData({ ...base, progressRange: [40, 80] }));
    expect(result.current.totalCount).toBe(1);
    expect(result.current.tableData[0].data[0].id).toBe('B1');
  });

  it('searchFilter는 pageTitle/id/depth/note 매칭', () => {
    const { result } = renderHook(() => useFilteredData({ ...base, searchFilter: '소개' }));
    expect(result.current.totalCount).toBe(1);
    expect(result.current.tableData[0].data[0].id).toBe('A2');
  });

  it('overallPc 가중평균 계산', () => {
    const { result } = renderHook(() => useFilteredData(base));
    // 메인 avg=50(2개), 평가 avg=60(1개) → (50*2 + 60*1) / 3 = 53.3 → 53
    expect(result.current.overallPc).toBe(53);
  });

  it('flatCards가 sectionIdx/cardIdx 포함', () => {
    const { result } = renderHook(() => useFilteredData(base));
    expect(result.current.flatCards).toHaveLength(3);
    expect(result.current.flatCards[2]).toMatchObject({ sectionIdx: 1, cardIdx: 0, sectionTitle: '평가' });
  });

  it('depth1Categories 등장 순 + 카운트', () => {
    const { result } = renderHook(() => useFilteredData(base));
    expect(result.current.depth1Categories).toEqual([
      { key: '메인', count: 2 },
      { key: '평가', count: 1 },
    ]);
  });
});
