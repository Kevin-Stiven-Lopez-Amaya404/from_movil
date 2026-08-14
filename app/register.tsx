import { AuthCheckboxRow } from "@/components/auth/AuthCheckboxRow";
import { AuthScreenLayout } from "@/components/auth/AuthScreenLayout";
import { AuthPasswordField, AuthTextField } from "@/components/auth/AuthTextField";
import { PrimaryButton } from "@/components/auth/PrimaryButton";
import { BackButton } from "@/components/common/BackButton";
import { theme } from "@/constants/theme";
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

  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const cleanEmail = email.trim().toLowerCase();
  
  const passwordRules = useMemo(() => getPasswordRules(password), [password]);
  const strength = passwordRules.filter((rule) => rule.passed).length;
  const passwordIsStrong = strength === passwordRules.length;
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const errors = {
    firstName: firstName.trim().length < 2 ? "Ingresa tu nombre" : "",
    email: !isValidEmail(cleanEmail) ? "Correo inválido" : "",
    password: !passwordIsStrong ? "Contraseña débil" : "",
    confirmPassword: !passwordsMatch ? "Las contraseñas no coinciden" : "",
    terms: !acceptTerms ? "Debes aceptar los términos" : "",
  };

  const canSubmit = Object.values(errors).every((error) => !error);

  function visibleError(key: keyof typeof errors) {
    return submitted ? errors[key] : "";
  }

  async function handleRegister() {
    setSubmitted(true);
    if (submitting) return;
    
    if (!canSubmit) {
      Alert.alert("Registro incompleto", "Revisa los campos marcados.");
      return;
    }
    
    setSubmitting(true);
    
    try {
      const result = await registerUser({ email: cleanEmail, name: firstName.trim(), password });
      if (!result.ok) { 
        Alert.alert("Error", "Correo ya registrado."); 
        return; 
      }
      Alert.alert("Éxito", "Cuenta creada.", [
        { text: "Iniciar sesión", onPress: () => router.replace("/login") }
      ]);
    } catch (error) {
      Alert.alert("Error", getApiErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthScreenLayout compact={layout.compact} title="Crear cuenta">
      <View style={styles.header}>
        <BackButton fallbackHref="/welcome" />
      </View>

      <View style={styles.formContainer}>
        <AuthTextField
          error={visibleError("firstName")}
          inputStyle={styles.input}
          onChangeText={setFirstName}
          placeholder="Nombre completo"
          value={firstName}
          autoCapitalize="words"
        />

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

        <View>
          <AuthPasswordField
            error={visibleError("password")}
            inputStyle={styles.input}
            onChangeText={setPassword}
            onToggleVisibility={() => setShowPassword(!showPassword)}
            placeholder="Contraseña"
            showPassword={showPassword}
            value={password}
          />
          {password.length > 0 && (
            <View style={styles.strengthContainer}>
              <View 
                style={[
                  styles.strengthBar, 
                  { 
                    width: `${(strength / 4) * 100}%`, 
                    backgroundColor: strength < 2 ? "#FF4D4D" : strength < 4 ? "#FFA500" : theme.colors.primary 
                  }
                ]} 
              />
            </View>
          )}
        </View>

        <AuthPasswordField
          error={visibleError("confirmPassword")}
          inputStyle={styles.input}
          onChangeText={setConfirmPassword}
          onToggleVisibility={() => setShowPassword(!showPassword)}
          placeholder="Confirmar contraseña"
          showPassword={showPassword}
          value={confirmPassword}
        />

        <AuthCheckboxRow
          checked={acceptTerms}
          label={<Text style={styles.termsText}>Acepto términos y política de privacidad</Text>}
          onToggle={() => setAcceptTerms(!acceptTerms)}
        />

        <PrimaryButton
          loading={submitting}
          onPress={handleRegister}
          text="Registrarse"
          style={styles.button}
        />

        <Pressable onPress={() => router.replace("/login")} style={styles.loginRow}>
          <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
          <Text style={[styles.loginText, styles.loginLink]}>Inicia sesión</Text>
        </Pressable>
      </View>
    </AuthScreenLayout>
  );
}

const authFont = typography.fontFamily.emphasis;

const styles = StyleSheet.create({
  header: { 
    marginBottom: 10 
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
    fontSize: 15,         // <-- LETRA MÁS PEQUEÑA (antes 20)
    fontWeight: "500",    // <-- GROSOR MÁS LIGERO (antes 700)
    height: 56,           // <-- CAJA IGUAL DE ALTA AL LOGIN
    paddingHorizontal: 18,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 5 },
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
    height: "100%" 
  },
  termsText: {
    color: "#3F3F3F",
    fontSize: 14,
    fontFamily: authFont,
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