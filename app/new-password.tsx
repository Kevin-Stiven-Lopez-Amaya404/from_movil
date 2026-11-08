import { AuthScreenLayout } from "@/components/auth/AuthScreenLayout";
import { AuthPasswordField } from "@/components/auth/AuthTextField";
import { PrimaryButton } from "@/components/auth/PrimaryButton";
import { BackButton } from "@/components/common/BackButton";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { resetUserPassword } from "@/lib/auth/auth-store";
import { useResponsiveLayout } from "@/lib/responsive/responsive";
import { useAuthPalette } from "@/lib/theme/appearance";

import { getPasswordRules } from "@/lib/utils/validators";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, Text, View } from "react-native";
import { styles } from "../styles/new-password.styles";

export default function NewPasswordScreen() {
  const router = useRouter();
  const layout = useResponsiveLayout();
  const palette = useAuthPalette();

  // ==========================================
  // PARAMETERS
  // ==========================================

  const params = useLocalSearchParams<{ token?: string | string[] }>();
  const token =
    typeof params.token === "string" ? params.token : (params.token?.[0] ?? "");

  // ==========================================
  // STATE
  // ==========================================

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const [submitted, setSubmitted] = useState(false);

  // ==========================================
  // PASSWORD VALIDATION
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
  // CHANGE PASSWORD
  // ==========================================

  async function handleFinish() {
    setSubmitted(true);

    if (submitting) {
      return;
    }

    if (!token) {
      Alert.alert(
        "Solicitud inválida",
        "El enlace de recuperación no contiene un token válido.",
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
      await resetUserPassword(token, password, confirmPassword);

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
      {/* BACK BUTTON                            */}
      {/* ====================================== */}

      <View style={styles.header}>
        <BackButton color={palette.link} fallbackHref="/forgot-password" />
      </View>

      {/* ====================================== */}
      {/* TITLE                                  */}
      {/* ====================================== */}

      <Text
        accessibilityRole="header"
        style={[styles.sectionTitle, { color: palette.text }]}
      >
        Establecer contraseña
      </Text>

      {/* ====================================== */}
      {/* FORMULARIO                             */}
      {/* ====================================== */}

      <View style={styles.formContainer}>
        {/* ==================================== */}
        {/* NEW PASSWORD                          */}
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
              style={[styles.strengthContainer, { backgroundColor: palette.divider }]}
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
                        ? palette.danger
                        : strength < passwordRules.length
                          ? palette.warning
                          : palette.success,
                  },
                ]}
              />
            </View>
          )}
        </View>

        {/* ==================================== */}
        {/* CONFIRM PASSWORD                      */}
        {/* ==================================== */}

        <AuthPasswordField
          error={submitted ? confirmPasswordError : ""}
          inputStyle={styles.input}
          onChangeText={setConfirmPassword}
          onToggleVisibility={() => setShowConfirmPassword((value) => !value)}
          placeholder="Confirmar contraseña"
          showPassword={showConfirmPassword}
          value={confirmPassword}
        />

        {/* ==================================== */}
        {/* BUTTON                                */}
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
// TYPOGRAPHY
// ======================================================



// ======================================================
// ESTILOS
// ======================================================
