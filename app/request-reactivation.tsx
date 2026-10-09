import { AuthScreenLayout } from "@/components/auth/AuthScreenLayout";
import { AuthTextField } from "@/components/auth/AuthTextField";
import { PrimaryButton } from "@/components/auth/PrimaryButton";
import { BackButton } from "@/components/common/BackButton";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { requestAccountReactivation } from "@/lib/auth/auth-store";
import { useResponsiveLayout } from "@/lib/responsive/responsive";
import { typography } from "@/lib/theme/typography";
import { isValidEmail } from "@/lib/utils/validators";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

export default function RequestReactivationScreen() {
  const router = useRouter();
  const layout = useResponsiveLayout();
  const params = useLocalSearchParams<{ email?: string | string[] }>();

  const initialEmail =
    typeof params.email === "string"
      ? params.email
      : (params.email?.[0] ?? "");

  const [email, setEmail] = useState(initialEmail);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const cleanEmail = email.trim().toLowerCase();
  const emailError = isValidEmail(cleanEmail)
    ? ""
    : "Ingresa un correo electrónico válido.";
  const canSubmit = !emailError;

  async function handleRequest() {
    setSubmitted(true);

    if (submitting || !canSubmit) return;

    setSubmitting(true);

    try {
      await requestAccountReactivation(cleanEmail);

      Alert.alert(
        "Revisa tu correo",
        "Si existe una cuenta desactivada asociada a este correo, enviaremos un enlace para reactivarla.",
        [{ text: "Aceptar", onPress: () => router.replace("/login") }],
      );
    } catch (error) {
      Alert.alert(
        "No se pudo solicitar la reactivación",
        getApiErrorMessage(error),
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthScreenLayout compact={layout.compact} contentStyle={styles.content}>
      <View style={styles.header}>
        <BackButton fallbackHref="/login" />
      </View>

      <Text style={styles.sectionTitle}>Reactivar cuenta</Text>
      <Text style={styles.description}>
        Ingresa el correo de la cuenta. Si está desactivada, recibirás un enlace
        para reactivarla.
      </Text>

      <View style={styles.formContainer}>
        <AuthTextField
          error={submitted ? emailError : ""}
          inputStyle={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={setEmail}
          placeholder="Correo electrónico"
          value={email}
        />

        <PrimaryButton
          loading={submitting}
          onPress={() => void handleRequest()}
          style={styles.button}
          text="Enviar enlace"
        />
      </View>
    </AuthScreenLayout>
  );
}

const authFont = typography.fontFamily.emphasis;

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
    marginBottom: 10,
  },
  description: {
    color: "#666666",
    fontFamily: authFont,
    fontSize: 14,
    lineHeight: 21,
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
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 5,
  },
  button: {
    marginTop: 8,
  },
});