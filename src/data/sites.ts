import type { TableSection } from '../types';
import { tableData } from './tableData';
// import { tableDataEpaa } from './tableData_epaa';

export interface SiteConfig {
  key: string;
  title: string;
  data: TableSection[];
  color?: string;
  description?: string;
  /**
   * Google Sheets "웹에 게시" CSV URL. 지정하면 앱 로드 시 시트에서 데이터를 fetch 한다.
   * 네트워크 실패 시 자동으로 `data` 가 fallback 으로 쓰임.
   *
   * URL 발급 방법:
   *   1) 시트 → 파일 > 공유 > 웹에 게시
   *   2) 게시 대상: 특정 시트 선택
   *   3) 형식: 쉼표로 구분된 값 (.csv)
   *   4) 게시 → 발급된 URL 을 여기에 붙여넣기
   *   (URL 형태 예: https://docs.google.com/spreadsheets/d/e/2PACX-…/pub?gid=0&single=true&output=csv)
   */
  sheetCsvUrl?: string;
}

export const sites: SiteConfig[] = [
  {
    key: 'familynet',
    title: '한국건강가정진흥원',
    data: tableData,
    color: '#4a7ab5',
    description: '가족 지원 서비스 URL 목록',
    // sheetCsvUrl: '여기에 게시된 CSV URL',
  },
  // { key: 'epaa', title: '전국경제진흥원협의회', data: tableDataEpaa, color: '#5a9e6a', description: '경제 진흥 서비스 URL 목록' },
];
