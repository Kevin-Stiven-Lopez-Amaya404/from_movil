import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Text, View } from "react-native";

import type { DeviceConsumptionRankingResult } from "@/lib/services/device-consumption-ranking";
import { useAppTheme } from "@/lib/theme/app-theme";
import { styles } from "./DeviceConsumptionRankingCard.styles";

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
