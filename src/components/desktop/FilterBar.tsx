import { Box, Typography, Slider } from '@mui/material';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import WorkOutlineIcon from '@mui/icons-material/WorkOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import { SORT_LABELS, type SortKey } from '../../constants/sort';
import GlassCard from '../GlassCard';

interface Props {
  sectionFilterCount: number;
  sortBy: SortKey;
  latestDate: string;
  progressRange: number[];
  onChangeProgressRange: (range: number[]) => void;
}

export default function FilterBar({ sectionFilterCount, sortBy, latestDate, progressRange, onChangeProgressRange }: Props) {
  return (
    <GlassCard className="reveal-up" style={{ animationDelay: '40ms' }} sx={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', p: { md: '12px 14px', lg: '16px 20px' } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, flexWrap: 'wrap', minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', bgcolor: 'rgb(var(--palette-grey-500Channel) / 0.12)', px: '10px', py: '6px', borderRadius: '8px' }}>
          <LocationOnOutlinedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
          <Typography sx={{ fontSize: 12, color: 'text.primary', fontWeight: 600 }}>{sectionFilterCount === 0 ? '전체 메뉴' : `${sectionFilterCount}개 메뉴`}</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', bgcolor: 'rgb(var(--palette-grey-500Channel) / 0.12)', px: '10px', py: '6px', borderRadius: '8px' }}>
          <WorkOutlineIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
          <Typography sx={{ fontSize: 12, color: 'text.primary', fontWeight: 600 }}>정렬: {SORT_LABELS[sortBy]}</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', bgcolor: 'rgb(var(--palette-grey-500Channel) / 0.12)', px: '10px', py: '6px', borderRadius: '8px' }}>
          <CalendarMonthOutlinedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
          <Typography sx={{ fontSize: 12, color: 'text.primary', fontWeight: 600 }}>최근 {latestDate || '-'}</Typography>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: { md: 180, lg: 240 }, flex: { md: '1 0 100%', lg: '0 0 auto' } }}>
        <Typography sx={{ fontSize: 12, color: 'text.secondary', whiteSpace: 'nowrap', fontWeight: 600 }}>{progressRange[0]}–{progressRange[1]}%</Typography>
        <Slider
          size="small"
          value={progressRange}
          onChange={(_, v) => onChangeProgressRange(v as number[])}
          min={0}
          max={100}
          step={20}
          sx={{ color: 'primary.main', flex: 1, height: 4, '& .MuiSlider-thumb': { width: 14, height: 14, bgcolor: 'primary.main', '&:hover, &.Mui-focusVisible': { boxShadow: '0 0 0 6px rgb(var(--palette-primary-mainChannel) / 0.16)' } }, '& .MuiSlider-track': { border: 'none' }, '& .MuiSlider-rail': { bgcolor: 'rgb(var(--palette-grey-500Channel) / 0.32)', opacity: 1 } }}
        />
      </Box>
    </GlassCard>
  );
}
