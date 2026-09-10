import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useSmartHome } from "@/lib/context/smart-home-context";
import { useResponsiveLayout } from "@/lib/responsive/responsive";
import { useAppTheme } from "@/lib/theme/app-theme";

export default function DevicesScreen() {
  const router = useRouter();
  const layout = useResponsiveLayout();
  const theme = useAppTheme();

  const { devices, homes, accessibleHomes, resolvedSmartAlerts, setActiveHomeId, toggleDevice } =
    useSmartHome();

  const accessibleHomeIds = new Set(accessibleHomes.map((home) => home.id));
  const visibleDevices = devices.filter((device) => accessibleHomeIds.has(device.homeId));

  const onlineCount = visibleDevices.filter((device) => device.online).length;

  const alertCount = visibleDevices.filter(
    (device) =>
      (device.critical || !device.online) &&
      !resolvedSmartAlerts.includes(device.id),
  ).length;

  function openDeviceHome(homeId: string) {
    setActiveHomeId(homeId);

    router.push({
      pathname: "/(tabs)/homes",
      params: { homeId },
    });
  }

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor: theme.background,
        },
      ]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.container,
          {
            paddingHorizontal: layout.gutter,
            paddingTop: layout.screenTop,
            paddingBottom: layout.screenBottom,
          },
        ]}
      >
        <View
          style={[
            styles.content,
            {
              maxWidth: layout.contentWidth,
            },
          ]}
        >
          {/* HEADER */}
          <View style={styles.header}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Volver"
              hitSlop={8}
              onPress={() => router.back()}
              style={({ pressed }) => [
                styles.backButton,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.borderLight,
                },
                pressed && styles.pressed,
              ]}
            >
              <Ionicons name="arrow-back" size={22} color={theme.text} />
            </Pressable>

            <View style={styles.headerCopy}>
              <Text style={[styles.title, { color: theme.text }]}>
                Dispositivos
              </Text>

              <Text style={[styles.subtitle, { color: theme.muted }]}>
                Todos tus dispositivos Smart Home
              </Text>
            </View>
          </View>

          {/* SUMMARY */}
          <View
            style={[
              styles.summaryCard,
              {
                backgroundColor: theme.card,
                borderColor: theme.borderLight,
              },
            ]}
          >
            <View
              style={[
                styles.summaryItem,
                {
                  backgroundColor: theme.rowAlt,
                },
              ]}
            >
              <Ionicons
                name="hardware-chip-outline"
                size={23}
                color={theme.blue}
              />

              <Text style={[styles.summaryNumber, { color: theme.text }]}>
                {visibleDevices.length}
              </Text>

              <Text style={[styles.summaryLabel, { color: theme.muted }]}>
                Total
              </Text>
            </View>

            <View
              style={[
                styles.summaryItem,
                {
                  backgroundColor: theme.rowAlt,
                },
              ]}
            >
              <Ionicons name="wifi-outline" size={23} color={theme.success} />

              <Text style={[styles.summaryNumber, { color: theme.text }]}>
                {onlineCount}
              </Text>

              <Text style={[styles.summaryLabel, { color: theme.muted }]}>
                Conectados
              </Text>
            </View>

            <View
              style={[
                styles.summaryItem,
                {
                  backgroundColor: theme.rowAlt,
                },
              ]}
            >
              <Ionicons name="warning-outline" size={23} color={theme.danger} />

              <Text style={[styles.summaryNumber, { color: theme.text }]}>
                {alertCount}
              </Text>

              <Text style={[styles.summaryLabel, { color: theme.muted }]}>
                Alertas
              </Text>
            </View>
          </View>

          {/* DEVICES */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Mis dispositivos
            </Text>

            {visibleDevices.map((device) => {
              const home = homes.find((item) => item.id === device.homeId);

              const hasAlert =
                (device.critical || !device.online) &&
                !resolvedSmartAlerts.includes(device.id);

              const statusText = hasAlert
                ? device.critical
                  ? "Requiere atención"
                  : "Sin conexión"
                : device.online
                  ? "Conectado"
                  : "Sin conexión";

              const statusColor = hasAlert
                ? theme.danger
                : device.online
                  ? theme.success
                  : theme.muted;

              return (
                <View
                  key={device.id}
                  style={[
                    styles.deviceCard,
                    {
                      backgroundColor: theme.card,
                      borderColor: hasAlert ? theme.danger : theme.borderLight,
                    },
                    hasAlert && styles.alertBorder,
                  ]}
                >
                  {/* DEVICE NAVIGATION */}
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Abrir ${device.name}`}
                    onPress={() => openDeviceHome(device.homeId)}
                    style={({ pressed }) => [
                      styles.deviceContent,
                      pressed && styles.pressed,
                    ]}
                  >
                    <View
                      style={[
                        styles.deviceIcon,
                        {
                          backgroundColor: theme.rowAlt,
                        },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={device.icon as never}
                        size={28}
                        color={device.online ? theme.blue : theme.muted}
                      />
                    </View>

                    <View style={styles.deviceCopy}>
                      <View style={styles.deviceTitleRow}>
                        <Text
                          numberOfLines={1}
                          style={[
                            styles.deviceTitle,
                            {
                              color: theme.text,
                            },
                          ]}
                        >
                          {device.name}
                        </Text>

                        {hasAlert && (
                          <Ionicons
                            name="warning-outline"
                            size={16}
                            color={theme.danger}
                          />
                        )}
                      </View>

                      <Text
                        numberOfLines={1}
                        style={[
                          styles.deviceMeta,
                          {
                            color: theme.muted,
                          },
                        ]}
                      >
                        {home?.name ?? "Hogar"} · {device.room}
                      </Text>

                      <Text
                        style={[
                          styles.deviceStatus,
                          {
                            color: statusColor,
                          },
                        ]}
                      >
                        {statusText}
                      </Text>
                    </View>
                  </Pressable>

                  {/* DEVICE SWITCH */}
                  <Switch
                    value={device.online}
                    onValueChange={() => toggleDevice(device.id)}
                    accessibilityLabel={`Cambiar estado de ${device.name}`}
                    trackColor={{
                      false: "#CDD2E4",
                      true: "#BDE8CB",
                    }}
                    thumbColor={device.online ? "#2AAF5D" : "#FFFFFF"}
                  />
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  container: {
    alignItems: "center",
  },

  content: {
    alignSelf: "center",
    width: "100%",
  },

  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },

  backButton: {
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    height: 42,
    justifyContent: "center",
    width: 42,
  },

  headerCopy: {
    flex: 1,
    minWidth: 0,
  },

  title: {
    fontSize: 25,
    fontWeight: "900",
  },

  subtitle: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 3,
  },

  summaryCard: {
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    marginTop: 22,
    padding: 10,
  },

  summaryItem: {
    alignItems: "center",
    borderRadius: 14,
    flex: 1,
    minHeight: 88,
    justifyContent: "center",
  },

  summaryNumber: {
    fontSize: 20,
    fontWeight: "900",
    marginTop: 5,
  },

  summaryLabel: {
    fontSize: 10,
    fontWeight: "700",
    marginTop: 1,
  },

  section: {
    marginTop: 28,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "900",
    marginBottom: 12,
  },

  deviceCard: {
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    marginBottom: 10,
    padding: 13,
  },

  alertBorder: {
    borderWidth: 1.5,
  },

  deviceContent: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    minWidth: 0,
  },

  deviceIcon: {
    alignItems: "center",
    borderRadius: 12,
    height: 48,
    justifyContent: "center",
    width: 48,
  },

  deviceCopy: {
    flex: 1,
    marginLeft: 12,
    minWidth: 0,
  },

  deviceTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },

  deviceTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: "900",
  },

  deviceMeta: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 3,
  },

  deviceStatus: {
    fontSize: 11,
    fontWeight: "800",
    marginTop: 4,
  },

  pressed: {
    opacity: 0.7,
  },
});
