# CLAUDE.md

이 파일은 Claude(또는 다른 AI 코딩 에이전트)가 이 저장소에서 작업할 때 참고할 가이드입니다.

⚠️ **AI 에이전트 행동 지침 (AI Agent Rule)**:
- 사용자와 대화하거나 코드를 설명할 때, 그리고 커밋 메시지를 작성할 때 **반드시 한국어(한글)만 사용**해야 합니다.
- 영문 기술 용어를 제외한 모든 본문 설명, 설명 파일(아티팩트 포함), Git 커밋 메시지 작성은 한국어로 번역 및 구성되어야 합니다.

---

## 프로젝트 한 줄

웹 프로젝트 페이지 목록의 진행도(PC/모바일) · 카테고리 · 미리보기를 한 화면에서 관리하는 **리액트 19 + Vite 8 + MUI 9** 대시보드.

---

## 명령어 (Commands)

```bash
npm run dev            # 개발 서버 (http://localhost:5173)
npm run build          # tsc -b && vite build
npm run preview        # 빌드 결과 미리보기
npm run lint           # ESLint
npm test               # Vitest (1회 실행)
npm run test:watch     # Vitest 워치 모드
npm run export:csv     # tableData → CSV
```

PR/푸시 시 [.github/workflows/ci.yml](.github/workflows/ci.yml)가 `tsc → lint → test → build`를 모두 통과해야 합니다.

---

## 아키텍처

### 디렉터리 구조
```
src/
├── App.tsx                       # 오케스트레이터 (~420줄)
├── main.tsx                      # 엔트리 + ErrorBoundary
├── components/
│   ├── desktop/                  # 데스크탑 전용 (LeftSidebar, TopHeader, FilterBar, ViewToolbar, RightPanel)
│   ├── mobile/                   # 모바일 전용 (MobileTopControls, MobileHeader, MobileSwiper)
│   ├── dialogs/                  # 모달 (SitePicker, SectionPicker, Dashboard)
│   ├── GlassCard.tsx             # 글래스모피즘 카드 (디자인 토큰)
│   ├── ErrorBoundary.tsx
│   └── ...                       # 공용 (SectionTable, SearchDialog, SettingsDrawer, MobileCard, ...)
├── hooks/
│   ├── usePersistedState.ts      # localStorage 동기화 useState (validate 옵션)
│   ├── useSiteData.ts            # 시트 fetch + 폴백
│   ├── useFilteredData.ts        # 필터·정렬·파생통계
│   ├── useFilters.ts             # 검색/진행도/섹션 필터 묶음
│   ├── useDialogs.ts             # 다이얼로그 open/close 통합
│   ├── useBookmarks.ts
│   ├── useKeyboardShortcut.ts
│   └── useScrollSnapIndex.ts     # 모바일 스와이프 인덱스
├── data/
│   ├── sites.ts                  # SiteConfig[] — URL ?site= 로 전환
│   ├── tableData.ts              # 정적 폴백 데이터
│   └── parseSheetCsv.ts          # Google Sheets CSV 로더
├── theme/
│   ├── tokens.ts                 # glassCardSx 등 sx 토큰
│   └── ...                       # Minimals UI 테마 시스템
├── constants/sort.ts             # SortKey 타입 + 가드
└── utils/
    ├── getLatestDate.ts
    └── applyFontScale.ts         # zoom + Firefox 폴백
```

### 상태 관리 패턴

App.tsx가 **오케스트레이터**입니다. 자식 컴포넌트는 props만 받는 표현 컴포넌트.

영구설정 / 그룹화된 상태는 모두 훅으로 옮겨졌습니다:
- 한 줄짜리 영구설정 → `usePersistedState(key, fallback, { validate? })`
- 필터 묶음 → `useFilters()`
- 다이얼로그 묶음 → `useDialogs()` (`isOpen`/`openDialog`/`closeDialog`/`toggleDialog`)
- 북마크 → `useBookmarks()`

