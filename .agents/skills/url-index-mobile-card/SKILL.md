---
name: url-index-mobile-card
description: src/components/MobileCard.tsx 및 MobileSwiper.tsx 기반 스킬 가이드 - 모바일 scroll-snap 풀-스크린 카드 스와이프 및 iframe 오토스크롤 헤더 제어 스킬
---

# 📱 `src/components/MobileCard.tsx` 파일 스킬 가이드

`src/components/MobileCard.tsx` 및 `MobileSwiper.tsx`는 터치 기반 모바일 기기 환경에서 각 페이지를 풀-스크린 카드로 스와이프하여 탐색할 수 있도록 제공하는 컴포넌트입니다.

---

## 📌 주요 담당 파일
- **핵심 소스**: `src/components/MobileCard.tsx`, `src/components/mobile/MobileSwiper.tsx`
- **연동 모듈**: `src/components/mobile/MobileTopBar.tsx`, `MobileBottomNav.tsx`

---

## 💡 `scroll-snap` 스와이프 인터랙션

```css
/* MobileSwiper 스크롤 컨테이너 스타일 */
.mobile-swiper-container {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
}

.mobile-card-item {
  flex: 0 0 100vw;
  scroll-snap-align: start;
  height: calc(100vh - 64px);
}
```

---

## 🔄 iframe 수직 스크롤 연동 Auto-Hide 헤더

모바일 카드 내부의 미리보기 iframe을 수직 스크롤할 때, 유저의 읽기 영역을 확보하기 위해 상단 `MobileTopBar`가 자동으로 올라가며 숨겨집니다.

```typescript
// 스크롤 이벤트 감지 및 헤더 토글 예시
export function useMobileHeaderAutoHide(iframeRef: React.RefObject<HTMLIFrameElement>) {
  const [headerVisible, setHeaderVisible] = useState(true);

  useEffect(() => {
    const handleScroll = (e: Event) => {
      const scrollTop = (e.target as HTMLElement).scrollTop;
      if (scrollTop > 50) {
        setHeaderVisible(false);
      } else {
        setHeaderVisible(true);
      }
    };

    // iframe 내부 window 이벤트 바인딩
    const iframeWin = iframeRef.current?.contentWindow;
    iframeWin?.addEventListener('scroll', handleScroll);
    return () => iframeWin?.removeEventListener('scroll', handleScroll);
  }, [iframeRef]);

  return headerVisible;
}
```

---

## 📌 수정 시 주의사항
- 모바일 카드 뷰에서는 터치 제스처 성능을 위해 iframe 오프스크린 렌더링 시 메모리 누수가 없는지 확인합니다.
- `scroll-snap` 인디케이터 도트 위치 연동 시 `IntersectionObserver` 또는 `onScroll` 디바운스를 활용합니다.
