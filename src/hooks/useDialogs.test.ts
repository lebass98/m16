import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useDialogs } from './useDialogs';

describe('useDialogs', () => {
  it('모든 다이얼로그는 기본적으로 닫혀있다', () => {
    const { result } = renderHook(() => useDialogs());
    expect(result.current.isOpen('site')).toBe(false);
    expect(result.current.isOpen('section')).toBe(false);
    expect(result.current.isOpen('dashboard')).toBe(false);
    expect(result.current.isOpen('settings')).toBe(false);
    expect(result.current.isOpen('search')).toBe(false);
    expect(result.current.isOpen('shortcuts')).toBe(false);
  });

  it('openDialog는 해당 키만 true로 만들고 다른 키는 영향 없다', () => {
    const { result } = renderHook(() => useDialogs());
    act(() => result.current.openDialog('search'));
    expect(result.current.isOpen('search')).toBe(true);
    expect(result.current.isOpen('settings')).toBe(false);
  });

  it('closeDialog는 다시 false로 되돌린다', () => {
    const { result } = renderHook(() => useDialogs());
    act(() => result.current.openDialog('dashboard'));
    expect(result.current.isOpen('dashboard')).toBe(true);
    act(() => result.current.closeDialog('dashboard'));
    expect(result.current.isOpen('dashboard')).toBe(false);
  });

  it('toggleDialog는 현재 상태를 반전한다', () => {
    const { result } = renderHook(() => useDialogs());
    expect(result.current.isOpen('settings')).toBe(false);
    act(() => result.current.toggleDialog('settings'));
    expect(result.current.isOpen('settings')).toBe(true);
    act(() => result.current.toggleDialog('settings'));
    expect(result.current.isOpen('settings')).toBe(false);
  });

  it('여러 다이얼로그를 동시에 열 수 있다 (각 키 독립)', () => {
    const { result } = renderHook(() => useDialogs());
    act(() => {
      result.current.openDialog('search');
      result.current.openDialog('settings');
    });
    expect(result.current.isOpen('search')).toBe(true);
    expect(result.current.isOpen('settings')).toBe(true);
  });
});