새 영구설정 추가할 때: **반드시 `usePersistedState`** 사용. 직접 `localStorage` 호출 금지.

### 데이터 모델

```ts
type ProgressValue = 0 | 20 | 40 | 60 | 80 | 100;

interface TableItem {
  pageTitle: string; id: string;
  depth1: string; depth2: string; depth3: string;  // 아이템 카테고리
  path: string;
  progressPc: ProgressValue; progressMobile: ProgressValue;
  start: string; updatedAt: string; end: string;   // YYYY.MM.DD
  note: string;
  depthOnly?: boolean;
}

interface TableSection {
  depth1: string;        // 프로젝트 그룹명 (TableItem.depth1과 의미 다름)
  data: TableItem[];
}
```

⚠️ **`TableSection.depth1` vs `TableItem.depth1` 의미가 다름** — 전자는 프로젝트 그룹명, 후자는 페이지의 카테고리. 사이드바 "섹션" 리스트는 `TableItem.depth1`을 기준으로 그룹화합니다.

---

## 디자인 시스템

- **글래스 카드**: `import GlassCard from 'components/GlassCard'` — 6속성 묶음을 캡슐화. 인라인으로 다시 풀어쓰지 말 것.
- **썸네일 카드(`SectionTable`의 `RecipeCard`) 액션 버튼**: 북마크·파일 보기·전체화면 미리보기 3개 버튼은 **카드 하단 정보 영역의 제목 줄 우측 상단**에 한 그룹으로 모아 둔다(썸네일 위 오버레이나 풀-폭 CTA로 흩어 놓지 말 것). 공통 스타일은 `roundActionBtnSx`(원형·흰 바탕·`grey.400` 테두리·`grey.600` 아이콘·호버 시 살짝 떠오르며 검정 `#111` 바탕·흰색 아이콘으로 반전)를 재사용하고, 각 버튼은 한국어 `Tooltip`(`arrow`)과 `aria-label`을 단다. 전체화면 미리보기는 `OpenInFullIcon`(대각선 양방향 화살표)을 쓴다. `gap: '8px'`로 나란히 배치. 새 카드 액션 버튼을 추가할 땐 이 그룹에 같은 스타일로 넣는다.
- **컬러/팔레트**: Minimals UI `var(--palette-*-mainChannel)` 사용. hard-coded hex 지양.
- **다크 모드**: `data-color-scheme` 속성 + Minimals 자동 전환.
- **폰트 크기**: 12~20px 슬라이더 → `applyFontScale()`로 `body.zoom` (Firefox는 transform 폴백).

---

## 데이터 소스 두 가지

1. **정적**: `src/data/tableData.ts` (기본 폴백)
2. **Google Sheets**: `SiteConfig.sheetCsvUrl` 지정 시 부팅 시 fetch. 실패하면 자동 폴백.

새 사이트 추가: `src/data/sites.ts`에 `SiteConfig` 추가 → `?site=key` 쿼리로 전환.

---

## 테스트

- **Vitest + jsdom + @testing-library/react**.
- 위치: `src/**/*.test.{ts,tsx}`, 셋업: `src/test/setup.ts`.
- 현재 커버: `getLatestDate`, `isSortKey`, `csvToSections`, `useFilteredData`.
- 신규 순수 함수 / 훅을 추가하면 **테스트도 같이** 작성하세요.

---

## 컨벤션

- **변경 후 반드시**: `npx tsc --noEmit`, `npm test`, `npm run build` 모두 통과해야 함.
- **외부 링크**: `window.open(url, '_blank', 'noopener,noreferrer')` 필수.
- **localStorage 직접 호출 금지**: `usePersistedState` 사용 (북마크처럼 Set이 필요한 경우만 예외).
- **인라인 sx 반복**: 같은 6+ 속성이 3번 이상 반복되면 `theme/tokens.ts`에 추출하거나 컴포넌트화.
- **`:any` 금지**: 타입 가드(`filter((c): c is T => ...)`) 사용.
- **새 영구설정 키**: snake_case 아닌 camelCase로 (`darkMode`, `sortBy` 등 기존 컨벤션 유지).

