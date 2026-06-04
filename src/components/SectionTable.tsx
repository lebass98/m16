import { useMemo } from 'react';
import { Paper, Box, Typography, Card, IconButton, Tooltip, Checkbox, useTheme } from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import StickyNote2OutlinedIcon from '@mui/icons-material/StickyNote2Outlined';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import type { TableItem, TableSection } from '../types';
import ProgressBar from './ProgressBar';
import PathPreviewIcons, { CopyPathButton } from './PathPreviewIcons';
import PreviewFrame from './PreviewFrame';
import { glassPanelSx, cardShadow, cardShadowHover } from '../theme/tokens';

// Minimals UI 팔레트
const COLORS = {
  primary: 'primary.main',
  primaryDark: 'primary.dark',
  primaryLight: 'primary.light',
  info: 'info.main',
  success: 'success.main',
  warning: 'warning.main',
  error: 'error.main',
  gray100: 'grey.200',
  gray200: 'grey.300',
  gray400: 'grey.400',
  gray500: 'text.disabled',
  gray600: 'text.secondary',
  gray700: 'grey.700',
  gray900: 'text.primary',
} as const;

// 카드 그림자는 theme/tokens.ts의 cardShadow/cardShadowHover를 사용 (다크 모드 분기 포함).

function getStatusColor(progress: number, isLatest: boolean): string {
  if (progress >= 100) return COLORS.success;
  if (progress === 0) return COLORS.error;
  if (isLatest) return COLORS.info;
  return COLORS.primary;
}

const DEVICE_DIMS = {
  pc: { w: 1920, h: 1080 },
  tablet: { w: 1024, h: 768 },
  mobile: { w: 375, h: 667 },
} as const;
type DeviceKey = keyof typeof DEVICE_DIMS;

/** 카드 하단 정보 우측 상단의 원형 액션 버튼 공통 스타일 (검정 바탕·흰 아이콘). */
const roundActionBtnSx = {
  width: 23.8,
  height: 23.8,
  p: 0,
  flexShrink: 0,
  borderRadius: '50%',
  bgcolor: '#111',
  color: '#fff',
  transition: 'transform 0.15s ease, background 0.2s ease, box-shadow 0.15s ease',
  '&:hover': {
    bgcolor: '#333',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 10px rgba(0,0,0,0.25)',
  },
} as const;

