import { useMemo, useState } from 'react';
import { Box, Typography, Dialog, List, ListItem, ListItemButton, ListItemText } from '@mui/material';
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
  const latestDate = useMemo(() => getLatestDate(tableData), []);
  const totalCount = useMemo(
    () => tableData.reduce((sum, s) => sum + s.data.length, 0),
    []
  );

  return (
    <Box sx={{ boxSizing: 'border-box', p: { xs: 0, md: '20px' }, pb: { xs: 0, md: '110px' }, minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
      <Typography
        variant="h1"
        sx={{
          display: { xs: 'none', md: 'block' },
          fontSize: { xs: 18, sm: 22, md: 30 },
          lineHeight: { xs: '26px', sm: '30px', md: '40px' },
          mb: { xs: '10px', sm: '12px', md: '20px' },
          textAlign: 'center',
          fontWeight: 700,
        }}
      >
        {`사이트제목 (${totalCount})`}
      </Typography>



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

      {/* 모바일 뷰: 선택된 1개 섹션만 렌더링 */}
      <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', height: '100dvh', overflow: 'hidden' }}>
        <SectionTable
          section={tableData[mobileActiveIndex]}
          sectionIndex={mobileActiveIndex}
          latestDate={latestDate}
          onHeaderClick={() => setModalOpen(true)}
        />
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
