import { AuthCheckboxRow } from "@/components/auth/AuthCheckboxRow";
import { AuthScreenLayout } from "@/components/auth/AuthScreenLayout";
import {
  AuthPasswordField,
  AuthTextField,
} from "@/components/auth/AuthTextField";
import { PrimaryButton } from "@/components/auth/PrimaryButton";
import { BackButton } from "@/components/common/BackButton";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { authenticateUser } from "@/lib/auth/auth-store";
import { useSmartHome } from "@/lib/context/smart-home-context";
import { useResponsiveLayout } from "@/lib/responsive/responsive";
import { getAuthPalette } from "@/lib/theme/appearance";
import { typography } from "@/lib/theme/typography";
import { isValidEmail } from "@/lib/utils/validators";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

export default function LoginScreen() {
  const router = useRouter();
  const layout = useResponsiveLayout();

  const { accountActive, colorMode, setAccountActive, setSessionName, setSessionEmail, setSessionRole } =
    useSmartHome();

  const palette = getAuthPalette(colorMode);

  // ==========================================
  // ESTADO DEL FORMULARIO
  // ==========================================

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ==========================================
  // VALIDACIONES
  // ==========================================

  const cleanEmail = email.trim().toLowerCase();

  const emailError =
    (submitted || touched.email) && !isValidEmail(cleanEmail)
      ? "Ingresa un correo válido."
      : "";

  const passwordError =
    (submitted || touched.password) && password.length < 4
      ? "La contraseña debe tener mínimo 4 caracteres."
      : "";

  const canSubmit = isValidEmail(cleanEmail) && password.length >= 4;

  // ==========================================
  // ACCESO DEMO
  // ==========================================

  function fillDemoUser() {
    setEmail("pepe@smarthome.com");
    setPassword("Smart123!");

    setTouched({
      email: true,
      password: true,
    });

    setSubmitted(false);
  }

  // ==========================================
  // LOGIN
  // ==========================================

  async function handleLogin() {
    setSubmitted(true);

    if (submitting) {
      return;
    }

    // ========================================
    // CUENTA DESACTIVADA
    // ========================================

    if (!accountActive) {
      Alert.alert(
        "Cuenta desactivada",
        "Esta cuenta fue desactivada. Puedes reactivarla para continuar en esta versión de prueba.",
        [
          {
            text: "Cancelar",
            style: "cancel",
          },
          {
            text: "Reactivar",
            onPress: () => setAccountActive(true),
          },
        ],
      );

      return;
    }

    // ========================================
    // VALIDACIÓN
    // ========================================

    if (!canSubmit) {
      Alert.alert("Datos incompletos", "Corrige los campos marcados.");

      return;
    }

    // ========================================
    // INICIAR AUTENTICACIÓN
    // ========================================

    setSubmitting(true);

    try {
      const user = await authenticateUser(cleanEmail, password);

      // ======================================
      // CREDENCIALES INCORRECTAS
      // ======================================

      if (!user) {
        Alert.alert(
          "No pudimos iniciar sesión",
          "Correo o contraseña incorrectos.",
        );

        return;
      }

      // ======================================
      // LOGIN EXITOSO
      // ======================================

      setSessionName(user.name.split(" ")[0] || user.name);
      setSessionEmail(user.email);
      setSessionRole(user.role ?? "miembro");

      // ======================================
      // IR AL DASHBOARD
      // ======================================

      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert("Error de conexión", getApiErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <AuthScreenLayout
      backgroundColor={colorMode === "dark" ? "#08111F" : "#ffffff"}
      compact={layout.compact}
      title="Smart Home"
      titleColor={palette.title}
      titleStyle={layout.tiny ? styles.titleTiny : styles.brandTitle}
    >
      {/* ====================================== */}
      {/* BOTÓN VOLVER                           */}
      {/* ====================================== */}

      <View style={styles.header}>
        <BackButton color={palette.link} fallbackHref="/welcome" />
      </View>

      {/* ====================================== */}
      {/* FORMULARIO                             */}
      {/* ====================================== */}

      <View style={styles.formContainer}>
        {/* ==================================== */}
        {/* CORREO                               */}
        {/* ==================================== */}

        <View style={styles.fieldGroup}>
          <Text
            style={[
              styles.fieldLabel,
              {
                color: palette.text,
              },
            ]}
          >
            Correo electrónico
          </Text>

          <AuthTextField
            error={emailError}
            inputStyle={[
              styles.input,
              {
                backgroundColor: palette.field,
                borderColor: palette.fieldBorder,
                color: palette.text,
              },
            ]}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            onBlur={() =>
              setTouched((prev) => ({
                ...prev,
                email: true,
              }))
            }
            onChangeText={setEmail}
            placeholder="Correo electrónico"
            placeholderTextColor={palette.muted}
            value={email}
          />
        </View>

        {/* ==================================== */}
        {/* CONTRASEÑA                            */}
        {/* ==================================== */}

        <View style={styles.fieldGroup}>
          <Text
            style={[
              styles.fieldLabel,
              {
                color: palette.text,
              },
            ]}
          >
            Contraseña
          </Text>

          <AuthPasswordField
            error={passwordError}
            inputStyle={[
              styles.input,
              {
                backgroundColor: palette.field,
                borderColor: palette.fieldBorder,
                color: palette.text,
              },
            ]}
            onBlur={() =>
              setTouched((prev) => ({
                ...prev,
                password: true,
              }))
            }
            onChangeText={setPassword}
            onToggleVisibility={() => setShowPassword((prev) => !prev)}
            placeholder="Contraseña"
            showPassword={showPassword}
            value={password}
          />
        </View>

        {/* ==================================== */}
        {/* RECORDAR / OLVIDÉ                     */}
        {/* ==================================== */}

        <View style={styles.optionsRow}>
          <View style={styles.rememberContainer}>
            <AuthCheckboxRow
              checked={rememberMe}
              label="Recordarme"
              labelStyle={{
                color: palette.text,
              }}
              onToggle={() => setRememberMe((prev) => !prev)}
            />
          </View>

          <Pressable
            onPress={() => router.push("/forgot-password")}
            style={styles.forgotButton}
            accessibilityRole="button"
            accessibilityLabel="Recuperar contraseña"
          >
            <Text
              style={[
                styles.forgotText,
                {
                  color: palette.link,
                },
              ]}
            >
              ¿Olvidaste tu contraseña?
            </Text>
          </Pressable>
        </View>

        {/* ==================================== */}
        {/* BOTÓN PRINCIPAL                       */}
        {/* ==================================== */}

        <PrimaryButton
          loading={submitting}
          onPress={handleLogin}
          style={{
            backgroundColor: palette.button,
          }}
          text="Iniciar sesión"
        />

        {/* ==================================== */}
        {/* SEPARADOR                             */}
        {/* ==================================== */}

        <View style={styles.dividerContainer}>
          <View
            style={[
              styles.divider,
              {
                backgroundColor: palette.fieldBorder,
              },
            ]}
          />

          <Text
            style={[
              styles.dividerText,
              {
                color: palette.muted,
              },
            ]}
          >
            o continúa con
          </Text>

          <View
            style={[
              styles.divider,
              {
                backgroundColor: palette.fieldBorder,
              },
            ]}
          />
        </View>

        {/* ==================================== */}
        {/* ACCESO DEMO                           */}
        {/* ==================================== */}

        <Pressable
          style={[
            styles.demoButton,
            {
              backgroundColor: palette.primarySoft,
              borderColor: palette.fieldBorder,
            },
          ]}
          onPress={fillDemoUser}
          accessibilityRole="button"
          accessibilityLabel="Usar acceso demo"
        >
          <View
            style={[
              styles.demoIconContainer,
              {
                backgroundColor: palette.button,
              },
            ]}
          >
            <Ionicons name="flash" size={17} color="#FFFFFF" />
          </View>

          <View style={styles.demoContent}>
            <Text
              style={[
                styles.demoTitle,
                {
                  color: palette.text,
                },
              ]}
            >
              Usar acceso demo
            </Text>

            <Text
              style={[
                styles.demoSubtitle,
                {
                  color: palette.muted,
                },
              ]}
            >
              Prueba la aplicación sin crear una cuenta
            </Text>
          </View>

          <Ionicons name="chevron-forward" size={20} color={palette.muted} />
        </Pressable>

        {/* ==================================== */}
        {/* REGISTRO                              */}
        {/* ==================================== */}

        <View style={styles.registerRow}>
          <Text
            style={[
              styles.registerText,
              {
                color: palette.muted,
              },
            ]}
          >
            ¿No tienes una cuenta?
          </Text>

          <Pressable
            onPress={() => router.push("/register")}
            accessibilityRole="link"
            accessibilityLabel="Registrarse"
          >
            <Text
              style={[
                styles.registerLink,
                {
                  color: palette.link,
                },
              ]}
            >
              Registrarse
            </Text>
          </Pressable>
        </View>
      </View>
    </AuthScreenLayout>
  );
}

// ======================================================
// TIPOGRAFÍA
// ======================================================

const authFont = typography.fontFamily.emphasis;

// ======================================================
// ESTILOS
// ======================================================

const styles = StyleSheet.create({
  // ==========================================
  // TÍTULO DE MARCA
  // ==========================================

  brandTitle: {
    fontSize: 30,
    lineHeight: 36,
    marginBottom: 8,
  },

  titleTiny: {
    fontSize: 30,
    lineHeight: 36,
    marginBottom: 10,
  },

  // ==========================================
  // HEADER
  // ==========================================

  header: {
    marginBottom: 12,
  },

  // ==========================================
  // INTRODUCCIÓN
  // ==========================================

  introSection: {
    marginBottom: 28,
  },

  welcomeTitle: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "800",
    marginBottom: 6,
    fontFamily: authFont,
  },

  welcomeSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "500",
  },

  // ==========================================
  // FORMULARIO
  // ==========================================

  formContainer: {
    gap: 18,
    width: "100%",
  },

  // ==========================================
  // CAMPOS
  // ==========================================

  fieldGroup: {
    width: "100%",
    gap: 8,
  },

  fieldLabel: {
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 3,
  },

  input: {
    borderWidth: 1,
    borderRadius: 17,

    fontFamily: authFont,
    fontSize: 15,
    fontWeight: "500",

    height: 56,

    paddingHorizontal: 18,

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,

    elevation: 3,
  },

  // ==========================================
  // RECORDAR / OLVIDÉ
  // ==========================================

  optionsRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    marginTop: -3,
  },

  rememberContainer: {
    flex: 1,
  },

  forgotButton: {
    paddingVertical: 5,
    paddingLeft: 8,
  },

  forgotText: {
    fontSize: 14,
    fontWeight: "700",
    textDecorationLine: "underline",
  },

  // ==========================================
  // SEPARADOR
  // ==========================================

  dividerContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,

    marginVertical: 2,
  },

  divider: {
    flex: 1,
    height: 1,
  },

  dividerText: {
    fontSize: 13,
    fontWeight: "600",
  },

  // ==========================================
  // ACCESO DEMO
  // ==========================================

  demoButton: {
    width: "100%",

    minHeight: 62,

    borderRadius: 16,
    borderWidth: 1,

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 14,
    paddingVertical: 10,

    gap: 12,
  },

  demoIconContainer: {
    width: 36,
    height: 36,

    borderRadius: 11,

    alignItems: "center",
    justifyContent: "center",
  },

  demoContent: {
    flex: 1,
  },

  demoTitle: {
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 2,
  },

  demoSubtitle: {
    fontSize: 12,
    fontWeight: "500",
  },

  // ==========================================
  // SEGURIDAD
  // ==========================================

  securityRow: {
    flexDirection: "row",
    alignItems: "center",

    justifyContent: "center",

    gap: 6,

    paddingHorizontal: 5,

    marginTop: -3,
  },

  securityText: {
    fontSize: 11.5,
    fontWeight: "600",
    textAlign: "center",
  },

  // ==========================================
  // REGISTRO
  // ==========================================

  registerRow: {
    alignItems: "center",
    justifyContent: "center",

    flexDirection: "row",
    flexWrap: "wrap",

    gap: 5,

    marginTop: 4,
  },

  registerText: {
    fontSize: 14,
    fontWeight: "600",
  },

  registerLink: {
    fontSize: 14,
    fontWeight: "800",
    textDecorationLine: "underline",
  },
});
