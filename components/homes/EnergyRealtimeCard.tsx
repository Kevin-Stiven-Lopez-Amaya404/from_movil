import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

import type { AppTheme } from "@/lib/theme/app-theme";
import { styles } from "./EnergyRealtimeCard.styles";


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
            Potencia actual del hogar
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
