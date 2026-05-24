import { useEffect, useState } from 'react';
import { loadSheetCsv } from '../data/parseSheetCsv';
import type { SiteConfig } from '../data/sites';
import type { TableSection } from '../types';

interface SiteState {
  siteKey: string;
  data: TableSection[];
}

/**
 * 선택된 site의 데이터를 반환.
 * sheetCsvUrl이 있으면 시트에서 fetch, 실패 시 site.data로 폴백.
 *
 * Props 기반 파생 상태 패턴: site가 바뀌면 즉시 동기적으로 fallback data로 리셋
 * (useEffect에서 setState하면 React Compiler가 cascading render로 경고).
 */
export function useSiteData(site: SiteConfig): TableSection[] {
  const [state, setState] = useState<SiteState>(() => ({ siteKey: site.key, data: site.data }));

  // site가 바뀌면 렌더 중에 즉시 정적 data로 동기화 (React 권장 패턴)
  if (state.siteKey !== site.key) {
    setState({ siteKey: site.key, data: site.data });
  }

  useEffect(() => {
    if (!site.sheetCsvUrl) return;
    let cancelled = false;
    loadSheetCsv(site.sheetCsvUrl, site.data).then((d) => {
      if (!cancelled) setState({ siteKey: site.key, data: d });
    });
    return () => { cancelled = true; };
  }, [site]);

  return state.data;
}
