import { useMemo, useState, useEffect, useLayoutEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { Box, useMediaQuery } from '@mui/material';
import { createPaletteChannel } from 'minimal-shared/utils';

import { sites } from './data/sites';
import { PREVIEW_SCROLL_DIR_EVENT } from './types/events';

import SectionTable from './components/SectionTable';
import type { SearchHit } from './components/SearchDialog';
import StateMessage from './components/StateMessage';
import ExportMenu from './components/ExportMenu';

import LeftSidebar from './components/desktop/LeftSidebar';
import TopHeader from './components/desktop/TopHeader';
import FilterBar from './components/desktop/FilterBar';
import ViewToolbar, { type DesktopView, type ThumbnailDevice, type ThumbnailCols } from './components/desktop/ViewToolbar';
import RightPanel from './components/desktop/RightPanel';
import ActiveFilterChips from './components/desktop/ActiveFilterChips';

import MobileTopControls from './components/mobile/MobileTopControls';
import MobileHeader from './components/mobile/MobileHeader';
import MobileSwiper from './components/mobile/MobileSwiper';

// 다이얼로그·드로워는 첫 진입에 필요 없음 → 지연 로드로 초기 번들에서 분리
const SearchDialog = lazy(() => import('./components/SearchDialog'));
const SettingsDrawer = lazy(() => import('./components/SettingsDrawer'));
const SitePickerDialog = lazy(() => import('./components/dialogs/SitePickerDialog'));
const SectionPickerDialog = lazy(() => import('./components/dialogs/SectionPickerDialog'));
const DashboardDialog = lazy(() => import('./components/dialogs/DashboardDialog'));
const ShortcutHelpDialog = lazy(() => import('./components/dialogs/ShortcutHelpDialog'));
const ProgressHistoryDialog = lazy(() => import('./components/dialogs/ProgressHistoryDialog'));
const ComparePreviewDialog = lazy(() => import('./components/dialogs/ComparePreviewDialog'));
const BulkEditBar = lazy(() => import('./components/BulkEditBar'));

import { ThemeProvider } from './theme/theme-provider';
import { PRESETS, isPresetKey, type PresetKey } from './theme/presets';
import { isFontFamilyKey, type FontFamilyKey } from './theme/fonts';

import { isSortKey, type SortKey } from './constants/sort';
import { getLatestDate } from './utils/getLatestDate';
import { applyFontScale } from './utils/applyFontScale';
import { usePersistedState } from './hooks/usePersistedState';
import { useSiteData } from './hooks/useSiteData';
import { useFilteredData } from './hooks/useFilteredData';
import { useKeyboardShortcut } from './hooks/useKeyboardShortcut';
import { useScrollSnapIndex } from './hooks/useScrollSnapIndex';
import { useFilters } from './hooks/useFilters';
import { useDialogs } from './hooks/useDialogs';
import { useBookmarks } from './hooks/useBookmarks';
import { useFuseSearch } from './hooks/useFuseSearch';
import { useRecentlyViewed } from './hooks/useRecentlyViewed';
import { useSelection } from './hooks/useSelection';
import { useProgressOverrides, applyOverrides } from './hooks/useProgressOverrides';

import './App.css';

export default function App() {
  // --- 사이트 선택 (URL 쿼리 동기화) ---
  const [siteIndex, setSiteIndex] = useState(() => {
    const key = new URLSearchParams(window.location.search).get('site');
    if (key) { const i = sites.findIndex((s) => s.key === key); if (i !== -1) return i; }
    return 0;
  });
  const site = sites[siteIndex];
  const siteColor = site.color ?? '#4a7ab5';

  // --- 영구 저장 환경설정 ---
  const [darkMode, setDarkMode] = usePersistedState<boolean>('darkMode', false);
  const [desktopView, setDesktopView] = usePersistedState<DesktopView>('desktopView', 'thumbnail', {
    validate: (v) => (v === 'list' || v === 'thumbnail') ? v : 'thumbnail',
  });
  const [thumbnailDevice, setThumbnailDevice] = usePersistedState<ThumbnailDevice>('thumbnailDevice', 'pc', {
    validate: (v) => (v === 'pc' || v === 'tablet' || v === 'mobile') ? v : 'pc',
  });
  const [thumbnailCols, setThumbnailCols] = usePersistedState<ThumbnailCols>('thumbnailCols', 3, {
    validate: (v) => (v === 2 || v === 3 || v === 4 || v === 5) ? v : 3,
  });
  const [sidebarCollapsed, setSidebarCollapsed] = usePersistedState<boolean>('sidebarCollapsed', false);
  const [rightSidebarHidden, setRightSidebarHidden] = usePersistedState<boolean>('rightSidebarHidden', false);
  const [rtl, setRtl] = usePersistedState<boolean>('rtl', false);
  const [preset, setPreset] = usePersistedState<PresetKey>('preset', 'default', {
    validate: (v) => (isPresetKey(v) ? v : 'default'),
  });
  const [fontSize, setFontSize] = usePersistedState<number>('fontSize', 16, {
    validate: (v) => (v >= 12 && v <= 20 ? v : 16),
  });
  const [fontFamily, setFontFamily] = usePersistedState<FontFamilyKey>('fontFamily', 'Pretendard', {
    validate: (v) => (isFontFamilyKey(v) ? v : 'Pretendard'),
  });
  const [contrast, setContrast] = usePersistedState<'default' | 'hot'>('contrast', 'default', {
    validate: (v) => (v === 'hot' ? 'hot' : 'default'),
  });
  const [sortBy, setSortBy] = usePersistedState<SortKey>('sortBy', 'updated', {
    validate: (v) => (isSortKey(v) ? v : 'updated'),
  });

  useEffect(() => { document.documentElement.setAttribute('data-color-scheme', darkMode ? 'dark' : 'light'); }, [darkMode]);
  useEffect(() => { document.documentElement.setAttribute('data-contrast', contrast); }, [contrast]);
  useEffect(() => { applyFontScale(fontSize); }, [fontSize]);

  // 데스크탑 레이아웃은 md(900px)+에서 활성화되지만, 900~1199px(=lg 미만) 구간에서는
  // LeftSidebar+RightPanel이 콘텐츠 영역을 양쪽에서 압박한다. lg 미만에서는 강제 축소·숨김.
  const isLargeUp = useMediaQuery('(min-width:1200px)');
  const forceCompact = !isLargeUp;

  // --- 세션 휘발성 UI 상태 ---
  const [flatIndex, setFlatIndex] = useState(0);
  const [hideUi, setHideUi] = useState(false);
  const [previewEnabled, setPreviewEnabled] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // 다이얼로그 / 필터 / 북마크 / 최근 본 항목 / 선택 / 진행도 오버라이드 — 도메인 훅으로 그룹화
  const dialogs = useDialogs();
  const filters = useFilters();
  const { bookmarks, toggle: toggleBookmark } = useBookmarks();
  const { entries: recentlyViewed, record: recordRecent, clear: clearRecent } = useRecentlyViewed();
  const selection = useSelection<string>();
  const { overrides, history: progressHistory, setProgress, revert, clearAll: clearOverrides } = useProgressOverrides();

  // 선택 모드 (휘발성)
  const [selectMode, setSelectMode] = useState(false);
  const exitSelectMode = useCallback(() => { setSelectMode(false); selection.clear(); }, [selection]);

  // --- 테마 override ---
  // 다크 모드는 Minimals 기본 푸른빛(grey #1C252E·#141A21·#28323D) 대신
  // 푸른 톤 제거한 중성 흑색 팔레트를 사용한다.
  const themeOverrides = useMemo(() => ({
    colorSchemes: {
      light: {
        palette: {
          primary: createPaletteChannel(PRESETS[preset]),
        },
      },
      dark: {
        palette: {
          primary: createPaletteChannel(PRESETS[preset]),
          background: createPaletteChannel({
            paper: '#171717',     // 카드 배경 — 거의 검정
            default: '#0a0a0a',   // 최하단 배경 — 가장 깊은 흑색
            neutral: '#262626',   // 강조 영역
          }),
        },
      },
    },
    typography: {
      fontFamily: `"${fontFamily}", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`,
    },
  }), [preset, fontFamily]);

  // --- 데이터: 시트 fetch → 사용자 오버라이드 적용 → 필터/정렬/파생 ---
  const { data: rawTableData, status: dataStatus, isFallback } = useSiteData(site);
  // 사용자가 인앱에서 수정한 진행도(overrides)를 원본에 덮어씌운 뒤 다운스트림 훅에 전달.
  const dataWithOverrides = useMemo(() => applyOverrides(rawTableData, overrides), [rawTableData, overrides]);
  const {
    tableData,
    flatCards,
    depth1Categories,
    sectionStartIndices,
    totalCount,
    dashboardStats,
    overallPc,
    overallMo,
  } = useFilteredData({
    rawTableData: dataWithOverrides,
    showIncomplete: filters.showIncomplete,
    sectionFilter: filters.sectionFilter,
    progressRange: filters.debouncedProgressRange,
    sortBy,
    searchFilter: filters.searchFilter,
  });

  // 필터링이 적용 중인지 여부 (어떤 결과가 0인지 판단할 때 사용)
  const hasActiveFilters = (
    filters.sectionFilter.size > 0 ||
    filters.searchFilter.trim() !== '' ||
    filters.showIncomplete ||
    filters.progressRange[0] !== 0 ||
    filters.progressRange[1] !== 100
  );

  const resetAllFilters = useCallback(() => {
    setSearchQuery('');
    filters.clearSearchFilter();
    filters.clearSectionFilter();
    filters.setShowIncomplete(false);
    filters.setProgressRange([0, 100]);
  }, [filters]);

  // 외부 링크 열기 + "최근 본" 기록을 한 번에 처리. RightPanel/SearchDialog가 이 헬퍼를 사용.
  const openExternal = useCallback((id: string, path?: string) => {
    if (id) recordRecent(id);
    if (path) window.open(path, '_blank', 'noopener,noreferrer');
  }, [recordRecent]);

  // 전체 항목을 id로 빠르게 찾기 위한 맵 (선택된 id → 원본 TableItem).
  // overrides가 적용된 dataWithOverrides에서 찾아 BulkEdit 시 currentPc/currentMo도 얻음.
  const itemsById = useMemo(() => {
    const map = new Map<string, import('./types').TableItem>();
    for (const section of dataWithOverrides) {
      for (const it of section.data) map.set(it.id, it);
    }
    return map;
  }, [dataWithOverrides]);

  // 선택된 항목 배열 (id 순서 유지). overrides 적용된 값을 사용.
  const selectedItems = useMemo(() =>
    Array.from(selection.selected).map((id) => itemsById.get(id)).filter((x): x is import('./types').TableItem => !!x),
  [selection.selected, itemsById]);

  const applyBulkProgress = useCallback((nextPc?: import('./types').ProgressValue, nextMo?: import('./types').ProgressValue) => {
    if (nextPc === undefined && nextMo === undefined) return;
    const updates = Array.from(selection.selected).map((id) => {
      const it = itemsById.get(id);
      return {
        id,
        currentPc: it?.progressPc ?? null,
        currentMo: it?.progressMobile ?? null,
        nextPc,
        nextMo,
      };
    });
    setProgress(updates);
  }, [selection.selected, itemsById, setProgress]);

  const currentCard = flatCards[Math.min(flatIndex, flatCards.length - 1)];
  const currentSectionIdx = currentCard?.sectionIdx ?? 0;
  const latestDate = useMemo(() => getLatestDate(tableData), [tableData]);

  // --- 검색 결과 (모달용) — Fuse.js 기반 fuzzy 매칭 ---
  const fuseResults = useFuseSearch(flatCards, searchQuery, 30);
  const searchHits: SearchHit[] = useMemo(
    () => fuseResults.map((c) => {
      const globalIdx = flatCards.indexOf(c);
      let pathDisplay = c.item.id || c.item.path || '';
      if (c.item.path) {
        try { pathDisplay = new URL(c.item.path).pathname; } catch { pathDisplay = c.item.path; }
      }
      return {
        globalIdx,
        pageTitle: c.item.pageTitle,
        id: c.item.id,
        pathDisplay,
        section: c.sectionTitle,
        href: c.item.path || undefined,
        progress: c.item.progressPc ?? 0,
      };
    }),
    [fuseResults, flatCards],
  );

  // --- 모바일 스크롤 스냅 ---
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  useScrollSnapIndex({
    containerRef: scrollContainerRef,
    enabled: previewEnabled,
    index: flatIndex,
    onChange: setFlatIndex,
  });

  const scrollToFlat = useCallback((idx: number) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    container.scrollTo({ left: idx * container.clientWidth, behavior: 'smooth' });
  }, []);

  // --- 이벤트: 미리보기 스크롤 방향 → 헤더 숨김 ---
  useEffect(() => {
    const handleDir = (e: WindowEventMap[typeof PREVIEW_SCROLL_DIR_EVENT]) => {
      if (e.detail === 'down') setHideUi(true);
      else if (e.detail === 'up') setHideUi(false);
    };
    window.addEventListener(PREVIEW_SCROLL_DIR_EVENT, handleDir);
    return () => window.removeEventListener(PREVIEW_SCROLL_DIR_EVENT, handleDir);
  }, []);

  // --- 키보드 단축키 ---
  const openSearch = useCallback(() => dialogs.openDialog('search'), [dialogs]);
  const openShortcuts = useCallback(() => dialogs.openDialog('shortcuts'), [dialogs]);
  const toggleSelectModeShortcut = useCallback(() => {
    if (selectMode) exitSelectMode(); else setSelectMode(true);
  }, [selectMode, exitSelectMode]);
  const escSelectShortcut = useCallback(() => {
    if (selectMode) exitSelectMode();
  }, [selectMode, exitSelectMode]);
  useKeyboardShortcut('k', openSearch);                          // Cmd/Ctrl+K — 검색
  useKeyboardShortcut('/', openSearch, { modifier: false });     // / — 검색 (modifier 없이)
  useKeyboardShortcut('?', openShortcuts, { modifier: false, shift: true }); // ? (Shift+/) — 단축키 도움말
  useKeyboardShortcut('e', toggleSelectModeShortcut, { modifier: false });   // e — 선택 모드 토글
  useKeyboardShortcut('Escape', escSelectShortcut, { modifier: false });     // Esc — 선택 모드 종료

  // --- 사이트 변경 ---
  // 스크롤 리셋은 siteIndex가 바뀌면 useLayoutEffect에서 동기 수행 — DOM 업데이트 직후, 페인트 전에 실행되어
  // 사용자가 "이전 사이트의 스크롤 위치"를 잠깐이라도 보지 않도록 보장. setTimeout 경합 제거.
  const handleSiteChange = (next: number) => {
    setSiteIndex(next);
    setFlatIndex(0);
    history.replaceState(null, '', `?site=${sites[next].key}`);
  };

  useLayoutEffect(() => {
    scrollContainerRef.current?.scrollTo({ left: 0, behavior: 'instant' });
  }, [siteIndex]);

  const handleMobileSectionSelect = (target: number) => {
    setFlatIndex(target);
    scrollToFlat(target);
  };

  return (
    <ThemeProvider themeOverrides={themeOverrides} direction={rtl ? 'rtl' : 'ltr'}>
      <Box sx={{ boxSizing: 'border-box', p: 0, pb: { xs: 0, md: 0 }, height: { xs: '100dvh', md: 'auto' }, minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'transparent' }}>

        <MobileTopControls
          darkMode={darkMode}
          previewEnabled={previewEnabled}
          showIncomplete={filters.showIncomplete}
          onOpenSearch={() => dialogs.openDialog('search')}
          onOpenDashboard={() => dialogs.openDialog('dashboard')}
          onToggleDarkMode={() => setDarkMode((d) => !d)}
          onTogglePreview={() => setPreviewEnabled((p) => !p)}
          onToggleIncomplete={() => filters.setShowIncomplete((s) => !s)}
        />

        <MobileHeader
          siteTitle={site.title}
          totalCount={totalCount}
          hideUi={hideUi}
          darkMode={darkMode}
          onOpenSiteModal={() => dialogs.openDialog('site')}
        />

        {/* 데스크탑 레이아웃 */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, flexDirection: 'row', minHeight: '100vh', bgcolor: 'transparent', position: 'relative' }}>
          <LeftSidebar
            siteTitle={site.title}
            totalCount={totalCount}
            collapsed={sidebarCollapsed}
            onToggleCollapsed={() => setSidebarCollapsed((c) => !c)}
            onOpenSiteModal={() => dialogs.openDialog('site')}
            depth1Categories={depth1Categories}
            sectionFilter={filters.sectionFilter}
            onToggleSectionFilter={filters.toggleSectionFilter}
            forceCollapsed={forceCompact}
          />

          <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            <TopHeader
              siteTitle={site.title}
              darkMode={darkMode}
              settingsOpen={dialogs.isOpen('settings')}
              selectMode={selectMode}
              hasHistory={Object.keys(progressHistory).length > 0}
              onOpenSearch={openSearch}
              onOpenSettings={() => dialogs.openDialog('settings')}
              onToggleDarkMode={() => setDarkMode((d) => !d)}
              onOpenShortcuts={openShortcuts}
              onToggleSelectMode={() => {
                if (selectMode) exitSelectMode();
                else setSelectMode(true);
              }}
              onOpenHistory={() => dialogs.openDialog('history')}
              rightSlot={
                <ExportMenu
                  siteKey={site.key}
                  siteTitle={site.title}
                  fullData={rawTableData}
                  filteredData={tableData}
                />
              }
            />

            <Box sx={{ flex: 1, display: 'flex', gap: { md: '16px', lg: '24px' }, p: { md: '16px', lg: '24px 32px' }, minHeight: 0 }}>
              <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: { md: '16px', lg: '24px' } }}>
                <FilterBar
                  sectionFilterCount={filters.sectionFilter.size}
                  sortBy={sortBy}
                  latestDate={latestDate}
                  progressRange={filters.progressRange}
                  onChangeProgressRange={filters.setProgressRange}
                />

                <ActiveFilterChips
                  searchFilter={filters.searchFilter}
                  sectionFilter={filters.sectionFilter}
                  showIncomplete={filters.showIncomplete}
                  progressRange={filters.progressRange}
                  onClearSearch={() => { setSearchQuery(''); filters.clearSearchFilter(); }}
                  onToggleSection={filters.toggleSectionFilter}
                  onToggleIncomplete={() => filters.setShowIncomplete((s) => !s)}
                  onResetProgress={() => filters.setProgressRange([0, 100])}
                  onClearAll={resetAllFilters}
                />

                <ViewToolbar
                  searchFilter={filters.searchFilter}
                  totalCount={totalCount}
                  sortBy={sortBy}
                  onSetSortBy={setSortBy}
                  desktopView={desktopView}
                  onSetDesktopView={setDesktopView}
                  thumbnailDevice={thumbnailDevice}
                  onSetThumbnailDevice={setThumbnailDevice}
                  thumbnailCols={thumbnailCols}
                  onSetThumbnailCols={setThumbnailCols}
                  onClearSearchFilter={() => { setSearchQuery(''); filters.clearSearchFilter(); }}
                />

                {dataStatus === 'loading' && rawTableData.length === 0 ? (
                  <StateMessage kind="loading" />
                ) : tableData.length === 0 ? (
                  hasActiveFilters ? (
                    <StateMessage
                      kind="no-results"
                      description="검색어를 비우거나 진행도·섹션 필터를 완화해보세요."
                      action={{ label: '필터 초기화', onClick: resetAllFilters }}
                    />
                  ) : (
                    <StateMessage kind="empty" />
                  )
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {isFallback && (
                      <StateMessage
                        kind="error"
                        title="원격 데이터 로드 실패"
                        description="시트를 불러오지 못해 기본 데이터로 표시하고 있어요."
                      />
                    )}
                    {tableData.map((section, i) => (
                      <SectionTable
                        key={i}
                        section={section}
                        sectionIndex={i}
                        latestDate={latestDate}
                        previewEnabled={previewEnabled}
                        viewMode={desktopView}
                        thumbnailDevice={thumbnailDevice}
                        thumbnailCols={thumbnailCols}
                        bookmarks={bookmarks}
                        onToggleBookmark={toggleBookmark}
                        selectMode={selectMode}
                        selected={selection.selected}
                        onToggleSelect={selection.toggle}
                      />
                    ))}
                  </Box>
                )}
              </Box>

              <RightPanel
                hidden={rightSidebarHidden || forceCompact}
                overallPc={overallPc}
                overallMo={overallMo}
                flatCards={flatCards}
                latestDate={latestDate}
                bookmarks={bookmarks}
                dashboardStats={dashboardStats}
                totalCount={totalCount}
                recentlyViewed={recentlyViewed}
                onClearRecentlyViewed={clearRecent}
                onItemOpen={openExternal}
              />
            </Box>
          </Box>
        </Box>

        {/* 모바일 뷰 */}
        <MobileSwiper
          previewEnabled={previewEnabled}
          tableData={tableData}
          flatCards={flatCards}
          currentCard={currentCard}
          currentSectionIdx={currentSectionIdx}
          sectionStartIndices={sectionStartIndices}
          latestDate={latestDate}
          hideUi={hideUi}
          darkMode={darkMode}
          siteColor={siteColor}
          scrollContainerRef={scrollContainerRef}
          onOpenSectionModal={() => dialogs.openDialog('section')}
          onSelectSection={handleMobileSectionSelect}
        />

        {/* 다이얼로그들 — 닫혀있을 때는 마운트하지 않아 청크 fetch 자체를 지연 */}
        <Suspense fallback={null}>
          {dialogs.isOpen('site') && (
            <SitePickerDialog
              open
              onClose={() => dialogs.closeDialog('site')}
              sites={sites}
              selectedIndex={siteIndex}
              onSelect={handleSiteChange}
            />
          )}

          {dialogs.isOpen('section') && (
            <SectionPickerDialog
              open
              onClose={() => dialogs.closeDialog('section')}
              tableData={tableData}
              currentSectionIdx={currentSectionIdx}
              sectionStartIndices={sectionStartIndices}
              onSelect={handleMobileSectionSelect}
            />
          )}

          {dialogs.isOpen('dashboard') && (
            <DashboardDialog
              open
              onClose={() => dialogs.closeDialog('dashboard')}
              totalCount={totalCount}
              overallPc={overallPc}
              overallMo={overallMo}
              dashboardStats={dashboardStats}
            />
          )}

          {dialogs.isOpen('shortcuts') && (
            <ShortcutHelpDialog
              open
              onClose={() => dialogs.closeDialog('shortcuts')}
            />
          )}

          {dialogs.isOpen('history') && (
            <ProgressHistoryDialog
              open
              onClose={() => dialogs.closeDialog('history')}
              history={progressHistory}
              itemLabel={(id) => itemsById.get(id)?.pageTitle || id}
              onRevert={revert}
              onClearAll={() => { clearOverrides(); dialogs.closeDialog('history'); }}
            />
          )}

          {dialogs.isOpen('compare') && selectedItems.length >= 2 && (
            <ComparePreviewDialog
              open
              onClose={() => dialogs.closeDialog('compare')}
              items={selectedItems.slice(0, 4)}
            />
          )}
        </Suspense>

        {/* 일괄 편집 툴바 — 선택 모드 + 1개 이상 선택 시에만 표시 */}
        <Suspense fallback={null}>
          {selectMode && selection.size > 0 && (
            <BulkEditBar
              selectedCount={selection.size}
              onCancel={exitSelectMode}
              onApply={applyBulkProgress}
              onCompare={() => dialogs.openDialog('compare')}
              canCompare={selection.size >= 2 && selection.size <= 4}
            />
          )}
        </Suspense>

      </Box>

      <Suspense fallback={null}>
        {dialogs.isOpen('search') && (
          <SearchDialog
            open
            onClose={() => { dialogs.closeDialog('search'); setSearchQuery(''); }}
            query={searchQuery}
            onQueryChange={setSearchQuery}
            results={searchHits}
            totalCount={totalCount}
            previewEnabled={previewEnabled}
            onSubmit={(q) => { filters.setSearchFilter(q); dialogs.closeDialog('search'); setSearchQuery(''); }}
            onSelect={(hit) => { if (hit.href) openExternal(hit.id, hit.href); }}
          />
        )}

        {dialogs.isOpen('settings') && (
          <SettingsDrawer
            open
            onClose={() => dialogs.closeDialog('settings')}
            darkMode={darkMode}
            onToggleDarkMode={() => setDarkMode((d) => !d)}
            previewEnabled={previewEnabled}
            onTogglePreview={() => setPreviewEnabled((p) => !p)}
            showIncomplete={filters.showIncomplete}
            onToggleIncomplete={() => filters.setShowIncomplete((s) => !s)}
            rightSidebarHidden={rightSidebarHidden}
            onToggleRightSidebar={() => setRightSidebarHidden((h) => !h)}
            rtl={rtl}
            onToggleRtl={() => setRtl((r) => !r)}
            onReset={() => {
              if (window.confirm('모든 설정을 초기화하고 페이지를 새로고침할까요?')) {
                localStorage.clear();
                window.location.reload();
              }
            }}
            preset={preset}
            onSelectPreset={setPreset}
            fontSize={fontSize}
            onChangeFontSize={setFontSize}
            fontFamily={fontFamily}
            onSelectFontFamily={setFontFamily}
            contrast={contrast}
            onSelectContrast={setContrast}
          />
        )}
      </Suspense>
    </ThemeProvider>
  );
}
