
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { bleAdapter } from "@/lib/pairing/ble-adapter";
import type { NearbyShelly } from "@/lib/pairing/pairing-types";
import type { ShellyDeviceInfo } from "@/lib/pairing/shelly-gatt-rpc";
import { useAppTheme } from "@/lib/theme/app-theme";
import { styles } from "./ShellyBleScanner.styles";

type Props = {
  canScan: boolean;
};

export function ShellyBleScanner({ canScan }: Props) {
  const theme = useAppTheme();

  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<NearbyShelly[]>([]);
  const [deviceInfo, setDeviceInfo] = useState<
    Record<string, ShellyDeviceInfo>
  >({});
  const [inspectingId, setInspectingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const scanRun = useRef(0);

  useEffect(() => {
    return () => {
      scanRun.current += 1;
      void bleAdapter.cancelDiscovery().catch(() => {});
    };
  }, []);

  async function startDiscovery() {
    if (!canScan || isScanning || inspectingId) return;

    const run = ++scanRun.current;
    setIsScanning(true);
    setDevices([]);
    setDeviceInfo({});
    setMessage(null);

    try {
      let permission = await bleAdapter.getPermissionStatus();

      if (permission !== "granted") {
        permission = await bleAdapter.requestPermission();
      }

      if (run !== scanRun.current) return;

      if (permission !== "granted") {
        setMessage(
          "Se requieren permisos de Bluetooth y ubicación para buscar equipos.",
        );
        return;
      }

      const results = await bleAdapter.discover(12000);

      if (run !== scanRun.current) return;

      setDevices(results);
      setMessage(
        results.length === 0
          ? "No se detectaron anuncios Shelly cercanos."
          : "Dispositivos detectados. Todavía no están vinculados.",
      );
    } catch (error) {
      if (run !== scanRun.current) return;

      setMessage(
        error instanceof Error
          ? error.message
          : "No se pudo buscar por Bluetooth.",
      );
    } finally {
      if (run === scanRun.current) {
        setIsScanning(false);
      }
    }
  }

  async function cancelDiscovery() {
    scanRun.current += 1;

    try {
      await bleAdapter.cancelDiscovery();
    } catch {
      // El escaneo puede haber finalizado.
    }

    setIsScanning(false);
    setMessage("Búsqueda cancelada.");
  }

  async function inspectDevice(deviceId: string) {
    if (!canScan || isScanning || inspectingId) return;

    setInspectingId(deviceId);
    setMessage(null);

    try {
      const info = await bleAdapter.inspectDevice(deviceId);

      setDeviceInfo((current) => ({
        ...current,
        [deviceId]: info,
      }));

      setMessage(
        "Información consultada por BLE. " +
        "Esta lectura no completa la vinculación.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "No se pudo consultar el Shelly.",
      );
    } finally {
      setInspectingId(null);
    }
  }

  return (
    <View>
      <Text style={[styles.description, { color: theme.muted }]}>
        Busca dispositivos Shelly cercanos mediante Bluetooth
        y consulta información del equipo por GATT.
        Esta función es experimental y de solo lectura.
      </Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Buscar dispositivos Shelly por Bluetooth"
        disabled={!canScan || isScanning || inspectingId !== null}
        onPress={() => void startDiscovery()}
        style={[
          styles.primaryButton,
          { backgroundColor: theme.blue },
          (!canScan || isScanning || inspectingId !== null) &&
            styles.disabled,
        ]}
      >
        {isScanning ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Ionicons
            name="bluetooth-outline"
            size={20}
            color="#FFFFFF"
          />
        )}

        <Text style={styles.primaryText}>
          {isScanning ? "Buscando..." : "Buscar por Bluetooth"}
        </Text>
      </Pressable>

      {isScanning && (
        <Pressable
          accessibilityRole="button"
          onPress={() => void cancelDiscovery()}
          style={styles.cancelButton}
        >
          <Text style={{ color: theme.blue }}>
            Cancelar búsqueda
          </Text>
        </Pressable>
      )}

      {!canScan && (
        <Text style={[styles.message, { color: theme.muted }]}>
          Solo el propietario puede iniciar la búsqueda.
        </Text>
      )}

      {message && (
        <Text style={[styles.message, { color: theme.muted }]}>
          {message}
        </Text>
      )}

      {devices.map((device) => {
        const info = deviceInfo[device.id];

        return (
          <View
            key={device.id}
            style={[
              styles.deviceRow,
              { borderColor: theme.borderLight },
            ]}
          >
            <Ionicons
              name="hardware-chip-outline"
              size={20}
              color={theme.blue}
            />

            <View style={styles.deviceDetails}>
              <Text style={[styles.deviceName, { color: theme.text }]}>
                {device.name ?? "Shelly"}
              </Text>

              <Text style={[styles.deviceMeta, { color: theme.muted }]}>
                {device.rssi == null
                  ? "Señal desconocida"
                  : `${device.rssi} dBm`}
                {" · Sin autenticar"}
              </Text>

              {info && (
                <Text style={[styles.deviceMeta, { color: theme.muted }]}>
                  {info.model ?? "Modelo desconocido"}
                  {" · Firmware "}
                  {info.ver ?? info.fw_id ?? "desconocido"}
                </Text>
              )}
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Consultar información BLE de ${device.name ?? "Shelly"}`}
              disabled={isScanning || inspectingId !== null}
              onPress={() => void inspectDevice(device.id)}
              style={[
                styles.inspectButton,
                { borderColor: theme.borderLight },
              ]}
            >
              {inspectingId === device.id ? (
                <ActivityIndicator size="small" color={theme.blue} />
              ) : (
                <Text style={{ color: theme.blue, fontSize: 12 }}>
                  Leer info
                </Text>
              )}
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}
