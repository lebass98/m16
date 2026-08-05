---
name: url-index-section-table
description: src/components/SectionTable.tsx 기반 스킬 가이드 - 데스크탑 DataGrid 표 보기 및 썸네일 그리드 스케일 모드 렌더링 스킬
---

# 📊 `src/components/SectionTable.tsx` 파일 스킬 가이드

`src/components/SectionTable.tsx`는 데스크탑 환경에서 페이지 목록을 `@mui/x-data-grid` 표 형식 또는 썸네일 카드 그리드로 렌더링하는 메인 컴포넌트입니다.

---

## 📌 주요 담당 파일
- **핵심 소스**: `src/components/SectionTable.tsx`
- **연동 컴포넌트**: `src/components/PreviewFrame.tsx`, `StatusBadge.tsx`, `ProgressBar.tsx`, `PathPreviewIcons.tsx`

---

## 💡 핵심 기능 및 컬럼 정의

### 1. DataGrid 컬럼 렌더러 예시
```tsx
const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 120 },
  { field: 'pageTitle', headerName: '페이지 제목', flex: 1, minWidth: 200 },
  { field: 'depth1', headerName: '1뎁스', width: 130 },
  { field: 'depth2', headerName: '2뎁스', width: 130 },
  { field: 'depth3', headerName: '3뎁스', width: 130 },
  {
    field: 'progressPc',
    headerName: 'PC 진행율',
    width: 140,
    renderCell: (params) => <ProgressBar value={params.value} />,
  },
  {
    field: 'progressMobile',
    headerName: '모바일 진행율',
    width: 140,
    renderCell: (params) => <ProgressBar value={params.value} />,
  },
  {
    field: 'actions',
    headerName: '관리',
    width: 100,
    sortable: false,
    renderCell: (params) => (
      <IconButton onClick={() => onEdit(params.row)}>
        <EditIcon fontSize="small" />
      </IconButton>
    ),
  },
];
```

---

## 📐 썸네일 그리드 스케일링 모드 (`viewMode === 'card'`)

사용자가 카드 개수(`columnsCount`: 2~5개) 및 축소 비율(`scaleMode`: auto, 100%, 75%, 50%)을 변경할 때, Flex/Grid 레이아웃 비율이 동적으로 조절됩니다.

```tsx
<Grid container spacing={2}>
  {items.map((item) => (
    <Grid item xs={12} sm={6} md={12 / columnsCount} key={item.id}>
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* iframe 썸네일 영역 */}
        <Box sx={{ height: 240, overflow: 'hidden', position: 'relative' }}>
          <PreviewFrame path={item.path} scaleMode={scaleMode} />
        </Box>

        {/* 메타정보 영역 */}
        <CardContent>
          <Typography variant="subtitle1">{item.pageTitle}</Typography>
          <Typography variant="caption" color="text.secondary">{item.id} · {item.path}</Typography>
        </CardContent>
      </Card>
    </Grid>
  ))}
</Grid>
```

---

## 📌 수정 시 주의사항
- `DataGrid` 렌더링 시 `getRowId={(row) => row.id}` 옵션이 올바르게 전달되었는지 확인합니다.
- 카드 썸네일 내부에서 마우스 휠 스크롤 시 iframe이 스크롤되도록 `onWheel` 이벤트 핸들러가 바인딩되어 있습니다.
