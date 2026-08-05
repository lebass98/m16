---
name: url-index-ui-components
description: URL Index 프로젝트의 데스크탑 DataGrid 표 및 썸네일 카드 그리드, 모바일 스와이프 카드, iframe 미리보기/디바이스 스케일링, 다중 필터 및 온보딩 투어 UI 컴포넌트 구축 가이드
---

# 🎨 URL Index UI 컴포넌트 & 레이아웃 스킬 가이드

본 스킬은 `url-index` 프로젝트의 반응형 대시보드 컴포넌트 구조, 데스크탑/모바일 뷰 모드 전환, iframe 실시간 미리보기 및 디바이스 시뮬레이션, 다중 필터링/검색 시스템을 다룹니다.

---

## 🏛️ 컴포넌트 아키텍처 구조

```
src/components/
├── SectionTable.tsx          # 데스크탑 메인 (DataGrid 표 & 카드 그리드 토글)
├── MobileCard.tsx            # 모바일 풀-스크린 뷰 (scroll-snap 카드)
├── PreviewFrame.tsx          # iframe 렌더링 & 해상도 스케일링
├── PathPreviewIcons.tsx      # 복사 & 링크 외부 이동 액션 버튼
├── ProgressBar.tsx           # 6단계 진행율 바
├── SearchDialog.tsx          # Cmd/Ctrl+K 모달 검색
├── OnboardingTour.tsx        # 시스템 첫 진입 안내 투어
├── SettingsDrawer.tsx        # 테마 & 개인화 설정 드로어
├── desktop/                  # 데스크탑 전용 바/사이드바 (FilterBar, LeftSidebar, TopHeader 등)
├── mobile/                   # 모바일 전용 UI (MobileTopBar, MobileSwiper, SectionTableMobile 등)
└── dialogs/                  # CRUD 및 정보 팝업 모달
```

---

## 1. 🖥️ 데스크탑 리스트 & 썸네일 그리드 (`SectionTable.tsx`)

`SectionTable` 컴포넌트는 사용자의 선택에 따라 두 가지 화면으로 전환됩니다:

- **표 보기 (`viewMode === 'list'`)**: `@mui/x-data-grid`를 사용하여 컬럼별 정렬, 체크박스 선택, 상태 뱃지, 연필/휴지통 CMS 액션을 한눈에 제공합니다.
- **카드 그리드 보기 (`viewMode === 'card'`)**: 한 줄에 표시할 카드 개수(`columnsCount`: 2~5개)를 선택하고 카드 내부에서 PC/태블릿/모바일 축소 비율을 즉각 확인합니다.

```tsx
// 뷰 모드에 따른 분기 처리 예시
{viewMode === 'list' ? (
  <DataGrid
    rows={rows}
    columns={columns}
    pageSizeOptions={[10, 25, 50, 100]}
    checkboxSelection
    disableRowSelectionOnClick
    sx={{
      border: 'none',
      '& .MuiDataGrid-row:hover': {
        backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.04),
      },
    }}
  />
) : (
  <Grid container spacing={2}>
    {rows.map((item) => (
      <Grid item xs={12 / columnsCount} key={item.id}>
        <CardThumbnailItem item={item} scaleMode={scaleMode} />
      </Grid>
    ))}
  </Grid>
)}
```

---

## 2. 📱 모바일 스와이프 카드 (`MobileCard.tsx` / `MobileSwiper.tsx`)

모바일 환경에서는 터치 스와이프가 용이하도록 `scroll-snap-type: x mandatory` CSS 속성을 활용하여 가로 풀 스크린 카드를 구성합니다.

- **미리보기 스크롤 시 인터랙션**: 미리보기 iframe 내부를 수직 스크롤할 때 `MobileTopBar` 헤더가 자동으로 접히거나 숨겨집니다.
- **하단 스크롤 인디케이터**: 섹션 및 개별 카드의 인디케이터 도트가 가로 위치에 따라 반응합니다.

---

## 3. 🖼️ iframe 실시간 미리보기 및 디바이스 시뮬레이션 (`PreviewFrame.tsx`)

각 페이지의 퍼블리싱 결과를 실제 화면 크기로 렌더링하기 위해 iframe wrapper 및 transform scale을 적용합니다.

```tsx
/**
 * 디바이스 해상도 시뮬레이션 규격
 */
const DEVICE_DIMENSIONS = {
  pc: { width: 1920, height: 1080 },
  tablet: { width: 1024, height: 768 },
  mobile: { width: 375, height: 667 },
};

export function PreviewFrame({ path, device = 'pc' }: PreviewFrameProps) {
  const targetDim = DEVICE_DIMENSIONS[device];

  return (
    <Box sx={{ overflow: 'hidden', position: 'relative', width: '100%', height: '100%' }}>
      <iframe
        src={path}
        title="Page Preview"
        style={{
          width: `${targetDim.width}px`,
          height: `${targetDim.height}px`,
          transform: `scale(var(--preview-scale))`,
          transformOrigin: 'top left',
          border: 'none',
        }}
      />
    </Box>
  );
}
```

---

## 4. 🔍 필터링 및 빠른 검색 (`useFilters.ts` / `useFilteredData.ts`)

대시보드 상단의 필터 및 사이드바 선택에 따라 실시간으로 데이터가 조율됩니다.

1. **카테고리 필터**: 좌측 사이드바에서 `depth1` 다중 선택.
2. **진행율 범위**: Slider를 통해 `0~100%` 범위 조절.
3. **미완료 표시**: 진행도 0% 숨김 옵션.
4. **Cmd/Ctrl + K 빠른 검색**: 제목, 페이지 ID, depth1/2/3, 비고 메모 키워드 일치 검색.

---

## 📌 스킬 사용 가이드 요약

- **카드 및 리스트 변경 시**: `SectionTable.tsx` 내부의 MUI `DataGrid` 및 `Card` 렌더링 프롭스를 활용합니다.
- **iframe 렌더링 문제 발생 시**: `useIframeAutoScroll.ts` 훅과 `PreviewFrame.tsx` 내부의 CSS transform scale 레이아웃을 점검합니다.
