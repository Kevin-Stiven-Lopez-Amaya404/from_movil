import { AuthScreenLayout } from "@/components/auth/AuthScreenLayout";
import { AuthTextField } from "@/components/auth/AuthTextField";
import { PrimaryButton } from "@/components/auth/PrimaryButton";
import { BackButton } from "@/components/common/BackButton";
import { typography } from "@/lib/theme/typography";
import { isValidEmail } from "@/lib/utils/validators";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

export default function ForgotPasswordScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");

  function handleSendCode() {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      Alert.alert("Correo requerido", "Ingresa tu correo electrónico.");
      return;
    }

    if (!isValidEmail(cleanEmail)) {
      Alert.alert("Correo inválido", "Ingresa un correo electrónico válido.");
      return;
    }

    router.push({
      pathname: "/otp-verification",
      params: { email: cleanEmail },
    });
  }

  return (
    <AuthScreenLayout contentStyle={styles.content}>
      <View style={styles.header}>
        <BackButton fallbackHref="/login" />
      </View>

      {/* Aquí el título que pediste */}
      <Text style={styles.sectionTitle}>Recuperar contraseña</Text>

      <View style={styles.formContainer}>
        <AuthTextField
          inputStyle={styles.input}
          keyboardType="email-address"
          onChangeText={setEmail}
          placeholder="Correo electrónico"
          autoCapitalize="none"
          autoCorrect={false}
          value={email}
        />

        {/* Y aquí el botón devuelto a "Enviar código" */}
        <PrimaryButton 
          onPress={handleSendCode} 
          style={styles.button} 
          text="Enviar código" 
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