import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { AccessibilityInfo, Animated, Easing, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useActiveDeviceAlerts } from "@/lib/alerts/use-active-device-alerts";
import { NavigationRow } from "@/components/dashboard/NavigationRow";
import { SummaryTile } from "@/components/dashboard/SummaryTile";
import { useSmartHome } from "@/lib/context/smart-home-context";
import { useResponsiveLayout } from "@/lib/responsive/responsive";
import { useAppTheme } from "@/lib/theme/app-theme";
import { styles } from "../../../styles/(tabs)/(main)/index.styles";


export default function DashboardScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const layout = useResponsiveLayout();
  const {
    accessibleHomes,
    devices,
    deviceLoadStatusByHome,
    homesLoadStatus,
    sessionName,
  } = useSmartHome();
  const {
    count: pendingAlerts,
    isLoading: alertsLoading,
    hasError: alertsError,
  } = useActiveDeviceAlerts();

  const homesReady = homesLoadStatus === "loaded";
  const deviceDataReady =
    homesReady &&
    accessibleHomes.every(
      (home) => deviceLoadStatusByHome[home.id] === "loaded",
    );
  const homeIds = new Set(accessibleHomes.map((home) => home.id));
  const poweredOnCount = devices.filter(
    (device) =>
      homeIds.has(device.homeId) &&
      device.online &&
      device.state === "on",
  ).length;
  const favoriteHomes = accessibleHomes.filter(
    (home) => home.favorite,
  ).length;

  const homesDisplay = homesReady ? String(accessibleHomes.length) : "—";
  const poweredOnDisplay = deviceDataReady ? String(poweredOnCount) : "—";

  const alertsSubtitle = alertsError
    ? "No se pudo consultar el estado"
    : alertsLoading
      ? "Consultando alertas..."
      : pendingAlerts === 0
        ? "Sin alertas pendientes"
        : `${pendingAlerts} ${pendingAlerts === 1 ? "alerta pendiente" : "alertas pendientes"}`;

  const favoritesSubtitle = !homesReady
    ? "Consultando favoritos..."
    : favoriteHomes === 0
      ? "Aún no tienes hogares favoritos"
      : `${favoriteHomes} ${favoriteHomes === 1 ? "hogar favorito" : "hogares favoritos"}`;

  // Movimiento ambiental ligero, respetando la preferencia de accesibilidad.
  const [imageScale] = useState(() => new Animated.Value(1));
  const [reduceMotion, setReduceMotion] = useState(true);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (mounted) setReduceMotion(enabled);
      })
      .catch(() => {
        if (mounted) setReduceMotion(true);
      });

    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduceMotion,
    );
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      imageScale.stopAnimation();
      imageScale.setValue(1);
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(imageScale, {
          toValue: 1.045,
          duration: 9000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(imageScale, {
          toValue: 1,
          duration: 9000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [imageScale, reduceMotion]);

  const firstName = sessionName?.trim().split(/\s+/)[0];

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={[styles.safeArea, { backgroundColor: theme.background }]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          alignItems: "center",
          paddingHorizontal: layout.gutter,
          paddingTop: layout.compact ? 8 : 14,
          paddingBottom: layout.screenBottom,
        }}
      >
        <View style={[styles.content, { maxWidth: layout.contentWidth }]}>
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={[styles.brand, { color: theme.blueForeground }]}>
                SMART HOME
              </Text>
              <Text style={[styles.greeting, { color: theme.text }]}>
                {firstName ? `Hola, ${firstName}` : "Hola"}
              </Text>
              <Text style={[styles.greetingSubtitle, { color: theme.muted }]}>
                Tu hogar, más inteligente.
              </Text>
            </View>
            <View
              style={[styles.headerSymbol, { backgroundColor: theme.rowAlt }]}
              accessible={false}
            >
              <Ionicons name="home-outline" size={24} color={theme.blue} />
            </View>
          </View>

          <View
            style={[
              styles.heroCard,
              {
                backgroundColor: theme.card,
                borderColor: theme.borderLight,
              },
            ]}
          >
            <View
              style={[
                styles.heroMedia,
                { backgroundColor: theme.surfaceSecondary },
              ]}
            >
              <Animated.Image
                source={require("../../../assets/images/dashboard-eco.jpg")}
                resizeMode="cover"
                accessibilityLabel="Casa inteligente con paneles solares, árboles y montañas"
                style={[
                  styles.heroImage,
                  { transform: [{ scale: imageScale }] },
                ]}
              />
            </View>
          </View>

          <View style={styles.summaryGrid}>
            <SummaryTile
              icon="home-outline"
              label="Mis hogares"
              value={homesDisplay}
              theme={theme}
              onPress={() => router.navigate("/(tabs)/(main)/homes")}
            />
            <SummaryTile
              icon="power-outline"
              label="Dispositivos encendidos"
              value={poweredOnDisplay}
              theme={theme}
              onPress={() => router.push("/(tabs)/devices")}
            />
          </View>

          {homesLoadStatus === "error" ? (
            <Text style={[styles.stateNote, { color: theme.danger }]}>
              No se pudieron cargar los hogares.
            </Text>
          ) : homesReady && accessibleHomes.length === 0 ? (
            <Text style={[styles.stateNote, { color: theme.muted }]}>
              Aún no tienes hogares. Abre Hogares para crear el primero.
            </Text>
          ) : null}

          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Tu hogar de un vistazo
          </Text>

          <View style={styles.navigationList}>
            <NavigationRow
              icon="notifications-outline"
              title="Estado y alertas"
              subtitle={alertsSubtitle}
              theme={theme}
              onPress={() =>
                router.navigate({
                  pathname: "/(tabs)/(main)/notifications",
                  params: { section: "alerts" },
                })
              }
            />
            <NavigationRow
              icon="hardware-chip-outline"
              title="Mis dispositivos"
              subtitle="Ver y gestionar dispositivos"
              theme={theme}
              onPress={() => router.push("/(tabs)/devices")}
            />
            <NavigationRow
              icon="star-outline"
              title="Mis favoritos"
              subtitle={favoritesSubtitle}
              theme={theme}
              onPress={() => router.push("/(tabs)/favorites")}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
