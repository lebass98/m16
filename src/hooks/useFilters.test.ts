import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useFilters } from './useFilters';

describe('useFilters', () => {
  it('초기 상태: 검색 빈 문자열, 진행도 [0,100], showIncomplete=true(미완료 포함), sectionFilter 비어있음', () => {
    const { result } = renderHook(() => useFilters());
    expect(result.current.searchFilter).toBe('');
    expect(result.current.progressRange).toEqual([0, 100]);
    expect(result.current.showIncomplete).toBe(true);
    expect(result.current.sectionFilter.size).toBe(0);
  });

  it('toggleSectionFilter는 키를 추가/제거한다', () => {
    const { result } = renderHook(() => useFilters());
    act(() => result.current.toggleSectionFilter('홈'));
    expect(result.current.sectionFilter.has('홈')).toBe(true);
    act(() => result.current.toggleSectionFilter('홈'));
    expect(result.current.sectionFilter.has('홈')).toBe(false);
  });

  it('clearSectionFilter는 모든 섹션 필터를 제거한다', () => {
    const { result } = renderHook(() => useFilters());
    act(() => {
      result.current.toggleSectionFilter('홈');
      result.current.toggleSectionFilter('소개');
    });
    expect(result.current.sectionFilter.size).toBe(2);
    act(() => result.current.clearSectionFilter());
    expect(result.current.sectionFilter.size).toBe(0);
  });

  it('clearSearchFilter는 검색어를 빈 문자열로 만든다', () => {
    const { result } = renderHook(() => useFilters());
    act(() => result.current.setSearchFilter('테스트'));
    expect(result.current.searchFilter).toBe('테스트');
    act(() => result.current.clearSearchFilter());
    expect(result.current.searchFilter).toBe('');
  });

  it('setProgressRange는 즉시 progressRange를 갱신한다', () => {
    const { result } = renderHook(() => useFilters());
    act(() => result.current.setProgressRange([20, 80]));
    expect(result.current.progressRange).toEqual([20, 80]);
  });
});
