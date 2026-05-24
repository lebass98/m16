import { Box, Typography } from '@mui/material';
import arrowDownIcon from '../../assets/arrow-down-circle-svgrepo-com.svg';

interface Props {
  siteTitle: string;
  totalCount: number;
  hideUi: boolean;
  darkMode: boolean;
  onOpenSiteModal: () => void;
}

export default function MobileHeader({ siteTitle, totalCount, hideUi, darkMode, onOpenSiteModal }: Props) {
  return (
    <Box sx={{ display: { xs: 'block', md: 'none' }, overflow: 'hidden', transition: 'all 0.3s ease-in-out', maxHeight: hideUi ? 0 : 100, opacity: hideUi ? 0 : 1, mb: hideUi ? 0 : '10px', pt: hideUi ? 0 : '10px', flexShrink: 0 }}>
      <Typography
        variant="h1"
        onClick={onOpenSiteModal}
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: { xs: 18, sm: 22 }, lineHeight: { xs: '26px', sm: '30px' }, textAlign: 'center', fontWeight: 700, cursor: 'pointer', userSelect: 'none', '&:hover': { opacity: 0.75 }, transition: 'opacity 0.15s' }}
      >
        {siteTitle}
        <Box component="img" src={arrowDownIcon} alt="select site" sx={{ width: { xs: 18, sm: 22 }, height: { xs: 18, sm: 22 }, mx: 1, opacity: 0.7, filter: darkMode ? 'invert(1)' : 'none' }} />
        <Box component="span" sx={{ fontSize: '0.45em', fontWeight: 500, color: darkMode ? 'rgba(255,255,255,0.5)' : '#666' }}>({totalCount} pages)</Box>
      </Typography>
    </Box>
  );
}
