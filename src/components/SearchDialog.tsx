import { Dialog, Box, Typography, IconButton } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import PathPreviewIcons from './PathPreviewIcons';

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

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
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
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && query.trim()) {
              e.preventDefault();
              if (onSubmit) onSubmit(query.trim());
              onClose();
            }
          }}
          placeholder="Search..."
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
      <Box sx={{ maxHeight: '60vh', overflowY: 'auto', py: '8px' }}>
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
              return (
                <Box
                  key={hit.globalIdx}
                  onClick={() => {
                    if (onSelect) onSelect(hit);
                    else if (hit.href) window.open(hit.href, '_blank');
                    onClose();
                  }}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    px: '24px', py: '12px',
                    cursor: 'pointer',
                    borderBottom: isLast ? 'none' : '1px dashed rgb(var(--palette-grey-500Channel) / 0.2)',
                    transition: 'background 0.15s',
                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08) },
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
