import * as SecureStore from "expo-secure-store";

import {
  DEFAULT_APP_LANGUAGE,
  SUPPORTED_APP_LANGUAGES,
} from "@/lib/domain/preferences";
import { createLanguagePreferences } from "@/lib/preferences/language-preferences";

const languagePreferences = createLanguagePreferences({
  getItemAsync: (key) => SecureStore.getItemAsync(key),
  setItemAsync: (key, value) => SecureStore.setItemAsync(key, value),
}, SUPPORTED_APP_LANGUAGES, DEFAULT_APP_LANGUAGE);

export const loadLanguagePreference = languagePreferences.load;
export const saveLanguagePreference = languagePreferences.save;
