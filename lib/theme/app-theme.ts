import { useMemo } from "react";

import { useSmartHome } from "@/lib/context/smart-home-context";
import type {
  ColorPaletteName,
  EffectiveColorMode,
} from "@/lib/domain/preferences";

export type AppTheme = ReturnType<typeof getAppTheme>;

/**
 * Devuelve la paleta visual de la aplicación
 * según el modo claro u oscuro.
 */
export function getAppTheme(
  mode: EffectiveColorMode,
  colorPalette: ColorPaletteName = "classic",
) {
  const dark = mode === "dark";
  const emerald = colorPalette === "emerald";
  const primary = emerald
    ? dark ? "#34D399" : "#047857"
    : "#0047AB";
  const primaryPressed = emerald
    ? dark ? "#6EE7B7" : "#065F46"
    : "#003380";
  const primarySoft = emerald
    ? dark ? "#173F32" : "#D1FAE5"
    : "#E8F1FF";
  const surface = emerald
    ? dark ? "#17251F" : "#FFFFFF"
    : dark ? "#172033" : "#FFFFFF";
  const surfaceSecondary = emerald
    ? dark ? "#203329" : "#EAF5EF"
    : dark ? "#1F2937" : "#EBF2FA";
  const textPrimary = emerald
    ? dark ? "#F1FAF5" : "#10271E"
    : dark ? "#F8FAFC" : "#0A192F";
  const textSecondary = emerald
    ? dark ? "#B2C5B9" : "#526B5D"
    : dark ? "#CBD5E1" : "#64748B";
  const border = emerald
    ? dark ? "#2B4537" : "#D6E7DD"
    : dark ? "#334155" : "#E2E8F0";
  const divider = emerald
    ? dark ? "#33483D" : "#E0EDE5"
    : dark ? "#1E293B" : "#E2E8F0";
  const row = emerald
    ? surface
    : dark ? "#111827" : "#FFFFFF";

  return {
    dark,

    // Tokens semanticos compartidos; Azul Clasico conserva los valores originales.
    primaryPressed,
    primarySoft,
    accent: emerald ? "#10B981" : "#22C55E",
    info: emerald
      ? dark ? "#60A5FA" : "#2563EB"
      : "#0047AB",
    onPrimary: emerald && dark ? "#0D1714" : "#FFFFFF",
    background: emerald
      ? dark ? "#0D1714" : "#F5FAF7"
      : dark ? "#101827" : "#F8FAFC",
    surface,
    surfaceSecondary,
    textPrimary,
    textSecondary,
    divider,

    // Tokens originales y alias semanticos usados por pantallas existentes.
    blue1: primarySoft,
    blue: primary,
    solidActionBackground: emerald ? "#047857" : "#0047AB",
    brandStrong: emerald ? primary : "#0864C8",
    blueForeground: emerald
      ? primary
      : dark ? "#93C5FD" : "#0047AB",
    blueSurface: emerald
      ? primarySoft
      : dark ? "#1C3048" : "#EAF3FF",
    brandSoftStrong: emerald
      ? primarySoft
      : "#EEF4FF",
    mutedStrong: emerald ? textSecondary : "#6B7280",
    chartGrid: emerald
      ? divider
      : dark ? "#263750" : "#E5EDF7",
    switchTrackActive: emerald ? primarySoft : "#0B5ED7",
    switchTrackInactive: emerald
      ? dark ? "#3D4C43" : "#DCE8DF"
      : "#CBD5E1",
    deviceSwitchTrackInactive: emerald
      ? dark ? "#3D4C43" : "#DCE8DF"
      : "#CDD2E4",
    deviceSwitchTrackActive: emerald
      ? dark ? "#176B4E" : "#A7E4C6"
      : "#BDE8CB",
    deviceSwitchThumbActive: emerald
      ? dark ? "#34D399" : "#047857"
      : "#2AAF5D",
    passwordStrong: emerald ? primary : "#003380",
    passwordTrack: emerald ? divider : "#E2E8F0",
    profileDivider: emerald ? divider : "#E2E8F0",
    primary: emerald ? primary : "#003380",
    card: surface,
    row,
    rowAlt: surfaceSecondary,
    text: textPrimary,
    muted: textSecondary,
    border,
    borderLight: emerald ? divider : dark ? "#1E293B" : "#E2E8F0",

    // ==========================================
    // ESTADOS
    // ==========================================

    warning: emerald ? dark ? "#FBBF24" : "#B45309" : "#FF3B20",

    danger: "#FF3B20",

    dangerSoft: dark ? "#3A1D1A" : "#FFF1EF",

    success: emerald ? primary : "#22C55E",

    successSoft: emerald
      ? primarySoft
      : dark ? "#123521" : "#DCFCE7",

    // ==========================================
    // BARRA DE NAVEGACIÓN
    // ==========================================

    tabBar: emerald
      ? surface
      : dark ? "#111827" : "#FFFFFF",

    // ==========================================
    // SOMBRAS
    // ==========================================

    shadow: dark ? "#000000" : "#00000010",

    // ==========================================
    // TABS / FILTROS
    // ==========================================

    tab: {
      activeBackground: emerald
        ? primarySoft
        : dark ? "#1E3A5F" : "#E8F1FF",

      inactiveBackground: emerald
        ? surface
        : dark ? "#172033" : "#FFFFFF",

      activeBorder: emerald
        ? primary
        : dark ? "#60A5FA" : "#0047AB",

      inactiveBorder: emerald
        ? divider
        : dark ? "#334155" : "#E2E8F0",

      activeText: emerald
        ? primary
        : dark ? "#FFFFFF" : "#0047AB",

      inactiveText: emerald
        ? textSecondary
        : dark ? "#CBD5E1" : "#475569",

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
  const { colorPalette, effectiveColorMode } = useSmartHome();

  return useMemo(
    () => getAppTheme(effectiveColorMode, colorPalette),
    [colorPalette, effectiveColorMode],
  );
}