---

## 흔히 하는 작업

### 새 페이지 추가
`src/data/tableData.ts`의 해당 섹션 `data` 배열에 `TableItem` 추가.

### 새 섹션(프로젝트 그룹) 추가
`tableData` 배열에 새 `TableSection` 객체 추가.

### 새 워크스페이스(사이트) 추가
`src/data/sites.ts`의 `sites` 배열에 `SiteConfig` 추가.

### 새 정렬 키 추가
1. `src/constants/sort.ts`의 `SORT_KEYS`, `SORT_LABELS`에 추가.
2. `src/hooks/useFilteredData.ts`의 `switch (sortBy)`에 case 추가.

### 새 다이얼로그 추가
1. `src/hooks/useDialogs.ts`의 `DialogKey` 유니온 타입에 키 추가.
2. `src/components/dialogs/`에 컴포넌트.
3. App.tsx에서 `dialogs.isOpen('key') / dialogs.openDialog('key') / dialogs.closeDialog('key')` 호출.

---

## 알려진 제약

- **iframe 미리보기**: `X-Frame-Options` / CSP로 차단된 외부 사이트는 빈 화면이 됨 (헬스체크는 향후 과제).
- **`zoom` 속성**: Chrome/Safari/Edge는 네이티브, Firefox는 `transform: scale` 폴백.
- **번들 크기**: 빌드 시 1.1MB+ 경고 — Pretendard 폰트와 MUI가 주요 원인. 의존성 위생 검토는 향후 과제.

---

## 변경 이력

### 2026-06-04

**썸네일 카드 액션 버튼 정비** ([SectionTable.tsx](src/components/SectionTable.tsx))
- 북마크·파일 보기·전체화면 미리보기 버튼을 카드 하단 제목 줄 우측 상단에 원형 그룹으로 통합.
- 버튼 스타일을 흰 바탕·그레이 테두리·그레이 아이콘으로 변경(호버 시 검정 바탕·흰 아이콘으로 반전).
- 전체화면 아이콘을 `FullscreenIcon` → `OpenInFullIcon`으로 교체하고 중앙 정렬.

**미리보기 다이얼로그 다크 뷰어 통일** ([FullscreenPreviewDialog.tsx](src/components/dialogs/FullscreenPreviewDialog.tsx), [ComparePreviewDialog.tsx](src/components/dialogs/ComparePreviewDialog.tsx))
- 단일/비교 미리보기 창을 어두운 톤으로 통일(헤더 `#161C24`, 배경 `#0B0E11`, 백드롭 `rgba(0,0,0,0.92)`).
- 타이틀·경로는 흰색/밝은 회색, 디바이스 토글·새 탭·닫기·새로고침 아이콘은 흰색 계열로 가독성 개선.

**배포 캐시 문제 대응** ([public/.htaccess](public/.htaccess), [vite.config.ts](vite.config.ts))
- "빌드 웹에서 정렬 안 됨" 원인은 코드 버그가 아니라 **브라우저가 잡고 있던 옛 번들 캐시**였음(데스크탑·라이브 실측으로 확인, 시크릿 창에선 정상). 운영 서버 m16.co.kr이 index.html에 캐시 헤더를 안 보내는 게 근본 원인.
- Apache용 `.htaccess` 추가 → index.html/SW 스크립트는 `no-cache`, 해시 박힌 자산은 1년 영구 캐시. `<IfModule>` 가드로 안전 처리(단 `AllowOverride None`이면 .htaccess 자체가 막힐 수 있으니 업로드 후 200 확인).
- 실제 적용은 새 `dist/`를 m16.co.kr에 수동 업로드해야 함(GitHub Pages 배포와 별개).
- vite.config.ts의 잘못된 PWA 주석(`devOptions.enabled: false`인데 "dev에서도 등록"이라 적힘) 수정.
