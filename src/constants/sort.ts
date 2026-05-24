export type SortKey = 'no' | 'pageTitle' | 'id' | 'path' | 'progress' | 'created' | 'updated' | 'end';

export const SORT_KEYS: SortKey[] = ['no', 'pageTitle', 'id', 'path', 'progress', 'created', 'updated', 'end'];

export const SORT_LABELS: Record<SortKey, string> = {
  no: 'No',
  pageTitle: '페이지제목',
  id: 'ID',
  path: '경로',
  progress: '진행도',
  created: '생성일',
  updated: '최근 업데이트',
  end: '완료일',
};

export function isSortKey(v: unknown): v is SortKey {
  return typeof v === 'string' && (SORT_KEYS as string[]).includes(v);
}
