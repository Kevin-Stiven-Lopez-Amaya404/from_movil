import { Ionicons } from "@expo/vector-icons";
import {
  useLocalSearchParams,
  useRouter,
  type Href,
} from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { KeyboardAvoidingScreen } from "@/components/common/KeyboardAvoidingScreen";
import { EnergyRealtimeCard } from "@/components/homes/EnergyRealtimeCard";
import { ShellyDeviceCard } from "@/components/homes/ShellyDeviceCard";
import { useSmartHome } from "@/lib/context/smart-home-context";
import {
  getDeviceConnectivityState,
  isDeviceConfirmedOnline,
  type SmartDevice,
} from "@/lib/domain/device";
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
    .filter((device) => isDeviceConfirmedOnline(device) && device.state === "on")
    .reduce((total, device) => total + device.power, 0);
  const confirmedOnlineDeviceCount = homeDevices.filter(
    isDeviceConfirmedOnline,
  ).length;
  const realtimeStatus =
    confirmedOnlineDeviceCount > 0
      ? confirmedOnlineDeviceCount === homeDevices.length
        ? "online"
        : "partial"
      : homeDevices.some(
            (device) => getDeviceConnectivityState(device) === "UNKNOWN",
          )
        ? "unknown"
        : "offline";

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
  const pendingDeviceLock = useRef<string | null>(null);
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
    if (operationLoading) return;

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
    if (!deviceMenu || operationLoading) return;
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

  function closeDeviceMenu() {
    if (operationLoading) return;

    if (editingName && deviceMenu && deviceDraftName !== deviceMenu.name) {
      Alert.alert("¿Descartar los cambios?", "El nombre editado no se guardará.", [
        { text: "Seguir editando", style: "cancel" },
        {
          text: "Descartar",
          style: "destructive",
          onPress: () => {
            setDeviceMenu(null);
            setEditingName(false);
          },
        },
      ]);
      return;
    }

    setDeviceMenu(null);
    setEditingName(false);
  }

  async function toggleDevice(device: SmartDevice) {
    if (
      !canControl ||
      !isDeviceConfirmedOnline(device) ||
      pendingDeviceLock.current !== null
    ) {
      return;
    }
    pendingDeviceLock.current = device.id;
    setPendingDeviceId(device.id);
    try {
      await setHomeDeviceState(device.id, device.state === "on" ? "off" : "on");
    } catch (error) {
      Alert.alert(
        "No se pudo cambiar el estado",
        getDeviceControlErrorMessage(error),
      );
    } finally {
      pendingDeviceLock.current = null;
      setPendingDeviceId(null);
    }
  }

  async function toggleTelemetryDevice() {
    if (
      !telemetryDevice ||
      !canControl ||
      !isDeviceConfirmedOnline(telemetryDevice) ||
      pendingDeviceLock.current !== null
    ) {
      return;
    }
    const nextState = telemetryDevice.state === "on" ? "off" : "on";
    pendingDeviceLock.current = telemetryDevice.id;
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
      pendingDeviceLock.current = null;
      setPendingDeviceId(null);
    }
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
    >
      <KeyboardAvoidingScreen>
      <ScrollView
        keyboardShouldPersistTaps="handled"
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
                  <Text
                    numberOfLines={2}
                    style={[styles.homeTitle, { color: theme.text }]}
                  >
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
                      { backgroundColor: theme.solidActionBackground },
                    ]}
                  >
                    <Ionicons
                      name="person-add-outline"
                      size={19}
                      color={theme.onSolidAction}
                    />
                    <Text style={[styles.addButtonText, { color: theme.onSolidAction }]}>Invitar</Text>
                  </Pressable>
                ) : null}
              </View>

              {devicesLoaded ? (
                homeDevices.length > 0 ? (
                  <EnergyRealtimeCard
                    status={realtimeStatus}
                    power={
                      confirmedOnlineDeviceCount === homeDevices.length
                        ? activePower
                        : null
                    }
                    theme={theme}
                  />
                ) : null
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
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Agregar dispositivo a ${activeHome.name}`}
                    onPress={openPairing}
                    style={styles.addDeviceButton}
                  >
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
                  accessibilityLabel="Buscar dispositivo"
                  accessibilityHint="Filtra los dispositivos de este hogar por nombre"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Buscar dispositivo"
                  placeholderTextColor={theme.muted}
                  style={[styles.searchInput, { color: theme.text }]}
                />
                {searchQuery ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Borrar búsqueda"
                    onPress={() => setSearchQuery("")}
                    style={styles.clearSearchButton}
                  >
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
                  canControl={canControl}
                  canManage={canManage}
                  isPending={pendingDeviceId !== null}
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
                        { backgroundColor: theme.solidActionBackground },
                      ]}
                    >
                      <Ionicons
                        name="bluetooth-outline"
                        size={18}
                        color={theme.onSolidAction}
                      />
                      <Text style={[styles.primaryButtonText, { color: theme.onSolidAction }]}>
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
                  accessibilityLiveRegion="polite"
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
              accessibilityLiveRegion="polite"
            >
              <Ionicons
                name={homesLoadStatus === "error" ? "alert-circle-outline" : homesLoadStatus === "loading" ? "time-outline" : "home-outline"}
                size={34}
                color={homesLoadStatus === "error" ? theme.danger : theme.muted}
              />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>
                {homesLoadStatus === "loading"
                  ? "Cargando hogares..."
                  : homesLoadStatus === "error"
                    ? "No se pudieron cargar los hogares"
                    : "No hay hogares disponibles"}
              </Text>
              <Text style={[styles.emptyText, { color: theme.muted }]}>
                {homesLoadStatus === "loading"
                  ? "Estamos consultando los hogares disponibles."
                  : homesLoadStatus === "error"
                    ? "Comprueba tu conexión e inténtalo nuevamente."
                    : "Inicia sesión o solicita acceso a un hogar para ver sus dispositivos."}
              </Text>
              {homesLoadStatus !== "loading" ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Volver a la pantalla anterior"
                  onPress={goBack}
                  style={[
                    styles.primaryButton,
                    { backgroundColor: theme.solidActionBackground },
                  ]}
                >
                  <Text style={[styles.primaryButtonText, { color: theme.onSolidAction }]}>Volver</Text>
                </Pressable>
              ) : null}
            </View>
          )}
        </View>
      </ScrollView>
      </KeyboardAvoidingScreen>

      <Modal
        visible={!!telemetryDevice}
        transparent
        animationType="slide"
        onRequestClose={() => setTelemetryDevice(null)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: theme.overlay }]}>
          <ScrollView
            style={styles.modalScroll}
            contentContainerStyle={styles.modalScrollContent}
            showsVerticalScrollIndicator={false}
          >
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
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Cerrar detalle del dispositivo"
                onPress={() => setTelemetryDevice(null)}
                style={styles.clearSearchButton}
              >
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
                    getDeviceConnectivityState(telemetryDevice) === "ONLINE"
                      ? "Conectado"
                      : getDeviceConnectivityState(telemetryDevice) === "OFFLINE"
                        ? "Fuera de línea"
                        : "Estado desconocido",
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
                accessibilityRole="button"
                accessibilityLabel={
                  telemetryDevice.state === "on"
                    ? `Apagar ${telemetryDevice.name}`
                    : `Encender ${telemetryDevice.name}`
                }
                disabled={
                  pendingDeviceId !== null ||
                  !isDeviceConfirmedOnline(telemetryDevice)
                }
                accessibilityState={{
                  disabled:
                    pendingDeviceId !== null ||
                    !isDeviceConfirmedOnline(telemetryDevice),
                }}
                onPress={() => void toggleTelemetryDevice()}
                style={[
                  styles.primaryButton,
                  {
                    backgroundColor:
                      telemetryDevice.state === "on"
                        ? theme.danger
                        : theme.solidActionBackground,
                  },
                ]}
              >
                <Ionicons
                  name="power"
                  size={19}
                  color={telemetryDevice.state === "on" ? theme.onDanger : theme.onSolidAction}
                />
                <Text style={[styles.primaryButtonText, { color: telemetryDevice.state === "on" ? theme.onDanger : theme.onSolidAction }]}>
                  {telemetryDevice.state === "on"
                    ? "Apagar relé"
                    : "Encender relé"}
                </Text>
              </Pressable>
            ) : null}
          </View>
        </ScrollView>
        </View>
      </Modal>

      <Modal
        visible={!!deviceMenu}
        transparent
        animationType="fade"
        onRequestClose={closeDeviceMenu}
      >
        <View style={[styles.modalOverlay, { backgroundColor: theme.overlay }]}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalKeyboardAvoiding}
          >
            <ScrollView
              keyboardShouldPersistTaps="handled"
              style={styles.modalScroll}
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
            >
          <View style={[styles.modalCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {editingName ? "Renombrar dispositivo" : deviceMenu?.name}
            </Text>
            {editingName ? (
              <TextInput
                accessibilityLabel="Nombre del dispositivo"
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
                  accessibilityRole="button"
                  accessibilityLabel={`Renombrar ${deviceMenu?.name ?? "dispositivo"}`}
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
                  accessibilityRole="button"
                  accessibilityLabel={`Eliminar ${deviceMenu?.name ?? "dispositivo"}`}
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
                accessibilityRole="button"
                onPress={closeDeviceMenu}
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
                    { backgroundColor: theme.solidActionBackground },
                  ]}
                >
                  <Text style={[styles.primaryButtonText, { color: theme.onSolidAction }]}>
                    {operationLoading ? "Guardando..." : "Guardar"}
                  </Text>
                </Pressable>
              ) : null}
            </View>
          </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
