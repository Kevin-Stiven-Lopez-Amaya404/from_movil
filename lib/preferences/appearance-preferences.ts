import * as SecureStore from "expo-secure-store";

import type {
  ColorMode,
  ColorPaletteName,
} from "@/lib/domain/preferences";

const COLOR_MODE_KEY = "smart-home.appearance";
const COLOR_PALETTE_KEY = "smart-home.color-palette";

function isColorMode(value: string | null): value is ColorMode {
  return value === "system" || value === "light" || value === "dark";
}

function isColorPaletteName(value: string | null): value is ColorPaletteName {
  return value === "classic" || value === "emerald";
}

export async function loadColorModePreference(): Promise<ColorMode | null> {
  const storedMode = await SecureStore.getItemAsync(COLOR_MODE_KEY);
  return isColorMode(storedMode) ? storedMode : null;
}

export async function saveColorModePreference(mode: ColorMode): Promise<void> {
  await SecureStore.setItemAsync(COLOR_MODE_KEY, mode);
}

export async function loadColorPalettePreference(): Promise<ColorPaletteName | null> {
  const storedPalette = await SecureStore.getItemAsync(COLOR_PALETTE_KEY);
  return isColorPaletteName(storedPalette) ? storedPalette : null;
}

export async function saveColorPalettePreference(
  palette: ColorPaletteName,
): Promise<void> {
  await SecureStore.setItemAsync(COLOR_PALETTE_KEY, palette);
}
