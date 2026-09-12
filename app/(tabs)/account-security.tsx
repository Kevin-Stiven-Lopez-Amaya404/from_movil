import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { profileFont } from "@/components/profile/profileTheme";
import { useSmartHome } from "@/lib/context/smart-home-context";
import { useResponsiveLayout } from "@/lib/responsive/responsive";
import { useAppTheme } from "@/lib/theme/app-theme";

export default function AccountSecurityScreen() {
  const router = useRouter();
  const layout = useResponsiveLayout();
  const theme = useAppTheme();
  const { activeDevices, devices, resolvedSmartAlerts } = useSmartHome();

  const pendingAlerts = devices.filter(
    (device) =>
      (device.critical || !device.online) &&
      !resolvedSmartAlerts.includes(device.id),
  ).length;

  const status = pendingAlerts === 0 ? "Cuenta protegida" : "Requiere atención";
  const statusColor = pendingAlerts === 0 ? theme.success : theme.danger;

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
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backButton,
              { backgroundColor: theme.card, borderColor: theme.borderLight },
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="chevron-back" size={17} color={theme.blue} />
            <Text style={[styles.backText, { color: theme.blue }]}>Volver</Text>
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
              onPress={() => router.push("/(tabs)/login-locations")}
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
                  Dónde iniciaste sesión
                </Text>
                <Text
                  style={[styles.controlDescription, { color: theme.muted }]}
                >
                  {activeDevices.length} dispositivo
                  {activeDevices.length === 1 ? "" : "s"} con sesiones
                  registradas
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
                  Estado de seguridad
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

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { alignSelf: "center", width: "100%" },
  backButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    marginBottom: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  backText: {
    fontFamily: profileFont,
    fontSize: 13,
    fontWeight: "800",
    marginLeft: 6,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 18,
  },
  iconWrap: {
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 1,
    height: 60,
    justifyContent: "center",
    width: 60,
  },
  headerCopy: { flex: 1, marginLeft: 12 },
  title: {
    fontFamily: profileFont,
    fontSize: 20,
    fontWeight: "900",
  },
  subtitle: {
    fontFamily: profileFont,
    fontSize: 12,
    marginTop: 2,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
    paddingVertical: 6,
  },
  row: {
    alignItems: "center",
    borderBottomColor: "rgba(148,163,184,0.25)",
    borderBottomWidth: 1,
    flexDirection: "row",
    paddingHorizontal: 14,
    paddingVertical: 16,
  },
  rowIcon: {
    alignItems: "center",
    borderRadius: 10,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  rowContent: { flex: 1, marginLeft: 12 },
  controlRow: {
    alignItems: "center",
    borderBottomColor: "rgba(148,163,184,0.25)",
    borderBottomWidth: 1,
    flexDirection: "row",
    paddingHorizontal: 14,
    paddingVertical: 18,
  },
  controlTitle: {
    fontFamily: profileFont,
    fontSize: 16,
    fontWeight: "800",
  },
  controlDescription: {
    fontFamily: profileFont,
    fontSize: 11,
    marginTop: 4,
  },
  label: {
    fontFamily: profileFont,
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 2,
    textTransform: "uppercase",
  },
  value: {
    fontFamily: profileFont,
    fontSize: 16,
    fontWeight: "800",
  },
  statusBox: {
    alignItems: "center",
    flexDirection: "row",
    borderRadius: 14,
    margin: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  statusIcon: {
    alignItems: "center",
    borderRadius: 10,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  statusCopy: { flex: 1, marginLeft: 10 },
  statusLabel: {
    fontFamily: profileFont,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  statusValue: {
    fontFamily: profileFont,
    fontSize: 18,
    fontWeight: "900",
    marginTop: 4,
  },
  pressed: { opacity: 0.72 },
});
