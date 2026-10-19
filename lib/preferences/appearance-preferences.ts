import * as SecureStore from "expo-secure-store";

import type { ColorMode } from "@/lib/domain/preferences";

const COLOR_MODE_KEY = "smart-home.appearance";

function isColorMode(value: string | null): value is ColorMode {
  return value === "system" || value === "light" || value === "dark";
}

export async function loadColorModePreference(): Promise<ColorMode | null> {
  const storedMode = await SecureStore.getItemAsync(COLOR_MODE_KEY);
  return isColorMode(storedMode) ? storedMode : null;
}

export async function saveColorModePreference(mode: ColorMode): Promise<void> {
  await SecureStore.setItemAsync(COLOR_MODE_KEY, mode);
}
