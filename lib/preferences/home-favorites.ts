import * as SecureStore from "expo-secure-store";

type HomeFavoriteOverrides = Record<string, boolean>;

type StoredHomeFavorites = {
  ownerKey: string;
  overrides: HomeFavoriteOverrides;
};

const STORAGE_PREFIX = "smart-home.home-favorites.";
let storageQueue: Promise<void> = Promise.resolve();

function getStorageKey(ownerKey: string): string {
  // SecureStore keys are restricted to a portable character set. The hash is
  // only used as a key; the stored owner value is checked to avoid collisions.
  let firstHash = 0x811c9dc5;
  let secondHash = 0x9e3779b9;

  for (let index = 0; index < ownerKey.length; index += 1) {
    const code = ownerKey.charCodeAt(index);
    firstHash = Math.imul(firstHash ^ code, 0x01000193);
    secondHash = Math.imul(secondHash ^ code, 0x85ebca6b);
  }

  const hash = `${(firstHash >>> 0).toString(16).padStart(8, "0")}${
    (secondHash >>> 0).toString(16).padStart(8, "0")
  }`;

  return `${STORAGE_PREFIX}${hash}`;
}

function isHomeFavoriteOverrides(value: unknown): value is HomeFavoriteOverrides {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;

  return Object.entries(value).every(
    ([homeId, favorite]) => homeId.length > 0 && typeof favorite === "boolean",
  );
}

export async function loadHomeFavoriteOverrides(
  ownerKey: string,
): Promise<HomeFavoriteOverrides> {
  const serialized = await SecureStore.getItemAsync(getStorageKey(ownerKey));
  if (!serialized) return {};

  try {
    const parsed: unknown = JSON.parse(serialized);
    if (!parsed || typeof parsed !== "object") return {};

    const stored = parsed as Partial<StoredHomeFavorites>;
    if (
      stored.ownerKey !== ownerKey ||
      !isHomeFavoriteOverrides(stored.overrides)
    ) {
      return {};
    }

    return stored.overrides;
  } catch {
    return {};
  }
}

export async function saveHomeFavoriteOverrides(
  ownerKey: string,
  overrides: HomeFavoriteOverrides,
): Promise<void> {
  const pending = storageQueue.then(
    () =>
      SecureStore.setItemAsync(
        getStorageKey(ownerKey),
        JSON.stringify({ ownerKey, overrides } satisfies StoredHomeFavorites),
      ),
    () =>
      SecureStore.setItemAsync(
        getStorageKey(ownerKey),
        JSON.stringify({ ownerKey, overrides } satisfies StoredHomeFavorites),
      ),
  );

  storageQueue = pending.catch(() => undefined);
  await pending;
}
