import { AuthCheckboxRow } from "@/components/auth/AuthCheckboxRow";
import { AuthScreenLayout } from "@/components/auth/AuthScreenLayout";
import { AuthPasswordField, AuthTextField } from "@/components/auth/AuthTextField";
import { PrimaryButton } from "@/components/auth/PrimaryButton";
import { BackButton } from "@/components/common/BackButton";
import { CheckIcon } from "@/components/icons/CheckIcon";
import { theme } from "@/constants/theme";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { registerUser } from "@/lib/auth/auth-store";
import { useResponsiveLayout } from "@/lib/responsive/responsive";
import { typography } from "@/lib/theme/typography";
import { getPasswordRules, isValidEmail } from "@/lib/utils/validators";
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
 * Pantalla de registro de cuenta.
 *
 * Recolecta nombre, correo, contraseñas y aceptación de términos para crear
 * un usuario simulado en memoria. Muestra reglas de fortaleza de contraseña.
 */

export default function RegisterScreen() {
  const router = useRouter();
  const layout = useResponsiveLayout();

  // Estados controlados del formulario de registro.
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Se normaliza para evitar duplicados por mayusculas o espacios.
  const cleanEmail = email.trim().toLowerCase();

  // Las reglas de contrasena se calculan fuera del JSX para mantener el render legible.
  const passwordRules = useMemo(() => getPasswordRules(password), [password]);
  const strength = passwordRules.filter((rule) => rule.passed).length;
  const passwordIsStrong = strength === passwordRules.length;
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  // Objeto centralizado de errores: facilita saber si el formulario se puede enviar.
  const errors = {
    firstName: firstName.trim().length < 2 ? "Ingresa tus nombres." : "",
    email: !isValidEmail(cleanEmail) ? "Ingresa un correo válido." : "",
    password: !passwordIsStrong ? "Cumple todos los requisitos de contraseña." : "",
    confirmPassword: !passwordsMatch ? "Las contraseñas no coinciden." : "",
    terms: !acceptTerms ? "Acepta los términos y la política de privacidad." : "",
  };

  const canSubmit = Object.values(errors).every((error) => !error);

  /**
   * Muestra errores solo despues del primer intento de envio.
   * Esto evita que la pantalla aparezca llena de errores apenas se abre.
   */
  function visibleError(key: keyof typeof errors) {
    return submitted ? errors[key] : "";
  }

  /**
   * Muestra condiciones legales de forma simulada.
   * En una version real podria abrir una pantalla o documento externo.
   */
  function showTerms() {
    Alert.alert(
      "Términos y condiciones",
      "Smart Home usará tus datos para crear la cuenta, sincronizar dispositivos y mostrar reportes de consumo. Puedes solicitar actualización o eliminación de tus datos desde soporte.",
    );
  }

  /**
   * Valida el formulario y registra el usuario en memoria.
   *
   * `registerUser` usa la capa de autenticacion, que hoy corre en mock local
   * y luego puede apuntar al backend.
   */
  async function handleRegister() {
    setSubmitted(true);

    if (submitting) return;

    if (!canSubmit) {
      Alert.alert("Registro incompleto", "Revisa los campos marcados.");
      return;
    }

    setSubmitting(true);

    try {
      const result = await registerUser({
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
        "Tu perfil Smart Home quedo listo. Ahora inicia sesion.",
        [{ text: "Iniciar sesion", onPress: () => router.replace("/login") }],
      );
    } catch (error) {
      Alert.alert("Error de conexion", getApiErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthScreenLayout compact={layout.compact} title="Smart Home">
      <BackButton fallbackHref="/welcome" />

      <AuthTextField
        containerStyle={styles.fieldContainer}
        error={visibleError("firstName")}
        inputStyle={[styles.input, styles.inputCompact]}
        onChangeText={setFirstName}
        placeholder="Nombres"
        value={firstName}
      />

      <AuthTextField
        containerStyle={styles.fieldContainer}
        error={visibleError("email")}
        inputStyle={[styles.input, styles.inputCompact]}
        keyboardType="email-address"
        onChangeText={setEmail}
        placeholder="Correo electrónico"
        value={email}
      />

      <AuthPasswordField
        containerStyle={styles.fieldContainer}
        error={visibleError("password")}
        inputStyle={[styles.input, styles.inputCompact]}
        onChangeText={setPassword}
        onToggleVisibility={() => setShowPassword((value) => !value)}
        placeholder="Contraseña"
        showPassword={showPassword}
        value={password}
      />

      {/* Indicador visual de la fortaleza de la contraseña basada en las reglas actuales. */}
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

      <AuthPasswordField
        containerStyle={styles.fieldContainer}
        error={visibleError("confirmPassword")}
        inputStyle={[styles.input, styles.inputCompact]}
        onChangeText={setConfirmPassword}
        onToggleVisibility={() => setShowPassword((value) => !value)}
        placeholder="Confirmar contraseña"
        showPassword={showPassword}
        value={confirmPassword}
      />

      <AuthCheckboxRow
        checked={acceptTerms}
        label={
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
        }
        labelStyle={{ flex: 1 }}
        onToggle={() => setAcceptTerms((value) => !value)}
      />
      {!!visibleError("terms") && <Text style={styles.errorText}>{errors.terms}</Text>}

      <PrimaryButton
        disabled={!canSubmit}
        loading={submitting}
        onPress={handleRegister}
        style={styles.button}
        text="Registrarse"
      />

      <Pressable onPress={() => router.replace("/login")} style={styles.loginRow}>
        <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
        <Text style={[styles.loginText, styles.loginLink]}>Inicia sesión</Text>
      </Pressable>
    </AuthScreenLayout>
  );
}

const authFont = typography.fontFamily.emphasis;

const styles = StyleSheet.create({
  fieldContainer: {
    width: "100%",
  },
  inputCompact: {
    marginTop: 0,
  },
  input: {
    backgroundColor: "#FBFBFD",
    borderColor: "transparent",
    borderRadius: 16,
    borderWidth: 1,
    color: "#3F3F3F",
    fontFamily: authFont,
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
    fontFamily: authFont,
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
    fontFamily: authFont,
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
