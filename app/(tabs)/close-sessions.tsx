import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { profileFont } from "@/components/profile/profileTheme";
import { authService } from "@/lib/services/auth-service";
import { useResponsiveLayout } from "@/lib/responsive/responsive";
import { useAppTheme } from "@/lib/theme/app-theme";

export default function CloseSessionsScreen() {
  const router = useRouter();
  const layout = useResponsiveLayout();
  const theme = useAppTheme();
  const [submitting, setSubmitting] = useState(false);

  function requestCloseSessions() {
    if (submitting) return;

    Alert.alert(
      "Cerrar todas las sesiones",
      "Se solicitará al servidor cerrar todas las sesiones de tu cuenta. ¿Deseas continuar?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          style: "destructive",
          onPress: () => void closeAllSessions(),
        },
      ],
    );
  }

  async function closeAllSessions() {
    setSubmitting(true);

    try {
      await authService.logout(true);
      Alert.alert(
        "Solicitud confirmada",
        "La solicitud de cierre global de sesiones fue procesada.",
        [{ text: "Aceptar", onPress: () => router.replace("/login") }],
      );
    } catch {
      Alert.alert(
        "Cierre no confirmado",
        "No se pudo confirmar el cierre global de sesiones. Intenta nuevamente.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
    >
      <View style={styles.screen}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: layout.gutter,
            paddingTop: layout.screenTop,
            paddingBottom: 120,
          }}
        >
          <View style={[styles.content, { maxWidth: layout.contentWidth }]}>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [
                styles.closeButton,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons name="close" size={34} color={theme.text} />
            </Pressable>

            <Text style={[styles.title, { color: theme.text }]}>
              Cerrar todas las sesiones
            </Text>
            <Text style={[styles.description, { color: theme.text }]}>
              Esta acción enviará al servidor una solicitud para cerrar todas
              las sesiones activas de tu cuenta. No se seleccionan dispositivos
              ni se verifica una contraseña localmente.
            </Text>

            <View
              style={[
                styles.infoCard,
                {
                  backgroundColor: theme.rowAlt,
                  borderColor: theme.borderLight,
                },
              ]}
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={25}
                color={theme.blue}
              />
              <Text style={[styles.infoText, { color: theme.muted }]}>
                El resultado depende de la confirmación del servicio de
                autenticación.
              </Text>
            </View>
          </View>
        </ScrollView>

        <View
          style={[
            styles.footer,
            {
              backgroundColor: theme.background,
              borderTopColor: theme.borderLight,
            },
          ]}
        >
          <Pressable
            disabled={submitting}
            onPress={requestCloseSessions}
            style={({ pressed }) => [
              styles.submitButton,
              { backgroundColor: theme.blue, opacity: submitting ? 0.7 : 1 },
              pressed && styles.pressed,
            ]}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitText}>Cerrar todas las sesiones</Text>
            )}
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  screen: { flex: 1 },
  content: { alignSelf: "center", width: "100%" },
  closeButton: {
    alignSelf: "flex-start",
    marginBottom: 38,
    paddingVertical: 3,
  },
  title: {
    fontFamily: profileFont,
    fontSize: 28,
    fontWeight: "900",
    lineHeight: 36,
  },
  description: {
    fontFamily: profileFont,
    fontSize: 17,
    lineHeight: 25,
    marginTop: 14,
  },
  infoCard: {
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    marginTop: 28,
    padding: 18,
  },
  infoText: {
    flex: 1,
    fontFamily: profileFont,
    fontSize: 15,
    lineHeight: 22,
  },
  footer: {
    borderTopWidth: 1,
    bottom: 0,
    left: 0,
    paddingHorizontal: 32,
    paddingVertical: 18,
    position: "absolute",
    right: 0,
  },
  submitButton: {
    alignItems: "center",
    borderRadius: 32,
    minHeight: 56,
    justifyContent: "center",
  },
  submitText: {
    color: "#FFFFFF",
    fontFamily: profileFont,
    fontSize: 17,
    fontWeight: "800",
  },
  pressed: { opacity: 0.7 },
});
