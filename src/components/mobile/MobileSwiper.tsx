import type { RefObject } from 'react';
import { Box, Typography } from '@mui/material';
import MobileCard from '../MobileCard';
import SectionTable from '../SectionTable';
import type { TableSection } from '../../types';
import type { FlatCard } from '../../hooks/useFilteredData';

interface Props {
  previewEnabled: boolean;
  tableData: TableSection[];
  flatCards: FlatCard[];
  currentCard: FlatCard | undefined;
  currentSectionIdx: number;
  sectionStartIndices: number[];
  latestDate: string;
  hideUi: boolean;
  darkMode: boolean;
  siteColor: string;
  scrollContainerRef: RefObject<HTMLDivElement | null>;
  onOpenSectionModal: () => void;
  onSelectSection: (sectionIdx: number) => void;
}

export default function MobileSwiper({
  previewEnabled,
  tableData,
  flatCards,
  currentCard,
  currentSectionIdx,
  sectionStartIndices,
  latestDate,
  hideUi,
  darkMode,
  siteColor,
  scrollContainerRef,
  onOpenSectionModal,
  onSelectSection,
}: Props) {
  return (
    <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      {previewEnabled ? (
        <>
          <Typography
            component="h2"
            onClick={onOpenSectionModal}
            sx={{ m: 0, py: '10px', px: '15px', fontSize: 16, lineHeight: '15px', color: 'background.paper', bgcolor: siteColor, backdropFilter: 'blur(8px)', fontWeight: 500, textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', cursor: 'pointer', flexShrink: 0 }}
          >
            {currentCard?.sectionTitle}
            <Box component="span" sx={{ fontSize: 12, opacity: 0.7 }}>{(currentCard?.cardIdx ?? 0) + 1} / {currentCard?.sectionTotal}</Box>
            <Box component="span" sx={{ fontSize: 12, opacity: 0.7 }}>▼</Box>
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', py: '6px', px: '10px', bgcolor: darkMode ? 'rgba(10,10,10,0.85)' : 'rgba(20,20,50,0.75)', flexShrink: 0 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px' }}>
              {tableData.map((_, i) => (
                <Box
                  key={i}
                  onClick={() => onSelectSection(sectionStartIndices[i])}
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
  );
}
