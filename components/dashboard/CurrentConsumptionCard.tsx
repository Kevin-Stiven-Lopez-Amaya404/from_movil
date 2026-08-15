import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "@/lib/theme/app-theme";
import { typography } from "@/lib/theme/typography";
import { formatWatts } from "@/lib/utils/formatters";

type Props = {
  power: number; // en watts
  isOn: boolean;
};

export function CurrentConsumptionCard({ power, isOn }: Props) {
  const theme = useAppTheme();
  const powerDisplay = isOn ? formatWatts(power) : "0 W";
  const statusText = isOn ? "Dispositivo encendido" : "Dispositivo apagado";

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
      <Text style={[styles.label, { color: theme.colors.muted }]}>
        ⚡ Consumo actual
      </Text>
      <Text style={[styles.value, { color: theme.colors.text }]}>
        {powerDisplay}
      </Text>
      <View style={styles.statusRow}>
        <View style={[styles.dot, { backgroundColor: isOn ? theme.colors.success : theme.colors.muted }]} />
        <Text style={[styles.statusText, { color: theme.colors.muted }]}>
          {statusText}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  label: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  value: {
    fontFamily: typography.fontFamily.display,
    fontSize: 36,
    fontWeight: "700",
    marginVertical: 4,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 14,
    fontWeight: "500",
  },
});