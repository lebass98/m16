import { isSortKey, type SortKey } from '../constants/sort';

/**
 * 필터·정렬·검색 상태를 URL ?쿼리스트링으로 양방향 직렬화.
 * 팀원과 "이 보기" 링크를 공유할 때 사용.
 *
 * - site: 사이트 키 (이미 사용 중)
 * - q: 검색어
 * - sections: 섹션 필터 (쉼표 구분)
 * - min, max: 진행도 범위 [0,100]
 * - incomplete: 미완료만 (1)
 * - sort: 정렬 키
 */
export interface UrlState {
  site?: string;
  searchFilter: string;
  sectionFilter: Set<string>;
  progressRange: [number, number];
  showIncomplete: boolean;
  sortBy?: SortKey;
}

export function readUrlState(search: string = window.location.search): UrlState {
  const params = new URLSearchParams(search);

  const minRaw = Number(params.get('min'));
  const maxRaw = Number(params.get('max'));
  const min = Number.isFinite(minRaw) && minRaw >= 0 && minRaw <= 100 ? minRaw : 0;
  const max = Number.isFinite(maxRaw) && maxRaw >= 0 && maxRaw <= 100 ? maxRaw : 100;

  const sectionsRaw = params.get('sections') ?? '';
  const sections = sectionsRaw ? sectionsRaw.split(',').filter(Boolean) : [];

  const sortRaw = params.get('sort');
  const sortBy = sortRaw && isSortKey(sortRaw) ? sortRaw : undefined;

  return {
    site: params.get('site') ?? undefined,
    searchFilter: params.get('q') ?? '',
    sectionFilter: new Set(sections),
    progressRange: [Math.min(min, max), Math.max(min, max)],
    showIncomplete: params.get('incomplete') === '1',
    sortBy,
  };
}

/**
 * 현재 상태를 ?쿼리스트링으로. 기본값(빈 검색·전체범위 등)인 키는 생략해 URL 짧게 유지.
 */
export function writeUrlState(state: UrlState): string {
  const params = new URLSearchParams();
  if (state.site) params.set('site', state.site);
  if (state.searchFilter.trim()) params.set('q', state.searchFilter.trim());
  if (state.sectionFilter.size > 0) params.set('sections', Array.from(state.sectionFilter).join(','));
  if (state.progressRange[0] !== 0) params.set('min', String(state.progressRange[0]));
  if (state.progressRange[1] !== 100) params.set('max', String(state.progressRange[1]));
  if (state.showIncomplete) params.set('incomplete', '1');
  if (state.sortBy) params.set('sort', state.sortBy);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

/** 절대 URL 형태로 (Slack 공유용). */
export function shareableUrl(state: UrlState): string {
  const { origin, pathname } = window.location;
  return `${origin}${pathname}${writeUrlState(state)}`;
}
