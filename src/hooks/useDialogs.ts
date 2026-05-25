import { useCallback, useState } from 'react';

type DialogKey = 'site' | 'section' | 'dashboard' | 'settings' | 'search' | 'shortcuts';

/**
 * 다이얼로그/드로어 열림 상태를 한 곳에서 관리.
 * open(key), close(key), toggle(key), isOpen(key) API 제공.
 */
export function useDialogs() {
  const [open, setOpen] = useState<Record<DialogKey, boolean>>({
    site: false,
    section: false,
    dashboard: false,
    settings: false,
    search: false,
    shortcuts: false,
  });

  const isOpen = useCallback((key: DialogKey) => open[key], [open]);
  const openDialog = useCallback((key: DialogKey) => setOpen((p) => ({ ...p, [key]: true })), []);
  const closeDialog = useCallback((key: DialogKey) => setOpen((p) => ({ ...p, [key]: false })), []);
  const toggleDialog = useCallback((key: DialogKey) => setOpen((p) => ({ ...p, [key]: !p[key] })), []);

  return { isOpen, openDialog, closeDialog, toggleDialog };
}
