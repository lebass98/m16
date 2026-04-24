import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { Box, Typography, Dialog, List, ListItem, ListItemButton, ListItemText, Switch } from '@mui/material';
import { tableData } from './data/tableData';
import SectionTable from './components/SectionTable';
import BottomNav from './components/BottomNav';
import './App.css';

function getLatestDate(data: typeof tableData): string {
  const dates = data.flatMap((s) => s.data.map((item) => item.start)).filter(Boolean);
  return [...new Set(dates)].sort().at(-1) ?? '';
}

export default function App() {
  const [mobileActiveIndex, setMobileActiveIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [hideUi, setHideUi] = useState(false);
  const [previewEnabled, setPreviewEnabled] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToSection = useCallback((index: number) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    container.scrollTo({ left: index * container.clientWidth, behavior: 'smooth' });
  }, []);

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
    const container = scrollContainerRef.current;
    if (!container) return;
    const handleScroll = () => {
      const idx = Math.round(container.scrollLeft / container.clientWidth);
      setMobileActiveIndex(idx);
    };
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [previewEnabled]);

  const latestDate = useMemo(() => getLatestDate(tableData), []);
  const totalCount = useMemo(
    () => tableData.reduce((sum, s) => sum + s.data.length, 0),
    []
  );

  return (
    <Box sx={{ boxSizing: 'border-box', p: { xs: 0, md: '20px' }, pb: { xs: 0, md: '110px' }, height: { xs: '100dvh', md: 'auto' }, minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
      <Box
        sx={{
          overflow: 'hidden',
          transition: 'all 0.3s ease-in-out',
          maxHeight: hideUi ? { xs: 0, md: 100 } : 100,
          opacity: hideUi ? { xs: 0, md: 1 } : 1,
          mb: hideUi ? { xs: 0, md: '20px' } : { xs: '10px', sm: '12px', md: '20px' },
          pt: hideUi ? { xs: 0, md: 0 } : { xs: '10px', md: 0 },
        }}
      >
        <Typography
          variant="h1"
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'baseline',
            fontSize: { xs: 18, sm: 22, md: 30 },
            lineHeight: { xs: '26px', sm: '30px', md: '40px' },
            textAlign: 'center',
            fontWeight: 700,
          }}
        >
          한국건강가정진흥원
          <Box component="span" sx={{ fontSize: '0.45em', fontWeight: 500, color: '#666', ml: 1, verticalAlign: 'middle' }}>
            ({totalCount} pages)
          </Box>
        </Typography>
      </Box>



      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <BottomNav sections={tableData} />
      </Box>

      {/* 데스크탑 뷰: 전체 섹션 렌더링 */}
      <Box sx={{ display: { xs: 'none', md: 'flex' }, flexDirection: 'column', gap: '10px' }}>
        {tableData.map((section, i) => (
          <SectionTable
            key={i}
            section={section}
            sectionIndex={i}
            latestDate={latestDate}
          />
        ))}
      </Box>

      {/* 모바일 미리보기 토글 */}
      <Box sx={{
        display: { xs: 'flex', md: 'none' },
        position: 'fixed',
        top: 6,
        right: 10,
        zIndex: 1200,
        alignItems: 'center',
        gap: '4px',
        bgcolor: 'rgba(255,255,255,0.75)',
        backdropFilter: 'blur(8px)',
        borderRadius: '20px',
        px: '8px',
        py: '2px',
        border: '1px solid rgba(0,0,0,0.1)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}>
        <Typography sx={{ fontSize: 11, color: '#555', lineHeight: 1, userSelect: 'none' }}>미리보기</Typography>
        <Switch
          checked={previewEnabled}
          onChange={(e) => setPreviewEnabled(e.target.checked)}
          size="small"
          sx={{
            '& .MuiSwitch-switchBase.Mui-checked': { color: '#333' },
            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#555' },
          }}
        />
      </Box>

      {/* 모바일 뷰 */}
      <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        {previewEnabled ? (
          <Box
            ref={scrollContainerRef}
            sx={{
              display: 'flex',
              flexDirection: 'row',
              flex: 1,
              overflowX: 'auto',
              scrollSnapType: 'x mandatory',
              '&::-webkit-scrollbar': { display: 'none' },
              scrollbarWidth: 'none',
            }}
          >
            {tableData.map((section, i) => (
              <Box key={i} sx={{ flexShrink: 0, width: '100%', height: '100%', scrollSnapAlign: 'start', display: 'flex', flexDirection: 'column' }}>
                <SectionTable
                  section={section}
                  sectionIndex={i}
                  latestDate={latestDate}
                  onHeaderClick={() => setModalOpen(true)}
                  hideUi={hideUi}
                  previewEnabled={previewEnabled}
                />
              </Box>
            ))}
          </Box>
        ) : (
          <Box sx={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', p: '10px', '&::-webkit-scrollbar': { display: 'none' }, scrollbarWidth: 'none' }}>
            {tableData.map((section, i) => (
              <SectionTable
                key={i}
                section={section}
                sectionIndex={i}
                latestDate={latestDate}
                hideUi={hideUi}
                previewEnabled={previewEnabled}
              />
            ))}
          </Box>
        )}
      </Box>

      {/* 모바일 섹션 선택 모달 */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} fullWidth maxWidth="xs">
        <Box sx={{ p: 2, bgcolor: '#f4f4f4', borderBottom: '1px solid #ddd' }}>
          <Typography variant="h6" sx={{ fontSize: 16, fontWeight: 700, textAlign: 'center' }}>메뉴 선택</Typography>
        </Box>
        <List sx={{ pt: 0, pb: 0 }}>
          {tableData.map((section, i) => (
            <ListItem key={i} disablePadding>
              <ListItemButton 
                onClick={() => {
                  setMobileActiveIndex(i);
                  scrollToSection(i);
                  setModalOpen(false);
                }}
                selected={mobileActiveIndex === i}
                sx={{
                  borderBottom: '1px solid #eee',
                  '&.Mui-selected': { bgcolor: '#e3f2fd' }
                }}
              >
                <ListItemText 
                  primary={
                    <Typography sx={{ fontSize: 15, fontWeight: mobileActiveIndex === i ? 700 : 400 }}>
                      {`${section.depth1} (${section.data.length})`}
                    </Typography>
                  } 
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Dialog>
    </Box>
  );
}
