import { useEffect, useState } from 'react';
import { loadSheetCsv } from '../data/parseSheetCsv';
import type { SiteConfig } from '../data/sites';
import type { TableSection } from '../types';

/**
 * 선택된 site의 데이터를 반환.
 * sheetCsvUrl이 있으면 시트에서 fetch, 실패 시 site.data로 폴백.
 */
export function useSiteData(site: SiteConfig): TableSection[] {
  const [rawTableData, setRawTableData] = useState<TableSection[]>(site.data);

  useEffect(() => {
    setRawTableData(site.data);
    if (!site.sheetCsvUrl) return;
    let cancelled = false;
    loadSheetCsv(site.sheetCsvUrl, site.data).then((d) => {
      if (!cancelled) setRawTableData(d);
    });
    return () => { cancelled = true; };
  }, [site]);

  return rawTableData;
}
