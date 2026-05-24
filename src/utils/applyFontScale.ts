/**
 * 폰트 크기 슬라이더(12–20px) → 화면 스케일 적용.
 *
 * Chrome/Safari/Edge: 비표준이지만 가장 자연스러운 `zoom` 사용 — 레이아웃 폭을 함께 조정해줌.
 * Firefox: zoom 미지원. transform: scale + body width 보정으로 동일 효과 흉내.
 *
 * 16px가 기준(스케일 1).
 */
export function applyFontScale(px: number): void {
  const scale = px / 16;
  const body = document.body;
  const supportsZoom = typeof CSS !== 'undefined' && CSS.supports?.('zoom', '1');

  if (supportsZoom) {
    (body.style as CSSStyleDeclaration & { zoom: string }).zoom = String(scale);
    return;
  }

  // Firefox 폴백: transform scale + 폭 보정
  body.style.transform = scale === 1 ? '' : `scale(${scale})`;
  body.style.transformOrigin = '0 0';
  body.style.width = scale === 1 ? '' : `${100 / scale}%`;
}
