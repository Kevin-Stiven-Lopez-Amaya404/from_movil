import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { AppTheme } from "@/lib/theme/app-theme";
import { typography } from "@/lib/theme/typography";

type Props = {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
  subtitle: string;
  onPress: () => void;
  theme: AppTheme;
};

/** Fila de navegación con icono decorativo neutro para el dashboard. */
export function NavigationRow({ icon, title, subtitle, onPress, theme }: Props) {
  const accent = theme.decorativeAccent;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${subtitle}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: theme.card, borderColor: theme.borderLight },
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.icon, { backgroundColor: theme.surfaceSecondary }]}>
        <Ionicons name={icon} size={24} color={accent} />
      </View>
      <View style={styles.copy}>
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.subtitle, { color: theme.muted }]}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={theme.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    borderRadius: 17,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    minHeight: 83,
    paddingHorizontal: 13,
    paddingVertical: 12,
  },
  icon: {
    alignItems: "center",
    borderRadius: 14,
    height: 50,
    justifyContent: "center",
    width: 50,
  },
  copy: { flex: 1, gap: 4 },
  title: {
    fontFamily: typography.fontFamily.display,
    fontSize: typography.size.body,
    fontWeight: "800",
  },
  subtitle: { fontSize: typography.size.caption, lineHeight: 17 },
  pressed: { opacity: 0.73 },
});
