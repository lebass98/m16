import { useCallback, useEffect, useState } from 'react';
import { loadSheetCsv } from '../data/parseSheetCsv';
import type { SiteConfig } from '../data/sites';
import type { TableSection, TableItem } from '../types';
import { db, useFirebase } from '../firebase';
import { collection, query, orderBy, onSnapshot, writeBatch, doc } from 'firebase/firestore';

export type SiteFetchStatus = 'idle' | 'loading' | 'fallback' | 'success';

interface SiteState {
  siteKey: string;
  data: TableSection[];
  status: SiteFetchStatus;
  lastFetched: number | null;
}

export interface UseSiteDataResult {
  data: TableSection[];
  status: SiteFetchStatus;
  /** 시트 또는 Firestore fetch가 실패해 정적 폴백을 쓰고 있는 경우 true. */
  isFallback: boolean;
  /** 마지막 fetch 시각 (ms). 정적 데이터만 쓰는 경우 null. */
  lastFetched: number | null;
  /** 수동 새로고침 — 시트나 Firestore가 있는 사이트에서만 동작. */
  refresh: () => void;
}

// Firestore 문서 포맷 정의
export interface FirestoreTableItem extends TableItem {
  sectionDepth1: string;
  order: number;
}

// Flat Firestore 데이터를 TableSection[] 구조로 가공하는 헬퍼 함수
export function formatFirestoreData(items: FirestoreTableItem[]): TableSection[] {
  const sectionsMap = new Map<string, TableItem[]>();
  const sectionOrder: string[] = [];

  items.forEach((item) => {
    const sectionName = item.sectionDepth1;
    if (!sectionsMap.has(sectionName)) {
      sectionsMap.set(sectionName, []);
      sectionOrder.push(sectionName);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { sectionDepth1, order, ...tableItem } = item;
    sectionsMap.get(sectionName)!.push(tableItem);
  });

  return sectionOrder.map((name) => ({
    depth1: name,
    data: sectionsMap.get(name) || [],
  }));
}

/**
 * 선택된 site의 데이터를 반환.
 * useFirebase가 활성화되어 있으면 Firestore 실시간 동기화,
 * sheetCsvUrl이 있으면 시트에서 fetch, 실패 시 site.data로 폴백.
 */
export function useSiteData(site: SiteConfig): UseSiteDataResult {
  const [state, setState] = useState<SiteState>(() => ({
    siteKey: site.key,
    data: site.data,
    status: useFirebase || site.sheetCsvUrl ? 'loading' : 'success',
    lastFetched: null,
  }));

  const [reloadKey, setReloadKey] = useState(0);

  if (state.siteKey !== site.key) {
    setState({
      siteKey: site.key,
      data: site.data,
      status: useFirebase || site.sheetCsvUrl ? 'loading' : 'success',
      lastFetched: null,
    });
  }

  useEffect(() => {
    let cancelled = false;

    // 1. Firebase Firestore 연동 활성화 상태인 경우
    if (useFirebase && db) {
      const itemsColRef = collection(db!, 'sites', site.key, 'items');
      const q = query(itemsColRef, orderBy('order', 'asc'));

      const unsubscribe = onSnapshot(
        q,
        async (snapshot) => {
          if (cancelled) return;

          // 데이터가 없는 경우 정적 데이터를 기준으로 초기 시딩(Seeding) 시도
          if (snapshot.empty) {
            console.log(`[Firebase] ${site.key} 데이터가 비어있어 초기 시딩을 진행합니다.`);
            try {
              const batch = writeBatch(db!);
              let globalOrder = 0;
              site.data.forEach((section) => {
                section.data.forEach((item) => {
                  const docRef = doc(itemsColRef, item.id);
                  const firestoreItem: FirestoreTableItem = {
                    ...item,
                    sectionDepth1: section.depth1,
                    order: globalOrder++,
                  };
                  batch.set(docRef, firestoreItem);
                });
              });
              await batch.commit();
              console.log(`[Firebase] ${site.key} 초기 시딩 완료.`);
            } catch (err) {
              console.error('Firebase seeding failed:', err);
              if (!cancelled) {
                setState({
                  siteKey: site.key,
                  data: site.data,
                  status: 'fallback',
                  lastFetched: Date.now(),
                });
              }
            }
            return;
          }

          const items: FirestoreTableItem[] = [];
          snapshot.forEach((docSnap) => {
            items.push(docSnap.data() as FirestoreTableItem);
          });

          const formattedData = formatFirestoreData(items);
          setState({
            siteKey: site.key,
            data: formattedData,
            status: 'success',
            lastFetched: Date.now(),
          });
        },
        (error) => {
          console.error('Firestore subscription error:', error);
          if (!cancelled) {
            setState({
              siteKey: site.key,
              data: site.data,
              status: 'fallback',
              lastFetched: Date.now(),
            });
          }
        }
      );

      return () => {
        cancelled = true;
        unsubscribe();
      };
    }

    // 2. Google Sheets 연동 상태인 경우
    if (site.sheetCsvUrl) {
      loadSheetCsv(site.sheetCsvUrl, site.data)
        .then((d) => {
          if (cancelled) return;
          const isFallback = d === site.data;
          setState({
            siteKey: site.key,
            data: d,
            status: isFallback ? 'fallback' : 'success',
            lastFetched: Date.now(),
          });
        })
        .catch(() => {
          if (cancelled) return;
          setState({
            siteKey: site.key,
            data: site.data,
            status: 'fallback',
            lastFetched: Date.now(),
          });
        });
      return () => { cancelled = true; };
    }

    // 3. 정적 데이터만 사용하는 경우
    setState({
      siteKey: site.key,
      data: site.data,
      status: 'success',
      lastFetched: null,
    });
  }, [site, reloadKey]);

  const refresh = useCallback(() => {
    if (useFirebase || site.sheetCsvUrl) {
      setState((prev) => ({ ...prev, status: 'loading' }));
      setReloadKey((k) => k + 1);
    }
  }, [site.sheetCsvUrl]);

  return {
    data: state.data,
    status: state.status,
    isFallback: state.status === 'fallback',
    lastFetched: state.lastFetched,
    refresh,
  };
}
