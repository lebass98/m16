import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { Box, Typography, Dialog, List, ListItem, ListItemButton, ListItemText, Switch, IconButton, TextField, InputAdornment, LinearProgress } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import SearchIcon from '@mui/icons-material/Search';
import BarChartIcon from '@mui/icons-material/BarChart';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import CloseIcon from '@mui/icons-material/Close';
import { sites } from './data/sites';
import SectionTable from './components/SectionTable';
import MobileCard from './components/MobileCard';
import BottomNav from './components/BottomNav';
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
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const flatLengthRef = useRef(0);

  useEffect(() => { localStorage.setItem('darkMode', String(darkMode)); }, [darkMode]);

  const theme = useMemo(() => createTheme({ palette: { mode: darkMode ? 'dark' : 'light' } }), [darkMode]);

  const site = sites[siteIndex];
  const siteColor = site.color ?? '#4a7ab5';
  const tableData = site.data;

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

    let startX = 0;
    let startY = 0;
    let startScrollLeft = 0;
    let isHorizontal: boolean | null = null;
    let isDragging = false;

    const onTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      startScrollLeft = container.scrollLeft;
      isHorizontal = null;
    };
    const onTouchMove = (e: TouchEvent) => {
      const dx = startX - e.touches[0].clientX;
      const dy = startY - e.touches[0].clientY;
      if (isHorizontal === null) isHorizontal = Math.abs(dx) > Math.abs(dy);
      if (!isHorizontal) return;
      e.preventDefault();
      container.scrollLeft = startScrollLeft + dx;
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (!isHorizontal) return;
      const dx = startX - e.changedTouches[0].clientX;
      const width = container.clientWidth;
      const currentIdx = Math.round(startScrollLeft / width);
      const maxIdx = flatLengthRef.current - 1;
      let targetIdx = currentIdx;
      if (dx > 30 && currentIdx < maxIdx) targetIdx = currentIdx + 1;
      else if (dx < -30 && currentIdx > 0) targetIdx = currentIdx - 1;
      setFlatIndex(targetIdx);
      container.scrollTo({ left: targetIdx * width, behavior: 'smooth' });
    };
    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      startScrollLeft = container.scrollLeft;
      isHorizontal = null;
      container.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = startX - e.clientX;
      const dy = startY - e.clientY;
      if (isHorizontal === null) isHorizontal = Math.abs(dx) > Math.abs(dy);
      if (!isHorizontal) return;
      e.preventDefault();
      container.scrollLeft = startScrollLeft + dx;
    };
    const onMouseUp = (e: MouseEvent) => {
      if (!isDragging) return;
      isDragging = false;
      container.style.cursor = 'grab';
      document.body.style.userSelect = '';
      if (!isHorizontal) return;
      const dx = startX - e.clientX;
      const width = container.clientWidth;
      const currentIdx = Math.round(startScrollLeft / width);
      const maxIdx = flatLengthRef.current - 1;
      let targetIdx = currentIdx;
      if (dx > 30 && currentIdx < maxIdx) targetIdx = currentIdx + 1;
      else if (dx < -30 && currentIdx > 0) targetIdx = currentIdx - 1;
      setFlatIndex(targetIdx);
      container.scrollTo({ left: targetIdx * width, behavior: 'smooth' });
    };

    container.style.cursor = 'grab';
    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchmove', onTouchMove, { passive: false });
    container.addEventListener('touchend', onTouchEnd, { passive: true });
    container.addEventListener('mousedown', onMouseDown, { passive: true });
    window.addEventListener('mousemove', onMouseMove, { passive: false });
    window.addEventListener('mouseup', onMouseUp, { passive: true });

    return () => {
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchend', onTouchEnd);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [previewEnabled]);

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

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ boxSizing: 'border-box', p: { xs: 0, md: '20px' }, pb: { xs: 0, md: '110px' }, height: { xs: '100dvh', md: 'auto' }, minHeight: '100vh', display: 'flex', flexDirection: 'column', background: darkMode ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>

        {/* 좌상단 컨트롤 (검색 · 대시보드 · 다크모드) */}
        <Box sx={{ position: 'fixed', top: { xs: 6, md: 12 }, left: { xs: 10, md: 20 }, zIndex: 1200, display: 'flex', alignItems: 'center', backdropFilter: 'blur(8px)', borderRadius: '20px', px: '4px', py: '2px', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', ...ctrlPanelSx }}>
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

        {/* 우상단 미리보기 토글 */}
        <Box sx={{ display: 'flex', position: 'fixed', top: { xs: 6, md: 12 }, right: { xs: 10, md: 20 }, zIndex: 1200, alignItems: 'center', gap: '4px', backdropFilter: 'blur(8px)', borderRadius: '20px', px: '8px', py: '2px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', ...ctrlPanelSx }}>
          <Typography sx={{ fontSize: { xs: 11, md: 13 }, color: darkMode ? 'rgba(255,255,255,0.7)' : '#555', lineHeight: 1, userSelect: 'none' }}>미리보기</Typography>
          <Switch
            checked={previewEnabled}
            onChange={(e) => setPreviewEnabled(e.target.checked)}
            size="small"
            sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#7c9fd4' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#4a7ab5' } }}
          />
        </Box>

        {/* 타이틀 */}
        <Box sx={{ overflow: 'hidden', transition: 'all 0.3s ease-in-out', maxHeight: hideUi ? { xs: 0, md: 100 } : 100, opacity: hideUi ? { xs: 0, md: 1 } : 1, mb: hideUi ? { xs: 0, md: '20px' } : { xs: '10px', sm: '12px', md: '20px' }, pt: hideUi ? { xs: 0, md: 0 } : { xs: '10px', md: 0 }, flexShrink: 0 }}>
          <Typography
            variant="h1"
            onClick={() => setSiteModalOpen(true)}
            sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: { xs: 18, sm: 22, md: 30 }, lineHeight: { xs: '26px', sm: '30px', md: '40px' }, textAlign: 'center', fontWeight: 700, cursor: 'pointer', userSelect: 'none', '&:hover': { opacity: 0.75 }, transition: 'opacity 0.15s' }}
          >
            {site.title}
            <Box component="img" src={arrowDownIcon} alt="select site" sx={{ width: { xs: 18, sm: 22, md: 28 }, height: { xs: 18, sm: 22, md: 28 }, mx: 1, opacity: 0.7, filter: darkMode ? 'invert(1)' : 'none' }} />
            <Box component="span" sx={{ fontSize: '0.45em', fontWeight: 500, color: darkMode ? 'rgba(255,255,255,0.5)' : '#666' }}>({totalCount} pages)</Box>
          </Typography>
        </Box>

        <Box sx={{ display: { xs: 'none', md: 'block' }, flexShrink: 0 }}>
          <BottomNav sections={tableData} />
        </Box>

        {/* 데스크탑 */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, flexDirection: 'column', gap: '10px' }}>
          {tableData.map((section, i) => (
            <SectionTable key={i} section={section} sectionIndex={i} latestDate={latestDate} previewEnabled={previewEnabled} />
          ))}
        </Box>

        {/* 모바일 뷰 */}
        <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          {previewEnabled ? (
            <>
              <Typography
                component="h2"
                onClick={() => setModalOpen(true)}
                sx={{ m: 0, py: '10px', px: '15px', fontSize: 16, lineHeight: '15px', color: '#fff', bgcolor: siteColor, backdropFilter: 'blur(8px)', fontWeight: 500, textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', cursor: 'pointer', flexShrink: 0 }}
              >
                {currentCard?.sectionTitle}
                <Box component="span" sx={{ fontSize: 12, opacity: 0.7 }}>{(currentCard?.cardIdx ?? 0) + 1} / {currentCard?.sectionTotal}</Box>
                <Box component="span" sx={{ fontSize: 12, opacity: 0.7 }}>▼</Box>
              </Typography>
              {/* 섹션 인디케이터 */}
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px', py: '6px', bgcolor: darkMode ? 'rgba(10,10,30,0.85)' : 'rgba(20,20,50,0.75)', flexShrink: 0 }}>
                {tableData.map((_, i) => (
                  <Box
                    key={i}
                    onClick={() => { const t = sectionStartIndices[i]; setFlatIndex(t); scrollToFlat(t); }}
                    sx={{ width: currentSectionIdx === i ? 20 : 6, height: 6, borderRadius: '3px', bgcolor: currentSectionIdx === i ? siteColor : 'rgba(255,255,255,0.3)', transition: 'width 0.25s ease, background-color 0.25s ease', cursor: 'pointer', '&:hover': { bgcolor: currentSectionIdx === i ? siteColor : 'rgba(255,255,255,0.55)' } }}
                  />
                ))}
              </Box>
              {flatCards.length > 0 ? (
                <Box ref={scrollContainerRef} sx={{ display: 'flex', flexDirection: 'row', flex: 1, overflowX: 'auto', '&::-webkit-scrollbar': { display: 'none' }, scrollbarWidth: 'none' }}>
                  {flatCards.map((card, i) => (
                    <Box key={i} sx={{ flexShrink: 0, width: '100%', height: '100%', p: '12px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
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
    </ThemeProvider>
  );
}
