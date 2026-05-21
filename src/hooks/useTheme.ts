import { useEffect } from 'react';
import { useBooksStore } from '../store/useBooksStore';

export function useTheme() {
  const activeThemeId = useBooksStore((s) => s.activeThemeId);
  const getActiveTheme = useBooksStore((s) => s.getActiveTheme);

  useEffect(() => {
    const theme = getActiveTheme();
    const root = document.documentElement;
    root.setAttribute('data-theme', theme.id);

    const t = theme.tokens;
    const vars: [string, string][] = [
      ['--room-bg',            t.roomBg],
      ['--shelf-color',        t.shelfColor],
      ['--shelf-edge',         t.shelfEdge],
      ['--ambient-light',      t.ambientLight],
      ['--text-primary',       t.textPrimary],
      ['--text-secondary',     t.textSecondary],
      ['--overlay-bg',         t.overlayBg],
      ['--card-bg',            t.cardBg],
      ['--accent',             t.accent],
      ['--blur-intensity',     `${t.blurIntensity}px`],
      ['--shadow-color',       t.shadowColor],
      ['--shelf-gradient',     t.shelfGradient],
      ['--shelf-edge-gradient',t.shelfEdgeGradient],
    ];
    vars.forEach(([prop, val]) => root.style.setProperty(prop, val));
  }, [activeThemeId, getActiveTheme]);
}
