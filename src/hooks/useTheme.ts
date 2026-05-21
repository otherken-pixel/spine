import { useEffect } from 'react';
import { useBooksStore } from '../store/useBooksStore';
import type { ThemeTokens } from '../types';

// Writes theme tokens as CSS custom properties on <html data-theme="...">
export function useTheme() {
  const activeThemeId = useBooksStore((s) => s.activeThemeId);
  const getActiveTheme = useBooksStore((s) => s.getActiveTheme);

  useEffect(() => {
    const theme = getActiveTheme();
    const root = document.documentElement;
    root.setAttribute('data-theme', theme.id);

    const tokens = theme.tokens as ThemeTokens;
    const map: [string, string][] = [
      ['--room-bg', tokens.roomBg],
      ['--shelf-color', tokens.shelfColor],
      ['--shelf-edge', tokens.shelfEdge],
      ['--ambient-light', tokens.ambientLight],
      ['--text-primary', tokens.textPrimary],
      ['--text-secondary', tokens.textSecondary],
      ['--overlay-bg', tokens.overlayBg],
      ['--card-bg', tokens.cardBg],
      ['--accent', tokens.accent],
    ];
    map.forEach(([prop, val]) => root.style.setProperty(prop, val));
  }, [activeThemeId, getActiveTheme]);
}

export function useGoogleBooks() {
  return useBooksStore;
}
