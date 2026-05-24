import { useMemo } from 'react';
import { Paper, Box, Typography, Card, IconButton, Tooltip } from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import StickyNote2OutlinedIcon from '@mui/icons-material/StickyNote2Outlined';
import type { TableItem, TableSection } from '../types';
import ProgressBar from './ProgressBar';
import PathPreviewIcons, { CopyPathButton } from './PathPreviewIcons';
import PreviewFrame from './PreviewFrame';

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

const MINIMALS_SHADOW = '0 0 2px 0 rgba(145, 158, 171, 0.20), 0 12px 24px -4px rgba(145, 158, 171, 0.12)';
const MINIMALS_SHADOW_HOVER = '0 0 2px 0 rgba(145, 158, 171, 0.20), 0 24px 48px -8px rgba(145, 158, 171, 0.20)';

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

function RecipeCard({ item, section, sectionIndex, isBookmarked, onToggleBookmark, latestDate, cardIndex = 0, device = 'pc' }: {
  item: TableItem;
  section: TableSection;
  sectionIndex: number;
  isBookmarked: boolean;
  onToggleBookmark?: (id: string) => void;
  latestDate: string;
  cardIndex?: number;
  /** 부모(상단 토글)에서 일괄 제어하는 미리보기 디바이스 */
  device?: DeviceKey;
}) {
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
        borderRadius: '16px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        border: '1px solid rgba(255,255,255,0.18)',
        boxShadow: MINIMALS_SHADOW,
        color: COLORS.gray900,
        transition: 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.25s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: MINIMALS_SHADOW_HOVER,
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
            {/* 날짜 pill + 북마크 오버레이 */}
            <Box sx={{ position: 'absolute', top: 12, left: 12, right: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 3 }}>
              <Box sx={{ bgcolor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', color: COLORS.gray900, px: '10px', py: '4px', borderRadius: '8px', fontSize: 11, fontWeight: 600, lineHeight: 1.4 }}>
                {item.start || '날짜 미정'}
              </Box>
              <IconButton
                size="small"
                onClick={(e) => { e.stopPropagation(); onToggleBookmark?.(item.id); }}
                sx={{ bgcolor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', width: 32, height: 32, '&:hover': { bgcolor: 'background.paper' } }}
              >
                {isBookmarked
                  ? <BookmarkIcon sx={{ fontSize: 16, color: COLORS.primary }} />
                  : <BookmarkBorderIcon sx={{ fontSize: 16, color: COLORS.gray700 }} />}
              </IconButton>
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
        <Box className="reveal-up-sm" style={inner(1)}>
          <Typography sx={{ fontSize: 11, color: COLORS.gray600, fontWeight: 700, lineHeight: 1.2, mb: '6px', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Box component="span" sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: accent, display: 'inline-block' }} />
            {section.depth1}
          </Typography>
          <Typography sx={{ fontSize: 17, fontWeight: 700, color: COLORS.gray900, lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.01em' }} title={item.pageTitle || item.id}>
            {item.pageTitle || item.id}
          </Typography>
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

        {/* 디바이스 토글 + 작은 PC/MO % (Row 1) + 파일 보기 (Row 2, full width) */}
        {(() => {
          const pcVal = item.progressPc ?? 0;
          const moVal = item.progressMobile ?? 0;
          const pcColor = pcVal >= 100 ? COLORS.success : pcVal === 0 ? COLORS.error : COLORS.primary;
          const moColor = moVal >= 100 ? COLORS.success : moVal === 0 ? COLORS.error : COLORS.primary;
          return (
            <Box className="reveal-up-sm" style={inner(5)} sx={{ display: 'flex', flexDirection: 'column', gap: '10px', pt: '4px' }}>
              {/* Row 1: 디바이스 토글 (좌) + PC/MO % (우) */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap', rowGap: '6px' }}>
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

              {/* Row 2: 파일 보기 — 풀-폭 CTA */}
              <Box
                component={item.path ? 'a' : 'button'}
                href={item.path || undefined}
                target={item.path ? '_blank' : undefined}
                rel={item.path ? 'noreferrer' : undefined}
                sx={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  width: '100%',
                  bgcolor: '#111', color: 'background.paper', textDecoration: 'none',
                  border: 'none', cursor: item.path ? 'pointer' : 'not-allowed',
                  opacity: item.path ? 1 : 0.4, fontFamily: 'inherit',
                  fontSize: 13, fontWeight: 700,
                  px: '16px', py: '10px', borderRadius: '12px',
                  lineHeight: 1, transition: 'transform 0.15s, box-shadow 0.15s, background 0.2s',
                  '&:hover': {
                    bgcolor: item.path ? '#333' : '#111',
                    transform: item.path ? 'translateY(-1px)' : 'none',
                    boxShadow: item.path ? '0 6px 14px rgba(0,0,0,0.18)' : 'none',
                  },
                }}
              >
                파일 보기
                <ArrowOutwardIcon sx={{ fontSize: 14 }} />
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
  hideUi?: boolean;
  previewEnabled?: boolean;
  viewMode?: 'list' | 'thumbnail';
  thumbnailDevice?: DeviceKey;
  thumbnailCols?: 2 | 3 | 4 | 5;
  bookmarks?: Set<string>;
  onToggleBookmark?: (id: string) => void;
}

const emphasisSx = { fontWeight: 700, color: '#ff706e' };

export default function SectionTable({ section, sectionIndex, latestDate, onHeaderClick, hideUi = false, previewEnabled = true, viewMode = 'list', thumbnailDevice = 'pc', thumbnailCols = 3, bookmarks = new Set(), onToggleBookmark }: Props) {
  const rows = useMemo(
    () => section.data.map((item, j) => ({ ...item, _rowId: j, _no: j + 1 })),
    [section.data]
  );

  const columns = useMemo<GridColDef[]>(() => [
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
        if (!note.trim()) return null;
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
            <Box sx={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 28, height: 28, borderRadius: '8px',
              color: 'text.secondary',
              transition: 'background-color 0.15s, color 0.15s',
              cursor: 'help',
              '&:hover': { bgcolor: 'rgb(var(--palette-primary-mainChannel) / 0.12)', color: 'primary.main' },
            }}>
              <StickyNote2OutlinedIcon sx={{ fontSize: 16 }} />
            </Box>
          </Tooltip>
        );
      },
    },
  ], [latestDate, previewEnabled]);

  return (
    <Paper
      id={`section-${sectionIndex}`}
      elevation={0}
      sx={{
        borderRadius: '16px',
        overflow: 'hidden',
        bgcolor: 'background.paper',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        border: '1px solid rgba(255,255,255,0.18)',
        boxShadow: { xs: '0 8px 32px 0 rgba(31, 38, 135, 0.07)', md: MINIMALS_SHADOW },
        display: 'flex',
        flexDirection: 'column',
        flex: { xs: previewEnabled ? 1 : 'none', md: 'none' },
        transition: 'box-shadow 0.28s ease',
      }}
      className="index-section"
    >
      <Typography
        component="h2"
        onClick={onHeaderClick}
        sx={{
          m: 0,
          py: { xs: '12px', md: '16px' },
          px: { xs: '15px', md: '24px' },
          fontSize: { xs: 16, md: 16 },
          lineHeight: { xs: '15px', md: 1.4 },
          color: { xs: 'background.paper', md: COLORS.gray900 },
          bgcolor: { xs: 'rgba(51, 51, 51, 0.8)', md: 'transparent' },
          backdropFilter: { xs: 'blur(8px)', md: 'none' },
          fontWeight: { xs: 500, md: 700 },
          textAlign: { xs: 'center', md: 'left' },
          display: 'flex',
          justifyContent: { xs: 'center', md: 'flex-start' },
          alignItems: 'center',
          gap: '6px',
          cursor: { xs: 'pointer', md: 'default' }
        }}
      >
        {section.depth1} ({section.data.length})
        <Box component="span" sx={{ display: { xs: 'inline-block', md: 'none' }, fontSize: 12, opacity: 0.7 }}>▼</Box>
      </Typography>

      {/* 데스크탑: DataGrid (리스트형) */}
      <Box sx={{ display: { xs: 'none', md: viewMode === 'list' ? 'block' : 'none' }, width: '100%' }}>
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

      {/* 데스크탑: 썸네일 그리드 (사용자가 한 줄당 카드 수를 선택) */}
      <Box sx={{
        display: { xs: 'none', md: viewMode === 'thumbnail' ? 'grid' : 'none' },
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
          />
        ))}
      </Box>

      {/* 모바일: 카드 */}
      <Box sx={{
        display: { xs: 'flex', md: 'none' },
        flexDirection: previewEnabled ? 'row' : 'column',
        gap: '12px',
        p: '12px',
        overflowX: previewEnabled ? 'auto' : 'visible',
        overflowY: previewEnabled ? 'hidden' : 'visible',
        scrollSnapType: previewEnabled ? 'x mandatory' : 'none',
        '&::-webkit-scrollbar': { display: 'none' },
        scrollbarWidth: 'none',
        flex: previewEnabled ? 1 : 'none',
      }}>
        {section.data.map((item, j) => (
          <Card key={j} variant="outlined" sx={{
            borderRadius: '16px',
            overflow: 'hidden',
            flexShrink: 0,
            width: '100%',
            height: previewEnabled ? '100%' : 'auto',
            minHeight: 0,
            scrollSnapAlign: previewEnabled ? 'start' : 'none',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'rgba(255, 255, 255, 0.45)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.6)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', p: '8px 12px', bgcolor: 'rgba(255, 255, 255, 0.4)', borderBottom: '1px solid rgba(255, 255, 255, 0.5)', flexShrink: 0 }}>
              <Box sx={{ flexShrink: 0, width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#333', color: 'background.paper', borderRadius: '50%', fontSize: 11, fontWeight: 700 }}>
                {j + 1}
              </Box>
              <Typography sx={{ flex: 1, fontSize: 14, fontWeight: 600, color: '#111', wordBreak: 'break-all' }}>
                {item.pageTitle || item.id}
              </Typography>
              <Box sx={{ display: 'flex', gap: '8px' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                  <Typography sx={{ fontSize: 10, color: '#666', lineHeight: 1 }}>PC</Typography>
                  <ProgressBar value={item.progressPc} />
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                  <Typography sx={{ fontSize: 10, color: '#666', lineHeight: 1 }}>MO</Typography>
                  <ProgressBar value={item.progressMobile} />
                </Box>
              </Box>
            </Box>

            {previewEnabled && (
              <Box sx={{ flex: 1, position: 'relative', overflow: 'hidden', bgcolor: 'transparent' }}>
                {item.path ? (
                  <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                    <PreviewFrame src={item.path} displayWidth="100%" fillHeight speed={2} iframeWidth={375} iframeHeight={667} allowScroll />
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999', fontSize: 13 }}>
                    미리보기 없음
                  </Box>
                )}
              </Box>
            )}

            <Box sx={{
              flexShrink: 0,
              bgcolor: 'rgba(255, 255, 255, 0.4)',
              borderTop: hideUi ? 'none' : '1px solid rgba(255, 255, 255, 0.5)',
              transition: 'all 0.3s ease-in-out',
              maxHeight: hideUi ? 0 : 400,
              opacity: hideUi ? 0 : 1,
              overflow: 'hidden',
            }}>
              {previewEnabled ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px', p: '10px 12px' }}>
                  {item.id && (
                    <Box sx={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <Typography sx={{ flexShrink: 0, mr: '10px', color: '#888', fontSize: 12 }}>ID</Typography>
                      <Typography sx={{ flex: 1, color: '#222', wordBreak: 'break-all', fontSize: 13 }}>{item.id}</Typography>
                    </Box>
                  )}
                  {(item.depth1 || item.depth2 || item.depth3) && (
                    <Box sx={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <Typography sx={{ flexShrink: 0, mr: '10px', color: '#888', fontSize: 12 }}>메뉴</Typography>
                      <Typography sx={{ flex: 1, color: '#222', wordBreak: 'break-all', fontSize: 13 }}>
                        {[item.depth1, item.depth2, item.depth3].filter(Boolean).join(' > ')}
                      </Typography>
                    </Box>
                  )}
                  {item.path && (
                    <Box sx={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <Typography sx={{ flexShrink: 0, mr: '10px', color: '#888', fontSize: 12 }}>경로</Typography>
                      <Box component="a" href={item.path} target="_blank" rel="noreferrer" sx={{ flex: 1, color: '#066cb3', textDecoration: 'none', wordBreak: 'break-all', fontSize: 13 }}>
                        {(() => { try { return new URL(item.path).pathname; } catch { return item.path; } })()}
                      </Box>
                      <CopyPathButton path={item.path} />
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px', pt: '2px' }}>
                    {item.start && (
                      <Box sx={{ display: 'flex', gap: '4px', alignItems: 'center', mr: 'auto' }}>
                        <Typography sx={{ flexShrink: 0, mr: '10px', color: '#888', fontSize: 12 }}>생성일</Typography>
                        <Typography sx={{ fontSize: 13, ...(item.start === latestDate ? emphasisSx : { color: '#222' }) }}>{item.start}</Typography>
                      </Box>
                    )}
                    {item.updatedAt && (
                      <Box sx={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <Typography sx={{ flexShrink: 0, mr: '10px', color: '#888', fontSize: 12 }}>업데이트</Typography>
                        <Typography sx={{ fontSize: 13, ...(item.updatedAt === latestDate ? emphasisSx : { color: '#222' }) }}>{item.updatedAt}</Typography>
                      </Box>
                    )}
                    {item.end && (
                      <Box sx={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <Typography sx={{ flexShrink: 0, mr: '10px', color: '#888', fontSize: 12 }}>완료일</Typography>
                        <Typography sx={{ fontSize: 13, ...(item.end === latestDate ? emphasisSx : { color: '#222' }) }}>{item.end}</Typography>
                      </Box>
                    )}
                  </Box>
                  {item.note && (
                    <Box sx={{ display: 'flex', gap: '6px', alignItems: 'center', mt: '2px' }}>
                      <Typography sx={{ flexShrink: 0, mr: '10px', color: '#888', fontSize: 12 }}>비고</Typography>
                      <Typography sx={{ flex: 1, color: '#222', wordBreak: 'break-all', fontSize: 13 }}>{item.note}</Typography>
                    </Box>
                  )}
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: '4px 6px', p: '8px 12px' }}>
                  {[
                    item.id && { label: 'ID', value: item.id, href: undefined, emphasis: false },
                    (item.depth1 || item.depth2 || item.depth3) && { label: '메뉴', value: [item.depth1, item.depth2, item.depth3].filter(Boolean).join(' > '), href: undefined, emphasis: false },
                    item.path && { label: '경로', value: (() => { try { return new URL(item.path!).pathname; } catch { return item.path!; } })(), href: item.path, emphasis: false },
                    item.start && { label: '생성일', value: item.start, href: undefined, emphasis: item.start === latestDate },
                    item.updatedAt && { label: '업데이트', value: item.updatedAt, href: undefined, emphasis: item.updatedAt === latestDate },
                    item.end && { label: '완료일', value: item.end, href: undefined, emphasis: item.end === latestDate },
                    item.note && { label: '비고', value: item.note, href: undefined, emphasis: false },
                  ].filter((c): c is { label: string; value: string; href: string | undefined; emphasis: boolean } => Boolean(c)).map((chip, k, arr) => (
                    <Box key={k} sx={{ display: 'flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
                      <Typography sx={{ color: '#999', fontSize: 11, whiteSpace: 'nowrap' }}>{chip.label}</Typography>
                      {chip.href ? (
                        <Box component="a" href={chip.href} target="_blank" rel="noreferrer" sx={{ color: '#066cb3', textDecoration: 'none', fontSize: 12, whiteSpace: 'nowrap' }}>{chip.value}</Box>
                      ) : (
                        <Typography sx={{ fontSize: 12, whiteSpace: 'nowrap', ...(chip.emphasis ? emphasisSx : { color: '#222' }) }}>{chip.value}</Typography>
                      )}
                      {k < arr.length - 1 && (
                        <Typography sx={{ color: '#ccc', fontSize: 11, ml: '3px' }}>|</Typography>
                      )}
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Card>
        ))}
      </Box>
    </Paper>
  );
}
