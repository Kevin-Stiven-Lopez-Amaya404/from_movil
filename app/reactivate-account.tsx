import { PrimaryButton } from "@/components/auth/PrimaryButton";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { reactivateUserAccount } from "@/lib/auth/auth-store";
import type { ReactivateAccountResponse } from "@/lib/services/auth-service";
import { useAppTheme } from "@/lib/theme/app-theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ReactivationState = "loading" | "success" | "error";

export default function ReactivateAccountScreen() {
  const params = useLocalSearchParams<{ token?: string | string[] }>();
  const token =
    typeof params.token === "string" ? params.token : (params.token?.[0] ?? "");

  const router = useRouter();
  const theme = useAppTheme();

  const [state, setState] = useState<ReactivationState>(
    token ? "loading" : "error",
  );
  const [message, setMessage] = useState(
    token
      ? "Estamos reactivando tu cuenta."
      : "El enlace no contiene un token de reactivación válido.",
  );

  const requestRef = useRef<{
    token: string;
    promise: Promise<ReactivateAccountResponse>;
  } | null>(null);

  useEffect(() => {
    if (!token) return;

    let active = true;

    let request = requestRef.current;

    if (!request || request.token !== token) {
      request = {
        token,
        promise: reactivateUserAccount(token),
      };
      requestRef.current = request;
    }

    request.promise
      .then((response) => {
        if (!active) return;

        if (!response.reactivated) {
          setState("error");
          setMessage(
            "El servidor no pudo confirmar la reactivación. Solicita un nuevo enlace.",
          );
          return;
        }

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

  const isLoading = state === "loading";
  const isSuccess = state === "success";

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
    >
      <View style={styles.content}>
        {isLoading && <ActivityIndicator color={theme.blue} size="large" />}

        <Text style={[styles.title, { color: theme.text }]}>
          {isLoading
            ? "Reactivando cuenta"
            : isSuccess
              ? "Cuenta reactivada"
              : "No se pudo reactivar"}
        </Text>

        <Text style={[styles.message, { color: theme.muted }]}>{message}</Text>

        {!isLoading && (
          <PrimaryButton
            onPress={() =>
              router.replace(
                isSuccess ? "/login" : "/request-reactivation",
              )
            }
            style={styles.button}
            text={
              isSuccess ? "Ir al inicio de sesión" : "Solicitar otro enlace"
            }
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
  title: {
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: 12,
    textAlign: "center",
  },
  button: {
    marginTop: 28,
    width: "100%",
  },
});
