import { AuthScreenLayout } from "@/components/auth/AuthScreenLayout";
import { AuthTextField } from "@/components/auth/AuthTextField";
import { PrimaryButton } from "@/components/auth/PrimaryButton";
import { BackButton } from "@/components/common/BackButton";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { requestAccountReactivation } from "@/lib/auth/auth-store";
import { useResponsiveLayout } from "@/lib/responsive/responsive";
import { useAuthPalette } from "@/lib/theme/appearance";

import { isValidEmail } from "@/lib/utils/validators";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Text, View } from "react-native";
import { styles } from "./request-reactivation.styles";

export default function RequestReactivationScreen() {
  const router = useRouter();
  const layout = useResponsiveLayout();
  const palette = useAuthPalette();
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
        <BackButton color={palette.link} fallbackHref="/login" />
      </View>

      <Text style={[styles.sectionTitle, { color: palette.text }]}>Reactivar cuenta</Text>
      <Text style={[styles.description, { color: palette.muted }]}>
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
