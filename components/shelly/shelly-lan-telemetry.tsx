import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import {
  readShellyLocalTelemetry,
  type ShellyLocalTelemetry,
} from "@/lib/pairing/shelly-local-telemetry";
import { useAppTheme } from "@/lib/theme/app-theme";

const REFRESH_MS = 10_000;
const TIMEOUT_MS = 6_000;

type Props = {
  ip: string;
  expectedId: string;
};

export function ShellyLanTelemetry({ ip, expectedId }: Props) {
  const theme = useAppTheme();
  const [reading, setReading] = useState<ShellyLocalTelemetry | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef<AbortController | null>(null);

  const refresh = useCallback(async () => {
    if (inFlight.current) return;
    const controller = new AbortController();
    inFlight.current = controller;
    setLoading(true);
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const next = await readShellyLocalTelemetry(ip, expectedId, controller.signal);
      if (inFlight.current === controller && !controller.signal.aborted) {
        setReading(next);
        setError(null);
      }
    } catch (reason) {
      if (inFlight.current === controller) {
        setError(
          controller.signal.aborted
            ? "La lectura LAN supero el tiempo de espera."
            : reason instanceof Error
              ? reason.message
              : "No se pudo leer el Shelly por la red local.",
        );
      }
    } finally {
      clearTimeout(timeout);
      if (inFlight.current === controller) {
        inFlight.current = null;
        setLoading(false);
      }
    }
  }, [ip, expectedId]);

  useFocusEffect(
    useCallback(() => {
      setReading(null);
      setError(null);
      void refresh();
      const interval = setInterval(() => void refresh(), REFRESH_MS);
      return () => {
        clearInterval(interval);
        inFlight.current?.abort();
        inFlight.current = null;
      };
    }, [refresh]),
  );

  const metric = (n: number) => n.toLocaleString("es-CO", { maximumFractionDigits: 2 });

  return (
    <View
      style={{
        marginTop: 18,
        padding: 16,
        gap: 12,
        backgroundColor: theme.card,
        borderColor: theme.borderLight,
        borderWidth: 1,
        borderRadius: 14,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <View style={{ flex: 1, gap: 3 }}>
          <Text style={{ color: theme.text, fontWeight: "800", fontSize: 16 }}>
            Lectura del Shelly en vivo
          </Text>
          <Text style={{ color: theme.muted, fontSize: 12 }}>
            Modo de demostracion LAN - sin vinculacion definitiva
          </Text>
        </View>
        {loading ? <ActivityIndicator color={theme.blue} /> : <Ionicons name="wifi" color={theme.blue} size={22} />}
      </View>

      {reading ? (
        <>
          <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 10 }}>
            <View style={{ flex: 1, padding: 12, backgroundColor: theme.rowAlt, borderRadius: 10 }}>
              <Text style={{ color: theme.muted, fontSize: 12 }}>Potencia actual</Text>
              <Text style={{ color: theme.text, fontWeight: "800", fontSize: 20 }}>
                {metric(reading.activePowerWatts)} W
              </Text>
            </View>
            <View style={{ flex: 1, padding: 12, backgroundColor: theme.rowAlt, borderRadius: 10 }}>
              <Text style={{ color: theme.muted, fontSize: 12 }}>Energia local acumulada</Text>
              <Text style={{ color: theme.text, fontWeight: "800", fontSize: 20 }}>
                {metric(reading.totalEnergyWh)} Wh
              </Text>
            </View>
          </View>
          <Text style={{ color: theme.text }}>
            Rele: <Text style={{ fontWeight: "800" }}>{reading.output ? "Encendido" : "Apagado"}</Text>
          </Text>
          <Text style={{ color: theme.muted, fontSize: 12 }}>
            Lectura local: {new Date(reading.measuredAt).toLocaleTimeString()}
          </Text>
        </>
      ) : (
        <Text style={{ color: theme.muted }}>
          {loading ? "Consultando el equipo fisico..." : "Todavia no hay una lectura valida."}
        </Text>
      )}

      {error ? <Text style={{ color: theme.danger, fontSize: 12 }}>{error}</Text> : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Actualizar lectura LAN del Shelly"
        disabled={loading}
        onPress={() => void refresh()}
        style={{
          borderWidth: 1,
          borderColor: theme.blue,
          paddingVertical: 11,
          paddingHorizontal: 14,
          borderRadius: 10,
          opacity: loading ? 0.6 : 1,
          alignItems: "center",
        }}
      >
        <Text style={{ color: theme.blue, fontWeight: "700" }}>Actualizar lectura</Text>
      </Pressable>
    </View>
  );
}
