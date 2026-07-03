import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { formatKwh } from "@/lib/formatters";
import { useAppTheme } from "@/lib/app-theme";
import { useResponsiveLayout } from "@/lib/responsive";
import { useSmartHome } from "@/lib/smart-home-context";

const BLUE = "#0864C8";
const DARK = "#FFFFFF";
const CARD = "#DDDDFB";
const PANEL = "#F4F6FF";
const TEXT = "#454545";
const MUTED = "#6B7280";
const GREEN = "#74D87C";

export default function DashboardScreen() {
  const router = useRouter();
  const layout = useResponsiveLayout();
  const theme = useAppTheme();

  // Datos globales usados para construir el resumen del dashboard.
  const { devices, homes, sessionName, setActiveHomeId } = useSmartHome();

  // El dashboard no guarda estos datos: los deriva del estado global.
  const onlineDevices = devices.filter((device) => device.online);
  const currentConsumption = onlineDevices.reduce((total, device) => total + device.consumption, 0);
  const favoriteHomes = homes.filter((home) => home.favorite);
  const dashboardHomes = favoriteHomes.length ? favoriteHomes : homes.slice(0, 1);

  /**
   * Muestra una alerta de estado general.
   *
   * Si existe un dispositivo critico encendido, recomienda ahorro. Si no,
   * informa que no hay alertas activas.
   */
  function showNotifications() {
    const critical = devices.find((device) => device.critical && device.online);

    Alert.alert(
      critical ? "Ahorro recomendado" : "Todo en orden",
      critical
        ? `${critical.name} está consumiendo más de lo habitual.`
        : "No hay alertas activas en tus dispositivos.",
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          {
            paddingHorizontal: layout.gutter,
            paddingBottom: layout.screenBottom,
            paddingTop: layout.screenTop,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.content, { maxWidth: layout.contentWidth }]}>
          <View style={styles.topBar}>
            <Text style={[styles.brand, { color: theme.text }]}>Smart Home</Text>
            <View style={styles.topActions}>
              <Pressable style={[styles.squareButton, { backgroundColor: theme.rowAlt }]} onPress={showNotifications}>
                <Ionicons name="notifications-outline" size={22} color={theme.text} />
              </Pressable>
              <Pressable style={styles.userCircle} onPress={() => router.push("/profile")}>
                <Text style={styles.userInitial}>{sessionName.charAt(0).toUpperCase()}</Text>
              </Pressable>
            </View>
          </View>

          <ScrollView horizontal contentContainerStyle={styles.tabs} showsHorizontalScrollIndicator={false}>
            {["Actividad", "Mi dashboard", "Hogares"].map((item) => {
              const active = item === "Mi dashboard";

              return (
                <Pressable
                  key={item}
                  style={[styles.tab, active && styles.tabActive]}
                  onPress={() => item === "Hogares" && router.push("/devices")}
                >
                  <Text style={[styles.tabText, { color: theme.muted }, active && styles.tabTextActive]}>{item}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={[styles.toolbar, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text numberOfLines={1} style={[styles.toolbarTitle, { color: theme.text }]}>Mi dashboard</Text>
            <Pressable style={styles.customizeButton} onPress={() => router.push("/reports")}>
              <Ionicons name="options-outline" size={21} color={theme.text} />
              <Text style={[styles.customizeText, { color: theme.text }]}>Personalizar</Text>
            </Pressable>
            <Pressable style={styles.blueIconButton} onPress={() => router.push("/devices")}>
              <Ionicons name="add" size={26} color="#FFFFFF" />
            </Pressable>
            <Pressable style={styles.infoButton} onPress={() => Alert.alert("Dashboard", "Agrega hogares favoritos para verlos aquí.")}>
              <Ionicons name="information-circle" size={24} color={theme.text} />
            </Pressable>
          </View>

          {/* Resumen principal: consumo total calculado con dispositivos encendidos. */}
          <View style={[styles.energyCard, { backgroundColor: theme.card }]}>
            <View>
              <Text style={[styles.energyLabel, { color: theme.muted }]}>Consumo actual</Text>
              <Text style={[styles.energyValue, { color: theme.text }]}>{formatKwh(currentConsumption)}</Text>
            </View>
            <View style={[styles.energyPill, { backgroundColor: theme.row }]}>
              <Ionicons name="flash" size={18} color={theme.text} />
              <Text style={[styles.energyPillText, { color: theme.text }]}>{onlineDevices.length} activos</Text>
            </View>
          </View>

          {/* Hogares favoritos o primer hogar como acceso rapido. */}
          <View style={styles.widgets}>
            {dashboardHomes.length > 0 ? (
              dashboardHomes.map((home) => {
                const homeDevices = devices.filter((device) => device.homeId === home.id);
                const homeConsumption = homeDevices
                  .filter((device) => device.online)
                  .reduce((sum, device) => sum + device.consumption, 0);

                return (
                  <Pressable
                    key={home.id}
                    style={({ pressed }) => [
                      styles.roomCard,
                      { backgroundColor: theme.row },
                      pressed && styles.cardPressed,
                    ]}
                    onPress={() => {
                      setActiveHomeId(home.id);
                      router.push("/devices");
                    }}
                  >
                    <View style={styles.roomStrip}>
                      <View style={styles.roomBadge}>
                        <MaterialCommunityIcons name="door-open" size={16} color={BLUE} />
                        <Text style={styles.roomBadgeText}>Hogar</Text>
                      </View>
                    </View>
                    <View style={styles.roomBody}>
                      <Text numberOfLines={1} style={[styles.roomName, { color: theme.text }]}>{home.name}</Text>
                      <View style={[styles.wattsPill, { backgroundColor: theme.rowAlt }]}>
                        <Ionicons name="flash" size={19} color={BLUE} />
                        <Text style={[styles.wattsText, { color: theme.text }]}>{homeConsumption.toFixed(2)} kWh</Text>
                      </View>
                    </View>
                  </Pressable>
                );
              })
            ) : (
              <View style={[styles.emptyState, { backgroundColor: theme.card }]}>
                <Text style={[styles.emptyTitle, { color: theme.text }]}>Dashboard vacío</Text>
                <Text style={[styles.emptyText, { color: theme.muted }]}>Agrega un hogar favorito para tener acceso rápido.</Text>
                <Pressable style={styles.addWidgetButton} onPress={() => router.push("/devices")}>
                  <Text style={styles.addWidgetText}>Agregar hogar</Text>
                </Pressable>
              </View>
            )}
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
    minHeight: "100%",
    paddingBottom: 112,
  },
  content: {
    alignSelf: "center",
    width: "100%",
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
  topActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  squareButton: {
    alignItems: "center",
    backgroundColor: "#EEF4FF",
    borderRadius: 14,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  userCircle: {
    alignItems: "center",
    backgroundColor: GREEN,
    borderRadius: 23,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  userInitial: {
    color: "#102314",
    fontFamily: appFont,
    fontSize: 20,
    fontWeight: "800",
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
  toolbar: {
    alignItems: "center",
    backgroundColor: PANEL,
    borderColor: "#59616C",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    marginTop: 28,
    minHeight: 58,
    paddingHorizontal: 12,
  },
  toolbarTitle: {
    color: TEXT,
    flex: 1,
    fontFamily: appFont,
    fontSize: 18,
    fontWeight: "900",
    minWidth: 0,
  },
  customizeButton: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },
  customizeText: {
    color: TEXT,
    fontFamily: appFont,
    fontSize: 14,
    fontWeight: "800",
    textDecorationLine: "underline",
  },
  blueIconButton: {
    alignItems: "center",
    backgroundColor: BLUE,
    borderRadius: 12,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  infoButton: {
    alignItems: "center",
    height: 38,
    justifyContent: "center",
    width: 32,
  },
  energyCard: {
    alignItems: "center",
    backgroundColor: CARD,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
    padding: 16,
  },
  energyLabel: {
    color: MUTED,
    fontFamily: appFont,
    fontSize: 14,
    fontWeight: "700",
  },
  energyValue: {
    color: TEXT,
    fontFamily: appFont,
    fontSize: 28,
    fontWeight: "900",
    marginTop: 4,
  },
  energyPill: {
    alignItems: "center",
    backgroundColor: "#EEF4FF",
    borderRadius: 14,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  energyPillText: {
    color: BLUE,
    fontFamily: appFont,
    fontSize: 13,
    fontWeight: "800",
  },
  widgets: {
    marginTop: 30,
  },
  roomCard: {
    backgroundColor: CARD,
    borderRadius: 16,
    maxWidth: 332,
    overflow: "hidden",
    width: "100%",
  },
  cardPressed: {
    opacity: 0.75,
  },
  roomStrip: {
    backgroundColor: BLUE,
    height: 82,
    justifyContent: "flex-start",
  },
  roomBadge: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#EEF4FF",
    borderBottomRightRadius: 14,
    flexDirection: "row",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  roomBadgeText: {
    color: BLUE,
    fontFamily: appFont,
    fontSize: 12,
    fontWeight: "800",
  },
  roomBody: {
    alignItems: "center",
    minHeight: 120,
    padding: 18,
  },
  roomName: {
    color: TEXT,
    fontFamily: appFont,
    fontSize: 18,
    fontWeight: "900",
  },
  wattsPill: {
    alignItems: "center",
    backgroundColor: "#EEF4FF",
    borderRadius: 14,
    flexDirection: "row",
    gap: 8,
    marginTop: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  wattsText: {
    color: BLUE,
    fontFamily: appFont,
    fontSize: 16,
    fontWeight: "900",
  },
  emptyState: {
    alignItems: "center",
    marginTop: 80,
    paddingHorizontal: 18,
  },
  emptyTitle: {
    color: TEXT,
    fontFamily: appFont,
    fontSize: 26,
    fontWeight: "900",
    textAlign: "center",
  },
  emptyText: {
    color: MUTED,
    fontFamily: appFont,
    fontSize: 17,
    fontWeight: "700",
    lineHeight: 24,
    marginTop: 14,
    textAlign: "center",
  },
  addWidgetButton: {
    alignItems: "center",
    backgroundColor: BLUE,
    borderRadius: 15,
    height: 56,
    justifyContent: "center",
    marginTop: 28,
    paddingHorizontal: 28,
  },
  addWidgetText: {
    color: "#FFFFFF",
    fontFamily: appFont,
    fontSize: 18,
    fontWeight: "900",
  },
});
