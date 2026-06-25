import { Card, Box, Typography, IconButton, Checkbox } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import type { TableItem } from '../types';
import ProgressBar from './ProgressBar';
import PreviewFrame from './PreviewFrame';
import { glassPanelSx } from '../theme/tokens';

interface Props {
  item: TableItem;
  cardNumber: number;
  latestDate: string;
  hideUi: boolean;
  /** 북마크 상태와 토글 — 미제공 시 북마크 버튼 숨김 */
  isBookmarked?: boolean;
  onToggleBookmark?: (id: string) => void;
  /** 선택 모드 — true면 체크박스 노출, 탭으로 선택 토글 */
  selectMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
}

const emphasisSx = { fontWeight: 700, color: '#ff706e' };

export default function MobileCard({ item, cardNumber, latestDate, hideUi, isBookmarked = false, onToggleBookmark, selectMode = false, isSelected = false, onToggleSelect }: Props) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Card variant="outlined" sx={{
      ...glassPanelSx,
      overflow: 'hidden',
      width: '100%',
      height: '100%',
      minHeight: 0,
      display: 'flex',
      flexDirection: 'column',
      transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s ease',
      '&:hover': {
        transform: 'translateY(-4px) scale(1.005)',
        boxShadow: isDark ? '0 16px 48px 0 rgba(0,0,0,0.5)' : '0 16px 48px 0 rgba(31, 38, 135, 0.15)',
      },
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', p: '8px 12px', bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255, 255, 255, 0.4)', borderBottom: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(255, 255, 255, 0.5)', flexShrink: 0 }}>
        {selectMode && onToggleSelect ? (
          <Checkbox
            checked={isSelected}
            onChange={() => onToggleSelect(item.id)}
            size="small"
            slotProps={{ input: { 'aria-label': `${item.pageTitle || item.id} 선택` } }}
            sx={{ p: '2px', flexShrink: 0 }}
          />
        ) : (
          <Box sx={{ flexShrink: 0, width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: isDark ? '#4a7ab5' : '#333', color: '#fff', borderRadius: '50%', fontSize: 11, fontWeight: 700 }}>
            {cardNumber}
          </Box>
        )}
        <Typography sx={{ flex: 1, fontSize: 14, fontWeight: 600, color: isDark ? 'rgba(255,255,255,0.9)' : '#111', wordBreak: 'break-all' }}>
          {item.pageTitle || item.id}
        </Typography>
        {onToggleBookmark && (
          <IconButton
            size="small"
            onClick={(e) => { e.stopPropagation(); onToggleBookmark(item.id); }}
            aria-label={isBookmarked ? '북마크 해제' : '북마크 추가'}
            aria-pressed={isBookmarked}
            sx={{ p: '4px', flexShrink: 0, color: isBookmarked ? 'primary.main' : (isDark ? 'rgba(255,255,255,0.5)' : 'text.secondary') }}
          >
            {isBookmarked ? <BookmarkIcon sx={{ fontSize: 18 }} /> : <BookmarkBorderIcon sx={{ fontSize: 18 }} />}
          </IconButton>
        )}
        <Box sx={{ display: 'flex', gap: '8px' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
            <Typography sx={{ fontSize: 10, color: isDark ? 'rgba(255,255,255,0.5)' : '#666', lineHeight: 1 }}>PC</Typography>
            <ProgressBar value={item.progressPc} />
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
            <Typography sx={{ fontSize: 10, color: isDark ? 'rgba(255,255,255,0.5)' : '#666', lineHeight: 1 }}>MO</Typography>
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
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: isDark ? 'rgba(255,255,255,0.3)' : '#999', fontSize: 13 }}>
            미리보기 없음
          </Box>
        )}
      </Box>

      <Box sx={{
        flexShrink: 0,
        bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255, 255, 255, 0.4)',
        borderTop: hideUi ? 'none' : (isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(255, 255, 255, 0.5)'),
        transition: 'all 0.3s ease-in-out',
        maxHeight: hideUi ? 0 : 400,
        opacity: hideUi ? 0 : 1,
        overflow: 'hidden',
      }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px', p: '10px 12px' }}>
          {item.id && (
            <Box sx={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
              <Typography sx={{ flexShrink: 0, mr: '10px', color: isDark ? 'rgba(255,255,255,0.4)' : '#888', fontSize: 12 }}>ID</Typography>
              <Typography sx={{ flex: 1, color: isDark ? 'rgba(255,255,255,0.8)' : '#222', wordBreak: 'break-all', fontSize: 13 }}>{item.id}</Typography>
            </Box>
          )}
          {(item.depth1 || item.depth2 || item.depth3) && (
            <Box sx={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
              <Typography sx={{ flexShrink: 0, mr: '10px', color: isDark ? 'rgba(255,255,255,0.4)' : '#888', fontSize: 12 }}>메뉴</Typography>
              <Typography sx={{ flex: 1, color: isDark ? 'rgba(255,255,255,0.8)' : '#222', wordBreak: 'break-all', fontSize: 13 }}>
                {[item.depth1, item.depth2, item.depth3].filter(Boolean).join(' > ')}
              </Typography>
            </Box>
          )}
          {(item.filePath || item.path) && (() => {
            const targetPath = item.filePath || item.path;
            return (
              <Box sx={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                <Typography sx={{ flexShrink: 0, mr: '10px', color: isDark ? 'rgba(255,255,255,0.4)' : '#888', fontSize: 12 }}>경로</Typography>
                <Box component="a" href={targetPath} target="_blank" rel="noreferrer" sx={{ flex: 1, color: '#7fb3e8', textDecoration: 'none', wordBreak: 'break-all', fontSize: 13 }}>
                  {(() => { try { return new URL(targetPath).pathname; } catch { return targetPath; } })()}
                </Box>
              </Box>
            );
          })()}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px', pt: '2px' }}>
            {item.start && (
              <Box sx={{ display: 'flex', gap: '4px', alignItems: 'center', mr: 'auto' }}>
                <Typography sx={{ flexShrink: 0, mr: '10px', color: isDark ? 'rgba(255,255,255,0.4)' : '#888', fontSize: 12 }}>생성일</Typography>
                <Typography sx={{ fontSize: 13, ...(item.start === latestDate ? emphasisSx : { color: isDark ? 'rgba(255,255,255,0.8)' : '#222' }) }}>{item.start}</Typography>
              </Box>
            )}
            {item.updatedAt && (
              <Box sx={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <Typography sx={{ flexShrink: 0, mr: '10px', color: isDark ? 'rgba(255,255,255,0.4)' : '#888', fontSize: 12 }}>업데이트</Typography>
                <Typography sx={{ fontSize: 13, ...(item.updatedAt === latestDate ? emphasisSx : { color: isDark ? 'rgba(255,255,255,0.8)' : '#222' }) }}>{item.updatedAt}</Typography>
              </Box>
            )}
            {item.end && (
              <Box sx={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <Typography sx={{ flexShrink: 0, mr: '10px', color: isDark ? 'rgba(255,255,255,0.4)' : '#888', fontSize: 12 }}>완료일</Typography>
                <Typography sx={{ fontSize: 13, ...(item.end === latestDate ? emphasisSx : { color: isDark ? 'rgba(255,255,255,0.8)' : '#222' }) }}>{item.end}</Typography>
              </Box>
            )}
          </Box>
          {item.note && (
            <Box sx={{ display: 'flex', gap: '6px', alignItems: 'flex-start', mt: '2px' }}>
              <Typography sx={{ flexShrink: 0, mr: '10px', color: isDark ? 'rgba(255,255,255,0.4)' : '#888', fontSize: 12 }}>비고</Typography>
              <Typography sx={{ flex: 1, color: isDark ? 'rgba(255,255,255,0.8)' : '#222', wordBreak: 'break-all', fontSize: 13 }}>{item.note}</Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Card>
  );
}
