
import { Ionicons } from "@expo/vector-icons";
import {
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ShellyBleScanner } from "@/components/devices/ShellyBleScanner";
import { useSmartHome } from "@/lib/context/smart-home-context";
import { useAndroidBackFallback } from "@/lib/navigation/use-android-back-fallback";
import {
  cancelLocalShellyDiscovery,
  discoverLocalShelly,
  type LocalShellyCandidate,
} from "@/lib/pairing/local-shelly-discovery";
import {
  readShellyLocalIdentity,
  type ShellyLocalIdentity,
} from "@/lib/pairing/shelly-local-identity";
import { useResponsiveLayout } from "@/lib/responsive/responsive";
import { useAppTheme } from "@/lib/theme/app-theme";
import { styles } from "../../styles/(tabs)/add-device.styles";

type IdentityCheck =
  | { status: "checking" }
  | { status: "verified"; identity: ShellyLocalIdentity }
  | { status: "error"; message: string };

const DEVICE_CHECK_TIMEOUT_MS = 6000;
const VERIFY_BATCH_SIZE = 3;

export default function AddDeviceScreen() {
  const router = useRouter();

  const { homeId, returnTo } = useLocalSearchParams<{
    homeId?: string;
    returnTo?: string;
  }>();

  const { accessibleHomes, homesLoadStatus } = useSmartHome();
  const theme = useAppTheme();
  const layout = useResponsiveLayout();

  const selectedHome = accessibleHomes.find(
    (home) => home.id === homeId,
  );

  const canAddDevice = selectedHome?.homeRole === "OWNER";

  useAndroidBackFallback(
    returnTo !== "home-detail",
    homeId
      ? {
          pathname: "/(tabs)/home-detail",
          params: { homeId },
        }
      : "/(tabs)/devices",
  );

  useEffect(() => {
    if (
      homesLoadStatus === "loaded" &&
      (!homeId || !selectedHome)
    ) {
      router.replace("/(tabs)/(main)/homes");
    }
  }, [homeId, homesLoadStatus, router, selectedHome]);

  const [wifiSearching, setWifiSearching] = useState(false);
  const [bleScanRequestId, setBleScanRequestId] = useState(0);
  const [wifiSearched, setWifiSearched] = useState(false);

  const [wifiCandidates, setWifiCandidates] =
    useState<LocalShellyCandidate[]>([]);

  const [wifiError, setWifiError] =
    useState<string | null>(null);

  const [identityByIp, setIdentityByIp] = useState<
    Record<string, IdentityCheck>
  >({});

  const scanRun = useRef(0);
  const pendingRequests = useRef(new Set<AbortController>());

  function cancelIdentityRequests() {
    for (const controller of pendingRequests.current) {
      controller.abort();
    }

    pendingRequests.current.clear();
  }

  async function verifyCandidate(
    device: LocalShellyCandidate,
    run: number,
  ) {
    if (run !== scanRun.current) return;

    const controller = new AbortController();
    pendingRequests.current.add(controller);

    const timer = setTimeout(
      () => controller.abort(),
      DEVICE_CHECK_TIMEOUT_MS,
    );

    setIdentityByIp((previous) => ({
      ...previous,
      [device.ip]: { status: "checking" },
    }));

    try {
      const identity = await readShellyLocalIdentity(
        device.ip,
        controller.signal,
      );

      if (run !== scanRun.current) return;

      setIdentityByIp((previous) => ({
        ...previous,
        [device.ip]: {
          status: "verified",
          identity,
        },
      }));
    } catch (error) {
      if (run !== scanRun.current) return;

      setIdentityByIp((previous) => ({
        ...previous,
        [device.ip]: {
          status: "error",
          message:
            error instanceof Error &&
            error.name === "AbortError"
              ? "La verificación agotó el tiempo de espera."
              : error instanceof Error
                ? error.message
                : "No se pudo comprobar el dispositivo.",
        },
      }));
    } finally {
      clearTimeout(timer);
      pendingRequests.current.delete(controller);
    }
  }

  async function verifyDiscoveredCandidates(
    devices: LocalShellyCandidate[],
    run: number,
  ) {
    for (
      let index = 0;
      index < devices.length;
      index += VERIFY_BATCH_SIZE
    ) {
      if (run !== scanRun.current) return;

      await Promise.all(
        devices
          .slice(index, index + VERIFY_BATCH_SIZE)
          .map((device) => verifyCandidate(device, run)),
      );
    }
  }

  async function searchLocalWifi() {
    if (!canAddDevice || wifiSearching) return;

    const run = ++scanRun.current;

    cancelIdentityRequests();

    setWifiSearching(true);
    setWifiSearched(false);
    setWifiCandidates([]);
    setIdentityByIp({});
    setWifiError(null);
    setBleScanRequestId((value) => value + 1);

    try {
      const results = await discoverLocalShelly(12000);

      if (run !== scanRun.current) return;

      setWifiCandidates(results);
      setWifiSearched(true);
      setWifiSearching(false);

      // Verificar automáticamente cada dispositivo encontrado.
      void verifyDiscoveredCandidates(results, run);
    } catch (error) {
      if (run !== scanRun.current) return;

      setWifiError(
        error instanceof Error
          ? error.message
          : "No se pudo realizar la búsqueda Wi-Fi.",
      );

      setWifiSearched(true);
    } finally {
      if (run === scanRun.current) {
        setWifiSearching(false);
      }
    }
  }

  function selectDevice(device: LocalShellyCandidate) {
    const result = identityByIp[device.ip];

    if (
      !canAddDevice ||
      !homeId ||
      result?.status !== "verified"
    ) {
      return;
    }

    router.push({
      pathname: "/(tabs)/prepare-shelly",
      params: {
        homeId,
        ip: device.ip,
        manufacturerDeviceId:
          result.identity.manufacturerDeviceId,
        returnTo:
          returnTo === "home-detail"
            ? "home-detail"
            : "devices",
        from: "add-device",
      },
    });
  }

  function closeScreen() {
    if (
      returnTo === "home-detail" &&
      router.canGoBack()
    ) {
      router.back();
    } else if (homeId) {
      router.replace({
        pathname: "/(tabs)/home-detail",
        params: { homeId },
      });
    } else {
      router.replace("/(tabs)/devices");
    }
  }

  useFocusEffect(
    useCallback(() => {
      return () => {
        scanRun.current += 1;

        cancelLocalShellyDiscovery();

        for (const controller of pendingRequests.current) {
          controller.abort();
        }

        pendingRequests.current.clear();
        setWifiSearching(false);

        setIdentityByIp((previous) => {
          const next = { ...previous };

          for (const ip of Object.keys(next)) {
            if (next[ip].status === "checking") {
              next[ip] = {
                status: "error",
                message:
                  "Verificación interrumpida. Reintenta.",
              };
            }
          }

          return next;
        });
      };
    }, []),
  );

  const hasResults = wifiCandidates.length > 0;

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: theme.background },
      ]}
    >
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: layout.gutter,
          paddingTop: layout.screenTop,
          paddingBottom: layout.screenBottom,
        }}
      >
        <View
          style={[
            styles.content,
            { maxWidth: layout.contentWidth },
          ]}
        >
          {/* Encabezado */}
          <View style={styles.header}>
            <Text
              style={[
                styles.title,
                { color: theme.text },
              ]}
            >
              Agregar dispositivo
            </Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cerrar agregar dispositivo"
              onPress={closeScreen}
              style={({ pressed }) => [
                styles.closeButton,
                { backgroundColor: theme.rowAlt },
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                name="close"
                size={21}
                color={theme.text}
              />
            </Pressable>
          </View>

          {/* Hogar seleccionado */}
          <Text
            style={[
              styles.homeLabel,
              { color: theme.muted },
            ]}
          >
            {selectedHome
              ? `Hogar: ${selectedHome.name}`
              : "Selecciona un hogar"}
          </Text>

          <Text
            style={[
              styles.description,
              { color: theme.muted },
            ]}
          >
            Busca dispositivos Shelly compatibles por red local (LAN)
            y Bluetooth (BLE) con una sola búsqueda, sin ingresar direcciones IP.
          </Text>

          {/* Búsqueda principal */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Buscar dispositivos Shelly"
            disabled={!canAddDevice || wifiSearching}
            onPress={() => void searchLocalWifi()}
            style={({ pressed }) => [
              styles.primaryButton,
              { backgroundColor: theme.solidActionBackground },
              (!canAddDevice || wifiSearching) &&
                styles.disabled,
              pressed && styles.pressed,
            ]}
          >
            {wifiSearching ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Ionicons
                name="search"
                size={20}
                color="#FFFFFF"
              />
            )}

            <Text style={styles.primaryButtonText}>
              {wifiSearching
                ? "Buscando en la red..."
                : "Buscar dispositivos"}
            </Text>
          </Pressable>

          {!canAddDevice &&
          homesLoadStatus !== "loading" ? (
            <Text
              style={[
                styles.message,
                { color: theme.muted },
              ]}
            >
              Solo el propietario del hogar
              puede agregar dispositivos.
            </Text>
          ) : null}

          {wifiError ? (
            <Text
              style={[
                styles.message,
                { color: theme.danger },
              ]}
            >
              {wifiError}
            </Text>
          ) : null}

          {/* Resultados */}
          {(wifiSearched || hasResults) && (
            <View style={styles.resultsSection}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: theme.text },
                ]}
              >
                Dispositivos encontrados
              </Text>

              {wifiSearched && !hasResults ? (
                <Text
                  style={[
                    styles.message,
                    { color: theme.muted },
                  ]}
                >
                  No encontramos Shelly mediante la búsqueda LAN.
                  También puedes intentar detectarlos automáticamente por Bluetooth.
                </Text>
              ) : null}

              {wifiCandidates.map((device) => {
                const result = identityByIp[device.ip];

                const verified =
                  result?.status === "verified";

                const checking =
                  !result || result.status === "checking";

                return (
                  <View
                    key={device.ip}
                    style={[
                      styles.deviceRow,
                      {
                        borderColor:
                          theme.borderLight,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.deviceIcon,
                        {
                          backgroundColor:
                            theme.rowAlt,
                        },
                      ]}
                    >
                      <Ionicons
                        name="hardware-chip-outline"
                        size={25}
                        color={theme.blue}
                      />
                    </View>

                    <View style={styles.deviceContent}>
                      <Text
                        style={[
                          styles.deviceName,
                          { color: theme.text },
                        ]}
                      >
                        {verified
                          ? "Shelly 1PM Gen4"
                          : "Dispositivo Shelly"}
                      </Text>

                      {verified ? (
                        <Text
                          style={[
                            styles.deviceCaption,
                            { color: theme.muted },
                          ]}
                        >
                          <Ionicons
                            name="checkmark-circle"
                            size={14}
                            color={theme.blue}
                          />{" "}
                          Modelo compatible
                        </Text>
                      ) : checking ? (
                        <Text
                          style={[
                            styles.deviceCaption,
                            { color: theme.muted },
                          ]}
                        >
                          Comprobando compatibilidad...
                        </Text>
                      ) : (
                        <Text
                          style={[
                            styles.deviceCaption,
                            { color: theme.danger },
                          ]}
                        >
                          No se pudo verificar
                        </Text>
                      )}

                      {result?.status === "error" ? (
                        <>
                          <Text
                            style={[
                              styles.deviceCaption,
                              { color: theme.muted },
                            ]}
                          >
                            {result.message}
                          </Text>

                          <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Reintentar verificación de Shelly"
                            onPress={() =>
                              void verifyCandidate(
                                device,
                                scanRun.current,
                              )
                            }
                            style={styles.retryButton}
                          >
                            <Text
                              style={{
                                color: theme.blue,
                                fontWeight: "700",
                              }}
                            >
                              Reintentar verificación
                            </Text>
                          </Pressable>
                        </>
                      ) : null}
                    </View>

                    {verified ? (
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Seleccionar Shelly 1PM Gen4"
                        onPress={() =>
                          selectDevice(device)
                        }
                        style={[
                          styles.selectButton,
                          {
                            borderColor:
                              theme.borderLight,
                          },
                        ]}
                      >
                        <Text
                          style={{
                            color: theme.blue,
                            fontWeight: "700",
                          }}
                        >
                          Seleccionar
                        </Text>
                      </Pressable>
                    ) : checking ? (
                      <ActivityIndicator
                        size="small"
                        color={theme.blue}
                      />
                    ) : null}
                  </View>
                );
              })}
            </View>
          )}

          <View style={styles.resultsSection}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Detección por Bluetooth (BLE)
            </Text>
            <ShellyBleScanner canScan={Boolean(canAddDevice)} scanRequestId={bleScanRequestId} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
