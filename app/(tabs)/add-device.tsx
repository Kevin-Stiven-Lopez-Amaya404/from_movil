import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { bleAdapter } from "@/lib/pairing/ble-adapter";
import type { NearbyShelly } from "@/lib/pairing/pairing-types";
import { useResponsiveLayout } from "@/lib/responsive/responsive";
import { useAppTheme } from "@/lib/theme/app-theme";

export default function AddDeviceScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const layout = useResponsiveLayout();
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<NearbyShelly[]>([]);
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const scanRun = useRef(0);

  useEffect(
    () => () => {
      scanRun.current += 1;
      void bleAdapter.cancelDiscovery();
    },
    [],
  );

  async function startDiscovery() {
    const run = ++scanRun.current;
    setIsScanning(true);
    setDevices([]);
    setScanMessage(null);
    try {
      let permission = await bleAdapter.getPermissionStatus();
      if (permission !== "granted") {
        permission = await bleAdapter.requestPermission();
      }
      if (run !== scanRun.current) return;
      if (permission !== "granted") {
        setScanMessage("No se concedieron los permisos necesarios para buscar por Bluetooth.");
        return;
      }

      const discovered = await bleAdapter.discover(12_000);
      if (run !== scanRun.current) return;
      setDevices(discovered);
      setScanMessage(
        discovered.length === 0
          ? "No se detectaron anuncios Shelly. Verifica que el dispositivo esté cerca y en su ventana de provisión."
          : "Búsqueda terminada. Estos anuncios son candidatos; el nombre y la señal no autentican el dispositivo.",
      );
    } catch (error) {
      if (run !== scanRun.current) return;
      setScanMessage(
        error instanceof Error ? error.message : "No se pudo iniciar la búsqueda BLE.",
      );
    } finally {
      if (run === scanRun.current) setIsScanning(false);
    }
  }

  async function cancelDiscovery() {
    scanRun.current += 1;
    await bleAdapter.cancelDiscovery();
    setIsScanning(false);
    setScanMessage("Búsqueda cancelada.");
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: layout.gutter,
          paddingTop: layout.screenTop,
          paddingBottom: layout.screenBottom,
        }}
      >
        <View style={[styles.content, { maxWidth: layout.contentWidth }]}>
          <Pressable
            onPress={() => {
              if (router.canGoBack()) router.back();
              else router.replace("/(tabs)/devices");
            }}
            style={({ pressed }) => [
              styles.backButton,
              { backgroundColor: theme.card, borderColor: theme.borderLight },
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="chevron-back" size={18} color={theme.blue} />
            <Text style={[styles.backText, { color: theme.blue }]}>Volver</Text>
          </Pressable>

          <View style={styles.header}>
            <View style={[styles.iconWrap, { backgroundColor: theme.rowAlt }]}>
              <Ionicons name="hardware-chip-outline" size={30} color={theme.blue} />
            </View>
            <Text style={[styles.title, { color: theme.text }]}>Agregar dispositivo</Text>
            <Text style={[styles.subtitle, { color: theme.muted }]}>
              POC Android de descubrimiento BLE para Shelly 1PM Gen4.
            </Text>
          </View>

          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.borderLight }]}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Buscar anuncios cercanos</Text>
            <Text style={[styles.cardText, { color: theme.muted }]}>
              Esta prueba solo escanea anuncios con nombre Shelly. No crea una sesión, no conecta ni cambia la configuración del dispositivo.
            </Text>
            <Pressable
              disabled={isScanning}
              onPress={() => void startDiscovery()}
              accessibilityRole="button"
              accessibilityState={{ disabled: isScanning }}
              accessibilityLabel="Buscar anuncios Shelly por Bluetooth"
              style={({ pressed }) => [
                styles.primaryButton,
                { backgroundColor: theme.blue },
                pressed && !isScanning && styles.pressed,
                isScanning && styles.disabled,
              ]}
            >
              {isScanning ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Ionicons name="bluetooth-outline" size={20} color="#FFFFFF" />
              )}
              <Text style={styles.primaryButtonText}>
                {isScanning ? "Buscando…" : "Buscar dispositivos Shelly"}
              </Text>
            </Pressable>
            {isScanning && (
              <Pressable onPress={() => void cancelDiscovery()} style={styles.cancelButton}>
                <Text style={[styles.cancelText, { color: theme.blue }]}>Cancelar búsqueda</Text>
              </Pressable>
            )}
            {scanMessage && (
              <Text style={[styles.scanMessage, { color: theme.muted }]}>{scanMessage}</Text>
            )}
            {devices.map((device) => (
              <View key={device.id} style={[styles.deviceRow, { borderColor: theme.borderLight }]}>
                <Ionicons name="hardware-chip-outline" size={20} color={theme.blue} />
                <View style={styles.deviceDetails}>
                  <Text style={[styles.deviceName, { color: theme.text }]}>{device.name}</Text>
                  <Text style={[styles.deviceMeta, { color: theme.muted }]}>
                    {device.rssi == null ? "Señal desconocida" : `Señal ${device.rssi} dBm`} · candidato sin autenticar
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <View style={[styles.infoCard, { backgroundColor: theme.rowAlt }]}>
            <Ionicons name="information-circle-outline" size={20} color={theme.blue} />
            <Text style={[styles.infoText, { color: theme.muted }]}>
              BLE RPC, bonding, provisión Wi-Fi/MQTT y alta en backend siguen pendientes de validación. El nombre y la señal no demuestran identidad ni posesión.
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
  backButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    marginBottom: 28,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  backText: { fontSize: 13, fontWeight: "800", marginLeft: 6 },
  header: { alignItems: "center", marginBottom: 24 },
  iconWrap: {
    alignItems: "center",
    borderRadius: 22,
    height: 72,
    justifyContent: "center",
    marginBottom: 14,
    width: 72,
  },
  title: { fontSize: 22, fontWeight: "900", textAlign: "center" },
  subtitle: { fontSize: 13, lineHeight: 19, marginTop: 8, textAlign: "center" },
  card: { borderRadius: 18, borderWidth: 1, padding: 18 },
  cardTitle: { fontSize: 16, fontWeight: "800" },
  cardText: { fontSize: 13, lineHeight: 19, marginTop: 8 },
  primaryButton: {
    alignItems: "center",
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 18,
    paddingVertical: 13,
  },
  primaryButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800", marginLeft: 8 },
  cancelButton: { alignSelf: "center", marginTop: 14, padding: 8 },
  cancelText: { fontSize: 13, fontWeight: "700" },
  scanMessage: { fontSize: 12, lineHeight: 18, marginTop: 14 },
  deviceRow: { alignItems: "center", borderTopWidth: 1, flexDirection: "row", marginTop: 14, paddingTop: 14 },
  deviceDetails: { flex: 1, marginLeft: 10 },
  deviceName: { fontSize: 14, fontWeight: "800" },
  deviceMeta: { fontSize: 11, marginTop: 4 },
  infoCard: { borderRadius: 14, flexDirection: "row", marginTop: 16, padding: 14 },
  infoText: { flex: 1, fontSize: 12, lineHeight: 18, marginLeft: 8 },
  disabled: { opacity: 0.6 },
  pressed: { opacity: 0.75 },
});
