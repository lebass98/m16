# 🎨 URL Index — UI/UX 디자인 시스템 & 스타일 가이드라인

본 문서는 `URL Index (페이지 진행도 대시보드)` 프로젝트의 디자인 원칙, Minimals UI 기반 디자인 시스템 토큰, 다크/라이트 모드, 컬러 프리셋, 반응형 레이아웃 패턴 및 인터랙션 디자인 가이드를 정의합니다.

---

## 💎 1. 디자인 핵심 원칙 (Design Principles)

1. **시각적 완성도와 몰입감 (Visual Excellence)**
   - Minimals UI 기반의 글래스모피즘(Glassmorphism) 스타일을 적용하여 은은한 반투명 블러(Backdrop Filter)와 미세 보더로 고급스러운 대시보드 미감을 전달합니다.
2. **반응형 디바이스 최적화 (Device-Centric UX)**
   - 데스크탑에서는 데이터 집약적인 리스트/그리드 뷰를 제공하고, 모바일에서는 터치 친화적인 가로 스와이프(`scroll-snap`) 및 헤더 오토-히든(Auto-Hide) UX를 제공합니다.
3. **명확한 진행율 전달 (Clear Data Visualization)**
   - `0% / 20% / 40% / 60% / 80% / 100%` 6단계 시각화 진행도 바 및 뱃지로 페이지별 완성도를 직관적으로 판별할 수 있게 합니다.

---

## 🎨 2. 컬러 시스템 & 프리셋 (Color System & Presets)

### 2.1 다크 & 라이트 기본 팔레트
| 요소 | 라이트 모드 (Light) | 다크 모드 (Dark) | 비고 |
| :--- | :--- | :--- | :--- |
| **Primary Main** | `#00A76F` (Default Green) | `#5BE584` | 프리셋 선택에 따라 변동 |
| **Background Default**| `#FFFFFF` | `#161C24` | 메인 앱 배경 |
| **Paper / Card** | `rgba(255, 255, 255, 0.72)` | `rgba(22, 28, 36, 0.72)` | 글래스모피즘 효과 |
| **Text Primary** | `#212B36` | `#FFFFFF` | 주 텍스트 |
| **Text Secondary** | `#637381` | `#919EAB` | 보조 메타데이터 |
| **Border / Divider** | `rgba(145, 158, 171, 0.12)` | `rgba(255, 255, 255, 0.08)` | 반투명 구분선 |

### 2.2 6가지 컬러 프리셋 (Brand Presets)
- 🟢 **Default**: Primary `#00A76F`
- 🔷 **Cyan**: Primary `#078DEE`
- 🟣 **Purple**: Primary `#7635DC`
- 🔵 **Blue**: Primary `#2065D1`
- 🟠 **Orange**: Primary `#FDA92D`
- 🔴 **Red**: Primary `#FF3030`

---

## 🔤 3. 타이포그래피 & 폰트 스케일 (Typography & Font Scale)

### 3.1 권장 폰트 패밀리
- **기본 폰트**: Pretendard, Inter, DM Sans, Barlow, Public Sans, Roboto
- **본문 스타일**: Clean Sans-Serif (letter-spacing: -0.01em)

### 3.2 반응형 폰트 스케일 시스템
사용자가 설정 드로어에서 폰트 크기(12px ~ 20px)를 조절하면, 루트 HTML `font-size` 비율에 맞춰 전체 UI가 확대/축소됩니다.

```css
/* 폰트 스케일 계산 유틸리티 */
:root {
  font-size: 100%; /* 16px 기본값 */
}
```

---

## 🧩 4. 글래스모피즘(Glassmorphism) 컴포넌트 규격

### `GlassCard` 컴포넌트 스타일
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

## 🖥️ 5. 반응형 레이아웃 패턴 (Layout Patterns)

### 5.1 데스크탑 모드 (`> 900px`)
- **리스트 보기 (List View)**: `@mui/x-data-grid` 표 형태로 컬럼 정렬, 복수 선택, CMS 수정/삭제 제공.
- **썸네일 카드 그리드 (Card View)**: 한 줄당 2/3/4/5개 카드 선택 토글.
- **사이드바 & 패널**: 좌측 뎁스 카테고리 필터 사이드바 + 우측 종합 진행도 요약 패널.

### 5.2 모바일 모드 (`<= 900px`)
- **풀-스크린 가로 스와이프**: `scroll-snap-type: x mandatory` 기반 가로 카드 이동.
- **오토-히든 헤더**: iframe 내부를 수직 스크롤하면 상단 `MobileTopBar`가 자연스럽게 숨김 처리되어 가독성 확보.

---

## 🖼️ 6. 디바이스 시뮬레이션 & 미리보기 (Preview Engine)

| 디바이스 모드 | 시뮬레이션 해상도 | 비고 |
| :--- | :--- | :--- |
| 💻 **PC** | `1920 × 1080` | 데스크탑 표준 뷰포트 |
| 📱 **Tablet** | `1024 × 768` | 태블릿 가로 뷰포트 |
| 📲 **Mobile** | `375 × 667` | 모바일 수직 뷰포트 |

- **스케일 비율 옵션**: `Auto (컨테이너 자동 맞춤)` / `100%` / `75%` / `50%`
- **마우스 호버 인터랙션**: 미리보기 카드 호버 시 30ms 간격으로 y축 자동 스크롤(Auto Scroll) 동작.

---

## 📊 7. 진행도 & 상태 표시 규격 (Status & Progress)

### 7.1 6단계 진행율 색상 인디케이터
- `0%` (시작 전): `#919EAB` (Muted Grey)
- `20%` (기획/설계): `#FF4842` (Error Red)
- `40%` (퍼블리싱 진행): `#FFC107` (Warning Amber)
- `60%` (퍼블리싱 완료): `#1890FF` (Info Blue)
- `80%` (검수 진행): `#7635DC` (Purple)
- `100%` (완료): `#5BE584` (Success Green)

---

## ⌨️ 8. 단축키 및 접근성 (Shortcuts & Accessibility)
- **`Cmd/Ctrl + K`**: 전역 빠른 검색 모달 팝업.
- **RTL 모드 지원**: `stylis-plugin-rtl`을 통한 텍스트 방향 및 아이콘 반전 모드 지원.
