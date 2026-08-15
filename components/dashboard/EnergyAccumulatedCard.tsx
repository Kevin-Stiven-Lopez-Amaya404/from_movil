import { StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "@/lib/theme/app-theme";
import { typography } from "@/lib/theme/typography";
import { formatEnergy } from "@/lib/utils/formatters";

type Props = {
  energy: number;
};

export function EnergyAccumulatedCard({ energy }: Props) {
  const theme = useAppTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme.card }]}>
      <Text style={[styles.label, { color: theme.muted }]}>
        ⚡ Energía acumulada
      </Text>
      <Text style={[styles.value, { color: theme.text }]}>
        {formatEnergy(energy)}
      </Text>
      <Text style={[styles.sub, { color: theme.muted }]}>
        Energía consumida
      </Text>
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
    fontSize: typography.size.helper,
    fontWeight: typography.weight.medium,
    marginBottom: 4,
  },
  value: {
    fontFamily: typography.fontFamily.display,
    fontSize: typography.size.title,
    fontWeight: typography.weight.bold,
    marginVertical: 4,
  },
  sub: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.helper,
    fontWeight: typography.weight.regular,
  },
});