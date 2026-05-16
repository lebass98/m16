import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { Box, Typography, Dialog, List, ListItem, ListItemButton, ListItemText, IconButton, TextField, InputAdornment, LinearProgress, ToggleButtonGroup, ToggleButton, Slider, Checkbox } from '@mui/material';
import { alpha } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import BarChartIcon from '@mui/icons-material/BarChart';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import CloseIcon from '@mui/icons-material/Close';
import ViewListIcon from '@mui/icons-material/ViewList';
import GridViewIcon from '@mui/icons-material/GridView';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import WorkOutlineIcon from '@mui/icons-material/WorkOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import TuneIcon from '@mui/icons-material/Tune';
import { sites } from './data/sites';
import SectionTable from './components/SectionTable';
import MobileCard from './components/MobileCard';
import './App.css';
import arrowDownIcon from './assets/arrow-down-circle-svgrepo-com.svg';

function getLatestDate(data: typeof sites[0]['data']): string {
  const dates = data.flatMap((s) => s.data.map((item) => item.start)).filter(Boolean);
  return [...new Set(dates)].sort().at(-1) ?? '';
}

export default function App() {
  const [siteIndex, setSiteIndex] = useState(() => {
    const key = new URLSearchParams(window.location.search).get('site');
    if (key) { const i = sites.findIndex(s => s.key === key); if (i !== -1) return i; }
    return 0;
  });
  const [siteModalOpen, setSiteModalOpen] = useState(false);
  const [flatIndex, setFlatIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [hideUi, setHideUi] = useState(false);
  const [previewEnabled, setPreviewEnabled] = useState(true);
  const [showIncomplete, setShowIncomplete] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [desktopView, setDesktopView] = useState<'list' | 'thumbnail'>(() =>
    (localStorage.getItem('desktopView') as 'list' | 'thumbnail') || 'thumbnail'
  );
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [progressRange, setProgressRange] = useState<number[]>([0, 100]);
  const [bookmarks, setBookmarks] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem('bookmarks') || '[]')); } catch { return new Set(); }
  });
  const [sectionFilter, setSectionFilter] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'updated' | 'created' | 'progress'>('updated');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const flatLengthRef = useRef(0);

  const toggleBookmark = useCallback((id: string) => {
    setBookmarks(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      localStorage.setItem('bookmarks', JSON.stringify([...next]));
      return next;
    });
  }, []);

  const toggleSectionFilter = useCallback((depth1: string) => {
    setSectionFilter(prev => {
      const next = new Set(prev);
      if (next.has(depth1)) next.delete(depth1); else next.add(depth1);
      return next;
    });
  }, []);

  useEffect(() => { localStorage.setItem('darkMode', String(darkMode)); }, [darkMode]);
  useEffect(() => { localStorage.setItem('desktopView', desktopView); }, [desktopView]);

  const site = sites[siteIndex];
  const siteColor = site.color ?? '#4a7ab5';
  const rawTableData = site.data;
  const tableData = useMemo(() => {
    const [min, max] = progressRange;
    const q = searchFilter.trim().toLowerCase();
    return rawTableData
      .filter(section => sectionFilter.size === 0 || sectionFilter.has(section.depth1))
      .map(section => ({
        ...section,
        data: section.data
          .filter(item => showIncomplete ? true : (item.progressPc ?? 0) !== 0)
          .filter(item => {
            const p = item.progressPc ?? 0;
            return p >= min && p <= max;
          })
          .filter(item => {
            if (!q) return true;
            return [item.pageTitle, item.id, item.depth1, item.depth2, item.depth3, item.note, section.depth1]
              .some(v => v?.toLowerCase().includes(q));
          })
          .slice()
          .sort((a, b) => {
            if (sortBy === 'updated') return (b.updatedAt || '').localeCompare(a.updatedAt || '');
            if (sortBy === 'created') return (b.start || '').localeCompare(a.start || '');
            return (b.progressPc ?? 0) - (a.progressPc ?? 0);
          }),
      }))
      .filter(section => section.data.length > 0);
  }, [rawTableData, showIncomplete, sectionFilter, progressRange, sortBy, searchFilter]);

  const flatCards = useMemo(() =>
    tableData.flatMap((section, si) =>
      section.data.map((item, ci) => ({
        item,
        sectionIdx: si,
        sectionTitle: section.depth1,
        cardIdx: ci,
        sectionTotal: section.data.length,
      }))
    ),
    [tableData]
  );
  flatLengthRef.current = flatCards.length;

  const sectionStartIndices = useMemo(() => {
    let idx = 0;
    return tableData.map(section => {
      const start = idx;
      idx += section.data.length;
      return start;
    });
  }, [tableData]);

  const currentCard = flatCards[Math.min(flatIndex, flatCards.length - 1)];
  const currentSectionIdx = currentCard?.sectionIdx ?? 0;

  const scrollToFlat = useCallback((idx: number) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    container.scrollTo({ left: idx * container.clientWidth, behavior: 'smooth' });
  }, []);

  const latestDate = useMemo(() => getLatestDate(tableData), [tableData]);
  const totalCount = useMemo(() => tableData.reduce((sum, s) => sum + s.data.length, 0), [tableData]);

  // 검색
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return flatCards
      .map((card, globalIdx) => ({ ...card, globalIdx }))
      .filter(({ item }) =>
        [item.pageTitle, item.id, item.depth1, item.depth2, item.depth3, item.note]
          .some(v => v?.toLowerCase().includes(q))
      )
      .slice(0, 30);
  }, [searchQuery, flatCards]);

  // 대시보드 통계
  const dashboardStats = useMemo(() =>
    tableData.map(section => {
      const items = section.data;
      const avgPc = items.length ? Math.round(items.reduce((s, i) => s + (i.progressPc ?? 0), 0) / items.length) : 0;
      const avgMo = items.length ? Math.round(items.reduce((s, i) => s + (i.progressMobile ?? 0), 0) / items.length) : 0;
      return { title: section.depth1, count: items.length, avgPc, avgMo };
    }),
    [tableData]
  );
  const overallPc = totalCount ? Math.round(dashboardStats.reduce((s, d) => s + d.avgPc * d.count, 0) / totalCount) : 0;
  const overallMo = totalCount ? Math.round(dashboardStats.reduce((s, d) => s + d.avgMo * d.count, 0) / totalCount) : 0;

  useEffect(() => {
    const handleDir = (e: any) => {
      if (e.detail === 'down') setHideUi(true);
      else if (e.detail === 'up') setHideUi(false);
    };
    window.addEventListener('preview-scroll-dir', handleDir);
    return () => window.removeEventListener('preview-scroll-dir', handleDir);
  }, []);

  useEffect(() => {
    if (!previewEnabled) return;
    requestAnimationFrame(() => {
      const container = scrollContainerRef.current;
      if (container) container.scrollTo({ left: flatIndex * container.clientWidth, behavior: 'instant' });
    });
  }, [previewEnabled]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!previewEnabled) return;
    const container = scrollContainerRef.current;
    if (!container) return;

    let isScrolling: any;
    const handleScroll = () => {
      clearTimeout(isScrolling);
      isScrolling = setTimeout(() => {
        const idx = Math.round(container.scrollLeft / container.clientWidth);
        if (idx !== flatIndex) setFlatIndex(idx);
      }, 60);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [previewEnabled, flatIndex]);

  const handleSiteChange = (next: number) => {
    setSiteIndex(next);
    setFlatIndex(0);
    history.replaceState(null, '', `?site=${sites[next].key}`);
    setTimeout(() => {
      scrollContainerRef.current?.scrollTo({ left: 0, behavior: 'instant' });
    }, 0);
  };

  const handleSearchNavigate = (globalIdx: number) => {
    setFlatIndex(globalIdx);
    if (!previewEnabled) setPreviewEnabled(true);
    setTimeout(() => scrollToFlat(globalIdx), 50);
    setSearchOpen(false);
    setSearchQuery('');
  };

  const ctrlBtnSx = { p: '4px', color: darkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.6)' };
  const ctrlPanelSx = {
    bgcolor: darkMode ? 'rgba(30,30,50,0.85)' : 'rgba(255,255,255,0.75)',
    border: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
  };
  const toggleBtnSx = (active: boolean) => ({
    border: 'none',
    cursor: 'pointer',
    px: '12px',
    py: '5px',
    borderRadius: '14px',
    fontSize: { xs: 11, md: 12 },
    fontWeight: 600,
    fontFamily: 'inherit',
    lineHeight: 1.2,
    bgcolor: active ? '#4a7ab5' : 'transparent',
    color: active ? 'background.paper' : (darkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'),
    transition: 'background 0.15s, color 0.15s',
    '&:hover': {
      bgcolor: active ? '#3d6699' : (darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'),
    },
  });

  return (
    <>
      <Box sx={{ boxSizing: 'border-box', p: 0, pb: { xs: 0, md: 0 }, height: { xs: '100dvh', md: 'auto' }, minHeight: '100vh', display: 'flex', flexDirection: 'column', background: { xs: darkMode ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', md: 'background.default' } }}>

        {/* 모바일: 좌상단 컨트롤 (검색 · 대시보드 · 다크모드) */}
        <Box sx={{ display: { xs: 'flex', md: 'none' }, position: 'fixed', top: 6, left: 10, zIndex: 1200, alignItems: 'center', backdropFilter: 'blur(8px)', borderRadius: '20px', px: '4px', py: '2px', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', ...ctrlPanelSx }}>
          <IconButton size="small" onClick={() => setSearchOpen(true)} sx={ctrlBtnSx} title="검색">
            <SearchIcon sx={{ fontSize: 18 }} />
          </IconButton>
          <IconButton size="small" onClick={() => setDashboardOpen(true)} sx={ctrlBtnSx} title="완성도">
            <BarChartIcon sx={{ fontSize: 18 }} />
          </IconButton>
          <IconButton size="small" onClick={() => setDarkMode(d => !d)} sx={ctrlBtnSx} title="다크모드">
            {darkMode ? <LightModeIcon sx={{ fontSize: 18 }} /> : <DarkModeIcon sx={{ fontSize: 18 }} />}
          </IconButton>
        </Box>

        {/* 모바일: 우상단 토글 (미리보기 / 미완료 보기) */}
        <Box sx={{ display: { xs: 'flex', md: 'none' }, position: 'fixed', top: 6, right: 10, zIndex: 1200, alignItems: 'center', gap: '4px', backdropFilter: 'blur(8px)', borderRadius: '20px', px: '4px', py: '3px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', ...ctrlPanelSx }}>
          <Box component="button" type="button" onClick={() => setPreviewEnabled(p => !p)} sx={toggleBtnSx(previewEnabled)}>미리보기</Box>
          <Box component="button" type="button" onClick={() => setShowIncomplete(s => !s)} sx={toggleBtnSx(showIncomplete)}>미완료 보기</Box>
        </Box>

        {/* 모바일: 타이틀 */}
        <Box sx={{ display: { xs: 'block', md: 'none' }, overflow: 'hidden', transition: 'all 0.3s ease-in-out', maxHeight: hideUi ? 0 : 100, opacity: hideUi ? 0 : 1, mb: hideUi ? 0 : '10px', pt: hideUi ? 0 : '10px', flexShrink: 0 }}>
          <Typography
            variant="h1"
            onClick={() => setSiteModalOpen(true)}
            sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: { xs: 18, sm: 22 }, lineHeight: { xs: '26px', sm: '30px' }, textAlign: 'center', fontWeight: 700, cursor: 'pointer', userSelect: 'none', '&:hover': { opacity: 0.75 }, transition: 'opacity 0.15s' }}
          >
            {site.title}
            <Box component="img" src={arrowDownIcon} alt="select site" sx={{ width: { xs: 18, sm: 22 }, height: { xs: 18, sm: 22 }, mx: 1, opacity: 0.7, filter: darkMode ? 'invert(1)' : 'none' }} />
            <Box component="span" sx={{ fontSize: '0.45em', fontWeight: 500, color: darkMode ? 'rgba(255,255,255,0.5)' : '#666' }}>({totalCount} pages)</Box>
          </Typography>
        </Box>

        {/* 데스크탑: Minimals UI 대시보드 레이아웃 */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, flexDirection: 'row', minHeight: '100vh', bgcolor: 'grey.200' }}>
          {/* (1) 좌측 화이트 사이드바 (Minimals 스타일) */}
          <Box sx={{ width: 260, flexShrink: 0, bgcolor: 'background.paper', color: 'text.primary', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto', borderRight: '1px dashed rgb(var(--palette-grey-500Channel) / 0.2)' }}>
            <Box onClick={() => setSiteModalOpen(true)} sx={{ display: 'flex', alignItems: 'center', gap: '12px', m: '16px', p: '12px', borderRadius: '12px', bgcolor: 'rgb(var(--palette-grey-500Channel) / 0.08)', cursor: 'pointer', '&:hover': { bgcolor: 'rgb(var(--palette-grey-500Channel) / 0.16)' } }}>
              <Box sx={{ width: 40, height: 40, borderRadius: '10px', bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'background.paper', fontSize: 16, fontWeight: 800 }}>
                {site.title.charAt(0)}
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: 14, fontWeight: 600, color: 'text.primary', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{site.title}</Typography>
                <Typography sx={{ fontSize: 12, color: 'text.secondary', lineHeight: 1.4 }}>{totalCount} pages</Typography>
              </Box>
              <KeyboardArrowDownIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
            </Box>

            <Box sx={{ p: '0 16px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <Typography sx={{ fontSize: 11, color: 'text.secondary', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 700, px: '12px', py: '10px', mt: '6px' }}>Overview</Typography>
              {[
                { label: 'Pages', icon: <GridViewIcon sx={{ fontSize: 20 }} />, active: true, onClick: () => {} },
                { label: 'Dashboard', icon: <BarChartIcon sx={{ fontSize: 20 }} />, active: false, onClick: () => setDashboardOpen(true) },
                { label: 'Search', icon: <SearchIcon sx={{ fontSize: 20 }} />, active: false, onClick: () => setSearchOpen(true) },
              ].map((it, navI) => (
                <Box key={it.label} onClick={it.onClick} className="reveal-right" style={{ animationDelay: `${60 + navI * 50}ms` }} sx={{
                  display: 'flex', alignItems: 'center', gap: '14px', px: '12px', py: '8px', borderRadius: '8px', cursor: 'pointer',
                  bgcolor: it.active ? 'rgb(var(--palette-primary-mainChannel) / 0.08)' : 'transparent',
                  color: it.active ? 'primary.main' : 'text.secondary',
                  fontWeight: it.active ? 600 : 500,
                  position: 'relative',
                  '&:hover': { bgcolor: it.active ? 'rgb(var(--palette-primary-mainChannel) / 0.16)' : 'rgb(var(--palette-grey-500Channel) / 0.08)', color: it.active ? 'primary.main' : 'text.primary' },
                  '&::before': it.active ? { content: '""', position: 'absolute', left: 0, top: '50%', transform: 'translate(-16px,-50%)', width: 3, height: 20, borderRadius: '0 2px 2px 0', bgcolor: 'primary.main' } : {},
                }}>
                  {it.icon}
                  <Typography sx={{ fontSize: 14, fontWeight: 'inherit', color: 'inherit', flex: 1 }}>{it.label}</Typography>
                </Box>
              ))}

              <Typography sx={{ fontSize: 11, color: 'text.secondary', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 700, px: '12px', py: '10px', mt: '14px' }}>섹션</Typography>
              {rawTableData.map((section, i) => {
                const isActive = sectionFilter.has(section.depth1);
                return (
                  <Box key={i} onClick={() => toggleSectionFilter(section.depth1)} className="reveal-right" style={{ animationDelay: `${260 + i * 40}ms` }} sx={{
                    display: 'flex', alignItems: 'center', gap: '12px', px: '12px', py: '8px', borderRadius: '8px', cursor: 'pointer', position: 'relative',
                    bgcolor: isActive ? 'rgb(var(--palette-primary-mainChannel) / 0.08)' : 'transparent',
                    color: isActive ? 'primary.main' : 'text.secondary',
                    '&:hover': { bgcolor: isActive ? 'rgb(var(--palette-primary-mainChannel) / 0.16)' : 'rgb(var(--palette-grey-500Channel) / 0.08)', color: isActive ? 'primary.main' : 'text.primary' },
                    '&::before': isActive ? { content: '""', position: 'absolute', left: 0, top: '50%', transform: 'translate(-16px,-50%)', width: 3, height: 18, borderRadius: '0 2px 2px 0', bgcolor: 'primary.main' } : {},
                  }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: isActive ? 'primary.main' : 'grey.400', flexShrink: 0 }} />
                    <Typography sx={{ fontSize: 13, flex: 1, color: 'inherit', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: isActive ? 600 : 500 }} title={section.depth1}>{section.depth1}</Typography>
                    <Box sx={{ fontSize: 10, fontWeight: 700, color: isActive ? 'primary.main' : 'text.disabled', bgcolor: isActive ? 'rgb(var(--palette-primary-mainChannel) / 0.16)' : 'rgb(var(--palette-grey-500Channel) / 0.12)', px: '6px', py: '2px', borderRadius: '6px', lineHeight: 1.4 }}>{section.data.length}</Box>
                  </Box>
                );
              })}
            </Box>

            <Box sx={{ flex: 1 }} />
            <Box sx={{ m: '16px', p: '16px', borderRadius: '16px', bgcolor: 'rgb(var(--palette-primary-mainChannel) / 0.08)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'background.paper', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                U
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: 13, color: 'text.primary', fontWeight: 600, lineHeight: 1.4 }}>User</Typography>
                <Typography sx={{ fontSize: 11, color: 'text.secondary', lineHeight: 1.4 }}>Online</Typography>
              </Box>
              <IconButton size="small" onClick={() => setDarkMode(d => !d)} sx={{ color: 'text.secondary' }}>
                {darkMode ? <LightModeIcon sx={{ fontSize: 18 }} /> : <DarkModeIcon sx={{ fontSize: 18 }} />}
              </IconButton>
            </Box>
          </Box>

          {/* 우측 컨텐츠 영역 */}
          <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            {/* (2) 상단 헤더 (Minimals) */}
            <Box sx={{ bgcolor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px dashed rgb(var(--palette-grey-500Channel) / 0.2)', px: '32px', py: '14px', display: 'flex', alignItems: 'center', gap: '20px', position: 'sticky', top: 0, zIndex: 10 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography sx={{ fontSize: 11, color: 'text.secondary', letterSpacing: '0.06em', fontWeight: 700, textTransform: 'uppercase' }}>Workspace</Typography>
                <Typography sx={{ fontSize: 18, fontWeight: 700, color: 'text.primary', lineHeight: 1.4 }}>{site.title}</Typography>
              </Box>
              <Box sx={{ flex: 1, maxWidth: 480, position: 'relative' }}>
                <Box sx={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: searchFocused ? 'primary.main' : 'rgb(var(--palette-grey-500Channel) / 0.32)',
                  borderRadius: '12px',
                  px: '14px', py: '8px',
                  boxShadow: searchFocused ? '0 0 0 3px rgb(var(--palette-primary-mainChannel) / 0.16)' : 'none',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                  '&:hover': { borderColor: searchFocused ? 'primary.main' : 'text.primary' },
                }}>
                  <SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                  <Box
                    component="input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') { setSearchQuery(''); setSearchFilter(''); (e.target as HTMLInputElement).blur(); }
                      else if (e.key === 'Enter') { setSearchFilter(searchQuery); setSearchFocused(false); (e.target as HTMLInputElement).blur(); }
                    }}
                    placeholder="페이지·메뉴·메모 검색..."
                    sx={{
                      flex: 1, border: 'none', outline: 'none', bgcolor: 'transparent',
                      fontFamily: 'inherit', fontSize: 14, color: 'text.primary',
                      '&::placeholder': { color: 'text.disabled' },
                    }}
                  />
                  {(searchQuery || searchFilter) && (
                    <IconButton size="small" onMouseDown={(e) => { e.preventDefault(); setSearchQuery(''); setSearchFilter(''); }} sx={{ p: '2px', color: 'text.secondary' }}>
                      <CloseIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  )}
                  <Box sx={{ fontSize: 10, fontWeight: 700, color: 'text.secondary', bgcolor: 'rgb(var(--palette-grey-500Channel) / 0.12)', px: '6px', py: '3px', borderRadius: '6px' }}>ESC</Box>
                </Box>
                {/* 인라인 검색 결과 드롭다운 (Minimals) */}
                {searchFocused && searchQuery.trim() !== '' && (
                  <Box sx={{
                    position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
                    bgcolor: 'background.paper', borderRadius: '16px',
                    boxShadow: '0 0 2px 0 rgb(var(--palette-grey-500Channel) / 0.20), 0 20px 40px -4px rgb(var(--palette-grey-500Channel) / 0.24)',
                    maxHeight: 420, overflowY: 'auto', zIndex: 30, p: '8px',
                  }}>
                    {searchResults.length === 0 ? (
                      <Box sx={{ py: '32px', textAlign: 'center', color: 'text.disabled', fontSize: 14 }}>검색 결과가 없습니다</Box>
                    ) : (
                      <>
                        <Box sx={{ px: '12px', pt: '6px', pb: '8px', display: 'flex', justifyContent: 'space-between' }}>
                          <Typography sx={{ fontSize: 11, color: 'text.secondary', letterSpacing: '0.06em', fontWeight: 700, textTransform: 'uppercase' }}>Results</Typography>
                          <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>{searchResults.length}건</Typography>
                        </Box>
                        {searchResults.map((card) => {
                          const isDone = (card.item.progressPc ?? 0) >= 100;
                          const statusKey = isDone ? 'success' : (card.item.progressPc ?? 0) === 0 ? 'error' : 'primary';
                          const statusColor = `${statusKey}.main`;
                          return (
                            <Box
                              key={card.globalIdx}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                setSearchQuery(card.item.pageTitle || card.item.id);
                                setSearchFilter(card.item.pageTitle || card.item.id);
                                setSearchFocused(false);
                              }}
                              sx={{
                                display: 'flex', alignItems: 'center', gap: '12px',
                                px: '12px', py: '10px',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                '&:hover': { bgcolor: 'rgb(var(--palette-grey-500Channel) / 0.08)' },
                              }}
                            >
                              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: statusColor, flexShrink: 0 }} />
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography sx={{ fontSize: 14, fontWeight: 600, color: 'text.primary', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{card.item.pageTitle || card.item.id}</Typography>
                                <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {[card.sectionTitle, card.item.depth2, card.item.depth3].filter(Boolean).join(' › ')}
                                </Typography>
                              </Box>
                              <Box sx={(theme) => ({ fontSize: 11, color: statusColor, fontWeight: 700, bgcolor: alpha(theme.palette[statusKey].main, 0.12), px: '8px', py: '3px', borderRadius: '8px' })}>{card.item.progressPc}%</Box>
                            </Box>
                          );
                        })}
                      </>
                    )}
                  </Box>
                )}
              </Box>
              <Box sx={{ flex: 1 }} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IconButton size="small" onClick={() => setDashboardOpen(true)} title="완성도" sx={{ color: 'text.secondary', width: 40, height: 40, '&:hover': { bgcolor: 'rgb(var(--palette-grey-500Channel) / 0.08)' } }}>
                  <BarChartIcon sx={{ fontSize: 20 }} />
                </IconButton>
                <Box component="button" type="button" onClick={() => setPreviewEnabled(p => !p)} sx={{
                  border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: 13,
                  px: '14px', py: '7px', borderRadius: '8px',
                  bgcolor: previewEnabled ? 'primary.main' : 'rgb(var(--palette-grey-500Channel) / 0.16)',
                  color: previewEnabled ? 'background.paper' : 'text.primary',
                  transition: 'background 0.15s',
                  '&:hover': { bgcolor: previewEnabled ? 'primary.dark' : 'rgb(var(--palette-grey-500Channel) / 0.24)' },
                }}>미리보기</Box>
                <Box component="button" type="button" onClick={() => setShowIncomplete(s => !s)} sx={{
                  border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: 13,
                  px: '14px', py: '7px', borderRadius: '8px',
                  bgcolor: showIncomplete ? 'primary.main' : 'rgb(var(--palette-grey-500Channel) / 0.16)',
                  color: showIncomplete ? 'background.paper' : 'text.primary',
                  transition: 'background 0.15s',
                  '&:hover': { bgcolor: showIncomplete ? 'primary.dark' : 'rgb(var(--palette-grey-500Channel) / 0.24)' },
                }}>미완료</Box>
              </Box>
            </Box>

            {/* (3) + (4) 메인 + 우측 패널 */}
            <Box sx={{ flex: 1, display: 'flex', gap: '24px', p: '24px 32px', minHeight: 0 }}>
              {/* (3) 메인 콘텐츠 (Minimals) */}
              <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* 필터 칩 row */}
                <Box className="reveal-up" style={{ animationDelay: '40ms' }} sx={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', bgcolor: 'background.paper', borderRadius: '16px', p: '16px 20px', boxShadow: '0 0 2px 0 rgb(var(--palette-grey-500Channel) / 0.20), 0 12px 24px -4px rgb(var(--palette-grey-500Channel) / 0.12)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', bgcolor: 'rgb(var(--palette-grey-500Channel) / 0.12)', px: '10px', py: '6px', borderRadius: '8px' }}>
                      <LocationOnOutlinedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                      <Typography sx={{ fontSize: 12, color: 'text.primary', fontWeight: 600 }}>{sectionFilter.size === 0 ? '전체 메뉴' : `${sectionFilter.size}개 메뉴`}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', bgcolor: 'rgb(var(--palette-grey-500Channel) / 0.12)', px: '10px', py: '6px', borderRadius: '8px' }}>
                      <WorkOutlineIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                      <Typography sx={{ fontSize: 12, color: 'text.primary', fontWeight: 600 }}>정렬: {sortBy === 'updated' ? '최근 업뎃' : sortBy === 'created' ? '생성일' : '진행도'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', bgcolor: 'rgb(var(--palette-grey-500Channel) / 0.12)', px: '10px', py: '6px', borderRadius: '8px' }}>
                      <CalendarMonthOutlinedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                      <Typography sx={{ fontSize: 12, color: 'text.primary', fontWeight: 600 }}>최근 {latestDate || '-'}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 240 }}>
                    <Typography sx={{ fontSize: 12, color: 'text.secondary', whiteSpace: 'nowrap', fontWeight: 600 }}>{progressRange[0]}–{progressRange[1]}%</Typography>
                    <Slider
                      size="small"
                      value={progressRange}
                      onChange={(_, v) => setProgressRange(v as number[])}
                      min={0}
                      max={100}
                      step={20}
                      sx={{ color: 'primary.main', flex: 1, height: 4, '& .MuiSlider-thumb': { width: 14, height: 14, bgcolor: 'primary.main', '&:hover, &.Mui-focusVisible': { boxShadow: '0 0 0 6px rgb(var(--palette-primary-mainChannel) / 0.16)' } }, '& .MuiSlider-track': { border: 'none' }, '& .MuiSlider-rail': { bgcolor: 'rgb(var(--palette-grey-500Channel) / 0.32)', opacity: 1 } }}
                    />
                  </Box>
                </Box>

                {/* 헤더 행: 타이틀 + 정렬/뷰토글 */}
                <Box className="reveal-up" style={{ animationDelay: '100ms' }} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <Typography sx={{ fontSize: 24, fontWeight: 800, color: 'text.primary', letterSpacing: '-0.01em' }}>
                      {searchFilter ? '검색 결과' : 'Recommended pages'}
                    </Typography>
                    <Box sx={{ bgcolor: 'rgb(var(--palette-primary-mainChannel) / 0.16)', color: 'primary.main', px: '10px', py: '4px', borderRadius: '8px', fontSize: 12, fontWeight: 700 }}>
                      {totalCount}
                    </Box>
                    {searchFilter && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', bgcolor: 'rgb(var(--palette-info-mainChannel) / 0.16)', color: 'info.dark', px: '10px', py: '4px', borderRadius: '8px', fontSize: 12 }}>
                        <SearchIcon sx={{ fontSize: 13 }} />
                        <Typography sx={{ fontSize: 12, fontWeight: 700, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'inherit' }} title={searchFilter}>{searchFilter}</Typography>
                        <IconButton size="small" onClick={() => { setSearchQuery(''); setSearchFilter(''); }} sx={{ p: '0px', color: 'inherit', ml: '2px' }}>
                          <CloseIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Box>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>Sort by:</Typography>
                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'text.primary' }}>
                      {sortBy === 'updated' ? '최근 업뎃' : sortBy === 'created' ? '생성일' : '진행도'}
                    </Typography>
                    <IconButton size="small" sx={{ bgcolor: 'rgb(var(--palette-grey-500Channel) / 0.08)', width: 32, height: 32, '&:hover': { bgcolor: 'rgb(var(--palette-grey-500Channel) / 0.16)' } }}>
                      <TuneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    </IconButton>
                    <ToggleButtonGroup
                      size="small"
                      value={desktopView}
                      exclusive
                      onChange={(_, v) => { if (v) setDesktopView(v); }}
                      sx={{
                        bgcolor: 'background.paper',
                        borderRadius: '10px',
                        border: '1px solid rgb(var(--palette-grey-500Channel) / 0.24)',
                        p: '2px',
                        '& .MuiToggleButton-root': {
                          border: 'none',
                          borderRadius: '8px !important',
                          px: '10px',
                          py: '4px',
                          fontSize: 11,
                          textTransform: 'none',
                          color: 'text.secondary',
                          '&.Mui-selected': { bgcolor: 'text.primary', color: 'background.paper', '&:hover': { bgcolor: 'grey.700' } },
                        },
                      }}
                    >
                      <ToggleButton value="list"><ViewListIcon sx={{ fontSize: 16 }} /></ToggleButton>
                      <ToggleButton value="thumbnail"><GridViewIcon sx={{ fontSize: 16 }} /></ToggleButton>
                    </ToggleButtonGroup>
                  </Box>
                </Box>

                {tableData.length === 0 ? (
                  <Box sx={{ bgcolor: 'background.paper', borderRadius: '16px', py: '80px', textAlign: 'center', color: 'text.disabled', fontSize: 14, boxShadow: '0 0 2px 0 rgb(var(--palette-grey-500Channel) / 0.20)' }}>표시할 항목이 없습니다</Box>
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
                        bookmarks={bookmarks}
                        onToggleBookmark={toggleBookmark}
                      />
                    ))}
                  </Box>
                )}
              </Box>

              {/* (4) 우측 정보/활동 패널 (Minimals) */}
              <Box sx={{ width: 320, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* 통계 카드 (Minimals stat widget) */}
                <Box className="reveal-up" style={{ animationDelay: '80ms' }} sx={{ position: 'relative', bgcolor: 'background.paper', borderRadius: '16px', p: '24px', boxShadow: '0 0 2px 0 rgb(var(--palette-grey-500Channel) / 0.20), 0 12px 24px -4px rgb(var(--palette-grey-500Channel) / 0.12)', overflow: 'hidden' }}>
                  <Box sx={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', bgcolor: 'rgb(var(--palette-primary-mainChannel) / 0.08)' }} />
                  <Typography sx={{ position: 'relative', fontSize: 14, color: 'text.secondary', fontWeight: 600, mb: '4px' }}>Overall progress</Typography>
                  <Box sx={{ position: 'relative', display: 'flex', alignItems: 'baseline', gap: '8px', mb: '8px' }}>
                    <Typography sx={{ fontSize: 32, fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>{overallPc}%</Typography>
                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: '2px', bgcolor: 'rgb(var(--palette-success-mainChannel) / 0.16)', color: 'success.dark', px: '8px', py: '3px', borderRadius: '6px', fontSize: 11, fontWeight: 700 }}>
                      <Box component="span" sx={{ fontSize: 12 }}>↑</Box>PC
                    </Box>
                  </Box>
                  <Typography sx={{ position: 'relative', fontSize: 13, color: 'text.secondary', mb: '14px' }}>모바일 진행도 <Box component="span" sx={{ color: 'text.primary', fontWeight: 700 }}>{overallMo}%</Box></Typography>
                  <LinearProgress variant="determinate" value={overallPc} sx={{ height: 6, borderRadius: 3, bgcolor: 'rgb(var(--palette-grey-500Channel) / 0.16)', '& .MuiLinearProgress-bar': { bgcolor: 'primary.main', borderRadius: 3 } }} />
                </Box>

                {/* 최근 업데이트 활동 */}
                <Box className="reveal-up" style={{ animationDelay: '160ms' }} sx={{ bgcolor: 'background.paper', borderRadius: '16px', p: '24px', boxShadow: '0 0 2px 0 rgb(var(--palette-grey-500Channel) / 0.20), 0 12px 24px -4px rgb(var(--palette-grey-500Channel) / 0.12)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '16px' }}>
                    <Typography sx={{ fontSize: 16, fontWeight: 700, color: 'text.primary' }}>최근 업데이트</Typography>
                    <Typography sx={{ fontSize: 13, color: 'primary.main', cursor: 'pointer', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}>전체보기</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {flatCards
                      .filter(c => c.item.updatedAt)
                      .sort((a, b) => (b.item.updatedAt || '').localeCompare(a.item.updatedAt || ''))
                      .slice(0, 5)
                      .map((card, i) => {
                        const isLatest = card.item.updatedAt === latestDate;
                        const isDone = (card.item.progressPc ?? 0) >= 100;
                        const statusKey = isDone ? 'success' : isLatest ? 'info' : (card.item.progressPc ?? 0) === 0 ? 'error' : 'primary';
                        return (
                          <Box key={i} className="reveal-right" style={{ animationDelay: `${220 + i * 60}ms` }} sx={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: card.item.path ? 'pointer' : 'default', '&:hover': card.item.path ? { '& .activity-title': { color: 'primary.main' } } : {} }} onClick={() => { if (card.item.path) window.open(card.item.path, '_blank'); }}>
                            <Box sx={(theme) => ({ width: 40, height: 40, borderRadius: '10px', bgcolor: alpha(theme.palette[statusKey].main, 0.12), color: `${statusKey}.main`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 })}>
                              {(card.sectionTitle?.charAt(0) || '?').toUpperCase()}
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography className="activity-title" sx={{ fontSize: 13, fontWeight: 600, color: 'text.primary', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', transition: 'color 0.2s' }}>{card.item.pageTitle || card.item.id}</Typography>
                              <Typography sx={{ fontSize: 12, color: 'text.secondary', lineHeight: 1.4, mt: '2px' }}>{card.sectionTitle} · {card.item.updatedAt}</Typography>
                            </Box>
                          </Box>
                        );
                      })}
                  </Box>
                </Box>

                {/* 북마크 */}
                {bookmarks.size > 0 && (
                  <Box className="reveal-up" style={{ animationDelay: '240ms' }} sx={{ bgcolor: 'background.paper', borderRadius: '16px', p: '24px', boxShadow: '0 0 2px 0 rgb(var(--palette-grey-500Channel) / 0.20), 0 12px 24px -4px rgb(var(--palette-grey-500Channel) / 0.12)' }}>
                    <Typography sx={{ fontSize: 16, fontWeight: 700, color: 'text.primary', mb: '16px' }}>북마크 <Box component="span" sx={{ color: 'text.secondary', fontWeight: 500 }}>({bookmarks.size})</Box></Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {flatCards.filter(c => bookmarks.has(c.item.id)).slice(0, 5).map((card, i) => (
                        <Box key={i} onClick={() => { if (card.item.path) window.open(card.item.path, '_blank'); }} sx={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: card.item.path ? 'pointer' : 'default', '&:hover': { '& .bm-title': { color: 'primary.main' } } }}>
                          <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: 'rgb(var(--palette-primary-mainChannel) / 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'primary.main', flexShrink: 0 }}>
                            {(card.sectionTitle?.charAt(0) || '?').toUpperCase()}
                          </Box>
                          <Typography className="bm-title" sx={{ fontSize: 13, color: 'text.primary', fontWeight: 600, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', transition: 'color 0.2s' }}>{card.item.pageTitle || card.item.id}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}

                {/* 섹션별 통계 */}
                <Box className="reveal-up" style={{ animationDelay: '320ms' }} sx={{ bgcolor: 'background.paper', borderRadius: '16px', p: '24px', boxShadow: '0 0 2px 0 rgb(var(--palette-grey-500Channel) / 0.20), 0 12px 24px -4px rgb(var(--palette-grey-500Channel) / 0.12)' }}>
                  <Typography sx={{ fontSize: 16, fontWeight: 700, color: 'text.primary', mb: '16px' }}>섹션별 진행도</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {dashboardStats.map((stat, i) => (
                      <Box key={i}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: '6px' }}>
                          <Typography sx={{ fontSize: 12.5, color: 'text.primary', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, mr: '8px' }} title={stat.title}>{stat.title}</Typography>
                          <Typography sx={{ fontSize: 12, fontWeight: 700, color: stat.avgPc === 100 ? 'success.main' : 'primary.main' }}>{stat.avgPc}%</Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={stat.avgPc} sx={{ height: 5, borderRadius: 3, bgcolor: 'rgb(var(--palette-grey-500Channel) / 0.16)', '& .MuiLinearProgress-bar': { bgcolor: stat.avgPc === 100 ? 'success.main' : 'primary.main', borderRadius: 3 } }} />
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* 모바일 뷰 */}
        <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          {previewEnabled ? (
            <>
              <Typography
                component="h2"
                onClick={() => setModalOpen(true)}
                sx={{ m: 0, py: '10px', px: '15px', fontSize: 16, lineHeight: '15px', color: 'background.paper', bgcolor: siteColor, backdropFilter: 'blur(8px)', fontWeight: 500, textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', cursor: 'pointer', flexShrink: 0 }}
              >
                {currentCard?.sectionTitle}
                <Box component="span" sx={{ fontSize: 12, opacity: 0.7 }}>{(currentCard?.cardIdx ?? 0) + 1} / {currentCard?.sectionTotal}</Box>
                <Box component="span" sx={{ fontSize: 12, opacity: 0.7 }}>▼</Box>
              </Typography>
              {/* 섹션 + 카드 인디케이터 */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', py: '6px', px: '10px', bgcolor: darkMode ? 'rgba(10,10,30,0.85)' : 'rgba(20,20,50,0.75)', flexShrink: 0 }}>
                {/* 섹션 dots */}
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px' }}>
                  {tableData.map((_, i) => (
                    <Box
                      key={i}
                      onClick={() => { const t = sectionStartIndices[i]; setFlatIndex(t); scrollToFlat(t); }}
                      sx={{
                        width: currentSectionIdx === i ? 22 : 6,
                        height: 6,
                        borderRadius: '3px',
                        bgcolor: currentSectionIdx === i ? siteColor : 'rgba(255,255,255,0.3)',
                        transition: 'width 0.3s cubic-bezier(0.34,1.56,0.64,1), background-color 0.25s ease',
                        cursor: 'pointer',
                        animation: currentSectionIdx === i ? 'dotPulse 1.8s ease-in-out infinite' : 'none',
                        '&:hover': { bgcolor: currentSectionIdx === i ? siteColor : 'rgba(255,255,255,0.6)', transform: 'scale(1.3)' },
                      }}
                    />
                  ))}
                </Box>
                {/* 카드 x/n 미니 라벨 */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Box component="span" sx={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.04em' }}>
                    {(currentCard?.cardIdx ?? 0) + 1} / {currentCard?.sectionTotal ?? 0}
                  </Box>
                  <Box component="span" sx={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>·</Box>
                  <Box component="span" sx={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.02em' }}>← 스와이프 →</Box>
                </Box>
              </Box>
              {flatCards.length > 0 ? (
                <Box ref={scrollContainerRef} sx={{ display: 'flex', flexDirection: 'row', flex: 1, overflowX: 'auto', '&::-webkit-scrollbar': { display: 'none' }, scrollbarWidth: 'none', scrollSnapType: 'x mandatory' }}>
                  {flatCards.map((card, i) => (
                    <Box key={i} className="card-enter" sx={{ flexShrink: 0, width: '100%', height: '100%', p: '12px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', scrollSnapAlign: 'center', animationDelay: `${i * 0.05}s` }}>
                      <MobileCard item={card.item} cardNumber={card.cardIdx + 1} latestDate={latestDate} hideUi={hideUi} />
                    </Box>
                  ))}
                </Box>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: '#999', fontSize: 14 }}>데이터가 없습니다</Box>
              )}
            </>
          ) : (
            <Box sx={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', p: '10px', '&::-webkit-scrollbar': { display: 'none' }, scrollbarWidth: 'none' }}>
              {tableData.length > 0 ? tableData.map((section, i) => (
                <SectionTable key={i} section={section} sectionIndex={i} latestDate={latestDate} hideUi={hideUi} previewEnabled={false} />
              )) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: '#999', fontSize: 14 }}>데이터가 없습니다</Box>
              )}
            </Box>
          )}
        </Box>

        {/* 사이트 선택 모달 */}
        <Dialog open={siteModalOpen} onClose={() => setSiteModalOpen(false)} fullWidth maxWidth="xs">
          <List sx={{ pt: 0, pb: 0 }}>
            {sites.map((s, i) => (
              <ListItem key={i} disablePadding>
                <ListItemButton onClick={() => { handleSiteChange(i); setSiteModalOpen(false); }} selected={siteIndex === i} sx={{ gap: 1.5 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: s.color ?? '#4a7ab5', flexShrink: 0 }} />
                  <ListItemText
                    primary={
                      <Typography sx={{ fontSize: 15, fontWeight: siteIndex === i ? 700 : 400 }}>
                        {s.title}
                        <Box component="span" sx={{ ml: 1, fontSize: 12, color: 'text.secondary' }}>({s.data.reduce((n, sec) => n + sec.data.length, 0)} pages)</Box>
                      </Typography>
                    }
                    secondary={s.description}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Dialog>

        {/* 섹션 선택 모달 */}
        <Dialog open={modalOpen} onClose={() => setModalOpen(false)} fullWidth maxWidth="xs">
          <List sx={{ pt: 0, pb: 0 }}>
            {tableData.map((section, i) => (
              <ListItem key={i} disablePadding>
                <ListItemButton
                  onClick={() => { const target = sectionStartIndices[i]; setFlatIndex(target); scrollToFlat(target); setModalOpen(false); }}
                  selected={currentSectionIdx === i}
                >
                  <ListItemText primary={
                    <Typography sx={{ fontSize: 15, fontWeight: currentSectionIdx === i ? 700 : 400 }}>
                      {`${section.depth1} (${section.data.length})`}
                    </Typography>
                  } />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Dialog>

        {/* 검색 모달 */}
        <Dialog open={searchOpen} onClose={() => { setSearchOpen(false); setSearchQuery(''); }} fullWidth maxWidth="xs" slotProps={{ paper: { sx: { m: 2, maxHeight: '80vh' } } }}>
          <Box sx={{ p: '12px 16px', borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
            <TextField
              autoFocus
              fullWidth
              size="small"
              placeholder="페이지명, 메뉴, 메모 검색..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} /></InputAdornment>,
                }
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '20px' } }}
            />
            <IconButton size="small" onClick={() => { setSearchOpen(false); setSearchQuery(''); }}>
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
          <Box sx={{ overflowY: 'auto' }}>
            {searchQuery.trim() === '' ? (
              <Box sx={{ py: 4, textAlign: 'center', color: 'text.secondary', fontSize: 13 }}>검색어를 입력하세요</Box>
            ) : searchResults.length === 0 ? (
              <Box sx={{ py: 4, textAlign: 'center', color: 'text.secondary', fontSize: 13 }}>검색 결과가 없습니다</Box>
            ) : (
              <List dense sx={{ pt: 0, pb: 0 }}>
                {searchResults.map((card) => (
                  <ListItem key={card.globalIdx} disablePadding>
                    <ListItemButton onClick={() => handleSearchNavigate(card.globalIdx)} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                      <ListItemText
                        primary={<Typography sx={{ fontSize: 14, fontWeight: 600 }}>{card.item.pageTitle || card.item.id}</Typography>}
                        secondary={
                          <Typography component="span" sx={{ fontSize: 11, color: 'text.secondary' }}>
                            {[card.sectionTitle, card.item.depth2, card.item.depth3].filter(Boolean).join(' > ')}
                          </Typography>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </Dialog>

        {/* 완성도 대시보드 모달 */}
        <Dialog open={dashboardOpen} onClose={() => setDashboardOpen(false)} fullWidth maxWidth="xs" slotProps={{ paper: { sx: { m: 2, maxHeight: '85vh' } } }}>
          <Box sx={{ p: '14px 16px', borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography sx={{ fontSize: 16, fontWeight: 700 }}>완성도 요약</Typography>
            <IconButton size="small" onClick={() => setDashboardOpen(false)}><CloseIcon sx={{ fontSize: 18 }} /></IconButton>
          </Box>
          <Box sx={{ overflowY: 'auto', p: '12px 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* 전체 요약 */}
            <Box sx={{ p: '12px 14px', bgcolor: 'action.hover', borderRadius: '10px' }}>
              <Typography sx={{ fontSize: 13, fontWeight: 700, mb: '10px', color: 'text.primary' }}>
                전체 ({totalCount} pages)
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Typography sx={{ fontSize: 11, color: 'text.secondary', width: 24, flexShrink: 0 }}>PC</Typography>
                  <LinearProgress variant="determinate" value={overallPc} sx={{ flex: 1, height: 8, borderRadius: 4, bgcolor: 'action.selected', '& .MuiLinearProgress-bar': { bgcolor: '#4a7ab5' } }} />
                  <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#4a7ab5', width: 34, textAlign: 'right', flexShrink: 0 }}>{overallPc}%</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Typography sx={{ fontSize: 11, color: 'text.secondary', width: 24, flexShrink: 0 }}>MO</Typography>
                  <LinearProgress variant="determinate" value={overallMo} sx={{ flex: 1, height: 8, borderRadius: 4, bgcolor: 'action.selected', '& .MuiLinearProgress-bar': { bgcolor: '#7c9fd4' } }} />
                  <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#7c9fd4', width: 34, textAlign: 'right', flexShrink: 0 }}>{overallMo}%</Typography>
                </Box>
              </Box>
            </Box>
            {/* 섹션별 */}
            {dashboardStats.map((stat, i) => (
              <Box key={i}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: '6px' }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'text.primary' }}>{stat.title}</Typography>
                  <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>{stat.count} pages</Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Typography sx={{ fontSize: 11, color: 'text.secondary', width: 24, flexShrink: 0 }}>PC</Typography>
                    <LinearProgress variant="determinate" value={stat.avgPc} sx={{ flex: 1, height: 6, borderRadius: 3, bgcolor: 'action.selected', '& .MuiLinearProgress-bar': { bgcolor: stat.avgPc === 100 ? '#4caf50' : '#4a7ab5' } }} />
                    <Typography sx={{ fontSize: 11, fontWeight: 600, color: 'text.secondary', width: 34, textAlign: 'right', flexShrink: 0 }}>{stat.avgPc}%</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Typography sx={{ fontSize: 11, color: 'text.secondary', width: 24, flexShrink: 0 }}>MO</Typography>
                    <LinearProgress variant="determinate" value={stat.avgMo} sx={{ flex: 1, height: 6, borderRadius: 3, bgcolor: 'action.selected', '& .MuiLinearProgress-bar': { bgcolor: stat.avgMo === 100 ? '#66bb6a' : '#7c9fd4' } }} />
                    <Typography sx={{ fontSize: 11, fontWeight: 600, color: 'text.secondary', width: 34, textAlign: 'right', flexShrink: 0 }}>{stat.avgMo}%</Typography>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </Dialog>

      </Box>
    </>
  );
}
