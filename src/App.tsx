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
