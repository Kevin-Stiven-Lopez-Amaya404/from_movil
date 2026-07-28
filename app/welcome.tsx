import SmartHomeLogo from "@/components/common/SmartHomeLogo";
import { GoogleIcon } from "@/components/icons/GoogleIcon";
import { theme } from "@/constants/theme";
import { useSmartHome } from "@/lib/context/smart-home-context";
import { useResponsiveLayout } from "@/lib/responsive/responsive";
import { getAuthPalette } from "@/lib/theme/appearance";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/**
 * Pantalla de bienvenida inicial.
 *
 * Ofrece opciones de inicio de sesión, registro y acceso simulado con Google.
 * También permite seleccionar el modo claro/oscuro antes de ingresar.
 */

export default function WelcomeScreen() {
  const router = useRouter();
  const layout = useResponsiveLayout();

  // El tema se guarda en contexto para que la seleccion del usuario afecte toda la app.
  const { colorMode, setColorMode } = useSmartHome();

  // Paleta especifica para pantallas de autenticacion, calculada segun modo claro/oscuro.
  const palette = getAuthPalette(colorMode);
  const dark = colorMode === "dark";

  /**
   * Flujo temporal para Google.
   *
   * La autenticacion OAuth real no esta implementada en esta version, por eso se
   * informa al usuario y se lo lleva al login normal/demo.
   */
  function handleGoogleLogin() {
    Alert.alert(
      "Inicio con Google",
      "La conexión OAuth queda preparada para producción. En esta versión de prueba continúa desde iniciar sesión y usa el acceso demo.",
      [{ text: "Ir a iniciar sesión", onPress: () => router.push("/login") }],
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: dark ? palette.background : theme.colors.backgroundBlue }]}>
      <View
        style={[
          styles.content,
          {
            maxWidth: layout.contentWidth,
            paddingBottom: layout.safeBottom,
            paddingTop: layout.safeTop,
          },
        ]}
      >
      {/* Selector de tema disponible antes del login para personalizar la experiencia desde el inicio. */}
      <View style={styles.modeRow}>
        {(["light", "dark"] as const).map((mode) => {
          const active = colorMode === mode;

          return (
            <Pressable
              key={mode}
              style={[
                styles.modeButton,
                active && styles.modeButtonActive,
                active && { backgroundColor: dark ? "#3B82F6" : "#FFFFFF" },
              ]}
              onPress={() => setColorMode(mode)}
            >
              <Ionicons
                name={mode === "light" ? "sunny-outline" : "moon-outline"}
                size={17}
                color={active ? (dark ? "#FFFFFF" : theme.colors.primary) : "#FFFFFF"}
              />
              <Text
                style={[
                  styles.modeText,
                  active && { color: dark ? "#FFFFFF" : theme.colors.primary },
                ]}
              >
                {mode === "light" ? "Claro" : "Oscuro"}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {/* El logo reduce espacio vertical en pantallas pequenas mediante `layout.compact`. */}
      <View style={[styles.logoArea, layout.compact && styles.logoAreaCompact]}>
        <SmartHomeLogo size={layout.compact ? 184 : 220} showText={true} variant="dark" />
      </View>

      {/* Acciones principales de entrada al sistema. */}
      <View style={styles.buttonsArea}>
        <Pressable
          style={({ pressed }) => [
            styles.buttonFilled,
            dark && styles.buttonFilledDark,
            pressed && styles.buttonPressedFilled,
          ]}
          onPress={() => router.push("/login")}
        >
          <Text style={styles.buttonFilledText}>Iniciar sesión</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.buttonOutline,
            dark && styles.buttonOutlineDark,
            pressed && styles.buttonPressedOutline,
          ]}
          onPress={() => router.push("/register")}
        >
          <Text style={styles.buttonOutlineText}>Registrarse</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.googleButton,
            dark && styles.googleButtonDark,
            pressed && styles.googleButtonPressed,
          ]}
          onPress={handleGoogleLogin}
        >
          <GoogleIcon size={24} />
          <Text style={[styles.googleButtonText, dark && styles.googleButtonTextDark]}>Continuar con Google</Text>
        </Pressable>
      </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flex: 1,
    backgroundColor: theme.colors.backgroundBlue,
    paddingHorizontal: theme.spacing.lg,
  },
  content: {
    flex: 1,
    width: "100%",
  },
  modeRow: {
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
    borderColor: "rgba(255,255,255,0.28)",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 4,
    marginTop: theme.spacing.lg,
    padding: 6,
    
    
  },
  modeButton: {
    alignItems: "center",
    borderRadius: 11,
    flexDirection: "row",
    gap: 6,
    minHeight: 34,
    paddingHorizontal: 12,
  },
  modeButtonActive: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  modeText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  logoArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: theme.spacing.xxl,
  },
  logoAreaCompact: {
    paddingTop: theme.spacing.lg,
  },
  buttonsArea: {
    alignSelf: "center",
    paddingBottom: theme.spacing.xxl,
    gap: theme.spacing.md,
    maxWidth: 340,
    width: "100%",
  },
  buttonFilled: {
    backgroundColor: "#FFFFFF",
    borderRadius: theme.radius.button,
    paddingVertical: theme.spacing.md + 2,
    alignItems: "center",
  },
  buttonPressedFilled: {
    backgroundColor: "#E0E8FF",
  },
  buttonFilledDark: {
    backgroundColor: "#E8F0FF",
  },
  buttonFilledText: {
    color: theme.colors.buttonPrimary,
    fontWeight: "700",
    fontSize: theme.fontSize.md,
  },
  buttonOutline: {
    backgroundColor: "transparent",
    borderRadius: theme.radius.button,
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
    paddingVertical: theme.spacing.md + 2,
    alignItems: "center",
  },
  buttonPressedOutline: {
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  buttonOutlineDark: {
    borderColor: "#93C5FD",
  },
  buttonOutlineText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: theme.fontSize.md,
  },
  googleButton: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: theme.radius.button,
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
    marginTop: theme.spacing.sm,
    paddingVertical: theme.spacing.md + 1,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  googleButtonPressed: {
    backgroundColor: "#F3F6FF",
  },
  googleButtonDark: {
    backgroundColor: "#151F33",
    borderColor: "#2D3B59",
    borderWidth: 1,
  },
  googleButtonText: {
    color: theme.colors.textDark,
    fontSize: theme.fontSize.base,
    fontWeight: "700",
  },
  googleButtonTextDark: {
    color: "#F8FAFC",
  },
});
