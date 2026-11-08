import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { AppTheme } from "@/lib/theme/app-theme";
import { typography } from "@/lib/theme/typography";

type Props = {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  value: string;
  onPress: () => void;
  theme: AppTheme;
  busy?: boolean;
};

/** Compact summary of a home metric on the dashboard. */
export function SummaryTile({
  icon,
  label,
  value,
  onPress,
  theme,
  busy = false,
}: Props) {
  const accent = theme.decorativeAccent;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${busy ? "cargando" : value}. Abrir sección.`}
      accessibilityState={{ busy }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.tile,
        {
          backgroundColor: theme.blueSurface,
          borderColor: theme.dark ? theme.border : theme.blueSurface,
        },
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.top}>
        <View style={[styles.icon, { backgroundColor: theme.surfaceSecondary }]}>
          <Ionicons name={icon} size={24} color={accent} />
        </View>
        <Ionicons name="arrow-forward" size={17} color={accent} />
      </View>
      <Text style={[styles.value, { color: theme.text }]}>{value}</Text>
      <Text style={[styles.label, { color: theme.muted }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    minHeight: 146,
    minWidth: 0,
    padding: 14,
  },
  top: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  icon: {
    alignItems: "center",
    borderRadius: 13,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  value: {
    fontFamily: typography.fontFamily.display,
    fontSize: typography.size.title,
    fontWeight: "900",
    lineHeight: 34,
    marginTop: 11,
  },
  label: {
    fontSize: typography.size.caption,
    fontWeight: "700",
    lineHeight: 17,
    marginTop: 2,
  },
  pressed: { opacity: 0.73 },
});
