import { AuthScreenLayout } from "@/components/auth/AuthScreenLayout";
import { PrimaryButton } from "@/components/auth/PrimaryButton";
import { BackButton } from "@/components/common/BackButton";
import { typography } from "@/lib/theme/typography";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useRef, useState } from "react";
import {
  Alert,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputKeyPressEventData,
  View,
} from "react-native";

const CODE_LENGTH = 6;
const MOCK_CODE = "222222";

function maskEmail(email: string) {
  if (!email || !email.includes("@")) {
    return "**********gmail.com";
  }
  const [, domain] = email.split("@");
  return `**********@${domain}`;
}

export default function OtpVerificationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();

  const inputRefs = useRef<(TextInput | null)[]>([]);
  const [digits, setDigits] = useState(Array(CODE_LENGTH).fill(""));

  const maskedEmail = useMemo(
    () => maskEmail(String(params.email ?? "")),
    [params.email],
  );
  const code = digits.join("");

  function updateDigit(value: string, index: number) {
    const nextValue = value.replace(/\D/g, "").slice(-1);
    const nextDigits = [...digits];
    nextDigits[index] = nextValue;
    setDigits(nextDigits);

    if (nextValue && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyPress(
    event: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number,
  ) {
    if (event.nativeEvent.key !== "Backspace") {
      return;
    }

    if (digits[index]) {
      const nextDigits = [...digits];
      nextDigits[index] = "";
      setDigits(nextDigits);
      return;
    }

    if (index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(value: string) {
    const cleanValue = value.replace(/\D/g, "").slice(0, CODE_LENGTH);

    if (cleanValue.length <= 1) {
      return false;
    }

    const nextDigits = cleanValue
      .padEnd(CODE_LENGTH, " ")
      .split("")
      .map((char) => (/\d/.test(char) ? char : ""));

    setDigits(nextDigits);
    inputRefs.current[Math.min(cleanValue.length, CODE_LENGTH) - 1]?.focus();
    return true;
  }

  function handleVerifyCode() {
    if (code.length !== CODE_LENGTH) {
      Alert.alert("Código incompleto", "Ingresa los 6 dígitos del código.");
      return;
    }

    if (code !== MOCK_CODE) {
      Alert.alert("Código inválido", "El código ingresado no es correcto.");
      return;
    }

    router.push({
      pathname: "/new-password",
      params: { email: String(params.email ?? "") },
    });
  }

  function handleResendCode() {
    setDigits(Array(CODE_LENGTH).fill(""));
    inputRefs.current[0]?.focus();
    Alert.alert("Código enviado", "Te enviamos un nuevo código de verificación.");
  }

  return (
    <AuthScreenLayout contentStyle={styles.content}>
      <View style={styles.header}>
        <BackButton fallbackHref="/forgot-password" />
      </View>

      <Text style={styles.sectionTitle}>Código de verificación</Text>
      
      <Text style={styles.messageText}>
        Ingresa el código de 6 dígitos que enviamos a {maskedEmail}
      </Text>

      <View style={styles.formContainer}>
        <View style={styles.codeRow}>
          {digits.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              style={styles.codeInput}
              value={digit}
              onChangeText={(value) => {
                if (!handlePaste(value)) {
                  updateDigit(value, index);
                }
              }}
              onKeyPress={(event) => handleKeyPress(event, index)}
              keyboardType="number-pad"
              maxLength={CODE_LENGTH}
              returnKeyType="next"
              selectTextOnFocus
              textAlign="center"
            />
          ))}
        </View>

        {/* Botón de validar (Acción principal) */}
        <PrimaryButton 
          onPress={handleVerifyCode} 
          style={styles.button} 
          text="Validar" 
        />

        {/* Botón de enviar de nuevo (Acción secundaria) */}
        <Pressable onPress={handleResendCode} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Enviar de nuevo</Text>
        </Pressable>
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
    marginBottom: 8, // Poco margen porque le sigue el mensaje
  },
  messageText: {
    color: "#7A7A7A", // Un color un poco más suave para la instrucción
    fontFamily: authFont,
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 24,
  },
  formContainer: {
    width: "100%",
  },
  codeRow: {
    flexDirection: "row",
    justifyContent: "space-between", // Separa las cajas uniformemente
    marginBottom: 32,
    gap: 6, // Pequeña separación entre las cajas
  },
  codeInput: {
    flex: 1, // Hace que todas las cajas tengan el mismo ancho
    backgroundColor: "#FBFBFD",
    borderColor: "transparent",
    borderWidth: 1,
    borderRadius: 17,
    color: "#3F3F3F",
    fontFamily: authFont,
    fontSize: 20,       // <-- Letra más grande porque es 1 solo dígito
    fontWeight: "700",  // <-- Grosor fuerte para que el número resalte
    height: 56,         // <-- Misma altura que el Login/Registro
    padding: 0,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 5,
  },
  button: {
    marginTop: 8,
  },
  secondaryButton: {
    marginTop: 16,
    alignItems: "center",
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: "#3F3F3F",
    fontFamily: authFont,
    fontSize: 15,
    fontWeight: "600",
  },
});