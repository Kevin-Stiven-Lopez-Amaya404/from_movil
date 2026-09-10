import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAppTheme } from "@/lib/theme/app-theme";
import { typography } from "@/lib/theme/typography";
import {
  type ConsumptionGoalStatus,
  getConsumptionGoalProgress,
} from "@/lib/utils/consumption";
import { formatEnergy } from "@/lib/utils/formatters";

type Props = { consumedWh: number; targetWh: number; onEdit?: () => void };

const statusCopy: Record<ConsumptionGoalStatus, string> = {
  within: "Dentro de la meta",
  warning: "Consumo cercano a la meta",
  exceeded: "Meta de consumo superada",
};

export function HomeConsumptionGoalCard({ consumedWh, targetWh, onEdit }: Props) {
  const theme = useAppTheme();
  const { percentage, progress, status } = getConsumptionGoalProgress(consumedWh, targetWh);
  const statusColor = status === "exceeded" ? theme.danger : status === "warning" ? "#D97706" : theme.success;

  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.borderLight }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.eyebrow, { color: theme.muted }]}>Meta mensual</Text>
          <Text style={[styles.title, { color: theme.text }]}>Consumo del hogar</Text>
        </View>
        {onEdit ? (
          <Pressable
            onPress={onEdit}
            accessibilityRole="button"
            accessibilityLabel="Editar meta de consumo"
            style={[styles.editButton, { backgroundColor: theme.rowAlt }]}
          >
            <Ionicons name="create-outline" size={19} color={theme.blue} />
          </Pressable>
        ) : (
          <View style={[styles.icon, { backgroundColor: theme.rowAlt }]}>
            <Ionicons name="speedometer-outline" size={21} color={theme.blue} />
          </View>
        )}
      </View>
      <View style={styles.values}>
        <Text style={[styles.consumed, { color: theme.text }]}>{formatEnergy(consumedWh)}</Text>
        <Text style={[styles.target, { color: theme.muted }]}>de {formatEnergy(targetWh)}</Text>
      </View>
      <View style={[styles.track, { backgroundColor: theme.rowAlt }]}>
        <View style={[styles.progress, { backgroundColor: statusColor, width: `${progress}%` }]} />
      </View>
      <View style={styles.footer}>
        <Text style={[styles.status, { color: statusColor }]}>{statusCopy[status]}</Text>
        <Text style={[styles.percentage, { color: theme.text }]}>{Math.round(percentage)}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 20, borderWidth: 1, marginTop: 16, padding: 16 },
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  eyebrow: { fontFamily: typography.fontFamily.emphasis, fontSize: 12, fontWeight: "700" },
  title: { fontFamily: typography.fontFamily.display, fontSize: 18, fontWeight: "800", marginTop: 2 },
  icon: { alignItems: "center", borderRadius: 12, height: 42, justifyContent: "center", width: 42 },
  editButton: { alignItems: "center", borderRadius: 12, height: 42, justifyContent: "center", width: 42 },
  values: { alignItems: "baseline", flexDirection: "row", flexWrap: "wrap", gap: 5, marginTop: 18 },
  consumed: { fontFamily: typography.fontFamily.display, fontSize: 28, fontWeight: "900" },
  target: { fontFamily: typography.fontFamily.regular, fontSize: 13, fontWeight: "600" },
  track: { borderRadius: 99, height: 9, marginTop: 12, overflow: "hidden", width: "100%" },
  progress: { borderRadius: 99, height: "100%", minWidth: 4 },
  footer: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  status: { flex: 1, fontFamily: typography.fontFamily.emphasis, fontSize: 12, fontWeight: "800" },
  percentage: { fontFamily: typography.fontFamily.display, fontSize: 16, fontWeight: "900" },
});
