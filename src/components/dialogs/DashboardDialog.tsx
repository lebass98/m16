import { Dialog, Box, Typography, IconButton, LinearProgress, useTheme } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import type { DashboardStat } from '../../hooks/useFilteredData';
import { progressColors } from '../../theme/tokens';

interface Props {
  open: boolean;
  onClose: () => void;
  totalCount: number;
  overallPc: number;
  overallMo: number;
  dashboardStats: DashboardStat[];
}

export default function DashboardDialog({ open, onClose, totalCount, overallPc, overallMo, dashboardStats }: Props) {
  const { palette } = useTheme();
  const mode = palette.mode;
  const pcAccent = progressColors.pcAccent(mode);
  const moAccent = progressColors.moAccent(mode);
  const doneColor = progressColors.done;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs" slotProps={{ paper: { sx: { m: 2, maxHeight: '85vh' } } }}>
      <Box sx={{ p: '14px 16px', borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography sx={{ fontSize: 16, fontWeight: 700 }}>완성도 요약</Typography>
        <IconButton size="small" onClick={onClose} aria-label="완성도 요약 닫기"><CloseIcon sx={{ fontSize: 18 }} /></IconButton>
      </Box>
      <Box sx={{ overflowY: 'auto', p: '12px 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Box sx={{ p: '12px 14px', bgcolor: 'action.hover', borderRadius: '10px' }}>
          <Typography sx={{ fontSize: 13, fontWeight: 700, mb: '10px', color: 'text.primary' }}>
            전체 ({totalCount} pages)
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Typography sx={{ fontSize: 11, color: 'text.secondary', width: 24, flexShrink: 0 }}>PC</Typography>
              <LinearProgress variant="determinate" value={overallPc} aria-label={`전체 PC 평균 진행도 ${overallPc}%`} sx={{ flex: 1, height: 8, borderRadius: 4, bgcolor: 'action.selected', '& .MuiLinearProgress-bar': { bgcolor: pcAccent } }} />
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: pcAccent, width: 34, textAlign: 'right', flexShrink: 0 }}>{overallPc}%</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Typography sx={{ fontSize: 11, color: 'text.secondary', width: 24, flexShrink: 0 }}>MO</Typography>
              <LinearProgress variant="determinate" value={overallMo} aria-label={`전체 모바일 평균 진행도 ${overallMo}%`} sx={{ flex: 1, height: 8, borderRadius: 4, bgcolor: 'action.selected', '& .MuiLinearProgress-bar': { bgcolor: moAccent } }} />
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: moAccent, width: 34, textAlign: 'right', flexShrink: 0 }}>{overallMo}%</Typography>
            </Box>
          </Box>
        </Box>
        {dashboardStats.map((stat, i) => (
          <Box key={i}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: '6px' }}>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'text.primary' }}>{stat.title}</Typography>
              <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>{stat.count} pages</Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Typography sx={{ fontSize: 11, color: 'text.secondary', width: 24, flexShrink: 0 }}>PC</Typography>
                <LinearProgress variant="determinate" value={stat.avgPc} aria-label={`${stat.title} PC 평균 진행도 ${stat.avgPc}%`} sx={{ flex: 1, height: 6, borderRadius: 3, bgcolor: 'action.selected', '& .MuiLinearProgress-bar': { bgcolor: stat.avgPc === 100 ? doneColor : pcAccent } }} />
                <Typography sx={{ fontSize: 11, fontWeight: 600, color: 'text.secondary', width: 34, textAlign: 'right', flexShrink: 0 }}>{stat.avgPc}%</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Typography sx={{ fontSize: 11, color: 'text.secondary', width: 24, flexShrink: 0 }}>MO</Typography>
                <LinearProgress variant="determinate" value={stat.avgMo} aria-label={`${stat.title} 모바일 평균 진행도 ${stat.avgMo}%`} sx={{ flex: 1, height: 6, borderRadius: 3, bgcolor: 'action.selected', '& .MuiLinearProgress-bar': { bgcolor: stat.avgMo === 100 ? doneColor : moAccent } }} />
                <Typography sx={{ fontSize: 11, fontWeight: 600, color: 'text.secondary', width: 34, textAlign: 'right', flexShrink: 0 }}>{stat.avgMo}%</Typography>
              </Box>
            </Box>
          </Box>
        ))}
      </Box>
    </Dialog>
  );
}
