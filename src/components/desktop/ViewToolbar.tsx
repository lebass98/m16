import { Box, Typography, Select, MenuItem, ToggleButton, ToggleButtonGroup, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import ViewListIcon from '@mui/icons-material/ViewList';
import GridViewIcon from '@mui/icons-material/GridView';
import DesktopWindowsOutlinedIcon from '@mui/icons-material/DesktopWindowsOutlined';
import TabletMacOutlinedIcon from '@mui/icons-material/TabletMacOutlined';
import SmartphoneOutlinedIcon from '@mui/icons-material/SmartphoneOutlined';
import { SORT_KEYS, SORT_LABELS, type SortKey } from '../../constants/sort';

export type DesktopView = 'list' | 'thumbnail';
export type ThumbnailDevice = 'pc' | 'tablet' | 'mobile';
export type ThumbnailCols = 2 | 3 | 4 | 5;

interface Props {
  searchFilter: string;
  totalCount: number;
  sortBy: SortKey;
  onSetSortBy: (key: SortKey) => void;
  desktopView: DesktopView;
  onSetDesktopView: (v: DesktopView) => void;
  thumbnailDevice: ThumbnailDevice;
  onSetThumbnailDevice: (v: ThumbnailDevice) => void;
  thumbnailCols: ThumbnailCols;
  onSetThumbnailCols: (v: ThumbnailCols) => void;
  onClearSearchFilter: () => void;
}

const toggleGroupSx = {
  bgcolor: 'background.paper',
  borderRadius: '10px',
  border: '1px solid rgb(var(--palette-grey-500Channel) / 0.24)',
  p: '2px',
  '& .MuiToggleButton-root': {
    border: 'none',
    borderRadius: '8px !important',
    minWidth: 30,
    height: 26,
    px: '8px',
    py: 0,
    textTransform: 'none',
    color: 'text.secondary',
    '&.Mui-selected': { bgcolor: 'text.primary', color: 'background.paper', '&:hover': { bgcolor: 'grey.700' } },
  },
};

export default function ViewToolbar({
  searchFilter,
  totalCount,
  sortBy,
  onSetSortBy,
  desktopView,
  onSetDesktopView,
  thumbnailDevice,
  onSetThumbnailDevice,
  thumbnailCols,
  onSetThumbnailCols,
  onClearSearchFilter,
}: Props) {
  return (
    <Box className="reveal-up" style={{ animationDelay: '100ms' }} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <Typography sx={{ fontSize: 24, fontWeight: 800, color: 'text.primary', letterSpacing: '-0.01em' }}>
          {searchFilter ? '검색 결과' : 'Recommended pages'}
        </Typography>
        <Box sx={{ bgcolor: 'rgb(var(--palette-primary-mainChannel) / 0.16)', color: 'primary.main', px: '10px', py: '4px', borderRadius: '8px', fontSize: 12, fontWeight: 700 }}>
          {totalCount}
        </Box>
        {searchFilter && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', bgcolor: 'rgb(var(--palette-info-mainChannel) / 0.16)', color: 'info.dark', px: '10px', py: '4px', borderRadius: '8px', fontSize: 12 }}>
            <SearchIcon sx={{ fontSize: 13 }} />
            <Typography sx={{ fontSize: 12, fontWeight: 700, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'inherit' }} title={searchFilter}>{searchFilter}</Typography>
            <IconButton size="small" onClick={onClearSearchFilter} sx={{ p: '0px', color: 'inherit', ml: '2px' }}>
              <CloseIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Box>
        )}
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>Sort by:</Typography>
        <Select
          value={sortBy}
          onChange={(e) => onSetSortBy(e.target.value as SortKey)}
          size="small"
          sx={{
            fontSize: 13,
            fontWeight: 700,
            color: 'text.primary',
            bgcolor: 'background.paper',
            height: 32,
            '& .MuiSelect-select': { py: '6px', pl: '10px', pr: '28px !important' },
            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgb(var(--palette-grey-500Channel) / 0.24)' },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgb(var(--palette-grey-500Channel) / 0.4)' },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' },
            '& .MuiSelect-icon': { right: 6, fontSize: 18, color: 'text.secondary' },
          }}
        >
          {SORT_KEYS.map((k) => (
            <MenuItem key={k} value={k} sx={{ fontSize: 13 }}>{SORT_LABELS[k]}</MenuItem>
          ))}
        </Select>
        <ToggleButtonGroup
          size="small"
          value={desktopView}
          exclusive
          onChange={(_, v) => { if (v) onSetDesktopView(v as DesktopView); }}
          sx={toggleGroupSx}
        >
          <ToggleButton value="list"><ViewListIcon sx={{ fontSize: 18 }} /></ToggleButton>
          <ToggleButton value="thumbnail"><GridViewIcon sx={{ fontSize: 18 }} /></ToggleButton>
        </ToggleButtonGroup>
        {desktopView === 'thumbnail' && (
          <ToggleButtonGroup
            size="small"
            value={thumbnailDevice}
            exclusive
            onChange={(_, v) => { if (v) onSetThumbnailDevice(v as ThumbnailDevice); }}
            sx={toggleGroupSx}
          >
            <ToggleButton value="pc" title="모두 PC 화면으로"><DesktopWindowsOutlinedIcon sx={{ fontSize: 18 }} /></ToggleButton>
            <ToggleButton value="tablet" title="모두 태블릿 화면으로"><TabletMacOutlinedIcon sx={{ fontSize: 18 }} /></ToggleButton>
            <ToggleButton value="mobile" title="모두 모바일 화면으로"><SmartphoneOutlinedIcon sx={{ fontSize: 18 }} /></ToggleButton>
          </ToggleButtonGroup>
        )}
        {desktopView === 'thumbnail' && (
          <ToggleButtonGroup
            size="small"
            value={thumbnailCols}
            exclusive
            onChange={(_, v) => { if (v) onSetThumbnailCols(v as ThumbnailCols); }}
            sx={toggleGroupSx}
          >
            {([2, 3, 4, 5] as const).map((n) => (
              <ToggleButton key={n} value={n} title={`한 줄에 ${n}개`}>
                <Box sx={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
                  {Array.from({ length: n }, (_, i) => (
                    <Box key={i} sx={{ width: 2.5, height: 14, bgcolor: 'currentColor', borderRadius: '1px' }} />
                  ))}
                </Box>
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        )}
      </Box>
    </Box>
  );
}
