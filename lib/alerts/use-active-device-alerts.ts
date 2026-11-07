
import { useMemo } from "react";

import { useSmartHome } from "@/lib/context/smart-home-context";
import { getActiveDeviceAlerts } from "@/lib/alerts/active-device-alerts";

export function useActiveDeviceAlerts() {
  const {
    devices,
    accessibleHomes,
    homesLoadStatus,
    deviceLoadStatusByHome,
  } = useSmartHome();

  return useMemo(() => {
    const alerts = getActiveDeviceAlerts(
      devices,
      accessibleHomes,
      deviceLoadStatusByHome,
    );

    const isLoading =
      homesLoadStatus === "loading" ||
      accessibleHomes.some((home) => {
        const status = deviceLoadStatusByHome[home.id];

        return (
          status === undefined ||
          status === "loading"
        );
      });

    const hasError =
      homesLoadStatus === "error" ||
      accessibleHomes.some(
        (home) =>
          deviceLoadStatusByHome[home.id] === "error",
      );

    return {
      alerts,
      count: alerts.length,
      isLoading,
      hasError,
    };
  }, [
    devices,
    accessibleHomes,
    homesLoadStatus,
    deviceLoadStatusByHome,
  ]);
}
