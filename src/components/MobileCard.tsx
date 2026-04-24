import { Card, Box, Typography } from '@mui/material';
import type { TableItem } from '../types';
import ProgressBar from './ProgressBar';
import PreviewFrame from './PreviewFrame';

interface Props {
  item: TableItem;
  cardNumber: number;
  latestDate: string;
  hideUi: boolean;
}

const emphasisSx = { fontWeight: 700, color: '#ff706e' };

export default function MobileCard({ item, cardNumber, latestDate, hideUi }: Props) {
  return (
    <Card variant="outlined" sx={{
      borderRadius: '16px',
      overflow: 'hidden',
      width: '100%',
      height: '100%',
      minHeight: 0,
      display: 'flex',
      flexDirection: 'column',
      bgcolor: 'rgba(255, 255, 255, 0.45)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: '1px solid rgba(255, 255, 255, 0.6)',
      boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', p: '8px 12px', bgcolor: 'rgba(255, 255, 255, 0.4)', borderBottom: '1px solid rgba(255, 255, 255, 0.5)', flexShrink: 0 }}>
        <Box sx={{ flexShrink: 0, width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#333', color: '#fff', borderRadius: '50%', fontSize: 11, fontWeight: 700 }}>
          {cardNumber}
        </Box>
        <Typography sx={{ flex: 1, fontSize: 14, fontWeight: 600, color: '#111', wordBreak: 'break-all' }}>
          {item.pageTitle || item.id}
        </Typography>
        <Box sx={{ display: 'flex', gap: '8px' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
            <Typography sx={{ fontSize: 10, color: '#666', lineHeight: 1 }}>PC</Typography>
            <ProgressBar value={item.progressPc} />
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
            <Typography sx={{ fontSize: 10, color: '#666', lineHeight: 1 }}>MO</Typography>
            <ProgressBar value={item.progressMobile} />
          </Box>
        </Box>
      </Box>

      <Box sx={{ flex: 1, position: 'relative', overflow: 'hidden', bgcolor: 'transparent' }}>
        {item.path ? (
          <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
            <PreviewFrame src={item.path} displayWidth="100%" fillHeight speed={2} iframeWidth={375} iframeHeight={667} allowScroll />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999', fontSize: 13 }}>
            미리보기 없음
          </Box>
        )}
      </Box>

      <Box sx={{
        flexShrink: 0,
        bgcolor: 'rgba(255, 255, 255, 0.4)',
        borderTop: hideUi ? 'none' : '1px solid rgba(255, 255, 255, 0.5)',
        transition: 'all 0.3s ease-in-out',
        maxHeight: hideUi ? 0 : 400,
        opacity: hideUi ? 0 : 1,
        overflow: 'hidden',
      }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px', p: '10px 12px' }}>
          {item.id && (
            <Box sx={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
              <Typography sx={{ flexShrink: 0, mr: '10px', color: '#888', fontSize: 12 }}>ID</Typography>
              <Typography sx={{ flex: 1, color: '#222', wordBreak: 'break-all', fontSize: 13 }}>{item.id}</Typography>
            </Box>
          )}
          {(item.depth1 || item.depth2 || item.depth3) && (
            <Box sx={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
              <Typography sx={{ flexShrink: 0, mr: '10px', color: '#888', fontSize: 12 }}>메뉴</Typography>
              <Typography sx={{ flex: 1, color: '#222', wordBreak: 'break-all', fontSize: 13 }}>
                {[item.depth1, item.depth2, item.depth3].filter(Boolean).join(' > ')}
              </Typography>
            </Box>
          )}
          {item.path && (
            <Box sx={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
              <Typography sx={{ flexShrink: 0, mr: '10px', color: '#888', fontSize: 12 }}>경로</Typography>
              <Box component="a" href={item.path} target="_blank" rel="noreferrer" sx={{ flex: 1, color: '#066cb3', textDecoration: 'none', wordBreak: 'break-all', fontSize: 13 }}>
                {(() => { try { return new URL(item.path).pathname; } catch { return item.path; } })()}
              </Box>
            </Box>
          )}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px', pt: '2px' }}>
            {item.start && (
              <Box sx={{ display: 'flex', gap: '4px', alignItems: 'center', mr: 'auto' }}>
                <Typography sx={{ flexShrink: 0, mr: '10px', color: '#888', fontSize: 12 }}>생성일</Typography>
                <Typography sx={{ fontSize: 13, ...(item.start === latestDate ? emphasisSx : { color: '#222' }) }}>{item.start}</Typography>
              </Box>
            )}
            {item.updatedAt && (
              <Box sx={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <Typography sx={{ flexShrink: 0, mr: '10px', color: '#888', fontSize: 12 }}>업데이트</Typography>
                <Typography sx={{ fontSize: 13, ...(item.updatedAt === latestDate ? emphasisSx : { color: '#222' }) }}>{item.updatedAt}</Typography>
              </Box>
            )}
            {item.end && (
              <Box sx={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <Typography sx={{ flexShrink: 0, mr: '10px', color: '#888', fontSize: 12 }}>완료일</Typography>
                <Typography sx={{ fontSize: 13, ...(item.end === latestDate ? emphasisSx : { color: '#222' }) }}>{item.end}</Typography>
              </Box>
            )}
          </Box>
          {item.note && (
            <Box sx={{ display: 'flex', gap: '6px', alignItems: 'flex-start', mt: '2px' }}>
              <Typography sx={{ flexShrink: 0, mr: '10px', color: '#888', fontSize: 12 }}>비고</Typography>
              <Typography sx={{ flex: 1, color: '#222', wordBreak: 'break-all', fontSize: 13 }}>{item.note}</Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Card>
  );
}
