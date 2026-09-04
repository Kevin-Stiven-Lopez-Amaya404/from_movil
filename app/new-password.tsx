import { AuthCheckboxRow } from "@/components/auth/AuthCheckboxRow";
import { AuthScreenLayout } from "@/components/auth/AuthScreenLayout";
import { AuthPasswordField } from "@/components/auth/AuthTextField";
import { PrimaryButton } from "@/components/auth/PrimaryButton";
import { BackButton } from "@/components/common/BackButton";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { updateUserPassword } from "@/lib/auth/auth-store";
import { typography } from "@/lib/theme/typography";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

export default function NewPasswordScreen() {
  const router = useRouter();

  // Email recibido desde la pantalla OTP
  const params = useLocalSearchParams<{ email?: string }>();

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleFinish() {
    if (submitting) return;

    if (!password.trim()) {
      Alert.alert("Contraseña requerida", "Ingresa tu nueva contraseña.");
      return;
    }

    if (password.trim().length < 6) {
      Alert.alert("Contraseña corta", "La contraseña debe tener mínimo 8 caracteres.");
      return;
    }
    
    if (!acceptTerms) {
      Alert.alert("Términos incompletos", "Debes aceptar los términos y condiciones para continuar.");
      return;
    }

    setSubmitting(true);

    try {
      const updated = await updateUserPassword(String(params.email ?? ""), password.trim());

      if (!updated) {
        Alert.alert(
          "Solicitud inválida",
          "No encontramos una cuenta asociada a esta recuperación.",
        );
        return;
      }

      Alert.alert("Contraseña actualizada", "Ya puedes entrar a tu cuenta.", [
        { text: "Continuar", onPress: () => router.replace("/login") },
      ]);
    } catch (error) {
      Alert.alert("Error de conexión", getApiErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthScreenLayout 
      contentStyle={styles.content} 
      // Eliminamos el prop title="Smart Home"
    >
      <View style={styles.header}>
        <BackButton fallbackHref="/forgot-password" />
      </View>

      <Text style={styles.sectionTitle}>Establecer contraseña</Text>

      <View style={styles.formContainer}>
        <AuthPasswordField
          inputStyle={styles.input}
          onChangeText={setPassword}
          onToggleVisibility={() => setShowPassword((value) => !value)}
          placeholder="Nueva contraseña"
          showPassword={showPassword}
          value={password}
        />

        <AuthCheckboxRow
          checked={acceptTerms}
          label="Acepto términos y condiciones"
          labelStyle={styles.termsText}
          onToggle={() => setAcceptTerms((value) => !value)}
        />

        <PrimaryButton
          loading={submitting}
          onPress={handleFinish}
          style={styles.button}
          text="Finalizado"
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
    marginBottom: 10 
  },
  sectionTitle: {
    color: "#3F3F3F",
    fontFamily: authFont,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 20,
  },
  formContainer: {
    gap: 16, // Espaciado limpio entre los elementos
    width: "100%",
  },
  input: {
    backgroundColor: "#FBFBFD",
    borderColor: "transparent",
    borderWidth: 1,
    borderRadius: 17,
    color: "#3F3F3F",
    fontFamily: authFont,
    fontSize: 15,       // <-- Letra pequeña
    fontWeight: "500",  // <-- Grosor ligero
    height: 56,         // <-- Misma altura que Login/Registro
    paddingHorizontal: 18,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 5,       // <-- Misma sombra
  },
  termsText: {
    color: "#3F3F3F",
    fontFamily: authFont,
    fontSize: 14,       // <-- Texto minimizado y discreto
    fontWeight: "500",
  },
  button: {
    marginTop: 8,
  },
});