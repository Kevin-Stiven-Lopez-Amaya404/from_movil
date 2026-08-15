import { StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "@/lib/theme/app-theme";
import { typography } from "@/lib/theme/typography";

export function ConsumptionChartCard() {
  const theme = useAppTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme.card }]}>
      <Text style={[styles.title, { color: theme.text }]}>
        Consumo reciente
      </Text>
      <View style={[styles.chartPlaceholder, { backgroundColor: theme.rowAlt }]}>
        <Text style={[styles.placeholderText, { color: theme.muted }]}>
          Gráfico de consumo (próximamente)
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontFamily: typography.fontFamily.emphasis,
    fontSize: typography.size.section,
    fontWeight: typography.weight.semibold,
    marginBottom: 12,
  },
  chartPlaceholder: {
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  placeholderText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.body,
  },
});