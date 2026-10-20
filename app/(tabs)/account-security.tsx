import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


import { useActiveDeviceAlerts } from "@/lib/alerts/use-active-device-alerts";
import {
  returnToParent,
  useAndroidBackFallback,
} from "@/lib/navigation/use-android-back-fallback";
import { useResponsiveLayout } from "@/lib/responsive/responsive";
import { useAppTheme } from "@/lib/theme/app-theme";
import { styles } from "../../styles/(tabs)/account-security.styles";

export default function AccountSecurityScreen() {
  const router = useRouter();
  const { from } = useLocalSearchParams<{ from?: string }>();
  const layout = useResponsiveLayout();
  const theme = useAppTheme();
  const {
    count: pendingAlerts,
    isLoading,
    hasError,
  } = useActiveDeviceAlerts();
  useAndroidBackFallback(from !== "profile", "/(tabs)/(main)/profile");

  const status = isLoading
    ? "Verificando dispositivos..."
    : hasError
      ? "Información parcialmente disponible"
      : pendingAlerts > 0
        ? `${pendingAlerts} dispositivo(s) desconectado(s)`
        : "Sin desconexiones confirmadas";

  const statusColor =
    pendingAlerts > 0
      ? theme.danger
      : hasError || isLoading
        ? theme.muted
        : theme.success;

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: layout.gutter,
          paddingTop: layout.screenTop,
          paddingBottom: layout.screenBottom,
        }}
      >
        <View style={[styles.content, { maxWidth: layout.contentWidth }]}>
          <Pressable
            onPress={() =>
              returnToParent(
                router,
                from,
                "profile",
                "/(tabs)/(main)/profile",
              )
            }
            style={({ pressed }) => [
              styles.closeButton,
              { backgroundColor: theme.rowAlt },
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="close" size={21} color={theme.text} />
          </Pressable>

          <View style={styles.header}>
            <View
              style={[
                styles.iconWrap,
                {
                  backgroundColor: theme.rowAlt,
                  borderColor: theme.borderLight,
                },
              ]}
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={24}
                color={theme.blue}
              />
            </View>
            <View style={styles.headerCopy}>
              <Text style={[styles.title, { color: theme.text }]}>
                Controles de seguridad
              </Text>
              <Text style={[styles.subtitle, { color: theme.muted }]}>
                Revisa los problemas de seguridad mediante comprobaciones en la
                cuenta y tus dispositivos.
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.card,
              { backgroundColor: theme.card, borderColor: theme.borderLight },
            ]}
          >
            <Pressable
              accessibilityRole="button"
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/close-sessions",
                  params: { from: "account-security" },
                })
              }
              style={({ pressed }) => [
                styles.controlRow,
                pressed && styles.pressed,
              ]}
            >
              <View style={[styles.rowIcon, { backgroundColor: theme.rowAlt }]}>
                <Ionicons name="log-in-outline" size={18} color={theme.blue} />
              </View>
              <View style={styles.rowContent}>
                <Text style={[styles.controlTitle, { color: theme.text }]}>
                  Sesiones de la cuenta
                </Text>
                <Text
                  style={[styles.controlDescription, { color: theme.muted }]}
                >
                  Cerrar todas las sesiones de la cuenta
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={21} color={theme.muted} />
            </Pressable>

            <View style={[styles.statusBox, { backgroundColor: theme.rowAlt }]}>
              <View
                style={[
                  styles.statusIcon,
                  { backgroundColor: theme.successSoft },
                ]}
              >
                <Ionicons
                  name="shield-checkmark-outline"
                  size={19}
                  color={statusColor}
                />
              </View>
              <View style={styles.statusCopy}>
                <Text style={[styles.statusLabel, { color: theme.muted }]}>
                  Estado de dispositivos
                </Text>
                <Text style={[styles.statusValue, { color: statusColor }]}>
                  {status}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
