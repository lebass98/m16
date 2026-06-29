export type PreviewScrollDirection = 'up' | 'down';

export const PREVIEW_SCROLL_DIR_EVENT = 'preview-scroll-dir' as const;

declare global {
  interface WindowEventMap {
    'preview-scroll-dir': CustomEvent<PreviewScrollDirection>;
  }
}
