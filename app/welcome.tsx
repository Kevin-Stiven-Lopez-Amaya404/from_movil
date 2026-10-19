import { Ionicons } from "@expo/vector-icons";
import { GoogleIcon } from "@/components/icons/GoogleIcon";
import { useAuthPalette } from "@/lib/theme/appearance";
import { useResponsiveLayout } from "@/lib/responsive/responsive";
import { useRouter } from "expo-router";
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "./welcome.styles";

export default function WelcomeScreen() {
  const router = useRouter();
  const layout = useResponsiveLayout();
  const palette = useAuthPalette();

  function handleGoogleLogin() {
    Alert.alert(
      "Inicio con Google",
      "El inicio de sesión con Google todavía no está disponible. Para continuar, inicia sesión con tu correo y contraseña.",
      [
        {
          text: "Ir a iniciar sesión",
          onPress: () => router.push("/login"),
        },
      ],
    );
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: palette.background }]}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: layout.screenBottom,
            paddingHorizontal: layout.gutter,
            paddingTop: layout.compact ? 8 : 18,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.content, { maxWidth: layout.contentWidth }]}>
          <View style={styles.mainContent}>
            <View
              accessible={false}
              style={[
                styles.illustration,
                layout.compact && styles.illustrationCompact,
              ]}
            >
              <View
                pointerEvents="none"
                style={[
                  styles.illustrationGlow,
                  { backgroundColor: palette.primarySoft },
                ]}
              />
              <View
                style={[
                  styles.houseTile,
                  {
                    backgroundColor: palette.card,
                    borderColor: palette.fieldBorder === "transparent"
                      ? "#E1EAF5"
                      : palette.fieldBorder,
                  },
                ]}
              >
                <Ionicons color={palette.button} name="home-outline" size={58} />
                <View
                  style={[
                    styles.energyBadge,
                    { backgroundColor: palette.button },
                  ]}
                >
                  <Ionicons color="#FFFFFF" name="flash" size={20} />
                </View>
              </View>
              <View
                style={[
                  styles.connectionBadge,
                  { backgroundColor: palette.card },
                ]}
              >
                <Ionicons color={palette.button} name="wifi" size={19} />
              </View>
              <View
                style={[
                  styles.securityBadge,
                  { backgroundColor: palette.card },
                ]}
              >
                <Ionicons
                  color={palette.button}
                  name="shield-checkmark-outline"
                  size={18}
                />
              </View>
            </View>

            <View style={styles.eyebrow}>
              <View style={styles.eyebrowDot} />
              <Text style={[styles.eyebrowText, { color: palette.link }]}>
                HOGAR CONECTADO
              </Text>
            </View>

            <Text
              style={[
                styles.title,
                layout.tiny && styles.titleTiny,
                { color: palette.title },
              ]}
            >
              Tu hogar, más inteligente
            </Text>
            <Text style={[styles.subtitle, { color: palette.muted }]}>
              Controla tus dispositivos y conoce tu consumo de energía desde un
              solo lugar.
            </Text>
          </View>

          <View style={styles.actions}>
            <Pressable
              accessibilityLabel="Iniciar sesión"
              accessibilityRole="button"
              onPress={() => router.push("/login")}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.primaryButtonPressed,
              ]}
            >
              <Text style={styles.primaryButtonText}>Iniciar sesión</Text>
              <Ionicons color="#FFFFFF" name="arrow-forward" size={19} />
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={() => router.push("/register")}
              style={({ pressed }) => [
                styles.secondaryButton,
                {
                  borderColor: palette.fieldBorder === "transparent"
                    ? "#CBD5E1"
                    : palette.fieldBorder,
                },
                pressed && styles.secondaryButtonPressed,
              ]}
            >
              <Text style={[styles.secondaryButtonText, { color: palette.text }]}>
                Crear cuenta
              </Text>
            </Pressable>

            <Pressable
              accessibilityLabel="Inicio con Google no disponible"
              accessibilityRole="button"
              onPress={handleGoogleLogin}
              style={({ pressed }) => [
                styles.googleButton,
                pressed && styles.googleButtonPressed,
              ]}
            >
              <GoogleIcon size={20} />
              <Text style={[styles.googleButtonText, { color: palette.muted }]}>
                Inicio con Google · No disponible
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
