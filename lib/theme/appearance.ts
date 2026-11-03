import { useMemo } from "react";

import { useSmartHome } from "@/lib/context/smart-home-context";
import type {
  ColorPaletteName,
  EffectiveColorMode,
} from "@/lib/domain/preferences";
import { DEFAULT_COLOR_PALETTE } from "@/lib/domain/preferences";
import { getAppTheme } from "@/lib/theme/app-theme";

/**
 * Paleta especifica para pantallas de autenticacion.
 *
 * Se mantiene separada de `app-theme` porque welcome/login/register tienen
 * una composicion visual distinta al resto de pantallas internas.
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
