import { CheckIcon } from "@/components/icons/CheckIcon";
import { BackButton } from "@/components/navigation/BackButton";
import { theme } from "@/constants/theme";
import { registerUser } from "@/lib/auth-store";
import { useResponsiveLayout } from "@/lib/responsive";
import { getPasswordRules, isValidEmail } from "@/lib/validators";
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

export default function RegisterScreen() {
  const router = useRouter();
  const layout = useResponsiveLayout();
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const cleanEmail = email.trim().toLowerCase();

  const passwordRules = useMemo(() => getPasswordRules(password), [password]);
  const strength = passwordRules.filter((rule) => rule.passed).length;
  const passwordIsStrong = strength === passwordRules.length;
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const errors = {
    firstName: firstName.trim().length < 2 ? "Ingresa tus nombres." : "",
    email: !isValidEmail(cleanEmail) ? "Ingresa un correo válido." : "",
    password: !passwordIsStrong ? "Cumple todos los requisitos de contraseña." : "",
    confirmPassword: !passwordsMatch ? "Las contraseñas no coinciden." : "",
    terms: !acceptTerms ? "Acepta los términos y la política de privacidad." : "",
  };

  const canSubmit = Object.values(errors).every((error) => !error);

  function visibleError(key: keyof typeof errors) {
    return submitted ? errors[key] : "";
  }

  function showTerms() {
    Alert.alert(
      "Términos y condiciones",
      "Smart Home usará tus datos para crear la cuenta, sincronizar dispositivos y mostrar reportes de consumo. Puedes solicitar actualización o eliminación de tus datos desde soporte.",
    );
  }

  function handleRegister() {
    setSubmitted(true);

    if (!canSubmit) {
      Alert.alert("Registro incompleto", "Revisa los campos marcados.");
      return;
    }

    const result = registerUser({
      email: cleanEmail,
      name: firstName.trim(),
      password,
    });

    if (!result.ok) {
      Alert.alert("Correo registrado", "Ya existe una cuenta con este correo.");
      return;
    }

    Alert.alert(
      "Cuenta creada",
      "Tu perfil Smart Home quedó listo. Ahora inicia sesión.",
      [{ text: "Iniciar sesión", onPress: () => router.replace("/login") }],
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={[
            styles.container,
            {
              paddingHorizontal: layout.gutter,
              paddingTop: layout.compact ? 28 : 54,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.content, { maxWidth: layout.contentWidth }]}>
          <BackButton fallbackHref="/welcome" />
          <Text style={[styles.title, layout.tiny && styles.titleTiny]}>Smart Home</Text>

          <TextInput
            style={[styles.input, visibleError("firstName") && styles.inputError]}
            placeholder="Nombres"
            placeholderTextColor={theme.colors.placeholder}
            autoCapitalize="words"
            value={firstName}
            onChangeText={setFirstName}
          />
          {!!visibleError("firstName") && <Text style={styles.errorText}>{errors.firstName}</Text>}

          <TextInput
            style={[styles.input, visibleError("email") && styles.inputError]}
            placeholder="Correo electrónico"
            placeholderTextColor={theme.colors.placeholder}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
          />
          {!!visibleError("email") && <Text style={styles.errorText}>{errors.email}</Text>}

          <View style={styles.passwordWrap}>
            <TextInput
              style={[styles.input, styles.passwordInput, visibleError("password") && styles.inputError]}
              placeholder="Contraseña"
              placeholderTextColor={theme.colors.placeholder}
              secureTextEntry={!showPassword}
              value={password}
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
                color={theme.colors.textMuted}
              />
            </Pressable>
          </View>
          {!!visibleError("password") && <Text style={styles.errorText}>{errors.password}</Text>}

          <View style={styles.strengthBox}>
            <Text style={styles.requirementsTitle}>Requisitos de la contraseña</Text>
            <View style={styles.strengthBars}>
              {[0, 1, 2, 3].map((item) => (
                <View
                  key={item}
                  style={[styles.strengthBar, item < strength && styles.strengthBarOn]}
                />
              ))}
            </View>
            <View style={styles.rulesGrid}>
              {passwordRules.map((rule) => (
                <View key={rule.label} style={styles.ruleItem}>
                  <View style={[styles.ruleDot, rule.passed && styles.ruleDotOn]}>
                    {rule.passed && <CheckIcon />}
                  </View>
                  <Text style={styles.ruleText}>{rule.label}</Text>
                </View>
              ))}
            </View>
          </View>

          <TextInput
            style={[styles.input, visibleError("confirmPassword") && styles.inputError]}
            placeholder="Confirmar contraseña"
            placeholderTextColor={theme.colors.placeholder}
            secureTextEntry={!showPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          {!!visibleError("confirmPassword") && (
            <Text style={styles.errorText}>{errors.confirmPassword}</Text>
          )}

          <Pressable
            style={styles.termsRow}
            onPress={() => setAcceptTerms((value) => !value)}
          >
            <View style={[styles.checkbox, acceptTerms && styles.checkboxChecked]}>
              {acceptTerms && <CheckIcon />}
            </View>
            <Text style={styles.termsText}>
              Acepto los{" "}
              <Text style={styles.inlineLink} onPress={showTerms}>
                términos y condiciones
              </Text>{" "}
              y la{" "}
              <Text style={styles.inlineLink} onPress={showTerms}>
                política de privacidad
              </Text>{" "}
              de Smart Home.
            </Text>
          </Pressable>
          {!!visibleError("terms") && <Text style={styles.errorText}>{errors.terms}</Text>}

          <Pressable
            style={({ pressed }) => [
              styles.button,
              !canSubmit && styles.buttonDisabled,
              pressed && canSubmit && styles.buttonPressed,
            ]}
            onPress={handleRegister}
          >
            <Text style={styles.buttonText}>Registrarse</Text>
          </Pressable>

          <Pressable onPress={() => router.replace("/login")} style={styles.loginRow}>
            <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
            <Text style={[styles.loginText, styles.loginLink]}>Inicia sesión</Text>
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
    paddingBottom: 34,
  },
  content: {
    alignSelf: "center",
    width: "100%",
  },
  title: {
    color: "#0864C8",
    fontFamily: serifFont,
    fontSize: 40,
    fontWeight: "700",
    lineHeight: 48,
    marginBottom: 20,
    textAlign: "center",
  },
  titleTiny: {
    fontSize: 34,
    lineHeight: 41,
    marginBottom: 16,
  },
  input: {
    backgroundColor: "#FBFBFD",
    borderColor: "transparent",
    borderRadius: 16,
    borderWidth: 1,
    color: "#3F3F3F",
    fontFamily: serifFont,
    fontSize: 19,
    fontWeight: "700",
    height: 52,
    marginTop: 11,
    paddingHorizontal: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
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
    marginTop: 5,
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
    top: 11,
  },
  strengthBox: {
    backgroundColor: "#EEF4FF",
    borderRadius: 14,
    marginTop: 10,
    padding: 12,
  },
  requirementsTitle: {
    color: "#3F3F3F",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 10,
  },
  strengthBars: {
    flexDirection: "row",
    gap: 6,
  },
  strengthBar: {
    backgroundColor: "#CDD6EA",
    borderRadius: 4,
    flex: 1,
    height: 7,
  },
  strengthBarOn: {
    backgroundColor: theme.colors.primary,
  },
  rulesGrid: {
    gap: 8,
    marginTop: 10,
  },
  ruleItem: {
    alignItems: "center",
    flexDirection: "row",
  },
  ruleDot: {
    width: 18,
    height: 18,
    alignItems: "center",
    backgroundColor: "#CCD4E6",
    borderRadius: 9,
    justifyContent: "center",
    marginRight: 8,
  },
  ruleDotOn: {
    backgroundColor: theme.colors.primary,
  },
  ruleText: {
    color: "#3F3F3F",
    flex: 1,
    fontSize: 12,
    fontWeight: "700",
  },
  termsRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },
  checkbox: {
    width: 20,
    height: 20,
    alignItems: "center",
    backgroundColor: "#D8DADC",
    borderRadius: 5,
    justifyContent: "center",
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primary,
  },
  termsText: {
    color: "#3F3F3F",
    flex: 1,
    fontFamily: serifFont,
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 20,
  },
  inlineLink: {
    color: theme.colors.primary,
    textDecorationLine: "underline",
  },
  button: {
    alignItems: "center",
    backgroundColor: theme.colors.buttonPrimary,
    borderRadius: 15,
    height: 54,
    justifyContent: "center",
    marginTop: 28,
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
    fontSize: 24,
    fontWeight: "700",
  },
  loginRow: {
    alignSelf: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 16,
  },
  loginText: {
    color: "#3F3F3F",
    fontSize: 14,
    fontWeight: "700",
  },
  loginLink: {
    color: theme.colors.primary,
    textDecorationLine: "underline",
  },
});
