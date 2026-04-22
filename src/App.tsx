import { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import { tableData } from './data/tableData';
import SectionTable from './components/SectionTable';
import BottomNav from './components/BottomNav';
import './App.css';

function getLatestDate(data: typeof tableData): string {
  const dates = data.flatMap((s) => s.data.map((item) => item.start)).filter(Boolean);
  return [...new Set(dates)].sort().at(-1) ?? '';
}

export default function App() {
  const latestDate = useMemo(() => getLatestDate(tableData), []);
  const totalCount = useMemo(
    () => tableData.reduce((sum, s) => sum + s.data.length, 0),
    []
  );

  return (
    <Box sx={{ boxSizing: 'border-box', p: { xs: '10px', sm: '15px', md: '20px' }, pb: { xs: '90px', sm: '100px', md: '110px' } }}>
      <Typography
        variant="h1"
        sx={{
          fontSize: { xs: 18, sm: 22, md: 30 },
          lineHeight: { xs: '26px', sm: '30px', md: '40px' },
          mb: { xs: '10px', sm: '12px', md: '20px' },
          textAlign: 'center',
          fontWeight: 700,
        }}
      >
        {`사이트제목 (${totalCount})`}
      </Typography>

      <Box sx={{ mb: { xs: '10px', md: '20px' } }}>
        <Box
          component="a"
          href="guide-component.html"
          target="_blank"
          rel="noreferrer"
          sx={{
            display: 'inline-block',
            px: '14px',
            py: '7px',
            fontSize: 16,
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '5px',
            bgcolor: '#666',
            whiteSpace: 'nowrap',
            '&:hover': { bgcolor: '#333' },
          }}
        >
          컴포넌트 가이드
        </Box>
      </Box>

      <BottomNav sections={tableData} />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {tableData.map((section, i) => (
          <SectionTable
            key={i}
            section={section}
            sectionIndex={i}
            latestDate={latestDate}
          />
        ))}
      </Box>
    </Box>
  );
}
