import type { TableSection } from '../types';
import { tableData } from './tableData';
import { tableDataEpaa } from './tableData_epaa';

export interface SiteConfig {
  key: string;
  title: string;
  data: TableSection[];
  color?: string;
  description?: string;
}

export const sites: SiteConfig[] = [
  { key: 'familynet', title: '한국건강가정진흥원', data: tableData, color: '#4a7ab5', description: '가족 지원 서비스 URL 목록' },
  { key: 'epaa', title: '전국경제진흥원협의회', data: tableDataEpaa, color: '#5a9e6a', description: '경제 진흥 서비스 URL 목록' },
];
