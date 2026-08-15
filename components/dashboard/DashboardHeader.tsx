import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "@/lib/theme/app-theme";
import { typography } from "@/lib/theme/typography";

type Props = {
  onNotificationsPress: () => void;
  onProfilePress: () => void;
  sessionName?: string;
  title?: string;
  hasUnreadNotifications?: boolean;
};

export function DashboardHeader({
  onNotificationsPress,
  onProfilePress,
  sessionName = "Usuario",
  title = "Smart Home",
  hasUnreadNotifications = false,
}: Props) {
  const theme = useAppTheme();
  const initial = sessionName.trim().charAt(0).toUpperCase() || "U";

  return (
    <View style={[styles.topBar, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.brand, { color: theme.colors.text }]}>
        {title}
      </Text>
      <View style={styles.topActions}>
        <Pressable
          accessibilityLabel="Notificaciones"
          style={({ pressed }) => [
            styles.squareButton,
            { backgroundColor: theme.colors.card },
            pressed && styles.buttonPressed,
          ]}
          onPress={onNotificationsPress}
        >
          <Ionicons name="notifications-outline" size={22} color={theme.colors.text} />
          {hasUnreadNotifications && <View style={[styles.unreadBadge, { backgroundColor: theme.colors.danger }]} />}
        </Pressable>
        <Pressable
          accessibilityLabel="Perfil"
          style={({ pressed }) => [
            styles.userCircle,
            { backgroundColor: theme.colors.primary },
            pressed && styles.buttonPressed,
          ]}
          onPress={onProfilePress}
        >
          <Text style={[styles.userInitial, { color: "#fff" }]}>{initial}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    width: "100%",
  },
  brand: {
    fontFamily: typography.fontFamily.display,
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: -0.4,
  },
  topActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  squareButton: {
    alignItems: "center",
    borderRadius: 13,
    height: 44,
    justifyContent: "center",
    position: "relative",
    width: 44,
  },
  unreadBadge: {
    borderRadius: 5,
    height: 9,
    position: "absolute",
    right: 11,
    top: 11,
    width: 9,
  },
  userCircle: {
    alignItems: "center",
    borderRadius: 22,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  userInitial: {
    fontFamily: typography.fontFamily.display,
    fontSize: 18,
    fontWeight: "700",
  },
  buttonPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.96 }],
  },
});