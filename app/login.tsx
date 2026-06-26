import { CheckIcon } from "@/components/icons/CheckIcon";
import { BackButton } from "@/components/navigation/BackButton";
import { theme } from "@/constants/theme";
import { getAuthPalette } from "@/lib/appearance";
import { authenticateUser } from "@/lib/auth-store";
import { useResponsiveLayout } from "@/lib/responsive";
import { useSmartHome } from "@/lib/smart-home-context";
import { isValidEmail } from "@/lib/validators";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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

  function handleLogin() {
    setTouched({ email: true, password: true });

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

    const user = authenticateUser(cleanEmail, password);

    if (!user) {
      setFailedAttempts((value) => value + 1);
      Alert.alert("No pudimos iniciar sesión", "Correo o contraseña incorrectos.");
      return;
    }

    setFailedAttempts(0);
    setSessionName(user.name.split(" ")[0] || user.name);
    Alert.alert("Bienvenido", `Hola, ${user.name}.`, [
      { text: "Entrar", onPress: () => router.replace("/(tabs)") },
    ]);
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={[
            styles.container,
            {
              paddingHorizontal: layout.gutter,
              paddingTop: layout.compact ? 32 : 64,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.content, { maxWidth: layout.contentWidth }]}>
          <BackButton color={palette.link} fallbackHref="/welcome" />
          <Text style={[styles.title, layout.tiny && styles.titleTiny, { color: palette.title }]}>Smart Home</Text>

          <Pressable style={[styles.demoPill, { backgroundColor: palette.primarySoft }]} onPress={fillDemoUser}>
            <Ionicons name="flash-outline" size={18} color={palette.link} />
            <Text style={[styles.demoText, { color: palette.link }]}>Usar acceso demo</Text>
          </Pressable>

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: palette.field,
                borderColor: palette.fieldBorder,
                color: palette.text,
              },
              emailError && styles.inputError,
            ]}
            placeholder="Correo electrónico"
            placeholderTextColor={palette.muted}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onBlur={() => setTouched((value) => ({ ...value, email: true }))}
            onChangeText={setEmail}
          />
          {!!emailError && <Text style={styles.errorText}>{emailError}</Text>}

          <View style={styles.passwordWrap}>
            <TextInput
              style={[
                styles.input,
                styles.passwordInput,
                {
                  backgroundColor: palette.field,
                  borderColor: palette.fieldBorder,
                  color: palette.text,
                },
                passwordError && styles.inputError,
              ]}
              placeholder="Contraseña"
              placeholderTextColor={palette.muted}
              secureTextEntry={!showPassword}
              value={password}
              onBlur={() => setTouched((value) => ({ ...value, password: true }))}
              onChangeText={setPassword}
            />
            <Pressable
              accessibilityLabel={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              style={styles.eyeButton}
              onPress={() => setShowPassword((value) => !value)}
            >
              <Ionicons
                name={showPassword ? "eye-outline" : "eye-off-outline"}
                size={21}
                color={palette.muted}
              />
            </Pressable>
          </View>
          {!!passwordError && <Text style={styles.errorText}>{passwordError}</Text>}

          <Pressable
            style={styles.checkboxRow}
            onPress={() => setRememberMe((value) => !value)}
          >
            <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
              {rememberMe && <CheckIcon />}
            </View>
            <Text style={[styles.checkboxLabel, { color: palette.text }]}>Recordar contraseña</Text>
          </Pressable>

          <View style={[styles.securityBox, { backgroundColor: palette.primarySoft }]}>
            <Ionicons name="shield-checkmark-outline" size={21} color={palette.link} />
            <Text style={[styles.securityText, { color: palette.text }]}>{securityHint}</Text>
          </View>

          <Pressable onPress={() => router.push("/forgot-password")} style={styles.linkRow}>
            <Text style={[styles.linkText, { color: palette.text }]}>¿Olvidaste tu contraseña?</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.button,
              !canSubmit && styles.buttonDisabled,
              { backgroundColor: palette.button },
              pressed && canSubmit && { backgroundColor: palette.buttonPressed },
            ]}
            onPress={handleLogin}
          >
            <Text style={styles.buttonText}>Iniciar sesión</Text>
          </Pressable>

          <Pressable onPress={() => router.push("/register")} style={styles.registerRow}>
            <Text style={[styles.registerText, { color: palette.text }]}>¿No tienes cuenta? </Text>
            <Text style={[styles.registerText, styles.registerLink, { color: palette.link }]}>Registrarse</Text>
          </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const serifFont = Platform.select({
  ios: "Georgia",
  android: "serif",
  default: "Georgia",
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.backgroundWhite,
  },
  flex: { flex: 1 },
  container: {
    alignItems: "center",
    flexGrow: 1,
    paddingBottom: 38,
  },
  content: {
    alignSelf: "center",
    width: "100%",
  },
  title: {
    color: "#0864C8",
    fontFamily: serifFont,
    fontSize: 42,
    fontWeight: "700",
    lineHeight: 51,
    marginBottom: 26,
    textAlign: "center",
  },
  titleTiny: {
    fontSize: 36,
    lineHeight: 43,
    marginBottom: 20,
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
    fontFamily: serifFont,
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
    fontFamily: serifFont,
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
    alignSelf: "flex-start",
    marginTop: 20,
  },
  linkText: {
    color: "#3F3F3F",
    fontFamily: serifFont,
    fontSize: 20,
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
    fontFamily: serifFont,
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
