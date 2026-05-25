import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import StateMessage from './StateMessage';

describe('StateMessage', () => {
  it('loading 종류: aria-busy=true와 기본 타이틀이 렌더된다', () => {
    render(<StateMessage kind="loading" />);
    expect(screen.getByText('불러오는 중…')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
  });

  it('empty 종류: 빈 상태 메시지 표시', () => {
    render(<StateMessage kind="empty" />);
    expect(screen.getByText('표시할 항목이 없습니다')).toBeInTheDocument();
  });

  it('no-results 종류: 필터 완화 안내 표시', () => {
    render(<StateMessage kind="no-results" />);
    expect(screen.getByText('조건에 맞는 결과가 없어요')).toBeInTheDocument();
  });

  it('error 종류: role=alert, aria-live=assertive', () => {
    render(<StateMessage kind="error" />);
    const node = screen.getByRole('alert');
    expect(node).toHaveAttribute('aria-live', 'assertive');
    expect(screen.getByText('데이터를 불러오지 못했어요')).toBeInTheDocument();
  });

  it('action 제공 시 버튼 클릭으로 콜백 호출', () => {
    const onClick = vi.fn();
    render(
      <StateMessage
        kind="no-results"
        action={{ label: '필터 초기화', onClick }}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: '필터 초기화' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('title/description prop으로 기본 메시지를 덮어쓸 수 있다', () => {
    render(
      <StateMessage kind="empty" title="커스텀 타이틀" description="커스텀 설명" />,
    );
    expect(screen.getByText('커스텀 타이틀')).toBeInTheDocument();
    expect(screen.getByText('커스텀 설명')).toBeInTheDocument();
    expect(screen.queryByText('표시할 항목이 없습니다')).not.toBeInTheDocument();
  });
});
