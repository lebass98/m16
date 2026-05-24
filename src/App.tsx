import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { Box } from '@mui/material';
import { createPaletteChannel } from 'minimal-shared/utils';

import { sites } from './data/sites';
import { PREVIEW_SCROLL_DIR_EVENT } from './types/events';

import SectionTable from './components/SectionTable';
import SettingsDrawer from './components/SettingsDrawer';
import SearchDialog, { type SearchHit } from './components/SearchDialog';
import GlassCard from './components/GlassCard';

import LeftSidebar from './components/desktop/LeftSidebar';
import TopHeader from './components/desktop/TopHeader';
import FilterBar from './components/desktop/FilterBar';
import ViewToolbar, { type DesktopView, type ThumbnailDevice, type ThumbnailCols } from './components/desktop/ViewToolbar';
import RightPanel from './components/desktop/RightPanel';

import MobileTopControls from './components/mobile/MobileTopControls';
import MobileHeader from './components/mobile/MobileHeader';
import MobileSwiper from './components/mobile/MobileSwiper';

import SitePickerDialog from './components/dialogs/SitePickerDialog';
import SectionPickerDialog from './components/dialogs/SectionPickerDialog';
import DashboardDialog from './components/dialogs/DashboardDialog';

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

  // --- 세션 휘발성 UI 상태 ---
  const [flatIndex, setFlatIndex] = useState(0);
  const [hideUi, setHideUi] = useState(false);
  const [previewEnabled, setPreviewEnabled] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // 다이얼로그 / 필터 / 북마크는 도메인 훅으로 그룹화
  const dialogs = useDialogs();
  const filters = useFilters();
  const { bookmarks, toggle: toggleBookmark } = useBookmarks();

  // --- 테마 override ---
  const themeOverrides = useMemo(() => ({
    colorSchemes: {
      light: {
        palette: {
          primary: createPaletteChannel(PRESETS[preset]),
        },
      },
    },
    typography: {
      fontFamily: `"${fontFamily}", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`,
    },
  }), [preset, fontFamily]);

  // --- 데이터: 시트 fetch → 필터/정렬/파생 ---
  const rawTableData = useSiteData(site);
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
    rawTableData,
    showIncomplete: filters.showIncomplete,
    sectionFilter: filters.sectionFilter,
    progressRange: filters.debouncedProgressRange,
    sortBy,
    searchFilter: filters.searchFilter,
  });

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

  // --- 키보드: Cmd/Ctrl + K → 검색 ---
  useKeyboardShortcut('k', useCallback(() => dialogs.openDialog('search'), [dialogs]));

  // --- 사이트 변경 ---
  const handleSiteChange = (next: number) => {
    setSiteIndex(next);
    setFlatIndex(0);
    history.replaceState(null, '', `?site=${sites[next].key}`);
    setTimeout(() => {
      scrollContainerRef.current?.scrollTo({ left: 0, behavior: 'instant' });
    }, 0);
  };

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
          />

          <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            <TopHeader
              siteTitle={site.title}
              darkMode={darkMode}
              settingsOpen={dialogs.isOpen('settings')}
              onOpenSearch={() => dialogs.openDialog('search')}
              onOpenSettings={() => dialogs.openDialog('settings')}
              onToggleDarkMode={() => setDarkMode((d) => !d)}
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

                {tableData.length === 0 ? (
                  <GlassCard sx={{ py: '80px', textAlign: 'center', color: 'text.disabled', fontSize: 14 }}>표시할 항목이 없습니다</GlassCard>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
                      />
                    ))}
                  </Box>
                )}
              </Box>

              <RightPanel
                hidden={rightSidebarHidden}
                overallPc={overallPc}
                overallMo={overallMo}
                flatCards={flatCards}
                latestDate={latestDate}
                bookmarks={bookmarks}
                dashboardStats={dashboardStats}
                totalCount={totalCount}
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

        {/* 다이얼로그들 */}
        <SitePickerDialog
          open={dialogs.isOpen('site')}
          onClose={() => dialogs.closeDialog('site')}
          sites={sites}
          selectedIndex={siteIndex}
          onSelect={handleSiteChange}
        />

        <SectionPickerDialog
          open={dialogs.isOpen('section')}
          onClose={() => dialogs.closeDialog('section')}
          tableData={tableData}
          currentSectionIdx={currentSectionIdx}
          sectionStartIndices={sectionStartIndices}
          onSelect={handleMobileSectionSelect}
        />

        <DashboardDialog
          open={dialogs.isOpen('dashboard')}
          onClose={() => dialogs.closeDialog('dashboard')}
          totalCount={totalCount}
          overallPc={overallPc}
          overallMo={overallMo}
          dashboardStats={dashboardStats}
        />

      </Box>

      <SearchDialog
        open={dialogs.isOpen('search')}
        onClose={() => { dialogs.closeDialog('search'); setSearchQuery(''); }}
        query={searchQuery}
        onQueryChange={setSearchQuery}
        results={searchHits}
        totalCount={totalCount}
        previewEnabled={previewEnabled}
        onSubmit={(q) => { filters.setSearchFilter(q); dialogs.closeDialog('search'); setSearchQuery(''); }}
      />

      <SettingsDrawer
        open={dialogs.isOpen('settings')}
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
    </ThemeProvider>
  );
}
