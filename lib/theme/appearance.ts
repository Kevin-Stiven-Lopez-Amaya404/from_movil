import { useMemo } from "react";

import { useSmartHome } from "@/lib/context/smart-home-context";
import type {
  ColorPaletteName,
  EffectiveColorMode,
} from "@/lib/domain/preferences";
import { getAppTheme } from "@/lib/theme/app-theme";

/**
 * Paleta especifica para pantallas de autenticacion.
 *
 * Se mantiene separada de `app-theme` porque welcome/login/register tienen
 * una composicion visual distinta al resto de pantallas internas.
 */
export function getAuthPalette(
  mode: EffectiveColorMode,
  colorPalette: ColorPaletteName = "classic",
) {
  if (colorPalette === "classic") {
    const dark = mode === "dark";

    return {
      background: dark ? "#0B1220" : "#FFFFFF",
      button: dark ? "#3B82F6" : "#0864C8",
      buttonPressed: dark ? "#2563EB" : "#004FA5",
      primaryButton: "#0057B8",
      primaryButtonPressed: "#004FA5",
      card: dark ? "#151F33" : "#FBFBFD",
      danger: dark ? "#FCA5A5" : "#C62828",
      divider: dark ? "#26344F" : "#DDE2F5",
      field: dark ? "#121A2C" : "#FBFBFD",
      fieldBorder: dark ? "#2D3B59" : "transparent",
      border: dark ? "#2D3B59" : "#CBD5E1",
      link: dark ? "#93C5FD" : "#0864C8",
      muted: dark ? "#A7B3C8" : "#6B7A99",
      onPrimary: "#FFFFFF",
      primarySoft: dark ? "#172A47" : "#EEF4FF",
      disabledBackground: "#9AA8C2",
      disabledForeground: "#FFFFFF",
      checkboxIdle: "#D8DADC",
      formError: "#D32F2F",
      welcomeButton: "#0047AB",
      welcomeButtonPressed: "#003380",
      welcomeSoftPressed: "rgba(0, 71, 171, 0.08)",
      welcomeShadow: "#0047AB",
      text: dark ? "#F8FAFC" : "#3F3F3F",
      title: dark ? "#93C5FD" : "#0864C8",
    };
  }

  const theme = getAppTheme(mode, colorPalette);

  return {
    background: theme.background,
    button: theme.primary,
    buttonPressed: theme.primaryPressed,
    primaryButton: theme.primary,
    primaryButtonPressed: theme.primaryPressed,
    card: theme.surface,
    danger: theme.dark ? "#FCA5A5" : "#C62828",
    divider: theme.divider,
    field: theme.surfaceSecondary,
    fieldBorder: theme.border,
    border: theme.border,
    link: theme.primary,
    muted: theme.textSecondary,
    onPrimary: theme.onPrimary,
    primarySoft: theme.primarySoft,
    disabledBackground: theme.primarySoft,
    disabledForeground: theme.textSecondary,
    checkboxIdle: theme.surfaceSecondary,
    formError: theme.dark ? "#FCA5A5" : "#C62828",
    welcomeButton: theme.primary,
    welcomeButtonPressed: theme.primaryPressed,
    welcomeSoftPressed: theme.dark
      ? "rgba(16, 185, 129, 0.16)"
      : "rgba(16, 185, 129, 0.08)",
    welcomeShadow: theme.primary,
    text: theme.textPrimary,
    title: theme.primary,
  };
}

export function useAuthPalette() {
  const { colorPalette, effectiveColorMode } = useSmartHome();

  return useMemo(
    () => getAuthPalette(effectiveColorMode, colorPalette),
    [colorPalette, effectiveColorMode],
  );
}
