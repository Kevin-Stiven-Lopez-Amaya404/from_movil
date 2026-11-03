export const LANGUAGE_PREFERENCE_KEY = "smart-home.language";

export type LanguagePreferenceStorage = {
  getItemAsync: (key: string) => Promise<string | null>;
  setItemAsync: (key: string, value: string) => Promise<void>;
};

export function createLanguagePreferences<Language extends string>(
  storage: LanguagePreferenceStorage,
  supportedLanguages: readonly Language[],
  defaultLanguage: Language,
) {
  const isSupportedLanguage = (
    value: string | null,
  ): value is Language =>
    supportedLanguages.some((language) => language === value);

  return {
    async load(): Promise<Language> {
      const storedLanguage = await storage.getItemAsync(LANGUAGE_PREFERENCE_KEY);
      return isSupportedLanguage(storedLanguage)
        ? storedLanguage
        : defaultLanguage;
    },

    async save(language: Language): Promise<void> {
      const supportedLanguage = isSupportedLanguage(language)
        ? language
        : defaultLanguage;
      await storage.setItemAsync(
        LANGUAGE_PREFERENCE_KEY,
        supportedLanguage,
      );
    },
  };
}
