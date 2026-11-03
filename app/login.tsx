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
import { useAppTheme } from "@/lib/theme/app-theme";
import { getAuthPalette } from "@/lib/theme/appearance";

import { isValidEmail } from "@/lib/utils/validators";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { styles } from "../styles/login.styles";

/**
 * "Recordarme" todavía no tiene efecto en el inicio de sesión.
 * Se oculta para no mostrar un control que no hace nada; cuando se
 * implemente, basta con cambiar este valor a `true`.
 */
const SHOW_REMEMBER_ME = false;

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuthSession();
  const layout = useResponsiveLayout();
  const theme = useAppTheme();

  const {
    colorPalette,
    effectiveColorMode,
    setSessionName,
    setSessionEmail,
    setSessionRole,
  } = useSmartHome();

  const palette = getAuthPalette(effectiveColorMode, colorPalette);

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

  /** Error general del formulario (credenciales o conexión). */
  const [formError, setFormError] = useState("");

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

    // Los errores de cada campo ya se muestran debajo de él.
    if (!canSubmit) {
      return;
    }

    setFormError("");
    setSubmitting(true);

    try {
      const loggedUser = await login(cleanEmail, password);

      if (!loggedUser) {
        setFormError("Correo o contraseña incorrectos.");
        return;
      }

      setSessionName(loggedUser.name.split(" ")[0] || loggedUser.name);
      setSessionEmail(loggedUser.email);
      setSessionRole(loggedUser.role ?? "miembro");
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  function updateEmail(value: string) {
    setEmail(value);
    if (formError) setFormError("");
  }

  function updatePassword(value: string) {
    setPassword(value);
    if (formError) setFormError("");
  }

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <AuthScreenLayout
      compact={layout.compact}
      contentStyle={styles.screenContent}
      contentTopPadding={layout.compact ? 4 : 8}
    >
      {/* Volver: anclado arriba, fuera del contenido */}
      <View style={styles.header}>
        <BackButton
          accessibilityLabel="Volver"
          backgroundColor="transparent"
          color={theme.textPrimary}
          fallbackHref="/welcome"
        />
      </View>

      <View style={styles.introSection}>
        <Text
          accessibilityRole="header"
          style={[
            styles.title,
            layout.tiny && styles.titleTiny,
            { color: theme.textPrimary },
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
        <AuthTextField
          autoCapitalize="none"
          autoCorrect={false}
          error={emailError}
          inputStyle={styles.input}
          keyboardType="email-address"
          label="Correo electrónico"
          onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
          onChangeText={updateEmail}
          placeholder="nombre@correo.com"
          returnKeyType="next"
          value={email}
          variant="outlined"
        />

        <View>
          <AuthPasswordField
            error={passwordError}
            inputStyle={styles.input}
            label="Contraseña"
            onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
            onChangeText={updatePassword}
            onSubmitEditing={() => void handleLogin()}
            onToggleVisibility={() => setShowPassword((prev) => !prev)}
            placeholder="Tu contraseña"
            returnKeyType="go"
            showPassword={showPassword}
            value={password}
            variant="outlined"
          />

          <View
            style={[
              styles.optionsRow,
              !SHOW_REMEMBER_ME && styles.optionsRowEnd,
            ]}
          >
            {SHOW_REMEMBER_ME ? (
              <View style={styles.rememberContainer}>
                <AuthCheckboxRow
                  checked={rememberMe}
                  label="Recordarme"
                  onToggle={() => setRememberMe((prev) => !prev)}
                />
              </View>
            ) : null}

            <Pressable
              accessibilityRole="link"
              hitSlop={8}
              onPress={() => router.push("/forgot-password")}
              style={styles.forgotButton}
            >
              <Text style={[styles.linkText, { color: palette.link }]}>
                ¿Olvidaste tu contraseña?
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Error general: credenciales incorrectas o fallo de conexión */}
        {formError ? (
          <View
            accessibilityLiveRegion="polite"
            accessibilityRole="alert"
            style={[styles.formError, { backgroundColor: theme.dangerSoft }]}
          >
            <Ionicons
              accessible={false}
              color={palette.danger}
              name="alert-circle-outline"
              size={18}
            />
            <Text style={[styles.formErrorText, { color: palette.danger }]}>
              {formError}
            </Text>
          </View>
        ) : null}

        <PrimaryButton
          loading={submitting}
          onPress={() => void handleLogin()}
          style={[styles.button, { backgroundColor: palette.button }]}
          text="Iniciar sesión"
        />
      </View>

      {/* Espacio flexible: los enlaces secundarios quedan al final */}
      <View style={styles.spacer} />

      <View style={styles.footer}>
        <View style={styles.registerRow}>
          <Text style={[styles.footerText, { color: palette.muted }]}>
            ¿No tienes una cuenta?
          </Text>
          <Pressable
            accessibilityRole="link"
            hitSlop={8}
            onPress={() => router.push("/register")}
          >
            <Text style={[styles.linkText, { color: palette.link }]}>
              Regístrate
            </Text>
          </Pressable>
        </View>

        <Pressable
          accessibilityRole="link"
          hitSlop={8}
          onPress={() =>
            router.push({
              pathname: "/request-reactivation",
              params: { email: cleanEmail },
            })
          }
        >
          <Text style={[styles.footerText, { color: palette.muted }]}>
            ¿Cuenta desactivada?{" "}
            <Text style={[styles.linkText, { color: palette.link }]}>
              Reactívala
            </Text>
          </Text>
        </Pressable>
      </View>
    </AuthScreenLayout>
  );
}