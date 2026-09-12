import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { profileFont } from "@/components/profile/profileTheme";
import { useResponsiveLayout } from "@/lib/responsive/responsive";
import { useAppTheme } from "@/lib/theme/app-theme";

export default function AboutSmartHomeScreen() {
  const router = useRouter();
  const layout = useResponsiveLayout();
  const theme = useAppTheme();

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
                name="information-circle-outline"
                size={26}
                color={theme.blue}
              />
            </View>
            <View style={styles.headerCopy}>
              <Text style={[styles.title, { color: theme.text }]}>
                Smart Home
              </Text>
              <Text style={[styles.subtitle, { color: theme.muted }]}>
                Tu hogar inteligente en un solo lugar
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.card,
              { backgroundColor: theme.card, borderColor: theme.borderLight },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Acerca de la app
            </Text>
            <Text style={[styles.description, { color: theme.muted }]}>
              Smart Home te ayuda a controlar dispositivos, revisar consumos,
              gestionar hogares y mantener tus espacios conectados con mayor
              claridad y rapidez.
            </Text>

            <View style={styles.infoRow}>
              <Text style={[styles.label, { color: theme.muted }]}>
                Versión
              </Text>
              <Text style={[styles.value, { color: theme.text }]}>1.0.0</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={[styles.label, { color: theme.muted }]}>
                Plataforma
              </Text>
              <Text style={[styles.value, { color: theme.text }]}>
                Expo / React Native
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={[styles.label, { color: theme.muted }]}>Estado</Text>
              <Text style={[styles.value, { color: theme.text }]}>Beta</Text>
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
    padding: 18,
    paddingTop: 16,
  },
  sectionTitle: {
    fontFamily: profileFont,
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 10,
  },
  description: {
    fontFamily: profileFont,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 18,
  },
  infoRow: {
    borderTopColor: "rgba(148,163,184,0.25)",
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
    marginTop: 12,
  },
  label: {
    fontFamily: profileFont,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  value: {
    fontFamily: profileFont,
    fontSize: 14,
    fontWeight: "800",
  },
  pressed: { opacity: 0.72 },
});
