import { useState } from 'react';
import { Dialog, Box, Typography, IconButton, TextField, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import RestoreIcon from '@mui/icons-material/Restore';
import type { TableItem } from '../../types';

interface Props {
  open: boolean;
  /** 편집 대상 항목 — null이면 다이얼로그가 마운트되지 않음. */
  item: TableItem | null;
  /** 원본 note (오버라이드 적용 전). "원본으로 되돌리기"가 보여줄 값. */
  originalNote: string;
  /** 원본 filePath (오버라이드 적용 전). */
  originalFilePath: string;
  /** 사용자가 오버라이드 한 적이 있는지 — true면 "원본으로" 버튼 활성. */
  hasOverride: boolean;
  onClose: () => void;
  /** 저장 — note/filePath가 null이면 각각 오버라이드 제거. */
  onSave: (id: string, note: string | null, filePath: string | null) => void;
}

/**
 * 노트(메모) 및 파일 경로 인라인 편집 다이얼로그.
 * 원본 시트는 read-only이므로 변경은 localStorage 오버라이드에 저장된다.
 * 사용자가 오버라이드를 만들면 ExportMenu의 CSV/JSON에 반영됨 — 시트에 붙여넣어 영구화.
 */
/**
 * 부모는 `key={item.id}`를 넘겨서 item이 바뀔 때마다 컴포넌트가 재마운트되도록 한다.
 * 이렇게 하면 useState initializer가 매번 새로 평가되어 draft가 자연스럽게 리셋된다.
 * (useEffect로 setDraft 호출하는 패턴은 cascading render 경고가 나서 회피)
 */
export default function NoteEditDialog({ open, item, originalNote, originalFilePath, hasOverride, onClose, onSave }: Props) {
  const [draft, setDraft] = useState(item?.note ?? '');
  const [draftFilePath, setDraftFilePath] = useState(item?.filePath ?? '');

  if (!item) return null;

  const save = () => {
    // 값이 비어있거나 원본과 같으면 null을 넘겨 오버라이드 제거할 수도 있으나,
    // 여기서는 명시적인 저장과 원본 되돌리기(revert) 버튼 클릭으로 구분.
    onSave(
      item.id,
      draft === originalNote ? null : draft,
      draftFilePath === originalFilePath ? null : draftFilePath
    );
    onClose();
  };

  const revertToOriginal = () => {
    onSave(item.id, null, null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" slotProps={{ paper: { sx: { borderRadius: '16px' } } }}>
      <Box sx={{ p: '14px 16px', borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 11, color: 'text.secondary', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>페이지 정보 편집</Typography>
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {item.pageTitle || item.id}
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} aria-label="편집 닫기">
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      <Box sx={{ p: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <TextField
          label="파일보기 경로 (새 탭 이동 URL)"
          variant="outlined"
          fullWidth
          value={draftFilePath}
          onChange={(e) => setDraftFilePath(e.target.value)}
          placeholder="파일보기 버튼 및 경로 링크 클릭 시 이동할 URL 또는 파일 경로"
          slotProps={{ input: { 'aria-label': '파일 경로' } }}
          sx={{ '& .MuiInputBase-root': { fontSize: 14, fontFamily: 'inherit' } }}
        />

        <TextField
          label="비고 / 노트"
          variant="outlined"
          fullWidth
          multiline
          minRows={4}
          maxRows={10}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="이 페이지에 대한 메모…"
          slotProps={{ input: { 'aria-label': '노트 텍스트' } }}
          sx={{ '& .MuiInputBase-root': { fontSize: 14, fontFamily: 'inherit' } }}
        />
        <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>
          변경은 이 브라우저에만 저장됩니다. 시트에 반영하려면 "내보내기 → CSV"로 추출 후 시트에 붙여넣으세요.
        </Typography>
      </Box>

      <Box sx={{ p: '12px 16px', borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
        <Button
          size="small"
          startIcon={<RestoreIcon sx={{ fontSize: 14 }} />}
          onClick={revertToOriginal}
          disabled={!hasOverride}
          sx={{ textTransform: 'none', color: 'text.secondary' }}
          title={hasOverride ? `원본 값으로 복원` : '편집한 적 없음'}
        >
          원본으로 되돌리기
        </Button>
        <Box sx={{ display: 'flex', gap: '8px' }}>
          <Button onClick={onClose} size="small" sx={{ textTransform: 'none', color: 'text.secondary' }}>취소</Button>
          <Button onClick={save} size="small" variant="contained" sx={{ textTransform: 'none', fontWeight: 700 }}>저장</Button>
        </Box>
      </Box>
    </Dialog>
  );
}