function RecipeCard({ item, section, sectionIndex, isBookmarked, onToggleBookmark, latestDate, cardIndex = 0, device = 'pc', selectMode = false, isSelected = false, onToggleSelect, onOpenFullscreen }: {
  item: TableItem;
  section: TableSection;
  sectionIndex: number;
  isBookmarked: boolean;
  onToggleBookmark?: (id: string) => void;
  latestDate: string;
  cardIndex?: number;
  /** 부모(상단 토글)에서 일괄 제어하는 미리보기 디바이스 */
  device?: DeviceKey;
  selectMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  onOpenFullscreen?: (item: TableItem) => void;
}) {
  const { palette } = useTheme();
  const mode = palette.mode;
  const baseDelay = Math.min(cardIndex, 16) * 55;
  const inner = (k: number) => ({ animationDelay: `${baseDelay + 120 + k * 60}ms` });
  const isLatest = !!item.updatedAt && item.updatedAt === latestDate;
  const accent = getStatusColor(item.progressPc ?? 0, isLatest);
  const tags = [item.depth1, item.depth2, item.depth3].filter(Boolean);
  const dims = DEVICE_DIMS[device];
  void sectionIndex;

  return (
    <Card
      variant="outlined"
      className="card-enter"
      style={{ animationDelay: `${baseDelay}ms` }}
      sx={{
        ...glassPanelSx,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        // 다크 모드에서도 충분히 보이도록 모드별 분기된 토큰 사용
        boxShadow: cardShadow(mode),
        color: COLORS.gray900,
        transition: 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.25s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: cardShadowHover(mode),
          zIndex: 2,
        },
      }}>
      {/* 썸네일 (디바이스별 프리뷰 — 카드 비율도 디바이스에 맞춰 변경) */}
      <Box
        className="reveal-scale"
        style={inner(0)}
        sx={{
          position: 'relative',
          aspectRatio: device === 'mobile' ? '9 / 16' : device === 'tablet' ? '4 / 3' : '16 / 9',
          overflow: 'hidden',
          bgcolor: COLORS.gray100,
        }}
      >
        {item.path ? (
          <>
            <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
              <PreviewFrame key={device} src={item.path} displayWidth="100%" fillHeight iframeWidth={dims.w} iframeHeight={dims.h} />
            </Box>
            {/* 날짜 pill + 선택 오버레이 (북마크·전체화면·파일보기는 하단 정보 우측 상단으로 이동) */}
            <Box sx={{ position: 'absolute', top: 12, left: 12, right: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 3 }}>
              <Box sx={{ bgcolor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', color: COLORS.gray900, px: '10px', py: '4px', borderRadius: '8px', fontSize: 11, fontWeight: 600, lineHeight: 1.4 }}>
                {item.start || '날짜 미정'}
              </Box>
              <Box sx={{ display: 'flex', gap: '4px' }}>
                {selectMode && (
                  <Checkbox
                    checked={isSelected}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => onToggleSelect?.(item.id)}
                    size="small"
                    slotProps={{ input: { 'aria-label': `${item.pageTitle || item.id} 선택` } }}
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.95)',
                      backdropFilter: 'blur(8px)',
                      width: 32, height: 32,
                      borderRadius: '8px',
                      p: 0,
                      '&:hover': { bgcolor: 'background.paper' },
                    }}
                  />
                )}
              </Box>
            </Box>
          </>
        ) : (
          <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.gray500, fontSize: 13 }}>
            미리보기 없음
          </Box>
        )}
      </Box>

      {/* 정보 영역 */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '14px', p: '20px 22px 22px', bgcolor: 'background.paper' }}>
        <Box className="reveal-up-sm" style={inner(1)} sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography sx={{ fontSize: 11, color: COLORS.gray600, fontWeight: 700, lineHeight: 1.2, mb: '6px', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Box component="span" sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: accent, display: 'inline-block' }} />
              {section.depth1}
            </Typography>
            <Typography sx={{ fontSize: 17, fontWeight: 700, color: COLORS.gray900, lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.01em' }} title={item.pageTitle || item.id}>
              {item.pageTitle || item.id}
            </Typography>
          </Box>

          {/* 우측 상단 액션 버튼 그룹: 북마크 · 파일 보기 · 전체화면 미리보기 (원형·검정 바탕·흰 아이콘) */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, mt: '2px' }}>
            <Tooltip title={isBookmarked ? '북마크 해제' : '북마크 추가'} arrow>
              <IconButton
                size="small"
                onClick={(e) => { e.stopPropagation(); onToggleBookmark?.(item.id); }}
                aria-label={isBookmarked ? '북마크 해제' : '북마크 추가'}
                aria-pressed={isBookmarked}
                sx={roundActionBtnSx}
              >
                {isBookmarked
                  ? <BookmarkIcon sx={{ fontSize: 11.9 }} />
                  : <BookmarkBorderIcon sx={{ fontSize: 11.9 }} />}
              </IconButton>
            </Tooltip>

            <Tooltip title="파일 보기" arrow>
              <Box component="span" sx={{ display: 'inline-flex' }}>
                <IconButton
                  size="small"
                  component={item.path ? 'a' : 'button'}
                  href={item.path || undefined}
                  target={item.path ? '_blank' : undefined}
                  rel={item.path ? 'noreferrer' : undefined}
                  disabled={!item.path}
                  aria-label="파일 보기"
                  sx={{ ...roundActionBtnSx, '&.Mui-disabled': { bgcolor: '#111', color: '#fff', opacity: 0.4 } }}
                >
                  <ArrowOutwardIcon sx={{ fontSize: 11.2 }} />
                </IconButton>
              </Box>
            </Tooltip>

            {onOpenFullscreen && (
              <Tooltip title="전체화면 미리보기" arrow>
                <IconButton
                  size="small"
                  onClick={(e) => { e.stopPropagation(); onOpenFullscreen(item); }}
                  aria-label="전체화면 미리보기 열기"
                  sx={roundActionBtnSx}
                >
                  <FullscreenIcon sx={{ fontSize: 12.6 }} />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        {/* 업뎃 + depth 경로: 같은 줄, 같은 글씨 크기 */}
        {(item.updatedAt || tags.length > 0) && (
          <Box className="reveal-up-sm" style={inner(3)} sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '10px', minWidth: 0 }}>
            <Typography sx={{ fontSize: 11, color: COLORS.gray500, lineHeight: 1.4, flexShrink: 0 }}>
              {item.updatedAt ? `업뎃 ${item.updatedAt}` : ''}
            </Typography>
            {tags.length > 0 && (
              <Typography
                title={tags.join(' > ')}
                sx={{ fontSize: 11, color: COLORS.gray500, lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0, textAlign: 'right' }}
              >
                {tags.join(' > ')}
              </Typography>
            )}
          </Box>
        )}

        {/* 디바이스 토글 + 작은 PC/MO % (파일 보기·전체화면·북마크는 상단 버튼 그룹으로 이동) */}
        {(() => {
          const pcVal = item.progressPc ?? 0;
          const moVal = item.progressMobile ?? 0;
          const pcColor = pcVal >= 100 ? COLORS.success : pcVal === 0 ? COLORS.error : COLORS.primary;
          const moColor = moVal >= 100 ? COLORS.success : moVal === 0 ? COLORS.error : COLORS.primary;
          return (
            <Box className="reveal-up-sm" style={inner(5)} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap', rowGap: '6px', pt: '4px' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {item.path ? <PathPreviewIcons path={item.path} previewEnabled /> : null}
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 10, lineHeight: 1, color: COLORS.gray600, fontWeight: 600, ml: 'auto' }}>
                <Box component="span" sx={{ color: COLORS.gray500, letterSpacing: '0.04em' }}>PC</Box>
                <Box component="span" sx={{ color: pcColor, fontWeight: 700 }}>{pcVal}%</Box>
                <Box component="span" sx={{ color: COLORS.gray400 }}>·</Box>
                <Box component="span" sx={{ color: COLORS.gray500, letterSpacing: '0.04em' }}>MO</Box>
                <Box component="span" sx={{ color: moColor, fontWeight: 700 }}>{moVal}%</Box>
              </Box>
            </Box>
          );
        })()}
      </Box>
    </Card>
  );
}

