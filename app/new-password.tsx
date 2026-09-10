import { AuthScreenLayout } from "@/components/auth/AuthScreenLayout";
import { AuthPasswordField } from "@/components/auth/AuthTextField";
import { PrimaryButton } from "@/components/auth/PrimaryButton";
import { BackButton } from "@/components/common/BackButton";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { updateUserPassword } from "@/lib/auth/auth-store";
import { useResponsiveLayout } from "@/lib/responsive/responsive";
import { typography } from "@/lib/theme/typography";
import { getPasswordRules } from "@/lib/utils/validators";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

export default function NewPasswordScreen() {
  const router = useRouter();
  const layout = useResponsiveLayout();

  // ==========================================
  // PARÁMETROS
  // ==========================================

  const params = useLocalSearchParams<{ email?: string }>();

  const email = String(params.email ?? "")
    .trim()
    .toLowerCase();

  // ==========================================
  // ESTADO
  // ==========================================

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const [submitted, setSubmitted] = useState(false);

  // ==========================================
  // VALIDACIÓN DE CONTRASEÑA
  // ==========================================

  const passwordRules = useMemo(() => getPasswordRules(password), [password]);

  const strength = passwordRules.filter((rule) => rule.passed).length;

  const passwordIsStrong =
    passwordRules.length > 0 && strength === passwordRules.length;

  const passwordsMatch = password.length > 0 && password === confirmPassword;

  // ==========================================
  // ERRORES
  // ==========================================

  const passwordError = !passwordIsStrong
    ? "La contraseña no cumple los requisitos."
    : "";

  const confirmPasswordError = !passwordsMatch
    ? "Las contraseñas no coinciden."
    : "";

  // ==========================================
  // CAMBIAR CONTRASEÑA
  // ==========================================

  async function handleFinish() {
    setSubmitted(true);

    if (submitting) {
      return;
    }

    if (!email) {
      Alert.alert(
        "Solicitud inválida",
        "No se encontró el correo asociado a esta recuperación.",
      );

      return;
    }

    if (!passwordIsStrong) {
      Alert.alert(
        "Contraseña inválida",
        "La nueva contraseña no cumple los requisitos.",
      );

      return;
    }

    if (!passwordsMatch) {
      Alert.alert("Contraseñas diferentes", "Las contraseñas deben coincidir.");

      return;
    }

    setSubmitting(true);

    try {
      const updated = await updateUserPassword(email, password);

      if (!updated) {
        Alert.alert(
          "Solicitud inválida",
          "No encontramos una cuenta asociada a esta recuperación.",
        );

        return;
      }

      Alert.alert("Contraseña actualizada", "Ya puedes entrar a tu cuenta.", [
        {
          text: "Continuar",
          onPress: () => router.replace("/login"),
        },
      ]);
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
    <AuthScreenLayout compact={layout.compact} contentStyle={styles.content}>
      {/* ====================================== */}
      {/* BOTÓN VOLVER                           */}
      {/* ====================================== */}

      <View style={styles.header}>
        <BackButton fallbackHref="/otp-verification" />
      </View>

      {/* ====================================== */}
      {/* TÍTULO                                 */}
      {/* ====================================== */}

      <Text style={styles.sectionTitle}>Establecer contraseña</Text>

      {/* ====================================== */}
      {/* FORMULARIO                             */}
      {/* ====================================== */}

      <View style={styles.formContainer}>
        {/* ==================================== */}
        {/* NUEVA CONTRASEÑA                      */}
        {/* ==================================== */}

        <View>
          <AuthPasswordField
            error={submitted ? passwordError : ""}
            inputStyle={styles.input}
            onChangeText={setPassword}
            onToggleVisibility={() => setShowPassword((value) => !value)}
            placeholder="Nueva contraseña"
            showPassword={showPassword}
            value={password}
          />

          {password.length > 0 && (
            <View
              style={styles.strengthContainer}
              accessibilityLabel={`Fortaleza de contraseña: ${strength} de ${passwordRules.length}`}
            >
              <View
                style={[
                  styles.strengthBar,
                  {
                    width: `${
                      passwordRules.length > 0
                        ? (strength / passwordRules.length) * 100
                        : 0
                    }%`,
                    backgroundColor:
                      strength < 2
                        ? "#FF4D4D"
                        : strength < passwordRules.length
                          ? "#FFA500"
                          : "#003380",
                  },
                ]}
              />
            </View>
          )}
        </View>

        {/* ==================================== */}
        {/* CONFIRMAR CONTRASEÑA                  */}
        {/* ==================================== */}

        <AuthPasswordField
          error={submitted ? confirmPasswordError : ""}
          inputStyle={styles.input}
          onChangeText={setConfirmPassword}
          onToggleVisibility={() => setShowPassword((value) => !value)}
          placeholder="Confirmar contraseña"
          showPassword={showPassword}
          value={confirmPassword}
        />

        {/* ==================================== */}
        {/* BOTÓN                                 */}
        {/* ==================================== */}

        <PrimaryButton
          loading={submitting}
          onPress={handleFinish}
          style={styles.button}
          text="Finalizar"
        />
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
  content: {
    alignSelf: "center",
    width: "100%",
  },

  header: {
    marginBottom: 10,
  },

  sectionTitle: {
    color: "#3F3F3F",
    fontFamily: authFont,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 20,
  },

  formContainer: {
    gap: 16,
    width: "100%",
  },

  input: {
    backgroundColor: "#FBFBFD",
    borderColor: "transparent",
    borderWidth: 1,
    borderRadius: 17,

    color: "#3F3F3F",

    fontFamily: authFont,
    fontSize: 15,
    fontWeight: "500",

    height: 56,

    paddingHorizontal: 18,

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.18,
    shadowRadius: 5,

    elevation: 5,
  },

  strengthContainer: {
    height: 4,

    backgroundColor: "#E0E0E0",

    borderRadius: 2,

    marginTop: 8,

    overflow: "hidden",
  },

  strengthBar: {
    height: "100%",
  },

  button: {
    marginTop: 8,
  },
});
