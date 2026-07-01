import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

import { formatKwh } from "@/lib/formatters";
import { useResponsiveLayout } from "@/lib/responsive";
import { SmartDevice, useSmartHome } from "@/lib/smart-home-context";

const BLUE = "#0864C8";
const LILAC = "#DDDDFB";
const TEXT = "#454545";
const GREEN = "#2AAF5D";
const RED = "#FF3B20";
const MUTED = "#6B7280";

function getTrend(device: SmartDevice) {
  const delta = device.consumption - device.yesterday;

  if (Math.abs(delta) < 0.01) {
    return { label: "=", color: MUTED };
  }

  const percent = Math.round((Math.abs(delta) / device.yesterday) * 100);
  return {
    label: `${delta > 0 ? "↑" : "↓"}${percent}%`,
    color: delta > 0 ? RED : GREEN,
  };
}

export default function DashboardScreen() {
  const router = useRouter();
  const layout = useResponsiveLayout();
  const { devices, homes, sessionName, setActiveHomeId } = useSmartHome();
  const onlineDevices = devices.filter((device) => device.online);
  const currentConsumption = onlineDevices.reduce((total, device) => total + device.consumption, 0);
  const yesterdayConsumption = onlineDevices.reduce((total, device) => total + device.yesterday, 0);
  const delta = currentConsumption - yesterdayConsumption;
  const deltaPercent = yesterdayConsumption > 0 ? Math.round((Math.abs(delta) / yesterdayConsumption) * 100) : 0;
  const topDevices = [...devices]
    .sort((first, second) => second.consumption - first.consumption)
    .slice(0, 3);
  const favoriteHomes = homes.filter((home) => home.favorite);

  function showNotifications() {
    const critical = devices.filter((device) => device.critical && device.online);

    if (!critical.length) {
      Alert.alert("Todo en orden", "No hay alertas activas en tus dispositivos.");
      return;
    }

    Alert.alert(
      "Ahorro recomendado",
      `${critical[0].name} está consumiendo más de lo habitual. Revisa su horario o apágalo si no está en uso.`,
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          {
            paddingHorizontal: layout.gutter,
            paddingTop: layout.compact ? 12 : 17,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.content, { maxWidth: layout.contentWidth }]}>
        <View style={styles.header}>
          <Pressable style={[styles.avatar, layout.tiny && styles.avatarTiny]} onPress={() => router.push("/profile")}>
            <Ionicons name="person-outline" size={layout.tiny ? 36 : 43} color={TEXT} />
          </Pressable>
          <View style={styles.headerCopy}>
            <Text numberOfLines={1} style={styles.greeting}>Hola, {sessionName}</Text>
            <Text numberOfLines={1} style={styles.subGreeting}>{onlineDevices.length} dispositivos activos</Text>
          </View>
          <View style={styles.headerIcons}>
            <Pressable onPress={() => router.push("/devices")} style={styles.iconButton}>
              <MaterialCommunityIcons name="hand-heart-outline" size={layout.tiny ? 32 : 38} color={TEXT} />
            </Pressable>
            <Pressable onPress={showNotifications} style={styles.iconButton}>
              <Ionicons name="notifications-outline" size={layout.tiny ? 30 : 34} color={BLUE} />
            </Pressable>
          </View>
        </View>

        <View style={styles.nowCard}>
          <View style={styles.nowTop}>
            <Text style={styles.nowLabel}>Consumo actual</Text>
            <Ionicons name={delta > 0 ? "trending-up" : "trending-down"} size={22} color={delta > 0 ? RED : GREEN} />
          </View>
          <View style={styles.kwhRow}>
            <Text style={styles.kwhValue}>{formatKwh(currentConsumption)}</Text>
            <Text style={[styles.badge, delta > 0 ? styles.badgeDanger : styles.badgeGood]}>
              {delta > 0 ? "+" : "-"}{deltaPercent}% vs ayer
            </Text>
          </View>
          <Text style={styles.updated}>Actualizado hace 2 min</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Hogares favoritos</Text>
          <Pressable onPress={() => router.push("/devices")}>
            <Text style={styles.seeAll}>Ver hogares</Text>
          </Pressable>
        </View>

        <View style={styles.favoriteList}>
          {favoriteHomes.length > 0 ? (
            favoriteHomes.map((home) => {
              const homeDevices = devices.filter((device) => device.homeId === home.id);
              const homeOnline = homeDevices.filter((device) => device.online).length;

              return (
                <Pressable
                  key={home.id}
                  style={({ pressed }) => [styles.homeCard, pressed && styles.cardPressed]}
                  onPress={() => {
                    setActiveHomeId(home.id);
                    router.push("/devices");
                  }}
                >
                  <View style={styles.circleIcon}>
                    <MaterialCommunityIcons name="home-city-outline" size={31} color={BLUE} />
                  </View>
                  <View style={styles.deviceCopy}>
                    <Text style={styles.deviceName}>{home.name}</Text>
                    <Text style={styles.deviceValue}>
                      {homeOnline} de {homeDevices.length} dispositivos activos
                    </Text>
                  </View>
                  <Ionicons name="star" size={22} color="#F5B400" />
                </Pressable>
              );
            })
          ) : (
            <Pressable
              style={styles.homeCard}
              onPress={() => router.push("/devices")}
            >
              <View style={styles.circleIcon}>
                <MaterialCommunityIcons name="home-plus-outline" size={31} color={BLUE} />
              </View>
              <View style={styles.deviceCopy}>
                <Text style={styles.deviceName}>Sin hogares favoritos</Text>
                <Text style={styles.deviceValue}>Marca un hogar como favorito para verlo aquí</Text>
              </View>
            </Pressable>
          )}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Mayor consumo <Text style={styles.muted}>(vs ayer)</Text>
          </Text>
          <Pressable onPress={() => router.push("/devices")}>
            <Text style={styles.seeAll}>Ver todos</Text>
          </Pressable>
        </View>

        <View style={styles.list}>
          {topDevices.map((item) => {
            const trend = getTrend(item);

            return (
              <Pressable
                key={item.id}
                style={({ pressed }) => [styles.deviceCard, pressed && styles.cardPressed]}
                onPress={() => router.push("/devices")}
              >
                <View style={styles.circleIcon}>
                  <MaterialCommunityIcons name={item.icon as never} size={34} color={BLUE} />
                </View>
                <View style={styles.deviceCopy}>
                  <Text style={styles.deviceName}>{item.name}</Text>
                  <Text style={styles.deviceValue}>
                    {item.online ? formatKwh(item.consumption) : "Apagado"} · {item.room}
                  </Text>
                </View>
                <Text style={[styles.trend, { color: trend.color }]}>{trend.label}</Text>
              </Pressable>
            );
          })}

          <Pressable style={styles.actionCard} onPress={() => router.push("/reports")}>
            <View style={styles.circleIcon}>
              <Ionicons name="bar-chart" size={32} color={BLUE} />
            </View>
            <View style={styles.actionCopy}>
              <Text style={styles.deviceName}>Reportes de energía</Text>
              <Text style={styles.actionSubtitle}>Analiza tus datos históricos</Text>
            </View>
            <Ionicons name="chevron-forward" size={33} color={TEXT} />
          </Pressable>

          <Pressable
            style={styles.actionCard}
            onPress={() => Alert.alert("Recomendación", "Programa el aire acondicionado para apagarse después de las 10:00 p. m. y reduce el pico nocturno.")}
          >
            <View style={styles.circleIcon}>
              <MaterialCommunityIcons name="medal-outline" size={36} color={BLUE} />
            </View>
            <View style={styles.actionCopy}>
              <Text style={styles.deviceName}>Recomendaciones</Text>
              <Text style={styles.actionSubtitle}>1 acción puede ahorrar 8% esta semana</Text>
            </View>
            <Ionicons name="chevron-forward" size={33} color={TEXT} />
          </Pressable>
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
    backgroundColor: "#FFFFFF",
  },
  container: {
    alignItems: "center",
    paddingBottom: 112,
  },
  content: {
    alignSelf: "center",
    width: "100%",
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
  },
  avatar: {
    width: 73,
    height: 73,
    alignItems: "center",
    backgroundColor: LILAC,
    borderRadius: 37,
    justifyContent: "center",
  },
  avatarTiny: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  headerCopy: {
    flex: 1,
    marginLeft: 10,
    minWidth: 0,
  },
  greeting: {
    color: BLUE,
    fontFamily: appFont,
    fontSize: 19,
    fontWeight: "700",
  },
  subGreeting: {
    color: MUTED,
    fontFamily: appFont,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 3,
  },
  headerIcons: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },
  iconButton: {
    alignItems: "center",
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  nowCard: {
    alignSelf: "center",
    backgroundColor: LILAC,
    borderRadius: 16,
    marginTop: 22,
    maxWidth: 292,
    paddingHorizontal: 15,
    paddingVertical: 12,
    width: "100%",
  },
  nowTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  nowLabel: {
    color: TEXT,
    fontFamily: appFont,
    fontSize: 17,
    fontWeight: "700",
  },
  kwhRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 2,
  },
  kwhValue: {
    color: TEXT,
    fontFamily: appFont,
    fontSize: 29,
    fontWeight: "700",
  },
  badge: {
    borderRadius: 4,
    fontFamily: appFont,
    fontSize: 13,
    fontWeight: "800",
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  badgeGood: {
    backgroundColor: "#E8FFE9",
    color: GREEN,
  },
  badgeDanger: {
    backgroundColor: "#FFECEA",
    color: RED,
  },
  updated: {
    color: TEXT,
    fontFamily: appFont,
    fontSize: 15,
    fontWeight: "700",
    marginTop: 4,
  },
  divider: {
    backgroundColor: "#DDE2F5",
    height: 1,
    marginTop: 18,
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingTop: 15,
  },
  sectionTitle: {
    color: TEXT,
    fontFamily: appFont,
    fontSize: 13,
    fontWeight: "800",
  },
  muted: {
    fontWeight: "500",
  },
  seeAll: {
    color: BLUE,
    fontFamily: appFont,
    fontSize: 13,
    fontWeight: "800",
  },
  list: {
    gap: 11,
    paddingHorizontal: 0,
    paddingTop: 15,
  },
  favoriteList: {
    gap: 11,
    paddingTop: 15,
  },
  homeCard: {
    alignItems: "center",
    backgroundColor: LILAC,
    borderRadius: 11,
    flexDirection: "row",
    minHeight: 64,
    paddingHorizontal: 11,
  },
  deviceCard: {
    alignItems: "center",
    backgroundColor: LILAC,
    borderRadius: 11,
    flexDirection: "row",
    minHeight: 62,
    paddingHorizontal: 11,
  },
  cardPressed: {
    opacity: 0.75,
  },
  circleIcon: {
    width: 46,
    height: 46,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 23,
    justifyContent: "center",
  },
  deviceCopy: {
    flex: 1,
    marginLeft: 10,
    minWidth: 0,
  },
  deviceName: {
    color: TEXT,
    fontFamily: appFont,
    fontSize: 17,
    fontWeight: "800",
  },
  deviceValue: {
    color: TEXT,
    fontFamily: appFont,
    fontSize: 13,
    fontWeight: "800",
    marginTop: 1,
  },
  trend: {
    fontFamily: appFont,
    fontSize: 20,
    fontWeight: "800",
  },
  actionCard: {
    alignItems: "center",
    backgroundColor: LILAC,
    borderRadius: 11,
    flexDirection: "row",
    minHeight: 64,
    paddingHorizontal: 11,
  },
  actionCopy: {
    flex: 1,
    marginLeft: 13,
    minWidth: 0,
  },
  actionSubtitle: {
    color: TEXT,
    fontFamily: appFont,
    fontSize: 13,
    fontWeight: "800",
    marginTop: 1,
  },
});
