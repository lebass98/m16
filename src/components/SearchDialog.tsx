import React, { useEffect, useRef, useState, forwardRef } from 'react';
import { Dialog, Box, Typography, IconButton } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { motion, AnimatePresence } from 'framer-motion';
import PathPreviewIcons from './PathPreviewIcons';

const CustomTransition = forwardRef(function Transition(
  props: any & { children: React.ReactElement },
  ref: React.Ref<unknown>
) {
  const { children, in: inProp, onEnter, onExited, ...other } = props;
  return (
    <AnimatePresence>
      {inProp && (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, scale: 0.9, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          transition={{ type: 'spring', stiffness: 350, damping: 26 }}
          style={{ display: 'contents' }}
          {...other}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
});

export interface SearchHit {
  globalIdx: number;
  pageTitle: string;
  id: string;
  pathDisplay: string;          // path 또는 그 비슷한 표시 문자열
  section: string;              // 우측 배지로 표시 (이미지의 "Overview" 자리)
  href?: string;                // 클릭 시 새 창
  progress: number;             // 진행도 색상에 사용
}

interface Props {
  open: boolean;
  onClose: () => void;
  query: string;
  onQueryChange: (q: string) => void;
  results: SearchHit[];
  totalCount: number;
  onSelect?: (hit: SearchHit) => void;
  onSubmit?: (q: string) => void;     // Enter 시 메인 리스트 필터 적용
  previewEnabled?: boolean;
}

/**
 * Cmd/Ctrl+K 스타일 검색 모달.
 * 이미지 참고: 상단에 검색 input + ESC chip, 하단에 결과 리스트 (title / path / section badge).
 */
export default function SearchDialog({ open, onClose, query, onQueryChange, results, totalCount, onSelect, onSubmit, previewEnabled = true }: Props) {
  const theme = useTheme();
  // 키보드 네비게이션 — 화살표로 highlightIdx 이동, Enter로 onSelect
  const [highlightIdx, setHighlightIdx] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  // 결과 수가 줄면 highlightIdx가 범위를 벗어날 수 있어 매 렌더에서 clamp.
  // setState를 effect에서 호출하면 cascading render 경고가 나므로 derived state로 처리.
  const effectiveIdx = results.length > 0 ? Math.min(highlightIdx, results.length - 1) : 0;

  // effectiveIdx가 변하면 해당 항목이 보이도록 스크롤. JSDOM에는 scrollIntoView가 없어 guard.
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-hit-idx="${effectiveIdx}"]`);
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [effectiveIdx]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 쿼리 변경 시 highlight를 첫 항목으로 리셋 (effect 대신 handler에서 직접)
    setHighlightIdx(0);
    onQueryChange(e.target.value);
  };

  const handleInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (results.length > 0 && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      e.preventDefault();
      const next = e.key === 'ArrowDown' ? effectiveIdx + 1 : effectiveIdx - 1;
      setHighlightIdx((next + results.length) % results.length);
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      // 결과가 있고 effectiveIdx 항목이 존재 → 그 항목 선택
      const hit = results[effectiveIdx];
      if (hit) {
        if (onSelect) onSelect(hit);
        else if (hit.href) window.open(hit.href, '_blank');
        onClose();
        return;
      }
      // 결과가 없거나 highlight 무효 → 쿼리를 그대로 메인 리스트 필터로 적용
      if (query.trim() && onSubmit) {
        onSubmit(query.trim());
        onClose();
      }
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      {...({ TransitionComponent: CustomTransition } as any)}
      slotProps={{
        paper: {
          sx: {
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 24px 48px 0 rgb(var(--palette-grey-500Channel) / 0.24)',
            mt: '10vh',
            alignSelf: 'flex-start',
          },
        },
      }}
    >
      {/* 헤더: search icon + input + ESC */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '14px', px: '24px', py: '20px', borderBottom: '1px dashed rgb(var(--palette-grey-500Channel) / 0.2)' }}>
        <SearchIcon sx={{ fontSize: 22, color: 'text.disabled' }} />
        <Box
          component="input"
          autoFocus
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleInputKey}
          placeholder="Search... (↑↓ 이동 · Enter 선택)"
          aria-controls="search-results-list"
          aria-activedescendant={results.length > 0 ? `search-hit-${effectiveIdx}` : undefined}
          sx={{
            flex: 1, border: 'none', outline: 'none', bgcolor: 'transparent',
            fontFamily: 'inherit', fontSize: 17, color: 'text.primary',
            '&::placeholder': { color: 'text.disabled' },
          }}
        />
        {query && (
          <IconButton
            size="small"
            onClick={() => onQueryChange('')}
            sx={{ p: '2px', color: 'text.secondary' }}
          >
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        )}
        <Box
          onClick={onClose}
          sx={{
            cursor: 'pointer',
            fontSize: 11, fontWeight: 700, color: 'text.secondary',
            bgcolor: 'rgb(var(--palette-grey-500Channel) / 0.12)',
            px: '8px', py: '4px', borderRadius: '6px',
            transition: 'background 0.15s',
            '&:hover': { bgcolor: 'rgb(var(--palette-grey-500Channel) / 0.2)' },
          }}
        >
          Esc
        </Box>
      </Box>

      {/* 결과 리스트 */}
      <Box ref={listRef} id="search-results-list" role="listbox" sx={{ maxHeight: '60vh', overflowY: 'auto', py: '8px' }}>
        {query.trim() === '' ? (
          <Box sx={{ px: '24px', py: '40px', textAlign: 'center' }}>
            <Typography sx={{ fontSize: 13, color: 'text.disabled' }}>
              페이지 제목 · ID · 메뉴 · 메모를 검색할 수 있어요
            </Typography>
            <Typography sx={{ fontSize: 11, color: 'text.disabled', mt: '6px' }}>
              총 {totalCount} 개 페이지가 대상입니다
            </Typography>
          </Box>
        ) : results.length === 0 ? (
          <Box sx={{ px: '24px', py: '40px', textAlign: 'center' }}>
            <Typography sx={{ fontSize: 14, color: 'text.disabled' }}>
              "{query}" 결과 없음
            </Typography>
          </Box>
        ) : (
          <>
            {results.map((hit, i) => {
              const isDone = hit.progress >= 100;
              const statusKey = isDone ? 'success' : hit.progress === 0 ? 'error' : 'primary';
              const statusColor = `${statusKey}.main`;
              const isLast = i === results.length - 1;
              const isActive = i === effectiveIdx;
              return (
                <Box
                  key={hit.globalIdx}
                  id={`search-hit-${i}`}
                  role="option"
                  aria-selected={isActive}
                  data-hit-idx={i}
                  onClick={() => {
                    if (onSelect) onSelect(hit);
                    else if (hit.href) window.open(hit.href, '_blank');
                    onClose();
                  }}
                  onMouseEnter={() => setHighlightIdx(i)}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    px: '24px', py: '12px',
                    cursor: 'pointer',
                    borderBottom: isLast ? 'none' : '1px dashed rgb(var(--palette-grey-500Channel) / 0.2)',
                    transition: 'background 0.15s',
                    bgcolor: isActive ? alpha(theme.palette.primary.main, 0.12) : 'transparent',
                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, isActive ? 0.16 : 0.08) },
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: 14, fontWeight: 700, color: 'text.primary', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {hit.pageTitle || hit.id}
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {hit.pathDisplay}
                    </Typography>
                  </Box>
                  {/* section badge (이미지의 Overview 자리) */}
                  <Box sx={(t) => ({
                    fontSize: 11, fontWeight: 700,
                    color: statusColor,
                    bgcolor: alpha(t.palette[statusKey].main, 0.12),
                    px: '10px', py: '4px', borderRadius: '8px',
                    flexShrink: 0,
                    maxWidth: 140,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  })} title={hit.section}>
                    {hit.section || 'Overview'}
                  </Box>
                  {/* PC / Tablet / Mobile 미리보기 아이콘 (호버 시 미리보기) */}
                  {hit.href && (
                    <Box
                      onClick={(e) => e.stopPropagation()}
                      sx={{ flexShrink: 0 }}
                    >
                      <PathPreviewIcons path={hit.href} previewEnabled={previewEnabled} />
                    </Box>
                  )}
                </Box>
              );
            })}
          </>
        )}
      </Box>
    </Dialog>
  );
}
