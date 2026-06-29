import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ErrorBoundary from './ErrorBoundary';

function Boom({ explode }: { explode: boolean }) {
  if (explode) throw new Error('테스트 오류');
  return <div>안전한 자식</div>;
}

describe('ErrorBoundary', () => {
  // ErrorBoundary는 componentDidCatch에서 console.error를 호출 → 테스트 출력 정리.
  let errorSpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    errorSpy.mockRestore();
  });

  it('자식이 에러를 던지지 않으면 자식을 그대로 렌더', () => {
    render(
      <ErrorBoundary>
        <Boom explode={false} />
      </ErrorBoundary>,
    );
    expect(screen.getByText('안전한 자식')).toBeInTheDocument();
  });

  it('자식이 에러를 던지면 기본 폴백 UI(에러 메시지 + 다시 시도/새로고침 버튼)를 보여준다', () => {
    render(
      <ErrorBoundary>
        <Boom explode />
      </ErrorBoundary>,
    );
    expect(screen.getByText('화면을 표시할 수 없습니다')).toBeInTheDocument();
    expect(screen.getByText('테스트 오류')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '다시 시도' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '새로고침' })).toBeInTheDocument();
  });

  it('커스텀 fallback prop이 우선 사용된다', () => {
    render(
      <ErrorBoundary fallback={(err) => <div>커스텀: {err.message}</div>}>
        <Boom explode />
      </ErrorBoundary>,
    );
    expect(screen.getByText('커스텀: 테스트 오류')).toBeInTheDocument();
  });

  it('"다시 시도" 클릭 후 자식이 정상이면 복구된다', () => {
    let shouldExplode = true;
    function Toggle() {
      return <Boom explode={shouldExplode} />;
    }
    const { rerender } = render(
      <ErrorBoundary>
        <Toggle />
      </ErrorBoundary>,
    );
    expect(screen.getByText('화면을 표시할 수 없습니다')).toBeInTheDocument();

    shouldExplode = false;
    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));
    // reset 후 다음 렌더에서 자식 재호출
    rerender(
      <ErrorBoundary>
        <Toggle />
      </ErrorBoundary>,
    );
    expect(screen.getByText('안전한 자식')).toBeInTheDocument();
  });
});
