/**
 * Pantalla de gestión de hogares.
 *
 * Permite al usuario crear y explorar hogares, ver dispositivos asociados,
 * encender/apagar dispositivos y revisar detalles del hogar seleccionado.
 */
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useSmartHome } from "@/lib/context/smart-home-context";
import { useResponsiveLayout } from "@/lib/responsive/responsive";
import { useAppTheme } from "@/lib/theme/app-theme";
import { typography } from "@/lib/theme/typography";

const BLUE = "#0864C8";
const TEXT = "#454545";
const LILAC = "#DDDDFB";
const GREEN = "#2AAF5D";
const RED = "#FF3B20";
const MUTED = "#6B7280";

export default function HomesScreen() {
  const { homeId, deviceId } = useLocalSearchParams<{
    homeId?: string;
    deviceId?: string;
  }>();

  const layout = useResponsiveLayout();
  const router = useRouter();
  const theme = useAppTheme();

  // Estado global de hogares y dispositivos. Aqui vive la relacion hogar -> dispositivos.
  const {
    activeHomeId,
    addDeviceToHome,
    addHome,
    devices,
    homes,
    accessibleHomes,
    sessionRole,
    setActiveHomeId,
    setDeviceOnline,
    toggleDevice,
    setHomeDeviceState,
    setAllHomeDevicesState,
    toggleHomeFavorite,
    resolvedSmartAlerts,
    resolveSmartDeviceAlert,
  } = useSmartHome();

  const canManage = sessionRole === "admin";
  const canControl = sessionRole !== "invitado";

  // Estados locales para formularios y seleccion visual dentro de esta pantalla.
  const [homeName, setHomeName] = useState("");
  const [deviceName, setDeviceName] = useState("");
  const [openedHomeId, setOpenedHomeId] = useState<string | null>(
    () => homeId ?? null,
  );
  const [selectedId, setSelectedId] = useState(() => deviceId ?? "");

  // Alertas puede abrir directamente un hogar/dispositivo mediante parámetros
  // de navegación. Los parámetros se usan como valores derivados cuando existen.

  // Determina el hogar que se muestra actualmente.
  const selectedHome =
    accessibleHomes.find((home) => home.id === activeHomeId) ?? accessibleHomes[0];
  const resolvedOpenedHomeId = homeId ?? openedHomeId;
  const openedHome =
    accessibleHomes.find((home) => home.id === resolvedOpenedHomeId) ?? null;

  // El hogar actualmente visible: si el usuario abrió el detalle se muestra ese,
  // de lo contrario se muestra el hogar seleccionado globalmente.
  const activeHome = openedHome ?? selectedHome;

  // Filtra dispositivos por homeId. Esta es la regla central: cada dispositivo pertenece a un hogar.
  const homeDevices = useMemo(
    () =>
      activeHome
        ? devices.filter((device) => device.homeId === activeHome.id)
        : [],
    [activeHome, devices],
  );
  const resolvedSelectedId = deviceId ?? selectedId;
  const selectedDevice =
    homeDevices.find((device) => device.id === resolvedSelectedId) ??
    homeDevices[0];
  const onlineCount = homeDevices.filter((device) => device.online).length;

  const currentPower = homeDevices
    .filter((device) => device.online && device.state === "on")
    .reduce((sum, device) => sum + device.power, 0);

  const currentPowerLabel =
    currentPower >= 1000
      ? `${(currentPower / 1000).toFixed(2)} kW`
      : `${currentPower} W`;

  /**
   * Abre el detalle de un hogar y lo marca como hogar activo global.
   */
  function openHome(homeId: string) {
    setActiveHomeId(homeId);
    setOpenedHomeId(homeId);
    setSelectedId("");
  }

  /**
   * Crea un hogar despues de validar que el nombre no este vacio.
   */
  function handleAddHome() {
    const cleanName = homeName.trim();

    if (!cleanName) {
      Alert.alert("Nombre requerido", "Ingresa el nombre del hogar.");
      return;
    }

    addHome(cleanName);
    setHomeName("");
  }

  /**
   * Crea un dispositivo dentro del hogar activo.
   *
   * Esta funcion protege la relacion correcta: no permite crear dispositivos
   * si no hay un hogar seleccionado.
   */
  function handleAddDevice() {
    const cleanName = deviceName.trim();

    if (!activeHome) {
      Alert.alert("Hogar requerido", "Primero registra un hogar.");
      return;
    }

    if (!cleanName) {
      Alert.alert("Nombre requerido", "Ingresa el nombre del dispositivo.");
      return;
    }

    addDeviceToHome(activeHome.id, cleanName);
    setDeviceName("");
  }

  /**
   * Apaga todos los dispositivos del hogar actual.
   */
  function setHomePowerState(state: "on" | "off") {
    if (!activeHome || !canControl) return;
    setAllHomeDevicesState(activeHome.id, state);
    Alert.alert(
      state === "off" ? "Hogar apagado" : "Hogar encendido",
      `${state === "off" ? "Se apagaron" : "Se encendieron"} los dispositivos de ${activeHome.name}.`,
    );
  }

  /**
   * Vista de lista de hogares.
   * Se separa en funcion para no mezclarla con el detalle del hogar.
   */
  function renderHomeList() {
    return (
      <>
        {canManage && (
                  <View style={styles.addRow}>
                    <TextInput
                      style={[
                        styles.addInput,
                        {
                          backgroundColor: theme.row,
                          borderColor: theme.border,
                          color: theme.text,
                        },
                      ]}
                      placeholder="Nombre del hogar"
                      placeholderTextColor={MUTED}
                      value={homeName}
                      onChangeText={setHomeName}
                    />
                    <Pressable style={styles.addButton} onPress={handleAddHome}>
                      <Ionicons name="add" size={24} color="#FFFFFF" />
                    </Pressable>
                  </View>

        )}

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Hogares registrados
          </Text>
          <Text style={[styles.sectionMeta, { color: theme.muted }]}>
            {accessibleHomes.length} hogar{accessibleHomes.length === 1 ? "" : "es"}
          </Text>
        </View>

        {canManage && (
          <Pressable
            style={({ pressed }) => [styles.accessButton, pressed && styles.pressed]}
            onPress={() => router.push("/(tabs)/access")}
          >
            <Ionicons name="people-outline" size={19} color={theme.blue} />
            <Text style={[styles.accessButtonText, { color: theme.blue }]}>
              Gestionar miembros e invitados
            </Text>
            <Ionicons name="chevron-forward" size={18} color={theme.blue} />
          </Pressable>
        )}

        <View style={styles.list}>
          {accessibleHomes.map((home) => {
            const homeDevices = devices.filter(
              (device) => device.homeId === home.id,
            );

            const count = homeDevices.length;

            const alertCount = homeDevices.filter(
              (device) =>
                (device.critical || !device.online) &&
                !resolvedSmartAlerts.includes(device.id),
            ).length;

            return (
              <View
                key={home.id}
                style={[
                  styles.homeCard,
                  {
                    backgroundColor: theme.row,
                    borderColor:
                      alertCount > 0 ? theme.danger : theme.borderLight,
                    borderWidth: alertCount > 0 ? 1 : 0,
                  },
                ]}
              >
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Abrir ${home.name}`}
                  onPress={() => openHome(home.id)}
                  style={({ pressed }) => [
                    styles.homeContent,
                    pressed && styles.pressed,
                  ]}
                >
                  <View
                    style={[styles.itemIcon, { backgroundColor: theme.rowAlt }]}
                  >
                    <MaterialCommunityIcons
                      name="home-city-outline"
                      size={31}
                      color={theme.blue}
                    />
                  </View>

                  <View style={styles.itemCopy}>
                    <Text
                      numberOfLines={1}
                      style={[styles.itemTitle, { color: theme.text }]}
                    >
                      {home.name}
                    </Text>

                    <Text
                      numberOfLines={1}
                      style={[styles.itemSubtitle, { color: theme.muted }]}
                    >
                      {count} dispositivos · {home.location}
                    </Text>

                    {alertCount > 0 && (
                      <View style={styles.homeAlertRow}>
                        <Ionicons
                          name="warning-outline"
                          size={14}
                          color={theme.danger}
                        />
                        <Text
                          style={[
                            styles.homeAlertText,
                            { color: theme.danger },
                          ]}
                        >
                          {alertCount} alerta
                          {alertCount === 1 ? "" : "s"} pendiente
                          {alertCount === 1 ? "" : "s"}
                        </Text>
                      </View>
                    )}
                  </View>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    home.favorite
                      ? `Quitar ${home.name} de favoritos`
                      : `Agregar ${home.name} a favoritos`
                  }
                  onPress={() => toggleHomeFavorite(home.id)}
                  hitSlop={6}
                  style={({ pressed }) => [
                    styles.favoriteButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons
                    name={home.favorite ? "star" : "star-outline"}
                    size={25}
                    color={home.favorite ? "#F5B400" : theme.muted}
                  />
                </Pressable>
              </View>
            );
          })}
        </View>
      </>
    );
  }

  /**
   * Vista de detalle de un hogar.
   * Muestra solo los dispositivos cuyo `homeId` coincide con el hogar activo.
   */
  function renderHomeDetail() {
    if (!activeHome) return null;

    return (
      <>
        <Pressable style={styles.backRow} onPress={() => setOpenedHomeId(null)}>
          <Ionicons name="chevron-back" size={22} color={BLUE} />
          <Text style={[styles.backText, { color: theme.blue }]}>Hogares</Text>
        </Pressable>

        <View
          style={[
            styles.detailHero,
            {
              backgroundColor: theme.card,
              borderColor: theme.borderLight,
            },
          ]}
        >
          <View style={styles.detailHeroTop}>
            <View
              style={[styles.detailHomeIcon, { backgroundColor: theme.rowAlt }]}
            >
              <MaterialCommunityIcons
                name="home-city-outline"
                size={28}
                color={theme.blue}
              />
            </View>

            <View style={styles.detailHeroCopy}>
              <Text
                numberOfLines={1}
                style={[styles.detailHeroTitle, { color: theme.text }]}
              >
                {activeHome.name}
              </Text>
              <Text
                numberOfLines={1}
                style={[styles.detailHeroSubtitle, { color: theme.muted }]}
              >
                {activeHome.location}
              </Text>
            </View>

            <View
              style={[
                styles.statusBadge,
                { backgroundColor: theme.successSoft },
              ]}
            >
              <View
                style={[styles.statusDot, { backgroundColor: theme.success }]}
              />
              <Text style={[styles.statusBadgeText, { color: theme.success }]}>
                {onlineCount > 0 ? "Activo" : "Sin conexión"}
              </Text>
            </View>
          </View>

          <View
            style={[styles.homeMetrics, { borderTopColor: theme.borderLight }]}
          >
            <View style={styles.homeMetric}>
              <Text style={[styles.homeMetricValue, { color: theme.text }]}>
                {homeDevices.length}
              </Text>
              <Text style={[styles.homeMetricLabel, { color: theme.muted }]}>
                Dispositivos
              </Text>
            </View>

            <View style={styles.homeMetric}>
              <Text style={[styles.homeMetricValue, { color: theme.text }]}>
                {onlineCount}
              </Text>
              <Text style={[styles.homeMetricLabel, { color: theme.muted }]}>
                Conectados
              </Text>
            </View>

            <View style={styles.homeMetric}>
              <Text style={[styles.homeMetricValue, { color: theme.text }]}>
                {currentPowerLabel}
              </Text>
              <Text style={[styles.homeMetricLabel, { color: theme.muted }]}>
                Consumo actual
              </Text>
            </View>
          </View>
        </View>

        {canManage && (
                  <View style={styles.addRow}>
                    <TextInput
                      style={[
                        styles.addInput,
                        {
                          backgroundColor: theme.row,
                          borderColor: theme.border,
                          color: theme.text,
                        },
                      ]}
                      placeholder="Nombre del dispositivo"
                      placeholderTextColor={MUTED}
                      value={deviceName}
                      onChangeText={setDeviceName}
                    />
                    <Pressable style={styles.addButton} onPress={handleAddDevice}>
                      <Ionicons name="add" size={24} color="#FFFFFF" />
                    </Pressable>
                  </View>

        )}

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Dispositivos de {activeHome.name}
          </Text>
          <Text style={[styles.sectionMeta, { color: theme.muted }]}>
            {homeDevices.length} items
          </Text>
        </View>

        <View style={styles.list}>
          {homeDevices.map((device) => {
            const hasAlert =
              (device.critical || !device.online) &&
              !resolvedSmartAlerts.includes(device.id);

            return (
              <View
                key={device.id}
                style={[
                  styles.deviceCard,
                  {
                    backgroundColor: theme.row,
                    borderColor: hasAlert ? theme.danger : theme.borderLight,
                    borderWidth: hasAlert ? 1 : 0,
                  },
                  selectedDevice?.id === device.id && styles.selectedCard,
                ]}
              >
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Seleccionar ${device.name}`}
                  onPress={() => setSelectedId(device.id)}
                  style={({ pressed }) => [
                    styles.deviceContent,
                    pressed && styles.pressed,
                  ]}
                >
                  <View
                    style={[
                      styles.itemIcon,
                      { backgroundColor: theme.rowAlt },
                      !device.online && styles.itemIconOff,
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={device.icon as never}
                      size={35}
                      color={device.online ? theme.blue : theme.muted}
                    />
                  </View>

                  <View style={styles.itemCopy}>
                    <View style={styles.deviceTitleRow}>
                      <Text
                        numberOfLines={1}
                        style={[styles.itemTitle, { color: theme.text }]}
                      >
                        {device.name}
                      </Text>

                      {hasAlert && (
                        <Ionicons
                          name="warning-outline"
                          size={17}
                          color={theme.danger}
                        />
                      )}
                    </View>

                    <Text style={[styles.itemSubtitle, { color: theme.muted }]}>
                      {device.room} ·{" "}
                      {device.online
                        ? `${(device.energy / 1000).toFixed(2)} kWh hoy`
                        : "Sin conexión"}
                    </Text>

                    {hasAlert && (
                      <Text
                        style={[
                          styles.deviceAlertText,
                          { color: theme.danger },
                        ]}
                      >
                        {device.critical ? "Requiere atención" : "Sin conexión"}
                      </Text>
                    )}
                  </View>
                </Pressable>

                <Switch
                  value={device.state === "on"}
                  onValueChange={() => {
                    if (canControl) {
                      setHomeDeviceState(device.id, device.state === "on" ? "off" : "on");
                    }
                  }}
                  disabled={!canControl || !device.online}
                  accessibilityLabel={`Encender o apagar ${device.name}`}
                  trackColor={{
                    false: "#CDD2E4",
                    true: "#BDE8CB",
                  }}
                  thumbColor={device.online ? GREEN : "#FFFFFF"}
                />
              </View>
            );
          })}

          {!homeDevices.length && (
            <View style={[styles.emptyCard, { backgroundColor: theme.card }]}>
              <MaterialCommunityIcons
                name="power-plug-outline"
                size={32}
                color={BLUE}
              />
              <Text style={[styles.emptyText, { color: theme.muted }]}>
                Este hogar todavía no tiene dispositivos.
              </Text>
            </View>
          )}
        </View>

        {selectedDevice && (
          <View style={[styles.detailCard, { backgroundColor: theme.card }]}>
            <View style={styles.detailTop}>
              <Text style={[styles.detailTitle, { color: theme.text }]}>
                {selectedDevice.name}
              </Text>
              <Text
                style={[
                  styles.statusPill,
                  selectedDevice.online ? styles.statusOn : styles.statusOff,
                ]}
              >
                {selectedDevice.online ? "Conectado" : "Sin conexión"}
              </Text>
            </View>
            <View style={styles.metricRow}>
              <View style={styles.metric}>
                <Text style={[styles.metricValue, { color: theme.text }]}>
                  {(selectedDevice.energy / 1000).toFixed(2)}
                </Text>
                <Text style={[styles.metricLabel, { color: theme.muted }]}>
                  kWh hoy
                </Text>
              </View>
              <View style={styles.metric}>
                <Text style={[styles.metricValue, { color: theme.text }]}>
                  {(selectedDevice.yesterday / 1000).toFixed(2)}
                </Text>
                <Text style={[styles.metricLabel, { color: theme.muted }]}>
                  kWh ayer
                </Text>
              </View>
              <View style={styles.metric}>
                <Text style={[styles.metricValue, { color: theme.text }]}>
                  {selectedDevice.power >= 1000
                    ? `${(selectedDevice.power / 1000).toFixed(2)} kW`
                    : `${selectedDevice.power} W`}
                </Text>
                <Text style={[styles.metricLabel, { color: theme.muted }]}>
                  Potencia
                </Text>
              </View>
              <View style={styles.metric}>
                <Text style={[styles.metricValue, { color: theme.text }]}>
                  {selectedDevice.room}
                </Text>
                <Text style={[styles.metricLabel, { color: theme.muted }]}>
                  Ubicación
                </Text>
              </View>
            </View>
            {(selectedDevice.critical || !selectedDevice.online) &&
            !resolvedSmartAlerts.includes(selectedDevice.id) ? (
              <View
                style={[
                  styles.detailAlertBox,
                  {
                    backgroundColor: theme.dangerSoft,
                    borderColor: theme.danger,
                  },
                ]}
              >
                <View style={styles.detailAlertCopy}>
                  <View style={styles.detailAlertTitleRow}>
                    <Ionicons
                      name="warning-outline"
                      size={18}
                      color={theme.danger}
                    />
                    <Text
                      style={[styles.detailAlertTitle, { color: theme.danger }]}
                    >
                      {selectedDevice.critical
                        ? "Requiere atención"
                        : "Sin conexión"}
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.detailAlertDescription,
                      { color: theme.muted },
                    ]}
                  >
                    Revisa el dispositivo y marca la alerta como atendida cuando
                    corresponda.
                  </Text>
                </View>

                <Pressable
                  onPress={() => resolveSmartDeviceAlert(selectedDevice.id)}
                  style={({ pressed }) => [
                    styles.resolveDetailButton,
                    {
                      backgroundColor: theme.card,
                      borderColor: theme.borderLight,
                    },
                    pressed && styles.primaryButtonPressed,
                  ]}
                >
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={18}
                    color={theme.success}
                  />
                  <Text
                    style={[
                      styles.resolveDetailButtonText,
                      { color: theme.success },
                    ]}
                  >
                    Resolver
                  </Text>
                </Pressable>
              </View>
            ) : null}

            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                !selectedDevice.online && styles.powerOnButton,
                pressed && styles.primaryButtonPressed,
              ]}
              onPress={() => canControl && setHomeDeviceState(
                selectedDevice.id,
                selectedDevice.state === "on" ? "off" : "on",
              )}
            >
              <Ionicons
                name={selectedDevice.online ? "power-outline" : "flash-outline"}
                size={22}
                color="#FFFFFF"
              />
              <Text style={styles.primaryButtonText}>
                {selectedDevice.state === "on" ? "Apagar ahora" : "Encender ahora"}
              </Text>
            </Pressable>
            <Text style={[styles.actionHint, { color: theme.muted }]}>
              {selectedDevice.state === "on"
                ? `Se apagará ahora · último cambio: ${selectedDevice.lastStateChange ?? "sin registro"}`
                : `Se encenderá ahora · último cambio: ${selectedDevice.lastStateChange ?? "sin registro"}`}
            </Text>
          </View>
        )}

        {!!homeDevices.length && canControl && (
          <View style={styles.bulkActions}>
            <Pressable
              style={({ pressed }) => [styles.offButton, pressed && styles.offButtonPressed]}
              onPress={() => setHomePowerState("off")}
            >
              <Ionicons name="power-outline" size={18} color="#FFFFFF" />
              <Text style={styles.offButtonText}>Apagar todos</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.onButton, pressed && styles.offButtonPressed]}
              onPress={() => setHomePowerState("on")}
            >
              <Ionicons name="flash-outline" size={18} color="#FFFFFF" />
              <Text style={styles.offButtonText}>Encender todos</Text>
            </Pressable>
          </View>
        )}
      </>
    );
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          {
            paddingHorizontal: layout.gutter,
            paddingBottom: layout.screenBottom,
            paddingTop: layout.screenTop,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.content, { maxWidth: layout.contentWidth }]}>
          {openedHome ? renderHomeDetail() : renderHomeList()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const appFont = typography.fontFamily.emphasis;

const styles = StyleSheet.create({  accessButton: {
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D8E4F7",
    flexDirection: "row",
    gap: 9,
    justifyContent: "center",
    marginTop: 14,
    minHeight: 48,
    paddingHorizontal: 14,
  },
  accessButtonText: {
    flex: 1,
    fontFamily: appFont,
    fontSize: 13,
    fontWeight: "800",
  },
  bulkActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  onButton: {
    alignItems: "center",
    backgroundColor: GREEN,
    borderRadius: 12,
    flex: 1,
    flexDirection: "row",
    gap: 7,
    justifyContent: "center",
    minHeight: 46,
    paddingHorizontal: 12,
  },
  actionHint: {
    fontFamily: appFont,
    fontSize: 11,
    fontWeight: "600",
    marginTop: 8,
    textAlign: "center",
  },

  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    alignItems: "center",
    paddingBottom: 120,
  },
  content: {
    alignSelf: "center",
    width: "100%",
  },
  heroCard: {
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    width: "100%",
  },
  heroTitle: {
    color: "#FFFFFF",
    fontFamily: appFont,
    fontSize: 17,
    fontWeight: "800",
  },
  heroAmount: {
    color: "#FFFFFF",
    fontFamily: appFont,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 0,
    marginTop: 13,
  },
  heroAmountTiny: {
    fontSize: 24,
  },
  heroText: {
    color: "#FFFFFF",
    fontFamily: appFont,
    fontSize: 16,
    fontWeight: "800",
    marginTop: 20,
  },
  backRow: {
    alignItems: "center",
    alignSelf: "flex-start",
    flexDirection: "row",
    gap: 4,
    marginBottom: 14,
  },
  backText: {
    color: BLUE,
    fontFamily: appFont,
    fontSize: 16,
    fontWeight: "800",
  },
  addRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },
  addInput: {
    backgroundColor: "#FBFBFD",
    borderColor: "#DDE2F5",
    borderRadius: 12,
    borderWidth: 1,
    color: TEXT,
    flex: 1,
    fontFamily: appFont,
    fontSize: 15,
    fontWeight: "700",
    height: 48,
    paddingHorizontal: 14,
  },
  addButton: {
    alignItems: "center",
    backgroundColor: BLUE,
    borderRadius: 12,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  sectionHeader: {
    alignItems: "center",
    alignSelf: "stretch",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 23,
  },
  sectionTitle: {
    color: TEXT,
    flex: 1,
    fontFamily: appFont,
    fontSize: 17,
    fontWeight: "800",
  },
  sectionMeta: {
    color: MUTED,
    fontFamily: appFont,
    fontSize: 13,
    fontWeight: "700",
  },
  list: {
    alignSelf: "stretch",
    gap: 12,
    marginTop: 13,
  },
  homeCard: {
    alignItems: "center",
    backgroundColor: LILAC,
    borderRadius: 12,
    flexDirection: "row",
    minHeight: 74,
    paddingHorizontal: 14,
  },
  homeContent: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    minWidth: 0,
    paddingVertical: 8,
  },

  deviceContent: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    minWidth: 0,
  },

  deviceCard: {
    alignItems: "center",
    backgroundColor: "#FBFBFD",
    borderRadius: 12,
    flexDirection: "row",
    minHeight: 76,
    paddingHorizontal: 14,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 5,
    elevation: 5,
  },
  selectedCard: {
    borderColor: BLUE,
    borderWidth: 1.5,
  },
  itemIcon: {
    alignItems: "center",
    backgroundColor: "#EEF4FF",
    borderRadius: 24,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  itemIconOff: {
    backgroundColor: "#ECEFF5",
  },
  itemCopy: {
    flex: 1,
    marginLeft: 14,
    minWidth: 0,
  },
  itemTitle: {
    color: TEXT,
    fontFamily: appFont,
    fontSize: 17,
    fontWeight: "800",
  },
  itemSubtitle: {
    color: MUTED,
    fontFamily: appFont,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 4,
  },
  favoriteButton: {
    alignItems: "center",
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  homeAlertRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
    marginTop: 5,
  },

  homeAlertText: {
    fontFamily: appFont,
    fontSize: 12,
    fontWeight: "800",
  },

  deviceTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },

  deviceAlertText: {
    fontFamily: appFont,
    fontSize: 11,
    fontWeight: "800",
    marginTop: 3,
  },

  emptyCard: {
    alignItems: "center",
    backgroundColor: LILAC,
    borderRadius: 12,
    flexDirection: "row",
    gap: 10,
    minHeight: 66,
    paddingHorizontal: 14,
  },
  emptyText: {
    color: TEXT,
    flex: 1,
    fontFamily: appFont,
    fontSize: 14,
    fontWeight: "800",
  },
  detailAlertBox: {
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
    padding: 12,
  },

  detailAlertCopy: {
    flex: 1,
  },

  detailAlertTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },

  detailAlertTitle: {
    fontSize: 13,
    fontWeight: "900",
  },

  detailAlertDescription: {
    fontSize: 11,
    fontWeight: "600",
    lineHeight: 16,
    marginTop: 4,
  },

  resolveDetailButton: {
    alignItems: "center",
    alignSelf: "center",
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: "row",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },

  resolveDetailButtonText: {
    fontSize: 11,
    fontWeight: "900",
  },

  detailHero: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.035,
    shadowRadius: 10,
    elevation: 2,
  },
  detailHeroTop: {
    alignItems: "center",
    flexDirection: "row",
  },
  detailHomeIcon: {
    alignItems: "center",
    borderRadius: 15,
    height: 52,
    justifyContent: "center",
    width: 52,
  },
  detailHeroCopy: {
    flex: 1,
    marginHorizontal: 12,
    minWidth: 0,
  },
  detailHeroTitle: {
    fontFamily: appFont,
    fontSize: 21,
    fontWeight: "900",
  },
  detailHeroSubtitle: {
    fontFamily: appFont,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 3,
  },
  statusBadge: {
    alignItems: "center",
    borderRadius: 11,
    flexDirection: "row",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  statusDot: {
    borderRadius: 4,
    height: 7,
    width: 7,
  },
  statusBadgeText: {
    fontFamily: appFont,
    fontSize: 11,
    fontWeight: "900",
  },
  homeMetrics: {
    borderTopWidth: 1,
    flexDirection: "row",
    marginTop: 16,
    paddingTop: 14,
  },
  homeMetric: {
    flex: 1,
  },
  homeMetricValue: {
    fontFamily: appFont,
    fontSize: 18,
    fontWeight: "900",
  },
  homeMetricLabel: {
    fontFamily: appFont,
    fontSize: 10,
    fontWeight: "700",
    marginTop: 3,
  },

  detailCard: {
    alignSelf: "stretch",
    borderRadius: 20,
    marginTop: 16,
    padding: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.035,
    shadowRadius: 10,
    elevation: 2,
  },
  detailTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailTitle: {
    color: TEXT,
    flex: 1,
    fontFamily: appFont,
    fontSize: 18,
    fontWeight: "800",
  },
  statusPill: {
    borderRadius: 8,
    fontFamily: appFont,
    fontSize: 12,
    fontWeight: "800",
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusOn: {
    backgroundColor: "#D7FFE1",
    color: GREEN,
  },
  statusOff: {
    backgroundColor: "#FFE7E2",
    color: RED,
  },
  metricRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14,
  },
  metric: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    flex: 1,
    minHeight: 64,
    minWidth: 82,
    padding: 8,
  },
  metricValue: {
    color: TEXT,
    fontFamily: appFont,
    fontSize: 16,
    fontWeight: "800",
  },
  metricLabel: {
    color: MUTED,
    fontFamily: appFont,
    fontSize: 11,
    fontWeight: "700",
    marginTop: 5,
  },
  savingsInline: {
    color: TEXT,
    fontFamily: appFont,
    fontSize: 13,
    fontWeight: "800",
    marginTop: 12,
  },
  primaryButton: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: RED,
    borderRadius: 12,
    flexDirection: "row",
    gap: 8,
    height: 46,
    justifyContent: "center",
    marginTop: 16,
    width: 178,
  },
  powerOnButton: {
    backgroundColor: GREEN,
  },
  primaryButtonPressed: {
    opacity: 0.8,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontFamily: appFont,
    fontSize: 17,
    fontWeight: "800",
  },
  offButton: {
    alignItems: "center",
    backgroundColor: BLUE,
    borderRadius: 15,
    height: 50,
    justifyContent: "center",
    marginTop: 18,
    paddingHorizontal: 20,
  },
  offButtonPressed: {
    backgroundColor: "#004FA5",
  },
  offButtonText: {
    color: "#FFFFFF",
    fontFamily: appFont,
    fontSize: 18,
    fontWeight: "800",
  },

  pressed: {
    opacity: 0.7,
  },
});
