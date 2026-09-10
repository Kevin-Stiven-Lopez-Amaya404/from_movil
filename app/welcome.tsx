import SmartHomeLogo from "@/components/common/SmartHomeLogo";
import { GoogleIcon } from "@/components/icons/GoogleIcon";
import { theme } from "@/constants/theme";
import { useSmartHome } from "@/lib/context/smart-home-context";
import { useResponsiveLayout } from "@/lib/responsive/responsive";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    Alert,
    Animated,
    Easing,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WelcomeScreen() {
  const router = useRouter();
  const layout = useResponsiveLayout();

  const { colorMode } = useSmartHome();
  const dark = colorMode === "dark";

  // ==========================================
  // ANIMACIONES DEL LOGO
  // ==========================================

  // Pequeño movimiento de escala del logo
  const [logoScale] = useState(() => new Animated.Value(1));

  // Escala del halo
  const [glowScale] = useState(() => new Animated.Value(0.85));

  // Intensidad del halo
  const [glowOpacity] = useState(() => new Animated.Value(0.1));

  useEffect(() => {
    /*
     * Animación suave y continua:
     *
     * 1. Espera un momento.
     * 2. El logo aumenta ligeramente.
     * 3. El halo crece.
     * 4. El halo se desvanece.
     * 5. El logo vuelve a su tamaño original.
     * 6. Espera y vuelve a comenzar.
     *
     * No existe ningún destello que atraviese
     * el logo ni ninguna animación en forma de
     * cuadro.
     */

    const animation = Animated.loop(
      Animated.sequence([
        // ======================================
        // PAUSA INICIAL
        // ======================================

        Animated.delay(1200),

        // ======================================
        // LOGO + HALO CRECEN
        // ======================================

        Animated.parallel([
          Animated.timing(logoScale, {
            toValue: 1.04,
            duration: 400,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),

          Animated.timing(glowScale, {
            toValue: 1.12,
            duration: 700,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),

          Animated.timing(glowOpacity, {
            toValue: 0.32,
            duration: 700,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),

        // ======================================
        // LOGO + HALO VUELVEN A NORMAL
        // ======================================

        Animated.parallel([
          Animated.timing(logoScale, {
            toValue: 1,
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),

          Animated.timing(glowScale, {
            toValue: 0.85,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),

          Animated.timing(glowOpacity, {
            toValue: 0.1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),

        // ======================================
        // PAUSA ANTES DEL SIGUIENTE CICLO
        // ======================================

        Animated.delay(1800),
      ]),
    );

    animation.start();

    return () => {
      animation.stop();

      logoScale.stopAnimation();
      glowScale.stopAnimation();
      glowOpacity.stopAnimation();
    };
  }, [glowOpacity, glowScale, logoScale]);

  // ==========================================
  // GOOGLE LOGIN
  // ==========================================

  function handleGoogleLogin() {
    Alert.alert(
      "Inicio con Google",
      "La conexión OAuth queda preparada para producción. En esta versión de prueba continúa desde iniciar sesión y usa el acceso demo.",
      [
        {
          text: "Ir a iniciar sesión",
          onPress: () => router.push("/login"),
        },
      ],
    );
  }

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          /*
           * Fondo personalizado.
           *
           * Claro:
           * azul muy suave para que el logo azul
           * tenga mayor contraste.
           *
           * Oscuro:
           * azul marino profundo.
           */
          backgroundColor: dark ? "#08111F" : "#dde7f4",
        },
      ]}
    >
      {/* ========================================== */}
      {/* FONDO LIMPIO                              */}
      {/* ========================================== */}

      <View style={StyleSheet.absoluteFill} pointerEvents="none" />

      {/* ========================================== */}
      {/* CONTENIDO PRINCIPAL                       */}
      {/* ========================================== */}

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
        {/* ========================================== */}
        {/* LOGO PRINCIPAL                            */}
        {/* ========================================== */}

        <View
          style={[styles.logoArea, layout.compact && styles.logoAreaCompact]}
        >
          <View style={styles.logoAnimationContainer}>
            {/* ====================================== */}
            {/* HALO DE ENERGÍA                        */}
            {/* ====================================== */}

            <Animated.View
              pointerEvents="none"
              style={[
                styles.logoGlow,
                {
                  /*
                   * El color del halo cambia ligeramente
                   * dependiendo del modo de la aplicación.
                   */
                  backgroundColor: dark
                    ? "rgba(59, 130, 246, 0.28)"
                    : "rgba(37, 99, 235, 0.16)",

                  opacity: glowOpacity,

                  transform: [
                    {
                      scale: glowScale,
                    },
                  ],
                },
              ]}
            />

            {/* ====================================== */}
            {/* LOGO SMART HOME                        */}
            {/* ====================================== */}

            <Animated.View
              style={[
                styles.logoWrapper,
                {
                  transform: [
                    {
                      scale: logoScale,
                    },
                  ],
                },
              ]}
            >
              <SmartHomeLogo
                /*
                 * Antes estaba en 220.
                 *
                 * Ahora utilizamos un logo mucho más grande
                 * para que sea el elemento principal de
                 * la pantalla de bienvenida.
                 */
                size={layout.compact ? 270 : 320}
                showText={true}
                variant="dark"
              />
            </Animated.View>
          </View>
        </View>

        {/* ========================================== */}
        {/* BOTONES                                   */}
        {/* ========================================== */}

        <View style={styles.buttonsArea}>
          {/* ====================================== */}
          {/* INICIAR SESIÓN                         */}
          {/* ====================================== */}

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

          {/* ====================================== */}
          {/* REGISTRARSE                            */}
          {/* ====================================== */}

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

          {/* ====================================== */}
          {/* GOOGLE                                 */}
          {/* ====================================== */}

          <Pressable
            style={({ pressed }) => [
              styles.googleButton,
              dark && styles.googleButtonDark,
              pressed && styles.googleButtonPressed,
            ]}
            onPress={handleGoogleLogin}
          >
            <GoogleIcon size={24} />

            <Text
              style={[
                styles.googleButtonText,
                dark && styles.googleButtonTextDark,
              ]}
            >
              Continuar con Google
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

// ======================================================
// ESTILOS
// ======================================================

const styles = StyleSheet.create({
  // ==========================================
  // CONTENEDOR PRINCIPAL
  // ==========================================

  container: {
    alignItems: "center",
    flex: 1,

    /*
     * El fondo real se establece arriba dependiendo
     * del modo claro/oscuro.
     */
    paddingHorizontal: theme.spacing.lg,

    overflow: "hidden",
  },

  content: {
    flex: 1,
    width: "100%",
    zIndex: 1,
  },

  // ==========================================
  // ÁREA DEL LOGO
  // ==========================================

  logoArea: {
    flex: 1,

    alignItems: "center",
    justifyContent: "center",

    paddingTop: theme.spacing.xxl,
  },

  logoAreaCompact: {
    paddingTop: theme.spacing.lg,
  },

  // ==========================================
  // CONTENEDOR DE ANIMACIÓN
  // ==========================================

  logoAnimationContainer: {
    position: "relative",

    alignItems: "center",
    justifyContent: "center",

    /*
     * Es importante que sea visible.
     *
     * Así el halo puede expandirse alrededor
     * del logo sin quedar recortado.
     */
    overflow: "visible",

    /*
     * Espacio adicional alrededor del logo
     * para que el halo tenga espacio.
     */
    padding: 30,
  },

  // ==========================================
  // HALO
  // ==========================================

  logoGlow: {
    position: "absolute",

    /*
     * El halo es ligeramente mayor que el logo.
     */
    width: 330,
    height: 330,

    borderRadius: 165,

    /*
     * Brillo exterior.
     */
    shadowColor: "#2563EB",

    shadowOffset: {
      width: 0,
      height: 0,
    },

    shadowOpacity: 0.45,

    shadowRadius: 45,

    elevation: 10,
  },

  // ==========================================
  // LOGO
  // ==========================================

  logoWrapper: {
    position: "relative",

    alignItems: "center",
    justifyContent: "center",

    /*
     * Sin borderRadius.
     * Sin overflow hidden.
     *
     * Esto evita que aparezca un cuadro
     * alrededor del logo.
     */
    overflow: "visible",
  },

  // ==========================================
  // BOTONES
  // ==========================================

  buttonsArea: {
    alignSelf: "center",

    paddingBottom: theme.spacing.xxl,

    gap: theme.spacing.md,

    maxWidth: 340,

    width: "100%",
  },

  // ==========================================
  // BOTÓN INICIAR SESIÓN
  // ==========================================

  buttonFilled: {
    backgroundColor: "#FFFFFF",

    borderRadius: theme.radius.button,

    paddingVertical: theme.spacing.md + 2,

    alignItems: "center",
  },

  buttonPressedFilled: {
    backgroundColor: "#DCEAFF",
  },

  buttonFilledDark: {
    backgroundColor: "#E8F0FF",
  },

  buttonFilledText: {
    color: theme.colors.buttonPrimary,

    fontWeight: "700",

    fontSize: theme.fontSize.md,
  },

  // ==========================================
  // BOTÓN REGISTRARSE
  // ==========================================

  buttonOutline: {
    backgroundColor: "transparent",

    borderRadius: theme.radius.button,

    borderWidth: 1.5,

    borderColor: "#2563EB",

    paddingVertical: theme.spacing.md + 2,

    alignItems: "center",
  },

  buttonPressedOutline: {
    backgroundColor: "rgba(37, 99, 235, 0.08)",
  },

  buttonOutlineDark: {
    borderColor: "#93C5FD",
  },

  buttonOutlineText: {
    color: "#2563EB",

    fontWeight: "600",

    fontSize: theme.fontSize.md,
  },

  // ==========================================
  // BOTÓN GOOGLE
  // ==========================================

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

    shadowOffset: {
      width: 0,
      height: 2,
    },
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
