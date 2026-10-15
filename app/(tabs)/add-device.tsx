import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useResponsiveLayout } from "@/lib/responsive/responsive";
import { useAppTheme } from "@/lib/theme/app-theme";

export default function AddDeviceScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const layout = useResponsiveLayout();

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
    >
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: layout.gutter,
          paddingTop: layout.screenTop,
          paddingBottom: layout.screenBottom,
        }}
      >
        <View style={[styles.content, { maxWidth: layout.contentWidth }]}>
          <Pressable
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/(tabs)/devices");
              }
            }}
            style={({ pressed }) => [
              styles.backButton,
              { backgroundColor: theme.card, borderColor: theme.borderLight },
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="chevron-back" size={18} color={theme.blue} />
            <Text style={[styles.backText, { color: theme.blue }]}>Volver</Text>
          </Pressable>

          <View style={styles.header}>
            <View style={[styles.iconWrap, { backgroundColor: theme.rowAlt }]}>
              <Ionicons
                name="hardware-chip-outline"
                size={30}
                color={theme.blue}
              />
            </View>
            <Text style={[styles.title, { color: theme.text }]}>
              Agregar dispositivo
            </Text>
            <Text style={[styles.subtitle, { color: theme.muted }]}>
              Vincula un Shelly desde tu hogar mediante una conexión local
              segura.
            </Text>
          </View>

          <View
            style={[
              styles.card,
              { backgroundColor: theme.card, borderColor: theme.borderLight },
            ]}
          >
            <Text style={[styles.cardTitle, { color: theme.text }]}>
              Buscar dispositivo cercano
            </Text>
            <Text style={[styles.cardText, { color: theme.muted }]}>
              La vinculación de dispositivos Shelly mediante Bluetooth
              todavía no está disponible en esta versión.
            </Text>
            <Pressable
              disabled
              accessibilityRole="button"
              accessibilityState={{ disabled: true }}
              accessibilityLabel="Vinculación Bluetooth no disponible"
              style={[
                styles.primaryButton,
                { backgroundColor: theme.blue },
                styles.disabled,
              ]}
            >
              <Ionicons name="bluetooth-outline" size={20} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>
                Vinculación BLE no disponible
              </Text>
            </Pressable>
          </View>

          <View style={[styles.infoCard, { backgroundColor: theme.rowAlt }]}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color={theme.blue}
            />
            <Text style={[styles.infoText, { color: theme.muted }]}>
              Esta función requiere completar la integración de vinculación con
              el backend y el soporte BLE nativo en Android. Los dispositivos
              ya registrados se gestionan desde el hogar.
            </Text>
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
    marginBottom: 28,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  backText: { fontSize: 13, fontWeight: "800", marginLeft: 6 },
  header: { alignItems: "center", marginBottom: 24 },
  iconWrap: {
    alignItems: "center",
    borderRadius: 22,
    height: 72,
    justifyContent: "center",
    marginBottom: 14,
    width: 72,
  },
  title: { fontSize: 22, fontWeight: "900", textAlign: "center" },
  subtitle: { fontSize: 13, lineHeight: 19, marginTop: 8, textAlign: "center" },
  card: { borderRadius: 18, borderWidth: 1, padding: 18 },
  cardTitle: { fontSize: 16, fontWeight: "800" },
  cardText: { fontSize: 13, lineHeight: 19, marginTop: 8 },
  primaryButton: {
    alignItems: "center",
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 18,
    paddingVertical: 13,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    marginLeft: 8,
  },
  infoCard: {
    borderRadius: 14,
    flexDirection: "row",
    marginTop: 16,
    padding: 14,
  },
  infoText: { flex: 1, fontSize: 12, lineHeight: 18, marginLeft: 8 },
  disabled: { opacity: 0.6 },
  pressed: { opacity: 0.75 },
});
