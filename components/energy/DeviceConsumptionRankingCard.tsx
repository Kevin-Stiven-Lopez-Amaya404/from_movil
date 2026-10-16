import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";

import type { DeviceConsumptionRankingResult } from "@/lib/services/device-consumption-ranking";
import { useAppTheme } from "@/lib/theme/app-theme";

type Props = {
  period: string;
  loading: boolean;
  error: string | null;
  data: DeviceConsumptionRankingResult | null;
};

function formatEnergy(kwh: number) {
  if (kwh < 1) {
    return `${(kwh * 1000).toLocaleString("es-CO", {
      maximumFractionDigits: 2,
    })} Wh`;
  }

  return `${kwh.toLocaleString("es-CO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 3,
  })} kWh`;
}

export function DeviceConsumptionRankingCard({
  period,
  loading,
  error,
  data,
}: Props) {
  const theme = useAppTheme();
  const items = data?.topDevices ?? [];

  const maxValue = Math.max(
    0,
    ...items.map((item) => item.totalEnergyDeltaKwh),
  );

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.borderLight,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: theme.text }]}>
            Mayor consumo
          </Text>

          <Text style={[styles.subtitle, { color: theme.muted }]}>
            Hasta 5 dispositivos · {period}
          </Text>
        </View>

        <Ionicons
          name="stats-chart-outline"
          size={22}
          color={theme.blue}
        />
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={theme.blue} />
          <Text style={{ color: theme.muted, fontSize: 12 }}>
            Consultando dispositivos...
          </Text>
        </View>
      ) : error ? (
        <Text style={{ color: theme.danger, fontSize: 13 }}>
          {error}
        </Text>
      ) : items.length === 0 ? (
        <Text style={{ color: theme.muted, fontSize: 13 }}>
          {data?.deviceCount === 0
            ? "Este hogar todavía no tiene dispositivos."
            : data?.measuredDeviceCount === 0
              ? "No hay mediciones disponibles en este período."
              : "No se registró consumo positivo en este período."}
        </Text>
      ) : (
        <>
          {items.map((device, index) => {
            const percentage =
              maxValue > 0
                ? (device.totalEnergyDeltaKwh / maxValue) * 100
                : 0;

            return (
              <View key={device.deviceId} style={styles.device}>
                <View style={styles.deviceHeader}>
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.deviceName,
                      { color: theme.text },
                    ]}
                  >
                    {index + 1}. {device.deviceName}
                  </Text>

                  <Text
                    style={[
                      styles.deviceEnergy,
                      { color: theme.text },
                    ]}
                  >
                    {formatEnergy(device.totalEnergyDeltaKwh)}
                  </Text>
                </View>

                <View
                  style={[
                    styles.track,
                    { backgroundColor: theme.rowAlt },
                  ]}
                >
                  <View
                    style={[
                      styles.progress,
                      {
                        backgroundColor: theme.blue,
                        width: `${percentage}%` as `${number}%`,
                      },
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
    gap: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 12,
    marginTop: 5,
  },
  loading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
  },
  device: {
    marginBottom: 17,
  },
  deviceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    marginBottom: 9,
  },
  deviceName: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
  },
  deviceEnergy: {
    fontSize: 12,
    fontWeight: "800",
  },
  track: {
    height: 8,
    borderRadius: 99,
    overflow: "hidden",
  },
  progress: {
    height: "100%",
    borderRadius: 99,
  },
});
