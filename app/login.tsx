import { AuthCheckboxRow } from "@/components/auth/AuthCheckboxRow";
import { AuthScreenLayout } from "@/components/auth/AuthScreenLayout";
import { AuthPasswordField, AuthTextField } from "@/components/auth/AuthTextField";
import { PrimaryButton } from "@/components/auth/PrimaryButton";
import { BackButton } from "@/components/common/BackButton";
import { theme } from "@/constants/theme";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { authenticateUser } from "@/lib/auth/auth-store";
import { useSmartHome } from "@/lib/context/smart-home-context";
import { useResponsiveLayout } from "@/lib/responsive/responsive";
import { getAuthPalette } from "@/lib/theme/appearance";
import { typography } from "@/lib/theme/typography";
import { isValidEmail } from "@/lib/utils/validators";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
    Alert,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

/**
 * Pantalla de inicio de sesión.
 *
 * Esta pantalla valida credenciales contra el almacén local de usuarios y
 * simula login con mensajes de alerta. También incluye acceso demo para
 * explorar la app sin crear una cuenta real.
 */

export default function LoginScreen() {
  const router = useRouter();
  const layout = useResponsiveLayout();

  // Datos globales relacionados con cuenta y sesion.
  const { accountActive, colorMode, setAccountActive, setSessionName } = useSmartHome();
  const palette = getAuthPalette(colorMode);

  // Estados locales del formulario de login.
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Normaliza el correo para evitar errores por espacios o mayusculas.
  const cleanEmail = email.trim().toLowerCase();

  // Errores visibles solo cuando el usuario ya interactuo con el campo.
  // Esto evita mostrar validaciones antes de que el usuario comience a escribir.
  const emailError =
    touched.email && !isValidEmail(cleanEmail)
      ? "Ingresa un correo válido."
      : "";
  const passwordError =
    touched.password && password.length < 4
      ? "La contraseña debe tener mínimo 4 caracteres."
      : "";
  const canSubmit = isValidEmail(cleanEmail) && password.length >= 4;

  // Mensaje contextual que cambia con los intentos fallidos.
  const securityHint = useMemo(() => {
    if (failedAttempts === 0) return "Tus dispositivos se sincronizan al entrar.";
    if (failedAttempts === 1) return "Revisa mayúsculas y espacios antes de continuar.";
    return "Puedes usar el acceso demo para probar la app.";
  }, [failedAttempts]);

  /**
   * Completa credenciales de prueba.
   *
   * Sirve para demostrar la aplicacion sin depender de crear una cuenta nueva.
   */
  function fillDemoUser() {
    setEmail("pepe@smarthome.com");
    setPassword("Smart123!");
    setTouched({ email: true, password: true });
  }

  /**
   * Valida y ejecuta el inicio de sesion.
   *
   * Orden de decision:
   * 1. Marca campos como tocados para mostrar errores.
   * 2. Verifica si la cuenta global esta activa.
   * 3. Valida formato y longitud.
   * 4. Consulta usuarios desde la capa de autenticacion.
   * 5. Guarda el nombre de sesion y entra a las tabs.
   */
  async function handleLogin() {
    setTouched({ email: true, password: true });

    if (submitting) return;

    if (!accountActive) {
      Alert.alert(
        "Cuenta desactivada",
        "Esta cuenta fue desactivada. Puedes reactivarla para continuar en esta version de prueba.",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Reactivar", onPress: () => setAccountActive(true) },
        ],
      );
      return;
    }

    if (!canSubmit) {
      Alert.alert("Datos incompletos", "Corrige los campos marcados.");
      return;
    }

    setSubmitting(true);

    try {
      const user = await authenticateUser(cleanEmail, password);

      if (!user) {
        setFailedAttempts((value) => value + 1);
        Alert.alert("No pudimos iniciar sesion", "Correo o contrasena incorrectos.");
        return;
      }

      setFailedAttempts(0);
      setSessionName(user.name.split(" ")[0] || user.name);
      Alert.alert("Bienvenido", `Hola, ${user.name}.`, [
        { text: "Entrar", onPress: () => router.replace("/(tabs)") },
      ]);
    } catch (error) {
      Alert.alert("Error de conexion", getApiErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthScreenLayout
      backgroundColor={palette.background}
      compact={layout.compact}
      title="Smart Home"
      titleColor={palette.title}
      titleStyle={layout.tiny ? styles.titleTiny : undefined}
    >
      <BackButton color={palette.link} fallbackHref="/welcome" />

      <Pressable style={[styles.demoPill, { backgroundColor: palette.primarySoft }]} onPress={fillDemoUser}>
        <Ionicons name="flash-outline" size={18} color={palette.link} />
        <Text style={[styles.demoText, { color: palette.link }]}>Usar acceso demo</Text>
      </Pressable>

      <AuthTextField
        containerStyle={styles.fieldContainer}
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
        onBlur={() => setTouched((value) => ({ ...value, email: true }))}
        onChangeText={setEmail}
        placeholder="Correo electrónico"
        placeholderTextColor={palette.muted}
        value={email}
      />

      <AuthPasswordField
        containerStyle={styles.fieldContainer}
        error={passwordError}
        inputStyle={[
          styles.input,
          {
            backgroundColor: palette.field,
            borderColor: palette.fieldBorder,
            color: palette.text,
          },
        ]}
        onBlur={() => setTouched((value) => ({ ...value, password: true }))}
        onChangeText={setPassword}
        onToggleVisibility={() => setShowPassword((value) => !value)}
        placeholder="Contraseña"
        showPassword={showPassword}
        value={password}
      />

      <AuthCheckboxRow
        checked={rememberMe}
        label="Recordar contraseña"
        labelStyle={{ color: palette.text }}
        onToggle={() => setRememberMe((value) => !value)}
      />

      <View style={[styles.securityBox, { backgroundColor: palette.primarySoft }]}>
        <Ionicons name="shield-checkmark-outline" size={21} color={palette.link} />
        <Text style={[styles.securityText, { color: palette.text }]}>{securityHint}</Text>
      </View>

      <Pressable onPress={() => router.push("/forgot-password")} style={styles.linkRow}>
        <Text style={[styles.linkText, { color: palette.text }]}>¿Olvidaste tu contraseña?</Text>
      </Pressable>

      <PrimaryButton
        disabled={!canSubmit}
        loading={submitting}
        onPress={handleLogin}
        style={{ backgroundColor: palette.button }}
        text="Iniciar sesión"
      />

      <Pressable onPress={() => router.push("/register")} style={styles.registerRow}>
        <Text style={[styles.registerText, { color: palette.text }]}>¿No tienes cuenta? </Text>
        <Text style={[styles.registerText, styles.registerLink, { color: palette.link }]}>Registrarse</Text>
      </Pressable>
    </AuthScreenLayout>
  );
}

const authFont = typography.fontFamily.emphasis;

const styles = StyleSheet.create({
  titleTiny: {
    fontSize: 36,
    lineHeight: 43,
    marginBottom: 20,
  },
  fieldContainer: {
    width: "100%",
  },
  demoPill: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#EEF4FF",
    borderRadius: 12,
    flexDirection: "row",
    gap: 6,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  demoText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: "800",
  },
  input: {
    backgroundColor: "#FBFBFD",
    borderColor: "transparent",
    borderRadius: 17,
    borderWidth: 1,
    color: "#3F3F3F",
    fontFamily: authFont,
    fontSize: 20,
    fontWeight: "700",
    height: 56,
    marginTop: 10,
    paddingHorizontal: 18,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 5,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 8,
    marginTop: 6,
  },
  passwordWrap: {
    position: "relative",
  },
  passwordInput: {
    paddingRight: 52,
  },
  eyeButton: {
    bottom: 0,
    justifyContent: "center",
    position: "absolute",
    right: 16,
    top: 10,
  },
  checkboxRow: {
    alignItems: "center",
    flexDirection: "row",
    marginTop: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    alignItems: "center",
    backgroundColor: "#D8DADC",
    borderRadius: 5,
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primary,
  },
  checkboxLabel: {
    color: "#3F3F3F",
    fontFamily: authFont,
    fontSize: 17,
    fontWeight: "700",
    marginLeft: 10,
  },
  securityBox: {
    alignItems: "center",
    backgroundColor: "#EEF4FF",
    borderRadius: 12,
    flexDirection: "row",
    gap: 8,
    marginTop: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  securityText: {
    color: "#3F3F3F",
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
  },
  linkRow: {
    alignSelf: "center",
    marginTop: 20,
  },
  linkText: {
    color: "#3F3F3F",
    fontFamily: authFont,
    fontSize: 16,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  button: {
    alignItems: "center",
    backgroundColor: theme.colors.buttonPrimary,
    borderRadius: 15,
    height: 56,
    justifyContent: "center",
    marginTop: 30,
  },
  buttonPressed: {
    backgroundColor: theme.colors.primaryDark,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  buttonText: {
    color: "#FFFFFF",
    fontFamily: authFont,
    fontSize: 25,
    fontWeight: "700",
  },
  registerRow: {
    alignSelf: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 18,
  },
  registerText: {
    color: "#3F3F3F",
    fontSize: 14,
    fontWeight: "700",
  },
  registerLink: {
    color: theme.colors.primary,
    textDecorationLine: "underline",
  },
});
