import { useEffect } from 'react';

interface Options {
  /** Cmd/Ctrl 필요 여부. 기본값 true (하위 호환). */
  modifier?: boolean;
  /** Shift 필요 여부. */
  shift?: boolean;
  /** input/textarea/contentEditable 안에서도 활성화할지. 기본 false (입력 방해 방지). */
  allowInInputs?: boolean;
}

/**
 * 전역 키보드 단축키를 바인딩.
 *
 * - 기본: Cmd/Ctrl + key (modifier=true)
 * - 단일 키만 쓰려면 modifier=false 전달 (예: '/', '?')
 *
 * 입력 영역(input/textarea/contenteditable)에서는 기본 비활성 — `/`나 `?` 같은
 * 키가 사용자의 텍스트 입력을 가로채는 사고를 막기 위함.
 */
export function useKeyboardShortcut(
  key: string,
  handler: () => void,
  options: Options = {},
) {
  const { modifier = true, shift = false, allowInInputs = false } = options;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (modifier && !(e.metaKey || e.ctrlKey)) return;
      if (!modifier && (e.metaKey || e.ctrlKey || e.altKey)) return;
      if (shift !== e.shiftKey) return;
      if (e.key.toLowerCase() !== key.toLowerCase()) return;

      if (!allowInInputs) {
        const t = e.target as HTMLElement | null;
        if (t) {
          const tag = t.tagName;
          if (tag === 'INPUT' || tag === 'TEXTAREA' || t.isContentEditable) return;
        }
      }

      e.preventDefault();
      handler();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [key, handler, modifier, shift, allowInInputs]);
}
