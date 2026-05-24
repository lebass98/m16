import { useMemo } from 'react';
import type { TableSection } from '../types';
import type { SortKey } from '../constants/sort';

interface FilterOptions {
  rawTableData: TableSection[];
  showIncomplete: boolean;
  sectionFilter: Set<string>;
  progressRange: number[];
  sortBy: SortKey;
  searchFilter: string;
}

export interface FlatCard {
  item: TableSection['data'][number];
  sectionIdx: number;
  sectionTitle: string;
  cardIdx: number;
  sectionTotal: number;
}

export interface DashboardStat {
  title: string;
  count: number;
  avgPc: number;
  avgMo: number;
}

export interface UseFilteredDataResult {
  tableData: TableSection[];
  flatCards: FlatCard[];
  depth1Categories: { key: string; count: number }[];
  sectionStartIndices: number[];
  totalCount: number;
  dashboardStats: DashboardStat[];
  overallPc: number;
  overallMo: number;
}

export function useFilteredData({
  rawTableData,
  showIncomplete,
  sectionFilter,
  progressRange,
  sortBy,
  searchFilter,
}: FilterOptions): UseFilteredDataResult {
  const tableData = useMemo(() => {
    const [min, max] = progressRange;
    const q = searchFilter.trim().toLowerCase();
    return rawTableData
      .map((section) => ({
        ...section,
        data: section.data
          .map((item, idx) => ({ item, idx }))
          .filter(({ item }) => sectionFilter.size === 0 || sectionFilter.has(item.depth1 || ''))
          .filter(({ item }) => (showIncomplete ? true : (item.progressPc ?? 0) !== 0))
          .filter(({ item }) => {
            const p = item.progressPc ?? 0;
            return p >= min && p <= max;
          })
          .filter(({ item }) => {
            if (!q) return true;
            return [item.pageTitle, item.id, item.depth1, item.depth2, item.depth3, item.note, section.depth1]
              .some((v) => v?.toLowerCase().includes(q));
          })
          .sort((a, b) => {
            const ai = a.item, bi = b.item;
            switch (sortBy) {
              case 'no': return a.idx - b.idx;
              case 'pageTitle': return (ai.pageTitle || '').localeCompare(bi.pageTitle || '');
              case 'id': return (ai.id || '').localeCompare(bi.id || '');
              case 'path': return (ai.path || '').localeCompare(bi.path || '');
              case 'progress': return (bi.progressPc ?? 0) - (ai.progressPc ?? 0);
              case 'created': return (bi.start || '').localeCompare(ai.start || '');
              case 'updated': return (bi.updatedAt || '').localeCompare(ai.updatedAt || '');
              case 'end': return (bi.end || '').localeCompare(ai.end || '');
              default: return 0;
            }
          })
          .map(({ item }) => item),
      }))
      .filter((section) => section.data.length > 0);
  }, [rawTableData, showIncomplete, sectionFilter, progressRange, sortBy, searchFilter]);

  const flatCards = useMemo<FlatCard[]>(
    () => tableData.flatMap((section, si) =>
      section.data.map((item, ci) => ({
        item,
        sectionIdx: si,
        sectionTitle: section.depth1,
        cardIdx: ci,
        sectionTotal: section.data.length,
      })),
    ),
    [tableData],
  );

  const depth1Categories = useMemo(() => {
    const order: string[] = [];
    const counts = new Map<string, number>();
    rawTableData.forEach((section) => {
      section.data.forEach((item) => {
        const key = item.depth1 || '';
        if (!counts.has(key)) order.push(key);
        counts.set(key, (counts.get(key) ?? 0) + 1);
      });
    });
    return order.map((key) => ({ key, count: counts.get(key) ?? 0 }));
  }, [rawTableData]);

  const sectionStartIndices = useMemo(() => {
    let idx = 0;
    return tableData.map((section) => {
      const start = idx;
      idx += section.data.length;
      return start;
    });
  }, [tableData]);

  const totalCount = useMemo(
    () => tableData.reduce((sum, s) => sum + s.data.length, 0),
    [tableData],
  );

  const dashboardStats = useMemo<DashboardStat[]>(
    () => tableData.map((section) => {
      const items = section.data;
      const avgPc = items.length ? Math.round(items.reduce((s, i) => s + (i.progressPc ?? 0), 0) / items.length) : 0;
      const avgMo = items.length ? Math.round(items.reduce((s, i) => s + (i.progressMobile ?? 0), 0) / items.length) : 0;
      return { title: section.depth1, count: items.length, avgPc, avgMo };
    }),
    [tableData],
  );

  const overallPc = totalCount
    ? Math.round(dashboardStats.reduce((s, d) => s + d.avgPc * d.count, 0) / totalCount)
    : 0;
  const overallMo = totalCount
    ? Math.round(dashboardStats.reduce((s, d) => s + d.avgMo * d.count, 0) / totalCount)
    : 0;

  return {
    tableData,
    flatCards,
    depth1Categories,
    sectionStartIndices,
    totalCount,
    dashboardStats,
    overallPc,
    overallMo,
  };
}
