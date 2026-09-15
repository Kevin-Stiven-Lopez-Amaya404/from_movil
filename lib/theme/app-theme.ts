import { useMemo } from "react";

import { ColorMode, useSmartHome } from "@/lib/context/smart-home-context";

export type AppTheme = ReturnType<typeof getAppTheme>;

/**
 * Devuelve la paleta visual de la aplicación
 * según el modo claro u oscuro.
 */
export function getAppTheme(mode: ColorMode) {
  const dark = mode === "dark";

  return {
    dark,

    // ==========================================
    // COLORES PRINCIPALES
    // ==========================================

    blue1: "#E8F1FF",
    blue: "#0047AB",
    primary: "#003380",

    // Color utilizado sobre fondos primarios.
    onPrimary: "#FFFFFF",

    // ==========================================
    // FONDOS
    // ==========================================

    background: dark ? "#101827" : "#F8FAFC",

    card: dark ? "#172033" : "#FFFFFF",

    row: dark ? "#111827" : "#FFFFFF",

    rowAlt: dark ? "#1F2937" : "#EBF2FA",

    // ==========================================
    // TEXTOS
    // ==========================================

    text: dark ? "#F8FAFC" : "#0A192F",

    muted: dark ? "#CBD5E1" : "#64748B",

    // ==========================================
    // BORDES
    // ==========================================

    border: dark ? "#334155" : "#E2E8F0",

    borderLight: dark ? "#1E293B" : "#E2E8F0",

    // ==========================================
    // ESTADOS
    // ==========================================

    danger: "#FF3B20",

    dangerSoft: dark ? "#3A1D1A" : "#FFF1EF",

    success: "#22C55E",

    successSoft: dark ? "#123521" : "#DCFCE7",

    // ==========================================
    // BARRA DE NAVEGACIÓN
    // ==========================================

    tabBar: dark ? "#111827" : "#FFFFFF",

    // ==========================================
    // SOMBRAS
    // ==========================================

    shadow: dark ? "#000000" : "#00000010",

    // ==========================================
    // TABS / FILTROS
    // ==========================================

    tab: {
      activeBackground: dark ? "#1E3A5F" : "#E8F1FF",

      inactiveBackground: dark ? "#172033" : "#FFFFFF",

      activeBorder: dark ? "#60A5FA" : "#0047AB",

      inactiveBorder: dark ? "#334155" : "#E2E8F0",

      activeText: dark ? "#FFFFFF" : "#0047AB",

      inactiveText: dark ? "#CBD5E1" : "#475569",

      disabledText: dark ? "#64748B" : "#94A3B8",

      pressedOpacity: 0.75,

      activeShadow: dark ? "#000000" : "#00000020",
    },
  };
}

/**
 * Hook para consumir el tema actual desde cualquier componente.
 */
export function useAppTheme() {
  const { colorMode } = useSmartHome();

  return useMemo(() => getAppTheme(colorMode), [colorMode]);
}
