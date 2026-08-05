---
name: url-index-app-layout
description: src/App.tsx 파일 기반 스킬 가이드 - 대시보드의 최상위 상태 통합, 데스크탑/모바일 레이아웃 구조, 사이드바 및 설정 드로어 연동 가이드
---

# 🚀 `src/App.tsx` 파일 스킬 가이드

`src/App.tsx`는 URL Index 대시보드의 최상위 진입점 컴포넌트로, 앱 전체의 상태 관리, 뷰 모드 조율, 온보딩 가이드 및 레이아웃을 담당합니다.

---

## 📌 주요 담당 파일
- **핵심 소스**: `src/App.tsx`
- **관련 컴포넌트**: `src/components/desktop/TopHeader.tsx`, `LeftSidebar.tsx`, `RightPanel.tsx`, `SettingsDrawer.tsx`

---

## 💡 주요 상태 및 역할 (`App.tsx`)

```typescript
// 1. 현재 선택된 워크스페이스(사이트) 상태
const [currentSite, setCurrentSite] = useState<SiteConfig>(SITES[0]);

// 2. 화면 보기 모드 (데스크탑: list / card, 모바일: swiper)
const [viewMode, setViewMode] = useState<'list' | 'card'>('list');

// 3. 카드 그리드 보기 시 한 줄당 카드 개수 (2~5개)
const [columnsCount, setColumnsCount] = useState<number>(3);

// 4. 미리보기 디바이스 해상도 축소 비율 (auto, 100%, 75%, 50%)
const [scaleMode, setScaleMode] = useState<ScaleMode>('auto');

// 5. 사이드바 및 우측 패널 열림/닫힘 상태
const [sidebarOpen, setSidebarOpen] = useState(true);
const [rightPanelOpen, setRightPanelOpen] = useState(true);

// 6. Firebase 인증 로그인 사용자 상태
const [user, setUser] = useState<User | null>(null);
```

---

## 📐 레이아웃 구조 예시

```tsx
<Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
  {/* 1. 상단 헤더 */}
  <TopHeader
    currentSite={currentSite}
    onSelectSite={setCurrentSite}
    onOpenSettings={() => setSettingsOpen(true)}
    user={user}
  />

  {/* 2. 메인 컨텐츠 영역 */}
  <Box component="main" sx={{ flexGrow: 1, display: 'flex', pt: '64px' }}>
    {/* 좌측 사이드바 (카테고리 필터) */}
    {isDesktop && (
      <LeftSidebar
        open={sidebarOpen}
        items={items}
        selectedCategories={selectedCategories}
        onToggleCategory={handleToggleCategory}
      />
    )}

    {/* 메인 데이터 영역 (표 또는 카드) */}
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <SectionTable
        items={filteredItems}
        viewMode={viewMode}
        columnsCount={columnsCount}
        scaleMode={scaleMode}
      />
    </Box>

    {/* 우측 대시보드 요약 패널 */}
    {isDesktop && (
      <RightPanel
        open={rightPanelOpen}
        items={items}
      />
    )}
  </Box>

  {/* 3. 개인화 설정 드로어 */}
  <SettingsDrawer
    open={settingsOpen}
    onClose={() => setSettingsOpen(false)}
  />
</Box>
```

---

## 📌 수정 시 주의사항
- 새로운 글로벌 상태를 추가할 때는 `App.tsx`에서 정의하되, 상태 복잡도가 증가하면 커스텀 훅으로 분리합니다.
- 반응형 분기 처리 시 MUI의 `useMediaQuery(theme.breakpoints.down('md'))`를 활용합니다.
