import assert from "node:assert/strict";
import test from "node:test";

import {
  createLanguagePreferences,
  LANGUAGE_PREFERENCE_KEY,
} from "../lib/preferences/language-preferences.ts";
import {
  DEFAULT_APP_LANGUAGE,
  SUPPORTED_APP_LANGUAGES,
} from "../lib/domain/preferences.ts";

function createMemoryStorage(initialValue = null) {
  const values = new Map();
  const writes = [];

  if (initialValue !== null) {
    values.set(LANGUAGE_PREFERENCE_KEY, initialValue);
  }

  return {
    values,
    writes,
    getItemAsync: async (key) => values.get(key) ?? null,
    setItemAsync: async (key, value) => {
      writes.push({ key, value });
      values.set(key, value);
    },
  };
}

test("saves the selected language in the secure preference key", async () => {
  const storage = createMemoryStorage();
  const preferences = createLanguagePreferences(
    storage,
    SUPPORTED_APP_LANGUAGES,
    DEFAULT_APP_LANGUAGE,
  );

  await preferences.save("pt");

  assert.deepEqual(storage.writes, [
    { key: LANGUAGE_PREFERENCE_KEY, value: "pt" },
  ]);
  assert.equal(await preferences.load(), "pt");
});

test("restores a saved supported language without overwriting it on load", async () => {
  const storage = createMemoryStorage("en");
  const preferences = createLanguagePreferences(
    storage,
    SUPPORTED_APP_LANGUAGES,
    DEFAULT_APP_LANGUAGE,
  );

  assert.equal(await preferences.load(), "en");
  assert.equal(storage.writes.length, 0);
  assert.equal(storage.values.get(LANGUAGE_PREFERENCE_KEY), "en");
});

test("uses the default language when stored data is invalid or missing", async () => {
  for (const storedValue of ["fr", "", null]) {
    const storage = createMemoryStorage(storedValue);
    const preferences = createLanguagePreferences(
      storage,
      SUPPORTED_APP_LANGUAGES,
      DEFAULT_APP_LANGUAGE,
    );

    assert.equal(await preferences.load(), DEFAULT_APP_LANGUAGE);
    assert.equal(storage.writes.length, 0);
  }
});
