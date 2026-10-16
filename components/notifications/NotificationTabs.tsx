import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAppTheme } from "@/lib/theme/app-theme";

export type NotificationSection = "invitations" | "alerts" | "history";

type Props = {
  value: NotificationSection;
  onChange: (value: NotificationSection) => void;
  invitationCount: number;
  alertCount: number;
  unreadCount: number;
};

const SECTIONS = [
  { value: "invitations", label: "Invitaciones" },
  { value: "alerts", label: "Alertas" },
  { value: "history", label: "Historial" },
] as const;

export function NotificationTabs({
  value,
  onChange,
  invitationCount,
  alertCount,
  unreadCount,
}: Props) {
  const theme = useAppTheme();

  const counts: Record<NotificationSection, number> = {
    invitations: invitationCount,
    alerts: alertCount,
    history: unreadCount,
  };

  return (
    <View style={styles.container}>
      {SECTIONS.map((section) => {
        const selected = value === section.value;
        const count = counts[section.value];

        return (
          <Pressable
            key={section.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={`${section.label}, ${count} pendientes`}
            onPress={() => onChange(section.value)}
            style={[
              styles.tab,
              {
                backgroundColor: selected ? theme.rowAlt : theme.card,
                borderColor: selected ? theme.blue : theme.borderLight,
              },
            ]}
          >
            <Text
              numberOfLines={1}
              style={[
                styles.label,
                { color: selected ? theme.blue : theme.text },
              ]}
            >
              {section.label}
            </Text>

            {count > 0 && (
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: selected ? theme.blue : theme.rowAlt,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    { color: selected ? "#FFFFFF" : theme.text },
                  ]}
                >
                  {count > 99 ? "99+" : count}
                </Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 18,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 12,
    minHeight: 46,
    paddingHorizontal: 5,
    gap: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: "800",
    flexShrink: 1,
  },
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "800",
  },
});
