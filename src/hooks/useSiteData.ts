import { useEffect, useState } from 'react';
import { loadSheetCsv } from '../data/parseSheetCsv';
import type { SiteConfig } from '../data/sites';
import type { TableSection } from '../types';

export type SiteFetchStatus = 'idle' | 'loading' | 'fallback' | 'success';

interface SiteState {
  siteKey: string;
  data: TableSection[];
  status: SiteFetchStatus;
}

export interface UseSiteDataResult {
  data: TableSection[];
  status: SiteFetchStatus;
  /** 시트 fetch가 실패해 정적 폴백을 쓰고 있는 경우 true. */
  isFallback: boolean;
}

/**
 * 선택된 site의 데이터를 반환.
 * sheetCsvUrl이 있으면 시트에서 fetch, 실패 시 site.data로 폴백.
 *
 * Props 기반 파생 상태 패턴: site가 바뀌면 즉시 동기적으로 fallback data로 리셋
 * (useEffect에서 setState하면 React Compiler가 cascading render로 경고).
 */
export function useSiteData(site: SiteConfig): UseSiteDataResult {
  const [state, setState] = useState<SiteState>(() => ({
    siteKey: site.key,
    data: site.data,
    // 시트가 없으면 정적 데이터만 사용 → 즉시 success. 있으면 로딩 시작.
    status: site.sheetCsvUrl ? 'loading' : 'success',
  }));

  // site가 바뀌면 렌더 중에 즉시 정적 data로 동기화 (React 권장 패턴)
  if (state.siteKey !== site.key) {
    setState({
      siteKey: site.key,
      data: site.data,
      status: site.sheetCsvUrl ? 'loading' : 'success',
    });
  }

  useEffect(() => {
    if (!site.sheetCsvUrl) return;
    let cancelled = false;
    loadSheetCsv(site.sheetCsvUrl, site.data)
      .then((d) => {
        if (cancelled) return;
        // loadSheetCsv는 실패 시 site.data를 반환하므로 동일 참조면 fallback
        const isFallback = d === site.data;
        setState({ siteKey: site.key, data: d, status: isFallback ? 'fallback' : 'success' });
      })
      .catch(() => {
        if (cancelled) return;
        setState({ siteKey: site.key, data: site.data, status: 'fallback' });
      });
    return () => { cancelled = true; };
  }, [site]);

  return { data: state.data, status: state.status, isFallback: state.status === 'fallback' };
}
