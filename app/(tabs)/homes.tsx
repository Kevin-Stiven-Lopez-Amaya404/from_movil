import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
    Alert,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { EnergyRealtimeCard } from "@/components/homes/EnergyRealtimeCard";
import { ShellyDeviceCard } from "@/components/homes/ShellyDeviceCard";
import { useMockApi } from "@/lib/config/api-config";
import { useSmartHome } from "@/lib/context/smart-home-context";
import type { SmartDevice } from "@/lib/domain/device";
import { canControlHome } from "@/lib/domain/home";
import { useResponsiveLayout } from "@/lib/responsive/responsive";
import { useAppTheme } from "@/lib/theme/app-theme";
import { typography } from "@/lib/theme/typography";
import { getDeviceControlErrorMessage } from "@/lib/utils/control-error-message";

export default function HomesScreen() {
  const { homeId } = useLocalSearchParams<{ homeId?: string }>();
  const layout = useResponsiveLayout();
  const router = useRouter();
  const theme = useAppTheme();
  const {
    activeHomeId,
    devices,
    accessibleHomes,
    removeDevice,
    updateDevice,
    sessionRole,
    setActiveHomeId,
    setHomeDeviceState,
  } = useSmartHome();

  const activeHome =
    accessibleHomes.find((home) => home.id === activeHomeId) ??
    accessibleHomes.find((home) => home.id === homeId) ??
    accessibleHomes[0];
  const canManage =
    activeHome?.homeRole === "OWNER" || (useMockApi && sessionRole === "admin");
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

  const [searchQuery, setSearchQuery] = useState("");
  const [telemetryDevice, setTelemetryDevice] = useState<SmartDevice | null>(
    null,
  );
  const [deviceMenu, setDeviceMenu] = useState<SmartDevice | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [deviceDraftName, setDeviceDraftName] = useState("");
  const [operationLoading, setOperationLoading] = useState(false);
  const [pendingDeviceId, setPendingDeviceId] = useState<string | null>(null);

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
      params: { homeId: activeHome.id },
    });
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
      setTelemetryDevice((device) =>
        device ? { ...device, state: nextState } : null,
      );
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
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={[styles.title, { color: theme.text }]}>Hogares</Text>
              <Text style={[styles.subtitle, { color: theme.muted }]}>
                Dispositivos vinculados a tus hogares
              </Text>
            </View>
            {canManage ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Gestionar miembros"
                onPress={() => router.push("/(tabs)/access")}
                style={[styles.headerAction, { backgroundColor: theme.card }]}
              >
                <Ionicons name="people-outline" size={20} color={theme.blue} />
              </Pressable>
            ) : null}
          </View>

          {useMockApi ? (
            <View
              style={[
                styles.demoNotice,
                {
                  backgroundColor: theme.rowAlt,
                  borderColor: theme.borderLight,
                },
              ]}
            >
              <Ionicons
                name="information-circle-outline"
                size={18}
                color={theme.blue}
              />
              <Text style={[styles.demoNoticeText, { color: theme.muted }]}>
                Modo demo: estos datos locales no se guardan en el servidor.
              </Text>
            </View>
          ) : null}

          {accessibleHomes.length > 1 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.homePicker}
            >
              {accessibleHomes.map((home) => {
                const selected = home.id === activeHome?.id;
                return (
                  <Pressable
                    key={home.id}
                    onPress={() => setActiveHomeId(home.id)}
                    style={[
                      styles.homeChip,
                      {
                        backgroundColor: selected ? theme.blue : theme.card,
                        borderColor: selected ? theme.blue : theme.borderLight,
                      },
                    ]}
                  >
                    <Ionicons
                      name="home-outline"
                      size={16}
                      color={selected ? "#FFFFFF" : theme.blue}
                    />
                    <Text
                      style={[
                        styles.homeChipText,
                        { color: selected ? "#FFFFFF" : theme.text },
                      ]}
                    >
                      {home.name}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          ) : null}

          {activeHome ? (
            <>
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
                    {homeDevices.length}{" "}
                    {homeDevices.length === 1 ? "dispositivo" : "dispositivos"}
                  </Text>
                </View>
                {canManage ? (
                  <Pressable
                    accessibilityRole="button"
                    onPress={openPairing}
                    style={[styles.addButton, { backgroundColor: theme.blue }]}
                  >
                    <Ionicons name="add" size={18} color="#FFFFFF" />
                    <Text style={styles.addButtonText}>Agregar</Text>
                  </Pressable>
                ) : null}
              </View>

              <EnergyRealtimeCard
                isOnline={homeDevices.some((device) => device.online)}
                power={activePower}
                theme={theme}
              />

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

              {filteredDevices.map((device) => (
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

              {filteredDevices.length === 0 ? (
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
                  Shelly Plus 1PM
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

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { alignSelf: "center", width: "100%" },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerCopy: { flex: 1 },
  title: {
    fontFamily: typography.fontFamily.display,
    fontSize: 24,
    fontWeight: "800",
  },
  subtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    marginTop: 3,
  },
  headerAction: {
    alignItems: "center",
    borderRadius: 12,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  homePicker: { gap: 8, marginBottom: 14 },
  demoNotice: {
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  demoNoticeText: {
    flex: 1,
    fontFamily: typography.fontFamily.regular,
    fontSize: 11,
  },
  homeChip: {
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 7,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  homeChipText: {
    fontFamily: typography.fontFamily.emphasis,
    fontSize: 12,
    fontWeight: "700",
  },
  homeHeader: {
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
    padding: 15,
  },
  homeHeaderCopy: { flex: 1 },
  homeTitle: {
    fontFamily: typography.fontFamily.display,
    fontSize: 19,
    fontWeight: "800",
  },
  addButton: {
    alignItems: "center",
    borderRadius: 10,
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontFamily: typography.fontFamily.emphasis,
    fontSize: 12,
    fontWeight: "800",
  },
  sectionHeader: {
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.emphasis,
    fontSize: 16,
    fontWeight: "800",
  },
  searchBox: {
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: 9,
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    fontFamily: typography.fontFamily.regular,
    fontSize: 14,
    minHeight: 42,
  },
  emptyCard: {
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 12,
    padding: 24,
  },
  emptyTitle: {
    fontFamily: typography.fontFamily.emphasis,
    fontSize: 16,
    fontWeight: "800",
    marginTop: 12,
    textAlign: "center",
  },
  emptyText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
    textAlign: "center",
  },
  primaryButton: {
    alignItems: "center",
    borderRadius: 11,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginTop: 16,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontFamily: typography.fontFamily.emphasis,
    fontSize: 13,
    fontWeight: "800",
  },
  modalOverlay: {
    alignItems: "center",
    backgroundColor: "rgba(15,23,42,0.48)",
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  modalCard: { borderRadius: 20, maxWidth: 500, padding: 20, width: "100%" },
  modalHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  modalHeaderCopy: { flex: 1 },
  modalTitle: {
    fontFamily: typography.fontFamily.display,
    fontSize: 18,
    fontWeight: "800",
  },
  telemetryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 9 },
  telemetryCell: { borderRadius: 12, minHeight: 64, padding: 11, width: "48%" },
  telemetryLabel: { fontFamily: typography.fontFamily.regular, fontSize: 11 },
  telemetryValue: {
    fontFamily: typography.fontFamily.emphasis,
    fontSize: 14,
    fontWeight: "700",
    marginTop: 5,
  },
  nameInput: {
    borderRadius: 11,
    borderWidth: 1,
    fontSize: 14,
    marginTop: 15,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  menuItem: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    paddingVertical: 14,
  },
  menuText: {
    fontFamily: typography.fontFamily.emphasis,
    fontSize: 14,
    fontWeight: "700",
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "flex-end",
    marginTop: 15,
  },
  secondaryButton: {
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: "center",
    minWidth: 90,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  secondaryButtonText: {
    fontFamily: typography.fontFamily.emphasis,
    fontSize: 12,
    fontWeight: "700",
  },
  primarySmallButton: {
    alignItems: "center",
    borderRadius: 10,
    justifyContent: "center",
    minWidth: 90,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
});
