import { List, ListItem, Box, Typography } from '@mui/material';
import type { LogItem } from '../types';

interface Props {
  logs: LogItem[];
  latestDate: string;
}

export default function LogList({ logs, latestDate }: Props) {
  return (
    <List disablePadding>
      {logs.map((log, i) => (
        <ListItem key={i} disableGutters sx={{ position: 'relative', minHeight: 18, pl: '55px', alignItems: 'flex-start' }}>
          <Typography
            component="span"
            sx={{ position: 'absolute', top: 0, left: 0, fontSize: 13 }}
          >
            [{log.date}]
          </Typography>
          <Box
            component="span"
            sx={{ fontSize: 13, fontWeight: log.date === latestDate ? 700 : 400, color: log.date === latestDate ? '#ff706e' : 'inherit' }}
            dangerouslySetInnerHTML={{ __html: log.text }}
          />
        </ListItem>
      ))}
    </List>
  );
}
