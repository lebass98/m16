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
    <Box
      sx={{
        position: 'fixed',
        zIndex: 1000,
        left: 0,
        bottom: 0,
        width: '100%',
        boxSizing: 'border-box',
        p: { xs: '8px 10px', md: '30px 20px' },
      }}
    >
      {/* 점진적 블러(Gradient Blur) 배경 레이어 */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1,
          bgcolor: 'rgba(255, 255, 255, 0.1)', // 기존보다 살짝 진하게 설정해 투명해지는 구간 보완
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          // 상단은 투명하게, 하단으로 갈수록 불투명해지도록 마스크 적용
          maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 60%, black 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 60%, black 100%)',
        }}
      />
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'nowrap',
          gap: '6px',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          pb: '2px',
          '&::-webkit-scrollbar': { height: '3px' },
          '&::-webkit-scrollbar-thumb': { background: 'rgba(255,255,255,0.1)', borderRadius: '3px' },
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
    </Box>
  );
}
