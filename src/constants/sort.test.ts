import { describe, it, expect } from 'vitest';
import { isSortKey, SORT_KEYS, SORT_LABELS } from './sort';

describe('isSortKey', () => {
  it('유효한 키 통과', () => {
    SORT_KEYS.forEach((k) => expect(isSortKey(k)).toBe(true));
  });

  it('잘못된 입력 거절', () => {
    expect(isSortKey('foo')).toBe(false);
    expect(isSortKey('')).toBe(false);
    expect(isSortKey(null)).toBe(false);
    expect(isSortKey(undefined)).toBe(false);
    expect(isSortKey(42)).toBe(false);
  });

  it('모든 키에 라벨 존재', () => {
    SORT_KEYS.forEach((k) => expect(SORT_LABELS[k]).toBeTruthy());
  });
});
