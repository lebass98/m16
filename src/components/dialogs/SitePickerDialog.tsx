import { Dialog, List, ListItem, ListItemButton, ListItemText, Typography, Box } from '@mui/material';
import type { SiteConfig } from '../../data/sites';

interface Props {
  open: boolean;
  onClose: () => void;
  sites: SiteConfig[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export default function SitePickerDialog({ open, onClose, sites, selectedIndex, onSelect }: Props) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <List sx={{ pt: 0, pb: 0 }}>
        {sites.map((s, i) => (
          <ListItem key={i} disablePadding>
            <ListItemButton onClick={() => { onSelect(i); onClose(); }} selected={selectedIndex === i} sx={{ gap: 1.5 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: s.color ?? '#4a7ab5', flexShrink: 0 }} />
              <ListItemText
                primary={
                  <Typography sx={{ fontSize: 15, fontWeight: selectedIndex === i ? 700 : 400 }}>
                    {s.title}
                    <Box component="span" sx={{ ml: 1, fontSize: 12, color: 'text.secondary' }}>({s.data.reduce((n, sec) => n + sec.data.length, 0)} pages)</Box>
                  </Typography>
                }
                secondary={s.description}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Dialog>
  );
}
