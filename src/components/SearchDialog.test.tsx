import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SearchDialog, { type SearchHit } from './SearchDialog';

const HITS: SearchHit[] = [
  { globalIdx: 0, pageTitle: '홈', id: 'home', pathDisplay: '/home', section: 'Overview', href: 'https://example.com/home', progress: 80 },
  { globalIdx: 1, pageTitle: '소개', id: 'about', pathDisplay: '/about', section: 'About', href: 'https://example.com/about', progress: 100 },
];

describe('SearchDialog', () => {
  it('open=false면 렌더되지 않는다', () => {
    render(
      <SearchDialog
        open={false}
        onClose={() => {}}
        query=""
        onQueryChange={() => {}}
        results={[]}
        totalCount={0}
      />,
    );
    expect(screen.queryByPlaceholderText(/^Search\.\.\./)).not.toBeInTheDocument();
  });

  it('query가 비어있으면 안내 문구를 보여준다', () => {
    render(
      <SearchDialog
        open
        onClose={() => {}}
        query=""
        onQueryChange={() => {}}
        results={[]}
        totalCount={42}
      />,
    );
    expect(screen.getByText('페이지 제목 · ID · 메뉴 · 메모를 검색할 수 있어요')).toBeInTheDocument();
    expect(screen.getByText('총 42 개 페이지가 대상입니다')).toBeInTheDocument();
  });

  it('query가 있고 결과가 없으면 "결과 없음" 표시', () => {
    render(
      <SearchDialog
        open
        onClose={() => {}}
        query="없는검색어"
        onQueryChange={() => {}}
        results={[]}
        totalCount={42}
      />,
    );
    expect(screen.getByText(/"없는검색어" 결과 없음/)).toBeInTheDocument();
  });

  it('결과를 리스트로 렌더한다', () => {
    render(
      <SearchDialog
        open
        onClose={() => {}}
        query="홈"
        onQueryChange={() => {}}
        results={HITS}
        totalCount={42}
      />,
    );
    expect(screen.getByText('홈')).toBeInTheDocument();
    expect(screen.getByText('소개')).toBeInTheDocument();
    expect(screen.getByText('/home')).toBeInTheDocument();
  });

  it('input 변경 시 onQueryChange가 호출된다', () => {
    const onQueryChange = vi.fn();
    render(
      <SearchDialog
        open
        onClose={() => {}}
        query=""
        onQueryChange={onQueryChange}
        results={[]}
        totalCount={0}
      />,
    );
    fireEvent.change(screen.getByPlaceholderText(/^Search\.\.\./), { target: { value: 'abc' } });
    expect(onQueryChange).toHaveBeenCalledWith('abc');
  });

  it('결과가 있을 때 Enter → onSelect(첫 결과) + onClose', () => {
    const onSelect = vi.fn();
    const onSubmit = vi.fn();
    const onClose = vi.fn();
    render(
      <SearchDialog
        open
        onClose={onClose}
        query="홈"
        onQueryChange={() => {}}
        results={HITS}
        totalCount={42}
        onSubmit={onSubmit}
        onSelect={onSelect}
      />,
    );
    fireEvent.keyDown(screen.getByPlaceholderText(/^Search\.\.\./), { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledWith(HITS[0]);
    expect(onSubmit).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it('결과가 없을 때 Enter → onSubmit(query) + onClose', () => {
    const onSubmit = vi.fn();
    const onClose = vi.fn();
    render(
      <SearchDialog
        open
        onClose={onClose}
        query="없는검색어"
        onQueryChange={() => {}}
        results={[]}
        totalCount={42}
        onSubmit={onSubmit}
      />,
    );
    fireEvent.keyDown(screen.getByPlaceholderText(/^Search\.\.\./), { key: 'Enter' });
    expect(onSubmit).toHaveBeenCalledWith('없는검색어');
    expect(onClose).toHaveBeenCalled();
  });

  it('↓ 키로 highlight 이동 후 Enter → 해당 결과 onSelect', () => {
    const onSelect = vi.fn();
    render(
      <SearchDialog
        open
        onClose={() => {}}
        query="검색"
        onQueryChange={() => {}}
        results={HITS}
        totalCount={42}
        onSelect={onSelect}
      />,
    );
    const input = screen.getByPlaceholderText(/^Search\.\.\./);
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledWith(HITS[1]);
  });

  it('결과 항목 클릭 시 onSelect 호출', () => {
    const onSelect = vi.fn();
    const onClose = vi.fn();
    render(
      <SearchDialog
        open
        onClose={onClose}
        query="홈"
        onQueryChange={() => {}}
        results={HITS}
        totalCount={42}
        onSelect={onSelect}
      />,
    );
    fireEvent.click(screen.getByText('홈'));
    expect(onSelect).toHaveBeenCalledWith(HITS[0]);
    expect(onClose).toHaveBeenCalled();
  });
});
