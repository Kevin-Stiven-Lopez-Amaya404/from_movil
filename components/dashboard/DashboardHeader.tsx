import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAppTheme } from "@/lib/theme/app-theme";
import { typography } from "@/lib/theme/typography";

type Props = {
  onNotificationsPress: () => void;
  onProfilePress: () => void;
  onHomePress?: () => void;
  userName?: string;
  activeHomeName?: string;
  activeHomeLocation?: string;
  hasUnreadNotifications?: boolean;
};

export function DashboardHeader({
  onNotificationsPress,
  onProfilePress,
  onHomePress,
  userName = "Usuario",
  activeHomeName = "Casa",
  activeHomeLocation = "Hogar principal",
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
                backgroundColor: theme.blue,
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

      {/* Hogar activo */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Abrir ${activeHomeName}`}
        onPress={onHomePress}
        style={({ pressed }) => [
          styles.homeSelector,
          {
            backgroundColor: theme.card,
            borderColor: theme.borderLight,
          },
          pressed && styles.pressed,
        ]}
      >
        <View
          style={[
            styles.homeIcon,
            {
              backgroundColor: theme.rowAlt,
            },
          ]}
        >
          <Ionicons name="home-outline" size={22} color={theme.blue} />
        </View>

        <View style={styles.homeCopy}>
          <Text
            numberOfLines={1}
            style={[
              styles.homeName,
              {
                color: theme.text,
              },
            ]}
          >
            {activeHomeName}
          </Text>

          <Text
            numberOfLines={1}
            style={[
              styles.homeLocation,
              {
                color: theme.muted,
              },
            ]}
          >
            {activeHomeLocation}
          </Text>
        </View>

        <Ionicons name="chevron-forward" size={20} color={theme.muted} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
    width: "100%",
  },

  topBar: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  brandContainer: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },

  brandIcon: {
    alignItems: "center",
    borderRadius: 12,
    height: 38,
    justifyContent: "center",
    width: 38,
  },

  brandTitle: {
    fontFamily: typography.fontFamily.display,
    fontSize: 20,
    fontWeight: typography.weight.bold,
  },

  actions: {
    flexDirection: "row",
    gap: 8,
  },

  actionButton: {
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    height: 40,
    justifyContent: "center",
    position: "relative",
    width: 40,
  },

  notificationDot: {
    borderRadius: 4,
    height: 8,
    position: "absolute",
    right: 9,
    top: 8,
    width: 8,
  },

  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },

  greetingContainer: {
    marginTop: 24,
  },

  greeting: {
    fontFamily: typography.fontFamily.display,
    fontSize: 28,
    fontWeight: typography.weight.heavy,
  },

  subtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 14,
    fontWeight: typography.weight.medium,
    marginTop: 4,
  },

  homeSelector: {
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    marginTop: 18,
    padding: 12,
  },

  homeIcon: {
    alignItems: "center",
    borderRadius: 14,
    height: 46,
    justifyContent: "center",
    width: 46,
  },

  homeCopy: {
    flex: 1,
    marginHorizontal: 12,
    minWidth: 0,
  },

  homeName: {
    fontFamily: typography.fontFamily.emphasis,
    fontSize: 16,
    fontWeight: typography.weight.bold,
  },

  homeLocation: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    marginTop: 3,
  },
});
