import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { useAppTheme } from "@/lib/theme/app-theme";
import { typography } from "@/lib/theme/typography";
import { formatEnergy } from "@/lib/utils/formatters";

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

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    flex: 1,
    minHeight: 156,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },

  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  iconContainer: {
    alignItems: "center",
    borderRadius: 12,
    height: 38,
    justifyContent: "center",
    width: 38,
  },

  label: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 13,
    fontWeight: typography.weight.medium,
    marginTop: 16,
  },

  value: {
    fontFamily: typography.fontFamily.display,
    fontSize: 28,
    fontWeight: typography.weight.heavy,
    marginTop: 2,
  },

  comparison: {
    fontFamily: typography.fontFamily.emphasis,
    fontSize: 11,
    fontWeight: typography.weight.bold,
    marginTop: 4,
  },
});
