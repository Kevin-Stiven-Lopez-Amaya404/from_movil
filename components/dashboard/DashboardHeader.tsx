import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "@/lib/theme/app-theme";
import { typography } from "@/lib/theme/typography";

type Props = {
  onNotificationsPress: () => void;
  onProfilePress: () => void;
  userName?: string;
  hasUnreadNotifications?: boolean;
};

export function DashboardHeader({
  onNotificationsPress,
  onProfilePress,
  userName = "Natalia",
  hasUnreadNotifications = false,
}: Props) {
  const theme = useAppTheme();

  return (
    <View style={styles.container}>
      {/* Tarjeta azul con bordes redondeados ARRIBA y rectos ABAJO */}
      <View style={[styles.headerCard, { backgroundColor: theme.blue }]}>
        {/* Lado Izquierdo: Notificaciones */}
        <Pressable
          accessibilityLabel="Notificaciones"
          style={({ pressed }) => [
            styles.iconButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={onNotificationsPress}
        >
          <Ionicons name="notifications-outline" size={20} color="#FFFFFF" />
          {hasUnreadNotifications && <View style={styles.unreadBadge} />}
        </Pressable>

        {/* Centro: Smart Home */}
        <Text style={styles.brandTitle}>Smart Home</Text>

        {/* Lado Derecho: Perfil */}
        <Pressable
          accessibilityLabel="Perfil"
          style={({ pressed }) => [
            styles.iconButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={onProfilePress}
        >
          <Ionicons name="person-outline" size={20} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* Saludo fuera de la cabecera */}
      <View style={styles.greetingContainer}>
        <Text style={[styles.greetingText, { color: theme.text }]}>
          ¡Hola, {userName}! 👋
        </Text>
        <Text style={[styles.subGreetingText, { color: theme.muted }]}>
          Casa principal ›
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 8,
  },
  headerCard: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 18,
    width: "100%",
    marginTop: 8,

    // 👈 Redondeado en las esquinas superiores, recto abajo
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  brandTitle: {
    color: "#FFFFFF",
    fontFamily: typography.fontFamily.display,
    fontSize: typography.size.title,
    fontWeight: typography.weight.bold,
    textAlign: "center",
  },
  iconButton: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    height: 40,
    justifyContent: "center",
    position: "relative",
    width: 40,
  },
  unreadBadge: {
    backgroundColor: "#FF3B20",
    borderRadius: 4,
    height: 8,
    position: "absolute",
    right: 10,
    top: 10,
    width: 8,
  },
  buttonPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.96 }],
  },
  greetingContainer: {
    marginTop: 20,
    paddingHorizontal: 4,
  },
  greetingText: {
    fontFamily: typography.fontFamily.display,
    fontSize: typography.size.screenTitle,
    fontWeight: typography.weight.bold,
  },
  subGreetingText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.body,
    fontWeight: typography.weight.medium,
    marginTop: 2,
  },
});