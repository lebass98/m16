import { useMemo } from 'react';
import { Paper, Box, Typography, Card, CardContent } from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import type { TableSection } from '../types';
import ProgressBar from './ProgressBar';
import PathPreviewIcons from './PathPreviewIcons';
import PreviewFrame from './PreviewFrame';

interface Props {
  section: TableSection;
  sectionIndex: number;
  latestDate: string;
}

const emphasisSx = { fontWeight: 700, color: '#ff706e' };

export default function SectionTable({ section, sectionIndex, latestDate }: Props) {
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
        params.value ? <PathPreviewIcons path={params.value} /> : null,
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
  ], [hasDepth1, hasDepth2, hasDepth3, latestDate]);

  return (
    <Paper
      id={`section-${sectionIndex}`}
      elevation={0}
      sx={{ borderRadius: '5px', overflow: 'hidden', bgcolor: '#fff' }}
      className="index-section"
    >
      <Typography
        component="h2"
        sx={{
          m: 0,
          py: '12px',
          px: '15px',
          fontSize: 16,
          lineHeight: '15px',
          color: '#fff',
          bgcolor: '#333',
          fontWeight: 500,
          textAlign: 'center',
          display: 'block',
        }}
      >
        {section.depth1} ({section.data.length})
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
          rowHeight={36}
          columnHeaderHeight={42}
          sx={{
            border: 'none',
            borderRadius: 0,
            fontSize: 13,
            '& .MuiDataGrid-columnHeader': {
              bgcolor: '#e8e8e8',
              fontWeight: 600,
              '&:hover': { bgcolor: '#d8d8d8' },
            },
            '& .MuiDataGrid-sortIcon': { opacity: 1 },
            '& .MuiDataGrid-columnSeparator': { display: 'none' },
            '& .MuiDataGrid-row:nth-of-type(even)': { bgcolor: '#f8f8f8' },
            '& .MuiDataGrid-row:hover': {
              bgcolor: '#f0f0f0 !important',
            },
            '& .MuiDataGrid-cell': {
              borderColor: '#e0e0e0',
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
      <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', gap: '8px', p: '10px' }}>
        {section.data.map((item, j) => (
          <Card key={j} variant="outlined" sx={{ borderRadius: '8px', overflow: 'hidden' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', p: '12px 14px', bgcolor: '#f4f4f4', borderBottom: '1px solid #e0e0e0' }}>
              <Box sx={{ flexShrink: 0, width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#333', color: '#fff', borderRadius: '50%', fontSize: 12, fontWeight: 700 }}>
                {j + 1}
              </Box>
              <Typography sx={{ flex: 1, fontSize: 16, fontWeight: 600, color: '#111', wordBreak: 'break-all' }}>
                {item.pageTitle || item.id}
              </Typography>
              <Box sx={{ display: 'flex', gap: '12px' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <Typography sx={{ fontSize: 11, color: '#666', lineHeight: 1 }}>PC</Typography>
                  <ProgressBar value={item.progressPc} />
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <Typography sx={{ fontSize: 11, color: '#666', lineHeight: 1 }}>MO</Typography>
                  <ProgressBar value={item.progressMobile} />
                </Box>
              </Box>
            </Box>
            <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
              <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', p: '12px 14px', minWidth: 0 }}>
                  {item.id && (
                    <Box sx={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                      <Typography sx={{ flexShrink: 0, width: 56, color: '#888', fontSize: 14, pt: '1px' }}>ID</Typography>
                      <Typography sx={{ flex: 1, color: '#222', wordBreak: 'break-all', fontSize: 16 }}>{item.id}</Typography>
                    </Box>
                  )}
                  {(item.depth1 || item.depth2 || item.depth3) && (
                    <Box sx={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                      <Typography sx={{ flexShrink: 0, width: 56, color: '#888', fontSize: 14, pt: '1px' }}>메뉴</Typography>
                      <Typography sx={{ flex: 1, color: '#222', wordBreak: 'break-all', fontSize: 16 }}>
                        {[item.depth1, item.depth2, item.depth3].filter(Boolean).join(' > ')}
                      </Typography>
                    </Box>
                  )}
                  {item.path && (
                    <Box sx={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                      <Typography sx={{ flexShrink: 0, width: 56, color: '#888', fontSize: 14, pt: '1px' }}>경로</Typography>
                      <Box component="a" href={item.path} target="_blank" rel="noreferrer" sx={{ flex: 1, color: '#066cb3', textDecoration: 'none', wordBreak: 'break-all', fontSize: 16 }}>
                        {(() => { try { return new URL(item.path).pathname; } catch { return item.path; } })()}
                      </Box>
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', pt: '4px' }}>
                    {item.start && (
                      <Box sx={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <Typography sx={{ flexShrink: 0, width: 56, color: '#888', fontSize: 14 }}>생성일</Typography>
                        <Typography sx={{ fontSize: 16, ...(item.start === latestDate ? emphasisSx : { color: '#222' }) }}>{item.start}</Typography>
                      </Box>
                    )}
                    {item.updatedAt && (
                      <Box sx={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <Typography sx={{ flexShrink: 0, width: 56, color: '#888', fontSize: 14 }}>업데이트</Typography>
                        <Typography sx={{ fontSize: 16, ...(item.updatedAt === latestDate ? emphasisSx : { color: '#222' }) }}>{item.updatedAt}</Typography>
                      </Box>
                    )}
                    {item.end && (
                      <Box sx={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <Typography sx={{ flexShrink: 0, width: 56, color: '#888', fontSize: 14 }}>완료일</Typography>
                        <Typography sx={{ fontSize: 16, ...(item.end === latestDate ? emphasisSx : { color: '#222' }) }}>{item.end}</Typography>
                      </Box>
                    )}
                  </Box>
                  {item.note && (
                    <Box sx={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                      <Typography sx={{ flexShrink: 0, width: 56, color: '#888', fontSize: 14, pt: '1px' }}>비고</Typography>
                      <Typography sx={{ flex: 1, color: '#222', wordBreak: 'break-all', fontSize: 16 }}>{item.note}</Typography>
                    </Box>
                  )}
                </Box>
                {item.path && (
                  <Box
                    component="a"
                    href={item.path}
                    target="_blank"
                    rel="noreferrer"
                    sx={{ flexShrink: 0, display: 'block', overflow: 'hidden', alignSelf: 'stretch', borderLeft: '1px solid #e0e0e0', borderRadius: '0 0 8px 0' }}
                  >
                    <PreviewFrame src={item.path} displayWidth={130} fillHeight speed={2} iframeWidth={375} iframeHeight={667} />
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Paper>
  );
}
