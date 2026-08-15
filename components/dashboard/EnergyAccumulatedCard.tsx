import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { useAppTheme } from "@/lib/theme/app-theme";
import { typography } from "@/lib/theme/typography";
import { formatEnergy } from "@/lib/utils/formatters";

type Props = {
  energy: number;
  yesterdayEnergy?: number;
};

export function EnergyAccumulatedCard({
  energy,
  yesterdayEnergy = 0,
}: Props) {
  const theme = useAppTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.borderLight ?? "#0047AB",
        },
      ]}
    >
      <View style={styles.headerRow}>
        <View style={[styles.iconCircle, { backgroundColor: "#EBF2FA" }]}>
          <Ionicons name="flash-outline" size={20} color={theme.blue} />
        </View>
      </View>

      <Text style={[styles.label, { color: theme.muted }]}>
        Energía
      </Text>

      <Text style={[styles.value, { color: theme.text }]}>
        {formatEnergy(energy)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 16,
    marginVertical: 6,
    flex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.helper,
    fontWeight: typography.weight.medium,
  },
  value: {
    fontFamily: typography.fontFamily.display,
    fontSize: 22,
    fontWeight: typography.weight.bold,
    marginTop: 2,
  },
});