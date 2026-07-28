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
import {
    Alert,
    StyleSheet,
    Text
} from "react-native";

const BLUE = "#0864C8";
const TEXT = "#3F3F3F";

/**
 * Pantalla para establecer la nueva contraseña.
 *
 * Se muestra después de la verificación OTP y simula el cambio de contraseña
 * de un usuario almacenado localmente.
 */

export default function NewPasswordScreen() {
  const router = useRouter();

  // Email recibido desde la pantalla OTP para saber que usuario debe actualizarse.
  const params = useLocalSearchParams<{ email?: string }>();

  // Estados locales del formulario de nueva contrasena.
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberPassword, setRememberPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  /**
   * Finaliza la recuperacion de contrasena.
   *
   * Valida que la contrasena sea aceptable y luego llama `updateUserPassword`,
   * que actualiza el usuario en memoria dentro de `auth-store`.
   */
  async function handleFinish() {
    if (submitting) return;

    if (!password.trim()) {
      Alert.alert("Contrasena requerida", "Ingresa tu nueva contrasena.");
      return;
    }

    if (password.trim().length < 6) {
      Alert.alert("Contrasena corta", "La contrasena debe tener minimo 6 caracteres.");
      return;
    }

    setSubmitting(true);

    try {
      const updated = await updateUserPassword(String(params.email ?? ""), password.trim());

      if (!updated) {
        Alert.alert(
          "Solicitud invalida",
          "No encontramos una cuenta asociada a esta recuperacion.",
        );
        return;
      }

      Alert.alert("Contrasena actualizada", "Ya puedes entrar a tu cuenta.", [
        { text: "Continuar", onPress: () => router.replace("/login") },
      ]);
    } catch (error) {
      Alert.alert("Error de conexion", getApiErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthScreenLayout contentStyle={styles.content} title="Smart Home">
      <BackButton fallbackHref="/forgot-password" />

      <Text style={styles.sectionTitle}>Establecer contraseña</Text>

      <AuthPasswordField
        containerStyle={styles.passwordContainer}
        inputStyle={styles.passwordInput}
        onChangeText={setPassword}
        onToggleVisibility={() => setShowPassword((value) => !value)}
        placeholder="Contraseña"
        placeholderTextColor={TEXT}
        showPassword={showPassword}
        value={password}
      />

      {/* Opcion local para recordar la contraseña en esta sesión. */}
      <AuthCheckboxRow
        checked={rememberPassword}
        label="Recordar contraseña"
        labelStyle={styles.rememberText}
        onToggle={() => setRememberPassword((value) => !value)}
      />

      {/* Boton de envio: valida y actualiza la contraseña en el usuario local. */}
      <PrimaryButton
        loading={submitting}
        onPress={handleFinish}
        style={styles.primaryButton}
        text="Finalizado"
      />
    </AuthScreenLayout>
  );
}

const authFont = typography.fontFamily.emphasis;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  flex: {
    flex: 1,
  },
  container: {
    alignItems: "center",
    flexGrow: 1,
    paddingBottom: 40,
  },
  content: {
    alignSelf: "center",
    width: "100%",
  },
  title: {
    color: BLUE,
    fontFamily: authFont,
    fontSize: 38,
    fontWeight: "700",
    lineHeight: 46,
    marginBottom: 32,
    textAlign: "center",
  },
  titleCompact: {
    fontSize: 34,
    lineHeight: 41,
    marginBottom: 24,
  },
  sectionTitle: {
    color: TEXT,
    fontFamily: authFont,
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 25,
    marginBottom: 24,
    textDecorationLine: "underline",
  },
  passwordContainer: {
    marginTop: 8,
    width: "100%",
  },
  passwordBox: {
    alignItems: "center",
    backgroundColor: "#FBFBFD",
    borderRadius: 14,
    flexDirection: "row",
    minHeight: 52,
    paddingLeft: 14,
    paddingRight: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  passwordInput: {
    color: TEXT,
    flex: 1,
    fontFamily: authFont,
    fontSize: 18,
    fontWeight: "700",
    paddingVertical: 0,
  },
  iconButton: {
    alignItems: "center",
    height: 40,
    justifyContent: "center",
    marginLeft: 8,
    width: 32,
  },
  rememberRow: {
    alignItems: "center",
    flexDirection: "row",
    marginTop: 24,
  },
  checkbox: {
    width: 20,
    height: 20,
    alignItems: "center",
    backgroundColor: "#D8DADC",
    borderRadius: 5,
    justifyContent: "center",
  },
  checkboxOn: {
    backgroundColor: BLUE,
  },
  rememberText: {
    color: TEXT,
    flex: 1,
    fontFamily: authFont,
    fontSize: 17,
    fontWeight: "700",
    marginLeft: 10,
  },
  primaryButton: {
    alignItems: "center",
    alignSelf: "stretch",
    backgroundColor: BLUE,
    borderRadius: 14,
    height: 54,
    justifyContent: "center",
    marginTop: 42,
  },
  primaryButtonPressed: {
    backgroundColor: "#004FA5",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontFamily: authFont,
    fontSize: 23,
    fontWeight: "700",
  },
});
