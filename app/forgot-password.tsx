import { AuthScreenLayout } from "@/components/auth/AuthScreenLayout";
import { AuthTextField } from "@/components/auth/AuthTextField";
import { PrimaryButton } from "@/components/auth/PrimaryButton";
import { BackButton } from "@/components/common/BackButton";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { requestPasswordReset } from "@/lib/auth/auth-store";
import { useResponsiveLayout } from "@/lib/responsive/responsive";
import { typography } from "@/lib/theme/typography";
import { isValidEmail } from "@/lib/utils/validators";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const layout = useResponsiveLayout();

  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ==========================================
  // DATOS NORMALIZADOS
  // ==========================================

  const cleanEmail = email.trim().toLowerCase();

  // ==========================================
  // VALIDACIÓN
  // ==========================================

  const emailError = !isValidEmail(cleanEmail)
    ? "Ingresa un correo electrónico válido."
    : "";

  const canSubmit = !emailError;

  // ==========================================
  // ENVIAR ENLACE
  // ==========================================

  async function handleSendCode() {
    setSubmitted(true);

    if (!cleanEmail) {
      Alert.alert("Correo requerido", "Ingresa tu correo electrónico.");

      return;
    }

    if (!canSubmit) {
      Alert.alert("Correo inválido", "Ingresa un correo electrónico válido.");

      return;
    }

    setSubmitting(true);
    try {
      await requestPasswordReset(cleanEmail);
      Alert.alert(
        "Revisa tu correo",
        "Si existe una cuenta con ese correo, recibirás un enlace para restablecer la contraseña.",
        [{ text: "Aceptar", onPress: () => router.replace("/login") }],
      );
    } catch (error) {
      Alert.alert("No se pudo enviar el enlace", getApiErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthScreenLayout compact={layout.compact} contentStyle={styles.content}>
      {/* ====================================== */}
      {/* BOTÓN VOLVER                           */}
      {/* ====================================== */}

      <View style={styles.header}>
        <BackButton fallbackHref="/login" />
      </View>

      {/* ====================================== */}
      {/* TÍTULO                                 */}
      {/* ====================================== */}

      <Text style={styles.sectionTitle}>Recuperar contraseña</Text>

      {/* ====================================== */}
      {/* FORMULARIO                             */}
      {/* ====================================== */}

      <View style={styles.formContainer}>
        <AuthTextField
          error={submitted ? emailError : ""}
          inputStyle={styles.input}
          keyboardType="email-address"
          onChangeText={setEmail}
          placeholder="Correo electrónico"
          autoCapitalize="none"
          autoCorrect={false}
          value={email}
        />

        <PrimaryButton
          loading={submitting}
          onPress={() => void handleSendCode()}
          style={styles.button}
          text="Enviar enlace"
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

  button: {
    marginTop: 8,
  },
});
