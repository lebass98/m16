import { describe, it, expect } from 'vitest';
import { readUrlState, writeUrlState } from './urlState';

describe('readUrlState', () => {
  it('파라미터가 없으면 진행도 전체 범위 [0,100], 미완료 포함(true)이 기본', () => {
    const s = readUrlState('');
    expect(s.progressRange).toEqual([0, 100]);
    expect(s.showIncomplete).toBe(true);
    expect(s.searchFilter).toBe('');
    expect(s.sectionFilter.size).toBe(0);
  });

  it('min만 있으면 max는 100으로 유지', () => {
    expect(readUrlState('?min=40').progressRange).toEqual([40, 100]);
  });

  it('max만 있으면 min은 0으로 유지', () => {
    expect(readUrlState('?max=80').progressRange).toEqual([0, 80]);
  });

  it('min/max 모두 지정', () => {
    expect(readUrlState('?min=20&max=60').progressRange).toEqual([20, 60]);
  });

  it('incomplete=0 이면 미완료 숨김(false)', () => {
    expect(readUrlState('?incomplete=0').showIncomplete).toBe(false);
  });
});

describe('readUrlState ↔ writeUrlState 라운드트립', () => {
  it('기본 상태는 빈 쿼리스트링 (전체 범위·미완료 포함은 생략)', () => {
    const s = readUrlState('');
    expect(writeUrlState(s)).toBe('');
  });

  it('미완료 숨김만 켜면 incomplete=0 으로 직렬화되고 다시 읽힌다', () => {
    const s = readUrlState('');
    s.showIncomplete = false;
    const qs = writeUrlState(s);
    expect(qs).toBe('?incomplete=0');
    expect(readUrlState(qs).showIncomplete).toBe(false);
  });
});
