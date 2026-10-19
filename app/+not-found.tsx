
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAuthSession } from "@/lib/auth/auth-session-context";
import { useAppTheme } from "@/lib/theme/app-theme";

export default function NotFoundScreen() {
  const { isAuthenticated } = useAuthSession();
  const theme = useAppTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.background },
      ]}
    >
      <Text style={[styles.title, { color: theme.text }]}>
        Pantalla no encontrada
      </Text>

      <Text style={[styles.message, { color: theme.muted }]}>
        No pudimos encontrar la ruta solicitada.
      </Text>

      <Link
        href={isAuthenticated ? "/" : "/welcome"}
        asChild
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ir al inicio"
          style={({ pressed }) => [
            styles.closeLink,
            { backgroundColor: theme.rowAlt },
            pressed && styles.pressed,
          ]}
        >
          <Ionicons name="close" size={21} color={theme.blue} />
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
  },
  message: {
    fontSize: 15,
    textAlign: "center",
  },
  closeLink: {
    alignItems: "center",
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    marginTop: 12,
    width: 40,
  },
  pressed: { opacity: 0.65 },
});
