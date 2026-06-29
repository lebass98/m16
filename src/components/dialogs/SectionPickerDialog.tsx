import { Dialog, List, ListItem, ListItemButton, ListItemText, Typography } from '@mui/material';
import type { TableSection } from '../../types';

interface Props {
  open: boolean;
  onClose: () => void;
  tableData: TableSection[];
  currentSectionIdx: number;
  sectionStartIndices: number[];
  onSelect: (flatIndex: number) => void;
}

export default function SectionPickerDialog({ open, onClose, tableData, currentSectionIdx, sectionStartIndices, onSelect }: Props) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <List sx={{ pt: 0, pb: 0 }}>
        {tableData.map((section, i) => (
          <ListItem key={i} disablePadding>
            <ListItemButton
              onClick={() => { onSelect(sectionStartIndices[i]); onClose(); }}
              selected={currentSectionIdx === i}
            >
              <ListItemText primary={
                <Typography sx={{ fontSize: 15, fontWeight: currentSectionIdx === i ? 700 : 400 }}>
                  {`${section.depth1} (${section.data.length})`}
                </Typography>
              } />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Dialog>
  );
}
