/**
 * 진행도는 20% 단위 6단계만 허용 — 운영 관례.
 * 0(미시작), 20·40·60(진행중), 80(거의 완료), 100(완료).
 * 더 세밀한 추적이 필요한 경우 TableItem.note에 자유 텍스트로 기록.
 */
export type ProgressValue = 0 | 20 | 40 | 60 | 80 | 100;
export type StatusType = 'ing' | 'end' | 'except' | 'moding' | 'stay' | 'pc' | '';

export interface LogItem {
  date: string;
  text: string;
}

export interface TableItem {
  pageTitle: string;
  id: string;
  depth1: string;
  depth2: string;
  depth3: string;
  path: string;
  progressPc: ProgressValue;
  progressMobile: ProgressValue;
  start: string;
  updatedAt: string;
  end: string;
  note: string;
  depthOnly?: boolean;
}

export interface TableSection {
  depth1: string;
  data: TableItem[];
}
