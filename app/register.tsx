import { AuthCheckboxRow } from "@/components/auth/AuthCheckboxRow";
import { AuthScreenLayout } from "@/components/auth/AuthScreenLayout";
import {
  AuthPasswordField,
  AuthTextField,
} from "@/components/auth/AuthTextField";
import { PrimaryButton } from "@/components/auth/PrimaryButton";
import { BackButton } from "@/components/common/BackButton";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { registerUser } from "@/lib/auth/auth-store";
import { useResponsiveLayout } from "@/lib/responsive/responsive";
import { typography } from "@/lib/theme/typography";
import { getPasswordRules, isValidEmail } from "@/lib/utils/validators";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

export default function RegisterScreen() {
  const router = useRouter();
  const layout = useResponsiveLayout();

  // ==========================================
  // ESTADO DEL FORMULARIO
  // ==========================================

  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ==========================================
  // DATOS NORMALIZADOS
  // ==========================================

  const cleanName = firstName.trim();
  const cleanEmail = email.trim().toLowerCase();

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

  const errors = {
    firstName: cleanName.length < 2 ? "Ingresa tu nombre." : "",

    email: !isValidEmail(cleanEmail) ? "Ingresa un correo válido." : "",

    password: !passwordIsStrong
      ? "La contraseña no cumple los requisitos."
      : "",

    confirmPassword: !passwordsMatch ? "Las contraseñas no coinciden." : "",

    terms: !acceptTerms ? "Debes aceptar los términos." : "",
  };

  const canSubmit = Object.values(errors).every((error) => !error);

  function visibleError(key: keyof typeof errors) {
    return submitted ? errors[key] : "";
  }

  // ==========================================
  // REGISTRO
  // ==========================================

  async function handleRegister() {
    setSubmitted(true);

    if (submitting) {
      return;
    }

    if (!canSubmit) {
      Alert.alert("Registro incompleto", "Revisa los campos marcados.");

      return;
    }

    setSubmitting(true);

    try {
      const result = await registerUser({
        email: cleanEmail,
        name: cleanName,
        password,
      });

      // ======================================
      // CORREO YA REGISTRADO
      // ======================================

      if (!result.ok) {
        Alert.alert(
          "Correo ya registrado",
          "Ya existe una cuenta asociada a este correo.",
        );

        return;
      }

      // ======================================
      // REGISTRO EXITOSO
      // ======================================

      Alert.alert("Cuenta creada", "Tu cuenta se creó correctamente.", [
        {
          text: "Iniciar sesión",
          onPress: () => router.replace("/login"),
        },
      ]);
    } catch (error) {
      Alert.alert("Error", getApiErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <AuthScreenLayout compact={layout.compact} title="Crear cuenta">
      {/* ====================================== */}
      {/* BOTÓN VOLVER                           */}
      {/* ====================================== */}

      <View style={styles.header}>
        <BackButton fallbackHref="/welcome" />
      </View>

      {/* ====================================== */}
      {/* FORMULARIO                             */}
      {/* ====================================== */}

      <View style={styles.formContainer}>
        {/* ==================================== */}
        {/* NOMBRE                               */}
        {/* ==================================== */}

        <AuthTextField
          error={visibleError("firstName")}
          inputStyle={styles.input}
          onChangeText={setFirstName}
          placeholder="Nombre completo"
          value={firstName}
          autoCapitalize="words"
          autoCorrect={false}
        />

        {/* ==================================== */}
        {/* CORREO                               */}
        {/* ==================================== */}

        <AuthTextField
          error={visibleError("email")}
          inputStyle={styles.input}
          keyboardType="email-address"
          onChangeText={setEmail}
          placeholder="Correo electrónico"
          value={email}
          autoCapitalize="none"
          autoCorrect={false}
        />

        {/* ==================================== */}
        {/* CONTRASEÑA                            */}
        {/* ==================================== */}

        <View>
          <AuthPasswordField
            error={visibleError("password")}
            inputStyle={styles.input}
            onChangeText={setPassword}
            onToggleVisibility={() => setShowPassword((prev) => !prev)}
            placeholder="Contraseña"
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
          error={visibleError("confirmPassword")}
          inputStyle={styles.input}
          onChangeText={setConfirmPassword}
          onToggleVisibility={() => setShowPassword((prev) => !prev)}
          placeholder="Confirmar contraseña"
          showPassword={showPassword}
          value={confirmPassword}
        />

        {/* ==================================== */}
        {/* TÉRMINOS                              */}
        {/* ==================================== */}

        <View>
          <AuthCheckboxRow
            checked={acceptTerms}
            label={
              <Text style={styles.termsText}>
                Acepto términos y política de privacidad
              </Text>
            }
            onToggle={() => setAcceptTerms((prev) => !prev)}
          />

          {visibleError("terms") ? (
            <Text style={styles.termsError} accessibilityRole="alert">
              {visibleError("terms")}
            </Text>
          ) : null}
        </View>

        {/* ==================================== */}
        {/* BOTÓN REGISTRO                        */}
        {/* ==================================== */}

        <PrimaryButton
          loading={submitting}
          onPress={handleRegister}
          text="Registrarse"
          style={styles.button}
        />

        {/* ==================================== */}
        {/* IR A LOGIN                            */}
        {/* ==================================== */}

        <Pressable
          onPress={() => router.replace("/login")}
          style={styles.loginRow}
          accessibilityRole="link"
          accessibilityLabel="Iniciar sesión"
        >
          <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>

          <Text style={[styles.loginText, styles.loginLink]}>
            Inicia sesión
          </Text>
        </Pressable>
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
  header: {
    marginBottom: 10,
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

  termsText: {
    color: "#3F3F3F",
    fontSize: 14,
    fontFamily: authFont,
    fontWeight: "600",
  },

  termsError: {
    marginTop: 5,
    marginLeft: 8,

    color: "#C62828",
    fontSize: 12,
    fontWeight: "600",
  },

  button: {
    marginTop: 8,
  },

  loginRow: {
    alignSelf: "center",

    flexDirection: "row",
    flexWrap: "wrap",

    justifyContent: "center",

    paddingVertical: 4,
  },

  loginText: {
    color: "#3F3F3F",
    fontSize: 14,
    fontWeight: "700",
  },

  loginLink: {
    color: "#003380",
    textDecorationLine: "underline",
  },
});
