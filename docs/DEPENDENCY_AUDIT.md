# 의존성 위생 보고서

생성일: 2026-05-24
빌드 기준: `npm run build` 직후 dist/

---

## 번들 사이즈

| 항목 | 크기 | gzip |
|---|---|---|
| `index.js` | **1,146 KB** | 340 KB |
| `index.css` | 27 KB | 4 KB |
| 폰트 자산 (woff/woff2) | **~10 MB** (106 파일) | - |

⚠️ JS 단일 chunk가 500KB 경고선을 넘음. 폰트는 lazy load(브라우저 캐시) — 사용 weight만 다운로드.

---

## 조치 완료

| 패키지 | 처분 | 사유 |
|---|---|---|
| `@fontsource/barlow` | 제거 | `src/index.css`에 임포트 됐으나 `fonts.ts`에 없어 선택 불가 |
| `@fontsource/roboto` | 제거 | CSS/코드 어디서도 임포트되지 않음 |
| `@fontsource/public-sans` | 제거 | CSS/코드 어디서도 임포트되지 않음 |

→ `package.json` dependencies 8→5 폰트 패키지.

---

## 권장 (이후 처리 — ROI 순)

### A. 의존성 라이브러리 검토

| 패키지 | 현재 | 권장 액션 |
|---|---|---|
| TypeScript `~6.0.2` | 베타 라인 | **5.6 LTS로 다운그레이드** 검토 — 안정성. 단, React 19 + Vite 8 호환 확인 필요 |
| Vite `^8.0.9` | 매우 최신 (Rolldown 기반) | 일단 유지 — 빌드 성능 좋음. 단 ecosystem 호환 이슈 시 6.x로 |
| MUI `^9.0.0` | 매우 최신 | 유지 (이미 마이그레이션 완료) |
| `@mui/x-data-grid` | 9.0.2 | 단일 컴포넌트(SectionTable 리스트 모드)에 사용. 작은 자체 테이블로 대체 시 100KB+ 절감 |
| `babel-plugin-react-compiler` | 1.0.0 | 유지 (성능 ↑) |
| `stylis-plugin-rtl` | 사용 | 유지 (RTL 모드 의존) |
| `@iconify/react` | 사용? | `grep -r "@iconify"` → 사용처 확인 필요 |

### B. 코드 분할 (chunk size 경고 해소)

`vite.config.ts`에 수동 chunk 정의:

```ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'mui-core': ['@mui/material', '@mui/icons-material'],
        'mui-grid': ['@mui/x-data-grid'],
        'react-vendor': ['react', 'react-dom'],
      },
    },
  },
},
```

→ initial JS 350KB+ 절감 예상 (병렬 다운로드 + 페이지간 캐시).

### C. 폰트 weight 슬림화

현재 각 폰트마다 4 weight (400/500/600/700) 임포트.
실측: 본문은 대부분 500/600/700 — **400만 제거**해도 25% 절감.

```css
/* src/index.css */
/* @import '@fontsource/pretendard/400.css';  ← 사용 여부 측정 후 결정 */
```

### D. Pretendard CDN으로 전환

`index.html`에 이미 `cdn.jsdelivr.net/.../pretendard.min.css` 링크 있음(중복).
셀프호스팅(`@fontsource/pretendard`) 제거 시 **~4MB** 절감.
단, 외부 CDN 의존성 추가 — 정책상 셀프호스팅 유지가 안전하면 패스.

### E. 미사용 export 분석

```bash
npx ts-unused-exports tsconfig.json
```

데드 export 감지. 1회성으로 확인 가치 있음.

### F. 보안 감사

```bash
npm audit
```

현재 1건 moderate vulnerability 보고 — 어떤 패키지인지 점검 필요.

---

## 모니터링 권장

1회성이 아니라 PR마다 번들 사이즈 변화를 보고 싶다면:

```bash
npm install -D rollup-plugin-visualizer
```

`vite.config.ts`에 추가하면 빌드 시 `dist/stats.html` 생성. CI에서 비교도 가능.
