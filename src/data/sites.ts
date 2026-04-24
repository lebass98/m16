import type { TableSection } from '../types';
import { tableData } from './tableData';
import { tableDataEpaa } from './tableData_epaa';

export interface SiteConfig {
  title: string;
  data: TableSection[];
}

export const sites: SiteConfig[] = [
  { title: '한국건강가정진흥원', data: tableData },
  { title: '전국경제진흥원협의회', data: tableDataEpaa },
];
