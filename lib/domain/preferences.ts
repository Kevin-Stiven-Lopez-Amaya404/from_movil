export type AppLanguage = "es" | "en" | "pt" | "fr";

export type ColorMode = "system" | "light" | "dark";

export type EffectiveColorMode = Exclude<ColorMode, "system">;
