import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

import { useResponsiveLayout } from "@/lib/responsive";

const BLUE = "#0864C8";
const DARK = "#FFFFFF";
const CARD = "#F4F6FF";
const ROW = "#FFFFFF";
const TEXT = "#454545";
const MUTED = "#6B7280";

const settingsTabs = ["Usuario", "Hogar", "App", "Suscripción", "Integraciones"] as const;

export default function SettingsScreen() {
  const router = useRouter();
  const layout = useResponsiveLayout();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          {
            paddingHorizontal: layout.gutter,
            paddingTop: layout.compact ? 12 : 16,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.content, { maxWidth: layout.contentWidth }]}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.6 }]}
          >
            <Ionicons name="chevron-back" size={22} color={BLUE} />
            <Text style={styles.backText}>Perfil</Text>
          </Pressable>

          <View style={styles.topBar}>
            <Text style={styles.brand}>Smart Home</Text>
            <View style={styles.userCircle}>
              <Text style={styles.userInitial}>K</Text>
            </View>
          </View>

          <ScrollView horizontal contentContainerStyle={styles.tabs} showsHorizontalScrollIndicator={false}>
            {settingsTabs.map((item) => {
              const active = item === "App";

              return (
                <Pressable key={item} style={[styles.tab, active && styles.tabActive]}>
                  <Text style={[styles.tabText, active && styles.tabTextActive]}>{item}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.versionCard}>
            <View>
              <Text style={styles.sectionTitle}>Versión de la app</Text>
              <Text style={styles.versionNumber}>1.0.0</Text>
            </View>
            <Pressable style={styles.storeButton} onPress={() => Alert.alert("Tienda", "La versión publicada se conectará aquí.")}>
              <Ionicons name="open-outline" size={20} color={TEXT} />
              <Text style={styles.storeText}>Ir a tienda</Text>
            </Pressable>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Conectividad</Text>
            <Pressable style={styles.row} onPress={() => Alert.alert("Control local WiFi", "Listo para conectar con dispositivos en la red local.")}>
              <Ionicons name="chevron-forward" size={24} color={TEXT} />
              <Text style={styles.rowText}>Control local WiFi</Text>
            </Pressable>
            <Pressable style={styles.row} onPress={() => Alert.alert("Búsqueda en segundo plano", "Listo para detectar dispositivos nuevos.")}>
              <Ionicons name="chevron-forward" size={24} color={TEXT} />
              <Text style={styles.rowText}>Búsqueda en segundo plano</Text>
            </Pressable>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Dispositivos del sistema</Text>
            <Pressable style={styles.primaryButton} onPress={() => Alert.alert("Editar", "Apartado preparado para configurar dispositivos del sistema.")}>
              <Text style={styles.primaryButtonText}>Editar</Text>
            </Pressable>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Integraciones disponibles</Text>
            {[
              { icon: "logo-amazon", name: "Amazon Alexa", detail: "Control por comandos de voz", status: "No conectado" },
              { icon: "flash-outline", name: "Cury", detail: "Control de dispositivos Cury", status: "Nuevo" },
              { icon: "infinite-outline", name: "Zendure", detail: "Monitoreo solar y consumo", status: "Alpha" },
            ].map((item) => (
              <Pressable
                key={item.name}
                style={styles.integrationRow}
                onPress={() => Alert.alert(item.name, "La configuración quedará conectada al backend.")}
              >
                <View style={styles.integrationIcon}>
                  <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={25} color={BLUE} />
                </View>
                <View style={styles.integrationCopy}>
                  <Text style={styles.integrationName}>{item.name}</Text>
                  <Text style={styles.integrationDetail}>{item.detail}</Text>
                </View>
                <Text style={styles.integrationStatus}>{item.status}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const appFont = "sans-serif-medium";

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: DARK,
  },
  container: {
    alignItems: "center",
    paddingBottom: 112,
  },
  content: {
    alignSelf: "center",
    width: "100%",
  },
  backButton: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
    marginBottom: 12,
  },
  backText: {
    color: BLUE,
    fontFamily: appFont,
    fontSize: 16,
    fontWeight: "800",
  },
  topBar: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  brand: {
    color: TEXT,
    fontFamily: appFont,
    fontSize: 30,
    fontStyle: "italic",
    fontWeight: "900",
  },
  userCircle: {
    alignItems: "center",
    backgroundColor: "#74D87C",
    borderRadius: 23,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  userInitial: {
    color: "#102314",
    fontFamily: appFont,
    fontSize: 20,
    fontWeight: "900",
  },
  tabs: {
    gap: 8,
    paddingTop: 30,
  },
  tab: {
    borderBottomColor: BLUE,
    borderBottomWidth: 1,
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  tabActive: {
    borderColor: BLUE,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderWidth: 1.5,
    borderBottomWidth: 1,
  },
  tabText: {
    color: MUTED,
    fontFamily: appFont,
    fontSize: 16,
    fontWeight: "700",
  },
  tabTextActive: {
    color: TEXT,
    fontWeight: "900",
  },
  versionCard: {
    alignItems: "center",
    backgroundColor: CARD,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30,
    padding: 16,
  },
  sectionTitle: {
    color: TEXT,
    fontFamily: appFont,
    fontSize: 19,
    fontWeight: "900",
  },
  versionNumber: {
    color: TEXT,
    fontFamily: appFont,
    fontSize: 20,
    fontWeight: "700",
    marginTop: 14,
  },
  storeButton: {
    alignItems: "center",
    borderColor: BLUE,
    borderRadius: 10,
    borderWidth: 1.5,
    flexDirection: "row",
    gap: 8,
    minHeight: 42,
    paddingHorizontal: 12,
  },
  storeText: {
    color: TEXT,
    fontFamily: appFont,
    fontSize: 14,
    fontWeight: "900",
  },
  card: {
    backgroundColor: CARD,
    borderRadius: 16,
    gap: 12,
    marginTop: 16,
    padding: 16,
  },
  row: {
    alignItems: "center",
    backgroundColor: ROW,
    borderRadius: 12,
    flexDirection: "row",
    minHeight: 50,
    paddingHorizontal: 12,
  },
  rowText: {
    color: TEXT,
    flex: 1,
    fontFamily: appFont,
    fontSize: 17,
    fontWeight: "700",
    marginLeft: 8,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: BLUE,
    borderRadius: 12,
    height: 50,
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontFamily: appFont,
    fontSize: 17,
    fontWeight: "900",
  },
  integrationRow: {
    alignItems: "center",
    backgroundColor: ROW,
    borderRadius: 14,
    flexDirection: "row",
    minHeight: 78,
    paddingHorizontal: 12,
  },
  integrationIcon: {
    width: 48,
    height: 48,
    alignItems: "center",
    backgroundColor: "#EEF4FF",
    borderRadius: 24,
    justifyContent: "center",
  },
  integrationCopy: {
    flex: 1,
    marginLeft: 12,
    minWidth: 0,
  },
  integrationName: {
    color: TEXT,
    fontFamily: appFont,
    fontSize: 16,
    fontWeight: "900",
  },
  integrationDetail: {
    color: MUTED,
    fontFamily: appFont,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 3,
  },
  integrationStatus: {
    color: BLUE,
    fontFamily: appFont,
    fontSize: 11,
    fontWeight: "900",
  },
});