interface Props {
  section: TableSection;
  sectionIndex: number;
  latestDate: string;
  onHeaderClick?: () => void;
  /** DataGrid의 "미리보기" 컬럼 토글 — 모바일 분기는 SectionTableMobile로 이동했음. */
  previewEnabled?: boolean;
  viewMode?: 'list' | 'thumbnail';
  thumbnailDevice?: DeviceKey;
  thumbnailCols?: 2 | 3 | 4 | 5;
  bookmarks?: Set<string>;
  onToggleBookmark?: (id: string) => void;
  /** 선택 모드 — true면 체크박스 컬럼/카드 토글 노출. */
  selectMode?: boolean;
  selected?: Set<string>;
  onToggleSelect?: (id: string) => void;
  /** Shift+Click 범위 선택 — anchor부터 target까지의 id를 일괄 추가. */
  onRangeSelect?: (orderedIds: string[], target: string) => void;
  /** 썸네일 카드의 전체화면 버튼 클릭 핸들러. */
  onOpenFullscreen?: (item: TableItem) => void;
  /** 노트 편집 시작 — id로 항목을 찾아 다이얼로그 오픈. */
  onEditNote?: (item: TableItem) => void;
}

const emphasisSx = { fontWeight: 700, color: '#ff706e' };

/**
 * 데스크탑(md+) 전용 섹션 테이블. 리스트(DataGrid) 또는 썸네일 그리드 두 가지 viewMode를 지원.
 * 모바일 분기(`display: { xs: ..., md: 'none' }`)는 SectionTableMobile로 분리되어 있다.
 */
