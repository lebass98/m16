import { Paper, Box, Button } from '@mui/material';
import type { TableSection } from '../types';

interface Props {
  sections: TableSection[];
}

export default function BottomNav({ sections }: Props) {
  function handleNavClick(sectionIndex: number) {
    const el = document.getElementById(`section-${sectionIndex}`);
    if (!el) return;
    el.classList.remove('index-section--clicked');
    void el.offsetWidth;
    el.classList.add('index-section--clicked');
  }

  return (
    <Paper
      elevation={0}
      sx={{
        position: 'fixed',
        zIndex: 1000,
        left: 0,
        bottom: 0,
        width: '100%',
        boxSizing: 'border-box',
        p: { xs: '8px 10px', md: '10px 20px' },
        bgcolor: 'rgba(255, 255, 255, 0.3)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        borderRadius: 0,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'nowrap',
          gap: '6px',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          pb: '2px',
          '&::-webkit-scrollbar': { height: '3px' },
          '&::-webkit-scrollbar-thumb': { background: 'rgba(255,255,255,0.3)', borderRadius: '3px' },
        }}
      >
        {sections.map((section, i) => (
          <Button
            key={i}
            component="a"
            href={`#section-${i}`}
            onClick={() => handleNavClick(i)}
            size="small"
            variant="contained"
            sx={{
              flexShrink: 0,
              bgcolor: '#066cb3',
              color: '#fff',
              fontSize: 16,
              lineHeight: '20px',
              px: '14px',
              py: '7px',
              borderRadius: '5px',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              textTransform: 'none',
              '&:hover': { bgcolor: '#0558a0' },
            }}
          >
            {section.depth1}
          </Button>
        ))}
      </Box>
    </Paper>
  );
}
