import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { useAppTheme } from "@/lib/theme/app-theme";
import { typography } from "@/lib/theme/typography";
import { formatWatts } from "@/lib/utils/formatters";

type Props = {
  power: number;
  isOn: boolean;
};

export function CurrentConsumptionCard({ power, isOn }: Props) {
  const theme = useAppTheme();

  const powerDisplay = isOn ? formatWatts(power) : "0 W";
  const statusText = isOn ? "encendido" : "apagado";

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.blue,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <View style={[styles.iconCircle, { backgroundColor: "#EBF2FA" }]}>
          <Ionicons name="flash" size={20} color={theme.blue} />
        </View>

        {isOn && (
          <View style={[styles.statusBadge, { backgroundColor: "#EBF2FA" }]}>
            <View style={[styles.dot, { backgroundColor: theme.success }]} />
            <Text style={[styles.statusBadgeText, { color: theme.blue }]}>
              {statusText}
            </Text>
          </View>
        )}
      </View>

      <Text style={[styles.label, { color: theme.muted }]}>
        Consumo
      </Text>

      <Text style={[styles.value, { color: theme.text }]}>
        {powerDisplay}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 2,
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
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusBadgeText: {
    fontFamily: typography.fontFamily.emphasis,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.semibold,
  },
});