import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { ActiveDevicesCard } from "@/components/dashboard/ActiveDevicesCard";
import { CurrentConsumptionCard } from "@/components/dashboard/CurrentConsumptionCard";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { EmptyDashboard } from "@/components/dashboard/EmptyDashboard";
import { EnergyAccumulatedCard } from "@/components/dashboard/EnergyAccumulatedCard";
import { HomeConsumptionGoalCard } from "@/components/dashboard/HomeConsumptionGoalCard";
import { HomeSummaryCard } from "@/components/dashboard/HommeSummaryCard";
import { useSmartHome } from "@/lib/context/smart-home-context";
import { useResponsiveLayout } from "@/lib/responsive/responsive";
import { useAppTheme } from "@/lib/theme/app-theme";
import { typography } from "@/lib/theme/typography";
import { getHouseConsumption } from "@/lib/utils/consumption";

export default function DashboardScreen() {
  const router = useRouter();
  const layout = useResponsiveLayout();
  const theme = useAppTheme();

  const {
    devices,
    homes,
    accessibleHomes,
    resolvedSmartAlerts,
    sessionName,
    activeHomeId,
    setActiveHomeId,
    homeConsumptionGoals,
    sessionRole,
    setHomeConsumptionGoal,
  } = useSmartHome();

  const isAdmin = sessionRole === "admin";
  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [goalInput, setGoalInput] = useState("");

  /* ------------------------------------------------------------------------ */
  /* Métricas                                                                  */
  /* ------------------------------------------------------------------------ */

  const activeHome = homes.find((home) => home.id === activeHomeId) ?? homes[0];
  const activeHomeDevices = activeHome
    ? devices.filter((device) => device.homeId === activeHome.id)
    : [];
  const onlineDevices = activeHomeDevices.filter((device) => device.online);

  const activeDevices = onlineDevices.filter(
    (device) => device.state === "on" && device.power > 0,
  );

  const totalPower = activeDevices.reduce(
    (sum, device) => sum + device.power,
    0,
  );

  const totalEnergy = activeHome ? getHouseConsumption(devices, activeHome.id) : 0;

  const yesterdayEnergy = onlineDevices.reduce(
    (sum, device) => sum + device.yesterday,
    0,
  );

  /* ------------------------------------------------------------------------ */
  /* Hogar activo                                                              */
  /* ------------------------------------------------------------------------ */

  const favoriteHomes = homes.filter((home) => home.favorite);

  const displayHomes =
    favoriteHomes.length > 0 ? favoriteHomes : homes.slice(0, 1);

  /* ------------------------------------------------------------------------ */
  /* Navegación                                                                */
  /* ------------------------------------------------------------------------ */

  const goToHomes = () => {
    router.push("/(tabs)/homes");
  };

  const goToProfile = () => {
    router.push("/(tabs)/profile");
  };

  const goToDeviceDetail = (deviceId: string) => {
    const device = devices.find((item) => item.id === deviceId);

    if (!device) {
      return;
    }

    Alert.alert(device.name, `${device.room}\n${device.power} W`);
  };

  /* ------------------------------------------------------------------------ */
  /* Notificaciones                                                            */
  /* ------------------------------------------------------------------------ */

  const showNotifications = () => {
    router.push("/(tabs)/alerts");
  };

  const pendingAlerts = devices.filter(
    (device) =>
      (device.critical || !device.online) &&
      !resolvedSmartAlerts.includes(device.id),
  ).length;

  /* ------------------------------------------------------------------------ */
  /* Métricas por hogar                                                        */
  /* ------------------------------------------------------------------------ */

  const getHomePower = (homeId: string) => {
    return devices
      .filter(
        (device) =>
          device.homeId === homeId && device.online && device.state === "on",
      )
      .reduce((sum, device) => sum + device.power, 0);
  };

  const getHomeDeviceCount = (homeId: string) => {
    return devices.filter((device) => device.homeId === homeId && device.online)
      .length;
  };

  /* ------------------------------------------------------------------------ */
  /* Render                                                                    */
  /* ------------------------------------------------------------------------ */

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
          {/* Header */}
          <DashboardHeader
            userName={sessionName || "Usuario"}
            activeHomeName={activeHome?.name ?? "Sin hogar"}
            activeHomeLocation={
              activeHome?.location ?? "Configura tu primer hogar"
            }
            onHomePress={goToHomes}
            onNotificationsPress={showNotifications}
            onProfilePress={goToProfile}
            hasUnreadNotifications={pendingAlerts > 0}
          />

          <View style={[styles.roleBanner, { backgroundColor: theme.rowAlt }]}>
            <Ionicons name={sessionRole === "admin" ? "shield-checkmark-outline" : "person-circle-outline"} size={18} color={theme.blue} />
            <Text style={[styles.roleBannerText, { color: theme.text }]}>
              Rol: {sessionRole === "admin" ? "Administrador" : sessionRole === "miembro" ? "Miembro" : "Invitado"}
            </Text>
            <Text style={[styles.roleBannerMeta, { color: theme.muted }]}>
              {accessibleHomes.length === 1 ? "1 hogar disponible" : `${accessibleHomes.length} hogares disponibles`}
            </Text>
          </View>

          {/* Resumen energético */}
          <View style={styles.section}>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: theme.text,
                },
              ]}
            >
              Resumen energético
            </Text>

            <View
              style={[styles.metricsRow, layout.narrow && styles.metricsColumn]}
            >
              <CurrentConsumptionCard
                power={totalPower}
                isOn={totalPower > 0}
              />

              <EnergyAccumulatedCard
                energy={totalEnergy}
                yesterdayEnergy={yesterdayEnergy}
              />
            </View>

            {activeHome && (
              <HomeConsumptionGoalCard
                consumedWh={totalEnergy}
                targetWh={homeConsumptionGoals[activeHome.id] ?? 5000}
                onEdit={
                  sessionRole !== "invitado"
                    ? () => {
                        setGoalInput(String(homeConsumptionGoals[activeHome.id] ?? 5000));
                        setGoalModalVisible(true);
                      }
                    : undefined
                }
              />
            )}
          </View>

          {isAdmin && (
            <View style={[styles.adminCard, { backgroundColor: theme.card, borderColor: theme.borderLight }]}>
              <View style={styles.adminCopy}>
                <View style={[styles.adminIcon, { backgroundColor: theme.rowAlt }]}>
                  <Ionicons name="settings-outline" size={20} color={theme.blue} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.adminTitle, { color: theme.text }]}>Administración</Text>
                  <Text style={[styles.adminSubtitle, { color: theme.muted }]}>
                    Gestiona hogares, dispositivos y accesos.
                  </Text>
                </View>
              </View>
              <View style={styles.adminActions}>
                <Pressable onPress={goToHomes} style={[styles.adminButton, { borderColor: theme.borderLight }]}>
                  <Ionicons name="home-outline" size={17} color={theme.blue} />
                  <Text style={[styles.adminButtonText, { color: theme.blue }]}>Hogares</Text>
                </Pressable>
                <Pressable onPress={() => router.push("/(tabs)/access")} style={[styles.adminButton, { borderColor: theme.borderLight }]}>
                  <Ionicons name="people-outline" size={17} color={theme.blue} />
                  <Text style={[styles.adminButtonText, { color: theme.blue }]}>Accesos</Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* Dispositivos */}
          <ActiveDevicesCard
            devices={activeHomeDevices}
            onDevicePress={goToDeviceDetail}
            onViewAll={goToHomes}
          />

          {/* Hogares */}
          <View style={styles.homesSection}>
            <View style={styles.sectionHeader}>
              <View>
                <Text
                  style={[
                    styles.sectionTitle,
                    {
                      color: theme.text,
                    },
                  ]}
                >
                  Mis hogares
                </Text>

                <Text
                  style={[
                    styles.sectionSubtitle,
                    {
                      color: theme.muted,
                    },
                  ]}
                >
                  Acceso rápido a tus espacios
                </Text>
              </View>

              <Text
                style={[
                  styles.homeCount,
                  {
                    color: theme.blue,
                  },
                ]}
              >
                {homes.length}
              </Text>
            </View>

            {displayHomes.length > 0 ? (
              displayHomes.map((home) => (
                <HomeSummaryCard
                  key={home.id}
                  name={home.name}
                  power={getHomePower(home.id)}
                  deviceCount={getHomeDeviceCount(home.id)}
                  onPress={() => {
                    setActiveHomeId(home.id);
                    goToHomes();
                  }}
                />
              ))
            ) : (
              <EmptyDashboard onAddPress={goToHomes} />
            )}
          </View>
        </View>

        <Modal visible={goalModalVisible} transparent animationType="fade" onRequestClose={() => setGoalModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalCard, { backgroundColor: theme.card }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Meta mensual del hogar</Text>
              <Text style={[styles.modalText, { color: theme.muted }]}>
                Define el límite total de consumo del hogar. Se acumula el consumo de todos sus dispositivos.
              </Text>
              <TextInput
                value={goalInput}
                onChangeText={setGoalInput}
                keyboardType="numeric"
                style={[styles.goalInput, { color: theme.text, borderColor: theme.borderLight, backgroundColor: theme.rowAlt }]}
                placeholder="Ej. 5000"
                placeholderTextColor={theme.muted}
              />
              <View style={styles.modalActions}>
                <Pressable onPress={() => setGoalModalVisible(false)} style={[styles.modalButton, { borderColor: theme.borderLight }]}>
                  <Text style={[styles.modalButtonText, { color: theme.muted }]}>Cancelar</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    const value = Number(goalInput);
                    if (!activeHome || !Number.isFinite(value) || value <= 0) {
                      Alert.alert("Meta inválida", "Ingresa un valor mayor que 0 Wh.");
                      return;
                    }
                    setHomeConsumptionGoal(activeHome.id, value);
                    setGoalModalVisible(false);
                  }}
                  style={[styles.modalButton, { backgroundColor: theme.blue, borderColor: theme.blue }]}
                >
                  <Text style={styles.modalButtonPrimary}>Guardar meta</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({  roleBanner: {
    alignItems: "center",
    borderRadius: 12,
    flexDirection: "row",
    gap: 7,
    marginTop: 10,
    minHeight: 38,
    paddingHorizontal: 11,
  },
  roleBannerText: {
    fontFamily: typography.fontFamily.emphasis,
    fontSize: 12,
    fontWeight: "800",
  },
  roleBannerMeta: {
    flex: 1,
    fontFamily: typography.fontFamily.regular,
    fontSize: 11,
    textAlign: "right",
  },
  modalOverlay: {
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.35)",
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    borderRadius: 20,
    padding: 20,
    width: "100%",
    maxWidth: 420,
  },
  modalTitle: {
    fontFamily: typography.fontFamily.display,
    fontSize: 19,
    fontWeight: "900",
  },
  modalText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },
  goalInput: {
    borderRadius: 12,
    borderWidth: 1,
    fontFamily: typography.fontFamily.emphasis,
    fontSize: 17,
    fontWeight: "800",
    marginTop: 14,
    minHeight: 48,
    paddingHorizontal: 13,
  },
  modalActions: {
    flexDirection: "row",
    gap: 9,
    marginTop: 14,
  },
  modalButton: {
    alignItems: "center",
    borderRadius: 11,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: 44,
  },
  modalButtonText: {
    fontFamily: typography.fontFamily.emphasis,
    fontSize: 12,
    fontWeight: "800",
  },
  modalButtonPrimary: {
    color: "#FFFFFF",
    fontFamily: typography.fontFamily.emphasis,
    fontSize: 12,
    fontWeight: "800",
  },
  adminCard: {
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 16,
    padding: 14,
  },
  adminCopy: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  adminIcon: {
    alignItems: "center",
    borderRadius: 11,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  adminTitle: {
    fontFamily: typography.fontFamily.display,
    fontSize: 16,
    fontWeight: "900",
  },
  adminSubtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    marginTop: 2,
  },
  adminActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 11,
  },
  adminButton: {
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    minHeight: 40,
  },
  adminButtonText: {
    fontFamily: typography.fontFamily.emphasis,
    fontSize: 12,
    fontWeight: "800",
  },

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

  section: {
    marginTop: 22,
  },

  sectionTitle: {
    fontFamily: typography.fontFamily.display,
    fontSize: 19,
    fontWeight: typography.weight.bold,
  },

  metricsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
    width: "100%",
  },

  metricsColumn: {
    flexDirection: "column",
  },

  homesSection: {
    marginTop: 24,
    width: "100%",
  },

  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  sectionSubtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    marginTop: 3,
  },

  homeCount: {
    fontFamily: typography.fontFamily.emphasis,
    fontSize: 14,
    fontWeight: typography.weight.bold,
  },
});
