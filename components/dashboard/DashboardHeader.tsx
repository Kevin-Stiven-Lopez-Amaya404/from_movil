import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { useAppTheme } from "@/lib/theme/app-theme";
import { styles } from "./DashboardHeader.styles";


type Props = {
  onNotificationsPress: () => void;
  onProfilePress: () => void;
  userName?: string;
  hasUnreadNotifications?: boolean;
};

export function DashboardHeader({
  onNotificationsPress,
  onProfilePress,
  userName = "Usuario",
  hasUnreadNotifications = false,
}: Props) {
  const theme = useAppTheme();

  return (
    <View style={styles.container}>
      {/* Barra superior */}
      <View style={styles.topBar}>
        <View style={styles.brandContainer}>
          <View
            style={[
              styles.brandIcon,
              {
                backgroundColor: theme.solidActionBackground,
              },
            ]}
          >
            <Ionicons name="home" size={19} color="#FFFFFF" />
          </View>

          <Text
            style={[
              styles.brandTitle,
              {
                color: theme.text,
              },
            ]}
          >
            Smart Home
          </Text>
        </View>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              hasUnreadNotifications
                ? `Notificaciones, ${"hay alertas pendientes"}`
                : "Notificaciones"
            }
            onPress={onNotificationsPress}
            style={({ pressed }) => [
              styles.actionButton,
              {
                backgroundColor: theme.card,
                borderColor: theme.borderLight,
              },
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name="notifications-outline"
              size={21}
              color={theme.text}
            />

            {hasUnreadNotifications && (
              <View
                style={[
                  styles.notificationDot,
                  {
                    backgroundColor: theme.danger,
                  },
                ]}
              />
            )}
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Perfil"
            onPress={onProfilePress}
            style={({ pressed }) => [
              styles.actionButton,
              {
                backgroundColor: theme.card,
                borderColor: theme.borderLight,
              },
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="person-outline" size={21} color={theme.text} />
          </Pressable>
        </View>
      </View>

      {/* Saludo */}
      <View style={styles.greetingContainer}>
        <Text
          style={[
            styles.greeting,
            {
              color: theme.text,
            },
          ]}
        >
          Hola, {userName} 👋
        </Text>

        <Text
          style={[
            styles.subtitle,
            {
              color: theme.muted,
            },
          ]}
        >
          Aquí tienes el resumen de tu hogar
        </Text>
      </View>
    </View>
  );
}
