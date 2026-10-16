import { Platform } from "react-native";
import Zeroconf, { type Service } from "react-native-zeroconf";

export type LocalShellyCandidate = {
  name: string;
  ip: string;
  hostname: string;
  port: number;
};

let cancelActiveScan: (() => void) | null = null;

function isPrivateIpv4(ip: string): boolean {
  const parts = ip.split(".").map(Number);

  if (
    parts.length !== 4 ||
    parts.some(
      (part) =>
        !Number.isInteger(part) ||
        part < 0 ||
        part > 255,
    )
  ) {
    return false;
  }

  const [first, second] = parts;

  return (
    first === 10 ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168)
  );
}

export async function discoverLocalShelly(
  durationMs = 12000,
): Promise<LocalShellyCandidate[]> {
  if (Platform.OS !== "android") {
    throw new Error(
      "La búsqueda Wi-Fi está habilitada inicialmente solo para Android.",
    );
  }

  if (cancelActiveScan) {
    throw new Error("Ya existe una búsqueda Wi-Fi en curso.");
  }

  const zeroconf = new Zeroconf();
  const duration = Math.min(Math.max(durationMs, 3000), 30000);

  return new Promise((resolve, reject) => {
    const candidates = new Map<string, LocalShellyCandidate>();

    let finished = false;
    let discoveryError: Error | null = null;
    let timer: ReturnType<typeof setTimeout> | null = null;

    function cleanup() {
      if (timer) clearTimeout(timer);

      try {
        zeroconf.stop();
      } catch {
        // El escaneo puede no haber comenzado.
      }

      zeroconf.removeAllListeners();
      zeroconf.removeDeviceListeners();
      cancelActiveScan = null;
    }

    function finish(error?: Error) {
      if (finished) return;
      finished = true;
      cleanup();

      if (error) {
        reject(error);
      } else {
        resolve([...candidates.values()]);
      }
    }

    zeroconf.on("resolved", (service: Service) => {
      const addresses = service.ipv4?.length
        ? service.ipv4
        : service.addresses ?? [];

      for (const ip of addresses) {
        if (!isPrivateIpv4(ip)) continue;

        candidates.set(ip, {
          name: service.name,
          ip,
          hostname: service.host,
          port: service.port,
        });
      }
    });

    zeroconf.on("error", (error) => {
      discoveryError = error;
    });

    cancelActiveScan = () => finish();

    timer = setTimeout(() => {
      if (candidates.size === 0 && discoveryError) {
        finish(discoveryError);
      } else {
        finish();
      }
    }, duration);

    try {
      zeroconf.scan({
        type: "shelly",
        protocol: "tcp",
        domain: "local.",
      });
    } catch (error) {
      finish(
        error instanceof Error
          ? error
          : new Error("No se pudo iniciar el descubrimiento Wi-Fi."),
      );
    }
  });
}

export function cancelLocalShellyDiscovery() {
  cancelActiveScan?.();
}
