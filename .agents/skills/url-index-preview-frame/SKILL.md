---
name: url-index-preview-frame
description: src/components/PreviewFrame.tsx 및 useIframeAutoScroll.ts 기반 스킬 가이드 - iframe 미리보기 디바이스 해상도 시뮬레이션, 스케일 조절 및 오토 스크롤 스킬
---

# 🖼️ `src/components/PreviewFrame.tsx` 파일 스킬 가이드

`src/components/PreviewFrame.tsx`는 퍼블리싱된 타겟 URL 페이지를 iframe으로 로드하고, PC(1920px), 태블릿(1024px), 모바일(375px) 등 디바이스 해상도를 비율 계산(CSS transform scale)을 통해 카드 컴포넌트 내부에 정밀 시뮬레이션하는 컴포넌트입니다.

---

## 📌 주요 담당 파일
- **핵심 소스**: `src/components/PreviewFrame.tsx`
- **연동 훅**: `src/hooks/useIframeAutoScroll.ts`

---

## 💻 디바이스 비율 및 Scale 연산 로직

```typescript
export interface PreviewFrameProps {
  path: string;
  device?: 'pc' | 'tablet' | 'mobile';
  scaleMode?: 'auto' | '100%' | '75%' | '50%';
  onLoad?: () => void;
}

const DEVICE_WIDTHS = {
  pc: 1920,
  tablet: 1024,
  mobile: 375,
};

export function PreviewFrame({ path, device = 'pc', scaleMode = 'auto' }: PreviewFrameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.25);

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.clientWidth;
    const targetWidth = DEVICE_WIDTHS[device];
    
    // 비율 연산
    if (scaleMode === 'auto') {
      setScale(containerWidth / targetWidth);
    } else {
      setScale(parseFloat(scaleMode) / 100);
    }
  }, [device, scaleMode]);

  return (
    <Box ref={containerRef} sx={{ width: '100%', height: '100%', overflow: 'hidden' }}>
      <iframe
        src={path}
        style={{
          width: `${DEVICE_WIDTHS[device]}px`,
          height: '1080px',
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          border: 'none',
          pointerEvents: 'auto',
        }}
      />
    </Box>
  );
}
```

---

## 📜 자동 스크롤 훅 (`useIframeAutoScroll.ts`)

미리보기 카드에 마우스 호버 시 썸네일 내부 페이지가 상하로 천천히 자동 스크롤(Auto Scroll)되어 전체 화면 구성을 한눈에 둘러볼 수 있는 UX를 제공합니다.

```typescript
export function useIframeAutoScroll(iframeRef: React.RefObject<HTMLIFrameElement>, isHovered: boolean) {
  useEffect(() => {
    if (!isHovered || !iframeRef.current) return;
    const iframeWindow = iframeRef.current.contentWindow;
    if (!iframeWindow) return;

    let intervalId: NodeJS.Timeout;
    intervalId = setInterval(() => {
      iframeWindow.scrollBy({ top: 2, behavior: 'smooth' });
    }, 30);

    return () => clearInterval(intervalId);
  }, [isHovered, iframeRef]);
}
```

---

## 📌 수정 시 주의사항
- 동일 출처 정책(SOP) 제한에 의해 Cross-Origin URL의 경우 iframe 내부에 직접 접근하는 스크롤 스크립트가 제한될 수 있으므로 `try-catch` 또는 동일 도메인 상대경로 사용을 권장합니다.
