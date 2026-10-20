import { AuthCheckboxRow } from "@/components/auth/AuthCheckboxRow";
import { AuthScreenLayout } from "@/components/auth/AuthScreenLayout";
import {
  AuthPasswordField,
  AuthTextField,
} from "@/components/auth/AuthTextField";
import { PrimaryButton } from "@/components/auth/PrimaryButton";
import { BackButton } from "@/components/common/BackButton";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { useAuthSession } from "@/lib/auth/auth-session-context";
import { useSmartHome } from "@/lib/context/smart-home-context";
import { useResponsiveLayout } from "@/lib/responsive/responsive";
import { getAuthPalette } from "@/lib/theme/appearance";

import { isValidEmail } from "@/lib/utils/validators";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { styles } from "../styles/login.styles";

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuthSession();
  const layout = useResponsiveLayout();

  const {
    effectiveColorMode,
    setSessionName,
    setSessionEmail,
    setSessionRole,
  } = useSmartHome();

  const palette = getAuthPalette(effectiveColorMode);

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
  // LOGIN
  // ==========================================

  async function handleLogin() {
    setSubmitted(true);

    if (submitting) {
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
      const loggedUser = await login(cleanEmail, password);

      // ======================================
      // CREDENCIALES INCORRECTAS
      // ======================================

      if (!loggedUser) {
        Alert.alert(
          "No pudimos iniciar sesión",
          "Correo o contraseña incorrectos.",
        );

        return;
      }

      // ======================================
      // LOGIN EXITOSO
      // ======================================

      setSessionName(loggedUser.name.split(" ")[0] || loggedUser.name);
      setSessionEmail(loggedUser.email);
      setSessionRole(loggedUser.role ?? "miembro");

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
      compact={layout.compact}
      contentStyle={styles.screenContent}
      contentTopPadding={layout.compact ? 14 : 22}
    >
      {/* ====================================== */}
      {/* BOTÓN VOLVER                           */}
      {/* ====================================== */}

      <View style={styles.header}>
        <BackButton color={palette.link} fallbackHref="/welcome" />
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.introSection}>
        <Text
          style={[
            styles.title,
            layout.tiny && styles.titleTiny,
            { color: palette.title },
          ]}
        >
          Bienvenido de nuevo
        </Text>
        <Text style={[styles.subtitle, { color: palette.muted }]}>
          Inicia sesión para conectar con tu hogar.
        </Text>
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
            variant="outlined"
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
            variant="outlined"
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

        <Pressable
          onPress={() =>
            router.push({
              pathname: "/request-reactivation",
              params: { email: cleanEmail },
            })
          }
          style={styles.reactivationLink}
          accessibilityRole="link"
          accessibilityLabel="Solicitar reactivación de cuenta"
        >
          <Text style={[styles.reactivationLinkText, { color: palette.link }]}>
            ¿Tu cuenta está desactivada? Solicita reactivación
          </Text>
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



// ======================================================
// ESTILOS
// ======================================================
