import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { profileFont } from "@/components/profile/profileTheme";
import { useSmartHome } from "@/lib/context/smart-home-context";
import { useResponsiveLayout } from "@/lib/responsive/responsive";
import { useAppTheme } from "@/lib/theme/app-theme";

export default function LoginActivityScreen() {
  const router = useRouter();
  const layout = useResponsiveLayout();
  const theme = useAppTheme();
  const { activeDevices } = useSmartHome();
  const currentDevice = activeDevices[0];
  const otherDevices = activeDevices.slice(1);

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
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="arrow-back" size={25} color={theme.text} />
          </Pressable>

          <Text style={[styles.title, { color: theme.text }]}>
            Actividad de inicio de sesión de la cuenta
          </Text>
          <Text style={[styles.subtitle, { color: theme.muted }]}>
            Actualmente tienes sesiones iniciadas en estos dispositivos:
          </Text>

          {currentDevice ? (
            <View
              style={[
                styles.card,
                { backgroundColor: theme.card, borderColor: theme.borderLight },
              ]}
            >
              <DeviceRow device={currentDevice} current theme={theme} />
            </View>
          ) : null}

          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Inicios de sesión en otros dispositivos
          </Text>
          <View
            style={[
              styles.card,
              { backgroundColor: theme.card, borderColor: theme.borderLight },
            ]}
          >
            {otherDevices.map((device, index) => (
              <DeviceRow
                key={device.id}
                device={device}
                theme={theme}
                divider={index > 0}
              />
            ))}
            {otherDevices.length === 0 ? (
              <Text style={[styles.emptyText, { color: theme.muted }]}>
                No hay inicios de sesión con esta cuenta en otros dispositivos
              </Text>
            ) : null}
            {otherDevices.length > 0 ? (
              <Pressable
                onPress={() => router.push("/(tabs)/close-sessions")}
                style={({ pressed }) => [
                  styles.closeSessions,
                  pressed && styles.pressed,
                ]}
              >
                <Text
                  style={[styles.closeSessionsText, { color: theme.danger }]}
                >
                  Seleccionar dispositivos para cerrar la sesión
                </Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

type Device = {
  id: string;
  name: string;
  lastAccess: string;
  verified: boolean;
};

type DeviceRowProps = {
  current?: boolean;
  device: Device;
  divider?: boolean;
  theme: ReturnType<typeof useAppTheme>;
};

function DeviceRow({ current, device, divider, theme }: DeviceRowProps) {
  return (
    <View style={[styles.deviceRow, divider && styles.divider]}>
      <Ionicons name="phone-portrait-outline" size={31} color={theme.text} />
      <View style={styles.deviceCopy}>
        <Text style={[styles.deviceName, { color: theme.text }]}>
          {device.name}
        </Text>
        <Text style={[styles.deviceMeta, { color: theme.muted }]}>
          Neiva, Colombia · {device.lastAccess}
        </Text>
        {current ? (
          <Text style={[styles.currentText, { color: theme.success }]}>
            Este dispositivo
          </Text>
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={23} color={theme.muted} />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { alignSelf: "center", width: "100%" },
  backButton: { alignSelf: "flex-start", marginBottom: 40, paddingVertical: 4 },
  title: {
    fontFamily: profileFont,
    fontSize: 28,
    fontWeight: "900",
    lineHeight: 36,
  },
  subtitle: {
    fontFamily: profileFont,
    fontSize: 17,
    lineHeight: 25,
    marginTop: 12,
  },
  sectionTitle: {
    fontFamily: profileFont,
    fontSize: 21,
    fontWeight: "900",
    marginBottom: 18,
    marginTop: 38,
  },
  card: { borderRadius: 22, borderWidth: 1, overflow: "hidden" },
  deviceRow: {
    alignItems: "center",
    flexDirection: "row",
    minHeight: 104,
    paddingHorizontal: 18,
    paddingVertical: 17,
  },
  divider: { borderTopColor: "rgba(148,163,184,0.25)", borderTopWidth: 1 },
  deviceCopy: { flex: 1, marginHorizontal: 18 },
  deviceName: { fontFamily: profileFont, fontSize: 17, fontWeight: "800" },
  deviceMeta: {
    fontFamily: profileFont,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 4,
  },
  currentText: {
    fontFamily: profileFont,
    fontSize: 15,
    fontWeight: "700",
    marginTop: 2,
  },
  closeSessions: {
    borderTopColor: "rgba(148,163,184,0.25)",
    borderTopWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  closeSessionsText: {
    fontFamily: profileFont,
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 23,
  },
  emptyText: {
    fontFamily: profileFont,
    fontSize: 16,
    lineHeight: 24,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  pressed: { opacity: 0.7 },
});
