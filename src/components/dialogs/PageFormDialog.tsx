import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Alert,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Grid,
} from '@mui/material';
import { Icon } from '@iconify/react';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import type { TableItem, ProgressValue } from '../../types';
import type { FirestoreTableItem } from '../../hooks/useSiteData';

interface PageFormDialogProps {
  open: boolean;
  onClose: () => void;
  siteKey: string;
  item?: TableItem & { sectionDepth1: string; order?: number }; // 수정 시 전달됨
  nextOrder: number; // 새 아이템 등록 시 사용할 order
  existingSections: string[]; // 기존 등록된 섹션 목록 자동완성/선택용
}

const PROGRESS_OPTIONS: ProgressValue[] = [0, 20, 40, 60, 80, 100];

export default function PageFormDialog({
  open,
  onClose,
  siteKey,
  item,
  nextOrder,
  existingSections,
}: PageFormDialogProps) {
  const isEdit = !!item;

  const [pageTitle, setPageTitle] = useState('');
  const [id, setId] = useState('');
  const [sectionDepth1, setSectionDepth1] = useState('');
  const [depth1, setDepth1] = useState('');
  const [depth2, setDepth2] = useState('');
  const [depth3, setDepth3] = useState('');
  const [path, setPath] = useState('');
  const [progressPc, setProgressPc] = useState<ProgressValue>(0);
  const [progressMobile, setProgressMobile] = useState<ProgressValue>(0);
  const [start, setStart] = useState('');
  const [updatedAt, setUpdatedAt] = useState('');
  const [end, setEnd] = useState('');
  const [note, setNote] = useState('');
  const [depthOnly, setDepthOnly] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (item) {
        setPageTitle(item.pageTitle || '');
        setId(item.id || '');
        setSectionDepth1(item.sectionDepth1 || '');
        setDepth1(item.depth1 || '');
        setDepth2(item.depth2 || '');
        setDepth3(item.depth3 || '');
        setPath(item.path || '');
        setProgressPc(item.progressPc ?? 0);
        setProgressMobile(item.progressMobile ?? 0);
        setStart(item.start || '');
        setUpdatedAt(item.updatedAt || '');
        setEnd(item.end || '');
        setNote(item.note || '');
        setDepthOnly(!!item.depthOnly);
      } else {
        // 등록 모드 초기화
        setPageTitle('');
        setId('');
        setSectionDepth1(existingSections[0] || '공통');
        setDepth1('');
        setDepth2('');
        setDepth3('');
        setPath('');
        setProgressPc(0);
        setProgressMobile(0);
        setStart('');
        setUpdatedAt('');
        setEnd('');
        setNote('');
        setDepthOnly(false);
      }
      setError(null);
    }
  }, [open, item, existingSections]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) {
      setError('Firebase가 활성화되지 않았습니다.');
      return;
    }

    if (!id.trim()) {
      setError('화면 ID는 필수 입력 사항입니다.');
      return;
    }

    setLoading(true);
    setError(null);

    const docRef = doc(db, 'sites', siteKey, 'items', id.trim());

    const dataPayload: FirestoreTableItem = {
      id: id.trim(),
      pageTitle: pageTitle.trim(),
      sectionDepth1: sectionDepth1.trim(),
      depth1: depth1.trim(),
      depth2: depth2.trim(),
      depth3: depth3.trim(),
      path: path.trim(),
      progressPc,
      progressMobile,
      start: start.trim(),
      updatedAt: updatedAt.trim() || new Date().toLocaleDateString('ko-KR').replace(/\s/g, '').slice(0, -1), // 오늘 날짜 기본값
      end: end.trim(),
      note: note.trim(),
      depthOnly,
      order: isEdit && item?.order !== undefined ? item.order : nextOrder,
    };

    try {
      if (isEdit) {
        // 만약 ID(문서명)가 변경된 경우 이전 문서를 삭제해야 하지만, 본 어드민 모드에서는
        // ID를 수정 불가능하게 막아두는 것이 안전합니다.
        await updateDoc(docRef, dataPayload as any);
      } else {
        await setDoc(docRef, dataPayload);
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(`저장에 실패했습니다: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          {isEdit ? '페이지 수정' : '새 페이지 등록'}
        </Typography>
        <IconButton onClick={onClose} size="small" disabled={loading}>
          <Icon icon="lucide:x" width={20} height={20} />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ p: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2}>
            {/* 기본 정보 */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="화면 ID (Firestore 문서 Key)"
                variant="outlined"
                fullWidth
                required
                disabled={isEdit || loading} // 수정 시 ID 변경 금지
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="예: common-login"
                helperText="등록 후에는 수정할 수 없습니다."
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="페이지명 (화면명)"
                variant="outlined"
                fullWidth
                required
                disabled={loading}
                value={pageTitle}
                onChange={(e) => setPageTitle(e.target.value)}
                placeholder="예: 로그인 화면"
              />
            </Grid>

            {/* 섹션 및 분류 */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth disabled={loading}>
                <InputLabel id="section-select-label">프로젝트 그룹 (섹션)</InputLabel>
                <Select
                  labelId="section-select-label"
                  label="프로젝트 그룹 (섹션)"
                  value={sectionDepth1}
                  onChange={(e) => setSectionDepth1(e.target.value)}
                  required
                >
                  {existingSections.map((sec) => (
                    <MenuItem key={sec} value={sec}>
                      {sec}
                    </MenuItem>
                  ))}
                  {/* 기존 섹션에 없는 경우 새로 입력할 수 있게 함 */}
                  {!existingSections.includes(sectionDepth1) && sectionDepth1 && (
                    <MenuItem value={sectionDepth1}>{sectionDepth1} (직접입력)</MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="섹션 직접 입력 (새 섹션 생성 시)"
                variant="outlined"
                fullWidth
                disabled={loading}
                value={sectionDepth1}
                onChange={(e) => setSectionDepth1(e.target.value)}
                placeholder="예: 마이페이지"
                helperText="기존 목록에 없을 때 입력하세요."
              />
            </Grid>

            {/* 카테고리 Depth */}
            <Grid size={4}>
              <TextField
                label="대분류 (Depth1)"
                variant="outlined"
                fullWidth
                disabled={loading}
                value={depth1}
                onChange={(e) => setDepth1(e.target.value)}
                placeholder="공통"
              />
            </Grid>
            <Grid size={4}>
              <TextField
                label="중분류 (Depth2)"
                variant="outlined"
                fullWidth
                disabled={loading}
                value={depth2}
                onChange={(e) => setDepth2(e.target.value)}
                placeholder="로그인"
              />
            </Grid>
            <Grid size={4}>
              <TextField
                label="소분류 (Depth3)"
                variant="outlined"
                fullWidth
                disabled={loading}
                value={depth3}
                onChange={(e) => setDepth3(e.target.value)}
                placeholder="상세"
              />
            </Grid>

            {/* 경로 */}
            <Grid size={12}>
              <TextField
                label="접속 경로 (URL Path)"
                variant="outlined"
                fullWidth
                required
                disabled={loading}
                value={path}
                onChange={(e) => setPath(e.target.value)}
                placeholder="예: /member/login.do"
              />
            </Grid>

            {/* 진행도 */}
            <Grid size={6}>
              <FormControl fullWidth disabled={loading}>
                <InputLabel id="progress-pc-label">PC 진행도</InputLabel>
                <Select
                  labelId="progress-pc-label"
                  label="PC 진행도"
                  value={progressPc}
                  onChange={(e) => setProgressPc(Number(e.target.value) as ProgressValue)}
                >
                  {PROGRESS_OPTIONS.map((val) => (
                    <MenuItem key={val} value={val}>
                      {val}% {val === 0 ? '(미시작)' : val === 100 ? '(완료)' : '(진행중)'}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={6}>
              <FormControl fullWidth disabled={loading}>
                <InputLabel id="progress-mobile-label">모바일 진행도</InputLabel>
                <Select
                  labelId="progress-mobile-label"
                  label="모바일 진행도"
                  value={progressMobile}
                  onChange={(e) => setProgressMobile(Number(e.target.value) as ProgressValue)}
                >
                  {PROGRESS_OPTIONS.map((val) => (
                    <MenuItem key={val} value={val}>
                      {val}% {val === 0 ? '(미시작)' : val === 100 ? '(완료)' : '(진행중)'}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* 작업 일정 */}
            <Grid size={4}>
              <TextField
                label="시작일"
                variant="outlined"
                fullWidth
                disabled={loading}
                value={start}
                onChange={(e) => setStart(e.target.value)}
                placeholder="YYYY.MM.DD"
              />
            </Grid>
            <Grid size={4}>
              <TextField
                label="수정일"
                variant="outlined"
                fullWidth
                disabled={loading}
                value={updatedAt}
                onChange={(e) => setUpdatedAt(e.target.value)}
                placeholder="YYYY.MM.DD"
                helperText="비워두면 오늘 날짜 입력"
              />
            </Grid>
            <Grid size={4}>
              <TextField
                label="완료일"
                variant="outlined"
                fullWidth
                disabled={loading}
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                placeholder="YYYY.MM.DD"
              />
            </Grid>

            {/* 비고 및 옵션 */}
            <Grid size={12}>
              <TextField
                label="비고 (Note)"
                variant="outlined"
                fullWidth
                multiline
                rows={2}
                disabled={loading}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="특이사항 기재"
              />
            </Grid>
            <Grid size={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={depthOnly}
                    onChange={(e) => setDepthOnly(e.target.checked)}
                    disabled={loading}
                  />
                }
                label="카테고리 구분 전용행 (실제 접속 가능한 화면 링크가 아닌 카테고리 헤더 역할)"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={loading}>
            취소
          </Button>
          <Button type="submit" variant="contained" color="primary" disabled={loading}>
            {loading ? '저장 중...' : '저장'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
