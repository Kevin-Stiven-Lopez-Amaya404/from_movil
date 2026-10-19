export type AppLanguage = "es" | "en" | "pt";

export type ColorMode = "system" | "light" | "dark";

export type EffectiveColorMode = Exclude<ColorMode, "system">;
