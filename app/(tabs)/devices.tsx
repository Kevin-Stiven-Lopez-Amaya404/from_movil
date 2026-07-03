import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { formatCOP } from "@/lib/formatters";
import { useAppTheme } from "@/lib/app-theme";
import { useResponsiveLayout } from "@/lib/responsive";
import { useSmartHome } from "@/lib/smart-home-context";

const BLUE = "#0864C8";
const TEXT = "#454545";
const LILAC = "#DDDDFB";
const GREEN = "#2AAF5D";
const RED = "#FF3B20";
const MUTED = "#6B7280";

export default function HomesScreen() {
  const layout = useResponsiveLayout();
  const theme = useAppTheme();

  // Estado global de hogares y dispositivos. Aqui vive la relacion hogar -> dispositivos.
  const {
    activeHomeId,
    addDeviceToHome,
    addHome,
    devices,
    homes,
    setActiveHomeId,
    setDeviceOnline,
    toggleDevice,
    toggleHomeFavorite,
  } = useSmartHome();

  // Estados locales para formularios y seleccion visual dentro de esta pantalla.
  const [homeName, setHomeName] = useState("");
  const [deviceName, setDeviceName] = useState("");
  const [openedHomeId, setOpenedHomeId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState("");

  // Determina el hogar que se muestra actualmente.
  const selectedHome = homes.find((home) => home.id === activeHomeId) ?? homes[0];
  const openedHome = homes.find((home) => home.id === openedHomeId) ?? null;
  const activeHome = openedHome ?? selectedHome;

  // Filtra dispositivos por homeId. Esta es la regla central: cada dispositivo pertenece a un hogar.
  const homeDevices = useMemo(
    () => (activeHome ? devices.filter((device) => device.homeId === activeHome.id) : []),
    [activeHome, devices],
  );
  const selectedDevice = homeDevices.find((device) => device.id === selectedId) ?? homeDevices[0];
  const onlineCount = homeDevices.filter((device) => device.online).length;

  // Calculo simulado de ahorro mensual para mostrar una metrica util al usuario.
  const monthlySavings = useMemo(() => {
    const savedKwh = homeDevices.reduce((total, device) => {
      const saved = Math.max(device.yesterday - (device.online ? device.consumption : 0), 0);
      return total + saved;
    }, 0);

    return Math.max(50000, Math.round(savedKwh * 30 * 9500));
  }, [homeDevices]);

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
  function turnOffHome() {
    homeDevices.forEach((device) => setDeviceOnline(device.id, false));
    Alert.alert("Hogar apagado", `Se apagaron los dispositivos de ${activeHome?.name ?? "este hogar"}.`);
  }

  /**
   * Vista de lista de hogares.
   * Se separa en funcion para no mezclarla con el detalle del hogar.
   */
  function renderHomeList() {
    return (
      <>
        <View style={[styles.heroCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.heroTitle, { color: theme.text }]}>Hogares</Text>
          <Text style={[styles.heroAmount, layout.tiny && styles.heroAmountTiny]}>
            {homes.length} registrados
          </Text>
          <Text style={[styles.heroText, { color: theme.muted }]}>Selecciona un hogar para ver y registrar sus dispositivos.</Text>
        </View>

        <View style={styles.addRow}>
          <TextInput
            style={[styles.addInput, { backgroundColor: theme.row, borderColor: theme.border, color: theme.text }]}
            placeholder="Nombre del hogar"
            placeholderTextColor={MUTED}
            value={homeName}
            onChangeText={setHomeName}
          />
          <Pressable style={styles.addButton} onPress={handleAddHome}>
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </Pressable>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Hogares registrados</Text>
          <Text style={[styles.sectionMeta, { color: theme.muted }]}>{homes.length} items</Text>
        </View>

        <View style={styles.list}>
          {homes.map((home) => {
            const count = devices.filter((device) => device.homeId === home.id).length;

            return (
              <Pressable key={home.id} style={[styles.homeCard, { backgroundColor: theme.row }]} onPress={() => openHome(home.id)}>
                <View style={[styles.itemIcon, { backgroundColor: theme.rowAlt }]}>
                  <MaterialCommunityIcons name="home-city-outline" size={31} color={BLUE} />
                </View>
                <View style={styles.itemCopy}>
                  <Text style={[styles.itemTitle, { color: theme.text }]}>{home.name}</Text>
                  <Text style={[styles.itemSubtitle, { color: theme.muted }]}>{count} dispositivos · {home.location}</Text>
                </View>
                <Pressable
                  accessibilityLabel={home.favorite ? "Quitar de favoritos" : "Agregar a favoritos"}
                  onPress={() => toggleHomeFavorite(home.id)}
                  style={styles.favoriteButton}
                >
                  <Ionicons name={home.favorite ? "star" : "star-outline"} size={25} color={home.favorite ? "#F5B400" : MUTED} />
                </Pressable>
              </Pressable>
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

        <View style={[styles.heroCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.heroTitle, { color: theme.text }]}>{activeHome.name}</Text>
          <Text style={[styles.heroAmount, layout.tiny && styles.heroAmountTiny]}>
            {onlineCount} activos
          </Text>
          <Text style={[styles.heroText, { color: theme.muted }]}>{homeDevices.length} dispositivos registrados en este hogar.</Text>
        </View>

        <View style={styles.addRow}>
          <TextInput
            style={[styles.addInput, { backgroundColor: theme.row, borderColor: theme.border, color: theme.text }]}
            placeholder="Nombre del dispositivo"
            placeholderTextColor={MUTED}
            value={deviceName}
            onChangeText={setDeviceName}
          />
          <Pressable style={styles.addButton} onPress={handleAddDevice}>
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </Pressable>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Dispositivos de {activeHome.name}</Text>
          <Text style={[styles.sectionMeta, { color: theme.muted }]}>{homeDevices.length} items</Text>
        </View>

        <View style={styles.list}>
          {homeDevices.map((device) => (
            <Pressable
              key={device.id}
              style={[
                styles.deviceCard,
                { backgroundColor: theme.row },
                selectedDevice?.id === device.id && styles.selectedCard,
              ]}
              onPress={() => setSelectedId(device.id)}
            >
              <View style={[styles.itemIcon, { backgroundColor: theme.rowAlt }, !device.online && styles.itemIconOff]}>
                <MaterialCommunityIcons name={device.icon as never} size={35} color={device.online ? BLUE : MUTED} />
              </View>
              <View style={styles.itemCopy}>
                <Text style={[styles.itemTitle, { color: theme.text }]}>{device.name}</Text>
                <Text style={[styles.itemSubtitle, { color: theme.muted }]}>
                  {device.room} · {device.online ? `${device.consumption.toFixed(2)} kWh` : "Apagado"}
                </Text>
              </View>
              <Switch
                value={device.online}
                onValueChange={() => toggleDevice(device.id)}
                trackColor={{ false: "#CDD2E4", true: "#BDE8CB" }}
                thumbColor={device.online ? GREEN : "#FFFFFF"}
              />
            </Pressable>
          ))}

          {!homeDevices.length && (
            <View style={[styles.emptyCard, { backgroundColor: theme.card }]}>
              <MaterialCommunityIcons name="power-plug-outline" size={32} color={BLUE} />
              <Text style={[styles.emptyText, { color: theme.muted }]}>Este hogar todavía no tiene dispositivos.</Text>
            </View>
          )}
        </View>

        {selectedDevice && (
          <View style={[styles.detailCard, { backgroundColor: theme.card }]}>
            <View style={styles.detailTop}>
              <Text style={[styles.detailTitle, { color: theme.text }]}>{selectedDevice.name}</Text>
              <Text style={[styles.statusPill, selectedDevice.online ? styles.statusOn : styles.statusOff]}>
                {selectedDevice.online ? "Encendido" : "Apagado"}
              </Text>
            </View>
            <View style={styles.metricRow}>
              <View style={styles.metric}>
                <Text style={[styles.metricValue, { color: theme.text }]}>{selectedDevice.consumption.toFixed(2)}</Text>
                <Text style={[styles.metricLabel, { color: theme.muted }]}>kWh hoy</Text>
              </View>
              <View style={styles.metric}>
                <Text style={[styles.metricValue, { color: theme.text }]}>{selectedDevice.yesterday.toFixed(2)}</Text>
                <Text style={[styles.metricLabel, { color: theme.muted }]}>kWh ayer</Text>
              </View>
              <View style={styles.metric}>
                <Text style={[styles.metricValue, { color: theme.text }]}>{selectedDevice.room}</Text>
                <Text style={styles.metricLabel}>Ubicación</Text>
              </View>
            </View>
            <Text style={[styles.savingsInline, { color: theme.blue }]}>Ahorro estimado: {formatCOP(monthlySavings)} / mes</Text>
            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                !selectedDevice.online && styles.powerOnButton,
                pressed && styles.primaryButtonPressed,
              ]}
              onPress={() => toggleDevice(selectedDevice.id)}
            >
              <Ionicons name={selectedDevice.online ? "power-outline" : "flash-outline"} size={22} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>{selectedDevice.online ? "Apagar" : "Encender"}</Text>
            </Pressable>
          </View>
        )}

        {!!homeDevices.length && (
          <Pressable style={({ pressed }) => [styles.offButton, pressed && styles.offButtonPressed]} onPress={turnOffHome}>
            <Text style={styles.offButtonText}>Apagar hogar</Text>
          </Pressable>
        )}
      </>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
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

const appFont = "sans-serif-medium";

const styles = StyleSheet.create({
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
    backgroundColor: BLUE,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 17,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.24,
    shadowRadius: 5,
    elevation: 8,
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
  detailCard: {
    alignSelf: "stretch",
    backgroundColor: LILAC,
    borderRadius: 14,
    marginTop: 18,
    padding: 14,
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
});
