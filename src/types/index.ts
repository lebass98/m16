export type ProgressValue = 0 | 20 | 40 | 60 | 80 | 100;

export interface TableItem {
  pageTitle: string;
  id: string;
  depth1: string;
  depth2: string;
  depth3: string;
  path: string;
  progress: ProgressValue;
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
