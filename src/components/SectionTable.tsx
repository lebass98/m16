import { useMemo } from 'react';
import { Paper, Box, Typography, Card } from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import type { TableSection } from '../types';
import ProgressBar from './ProgressBar';
import PathPreviewIcons from './PathPreviewIcons';
import PreviewFrame from './PreviewFrame';

interface Props {
  section: TableSection;
  sectionIndex: number;
  latestDate: string;
  onHeaderClick?: () => void;
  hideUi?: boolean;
  previewEnabled?: boolean;
}

const emphasisSx = { fontWeight: 700, color: '#ff706e' };

export default function SectionTable({ section, sectionIndex, latestDate, onHeaderClick, hideUi = false, previewEnabled = true }: Props) {
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
      minWidth: 200,
      sortable: false,
      renderCell: (params) =>
        params.value ? <PathPreviewIcons path={params.value} previewEnabled={previewEnabled} /> : null,
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
        borderRadius: '12px', 
        overflow: 'hidden', 
        bgcolor: 'rgba(255, 255, 255, 0.45)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.6)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        display: 'flex',
        flexDirection: 'column',
        flex: { xs: previewEnabled ? 1 : 'none', md: 'none' }
      }}
      className="index-section"
    >
      <Typography
        component="h2"
        onClick={onHeaderClick}
        sx={{
          m: 0,
          py: '12px',
          px: '15px',
          fontSize: 16,
          lineHeight: '15px',
          color: '#fff',
          bgcolor: 'rgba(51, 51, 51, 0.8)',
          backdropFilter: 'blur(8px)',
          fontWeight: 500,
          textAlign: 'center',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '6px',
          cursor: { xs: 'pointer', md: 'default' }
        }}
      >
        {section.depth1} ({section.data.length})
        <Box component="span" sx={{ display: { xs: 'inline-block', md: 'none' }, fontSize: 12, opacity: 0.7 }}>▼</Box>
      </Typography>

      {/* 데스크탑: DataGrid */}
      <Box sx={{ display: { xs: 'none', md: 'block' }, width: '100%' }}>
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
          }}
        />
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
              <Box sx={{ flexShrink: 0, width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#333', color: '#fff', borderRadius: '50%', fontSize: 11, fontWeight: 700 }}>
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
                    <Box sx={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                      <Typography sx={{ flexShrink: 0, mr: '10px', color: '#888', fontSize: 12 }}>ID</Typography>
                      <Typography sx={{ flex: 1, color: '#222', wordBreak: 'break-all', fontSize: 13 }}>{item.id}</Typography>
                    </Box>
                  )}
                  {(item.depth1 || item.depth2 || item.depth3) && (
                    <Box sx={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                      <Typography sx={{ flexShrink: 0, mr: '10px', color: '#888', fontSize: 12 }}>메뉴</Typography>
                      <Typography sx={{ flex: 1, color: '#222', wordBreak: 'break-all', fontSize: 13 }}>
                        {[item.depth1, item.depth2, item.depth3].filter(Boolean).join(' > ')}
                      </Typography>
                    </Box>
                  )}
                  {item.path && (
                    <Box sx={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                      <Typography sx={{ flexShrink: 0, mr: '10px', color: '#888', fontSize: 12 }}>경로</Typography>
                      <Box component="a" href={item.path} target="_blank" rel="noreferrer" sx={{ flex: 1, color: '#066cb3', textDecoration: 'none', wordBreak: 'break-all', fontSize: 13 }}>
                        {(() => { try { return new URL(item.path).pathname; } catch { return item.path; } })()}
                      </Box>
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
                    <Box sx={{ display: 'flex', gap: '6px', alignItems: 'flex-start', mt: '2px' }}>
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
