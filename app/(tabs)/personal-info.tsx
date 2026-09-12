import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { profileFont } from "@/components/profile/profileTheme";
import { useSmartHome } from "@/lib/context/smart-home-context";
import { useResponsiveLayout } from "@/lib/responsive/responsive";
import { useAppTheme } from "@/lib/theme/app-theme";

export default function PersonalInfoScreen() {
  const router = useRouter();
  const layout = useResponsiveLayout();
  const theme = useAppTheme();
  const { sessionEmail, sessionName, sessionRole } = useSmartHome();

  const roleLabel =
    sessionRole === "admin"
      ? "Administrador"
      : sessionRole === "miembro"
        ? "Miembro"
        : "Invitado";

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
                styles.avatar,
                {
                  backgroundColor: theme.rowAlt,
                  borderColor: theme.borderLight,
                },
              ]}
            >
              <Text style={[styles.avatarText, { color: theme.blue }]}>
                {sessionName.trim().charAt(0).toUpperCase() || "U"}
              </Text>
            </View>
            <View style={styles.headerCopy}>
              <Text style={[styles.title, { color: theme.text }]}>
                {sessionName}
              </Text>
              <Text style={[styles.subtitle, { color: theme.muted }]}>
                Información personal
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.card,
              { backgroundColor: theme.card, borderColor: theme.borderLight },
            ]}
          >
            <View style={styles.row}>
              <View style={[styles.rowIcon, { backgroundColor: theme.rowAlt }]}>
                <Ionicons name="person-outline" size={18} color={theme.blue} />
              </View>
              <View style={styles.rowContent}>
                <Text style={[styles.label, { color: theme.muted }]}>
                  Nombre
                </Text>
                <Text style={[styles.value, { color: theme.text }]}>
                  {sessionName}
                </Text>
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.rowIcon, { backgroundColor: theme.rowAlt }]}>
                <Ionicons name="mail-outline" size={18} color={theme.blue} />
              </View>
              <View style={styles.rowContent}>
                <Text style={[styles.label, { color: theme.muted }]}>
                  Correo
                </Text>
                <Text style={[styles.value, { color: theme.text }]}>
                  {sessionEmail}
                </Text>
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.rowIcon, { backgroundColor: theme.rowAlt }]}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={18}
                  color={theme.blue}
                />
              </View>
              <View style={styles.rowContent}>
                <Text style={[styles.label, { color: theme.muted }]}>Rol</Text>
                <Text style={[styles.value, { color: theme.text }]}>
                  {roleLabel}
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
  avatar: {
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 1,
    height: 60,
    justifyContent: "center",
    width: 60,
  },
  avatarText: {
    fontFamily: profileFont,
    fontSize: 26,
    fontWeight: "900",
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
  pressed: { opacity: 0.72 },
});
