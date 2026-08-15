import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "@/lib/theme/app-theme";
import { typography } from "@/lib/theme/typography";

type Props = {
  onAddPress: () => void;
};

export function EmptyDashboard({ onAddPress }: Props) {
  const theme = useAppTheme();
  return (
    <View style={[styles.emptyState, { backgroundColor: theme.colors.card }]}>
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
        Todavía no tienes un hogar configurado.
      </Text>
      <Text style={[styles.emptyText, { color: theme.colors.muted }]}>
        Agrega tu primer hogar para comenzar a monitorear tu consumo eléctrico.
      </Text>
      <Pressable style={[styles.addButton, { backgroundColor: theme.colors.primary }]} onPress={onAddPress}>
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
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  emptyText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 15,
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
    fontSize: 16,
    fontWeight: "700",
  },
});