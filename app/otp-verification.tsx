import { AuthScreenLayout } from "@/components/auth/AuthScreenLayout";
import { PrimaryButton } from "@/components/auth/PrimaryButton";
import { BackButton } from "@/components/common/BackButton";
import { theme } from "@/constants/theme";
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

/**
 * Pantalla de verificación OTP.
 *
 * Permite ingresar un código de seis dígitos y avanzar al cambio de contraseña.
 * Implementa manejo de pegado de código y navegación entre celdas.
 */

const CODE_LENGTH = 6;

// Codigo fijo usado para simular la validacion OTP mientras no hay backend.
const MOCK_CODE = "222222";

/**
 * Oculta parte del correo para mostrarlo de forma mas segura en pantalla.
 */
function maskEmail(email: string) {
  if (!email || !email.includes("@")) {
    return "**********gmail.com";
  }

  const [, domain] = email.split("@");
  return `**********${domain}`;
}

export default function OtpVerificationScreen() {
  const router = useRouter();

  // Email recibido desde forgot-password mediante parametros de ruta.
  const params = useLocalSearchParams<{ email?: string }>();

  // Referencias a cada input para mover el foco automaticamente entre casillas.
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Cada posicion del arreglo representa un digito del codigo OTP.
  const [digits, setDigits] = useState(Array(CODE_LENGTH).fill(""));

  const maskedEmail = useMemo(
    () => maskEmail(String(params.email ?? "")),
    [params.email],
  );
  const code = digits.join("");

  /**
   * Actualiza una casilla del codigo.
   *
   * Solo acepta numeros y conserva el ultimo digito escrito. Si el usuario
   * escribe un digito valido, avanza automaticamente al siguiente input.
   */
  function updateDigit(value: string, index: number) {
    const nextValue = value.replace(/\D/g, "").slice(-1);
    const nextDigits = [...digits];
    nextDigits[index] = nextValue;
    setDigits(nextDigits);

    if (nextValue && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  /**
   * Maneja la tecla borrar.
   *
   * Si la casilla actual tiene valor, lo limpia. Si esta vacia, mueve el foco
   * a la casilla anterior para facilitar la correccion del codigo.
   */
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

  /**
   * Permite pegar el codigo completo.
   *
   * Si el valor pegado contiene mas de un numero, reparte los digitos entre
   * las seis casillas y enfoca la ultima posicion escrita.
   */
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

  /**
   * Valida el codigo ingresado contra `MOCK_CODE`.
   * En produccion esta comparacion deberia hacerse contra un backend.
   */
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

  /**
   * Simula el reenvio del codigo.
   * Limpia los digitos y vuelve a enfocar la primera casilla.
   */
  function handleResendCode() {
    setDigits(Array(CODE_LENGTH).fill(""));
    inputRefs.current[0]?.focus();
    Alert.alert("Código enviado", "Te enviamos un nuevo código de verificación.");
  }

  return (
    <AuthScreenLayout contentStyle={styles.content} title="Smart Home">
      <BackButton fallbackHref="/forgot-password" />

      <Text style={styles.sectionTitle}>Código de verificación</Text>

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

      <View style={styles.messageBlock}>
        <Text style={styles.messageText}>
          El código de verificación se envió a tu correo {maskedEmail}.
        </Text>
        <Pressable onPress={handleResendCode} style={styles.resendLink}>
          <Text style={styles.resendText}>Enviar de nuevo</Text>
        </Pressable>
      </View>

      <Pressable style={styles.noCodeLink} onPress={handleResendCode}>
        <Text style={styles.noCodeText}>¿No recibiste un código?</Text>
      </Pressable>

      <PrimaryButton onPress={handleVerifyCode} style={styles.primaryButton} text="Siguiente" />
    </AuthScreenLayout>
  );
}

const authFont = typography.fontFamily.emphasis;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.backgroundWhite,
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
    color: "#0864C8",
    fontFamily: authFont,
    fontSize: 42,
    fontWeight: "700",
    lineHeight: 50,
    marginBottom: 34,
    textAlign: "center",
  },
  titleCompact: {
    fontSize: 36,
    lineHeight: 43,
    marginBottom: 24,
  },
  sectionTitle: {
    alignSelf: "flex-start",
    color: "#3F3F3F",
    fontFamily: authFont,
    fontSize: 22,
    fontWeight: "700",
    lineHeight: 27,
    marginBottom: 42,
    textDecorationLine: "underline",
  },
  codeRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 36,
  },
  codeInput: {
    backgroundColor: "#FBFBFD",
    borderRadius: 14,
    color: "#3F3F3F",
    fontFamily: authFont,
    fontSize: 21,
    fontWeight: "700",
    padding: 0,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  messageBlock: {
    marginBottom: 13,
  },
  messageText: {
    color: "#3F3F3F",
    fontFamily: authFont,
    fontSize: 17,
    fontWeight: "700",
    lineHeight: 21,
  },
  resendLink: {
    alignSelf: "flex-start",
    marginTop: 7,
  },
  resendText: {
    color: "#0864C8",
    fontFamily: authFont,
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 25,
    textDecorationLine: "underline",
  },
  noCodeLink: {
    alignSelf: "flex-start",
    marginBottom: 42,
  },
  noCodeText: {
    color: "#3F3F3F",
    fontFamily: authFont,
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 25,
    textDecorationLine: "underline",
  },
  primaryButton: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "#0864C8",
    borderRadius: 15,
    height: 54,
    justifyContent: "center",
    minWidth: 170,
    paddingHorizontal: 30,
  },
  primaryButtonPressed: {
    backgroundColor: "#004FA5",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontFamily: authFont,
    fontSize: 24,
    fontWeight: "700",
  },
});
