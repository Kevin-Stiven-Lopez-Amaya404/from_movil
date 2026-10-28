import { Ionicons } from "@expo/vector-icons";
import {
  useLocalSearchParams,
  useRouter,
  type Href,
} from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { EnergyRealtimeCard } from "@/components/homes/EnergyRealtimeCard";
import { ShellyDeviceCard } from "@/components/homes/ShellyDeviceCard";
import { useSmartHome } from "@/lib/context/smart-home-context";
import type { SmartDevice } from "@/lib/domain/device";
import { canControlHome } from "@/lib/domain/home";
import { useAndroidBackFallback } from "@/lib/navigation/use-android-back-fallback";
import { useResponsiveLayout } from "@/lib/responsive/responsive";
import { useAppTheme } from "@/lib/theme/app-theme";

import { getDeviceControlErrorMessage } from "@/lib/utils/control-error-message";
import { styles } from "../../styles/(tabs)/home-detail.styles";

export default function HomeDetailScreen() {
  const { homeId, deviceId, from: routeFrom, source } = useLocalSearchParams<{
    homeId?: string;
    deviceId?: string;
    from?: string;
    source?: string;
  }>();
  const from = routeFrom ?? source;
  const layout = useResponsiveLayout();
  const router = useRouter();
  const theme = useAppTheme();
  const {
    devices,
    deviceLoadStatusByHome,
    accessibleHomes,
    homesLoadStatus,
    setActiveHomeId,
    removeDevice,
    updateDevice,
    setHomeDeviceState,
  } = useSmartHome();

  const activeHome = accessibleHomes.find((home) => home.id === homeId);
  const deviceLoadStatus = activeHome
    ? deviceLoadStatusByHome[activeHome.id]
    : undefined;
  const devicesLoaded = deviceLoadStatus === "loaded";
  const canManage = activeHome?.homeRole === "OWNER";
  const canControl = canControlHome(activeHome?.homeRole);
  const homeDevices = useMemo(
    () =>
      activeHome
        ? devices.filter((device) => device.homeId === activeHome.id)
        : [],
    [activeHome, devices],
  );
  const activePower = homeDevices
    .filter((device) => device.online && device.state === "on")
    .reduce((total, device) => total + device.power, 0);

  useAndroidBackFallback(!from, "/(tabs)/(main)/homes");

  useEffect(() => {
    if (homesLoadStatus === "loaded" && (!homeId || !activeHome)) {
      router.replace("/(tabs)/(main)/homes");
    } else if (
      activeHome &&
      from !== "notifications" &&
      from !== "alerts"
    ) {
      setActiveHomeId(activeHome.id);
    }
  }, [activeHome, from, homeId, homesLoadStatus, router, setActiveHomeId]);

  const [searchQuery, setSearchQuery] = useState("");
  const [telemetryDevice, setTelemetryDevice] = useState<SmartDevice | null>(
    null,
  );
  const [deviceMenu, setDeviceMenu] = useState<SmartDevice | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [deviceDraftName, setDeviceDraftName] = useState("");
  const [operationLoading, setOperationLoading] = useState(false);
  const [pendingDeviceId, setPendingDeviceId] = useState<string | null>(null);
  const lastOpenedDeviceRef = useRef<string | null>(null);

  useEffect(() => {
    if (!homeId || !deviceId) {
      lastOpenedDeviceRef.current = null;
      return;
    }

    if (!activeHome || !devicesLoaded) return;

    const targetKey = `${homeId}:${deviceId}`;
    if (lastOpenedDeviceRef.current === targetKey) return;

    lastOpenedDeviceRef.current = targetKey;

    const targetDevice = homeDevices.find(
      (device) => device.id === deviceId,
    );

    if (!targetDevice) return;

    let opened = false;
    const frame = requestAnimationFrame(() => {
      opened = true;
      setSearchQuery("");
      setTelemetryDevice(targetDevice);
    });

    return () => {
      cancelAnimationFrame(frame);
      if (!opened && lastOpenedDeviceRef.current === targetKey) {
        lastOpenedDeviceRef.current = null;
      }
    };
  }, [homeId, deviceId, activeHome, devicesLoaded, homeDevices]);

  const filteredDevices = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return query
      ? homeDevices.filter((device) =>
          device.name.toLowerCase().includes(query),
        )
      : homeDevices;
  }, [homeDevices, searchQuery]);

  function openPairing() {
    if (!activeHome) {
      Alert.alert(
        "Hogar requerido",
        "Selecciona un hogar para agregar un dispositivo.",
      );
      return;
    }
    router.push({
      pathname: "/(tabs)/add-device",
      params: { homeId: activeHome.id, returnTo: "home-detail" },
    });
  }

  function goBack() {
    if (from && router.canGoBack()) {
      router.back();
      return;
    }

    const originRoutes: Record<string, Href> = {
      homes: "/(tabs)/(main)/homes",
      devices: "/(tabs)/devices",
      notifications: "/(tabs)/(main)/notifications",
      alerts: "/(tabs)/alerts",
      favorites: "/(tabs)/favorites",
    };

    router.replace(
      (from && originRoutes[from]) || "/(tabs)/(main)/homes",
    );
  }

  function handleDeleteDevice(device: SmartDevice) {
    Alert.alert("Eliminar dispositivo", `¿Quieres eliminar ${device.name}?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          setOperationLoading(true);
          try {
            await removeDevice(device.id);
            setTelemetryDevice(null);
          } catch (error) {
            Alert.alert(
              "No se pudo eliminar",
              error instanceof Error ? error.message : "Intenta nuevamente.",
            );
          } finally {
            setOperationLoading(false);
          }
        },
      },
    ]);
  }

  async function saveDeviceName() {
    if (!deviceMenu) return;
    const name = deviceDraftName.trim();
    if (name.length < 2 || name.length > 60) {
      Alert.alert("Nombre no válido", "Usa entre 2 y 60 caracteres.");
      return;
    }
    setOperationLoading(true);
    try {
      await updateDevice(deviceMenu.id, { name });
      setDeviceMenu(null);
      setEditingName(false);
    } catch (error) {
      Alert.alert(
        "No se pudo guardar",
        error instanceof Error ? error.message : "Intenta nuevamente.",
      );
    } finally {
      setOperationLoading(false);
    }
  }

  async function toggleDevice(device: SmartDevice) {
    if (!canControl || !device.online || pendingDeviceId) return;
    setPendingDeviceId(device.id);
    try {
      await setHomeDeviceState(device.id, device.state === "on" ? "off" : "on");
    } catch (error) {
      Alert.alert(
        "No se pudo cambiar el estado",
        getDeviceControlErrorMessage(error),
      );
    } finally {
      setPendingDeviceId(null);
    }
  }

  async function toggleTelemetryDevice() {
    if (!telemetryDevice || !canControl || !telemetryDevice.online || pendingDeviceId) return;
    const nextState = telemetryDevice.state === "on" ? "off" : "on";
    setPendingDeviceId(telemetryDevice.id);
    try {
      await setHomeDeviceState(telemetryDevice.id, nextState);
      // La publicación del comando no prueba que el relé haya cambiado.
      // El estado se actualizará mediante telemetría o lectura del backend.
    } catch (error) {
      Alert.alert(
        "No se pudo cambiar el estado",
        getDeviceControlErrorMessage(error),
      );
    } finally {
      setPendingDeviceId(null);
    }
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: layout.gutter,
          paddingTop: layout.screenTop,
          paddingBottom: layout.screenBottom,
        }}
      >
        <View style={[styles.content, { maxWidth: layout.contentWidth }]}>
          {activeHome ? (
            <>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Cerrar detalle del hogar"
                onPress={goBack}
                style={[styles.closeButton, { backgroundColor: theme.rowAlt }]}
              >
                <Ionicons name="close" size={21} color={theme.text} />
              </Pressable>

              <View
                style={[
                  styles.homeHeader,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.borderLight,
                  },
                ]}
              >
                <View style={styles.homeHeaderCopy}>
                  <Text style={[styles.homeTitle, { color: theme.text }]}>
                    {activeHome.name}
                  </Text>
                  <Text style={[styles.subtitle, { color: theme.muted }]}>
                    {devicesLoaded
                      ? `${homeDevices.length} ${
                          homeDevices.length === 1
                            ? "dispositivo"
                            : "dispositivos"
                        }`
                      : deviceLoadStatus === "error"
                        ? "Dispositivos no disponibles"
                        : deviceLoadStatus === "loading"
                          ? "Cargando dispositivos..."
                          : "Dispositivos pendientes de consultar"}
                  </Text>
                </View>
                {canManage ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Invitar personas a ${activeHome.name}`}
                    accessibilityHint="Abre la gestión de invitaciones y miembros"
                    onPress={() => {
                      if (!activeHome || !canManage) return;

                      router.push({
                        pathname: "/(tabs)/access",
                        params: {
                          homeId: activeHome.id,
                          returnTo: "home-detail",
                        },
                      });
                    }}
                    style={[
                      styles.addButton,
                      { backgroundColor: theme.blue },
                    ]}
                  >
                    <Ionicons
                      name="person-add-outline"
                      size={19}
                      color="#FFFFFF"
                    />
                    <Text style={styles.addButtonText}>Invitar</Text>
                  </Pressable>
                ) : null}
              </View>

              {devicesLoaded ? (
                <EnergyRealtimeCard
                  isOnline={homeDevices.some((device) => device.online)}
                  power={activePower}
                  theme={theme}
                />
              ) : null}

              <View
                style={[
                  styles.sectionHeader,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.borderLight,
                  },
                ]}
              >
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  Dispositivos
                </Text>
                {canManage ? (
                  <Pressable onPress={openPairing} hitSlop={8}>
                    <Ionicons name="add-circle" size={26} color={theme.blue} />
                  </Pressable>
                ) : null}
              </View>

              <View
                style={[
                  styles.searchBox,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.borderLight,
                  },
                ]}
              >
                <Ionicons name="search-outline" size={18} color={theme.muted} />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Buscar dispositivo"
                  placeholderTextColor={theme.muted}
                  style={[styles.searchInput, { color: theme.text }]}
                />
                {searchQuery ? (
                  <Pressable onPress={() => setSearchQuery("")}>
                    <Ionicons
                      name="close-circle"
                      size={18}
                      color={theme.muted}
                    />
                  </Pressable>
                ) : null}
              </View>

              {devicesLoaded && filteredDevices.map((device) => (
                <ShellyDeviceCard
                  key={device.id}
                  device={device}
                  theme={theme}
                  canControl={canControl && pendingDeviceId !== device.id}
                  onPress={() => setTelemetryDevice(device)}
                  onMenu={() => {
                    setDeviceMenu(device);
                    setEditingName(false);
                  }}
                  onToggleState={() => void toggleDevice(device)}
                />
              ))}

              {devicesLoaded && filteredDevices.length === 0 ? (
                <View
                  style={[
                    styles.emptyCard,
                    {
                      backgroundColor: theme.card,
                      borderColor: theme.borderLight,
                    },
                  ]}
                >
                  <Ionicons
                    name={
                      searchQuery ? "search-outline" : "hardware-chip-outline"
                    }
                    size={34}
                    color={theme.muted}
                  />
                  <Text style={[styles.emptyTitle, { color: theme.text }]}>
                    {searchQuery
                      ? "No se encontraron dispositivos"
                      : "Aún no hay dispositivos"}
                  </Text>
                  <Text style={[styles.emptyText, { color: theme.muted }]}>
                    {searchQuery
                      ? "Prueba con otro nombre."
                      : "Vincula un Shelly para comenzar a gestionarlo desde aquí."}
                  </Text>
                  {!searchQuery && canManage ? (
                    <Pressable
                      onPress={openPairing}
                      style={[
                        styles.primaryButton,
                        { backgroundColor: theme.blue },
                      ]}
                    >
                      <Ionicons
                        name="bluetooth-outline"
                        size={18}
                        color="#FFFFFF"
                      />
                      <Text style={styles.primaryButtonText}>
                        Buscar Shelly cercano
                      </Text>
                    </Pressable>
                  ) : null}
                </View>
              ) : null}

              {!devicesLoaded ? (
                <View
                  style={[
                    styles.emptyCard,
                    {
                      backgroundColor: theme.card,
                      borderColor: theme.borderLight,
                    },
                  ]}
                >
                  <Ionicons
                    name={
                      deviceLoadStatus === "error"
                        ? "alert-circle-outline"
                        : "time-outline"
                    }
                    size={34}
                    color={theme.muted}
                  />

                  <Text style={[styles.emptyTitle, { color: theme.text }]}>
                    {deviceLoadStatus === "error"
                      ? "No se pudieron cargar los dispositivos"
                      : deviceLoadStatus === "loading"
                        ? "Cargando dispositivos..."
                        : "Dispositivos pendientes de consultar"}
                  </Text>

                  {deviceLoadStatus === "error" ? (
                    <Text style={[styles.emptyText, { color: theme.muted }]}>
                      No fue posible recuperar la información de este hogar.
                    </Text>
                  ) : null}
                </View>
              ) : null}
            </>
          ) : (
            <View
              style={[
                styles.emptyCard,
                { backgroundColor: theme.card, borderColor: theme.borderLight },
              ]}
            >
              <Ionicons name="home-outline" size={34} color={theme.muted} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>
                No hay hogares disponibles
              </Text>
              <Text style={[styles.emptyText, { color: theme.muted }]}>
                Inicia sesión o solicita acceso a un hogar para ver sus
                dispositivos.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <Modal
        visible={!!telemetryDevice}
        transparent
        animationType="slide"
        onRequestClose={() => setTelemetryDevice(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderCopy}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>
                  {telemetryDevice?.name}
                </Text>
                <Text style={[styles.subtitle, { color: theme.muted }]}>
                  {telemetryDevice?.modelName ?? 'Modelo no identificado'}
                </Text>
              </View>
              <Pressable onPress={() => setTelemetryDevice(null)} hitSlop={8}>
                <Ionicons
                  name="close-circle-outline"
                  size={26}
                  color={theme.muted}
                />
              </Pressable>
            </View>

            {telemetryDevice ? (
              <View style={styles.telemetryGrid}>
                {[
                  ["Potencia", `${telemetryDevice.power} W`],
                  [
                    "Energía acumulada",
                    `${(telemetryDevice.energy / 1000).toFixed(2)} kWh`,
                  ],
                  ["Voltaje", `${telemetryDevice.voltage} V`],
                  ["Corriente", `${telemetryDevice.current} A`],
                  ["Frecuencia", `${telemetryDevice.frequency} Hz`],
                  [
                    "Conectividad",
                    telemetryDevice.online ? "Conectado" : "Fuera de línea",
                  ],
                ].map(([label, value]) => (
                  <View
                    key={label}
                    style={[
                      styles.telemetryCell,
                      { backgroundColor: theme.rowAlt },
                    ]}
                  >
                    <Text
                      style={[styles.telemetryLabel, { color: theme.muted }]}
                    >
                      {label}
                    </Text>
                    <Text
                      style={[styles.telemetryValue, { color: theme.text }]}
                    >
                      {value}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}

            {telemetryDevice && canControl ? (
              <Pressable
                disabled={pendingDeviceId === telemetryDevice.id}
                onPress={() => void toggleTelemetryDevice()}
                style={[
                  styles.primaryButton,
                  {
                    backgroundColor:
                      telemetryDevice.state === "on"
                        ? theme.danger
                        : theme.blue,
                  },
                ]}
              >
                <Ionicons name="power" size={19} color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>
                  {telemetryDevice.state === "on"
                    ? "Apagar relé"
                    : "Encender relé"}
                </Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </Modal>

      <Modal
        visible={!!deviceMenu}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setDeviceMenu(null);
          setEditingName(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {editingName ? "Renombrar dispositivo" : deviceMenu?.name}
            </Text>
            {editingName ? (
              <TextInput
                value={deviceDraftName}
                onChangeText={setDeviceDraftName}
                autoFocus
                placeholder="Nombre del dispositivo"
                placeholderTextColor={theme.muted}
                style={[
                  styles.nameInput,
                  {
                    color: theme.text,
                    borderColor: theme.borderLight,
                    backgroundColor: theme.rowAlt,
                  },
                ]}
              />
            ) : (
              <>
                <Pressable
                  disabled={!canManage || operationLoading}
                  onPress={() => {
                    setDeviceDraftName(deviceMenu?.name ?? "");
                    setEditingName(true);
                  }}
                  style={styles.menuItem}
                >
                  <Ionicons
                    name="pencil-outline"
                    size={19}
                    color={theme.blue}
                  />
                  <Text style={[styles.menuText, { color: theme.text }]}>
                    Renombrar
                  </Text>
                </Pressable>
                <Pressable
                  disabled={!canManage || operationLoading}
                  onPress={() => {
                    if (deviceMenu) handleDeleteDevice(deviceMenu);
                    setDeviceMenu(null);
                  }}
                  style={styles.menuItem}
                >
                  <Ionicons
                    name="trash-outline"
                    size={19}
                    color={theme.danger}
                  />
                  <Text style={[styles.menuText, { color: theme.danger }]}>
                    Eliminar dispositivo
                  </Text>
                </Pressable>
              </>
            )}
            <View style={styles.modalActions}>
              <Pressable
                onPress={() => {
                  setDeviceMenu(null);
                  setEditingName(false);
                }}
                style={[
                  styles.secondaryButton,
                  { borderColor: theme.borderLight },
                ]}
              >
                <Text
                  style={[styles.secondaryButtonText, { color: theme.muted }]}
                >
                  Cancelar
                </Text>
              </Pressable>
              {editingName ? (
                <Pressable
                  disabled={operationLoading}
                  onPress={() => void saveDeviceName()}
                  style={[
                    styles.primarySmallButton,
                    { backgroundColor: theme.blue },
                  ]}
                >
                  <Text style={styles.primaryButtonText}>
                    {operationLoading ? "Guardando..." : "Guardar"}
                  </Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
