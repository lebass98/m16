import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useFuseSearch } from './useFuseSearch';
import type { FlatCard } from './useFilteredData';

const card = (over: Partial<FlatCard['item']>): FlatCard => ({
  item: {
    pageTitle: '', id: '', depth1: '', depth2: '', depth3: '', path: '',
    progressPc: 0, progressMobile: 0, start: '', updatedAt: '', end: '', note: '',
    ...over,
  },
  sectionIdx: 0, sectionTitle: '', cardIdx: 0, sectionTotal: 1,
});

const cards: FlatCard[] = [
  card({ pageTitle: '홈 화면', id: 'FE_HM_0001' }),
  card({ pageTitle: '자체평가 목록', id: 'FE_SE_0001', depth1: '자체평가' }),
  card({ pageTitle: '평가 관리', id: 'FE_AM_0001', depth1: '평가 관리', note: '관리자만 접근' }),
];

describe('useFuseSearch', () => {
  it('빈 query → 빈 배열', () => {
    const { result } = renderHook(() => useFuseSearch(cards, ''));
    expect(result.current).toEqual([]);
  });

  it('정확 매칭', () => {
    const { result } = renderHook(() => useFuseSearch(cards, '홈 화면'));
    expect(result.current[0].item.id).toBe('FE_HM_0001');
  });

  it('약간의 오타 허용 (fuzzy)', () => {
    const { result } = renderHook(() => useFuseSearch(cards, 'FE_SE'));
    expect(result.current.length).toBeGreaterThan(0);
    expect(result.current[0].item.id).toContain('SE');
  });

  it('note 필드도 매칭', () => {
    const { result } = renderHook(() => useFuseSearch(cards, '관리자'));
    expect(result.current.length).toBeGreaterThan(0);
  });

  it('limit 인자로 결과 수 제한', () => {
    const { result } = renderHook(() => useFuseSearch(cards, '관리', 1));
    expect(result.current.length).toBeLessThanOrEqual(1);
  });
});
