import type { TableSection } from '../types';
import { tableData } from './tableData';
import { tableDataEpaa } from './tableData_epaa';

export interface SiteConfig {
  key: string;
  title: string;
  data: TableSection[];
}

export const sites: SiteConfig[] = [
  { key: 'familynet', title: '한국건강가정진흥원', data: tableData },
  { key: 'epaa', title: '전국경제진흥원협의회', data: tableDataEpaa },
];
