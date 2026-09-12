import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { profileFont } from "@/components/profile/profileTheme";
import { useSmartHome } from "@/lib/context/smart-home-context";
import { useResponsiveLayout } from "@/lib/responsive/responsive";
import { useAppTheme } from "@/lib/theme/app-theme";

export default function LoginLocationsScreen() {
  const router = useRouter();
  const layout = useResponsiveLayout();
  const theme = useAppTheme();
  const { activeDevices, sessionEmail, sessionName } = useSmartHome();

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
            Dónde iniciaste sesión
          </Text>
          <Text style={[styles.subtitle, { color: theme.muted }]}>
            Consulta qué dispositivos se usan para iniciar sesión en tus
            cuentas.
          </Text>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Cuentas
          </Text>

          <View
            style={[
              styles.card,
              { backgroundColor: theme.card, borderColor: theme.borderLight },
            ]}
          >
            <Pressable
              onPress={() => router.push("/(tabs)/login-activity")}
              style={({ pressed }) => [
                styles.accountRow,
                pressed && styles.pressed,
              ]}
            >
              <View style={[styles.avatar, { backgroundColor: theme.rowAlt }]}>
                <Ionicons name="person" size={25} color={theme.muted} />
                <View
                  style={[styles.accountBadge, { backgroundColor: theme.blue }]}
                >
                  <Ionicons name="home" size={10} color="#FFFFFF" />
                </View>
              </View>
              <View style={styles.rowCopy}>
                <Text style={[styles.accountName, { color: theme.text }]}>
                  {sessionName}
                </Text>
                <Text style={[styles.deviceName, { color: theme.muted }]}>
                  {sessionEmail}
                </Text>
                <Text style={[styles.deviceCount, { color: theme.muted }]}>
                  + {activeDevices.length} dispositivos
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={theme.muted} />
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
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
    lineHeight: 35,
  },
  subtitle: {
    fontFamily: profileFont,
    fontSize: 17,
    lineHeight: 25,
    marginTop: 12,
  },
  sectionTitle: {
    fontFamily: profileFont,
    fontSize: 23,
    fontWeight: "900",
    marginBottom: 18,
    marginTop: 38,
  },
  card: { borderRadius: 22, borderWidth: 1, overflow: "hidden" },
  accountRow: {
    alignItems: "center",
    flexDirection: "row",
    minHeight: 132,
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  avatar: {
    alignItems: "center",
    borderRadius: 35,
    height: 70,
    justifyContent: "center",
    position: "relative",
    width: 70,
  },
  accountBadge: {
    alignItems: "center",
    borderRadius: 12,
    bottom: -1,
    height: 24,
    justifyContent: "center",
    position: "absolute",
    right: -2,
    width: 24,
  },
  rowCopy: { flex: 1, marginHorizontal: 16 },
  accountName: { fontFamily: profileFont, fontSize: 19, fontWeight: "800" },
  deviceName: { fontFamily: profileFont, fontSize: 16, marginTop: 4 },
  deviceCount: { fontFamily: profileFont, fontSize: 15, marginTop: 6 },
  pressed: { opacity: 0.7 },
});
