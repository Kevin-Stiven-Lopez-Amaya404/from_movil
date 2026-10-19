import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { useAppTheme } from "@/lib/theme/app-theme";

import { formatEnergy } from "@/lib/utils/formatters";
import { styles } from "./EnergyAccumulatedCard.styles";

type Props = {
  energy: number;
  yesterdayEnergy?: number;
};

export function EnergyAccumulatedCard({ energy, yesterdayEnergy = 0 }: Props) {
  const theme = useAppTheme();

  const difference = energy - yesterdayEnergy;
  const hasComparison = yesterdayEnergy > 0;

  const comparisonText = !hasComparison
    ? "Sin comparación"
    : difference > 0
      ? `↑ ${Math.abs(difference).toFixed(0)} Wh`
      : difference < 0
        ? `↓ ${Math.abs(difference).toFixed(0)} Wh`
        : "Sin cambios";

  const comparisonColor =
    difference > 0
      ? theme.danger
      : difference < 0
        ? theme.success
        : theme.muted;

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
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: theme.rowAlt,
            },
          ]}
        >
          <Ionicons name="flash-outline" size={20} color={theme.blue} />
        </View>

        <Ionicons name="stats-chart-outline" size={18} color={theme.muted} />
      </View>

      <Text
        style={[
          styles.label,
          {
            color: theme.muted,
          },
        ]}
      >
        Energía acumulada
      </Text>

      <Text
        style={[
          styles.value,
          {
            color: theme.text,
          },
        ]}
      >
        {formatEnergy(energy)}
      </Text>

      <Text
        style={[
          styles.comparison,
          {
            color: comparisonColor,
          },
        ]}
      >
        {comparisonText}
      </Text>
    </View>
  );
}