export default function SectionTable({ section, sectionIndex, latestDate, onHeaderClick, previewEnabled = true, viewMode = 'list', thumbnailDevice = 'pc', thumbnailCols = 3, bookmarks = new Set(), onToggleBookmark, selectMode = false, selected = new Set(), onToggleSelect, onRangeSelect, onOpenFullscreen, onEditNote }: Props) {
  const { palette } = useTheme();
  const mode = palette.mode;
  const rows = useMemo(
    () => section.data.map((item, j) => ({ ...item, _rowId: j, _no: j + 1 })),
    [section.data]
  );

  const columns = useMemo<GridColDef[]>(() => {
    // 현재 섹션의 id 순서 (Shift+Click 범위 계산용)
    const sectionIds = section.data.map((d) => d.id);
    const selectCol: GridColDef = {
      field: '_select',
      headerName: '',
      width: 44,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      renderCell: (params) => {
        const id = (params.row as { id: string }).id;
        const checked = selected.has(id);
        return (
          <Checkbox
            checked={checked}
            onClick={(e) => {
              e.stopPropagation();
              if (e.shiftKey && onRangeSelect) {
                e.preventDefault();
                onRangeSelect(sectionIds, id);
              } else {
                onToggleSelect?.(id);
              }
            }}
            size="small"
            slotProps={{ input: { 'aria-label': `${id} 선택 (Shift+Click 범위)` } }}
            sx={{ p: '4px' }}
          />
        );
      },
    };

    const cols: GridColDef[] = [
    {
      field: '_no',
      headerName: 'No',
      width: 55,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
    },
    {
      field: 'pageTitle',
      headerName: '페이지제목',
      width: 160,
    },
    {
      field: 'id',
      headerName: 'ID',
      width: 200,
      sortable: false,
      renderCell: (params) => {
        const id = params.value as string;
        const row = params.row as { depth1?: string; depth2?: string; depth3?: string };
        const depthPath = [row.depth1, row.depth2, row.depth3].filter(Boolean).join(' > ');
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%', py: '4px', minWidth: 0 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'text.primary', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {id}
            </Typography>
            {depthPath && (
              <Typography sx={{ fontSize: 10.5, color: 'text.secondary', lineHeight: 1.3, mt: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={depthPath}>
                {depthPath}
              </Typography>
            )}
          </Box>
        );
      },
    },
    {
      field: 'path',
      headerName: '경로',
      flex: 1,
      minWidth: 150,
      sortable: false,
      renderCell: (params) => {
        if (!params.value) return null;
        let p = params.value as string;
        try { p = new URL(p).pathname; } catch { /* relative path */ }
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: '8px' }}>
            <Box
              component="a"
              href={params.value as string}
              target="_blank"
              rel="noreferrer"
              sx={{ flex: 1, wordBreak: 'break-all', color: 'inherit', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
            >
              {p}
            </Box>
            <CopyPathButton path={params.value as string} />
          </Box>
        );
      }
    },
    {
      field: '_preview',
      headerName: '미리보기',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      renderCell: (params) =>
        params.row.path ? <PathPreviewIcons path={params.row.path} previewEnabled={previewEnabled} /> : null,
    },
    {
      field: 'progressPc',
      headerName: '진행도',
      width: 130,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      renderCell: (params) => {
        const row = params.row as { progressPc?: number; progressMobile?: number };
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '4px', width: '100%', py: '4px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Typography sx={{ fontSize: 9, fontWeight: 700, color: 'text.secondary', letterSpacing: '0.04em', width: 16, textAlign: 'right' }}>PC</Typography>
              <ProgressBar value={(row.progressPc ?? 0) as never} />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Typography sx={{ fontSize: 9, fontWeight: 700, color: 'text.secondary', letterSpacing: '0.04em', width: 16, textAlign: 'right' }}>MO</Typography>
              <ProgressBar value={(row.progressMobile ?? 0) as never} />
            </Box>
          </Box>
        );
      },
    },
    {
      field: 'start',
      headerName: '생성일',
      width: 110,
      cellClassName: (params) => params.value === latestDate ? 'cell-emphasis' : '',
    },
    {
      field: 'updatedAt',
      headerName: '최근 업데이트',
      width: 130,
      cellClassName: (params) => params.value === latestDate ? 'cell-emphasis' : '',
    },
    {
      field: 'end',
      headerName: '완료일',
      width: 110,
      cellClassName: (params) => params.value === latestDate ? 'cell-emphasis' : '',
    },
    {
      field: 'note',
      headerName: '비고',
      width: 60,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      renderCell: (params) => {
        const note = (params.value as string) ?? '';
        const item = params.row as TableItem;
        const hasNote = !!note.trim();
        // 노트가 있으면 호버 시 미리보기 + 클릭 시 편집, 없으면 클릭 시 추가
        const icon = (
          <Box
            onClick={(e) => {
              e.stopPropagation();
              onEditNote?.(item);
            }}
            sx={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 28, height: 28, borderRadius: '8px',
              color: hasNote ? 'text.secondary' : 'text.disabled',
              transition: 'background-color 0.15s, color 0.15s',
              cursor: onEditNote ? 'pointer' : (hasNote ? 'help' : 'default'),
              '&:hover': onEditNote ? { bgcolor: 'rgb(var(--palette-primary-mainChannel) / 0.12)', color: 'primary.main' } : {},
            }}
            role={onEditNote ? 'button' : undefined}
            aria-label={onEditNote ? (hasNote ? '노트 편집' : '노트 추가') : undefined}
            tabIndex={onEditNote ? 0 : undefined}
            onKeyDown={onEditNote ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onEditNote(item); } } : undefined}
          >
            <StickyNote2OutlinedIcon sx={{ fontSize: 16, opacity: hasNote ? 1 : 0.4 }} />
          </Box>
        );
        if (!hasNote) return icon;
        return (
          <Tooltip
            title={
              <Box sx={{ fontSize: 12, whiteSpace: 'pre-wrap', lineHeight: 1.5, maxWidth: 280 }}>
                {note}
              </Box>
            }
            placement="top"
            arrow
            slotProps={{ tooltip: { sx: { bgcolor: 'rgb(33,33,33)', '& .MuiTooltip-arrow': { color: 'rgb(33,33,33)' } } } }}
          >
            {icon}
          </Tooltip>
        );
      },
    },
    ];
    return selectMode ? [selectCol, ...cols] : cols;
  }, [latestDate, previewEnabled, selectMode, selected, onToggleSelect, onEditNote, onRangeSelect, section.data]);

  return (
    <Paper
      id={`section-${sectionIndex}`}
      elevation={0}
      sx={{
        ...glassPanelSx,
        overflow: 'hidden',
        boxShadow: cardShadow(mode),
        display: 'flex',
        flexDirection: 'column',
        transition: 'box-shadow 0.28s ease',
      }}
      className="index-section"
    >
      <Typography
        component="h2"
        onClick={onHeaderClick}
        sx={{
          m: 0,
          py: '16px',
          px: '24px',
          fontSize: 16,
          lineHeight: 1.4,
          color: COLORS.gray900,
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        {section.depth1} ({section.data.length})
      </Typography>

      {/* 리스트형 — DataGrid */}
      <Box sx={{ display: viewMode === 'list' ? 'block' : 'none', width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(row) => row._rowId}
          autoHeight
          disableRowSelectionOnClick
          disableColumnMenu
          hideFooter
          rowHeight={60}
          columnHeaderHeight={48}
          sx={{
            border: 'none',
            borderRadius: 0,
            fontSize: 13,
            '& .MuiDataGrid-columnHeaders': {
              borderBottom: '1px solid #ccc',
            },
            '& .MuiDataGrid-columnHeader': {
              bgcolor: 'rgba(255, 255, 255, 0.5)',
              fontWeight: 600,
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.6)' },
            },
            '& .MuiDataGrid-sortIcon': { opacity: 1 },
            '& .MuiDataGrid-columnSeparator': { display: 'none' },
            '& .MuiDataGrid-row': { borderBottom: '1px solid #eee' },
            '& .MuiDataGrid-row:last-child': { borderBottom: 'none' },
            '& .MuiDataGrid-row:nth-of-type(even)': { bgcolor: 'rgba(255, 255, 255, 0.2)' },
            '& .MuiDataGrid-row:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.5) !important',
            },
            '& .MuiDataGrid-cell': {
              borderBottom: 'none',
              display: 'flex',
              alignItems: 'center',
            },
            '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': {
              outline: 'none',
            },
            '& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within': {
              outline: 'none',
            },
            '& .cell-emphasis': emphasisSx,
            // 호버 시에만 스크롤바 노출
            '& .MuiDataGrid-virtualScroller, & .MuiDataGrid-scrollbar': {
              scrollbarWidth: 'none',
              '&::-webkit-scrollbar': { width: 0, height: 0, background: 'transparent' },
              '&::-webkit-scrollbar-thumb': { background: 'transparent' },
            },
            '&:hover .MuiDataGrid-virtualScroller, &:hover .MuiDataGrid-scrollbar': {
              scrollbarWidth: 'thin',
              '&::-webkit-scrollbar': { width: 8, height: 8 },
              '&::-webkit-scrollbar-thumb': { background: 'rgba(0,0,0,0.25)', borderRadius: 4 },
              '&::-webkit-scrollbar-thumb:hover': { background: 'rgba(0,0,0,0.4)' },
              '&::-webkit-scrollbar-track': { background: 'transparent' },
            },
          }}
        />
      </Box>

      {/* 썸네일 그리드 — 사용자가 한 줄당 카드 수를 선택 */}
      <Box sx={{
        display: viewMode === 'thumbnail' ? 'grid' : 'none',
        gridTemplateColumns: `repeat(${thumbnailCols}, 1fr)`,
        gap: '18px',
        p: '18px',
      }}>
        {section.data.map((item, j) => (
          <RecipeCard
            key={j}
            item={item}
            section={section}
            sectionIndex={sectionIndex}
            isBookmarked={bookmarks.has(item.id)}
            onToggleBookmark={onToggleBookmark}
            latestDate={latestDate}
            cardIndex={j}
            device={thumbnailDevice}
            selectMode={selectMode}
            isSelected={selected.has(item.id)}
            onToggleSelect={onToggleSelect}
            onOpenFullscreen={onOpenFullscreen}
          />
        ))}
      </Box>

    </Paper>
  );
}
