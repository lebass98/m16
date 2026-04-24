import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { Box, Typography, Dialog, List, ListItem, ListItemButton, ListItemText, Switch } from '@mui/material';
import { sites } from './data/sites';
import SectionTable from './components/SectionTable';
import MobileCard from './components/MobileCard';
import BottomNav from './components/BottomNav';
import './App.css';

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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const flatLengthRef = useRef(0);

  const site = sites[siteIndex];
  const tableData = site.data;

  // 전체 카드를 하나의 flat 배열로
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

  // 섹션별 flat 시작 인덱스
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

  useEffect(() => {
    const handleDir = (e: any) => {
      if (e.detail === 'down') setHideUi(true);
      else if (e.detail === 'up') setHideUi(false);
    };
    window.addEventListener('preview-scroll-dir', handleDir);
    return () => window.removeEventListener('preview-scroll-dir', handleDir);
  }, []);

  // 미리보기 켜질 때 현재 flatIndex 위치로 즉시 스크롤
  useEffect(() => {
    if (!previewEnabled) return;
    requestAnimationFrame(() => {
      const container = scrollContainerRef.current;
      if (container) container.scrollTo({ left: flatIndex * container.clientWidth, behavior: 'instant' });
    });
  }, [previewEnabled]); // eslint-disable-line react-hooks/exhaustive-deps

  // 터치 슬라이드: 항상 한 장씩만 이동
  useEffect(() => {
    if (!previewEnabled) return;
    const container = scrollContainerRef.current;
    if (!container) return;

    let startX = 0;
    let startY = 0;
    let startScrollLeft = 0;
    let isHorizontal: boolean | null = null;

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

    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchmove', onTouchMove, { passive: false });
    container.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchend', onTouchEnd);
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

  const latestDate = useMemo(() => getLatestDate(tableData), [tableData]);
  const totalCount = useMemo(() => tableData.reduce((sum, s) => sum + s.data.length, 0), [tableData]);

  return (
    <Box sx={{ boxSizing: 'border-box', p: { xs: 0, md: '20px' }, pb: { xs: 0, md: '110px' }, height: { xs: '100dvh', md: 'auto' }, minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
      <Box sx={{ overflow: 'hidden', transition: 'all 0.3s ease-in-out', maxHeight: hideUi ? { xs: 0, md: 100 } : 100, opacity: hideUi ? { xs: 0, md: 1 } : 1, mb: hideUi ? { xs: 0, md: '20px' } : { xs: '10px', sm: '12px', md: '20px' }, pt: hideUi ? { xs: 0, md: 0 } : { xs: '10px', md: 0 } }}>
        <Typography
          variant="h1"
          onClick={() => setSiteModalOpen(true)}
          sx={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', fontSize: { xs: 18, sm: 22, md: 30 }, lineHeight: { xs: '26px', sm: '30px', md: '40px' }, textAlign: 'center', fontWeight: 700, cursor: 'pointer', userSelect: 'none', '&:hover': { opacity: 0.75 }, transition: 'opacity 0.15s' }}
        >
          {site.title}
          <Box component="span" sx={{ fontSize: '0.45em', fontWeight: 500, color: '#666', ml: 1, verticalAlign: 'middle' }}>({totalCount} pages)</Box>
          <Box component="span" sx={{ fontSize: '0.4em', color: '#aaa', ml: '6px', verticalAlign: 'middle' }}>▾</Box>
        </Typography>
      </Box>

      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <BottomNav sections={tableData} />
      </Box>

      {/* 데스크탑 */}
      <Box sx={{ display: { xs: 'none', md: 'flex' }, flexDirection: 'column', gap: '10px' }}>
        {tableData.map((section, i) => (
          <SectionTable key={i} section={section} sectionIndex={i} latestDate={latestDate} />
        ))}
      </Box>

      {/* 모바일 미리보기 토글 */}
      <Box sx={{ display: { xs: 'flex', md: 'none' }, position: 'fixed', top: 6, right: 10, zIndex: 1200, alignItems: 'center', gap: '4px', bgcolor: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(8px)', borderRadius: '20px', px: '8px', py: '2px', border: '1px solid rgba(0,0,0,0.1)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Typography sx={{ fontSize: 11, color: '#555', lineHeight: 1, userSelect: 'none' }}>미리보기</Typography>
        <Switch
          checked={previewEnabled}
          onChange={(e) => setPreviewEnabled(e.target.checked)}
          size="small"
          sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#333' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#555' } }}
        />
      </Box>

      {/* 모바일 뷰 */}
      <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        {previewEnabled ? (
          <>
            {/* 섹션 헤더 */}
            <Typography
              component="h2"
              onClick={() => setModalOpen(true)}
              sx={{ m: 0, py: '12px', px: '15px', fontSize: 16, lineHeight: '15px', color: '#fff', bgcolor: 'rgba(51, 51, 51, 0.8)', backdropFilter: 'blur(8px)', fontWeight: 500, textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', cursor: 'pointer', flexShrink: 0 }}
            >
              {currentCard?.sectionTitle}
              <Box component="span" sx={{ fontSize: 12, opacity: 0.6 }}>
                {(currentCard?.cardIdx ?? 0) + 1} / {currentCard?.sectionTotal}
              </Box>
              <Box component="span" sx={{ fontSize: 12, opacity: 0.6 }}>▼</Box>
            </Typography>

            {/* flat 카드 슬라이더 */}
            {flatCards.length > 0 ? (
              <Box
                ref={scrollContainerRef}
                sx={{ display: 'flex', flexDirection: 'row', flex: 1, overflowX: 'auto', '&::-webkit-scrollbar': { display: 'none' }, scrollbarWidth: 'none' }}
              >
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
        <Box sx={{ p: 2, bgcolor: '#f4f4f4', borderBottom: '1px solid #ddd' }}>
          <Typography variant="h6" sx={{ fontSize: 16, fontWeight: 700, textAlign: 'center' }}>사이트 선택</Typography>
        </Box>
        <List sx={{ pt: 0, pb: 0 }}>
          {sites.map((s, i) => (
            <ListItem key={i} disablePadding>
              <ListItemButton onClick={() => { handleSiteChange(i); setSiteModalOpen(false); }} selected={siteIndex === i} sx={{ borderBottom: '1px solid #eee', '&.Mui-selected': { bgcolor: '#e3f2fd' } }}>
                <ListItemText primary={
                  <Typography sx={{ fontSize: 15, fontWeight: siteIndex === i ? 700 : 400 }}>
                    {s.title}
                    <Box component="span" sx={{ ml: 1, fontSize: 12, color: '#999' }}>({s.data.reduce((n, sec) => n + sec.data.length, 0)} pages)</Box>
                  </Typography>
                } />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Dialog>

      {/* 섹션 선택 모달 */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} fullWidth maxWidth="xs">
        <Box sx={{ p: 2, bgcolor: '#f4f4f4', borderBottom: '1px solid #ddd' }}>
          <Typography variant="h6" sx={{ fontSize: 16, fontWeight: 700, textAlign: 'center' }}>메뉴 선택</Typography>
        </Box>
        <List sx={{ pt: 0, pb: 0 }}>
          {tableData.map((section, i) => (
            <ListItem key={i} disablePadding>
              <ListItemButton
                onClick={() => {
                  const target = sectionStartIndices[i];
                  setFlatIndex(target);
                  scrollToFlat(target);
                  setModalOpen(false);
                }}
                selected={currentSectionIdx === i}
                sx={{ borderBottom: '1px solid #eee', '&.Mui-selected': { bgcolor: '#e3f2fd' } }}
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
    </Box>
  );
}
