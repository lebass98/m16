import { useMemo, useState } from 'react';
import { Paper, Box, Typography, Card, IconButton } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import DesktopWindowsOutlinedIcon from '@mui/icons-material/DesktopWindowsOutlined';
import TabletMacOutlinedIcon from '@mui/icons-material/TabletMacOutlined';
import SmartphoneOutlinedIcon from '@mui/icons-material/SmartphoneOutlined';
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
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

function RecipeCard({ item, section, sectionIndex, isBookmarked, onToggleBookmark, latestDate, cardIndex = 0 }: {
  item: TableItem;
  section: TableSection;
  sectionIndex: number;
  isBookmarked: boolean;
  onToggleBookmark?: (id: string) => void;
  latestDate: string;
  cardIndex?: number;
}) {
  const baseDelay = Math.min(cardIndex, 16) * 55;
  const inner = (k: number) => ({ animationDelay: `${baseDelay + 120 + k * 60}ms` });
  const [device, setDevice] = useState<DeviceKey>('pc');
  const isLatest = !!item.updatedAt && item.updatedAt === latestDate;
  const accent = getStatusColor(item.progressPc ?? 0, isLatest);
  const tags = [item.depth1, item.depth2, item.depth3].filter(Boolean);
  const dims = DEVICE_DIMS[device];
  void sectionIndex;

  const deviceBtn = (key: DeviceKey, Icon: typeof DesktopWindowsOutlinedIcon, label: string) => (
    <Box
      component="button"
      type="button"
      onMouseEnter={() => setDevice(key)}
      onFocus={() => setDevice(key)}
      onClick={() => setDevice(key)}
      title={label}
      sx={(theme) => ({
        border: 'none', cursor: 'pointer', fontFamily: 'inherit',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 30, height: 30, borderRadius: '8px',
        bgcolor: device === key ? alpha(theme.palette.primary.main, 0.12) : 'transparent',
        color: device === key ? 'primary.main' : 'text.secondary',
        transition: 'background 0.2s, color 0.2s',
        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08), color: 'primary.main' },
      })}
    >
      <Icon sx={{ fontSize: 16 }} />
    </Box>
  );

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
        border: 'none',
        boxShadow: MINIMALS_SHADOW,
        color: COLORS.gray900,
        transition: 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.25s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: MINIMALS_SHADOW_HOVER,
          zIndex: 2,
        },
      }}>
      {/* 썸네일 (디바이스별 프리뷰) */}
      <Box className="reveal-scale" style={inner(0)} sx={{ position: 'relative', aspectRatio: device === 'mobile' ? '4 / 3' : '16 / 10', overflow: 'hidden', bgcolor: COLORS.gray100 }}>
        {item.path ? (
          <>
            <Box sx={{ position: 'absolute', inset: device === 'pc' ? 0 : '12px', borderRadius: device === 'pc' ? 0 : '12px', overflow: 'hidden', transition: 'inset 0.25s ease, max-width 0.25s ease', maxWidth: device === 'mobile' ? 220 : device === 'tablet' ? '70%' : 'none', marginLeft: 'auto', marginRight: 'auto', boxShadow: device === 'pc' ? 'none' : '0 8px 16px -4px rgb(var(--palette-grey-500Channel) / 0.16)' }}>
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
          <Typography sx={{ fontSize: 17, fontWeight: 700, color: COLORS.gray900, lineHeight: 1.4, wordBreak: 'keep-all', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', letterSpacing: '-0.01em' }} title={item.pageTitle || item.id}>
            {item.pageTitle || item.id}
          </Typography>
        </Box>

        {/* 진행도: PC / MO 두 줄로 분리, 라벨 좌측 */}
        <Box className="reveal-up-sm" style={inner(2)} sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {(['pc', 'mo'] as const).map((kind) => {
            const value = kind === 'pc' ? (item.progressPc ?? 0) : (item.progressMobile ?? 0);
            const color = value >= 100 ? COLORS.success : value === 0 ? COLORS.error : COLORS.primary;
            return (
              <Box key={kind} sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Typography sx={{ fontSize: 10, color: COLORS.gray600, fontWeight: 700, letterSpacing: '0.06em', flexShrink: 0, width: 22, textTransform: 'uppercase' }}>{kind}</Typography>
                <Box sx={{ flex: 1, height: 6, bgcolor: COLORS.gray100, borderRadius: 3, overflow: 'hidden' }}>
                  <Box sx={{ width: `${value}%`, height: '100%', bgcolor: color, borderRadius: 3, transition: 'width 0.3s ease' }} />
                </Box>
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: COLORS.gray900, lineHeight: 1, flexShrink: 0, minWidth: 36, textAlign: 'right' }}>{value}%</Typography>
              </Box>
            );
          })}
        </Box>
        {item.updatedAt && (
          <Typography className="reveal-up-sm" style={inner(3)} sx={{ fontSize: 11, color: COLORS.gray500, lineHeight: 1, mt: '-6px' }}>업뎃 {item.updatedAt}</Typography>
        )}

        {/* 태그 chips */}
        {tags.length > 0 && (
          <Box className="reveal-up-sm" style={inner(4)} sx={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {tags.map((tag, ti) => (
              <Box key={ti} sx={{ bgcolor: 'rgb(var(--palette-grey-500Channel) / 0.08)', px: '8px', py: '3px', borderRadius: '6px', fontSize: 11, color: COLORS.gray700, lineHeight: 1.4, fontWeight: 600 }}>
                {tag}
              </Box>
            ))}
          </Box>
        )}

        {/* 디바이스 토글 + Start cooking 버튼 */}
        <Box className="reveal-up-sm" style={inner(5)} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', pt: '4px' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {deviceBtn('pc', DesktopWindowsOutlinedIcon, 'PC 미리보기')}
            {deviceBtn('tablet', TabletMacOutlinedIcon, '태블릿 미리보기')}
            {deviceBtn('mobile', SmartphoneOutlinedIcon, '모바일 미리보기')}
          </Box>
          <Box
            component={item.path ? 'a' : 'button'}
            href={item.path || undefined}
            target={item.path ? '_blank' : undefined}
            rel={item.path ? 'noreferrer' : undefined}
            sx={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              bgcolor: '#111', color: 'background.paper', textDecoration: 'none',
              border: 'none', cursor: item.path ? 'pointer' : 'not-allowed',
              opacity: item.path ? 1 : 0.4, fontFamily: 'inherit',
              fontSize: 13, fontWeight: 700,
              px: '16px', py: '9px', borderRadius: '999px',
              lineHeight: 1, transition: 'transform 0.15s, box-shadow 0.15s, background 0.2s',
              '&:hover': {
                bgcolor: item.path ? '#333' : '#111',
                transform: item.path ? 'translateY(-1px)' : 'none',
                boxShadow: item.path ? '0 6px 14px rgba(0,0,0,0.18)' : 'none',
              },
            }}
          >
            Start cooking
            <ArrowOutwardIcon sx={{ fontSize: 14 }} />
          </Box>
        </Box>
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
  bookmarks?: Set<string>;
  onToggleBookmark?: (id: string) => void;
}

const emphasisSx = { fontWeight: 700, color: '#ff706e' };

export default function SectionTable({ section, sectionIndex, latestDate, onHeaderClick, hideUi = false, previewEnabled = true, viewMode = 'list', bookmarks = new Set(), onToggleBookmark }: Props) {
  const hasDepth1 = section.data.some(item => item.depth1);
  const hasDepth2 = section.data.some(item => item.depth2);
  const hasDepth3 = section.data.some(item => item.depth3);

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
      width: 120,
      align: 'center',
      headerAlign: 'center',
    },
    ...(hasDepth1 ? [{
      field: 'depth1',
      headerName: 'depth1',
      width: 120,
      align: 'center' as const,
      headerAlign: 'center' as const,
    }] : []),
    ...(hasDepth2 ? [{
      field: 'depth2',
      headerName: 'depth2',
      width: 120,
      align: 'center' as const,
      headerAlign: 'center' as const,
    }] : []),
    ...(hasDepth3 ? [{
      field: 'depth3',
      headerName: 'depth3',
      width: 120,
      align: 'center' as const,
      headerAlign: 'center' as const,
    }] : []),
    {
      field: 'path',
      headerName: '경로',
      flex: 1,
      minWidth: 150,
      sortable: false,
      renderCell: (params) => {
        if (!params.value) return null;
        let p = params.value as string;
        try { p = new URL(p).pathname; } catch {}
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
      headerName: 'PC 진행도',
      width: 90,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => <ProgressBar value={params.value} />,
    },
    {
      field: 'progressMobile',
      headerName: 'MO 진행도',
      width: 90,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => <ProgressBar value={params.value} />,
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
      width: 130,
    },
  ], [hasDepth1, hasDepth2, hasDepth3, latestDate, previewEnabled]);

  return (
    <Paper
      id={`section-${sectionIndex}`}
      elevation={0}
      sx={{
        borderRadius: '16px',
        overflow: 'hidden',
        bgcolor: 'background.paper',
        border: 'none',
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
          rowHeight={48}
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

      {/* 데스크탑: 썸네일 그리드 (다크 레시피 카드) */}
      <Box sx={{
        display: { xs: 'none', md: viewMode === 'thumbnail' ? 'grid' : 'none' },
        gridTemplateColumns: { md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
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
                  ].filter(Boolean).map((chip: any, k, arr) => (
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
