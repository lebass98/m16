import { Dialog, Box, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface Props {
  open: boolean;
  onClose: () => void;
}

const isMac = typeof navigator !== 'undefined' && /Mac/i.test(navigator.platform);
const MOD = isMac ? '⌘' : 'Ctrl';

const SHORTCUTS: { keys: string[]; description: string }[] = [
  { keys: [MOD, 'K'],   description: '검색 다이얼로그 열기' },
  { keys: ['/'],         description: '검색 다이얼로그 열기 (modifier 없이)' },
  { keys: ['?'],         description: '이 도움말 열기' },
  { keys: ['Esc'],       description: '열려있는 다이얼로그 닫기' },
];

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <Box
      component="kbd"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 26,
        height: 24,
        px: '8px',
        fontSize: 12,
        fontWeight: 600,
        fontFamily: 'inherit',
        color: 'text.primary',
        bgcolor: 'rgb(var(--palette-grey-500Channel) / 0.12)',
        border: '1px solid rgb(var(--palette-grey-500Channel) / 0.24)',
        borderRadius: '6px',
        lineHeight: 1,
      }}
    >
      {children}
    </Box>
  );
}

export default function ShortcutHelpDialog({ open, onClose }: Props) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs" slotProps={{ paper: { sx: { borderRadius: '16px' } } }}>
      <Box sx={{ p: '14px 16px', borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography sx={{ fontSize: 16, fontWeight: 700 }}>키보드 단축키</Typography>
        <IconButton size="small" onClick={onClose} aria-label="단축키 도움말 닫기">
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>
      <Box component="dl" sx={{ m: 0, p: '8px 16px 16px', display: 'flex', flexDirection: 'column' }}>
        {SHORTCUTS.map((s, i) => (
          <Box
            key={i}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              py: '10px',
              borderBottom: i < SHORTCUTS.length - 1 ? '1px dashed rgb(var(--palette-grey-500Channel) / 0.16)' : 'none',
            }}
          >
            <Typography component="dd" sx={{ m: 0, fontSize: 13, color: 'text.primary', flex: 1 }}>
              {s.description}
            </Typography>
            <Box component="dt" sx={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
              {s.keys.map((k, j) => (
                <Kbd key={j}>{k}</Kbd>
              ))}
            </Box>
          </Box>
        ))}
      </Box>
    </Dialog>
  );
}
