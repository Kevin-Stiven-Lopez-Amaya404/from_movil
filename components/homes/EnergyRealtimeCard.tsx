import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

import type { AppTheme } from "@/lib/theme/app-theme";
import { styles } from "./EnergyRealtimeCard.styles";


type EnergyRealtimeCardProps = {
  status: "online" | "partial" | "offline" | "unknown";
  power: number | null;
  theme: AppTheme;
};

const statusLabels = {
  online: "En línea",
  partial: "Datos parciales",
  offline: "Sin conexión",
  unknown: "Estado desconocido",
} as const;

export function EnergyRealtimeCard({
  status,
  power,
  theme,
}: EnergyRealtimeCardProps) {
  const powerInKw = power === null ? "—" : (power / 1000).toFixed(2);
  const statusLabel = statusLabels[status];
  const statusColor =
    status === "online"
      ? theme.success
      : status === "partial" || status === "offline"
        ? theme.warning
        : theme.muted;
  const accessibilitySummary = power === null
    ? "Lectura actual de potencia no disponible."
    : `Potencia actual del hogar: ${power} vatios.`;

  return (
    <View
      accessible
      accessibilityRole="summary"
      accessibilityLabel={`Consumo en tiempo real. ${accessibilitySummary} ${statusLabel}.`}
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.borderLight,
          shadowColor: theme.shadowColor,
        },
      ]}
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.text }]}>
            Consumo en tiempo real
          </Text>
          <Text style={[styles.subtitle, { color: theme.muted }]}>
            {power === null
              ? "Lectura disponible cuando se confirme la conexión"
              : "Potencia actual del hogar"}
          </Text>
        </View>
        <View
          style={[
            styles.onlineBadge,
            {
              backgroundColor:
                status === "online" ? theme.successSoft : theme.rowAlt,
            },
          ]}
        >
          <View
            style={[
              styles.onlineDot,
              { backgroundColor: statusColor },
            ]}
          />
          <Text
            style={[
              styles.onlineText,
              { color: statusColor },
            ]}
          >
            {statusLabel}
          </Text>
        </View>
      </View>

      <View style={styles.gaugeArea}>
        <Svg width={220} height={220} viewBox="0 0 220 220">
          <Circle
            cx="110"
            cy="110"
            r="84"
            fill="none"
            stroke={theme.chartGrid}
            strokeWidth="12"
          />
          <Circle
            cx="110"
            cy="110"
            r="84"
            fill="none"
            stroke={theme.blue}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray="528"
            strokeDashoffset={power !== null && power > 0 ? "210" : "528"}
            transform="rotate(-90 110 110)"
          />
        </Svg>
        <View style={styles.gaugeValue}>
          <Ionicons name="flash" size={32} color={theme.blue} />
          <Text style={[styles.value, { color: theme.text }]}>{powerInKw}</Text>
          <Text style={[styles.unit, { color: theme.muted }]}>kW</Text>
        </View>
      </View>

      <View style={styles.statusRow}>
        <View
          style={[
            styles.onlineDot,
          { backgroundColor: statusColor },
          ]}
        />
        <Text
          style={[
            styles.statusText,
          { color: statusColor },
          ]}
        >
          {statusLabel}
        </Text>
      </View>
    </View>
  );
}
