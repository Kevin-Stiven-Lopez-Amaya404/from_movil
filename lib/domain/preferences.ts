export const SUPPORTED_APP_LANGUAGES = ["es", "en", "pt"] as const;

export type AppLanguage = (typeof SUPPORTED_APP_LANGUAGES)[number];

export const DEFAULT_APP_LANGUAGE: AppLanguage = "es";

export type ColorMode = "system" | "light" | "dark";

export type EffectiveColorMode = Exclude<ColorMode, "system">;

export type ColorPaletteName = "classic" | "emerald";
