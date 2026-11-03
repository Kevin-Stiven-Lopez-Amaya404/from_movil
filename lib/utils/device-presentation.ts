import type { SmartDevice } from "@/lib/domain/device";
import type { SmartHomePlace } from "@/lib/domain/home";

type AccessibleHome = Pick<SmartHomePlace, "id" | "name">;

export type DevicePresentationList = {
  accessibleDevices: SmartDevice[];
  visibleDevices: SmartDevice[];
};

function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/** Filters the loaded device list for presentation without changing its source. */
export function getDevicePresentationList(
  devices: readonly SmartDevice[],
  accessibleHomes: readonly AccessibleHome[],
  searchQuery: string,
  selectedHomeId: string | null,
): DevicePresentationList {
  const homesById = new Map(accessibleHomes.map((home) => [home.id, home]));
  const accessibleDevices = devices.filter((device) =>
    homesById.has(device.homeId),
  );
  const normalizedQuery = normalizeSearchText(searchQuery);

  const visibleDevices = accessibleDevices.filter((device) => {
    if (selectedHomeId !== null && device.homeId !== selectedHomeId) {
      return false;
    }

    if (!normalizedQuery) return true;

    const homeName = homesById.get(device.homeId)?.name ?? "";
    const searchableText = normalizeSearchText(`${device.name} ${homeName}`);

    return searchableText.includes(normalizedQuery);
  });

  return { accessibleDevices, visibleDevices };
}
