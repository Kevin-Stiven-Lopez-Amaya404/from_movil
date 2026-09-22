import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

import type { AppTheme } from "@/lib/theme/app-theme";
import { typography } from "@/lib/theme/typography";

type EnergyRealtimeCardProps = {
  isOnline: boolean;
  power: number;
  theme: AppTheme;
};

export function EnergyRealtimeCard({
  isOnline,
  power,
  theme,
}: EnergyRealtimeCardProps) {
  const powerInKw = (power / 1000).toFixed(2);

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.card, borderColor: theme.borderLight },
      ]}
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.text }]}>
            Consumo en tiempo real
          </Text>
          <Text style={[styles.subtitle, { color: theme.muted }]}>
            Potencia actual de la estancia
          </Text>
        </View>
        <View
          style={[
            styles.onlineBadge,
            { backgroundColor: isOnline ? theme.successSoft : theme.rowAlt },
          ]}
        >
          <View
            style={[
              styles.onlineDot,
              { backgroundColor: isOnline ? theme.success : theme.muted },
            ]}
          />
          <Text
            style={[
              styles.onlineText,
              { color: isOnline ? theme.success : theme.muted },
            ]}
          >
            {isOnline ? "En línea" : "Sin conexión"}
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
            stroke={theme.dark ? "#263750" : "#E5EDF7"}
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
            strokeDashoffset={power > 0 ? "210" : "528"}
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
            { backgroundColor: isOnline ? theme.success : theme.muted },
          ]}
        />
        <Text
          style={[
            styles.statusText,
            { color: isOnline ? theme.success : theme.muted },
          ]}
        >
          {isOnline ? "En línea" : "Sin conexión"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 14,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  title: {
    fontFamily: typography.fontFamily.emphasis,
    fontSize: 20,
    fontWeight: "800",
  },
  subtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 14,
    marginTop: 4,
  },
  onlineBadge: {
    alignItems: "center",
    borderRadius: 14,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },
  onlineDot: {
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  onlineText: {
    fontFamily: typography.fontFamily.emphasis,
    fontSize: 12,
    fontWeight: "700",
  },
  gaugeArea: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 8,
  },
  gaugeValue: {
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
  },
  value: {
    fontFamily: typography.fontFamily.emphasis,
    fontSize: 42,
    fontWeight: "800",
    marginTop: 2,
  },
  unit: {
    fontFamily: typography.fontFamily.emphasis,
    fontSize: 17,
    fontWeight: "700",
    marginTop: -4,
  },
  statusRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 7,
    justifyContent: "center",
  },
  statusText: {
    fontFamily: typography.fontFamily.emphasis,
    fontSize: 14,
  },
});
