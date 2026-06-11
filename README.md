# URL 인덱스 — 페이지 진행도 대시보드

웹 프로젝트의 페이지 목록을 한 곳에서 관리하고, 각 페이지의 **진행도(PC/모바일)** · **메뉴 카테고리** · **업데이트 이력** · **실시간 미리보기**까지 한 화면에서 확인할 수 있는 리액트 기반의 인덱스 대시보드입니다.

Minimals UI를 참고한 글래스모피즘 레이아웃을 기반으로, 데스크탑 · 태블릿 · 모바일 환경 모두에서 동작합니다.

---

## 🗂️ 등록된 워크스페이스 (프로젝트)

현재 대시보드에 연동된 프로젝트 목록입니다. 상단 사이트 선택 아이콘을 통해 손쉽게 전환할 수 있습니다:
1. **한국건강가정진흥원 (`familynet`)** — 가족 지원 서비스 URL 목록 ([tableData.ts](file:///Users/kmac4_home/WordNcode/React/www/m16/src/data/tableData.ts))
2. **국외소재문화유산재단 (`okchf`)** — 국외소재문화유산재단 sitemap URL 목록 ([okchfData.ts](file:///Users/kmac4_home/WordNcode/React/www/m16/src/data/okchfData.ts)) (신규 추가)

---

## ✨ 주요 기능

### 페이지 관리
- **계층형 카테고리** — 각 페이지는 `depth1 / depth2 / depth3` 3단계 분류를 가집니다.
- **PC · 모바일 진행도** — `0 / 20 / 40 / 60 / 80 / 100%` 6단계로 별도 관리.
- **메타데이터** — 페이지 제목, 아이디, URL 경로, 생성일/최근 업데이트일/완료일, 비고를 함께 저장.

### 화면 모드
- **데스크탑**
  - **리스트 보기** — `@mui/x-data-grid` 기반 표 형태.
  - **썸네일 보기** — 한 줄에 2 · 3 · 4 · 5개 카드 토글, 카드 안에서 PC / 태블릿 / 모바일 미리보기 비율 전환.
  - **좌측 사이드바** — 워크스페이스 정보, 페이지 개수, **카테고리(아이템의 depth1)별 필터링**, 사이드바 접기/펼치기.
  - **우측 패널** — 전체 진행도, 최근 업데이트 활동, 북마크, 섹션별 완성도 요약.
- **모바일**
  - **풀-스크린 카드 스와이프** — `scroll-snap`을 이용한 가로 스와이프.
  - **섹션 도트 인디케이터** — 현재 섹션 위치를 시각화.
  - **헤더 자동 숨김** — 카드 내부 미리보기를 스크롤할 때 상단 UI가 자연스럽게 숨겨집니다.

### 필터 · 검색
- **카테고리 필터** — 좌측 사이드바에서 아이템의 `depth1` 카테고리를 다중 선택해 필터링.
- **진행도 슬라이더** — `0–100%` 범위 슬라이더로 필터.
- **미완료 보기 토글** — 진행도 0%인 페이지를 숨김/표시.
- **검색** — `Cmd/Ctrl + K`로 빠른 검색. 제목 · 아이디 · 각 뎁스 · 비고를 모두 매칭.
- **정렬** — 번호 / 페이지제목 / 아이디 / 경로 / 진행도 / 생성일 / 최근 업데이트 / 완료일.

### 미리보기 & 북마크
- **iframe 실시간 미리보기** — 각 페이지의 실제 화면을 카드/리스트에서 바로 확인.
- **디바이스 시뮬레이션** — PC(1920×1080) / 태블릿(1024×768) / 모바일(375×667) 해상도로 렌더링.
- **북마크** — 자주 보는 페이지를 별도로 표시, `localStorage`에 영구 저장.

### 데이터 소스
- **정적 TS 데이터** — `src/data/tableData.ts`에 인라인.
- **구글 시트 CSV** — `SiteConfig.sheetCsvUrl`을 지정하면 시트에서 데이터를 가져옵니다. 실패 시 정적 데이터로 자동 폴백.

### 테마 · 접근성
- **다크 모드** — 토글 즉시 전환, 설정 영구 저장.
- **컬러 프리셋** — Minimals UI의 여러 기본 컬러 프리셋 적용.
- **폰트** — Pretendard, Inter, DM Sans, Barlow, Nunito Sans, Public Sans, Roboto.
- **폰트 크기** — 12–20px (전체 콘텐츠가 비율로 확대/축소).
- **RTL 지원** — `stylis-plugin-rtl` 기반 좌우 반전 모드.

---

## 🚀 빠른 시작

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (http://localhost:5173)
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과물 로컬 미리보기
npm run preview

# 데이터 → CSV 내보내기
npm run export:csv

# 린트 검사
npm run lint
```

---

## 📁 프로젝트 구조

```
url-index/
├── public/                       # 정적 자산 (파비콘 등)
├── scripts/
│   └── export-to-csv.ts          # tableData → CSV 내보내기 스크립트
├── src/
│   ├── App.tsx                   # 최상위 컴포넌트 (레이아웃 · 상태 · 라우팅)
│   ├── main.tsx                  # 엔트리 파일
│   ├── assets/                   # 이미지 · 아이콘
│   ├── components/
│   │   ├── SectionTable.tsx      # 데스크탑 리스트 / 썸네일 그리드
│   │   ├── MobileCard.tsx        # 모바일 카드
│   │   ├── PreviewFrame.tsx      # iframe 미리보기 (디바이스별 스케일)
│   │   ├── PathPreviewIcons.tsx  # 경로 복사 · 외부 링크 버튼
│   │   ├── ProgressBar.tsx       # 6단계 진행도 바
│   │   ├── SearchDialog.tsx      # Cmd/Ctrl+K 검색 모달
│   │   ├── SettingsDrawer.tsx    # 설정 드로어 (다크/프리셋/폰트/RTL)
│   │   ├── StatusBadge.tsx       # 상태 뱃지
│   │   ├── BottomNav.tsx         # 모바일 하단 내비게이션
│   │   ├── LogList.tsx           # 업데이트 로그
│   │   └── PathLink.tsx          # URL 링크 표시
│   ├── data/
│   │   ├── sites.ts              # 사이트(워크스페이스) 정의
│   │   ├── tableData.ts          # 메인 페이지 데이터 (한국건강가정진흥원)
│   │   ├── okchfData.ts          # 국외소재문화유산재단 sitemap 데이터 (신규 추가)
│   │   ├── tableData2.ts         # 추가 데이터
│   │   ├── tableData_epaa.ts     # 보조 데이터
│   │   └── parseSheetCsv.ts      # 구글 시트 CSV 로더
│   ├── hooks/
│   │   └── useIframeAutoScroll.ts  # 미리보기 자동 스크롤
│   ├── theme/                    # Minimals UI 테마 시스템
│   │   ├── theme-provider.tsx
│   │   ├── presets.ts            # 컬러 프리셋
│   │   ├── fonts.ts              # 폰트 정의
│   │   ├── theme-config.ts
│   │   └── core/
│   ├── types/
│   │   ├── index.ts              # TableItem · TableSection 타입
│   │   └── events.ts             # 커스텀 이벤트 키
│   ├── App.css
│   └── index.css
├── eslint.config.js
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
└── package.json
```

---

## 🗂️ 데이터 모델

```ts
// src/types/index.ts
export type ProgressValue = 0 | 20 | 40 | 60 | 80 | 100;

export interface TableItem {
  pageTitle: string;     // 페이지 제목
  id: string;            // 페이지 식별자 (예: FE_SE_0001)
  depth1: string;        // 1단계 카테고리 (예: '메인', '자체평가')
  depth2: string;        // 2단계 카테고리 (예: '평가하기')
  depth3: string;        // 3단계 카테고리 (예: '목록')
  path: string;          // 페이지 URL
  progressPc: ProgressValue;       // PC 진행도
  progressMobile: ProgressValue;   // 모바일 진행도
  start: string;         // 생성일 (YYYY.MM.DD)
  updatedAt: string;     // 최근 업데이트일
  end: string;           // 완료일
  note: string;          // 비고
  depthOnly?: boolean;   // 분류용 더미 행 여부
}

export interface TableSection {
  depth1: string;        // 섹션(프로젝트) 그룹명
  data: TableItem[];
}
```

> **🔑 섹션 depth1 과 아이템의 카테고리 depth1 구분**
> `TableSection.depth1`은 **프로젝트 그룹명**(예: "가족센터 평가시스템 기능개발"),
> `TableItem.depth1`은 **실제 카테고리 1뎁스**(예: "메인", "자체평가", "평가 관리")로 서로 다른 의미입니다.
> 좌측 사이드바의 "섹션" 리스트는 `TableItem.depth1` 기준으로 그룹화되며, 클릭 시 해당 카테고리에 속한 아이템만 표시됩니다.

### 사이트(워크스페이스) 정의

```ts
// src/data/sites.ts
export interface SiteConfig {
  key: string;                // URL 쿼리 식별자 (?site=key)
  title: string;              // 워크스페이스 표시명
  data: TableSection[];       // 정적 데이터 (폴백용)
  color?: string;             // 사이트 강조 컬러
  description?: string;
  /**
   * 구글 시트 "웹에 게시" CSV URL.
   * 지정 시 앱 로드와 함께 시트에서 데이터를 가져옵니다 (실패하면 data로 폴백).
   */
  sheetCsvUrl?: string;
}
```

---

## 🎨 테마 커스터마이징

### 다크 모드
우측 상단 토글 버튼 또는 `localStorage.darkMode = 'true' | 'false'`.

### 컬러 프리셋
설정 드로어 → 프리셋 선택. `src/theme/presets.ts`에서 커스텀 프리셋 추가 가능.

### 폰트
설정 드로어 → 폰트 패밀리 선택. `src/theme/fonts.ts`에 폰트 정의.
모든 폰트는 `@fontsource/*` 패키지로 셀프 호스팅 — 외부 네트워크 의존 없음.

### 폰트 크기
설정 드로어의 슬라이더로 12–20px 조정. `document.body.style.zoom`을 이용해 전체 콘텐츠를 비율로 확대/축소합니다.

---

## ⌨️ 단축키

| 키                | 동작                              |
| ----------------- | --------------------------------- |
| `Cmd/Ctrl + K`    | 검색 모달 열기                    |
| 좌우 방향키       | 모바일 카드 이동                  |
| 마우스 휠 (가로)  | 데스크탑 썸네일 그리드 가로 스크롤 |

---

## 📊 데이터 내보내기

```bash
npm run export:csv
```

`scripts/export-to-csv.ts` 가 `tableData` 를 읽어 `exports/` 폴더에 CSV 파일로 내보냅니다.

---

## 🔄 구글 시트 연동

1. 시트 → **파일 > 공유 > 웹에 게시**
2. 게시 대상: 특정 시트 선택
3. 형식: **쉼표로 구분된 값(.csv)**
4. **게시** → 발급된 URL 을 `SiteConfig.sheetCsvUrl` 에 지정

```ts
// src/data/sites.ts
{
  key: 'familynet',
  title: '한국건강가정진흥원',
  data: tableData,
  color: '#4a7ab5',
  sheetCsvUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-…/pub?gid=0&single=true&output=csv',
}
```

CSV 컬럼은 `TableItem` 의 필드명과 매칭됩니다 (`src/data/parseSheetCsv.ts` 참조).

---

## 🧰 기술 스택

| 영역         | 라이브러리                                                                  |
| ------------ | --------------------------------------------------------------------------- |
| 프레임워크   | 리액트 19, 타입스크립트 6, Vite 8                                           |
| UI           | MUI (Material UI) 9, `@mui/x-data-grid`, `@iconify/react`                   |
| 스타일       | Emotion, Minimals UI 테마 시스템, `stylis-plugin-rtl`                       |
| 폰트         | `@fontsource/*` (Pretendard, Inter, DM Sans, Barlow, Nunito Sans, …)        |
| 데이터       | 정적 TS · 구글 시트 CSV                                                     |
| 영구 저장    | `localStorage` (다크모드/뷰모드/북마크/정렬/프리셋/폰트 등)                 |
| 빌드 도구    | Vite 8 (Rolldown 기반), 타입스크립트 프로젝트 레퍼런스                      |
| 린트         | ESLint 9, `typescript-eslint`, `eslint-plugin-react-hooks`                  |
| 도구         | `tsx` (CSV 내보내기 스크립트 실행용)                                        |

---

## 🛠️ 개발 가이드

### 새 페이지 추가
`src/data/tableData.ts` 의 해당 섹션 `data` 배열에 새 `TableItem` 을 추가합니다.

```ts
{
  pageTitle: '신규 페이지',
  id: 'FE_NEW_0001',
  depth1: '메인',
  depth2: '',
  depth3: '',
  path: 'https://example.com/path',
  progressPc: 0,
  progressMobile: 0,
  start: '2026.05.21',
  updatedAt: '',
  end: '',
  note: '',
}
```

### 새 카테고리(섹션) 추가
`tableData` 배열에 새 `TableSection` 객체를 추가합니다.

```ts
{
  depth1: '신규 프로젝트',
  data: [
    /* TableItem 배열 */
  ],
}
```

### 새 사이트(워크스페이스) 추가
`src/data/sites.ts` 의 `sites` 배열에 `SiteConfig` 를 추가하면 사이트 선택 모달에서 전환할 수 있습니다.

### 타입스크립트 타입 체크

```bash
npx tsc --noEmit
```

---

## 🌐 브라우저 지원

최신 크로미움 · 파이어폭스 · 사파리 · 엣지.
`backdrop-filter`, `scroll-snap-type`, `aspect-ratio`, CSS 그리드를 적극 사용하므로 최신 브라우저를 권장합니다.

---

## 📝 라이선스

내부 프로젝트 — 별도 라이선스 명시 없음.
