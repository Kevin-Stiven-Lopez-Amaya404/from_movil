import { typography } from "@/lib/theme/typography";
import { PrimaryButton } from "@/components/auth/PrimaryButton";
import { getApiErrorMessage } from "@/lib/api/api-error";
import {
  activateUserAccount,
  resendAccountActivation,
} from "@/lib/auth/auth-store";
import { useAppTheme } from "@/lib/theme/app-theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AuthTextField } from "@/components/auth/AuthTextField";
import { KeyboardAvoidingScreen } from "@/components/common/KeyboardAvoidingScreen";
import { useResponsiveLayout } from "@/lib/responsive/responsive";
import { isValidEmail } from "@/lib/utils/validators";

type ActivationState = "loading" | "success" | "error";

export default function ActivateAccountScreen() {
  const params = useLocalSearchParams<{ token?: string | string[] }>();
  const token =
    typeof params.token === "string" ? params.token : (params.token?.[0] ?? "");
  const router = useRouter();
  const theme = useAppTheme();
  const layout = useResponsiveLayout();
  const [state, setState] = useState<ActivationState>(
    token ? "loading" : "error",
  );
  const [message, setMessage] = useState(
    token
      ? "Estamos activando tu cuenta."
      : "El enlace no contiene un token de activación válido.",
  );
  const [email, setEmail] = useState("");
  const [resendSubmitted, setResendSubmitted] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSucceeded, setResendSucceeded] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const resendLock = useRef(false);
  const activationRequest = useRef<{
    token: string;
    promise: Promise<void>;
  } | null>(null);
  const cleanEmail = email.trim().toLowerCase();
  const emailError = isValidEmail(cleanEmail)
    ? ""
    : "Ingresa un correo electrónico válido.";

  async function handleResendActivation() {
    setResendSubmitted(true);
    if (resendLock.current || resendSucceeded || !isValidEmail(cleanEmail)) {
      return;
    }

    resendLock.current = true;
    setResendMessage("");
    setResending(true);
    try {
      await resendAccountActivation(cleanEmail);
      setResendSucceeded(true);
      setResendMessage(
        "Si el correo corresponde a una cuenta pendiente, enviaremos un nuevo enlace.",
      );
    } catch {
      setResendMessage(
        "No se pudo solicitar el enlace. Revisa tu conexión e inténtalo de nuevo.",
      );
    } finally {
      resendLock.current = false;
      setResending(false);
    }
  }

  useEffect(() => {
    if (!token) return;

    let active = true;
    let request = activationRequest.current;
    if (!request || request.token !== token) {
      request = { token, promise: activateUserAccount(token) };
      activationRequest.current = request;
    }

    request.promise
      .then(() => {
        if (!active) return;
        setState("success");
        setMessage("Tu cuenta está activa. Ya puedes iniciar sesión.");
      })
      .catch((error: unknown) => {
        if (!active) return;
        setState("error");
        setMessage(getApiErrorMessage(error));
      });

    return () => {
      active = false;
    };
  }, [token]);

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
    >
      <KeyboardAvoidingScreen>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingHorizontal: layout.gutter,
              paddingTop: layout.screenTop,
              paddingBottom: layout.screenBottom,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.content, { maxWidth: layout.contentWidth }]}>
            {state === "loading" && (
              <ActivityIndicator color={theme.blue} size="large" />
            )}
            <Text
              accessibilityRole="header"
              style={[styles.title, { color: theme.text }]}
            >
              {state === "success"
                ? "Cuenta activada"
                : state === "loading"
                  ? "Activando cuenta"
                  : "No se pudo activar"}
            </Text>
            <Text
              accessibilityLiveRegion="polite"
              style={[styles.message, { color: theme.muted }]}
            >
              {message}
            </Text>
            {state === "success" ? (
              <PrimaryButton
                onPress={() => router.replace("/login")}
                style={styles.button}
                text="Ir al inicio de sesión"
              />
            ) : null}

            {state === "error" ? (
              <View style={styles.recovery}>
                <Text style={[styles.recoveryCopy, { color: theme.muted }]}>
                  Si el enlace venció o no llegó, puedes solicitar uno nuevo.
                </Text>
                <AuthTextField
                  autoCapitalize="none"
                  autoCorrect={false}
                  error={resendSubmitted ? emailError : ""}
                  keyboardType="email-address"
                  label="Correo electrónico"
                  onChangeText={(value) => {
                    setEmail(value);
                    setResendSucceeded(false);
                    setResendMessage("");
                  }}
                  placeholder="nombre@correo.com"
                  value={email}
                />
                <PrimaryButton
                  disabled={resendSucceeded}
                  loading={resending}
                  onPress={() => void handleResendActivation()}
                  style={styles.button}
                  text={
                    resendSucceeded
                      ? "Solicitud enviada"
                      : "Solicitar nuevo enlace"
                  }
                />
                {resendMessage ? (
                  <Text
                    accessibilityLiveRegion="polite"
                    accessibilityRole="alert"
                    style={[styles.recoveryMessage, { color: theme.muted }]}
                  >
                    {resendMessage}
                  </Text>
                ) : null}
                <Pressable
                  accessibilityRole="link"
                  hitSlop={8}
                  onPress={() => router.replace("/login")}
                  style={styles.loginLink}
                >
                  <Text style={[styles.loginLinkText, { color: theme.blue }]}>
                    Volver al inicio de sesión
                  </Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingScreen>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: "center" },
  content: {
    alignSelf: "center",
    alignItems: "center",
    flexGrow: 1,
    justifyContent: "center",
    width: "100%",
  },
  title: {
    fontSize: typography.size.section,
    fontWeight: "800",
    textAlign: "center",
  },
  message: {
    fontSize: typography.size.body,
    lineHeight: 22,
    marginTop: 12,
    textAlign: "center",
  },
  button: { marginTop: 20, width: "100%" },
  recovery: { gap: 12, marginTop: 20, width: "100%" },
  recoveryCopy: {
    fontSize: typography.size.helper,
    lineHeight: 20,
    textAlign: "center",
  },
  recoveryMessage: {
    fontSize: typography.size.helper,
    lineHeight: 20,
    textAlign: "center",
  },
  loginLink: { alignSelf: "center", minHeight: 44, justifyContent: "center" },
  loginLinkText: { fontSize: typography.size.helper, fontWeight: "700" },
});
