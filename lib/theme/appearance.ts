import { useMemo } from "react";

import { useSmartHome } from "@/lib/context/smart-home-context";
import type {
  ColorPaletteName,
  EffectiveColorMode,
} from "@/lib/domain/preferences";
import { DEFAULT_COLOR_PALETTE } from "@/lib/domain/preferences";
import { getAppTheme } from "@/lib/theme/app-theme";

/**
 * Palette specific to authentication screens.
 *
 * Kept separate from `app-theme` because welcome/login/register have
 * a different visual composition from the other internal screens.
 */
export function getAuthPalette(
  mode: EffectiveColorMode,
  colorPalette: ColorPaletteName = DEFAULT_COLOR_PALETTE,
) {
  return getAppTheme(mode, colorPalette).auth;
}

export function useAuthPalette() {
  const { colorPalette, effectiveColorMode } = useSmartHome();

  return useMemo(
    () => getAuthPalette(effectiveColorMode, colorPalette),
    [colorPalette, effectiveColorMode],
  );
}
