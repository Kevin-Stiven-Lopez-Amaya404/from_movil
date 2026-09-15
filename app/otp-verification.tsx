import { AuthScreenLayout } from "@/components/auth/AuthScreenLayout";
import { PrimaryButton } from "@/components/auth/PrimaryButton";
import { BackButton } from "@/components/common/BackButton";
import { useResponsiveLayout } from "@/lib/responsive/responsive";
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
    return "**********@gmail.com";
  }

  const [, domain] = email.split("@");

  return `**********@${domain}`;
}

export default function OtpVerificationScreen() {
  const router = useRouter();
  const layout = useResponsiveLayout();

  const params = useLocalSearchParams<{ email?: string }>();

  const inputRefs = useRef<(TextInput | null)[]>([]);

  const [digits, setDigits] = useState<string[]>(() =>
    Array(CODE_LENGTH).fill(""),
  );

  const maskedEmail = useMemo(
    () => maskEmail(String(params.email ?? "")),
    [params.email],
  );

  const code = digits.join("");

  // ==========================================
  // ACTUALIZAR DÍGITO
  // ==========================================

  function updateDigit(value: string, index: number) {
    const cleanValue = value.replace(/\D/g, "").slice(-1);

    setDigits((currentDigits) => {
      const nextDigits = [...currentDigits];

      nextDigits[index] = cleanValue;

      return nextDigits;
    });

    if (cleanValue && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  // ==========================================
  // PEGAR CÓDIGO COMPLETO
  // ==========================================

  function handlePaste(value: string) {
    const cleanValue = value.replace(/\D/g, "").slice(0, CODE_LENGTH);

    if (cleanValue.length <= 1) {
      return false;
    }

    const nextDigits = Array(CODE_LENGTH).fill("");

    cleanValue.split("").forEach((digit, index) => {
      nextDigits[index] = digit;
    });

    setDigits(nextDigits);

    const nextIndex = Math.min(cleanValue.length, CODE_LENGTH) - 1;

    inputRefs.current[nextIndex]?.focus();

    return true;
  }

  // ==========================================
  // TECLA BACKSPACE
  // ==========================================

  function handleKeyPress(
    event: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number,
  ) {
    if (event.nativeEvent.key !== "Backspace") {
      return;
    }

    if (digits[index]) {
      setDigits((currentDigits) => {
        const nextDigits = [...currentDigits];

        nextDigits[index] = "";

        return nextDigits;
      });

      return;
    }

    if (index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  // ==========================================
  // VALIDAR CÓDIGO
  // ==========================================

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
      params: {
        email: String(params.email ?? ""),
      },
    });
  }

  // ==========================================
  // REENVIAR CÓDIGO
  // ==========================================

  function handleResendCode() {
    setDigits(Array(CODE_LENGTH).fill(""));

    inputRefs.current[0]?.focus();

    Alert.alert(
      "Código enviado",
      "Te enviamos un nuevo código de verificación.",
    );
  }

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <AuthScreenLayout compact={layout.compact} contentStyle={styles.content}>
      {/* ====================================== */}
      {/* BOTÓN VOLVER                           */}
      {/* ====================================== */}

      <View style={styles.header}>
        <BackButton fallbackHref="/forgot-password" />
      </View>

      {/* ====================================== */}
      {/* TÍTULO                                 */}
      {/* ====================================== */}

      <Text style={styles.sectionTitle}>Código de verificación</Text>

      {/* ====================================== */}
      {/* MENSAJE                                */}
      {/* ====================================== */}

      <Text style={styles.messageText}>
        Ingresa el código de 6 dígitos que enviamos a {maskedEmail}
      </Text>

      {/* ====================================== */}
      {/* CÓDIGO OTP                             */}
      {/* ====================================== */}

      <View style={styles.formContainer}>
        <View
          style={styles.codeRow}
          accessibilityLabel="Código de verificación de 6 dígitos"
        >
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
              maxLength={1}
              returnKeyType={index === CODE_LENGTH - 1 ? "done" : "next"}
              selectTextOnFocus
              textAlign="center"
              accessibilityLabel={`Dígito ${index + 1} de ${CODE_LENGTH}`}
            />
          ))}
        </View>

        {/* ==================================== */}
        {/* VALIDAR                              */}
        {/* ==================================== */}

        <PrimaryButton
          onPress={handleVerifyCode}
          style={styles.button}
          text="Validar"
        />

        {/* ==================================== */}
        {/* REENVIAR                              */}
        {/* ==================================== */}

        <Pressable
          onPress={handleResendCode}
          style={styles.secondaryButton}
          accessibilityRole="button"
          accessibilityLabel="Enviar código de nuevo"
        >
          <Text style={styles.secondaryButtonText}>Enviar de nuevo</Text>
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
    marginBottom: 8,
  },

  messageText: {
    color: "#7A7A7A",
    fontFamily: authFont,
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 21,
    marginBottom: 24,
  },

  formContainer: {
    width: "100%",
  },

  codeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 6,
    marginBottom: 32,
  },

  codeInput: {
    flex: 1,

    backgroundColor: "#FBFBFD",

    borderColor: "transparent",
    borderWidth: 1,
    borderRadius: 17,

    color: "#3F3F3F",

    fontFamily: authFont,
    fontSize: 20,
    fontWeight: "700",

    height: 56,

    padding: 0,

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
