import { useMemo } from "react";

import { useSmartHome } from "@/lib/context/smart-home-context";
import type {
  ColorPaletteName,
  EffectiveColorMode,
} from "@/lib/domain/preferences";
import { DEFAULT_COLOR_PALETTE } from "@/lib/domain/preferences";

export type AppTheme = ReturnType<typeof getAppTheme>;

/**
 * Returns the app's visual palette
 * for light or dark mode.
 */
export function getAppTheme(
  mode: EffectiveColorMode,
  colorPalette: ColorPaletteName = DEFAULT_COLOR_PALETTE,
) {
  const dark = mode === "dark";
  const emerald = colorPalette === "emerald";
  const primary = emerald
    ? dark ? "#34D399" : "#047857"
    : dark ? "#8AB4FF" : "#0047AB";
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
    : dark ? "#CBD5E1" : "#5B6B80";
  const border = emerald
    ? dark ? "#2B4537" : "#D6E7DD"
    : dark ? "#334155" : "#E2E8F0";
  const divider = emerald
    ? dark ? "#33483D" : "#E0EDE5"
    : dark ? "#1E293B" : "#E2E8F0";
  const row = emerald
    ? surface
    : dark ? "#111827" : "#FFFFFF";
  const warning = dark ? "#FBBF24" : "#B45309";
  const success = emerald ? primary : dark ? "#4ADE80" : "#15803D";

  return {
    dark,

    // Shared semantic tokens; Classic Blue keeps the original values.
    primaryPressed,
    primarySoft,
    accent: emerald ? "#10B981" : "#22C55E",
    info: emerald
      ? dark ? "#60A5FA" : "#2563EB"
      : dark ? "#8AB4FF" : "#0047AB",
    onPrimary: dark ? emerald ? "#0D1714" : "#0B1220" : "#FFFFFF",
    onSolidAction: "#FFFFFF",
    background: emerald
      ? dark ? "#0D1714" : "#F5FAF7"
      : dark ? "#101827" : "#F8FAFC",
    surface,
    surfaceSecondary,
    textPrimary,
    textSecondary,
    divider,

    // Original tokens and semantic aliases used by existing screens.
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
    mutedStrong: emerald ? textSecondary : dark ? "#6B7280" : "#5B6B80",
    chartGrid: emerald
      ? divider
      : dark ? "#263750" : "#E5EDF7",
    switchTrackActive: emerald ? primarySoft : "#0B5ED7",
    switchTrackInactive: emerald
      ? dark ? "#82988A" : "#789184"
      : dark ? "#CBD5E1" : "#7D8799",
    deviceSwitchTrackInactive: emerald
      ? dark ? "#82988A" : "#789184"
      : dark ? "#CDD2E4" : "#7D8799",
    deviceSwitchTrackActive: emerald
      ? dark ? "#176B4E" : "#A7E4C6"
      : "#BDE8CB",
    deviceSwitchThumbActive: emerald
      ? dark ? "#34D399" : "#047857"
      : "#15803D",
    passwordStrong: emerald ? primary : dark ? "#8AB4FF" : "#003380",
    passwordTrack: emerald ? divider : "#E2E8F0",
    profileDivider: emerald ? divider : "#E2E8F0",
    primary: emerald ? primary : dark ? "#8AB4FF" : "#003380",
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

    warning,

    danger: dark ? "#FF6B57" : "#C62817",
    onDanger: dark
      ? emerald ? "#0D1714" : "#0B1220"
      : "#FFFFFF",

    dangerSoft: dark ? "#3A1D1A" : "#FFF1EF",

    success,
    decorativeAccent: dark ? "#CBD5E1" : "#64748B",
    overlay: dark
      ? "rgba(15, 23, 42, 0.48)"
      : "rgba(0, 0, 0, 0.48)",
    overlayStrong: "rgba(0, 0, 0, 0.65)",
    overlaySubtle: "rgba(16, 24, 39, 0.18)",
    shadowColor: dark ? "#000000" : "#0A192F",

    successSoft: emerald
      ? primarySoft
      : dark ? "#123521" : "#DCFCE7",

    auth: {
      background: emerald
        ? dark ? "#0D1714" : "#F5FAF7"
        : dark ? "#0B1220" : "#FFFFFF",
      button: emerald
        ? primary
        : dark ? "#2563EB" : "#0047AB",
      buttonPressed: emerald
        ? primaryPressed
        : dark ? "#1D4ED8" : "#003380",
      primaryButton: emerald ? primary : "#0047AB",
      primaryButtonPressed: emerald ? primaryPressed : "#003380",
      card: emerald
        ? surface
        : dark ? "#151F33" : "#FBFBFD",
      danger: dark ? "#FCA5A5" : "#C62828",
      divider: emerald
        ? divider
        : dark ? "#26344F" : "#DDE2F5",
      field: emerald
        ? surfaceSecondary
        : dark ? "#121A2C" : "#FBFBFD",
      fieldBorder: emerald
        ? border
        : dark ? "#2D3B59" : "transparent",
      border: emerald
        ? border
        : dark ? "#2D3B59" : "#CBD5E1",
      link: emerald ? primary : dark ? "#93C5FD" : "#0047AB",
      muted: emerald
        ? textSecondary
        : dark ? "#A7B3C8" : "#5F6F8C",
      onPrimary: emerald && dark ? "#0D1714" : "#FFFFFF",
      primarySoft: emerald
        ? primarySoft
        : dark ? "#172A47" : "#EEF4FF",
      disabledBackground: emerald ? primarySoft : "#9AA8C2",
      disabledForeground: emerald ? textSecondary : "#0B1220",
      checkboxIdle: emerald ? surfaceSecondary : "#D8DADC",
      formError: emerald
        ? dark ? "#FCA5A5" : "#C62828"
        : "#D32F2F",
      welcomeButton: emerald ? primary : "#0047AB",
      welcomeButtonPressed: emerald ? primaryPressed : "#003380",
      welcomeSoftPressed: emerald
        ? dark
          ? "rgba(16, 185, 129, 0.16)"
          : "rgba(16, 185, 129, 0.08)"
        : "rgba(0, 71, 171, 0.08)",
      welcomeShadow: emerald ? primary : "#0047AB",
      text: emerald ? textPrimary : dark ? "#F8FAFC" : "#3F3F3F",
      title: emerald ? primary : dark ? "#93C5FD" : "#0047AB",
      warning,
      success,
    },

    // ==========================================
    // NAVIGATION BAR
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
 * Hook to read the current theme from any component.
 */
export function useAppTheme() {
  const { colorPalette, effectiveColorMode } = useSmartHome();

  return useMemo(
    () => getAppTheme(effectiveColorMode, colorPalette),
    [colorPalette, effectiveColorMode],
  );
}
