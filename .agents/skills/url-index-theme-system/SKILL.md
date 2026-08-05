---
name: url-index-theme-system
description: src/theme/ 및 GlassCard.tsx 기반 스킬 가이드 - Minimals UI 기반 커스텀 테마 토큰, 다크 모드, 컬러 프리셋, RTL 및 폰트 스케일 시스템 구축 가이드
---

# 🎨 `src/theme/` 테마 시스템 파일 스킬 가이드

본 스킬은 `url-index` 프로젝트의 MUI(Material UI) 기반 커스텀 테마 아키텍처, 다크/라이트 모드 동적 전환, 컬러 프리셋, RTL(Right-to-Left) 지원 및 글래스모피즘(Glassmorphism) 스타일링 시스템을 다룹니다.

---

## 📌 주요 담당 파일
- **테마 프로바이더**: `src/theme/theme-provider.tsx`
- **컬러 프리셋**: `src/theme/presets.ts`
- **폰트 정의**: `src/theme/fonts.ts`
- **폰트 스케일 유틸**: `src/utils/applyFontScale.ts`
- **글래스 컴포넌트**: `src/components/GlassCard.tsx`
- **설정 드로어**: `src/components/SettingsDrawer.tsx`

---

## 1. 🌈 다크 모드 & 컬러 프리셋 (`src/theme/presets.ts`)

프로젝트는 6가지 주요 브랜딩 컬러 프리셋을 제공합니다. 설정 변경 시 앱 전체의 `primary` 색상이 반응적으로 변경됩니다.

```typescript
export const colorPresets = [
  { name: 'default', label: 'Default', main: '#00A76F' },
  { name: 'cyan', label: 'Cyan', main: '#078DEE' },
  { name: 'purple', label: 'Purple', main: '#7635DC' },
  { name: 'blue', label: 'Blue', main: '#2065D1' },
  { name: 'orange', label: 'Orange', main: '#FDA92D' },
  { name: 'red', label: 'Red', main: '#FF3030' },
];
```

---

## 2. 🔤 동적 폰트 및 폰트 스케일 적용 (`src/utils/applyFontScale.ts`)

사용자가 설정 드로어(`SettingsDrawer.tsx`)에서 폰트 크기(12px ~ 20px)를 조절하면 HTML 루트 요소의 font-size가 변경되어 비율로 전체 UI의 크기가 확장/축소됩니다.

```typescript
/**
 * 앱 전체 폰트 스케일 반응형 적용 함수
 * @param fontSizePixels 기준 폰트 크기 (기본값: 16px)
 */
export function applyFontScale(fontSizePixels: number) {
  const rootElement = document.documentElement;
  const scalePercentage = (fontSizePixels / 16) * 100;
  rootElement.style.fontSize = `${scalePercentage}%`;
}
```

---

## 3. 🔍 글래스모피즘(Glassmorphism) & 카드 스타일링 (`src/components/GlassCard.tsx`)

대시보드의 세련된 미감을 위해 배경 블러(Backdrop Filter)와 미세 반투명 보더 패턴을 가진 글래스모피즘 스타일을 적극 활용합니다.

```tsx
import { Paper, styled } from '@mui/material';

export const GlassCard = styled(Paper)(({ theme }) => ({
  background: theme.palette.mode === 'dark'
    ? 'rgba(22, 28, 36, 0.72)'
    : 'rgba(255, 255, 255, 0.72)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: `1px solid ${
    theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.08)'
      : 'rgba(145, 158, 171, 0.12)'
  }`,
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.customShadows.z8,
}));
```

---

## 📌 스킬 사용 가이드 요약

- **새로운 UI 컴포넌트 스타일링 시**: inline sx 속성에 감으로 색상을 넣지 말고 `theme.palette.primary.main` 또는 `GlassCard` 커스텀 컴포넌트를 사용합니다.
- **새로운 폰트 추가 시**: `src/theme/fonts.ts`에 폰트명을 추가하고 `@font-face` 또는 Google Fonts 링크를 `index.html`에 동기화합니다.
