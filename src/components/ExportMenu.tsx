import { useState } from 'react';
import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Divider, Tooltip } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import TableViewIcon from '@mui/icons-material/TableView';
import DataObjectIcon from '@mui/icons-material/DataObject';
import FilterListIcon from '@mui/icons-material/FilterList';
import type { TableSection } from '../types';
import { sectionsToCsv, sectionsToJson, downloadFile } from '../utils/exportData';

interface Props {
  siteKey: string;
  siteTitle: string;
  /** 원본(필터 미적용) 데이터. */
  fullData: TableSection[];
  /** 현재 필터/정렬이 적용된 데이터. */
  filteredData: TableSection[];
}

/**
 * 데이터를 CSV/JSON으로 내보내는 메뉴.
 * - 전체 CSV / 전체 JSON
 * - 현재 필터 결과 CSV / 현재 필터 결과 JSON
 */
export default function ExportMenu({ siteKey, siteTitle, fullData, filteredData }: Props) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const open = Boolean(anchor);
  const close = () => setAnchor(null);

  const today = new Date().toISOString().slice(0, 10);

  const exportFull = (kind: 'csv' | 'json') => {
    const filename = `${siteKey}-${today}.${kind}`;
    if (kind === 'csv') downloadFile(sectionsToCsv(fullData), filename, 'text/csv');
    else downloadFile(sectionsToJson(fullData, siteKey, siteTitle), filename, 'application/json');
    close();
  };

  const exportFiltered = (kind: 'csv' | 'json') => {
    const filename = `${siteKey}-filtered-${today}.${kind}`;
    if (kind === 'csv') downloadFile(sectionsToCsv(filteredData), filename, 'text/csv');
    else downloadFile(sectionsToJson(filteredData, siteKey, siteTitle), filename, 'application/json');
    close();
  };

  const filteredRowCount = filteredData.reduce((n, s) => n + s.data.length, 0);
  const fullRowCount = fullData.reduce((n, s) => n + s.data.length, 0);

  return (
    <>
      <Tooltip title="데이터 내보내기" arrow>
        <IconButton
          onClick={(e) => setAnchor(e.currentTarget)}
          aria-label="데이터 내보내기 메뉴 열기"
          aria-haspopup="menu"
          aria-expanded={open}
          sx={{ width: 40, height: 40, color: 'text.secondary', '&:hover': { bgcolor: 'rgb(var(--palette-grey-500Channel) / 0.08)', color: 'text.primary' } }}
        >
          <DownloadIcon sx={{ fontSize: 24 }} />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchor}
        open={open}
        onClose={close}
        slotProps={{ paper: { sx: { minWidth: 240, borderRadius: '12px' } } }}
      >
        <MenuItem disabled sx={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', opacity: '1 !important', color: 'text.secondary' }}>
          전체 ({fullRowCount}행)
        </MenuItem>
        <MenuItem onClick={() => exportFull('csv')}>
          <ListItemIcon><TableViewIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="CSV로 내보내기" />
        </MenuItem>
        <MenuItem onClick={() => exportFull('json')}>
          <ListItemIcon><DataObjectIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="JSON으로 내보내기" />
        </MenuItem>

        <Divider />

        <MenuItem disabled sx={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', opacity: '1 !important', color: 'text.secondary' }}>
          <ListItemIcon sx={{ minWidth: '24px !important' }}><FilterListIcon fontSize="small" /></ListItemIcon>
          현재 필터 결과 ({filteredRowCount}행)
        </MenuItem>
        <MenuItem onClick={() => exportFiltered('csv')} disabled={filteredRowCount === 0}>
          <ListItemIcon><TableViewIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="CSV로 내보내기" />
        </MenuItem>
        <MenuItem onClick={() => exportFiltered('json')} disabled={filteredRowCount === 0}>
          <ListItemIcon><DataObjectIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="JSON으로 내보내기" />
        </MenuItem>
      </Menu>
    </>
  );
}
