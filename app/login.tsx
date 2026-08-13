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

export default function LoginScreen() {
  const router = useRouter();
  const layout = useResponsiveLayout();

  const { accountActive, colorMode, setAccountActive, setSessionName } = useSmartHome();
  const palette = getAuthPalette(colorMode);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const cleanEmail = email.trim().toLowerCase();

  const emailError =
    touched.email && !isValidEmail(cleanEmail)
      ? "Ingresa un correo válido."
      : "";
  const passwordError =
    touched.password && password.length < 4
      ? "La contraseña debe tener mínimo 4 caracteres."
      : "";
  const canSubmit = isValidEmail(cleanEmail) && password.length >= 4;

  const securityHint = useMemo(() => {
    if (failedAttempts === 0) return "Tus dispositivos se sincronizan al entrar.";
    if (failedAttempts === 1) return "Revisa mayúsculas y espacios antes de continuar.";
    return "Puedes usar el acceso demo para probar la app.";
  }, [failedAttempts]);

  function fillDemoUser() {
    setEmail("pepe@smarthome.com");
    setPassword("Smart123!");
    setTouched({ email: true, password: true });
  }

  async function handleLogin() {
    setTouched({ email: true, password: true });

    if (submitting) return;

    if (!accountActive) {
      Alert.alert(
        "Cuenta desactivada",
        "Esta cuenta fue desactivada. Puedes reactivarla para continuar en esta versión de prueba.",
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
        setFailedAttempts((prev) => prev + 1);
        Alert.alert("No pudimos iniciar sesión", "Correo o contraseña incorrectos.");
        return;
      }

      setFailedAttempts(0);
      setSessionName(user.name.split(" ")[0] || user.name);
      Alert.alert("Bienvenido", `Hola, ${user.name}.`, [
        { text: "Entrar", onPress: () => router.replace("/(tabs)") },
      ]);
    } catch (error) {
      Alert.alert("Error de conexión", getApiErrorMessage(error));
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

      <Pressable 
        style={[styles.demoPill, { backgroundColor: palette.primarySoft }]} 
        onPress={fillDemoUser}
        accessibilityRole="button"
        accessibilityLabel="Usar acceso demo"
      >
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
        autoCapitalize="none" // Evita que la primera letra sea mayúscula
        onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
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
        onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
        onChangeText={setPassword}
        onToggleVisibility={() => setShowPassword((prev) => !prev)}
        placeholder="Contraseña"
        showPassword={showPassword}
        value={password}
      />

      <AuthCheckboxRow
        checked={rememberMe}
        label="Recordar contraseña"
        labelStyle={{ color: palette.text }}
        onToggle={() => setRememberMe((prev) => !prev)}
      />

      <View style={[styles.securityBox, { backgroundColor: palette.primarySoft }]}>
        <Ionicons name="shield-checkmark-outline" size={21} color={palette.link} />
        <Text style={[styles.securityText, { color: palette.text }]}>{securityHint}</Text>
      </View>

      <Pressable 
        onPress={() => router.push("/forgot-password")} 
        style={styles.linkRow}
        accessibilityRole="button"
      >
        <Text style={[styles.linkText, { color: palette.text }]}>¿Olvidaste tu contraseña?</Text>
      </Pressable>

      <PrimaryButton
        disabled={!canSubmit}
        loading={submitting}
        onPress={handleLogin}
        style={{ backgroundColor: palette.button }}
        text="Iniciar sesión"
      />

      <Pressable 
        onPress={() => router.push("/register")} 
        style={styles.registerRow}
        accessibilityRole="link"
      >
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
    borderRadius: 12,
    flexDirection: "row",
    gap: 6,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  demoText: {
    fontSize: 14,
    fontWeight: "800",
  },
  input: {
    borderWidth: 1,
    borderRadius: 17,
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
  securityBox: {
    alignItems: "center",
    borderRadius: 12,
    flexDirection: "row",
    gap: 8,
    marginTop: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  securityText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
  },
  linkRow: {
    alignSelf: "center",
    marginTop: 20,
  },
  linkText: {
    fontFamily: authFont,
    fontSize: 16,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  registerRow: {
    alignSelf: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 18,
  },
  registerText: {
    fontSize: 14,
    fontWeight: "700",
  },
  registerLink: {
    textDecorationLine: "underline",
  },
});