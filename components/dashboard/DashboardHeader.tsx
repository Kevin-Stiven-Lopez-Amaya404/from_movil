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
    <View style={[styles.topBar, { backgroundColor: theme.background }]}>
      {/* Título de la marca con color primario/destacado */}
      <Text style={[styles.brand, { color: theme.blue || theme.text }]}>
        {title}
      </Text>

      <View style={styles.topActions}>
        {/* Botón de Notificaciones con contraste y borde */}
        <Pressable
          accessibilityLabel="Notificaciones"
          style={({ pressed }) => [
            styles.squareButton,
            { 
              backgroundColor: theme.card || theme.rowAlt,
              borderColor: theme.border || "transparent",
            },
            pressed && styles.buttonPressed,
          ]}
          onPress={onNotificationsPress}
        >
          <Ionicons 
            name={hasUnreadNotifications ? "notifications" : "notifications-outline"} 
            size={22} 
            color={hasUnreadNotifications ? (theme.blue || theme.text) : theme.muted || theme.text} 
          />
          
          {/* Badge con borde blanco para destacar sobre el botón */}
          {hasUnreadNotifications && (
            <View 
              style={[
                styles.unreadBadge, 
                { 
                  backgroundColor: theme.danger || "#FF3B30",
                  borderColor: theme.card || theme.background 
                }
              ]} 
            />
          )}
        </Pressable>

        {/* Avatar de Usuario con color de acento y texto en contraste */}
        <Pressable
          accessibilityLabel="Perfil"
          style={({ pressed }) => [
            styles.userCircle,
            { 
              backgroundColor: theme.blue || theme.blue || "#007AFF",
              shadowColor: theme.blue || "#007AFF",
            },
            pressed && styles.buttonPressed,
          ]}
          onPress={onProfilePress}
        >
          <Text style={[styles.userInitial, { color: theme.blue || "#FFFFFF" }]}>
            {initial}
          </Text>
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
    fontSize: typography.size.brand,
    fontWeight: typography.weight.bold,
    letterSpacing: -0.4,
  },
  topActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  squareButton: {
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    position: "relative",
    width: 44,
    // Sombra sutil para darle profundidad
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  unreadBadge: {
    borderRadius: 6,
    borderWidth: 2,
    height: 12,
    position: "absolute",
    right: 8,
    top: 8,
    width: 12,
  },
  userCircle: {
    alignItems: "center",
    borderRadius: 22,
    height: 44,
    justifyContent: "center",
    width: 44,
    // Sombra de color dinámico para un efecto "glow"
    elevation: 4,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  userInitial: {
    fontFamily: typography.fontFamily.display,
    fontSize: typography.size.section,
    fontWeight: typography.weight.bold,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
});