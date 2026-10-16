
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getApiErrorMessage } from "@/lib/api/api-error";
import { useSmartHome } from "@/lib/context/smart-home-context";
import type { HomeInvitation } from "@/lib/domain/home";
import { useAndroidBackFallback } from "@/lib/navigation/use-android-back-fallback";
import { smartHomeService } from "@/lib/services/smart-home-service";
import { useAppTheme } from "@/lib/theme/app-theme";

export default function InvitationsScreen() {
  const router = useRouter();
  const theme = useAppTheme();

  useAndroidBackFallback(true, "/(tabs)/(main)/homes");

  const { acceptInvitation, rejectInvitation } = useSmartHome();

  const [invitations, setInvitations] = useState<HomeInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadInvitations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await smartHomeService.listIncomingInvitations();
      setInvitations(result);
    } catch (cause) {
      setError(getApiErrorMessage(cause));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadInvitations();
    }, [loadInvitations]),
  );

  async function respond(id: string, action: "accept" | "reject") {
    if (processingId) return;

    setProcessingId(id);

    try {
      if (action === "accept") {
        await acceptInvitation(id);
      } else {
        await rejectInvitation(id);
      }

      setInvitations((current) =>
        current.filter((item) => item.id !== id),
      );

      Alert.alert(
        action === "accept"
          ? "Invitación aceptada"
          : "Invitación rechazada",
        action === "accept"
          ? "Aceptaste la invitación. Actualizaremos tus hogares para mostrar el nuevo acceso."
          : "La invitación fue rechazada.",
      );
    } catch (cause) {
      Alert.alert(
        "No se pudo procesar la invitación",
        getApiErrorMessage(cause),
      );
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.background }}
    >
      <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }}>
        <Pressable
          onPress={() => router.replace("/(tabs)/(main)/homes")}
          accessibilityRole="button"
          style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
        >
          <Ionicons
            name="chevron-back"
            size={22}
            color={theme.blue}
          />
          <Text style={{ color: theme.blue }}>Mis hogares</Text>
        </Pressable>

        <Text
          style={{
            fontSize: 26,
            fontWeight: "700",
            color: theme.text,
          }}
        >
          Mis invitaciones
        </Text>

        <Text style={{ color: theme.muted }}>
          Consulta las invitaciones que has recibido para unirte a
          otros hogares.
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color={theme.blue} />
        ) : error ? (
          <View style={{ gap: 12 }}>
            <Text style={{ color: theme.text }}>{error}</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => void loadInvitations()}
              style={{ padding: 14, backgroundColor: theme.blue, borderRadius: 12 }}
            >
              <Text style={{ color: "#FFFFFF", textAlign: "center" }}>
                Reintentar
              </Text>
            </Pressable>
          </View>
        ) : invitations.length === 0 ? (
          <View
            style={{
              padding: 24,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: theme.borderLight,
              backgroundColor: theme.card,
              alignItems: "center",
              gap: 12,
            }}
          >
            <Ionicons
              name="mail-open-outline"
              size={42}
              color={theme.blue}
            />
            <Text style={{ color: theme.text, fontWeight: "600" }}>
              No tienes invitaciones pendientes
            </Text>
            <Text style={{ color: theme.muted, textAlign: "center" }}>
              Cuando alguien te invite a un hogar, aparecerá aquí.
            </Text>
          </View>
        ) : (
          invitations.map((invitation) => (
            <View
              key={invitation.id}
              style={{
                padding: 18,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: theme.borderLight,
                backgroundColor: theme.card,
                gap: 12,
              }}
            >
              <Text
                style={{
                  fontSize: 17,
                  fontWeight: "700",
                  color: theme.text,
                }}
              >
                Invitación a un hogar
              </Text>

              <Text style={{ color: theme.muted }}>
                Rol: {invitation.role === "MEMBER"
                  ? "Miembro"
                  : invitation.role === "GUEST"
                    ? "Invitado"
                    : invitation.role}
              </Text>

              <Text style={{ color: theme.muted, fontSize: 12 }}>
                Hogar: {invitation.homeId ?? "Sin identificador"}
              </Text>

              <View style={{ flexDirection: "row", gap: 10 }}>
                <Pressable
                  accessibilityRole="button"
                  disabled={processingId !== null}
                  onPress={() => void respond(invitation.id, "reject")}
                  style={{
                    flex: 1,
                    padding: 14,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: theme.borderLight,
                    opacity: processingId ? 0.6 : 1,
                  }}
                >
                  <Text
                    style={{ textAlign: "center", color: theme.text }}
                  >
                    Rechazar
                  </Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  disabled={processingId !== null}
                  onPress={() => void respond(invitation.id, "accept")}
                  style={{
                    flex: 1,
                    padding: 14,
                    borderRadius: 12,
                    backgroundColor: theme.blue,
                    opacity: processingId ? 0.6 : 1,
                  }}
                >
                  {processingId === invitation.id ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text
                      style={{
                        textAlign: "center",
                        color: "#FFFFFF",
                        fontWeight: "600",
                      }}
                    >
                      Aceptar
                    </Text>
                  )}
                </Pressable>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
