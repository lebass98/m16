---
name: url-index-filter-search
description: src/hooks/useFilters.ts 및 SearchDialog.tsx 기반 스킬 가이드 - 다중 카테고리 필터, 진행도 슬라이더, 미완료 숨김 및 Cmd/Ctrl+K 키보드 단축키 모달 검색 스킬
---

# 🔍 `src/hooks/useFilters.ts` & 검색 스킬 가이드

본 스킬은 대시보드의 많은 페이지 데이터 중에서 필요한 항목을 다각도로 빠르게 검색/필터링할 수 있도록 지원하는 커스텀 훅 및 검색 모달 컴포넌트를 다룹니다.

---

## 📌 주요 담당 파일
- **핵심 소스**: `src/hooks/useFilters.ts`, `src/hooks/useFilteredData.ts`
- **검색 컴포넌트**: `src/components/SearchDialog.tsx`

---

## 💻 필터링 상태 구조 (`useFilters.ts`)

```typescript
export interface FilterState {
  /** 1단계(depth1) 선택된 카테고리 배열 */
  selectedCategories: string[];
  /** 진행도 슬라이더 범위 [min, max] (0 ~ 100) */
  progressRange: [number, number];
  /** 진행도 0%인 미완료 항목 제외 여부 */
  hideIncomplete: boolean;
  /** 키워드 검색 쿼리 문자열 */
  searchQuery: string;
}

export function useFilters() {
  const [filters, setFilters] = useState<FilterState>({
    selectedCategories: [],
    progressRange: [0, 100],
    hideIncomplete: false,
    searchQuery: '',
  });

  const toggleCategory = (cat: string) => {
    setFilters((prev) => ({
      ...prev,
      selectedCategories: prev.selectedCategories.includes(cat)
        ? prev.selectedCategories.filter((c) => c !== cat)
        : [...prev.selectedCategories, cat],
    }));
  };

  return { filters, setFilters, toggleCategory };
}
```

---

## ⌨️ 단축키 검색 모달 (`SearchDialog.tsx`)

사용자가 `Cmd + K` (macOS) 또는 `Ctrl + K` (Windows) 키를 누르면 검색 모달이 뜨며, 입력된 쿼리를 `pageTitle`, `id`, `depth1/2/3`, `path`, `note` 필드 전체에 대해 빠르게 텍스트 매칭합니다.

```typescript
// 단축키 이벤트 리스너 바인딩 예시
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      setSearchOpen((prev) => !prev);
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

---

## 📌 수정 시 주의사항
- 필터 조건 변경 시 전체 목록 개수와 필터링된 결과 개수를 연동하여 UI 상단 뱃지에 `Total: X / Filtered: Y` 형태로 표시합니다.
