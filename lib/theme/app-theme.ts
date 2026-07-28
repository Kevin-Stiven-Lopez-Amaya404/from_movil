import { useMemo } from "react";

import { ColorMode, useSmartHome } from "@/lib/context/smart-home-context";

export type AppTheme = ReturnType<typeof getAppTheme>;

/**
 * Devuelve la paleta visual de la app segun el modo seleccionado.
 *
 * Centralizar colores aqui evita que cada pantalla invente sus propios tonos y
 * permite que el cambio claro/oscuro sea consistente.
 */
export function getAppTheme(mode: ColorMode) {
  const dark = mode === "dark";

  return {
    dark,
    blue: "#0864C8",
    background: dark ? "#101827" : "#FFFFFF",
    card: dark ? "#172033" : "#F4F6FF",
    row: dark ? "#111827" : "#FFFFFF",
    rowAlt: dark ? "#1F2937" : "#EEF4FF",
    text: dark ? "#F8FAFC" : "#454545",
    muted: dark ? "#CBD5E1" : "#6B7280",
    border: dark ? "#334155" : "#DDE2F5",
    divider: dark ? "#2D3748" : "#DDE2F5",
    danger: "#FF3B20",
    dangerSoft: dark ? "#3A1D1A" : "#FFF1EF",
    success: "#35AD61",
    successSoft: dark ? "#123521" : "#BDE8CB",
    tabBar: dark ? "#111827" : "#FFFFFF",
    shadow: dark ? "#000000" : "#9AA6BD",
    tab: {
      activeBackground: "#0864C8",
      activeBorder: "#0864C8",
      activeText: "#FFFFFF",
      inactiveBackground: dark ? "#1F2937" : "#EEF4FF",
      inactiveBorder: dark ? "#334155" : "#DDE2F5",
      inactiveText: dark ? "#E2E8F0" : "#334155",
      disabledText: dark ? "#64748B" : "#94A3B8",
      hoverBackground: dark ? "#1E293B" : "#EFF6FF",
      focusRing: dark ? "#2563EB33" : "#93C5FD33",
      borderRadius: 14,
      height: 48,
      minWidth: 96,
      gap: 10,
      horizontalPadding: 14,
      pressedOpacity: 0.88,
      activeShadow: dark ? "#000000" : "#9AA6BD",
    },
  };
}

/**
 * Hook para consumir el tema actual desde cualquier componente.
 *
 * Lee `colorMode` del contexto global y memoriza la paleta para evitar
 * recalculos innecesarios en cada render.
 */
export function useAppTheme() {
  const { colorMode } = useSmartHome();

  return useMemo(() => getAppTheme(colorMode), [colorMode]);
}
