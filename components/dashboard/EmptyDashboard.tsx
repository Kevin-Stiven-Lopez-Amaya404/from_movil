import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "@/lib/theme/app-theme";
import { typography } from "@/lib/theme/typography";

type Props = {
  onAddPress: () => void;
};

export function EmptyDashboard({ onAddPress }: Props) {
  const theme = useAppTheme();
  return (
    <View style={[styles.emptyState, { backgroundColor: theme.card }]}>
      <Text style={[styles.emptyTitle, { color: theme.text }]}>
        Todavía no tienes un hogar configurado.
      </Text>
      <Text style={[styles.emptyText, { color: theme.muted }]}>
        Agrega tu primer hogar para comenzar a monitorear tu consumo eléctrico.
      </Text>
      <Pressable style={[styles.addButton, { backgroundColor: theme.blue }]} onPress={onAddPress}>
        <Text style={styles.addButtonText}>Agregar hogar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyState: {
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginVertical: 8,
  },
  emptyTitle: {
    fontFamily: typography.fontFamily.emphasis,
    fontSize: typography.size.section,
    fontWeight: typography.weight.semibold,
    textAlign: "center",
    marginBottom: 8,
  },
  emptyText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.body,
    textAlign: "center",
    marginBottom: 20,
  },
  addButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  addButtonText: {
    color: "#fff",
    fontFamily: typography.fontFamily.emphasis,
    fontSize: typography.size.body,
    fontWeight: typography.weight.semibold,
  },
});