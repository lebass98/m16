import { useMemo, useState, useEffect, useLayoutEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { Box, Snackbar, useMediaQuery } from '@mui/material';
import { createPaletteChannel } from 'minimal-shared/utils';

import { sites } from './data/sites';
import { PREVIEW_SCROLL_DIR_EVENT } from './types/events';

import SectionTable from './components/SectionTable';
import type { SearchHit } from './components/SearchDialog';
import StateMessage from './components/StateMessage';
import ExportMenu from './components/ExportMenu';
import RefreshButton from './components/RefreshButton';

import LeftSidebar from './components/desktop/LeftSidebar';
import TopHeader from './components/desktop/TopHeader';
import FilterBar from './components/desktop/FilterBar';
import ViewToolbar, { type DesktopView, type ThumbnailDevice, type ThumbnailCols } from './components/desktop/ViewToolbar';
import RightPanel from './components/desktop/RightPanel';
import ActiveFilterChips from './components/ActiveFilterChips';

import MobileTopBar from './components/mobile/MobileTopBar';
import MobileSiteBanner from './components/mobile/MobileSiteBanner';
import MobileLeftDrawer from './components/mobile/MobileLeftDrawer';
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
const FullscreenPreviewDialog = lazy(() => import('./components/dialogs/FullscreenPreviewDialog'));
const NoteEditDialog = lazy(() => import('./components/dialogs/NoteEditDialog'));
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
import { readUrlState, writeUrlState, shareableUrl } from './utils/urlState';
import OnboardingTour from './components/OnboardingTour';

import './App.css';

// 첫 진입에 한 번만 URL을 읽어 초기값을 결정. 이후엔 우리가 URL을 갱신함.
const INITIAL_URL_STATE = readUrlState();

export default function App() {
  // --- 사이트 선택 (URL 쿼리 동기화) ---
  const [siteIndex, setSiteIndex] = useState(() => {
    if (INITIAL_URL_STATE.site) {
      const i = sites.findIndex((s) => s.key === INITIAL_URL_STATE.site);
      if (i !== -1) return i;
    }
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
  const [sortBy, setSortBy] = usePersistedState<SortKey>('sortBy', INITIAL_URL_STATE.sortBy ?? 'no', {
    validate: (v) => (isSortKey(v) ? v : 'no'),
  });

  const [hasCompletedOnboarding, setHasCompletedOnboarding] = usePersistedState<boolean>('hasCompletedOnboarding', false);
  const [runOnboarding, setRunOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);

  useEffect(() => {
    if (!hasCompletedOnboarding) {
      const timer = setTimeout(() => {
        setRunOnboarding(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [hasCompletedOnboarding]);

  // Reset step to 0 when onboarding starts
  useEffect(() => {
    if (runOnboarding) {
      setOnboardingStep(0);
    }
  }, [runOnboarding]);

  useEffect(() => { document.documentElement.setAttribute('data-color-scheme', darkMode ? 'dark' : 'light'); }, [darkMode]);
  useEffect(() => { document.documentElement.setAttribute('data-contrast', contrast); }, [contrast]);
  useEffect(() => { document.documentElement.setAttribute('data-site', site.key); }, [site.key]);
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

  const isSettingsOpen = dialogs.isOpen('settings');

  const prevStepRef = useRef(onboardingStep);
  const prevSettingsOpenRef = useRef(isSettingsOpen);

  // Sync onboarding tour step and settings drawer state without rendering loops
  useEffect(() => {
    const prevStep = prevStepRef.current;
    const prevSettingsOpen = prevSettingsOpenRef.current;

    prevStepRef.current = onboardingStep;
    prevSettingsOpenRef.current = isSettingsOpen;

    if (!runOnboarding) return;

    // 1. If onboardingStep was changed (e.g., Next/Back buttons in tour)
    if (onboardingStep !== prevStep) {
      if (onboardingStep === 6 && !isSettingsOpen) {
        dialogs.openDialog('settings');
      } else if (onboardingStep !== 6 && isSettingsOpen) {
        dialogs.closeDialog('settings');
      }
    }
    // 2. If isSettingsOpen was changed (e.g., user opened/closed settings drawer manually)
    else if (isSettingsOpen !== prevSettingsOpen) {
      if (isSettingsOpen) {
        if (onboardingStep === 5) {
          setOnboardingStep(6);
        }
      } else {
        if (onboardingStep === 6) {
          setOnboardingStep(5);
        }
      }
    }
  }, [onboardingStep, isSettingsOpen, runOnboarding, dialogs]);

  const filters = useFilters({
    searchFilter: INITIAL_URL_STATE.searchFilter,
    progressRange: INITIAL_URL_STATE.progressRange,
    showIncomplete: INITIAL_URL_STATE.showIncomplete,
    sectionFilter: INITIAL_URL_STATE.sectionFilter,
  });
  const { bookmarks, toggle: toggleBookmark } = useBookmarks();
  const { entries: recentlyViewed, record: recordRecent, clear: clearRecent } = useRecentlyViewed();
  const selection = useSelection<string>();
  const { overrides, history: progressHistory, setProgress, setNote, revert, clearAll: clearOverrides } = useProgressOverrides();

  // 선택 모드 (휘발성)
  const [selectMode, setSelectMode] = useState(false);
  const exitSelectMode = useCallback(() => { setSelectMode(false); selection.clear(); }, [selection]);

  // 모바일 좌측 햄버거 Drawer 상태 (휘발성, 모바일 전용)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // 전체화면 미리보기 — 단일 항목
  const [fullscreenItem, setFullscreenItem] = useState<import('./types').TableItem | null>(null);
  // 노트 편집 다이얼로그 — 편집할 항목 id (null이면 닫힘)
  const [noteEditId, setNoteEditId] = useState<string | null>(null);

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
  const { data: rawTableData, status: dataStatus, isFallback, lastFetched, refresh: refreshData } = useSiteData(site);
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
    !filters.showIncomplete ||
    filters.progressRange[0] !== 0 ||
    filters.progressRange[1] !== 100
  );

  const resetAllFilters = useCallback(() => {
    setSearchQuery('');
    filters.clearSearchFilter();
    filters.clearSectionFilter();
    filters.setShowIncomplete(true);
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

  // Shift+Click 범위 선택을 위한 anchor 추적 (마지막으로 (toggle/range) 선택한 id)
  const selectAnchorRef = useRef<string | null>(null);
  const handleToggleSelect = useCallback((id: string) => {
    selectAnchorRef.current = id;
    selection.toggle(id);
  }, [selection]);
  const handleRangeSelect = useCallback((orderedIds: string[], target: string) => {
    selection.selectRange(orderedIds, selectAnchorRef.current, target);
    selectAnchorRef.current = target;
  }, [selection]);

  // "현재 결과 전부 선택" — 필터된 tableData의 모든 id를 선택 집합에 추가
  const selectAllVisible = useCallback(() => {
    const allIds: string[] = [];
    for (const section of tableData) for (const it of section.data) allIds.push(it.id);
    selection.setAll(allIds);
    selectAnchorRef.current = null;
  }, [tableData, selection]);

  const deselectAll = useCallback(() => {
    selection.clear();
    selectAnchorRef.current = null;
  }, [selection]);

  // 화면에 보이는 (필터링 통과한) 항목 수
  const visibleCount = useMemo(
    () => tableData.reduce((n, s) => n + s.data.length, 0),
    [tableData],
  );

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
  // URL 갱신은 위쪽 URL 상태 동기화 useEffect가 통합 처리.
  const handleSiteChange = (next: number) => {
    setSiteIndex(next);
    setFlatIndex(0);
  };

  useLayoutEffect(() => {
    scrollContainerRef.current?.scrollTo({ left: 0, behavior: 'instant' });
  }, [siteIndex]);

  // --- URL 상태 동기화 ---
  // 필터/검색/정렬이 바뀔 때마다 URL 쿼리스트링을 replace로 갱신.
  // 새로고침해도 동일 보기 유지 + Slack 공유 가능.
  useEffect(() => {
    const next = writeUrlState({
      site: sites[siteIndex]?.key,
      searchFilter: filters.searchFilter,
      sectionFilter: filters.sectionFilter,
      progressRange: [filters.progressRange[0], filters.progressRange[1]],
      showIncomplete: filters.showIncomplete,
      sortBy,
    });
    if (next !== window.location.search) {
      history.replaceState(null, '', `${window.location.pathname}${next}`);
    }
  }, [siteIndex, filters.searchFilter, filters.sectionFilter, filters.progressRange, filters.showIncomplete, sortBy]);

  // --- 공유 링크 복사 ---
  const [copyToast, setCopyToast] = useState<string | null>(null);
  const handleCopyShareLink = useCallback(() => {
    const url = shareableUrl({
      site: sites[siteIndex]?.key,
      searchFilter: filters.searchFilter,
      sectionFilter: filters.sectionFilter,
      progressRange: [filters.progressRange[0], filters.progressRange[1]],
      showIncomplete: filters.showIncomplete,
      sortBy,
    });
    navigator.clipboard?.writeText(url).then(
      () => setCopyToast('공유 링크 복사됨'),
      () => setCopyToast('복사 실패 — 권한을 확인해주세요'),
    );
    setTimeout(() => setCopyToast(null), 2200);
  }, [siteIndex, filters.searchFilter, filters.sectionFilter, filters.progressRange, filters.showIncomplete, sortBy]);

  const handleMobileSectionSelect = (target: number) => {
    setFlatIndex(target);
    scrollToFlat(target);
  };

  return (
    <ThemeProvider themeOverrides={themeOverrides} direction={rtl ? 'rtl' : 'ltr'}>
      <Box sx={{ boxSizing: 'border-box', p: 0, pb: { xs: 0, md: 0 }, height: { xs: '100dvh', md: 'auto' }, minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'transparent' }}>

        {/* 모바일 상단바 — 좌: 햄버거 / 우: 데스크탑 우측 액션 묶음 */}
        <MobileTopBar
          darkMode={darkMode}
          settingsOpen={dialogs.isOpen('settings')}
          selectMode={selectMode}
          hasHistory={Object.keys(progressHistory).length > 0}
          hideUi={hideUi}
          onOpenDrawer={() => setMobileDrawerOpen(true)}
          onOpenSearch={openSearch}
          onCopyShareLink={handleCopyShareLink}
          onOpenSettings={() => dialogs.openDialog('settings')}
          onToggleDarkMode={() => setDarkMode((d) => !d)}
          onOpenShortcuts={openShortcuts}
          onToggleSelectMode={toggleSelectModeShortcut}
          onOpenHistory={() => dialogs.openDialog('history')}
          rightSlot={
            <>
              {site.sheetCsvUrl && (
                <RefreshButton
                  lastFetched={lastFetched}
                  loading={dataStatus === 'loading'}
                  isFallback={isFallback}
                  onRefresh={refreshData}
                />
              )}
              <ExportMenu
                siteKey={site.key}
                siteTitle={site.title}
                fullData={rawTableData}
                filteredData={tableData}
              />
            </>
          }
        />

        {/* 모바일 — 사이트명 배너 (하단 공간) */}
        <MobileSiteBanner
          siteTitle={site.title}
          totalCount={totalCount}
          hideUi={hideUi}
          onOpenSiteModal={() => dialogs.openDialog('site')}
        />

        {/* 모바일 좌측 햄버거 Drawer */}
        <MobileLeftDrawer
          open={mobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
          siteTitle={site.title}
          totalCount={totalCount}
          depth1Categories={depth1Categories}
          sectionFilter={filters.sectionFilter}
          onToggleSectionFilter={filters.toggleSectionFilter}
          onOpenSiteModal={() => dialogs.openDialog('site')}
          onOpenDashboard={() => dialogs.openDialog('dashboard')}
          previewEnabled={previewEnabled}
          onTogglePreview={() => setPreviewEnabled((p) => !p)}
          showIncomplete={filters.showIncomplete}
          onToggleIncomplete={() => filters.setShowIncomplete((s) => !s)}
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
              onCopyShareLink={handleCopyShareLink}
              rightSlot={
                <>
                  {site.sheetCsvUrl && (
                    <RefreshButton
                      lastFetched={lastFetched}
                      loading={dataStatus === 'loading'}
                      isFallback={isFallback}
                      onRefresh={refreshData}
                    />
                  )}
                  <ExportMenu
                    siteKey={site.key}
                    siteTitle={site.title}
                    fullData={rawTableData}
                    filteredData={tableData}
                  />
                </>
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
                        onToggleSelect={handleToggleSelect}
                        onRangeSelect={handleRangeSelect}
                        onOpenFullscreen={setFullscreenItem}
                        onEditNote={(it) => setNoteEditId(it.id)}
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

        {/* 모바일 — 활성 필터 칩 (헤더 아래) */}
        <Box sx={{ display: { xs: 'block', md: 'none' }, px: '10px', py: hasActiveFilters ? '6px' : 0, bgcolor: 'background.paper', borderBottom: hasActiveFilters ? '1px dashed' : 'none', borderColor: 'divider', flexShrink: 0 }}>
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
          bookmarks={bookmarks}
          onToggleBookmark={toggleBookmark}
          selectMode={selectMode}
          selected={selection.selected}
          onToggleSelect={handleToggleSelect}
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
              recentlyViewed={recentlyViewed}
              flatCards={flatCards}
              onItemOpen={openExternal}
              progressHistory={progressHistory}
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

          {fullscreenItem && (
            <FullscreenPreviewDialog
              open
              onClose={() => setFullscreenItem(null)}
              item={fullscreenItem}
            />
          )}

          {noteEditId && (() => {
            // 현재 표시값(오버라이드 적용된)을 dialog의 초깃값으로,
            // 원본 시트 값을 "원본으로 되돌리기" 비교 대상으로 사용.
            const currentItem = itemsById.get(noteEditId) ?? null;
            // 원본은 rawTableData에서 찾는다 (overrides 적용 전).
            let originalNote = '';
            for (const section of rawTableData) {
              const found = section.data.find((d) => d.id === noteEditId);
              if (found) { originalNote = found.note ?? ''; break; }
            }
            const hasOverride = overrides[noteEditId]?.note !== undefined;
            return (
              <NoteEditDialog
                key={noteEditId}
                open
                item={currentItem}
                originalNote={originalNote}
                hasOverride={hasOverride}
                onClose={() => setNoteEditId(null)}
                onSave={(id, note) => setNote(id, note)}
              />
            );
          })()}
        </Suspense>

        {/* 일괄 편집 툴바 — 선택 모드 + 1개 이상 선택 시에만 표시 */}
        <Suspense fallback={null}>
          {selectMode && (
            <BulkEditBar
              selectedCount={selection.size}
              visibleCount={visibleCount}
              onCancel={exitSelectMode}
              onApply={applyBulkProgress}
              onCompare={() => dialogs.openDialog('compare')}
              onSelectAllVisible={selectAllVisible}
              onDeselectAll={deselectAll}
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
            onStartTour={() => setRunOnboarding(true)}
          />
        )}
      </Suspense>

      <Snackbar
        open={!!copyToast}
        message={copyToast ?? ''}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        onClose={() => setCopyToast(null)}
        autoHideDuration={2200}
      />

      <OnboardingTour
        active={runOnboarding}
        step={onboardingStep}
        setStep={setOnboardingStep}
        onClose={() => {
          setRunOnboarding(false);
          setHasCompletedOnboarding(true);
          dialogs.closeDialog('settings');
        }}
      />
    </ThemeProvider>
  );
}
