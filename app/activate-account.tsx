import { PrimaryButton } from "@/components/auth/PrimaryButton";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { activateUserAccount } from "@/lib/auth/auth-store";
import { useAppTheme } from "@/lib/theme/app-theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ActivationState = "loading" | "success" | "error";

export default function ActivateAccountScreen() {
  const params = useLocalSearchParams<{ token?: string | string[] }>();
  const token =
    typeof params.token === "string" ? params.token : (params.token?.[0] ?? "");
  const router = useRouter();
  const theme = useAppTheme();
  const [state, setState] = useState<ActivationState>(
    token ? "loading" : "error",
  );
  const [message, setMessage] = useState(
    token
      ? "Estamos activando tu cuenta."
      : "El enlace no contiene un token de activación válido.",
  );

  useEffect(() => {
    if (!token) return;

    let active = true;
    activateUserAccount(token)
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
      <View style={styles.content}>
        {state === "loading" && (
          <ActivityIndicator color={theme.blue} size="large" />
        )}
        <Text style={[styles.title, { color: theme.text }]}>
          {state === "success"
            ? "Cuenta activada"
            : state === "loading"
              ? "Activando cuenta"
              : "No se pudo activar"}
        </Text>
        <Text style={[styles.message, { color: theme.muted }]}>{message}</Text>
        {state !== "loading" && (
          <PrimaryButton
            onPress={() => router.replace("/login")}
            style={styles.button}
            text="Ir al inicio de sesión"
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  title: { fontSize: 22, fontWeight: "800", textAlign: "center" },
  message: { fontSize: 15, lineHeight: 22, marginTop: 12, textAlign: "center" },
  button: { marginTop: 28, width: "100%" },
});
