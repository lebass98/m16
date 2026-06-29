import { Box, Typography } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

interface Props {
  siteTitle: string;
  totalCount: number;
  hideUi: boolean;
  onOpenSiteModal: () => void;
}

/**
 * 모바일 상단바 바로 아래에 위치하는 프로젝트(사이트) 명 배너.
 * 클릭 시 사이트 선택 다이얼로그 열림.
 * hideUi=true 시 상단바와 함께 자동 숨김.
 */
export default function MobileSiteBanner({ siteTitle, totalCount, hideUi, onOpenSiteModal }: Props) {
  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={onOpenSiteModal}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpenSiteModal(); } }}
      aria-label={`${siteTitle} (${totalCount} pages) — 사이트 변경`}
      sx={{
        display: { xs: 'flex', md: 'none' },
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        px: '16px',
        bgcolor: 'rgb(var(--palette-background-paperChannel) / 0.6)',
        borderBottom: hideUi ? 'none' : '1px solid rgb(var(--palette-grey-500Channel) / 0.12)',
        cursor: 'pointer',
        userSelect: 'none',
        flexShrink: 0,
        // 자동 숨김 (상단바와 동기)
        maxHeight: hideUi ? 0 : 56,
        minHeight: hideUi ? 0 : 44,
        opacity: hideUi ? 0 : 1,
        overflow: 'hidden',
        transition: 'all 0.25s ease-in-out',
        '&:hover': { bgcolor: 'rgb(var(--palette-background-paperChannel) / 0.8)' },
        '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: -2 },
      }}
    >
      <Typography
        component="h1"
        sx={{
          fontSize: 16,
          fontWeight: 700,
          color: 'text.primary',
          lineHeight: 1.4,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {siteTitle}
      </Typography>
      <Box component="span" sx={{ fontSize: 12, fontWeight: 500, color: 'text.secondary' }}>
        ({totalCount} pages)
      </Box>
      <KeyboardArrowDownIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
    </Box>
  );
}
