import { Ionicons } from "@expo/vector-icons";
import { ConnectionMethodCard } from "@/components/devices/ConnectionMethodCard";
import {
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useSmartHome } from "@/lib/context/smart-home-context";
import { useAndroidBackFallback } from "@/lib/navigation/use-android-back-fallback";
import {
  cancelLocalShellyDiscovery,
  discoverLocalShelly,
  type LocalShellyCandidate,
} from "@/lib/pairing/local-shelly-discovery";
import { useResponsiveLayout } from "@/lib/responsive/responsive";
import { useAppTheme } from "@/lib/theme/app-theme";

export default function AddDeviceScreen() {
  const router = useRouter();
  const { homeId, returnTo } = useLocalSearchParams<{
    homeId?: string;
    returnTo?: string;
  }>();
  const { accessibleHomes, homesLoadStatus } = useSmartHome();
  const theme = useAppTheme();
  const layout = useResponsiveLayout();
  const selectedHome = accessibleHomes.find((home) => home.id === homeId);
  const canAddDevice = selectedHome?.homeRole === "OWNER";

  useAndroidBackFallback(
    returnTo !== "home-detail",
    homeId
      ? { pathname: "/(tabs)/home-detail", params: { homeId } }
      : "/(tabs)/devices",
  );

  useEffect(() => {
    if (homeId && homesLoadStatus === "loaded" && !selectedHome) {
      router.replace("/(tabs)/(main)/homes");
    }
  }, [homeId, homesLoadStatus, router, selectedHome]);

  const [wifiSearching, setWifiSearching] = useState(false);
  const [wifiSearched, setWifiSearched] = useState(false);
  const [wifiCandidates, setWifiCandidates] =
    useState<LocalShellyCandidate[]>([]);
  const [wifiError, setWifiError] = useState<string | null>(null);
  const wifiScanRun = useRef(0);
  const [connectionMethod, setConnectionMethod] =
    useState<"wifi" | "ip" | "ble">("wifi");
  const [manualIp, setManualIp] = useState("");

  async function searchLocalWifi() {
    if (!canAddDevice || wifiSearching) return;

    const run = ++wifiScanRun.current;

    setWifiSearching(true);
    setWifiSearched(false);
    setWifiCandidates([]);
    setWifiError(null);

    try {
      const results = await discoverLocalShelly(12000);

      if (run !== wifiScanRun.current) return;

      setWifiCandidates(results);
      setWifiSearched(true);
    } catch (error) {
      if (run !== wifiScanRun.current) return;

      setWifiError(
        error instanceof Error
          ? error.message
          : "No se pudo realizar la búsqueda Wi-Fi.",
      );
    } finally {
      if (run === wifiScanRun.current) {
        setWifiSearching(false);
      }
    }
  }

  function closeScreen() {
    if (returnTo === "home-detail" && router.canGoBack()) {
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
        wifiScanRun.current += 1;
        cancelLocalShellyDiscovery();
        setWifiSearching(false);
      };
    }, []),
  );

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
    >
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: layout.gutter,
          paddingTop: layout.screenTop,
          paddingBottom: layout.screenBottom,
        }}
      >
        <View style={[styles.content, { maxWidth: layout.contentWidth }]}>
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
              <Ionicons name="close" size={21} color={theme.text} />
            </Pressable>
          </View>

          {canAddDevice && homeId ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Configurar Shelly nuevo"
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/shelly-setup",
                  params: { homeId, from: "add-device" },
                })
              }
              style={[
                styles.card,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.borderLight,
                  marginBottom: 14,
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 16,
                  gap: 12,
                },
              ]}
            >
              <Ionicons
                name="hardware-chip-outline"
                size={27}
                color={theme.blue}
              />

              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: theme.text,
                    fontSize: 15,
                    fontWeight: "800",
                  }}
                >
                  Configurar Shelly nuevo
                </Text>

                <Text
                  style={{
                    color: theme.muted,
                    fontSize: 12,
                    marginTop: 5,
                  }}
                >
                  {"Sin configuraci\u00f3n previa"}
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={20}
                color={theme.muted}
              />
            </Pressable>
          ) : null}

          <ConnectionMethodCard
            title="Buscar en mi red Wi-Fi"
            description="Descubrimiento autom\u00e1tico"
            icon="wifi-outline"
            expanded={connectionMethod === "wifi"}
            onPress={() => setConnectionMethod("wifi")}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Buscar Shelly en la red local"
              disabled={!canAddDevice || wifiSearching}
              onPress={() => void searchLocalWifi()}
              style={[
                styles.primaryButton,
                { backgroundColor: theme.blue },
                (!canAddDevice || wifiSearching) && styles.disabled,
              ]}
            >
              {wifiSearching ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Ionicons
                  name="wifi-outline"
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

            {!canAddDevice ? (
              <Text style={[styles.scanMessage, { color: theme.muted }]}>
                Solo el propietario del hogar puede iniciar la búsqueda de
                dispositivos.
              </Text>
            ) : null}

            {wifiError ? (
              <Text style={[styles.scanMessage, { color: theme.danger }]}>
                {wifiError}
              </Text>
            ) : null}

            {wifiSearched && wifiCandidates.length === 0 ? (
              <Text style={[styles.scanMessage, { color: theme.muted }]}>
                No se detectaron dispositivos Shelly. Comprueba la conexión
                Wi-Fi y que el router permita descubrir equipos locales.
              </Text>
            ) : null}

            {wifiCandidates.map((device) => (
              <View
                key={device.ip}
                style={[
                  styles.deviceRow,
                  { borderColor: theme.borderLight },
                ]}
              >
                <Ionicons
                  name="hardware-chip-outline"
                  size={23}
                  color={theme.blue}
                />

                <View style={styles.deviceDetails}>
                  <Text style={[styles.deviceName, { color: theme.text }]}>
                    {device.name}
                  </Text>

                  <Text style={[styles.deviceMeta, { color: theme.muted }]}>
                    IP local: {device.ip}
                  </Text>

                  <Text style={[styles.deviceMeta, { color: theme.muted }]}>
                    Detectado por mDNS · Sin verificar
                  </Text>
                </View>
              </View>
            ))}
          </ConnectionMethodCard>

          <ConnectionMethodCard
            title="Agregar mediante IP"
            description="Conexi\u00f3n manual"
            icon="git-network-outline"
            expanded={connectionMethod === "ip"}
            onPress={() => setConnectionMethod("ip")}
          >
            <Text style={[styles.cardText, { color: theme.muted }]}>
              {"Introduce la direcci\u00f3n IPv4 local de tu dispositivo Shelly."}
            </Text>

            <TextInput
              accessibilityLabel="Direcci\u00f3n IP del Shelly"
              keyboardType="decimal-pad"
              autoCapitalize="none"
              autoCorrect={false}
              value={manualIp}
              onChangeText={setManualIp}
              placeholder="Ej. 192.168.1.50"
              placeholderTextColor={theme.muted}
              style={{
                marginTop: 14,
                borderWidth: 1,
                borderColor: theme.borderLight,
                borderRadius: 12,
                backgroundColor: theme.background,
                color: theme.text,
                paddingHorizontal: 14,
                height: 48,
                fontSize: 15,
              }}
            />

            <Text style={[styles.cardText, { color: theme.muted }]}>
              {"La conexi\u00f3n e identificaci\u00f3n local mediante IP se integrar\u00e1n en el siguiente paso. Introducir la IP todav\u00eda no vincula el dispositivo."}
            </Text>
          </ConnectionMethodCard>

          <ConnectionMethodCard
            title="Buscar por Bluetooth"
            description="Detecci\u00f3n experimental"
            icon="bluetooth-outline"
            expanded={connectionMethod === "ble"}
            onPress={() => setConnectionMethod("ble")}
          >
            <Text style={[styles.cardText, { color: theme.muted }]}>
              La vinculación de dispositivos Shelly mediante Bluetooth
              todavía no está disponible en esta versión.
            </Text>
            <Pressable
              disabled
              accessibilityRole="button"
              accessibilityState={{ disabled: true }}
              accessibilityLabel="Vinculación Bluetooth no disponible"
              style={[
                styles.primaryButton,
                { backgroundColor: theme.blue },
                styles.disabled,
              ]}
            >
              <Ionicons name="bluetooth-outline" size={20} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>
                Vinculación BLE no disponible
              </Text>
            </Pressable>
          </ConnectionMethodCard>

          <View style={[styles.infoCard, { backgroundColor: theme.rowAlt }]}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color={theme.blue}
            />
            <Text style={[styles.infoText, { color: theme.muted }]}>
              Esta función requiere completar la integración de vinculación con
              el backend y el soporte BLE nativo en Android. Los dispositivos
              ya registrados se gestionan desde el hogar.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { alignSelf: "center", width: "100%" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 22,
    minHeight: 44,
  },
  title: {
    flex: 1,
    fontSize: 23,
    fontWeight: "900",
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  card: { borderRadius: 18, borderWidth: 1, padding: 18 },
  cardTitle: { fontSize: 16, fontWeight: "800" },
  cardText: { fontSize: 13, lineHeight: 19, marginTop: 8 },
  scanMessage: { fontSize: 12, lineHeight: 18, marginTop: 12 },
  deviceRow: {
    alignItems: "center",
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
    paddingTop: 12,
  },
  deviceDetails: { flex: 1 },
  deviceName: { fontSize: 13, fontWeight: "800" },
  deviceMeta: { fontSize: 11, lineHeight: 16, marginTop: 3 },
  primaryButton: {
    alignItems: "center",
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 18,
    paddingVertical: 13,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    marginLeft: 8,
  },
  infoCard: {
    borderRadius: 14,
    flexDirection: "row",
    marginTop: 16,
    padding: 14,
  },
  infoText: { flex: 1, fontSize: 12, lineHeight: 18, marginLeft: 8 },
  disabled: { opacity: 0.6 },
  pressed: { opacity: 0.75 },
});
