import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { AccessibilityInfo, ActivityIndicator, Animated, Easing, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { useActiveDeviceAlerts } from "@/lib/alerts/use-active-device-alerts";
import { NavigationRow } from "@/components/dashboard/NavigationRow";
import { SummaryTile } from "@/components/dashboard/SummaryTile";
import { useSmartHome } from "@/lib/context/smart-home-context";
import { isDeviceConfirmedOnline } from "@/lib/domain/device";
import { useResponsiveLayout } from "@/lib/responsive/responsive";
import { useAppTheme, type AppTheme } from "@/lib/theme/app-theme";
import { styles } from "../../../styles/(tabs)/(main)/index.styles";

type DashboardNoticeProps = {
  actionLabel?: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  loading?: boolean;
  message: string;
  onAction?: () => void;
  theme: AppTheme;
  tone?: "danger" | "info";
};

function DashboardNotice({
  actionLabel,
  icon,
  loading = false,
  message,
  onAction,
  theme,
  tone = "info",
}: DashboardNoticeProps) {
  const iconColor = tone === "danger" ? theme.danger : theme.blue;

  return (
    <View
      accessibilityLiveRegion={
        tone === "danger" ? "assertive" : loading ? "polite" : undefined
      }
      style={[
        styles.notice,
        { backgroundColor: theme.card, borderColor: theme.borderLight },
      ]}
    >
      <View
        accessible={false}
        style={[
          styles.noticeIcon,
          {
            backgroundColor:
              tone === "danger" ? theme.dangerSoft : theme.surfaceSecondary,
          },
        ]}
      >
        {loading ? (
          <ActivityIndicator accessible={false} color={iconColor} />
        ) : (
          <Ionicons name={icon} size={19} color={iconColor} />
        )}
      </View>
      <View style={styles.noticeCopy}>
        <Text style={[styles.noticeMessage, { color: theme.text }]}>
          {message}
        </Text>
        {actionLabel && onAction ? (
          <Button
            fullWidth
            icon={<Ionicons name="arrow-forward" size={16} color={theme.blue} />}
            label={actionLabel}
            labelSize="helper"
            onPress={onAction}
            style={styles.noticeAction}
            variant="text"
          />
        ) : null}
      </View>
    </View>
  );
}


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
  const homeIds = useMemo(
    () => new Set(accessibleHomes.map((home) => home.id)),
    [accessibleHomes],
  );
  const homeDevices = useMemo(
    () => devices.filter((device) => homeIds.has(device.homeId)),
    [devices, homeIds],
  );
  const deviceDataReady =
    homesReady &&
    accessibleHomes.every(
      (home) => deviceLoadStatusByHome[home.id] === "loaded",
    );
  const deviceDataError =
    homesReady &&
    accessibleHomes.some(
      (home) => deviceLoadStatusByHome[home.id] === "error",
    );
  const deviceDataLoading =
    homesReady &&
    accessibleHomes.length > 0 &&
    !deviceDataReady &&
    !deviceDataError;
  const poweredOnCount = useMemo(
    () =>
      homeDevices.filter(
        (device) => isDeviceConfirmedOnline(device) && device.state === "on",
      ).length,
    [homeDevices],
  );
  const favoriteHomes = useMemo(
    () => accessibleHomes.filter((home) => home.favorite).length,
    [accessibleHomes],
  );

  const homesDisplay = homesReady ? String(accessibleHomes.length) : "—";
  const poweredOnDisplay = deviceDataReady ? String(poweredOnCount) : "—";
  const heroHeight = Math.min(
    layout.short ? 190 : 236,
    Math.max(128, layout.contentWidth * (9 / 16)),
  );

  const alertsSubtitle = alertsError
    ? "No se pudo consultar el estado"
    : alertsLoading
      ? "Consultando alertas..."
      : pendingAlerts === 0
        ? "Sin alertas pendientes"
        : `${pendingAlerts} ${pendingAlerts === 1 ? "alerta pendiente" : "alertas pendientes"}`;

  const favoritesSubtitle =
    homesLoadStatus === "error"
      ? "No se pudieron consultar los hogares"
      : !homesReady
        ? "Cargando favoritos..."
        : favoriteHomes === 0
          ? "Aún no tienes hogares favoritos"
          : `${favoriteHomes} ${favoriteHomes === 1 ? "hogar favorito" : "hogares favoritos"}`;

  // Light ambient motion, respecting the accessibility preference.
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
                { backgroundColor: theme.surfaceSecondary, height: heroHeight },
              ]}
            >
              <Animated.Image
                source={require("../../../assets/images/dashboard-eco.jpg")}
                resizeMode="cover"
                accessible
                accessibilityLabel="Casa inteligente con dispositivos conectados"
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
              busy={homesLoadStatus === "loading"}
              theme={theme}
              onPress={() => router.navigate("/(tabs)/(main)/homes")}
            />
            <SummaryTile
              icon="power-outline"
              label="Dispositivos encendidos"
              value={poweredOnDisplay}
              busy={deviceDataLoading || homesLoadStatus === "loading"}
              theme={theme}
              onPress={() => router.push("/(tabs)/devices")}
            />
          </View>

          {homesLoadStatus === "loading" ? (
            <DashboardNotice
              icon="home-outline"
              loading
              message="Cargando tus hogares..."
              theme={theme}
            />
          ) : homesLoadStatus === "error" ? (
            <DashboardNotice
              actionLabel="Abrir hogares"
              icon="alert-circle-outline"
              message="No se pudo cargar la información de tus hogares."
              onAction={() => router.navigate("/(tabs)/(main)/homes")}
              theme={theme}
              tone="danger"
            />
          ) : accessibleHomes.length === 0 ? (
            <DashboardNotice
              actionLabel="Crear un hogar"
              icon="home-outline"
              message="Aún no tienes hogares. Crea uno para empezar a administrar tus dispositivos."
              onAction={() => router.navigate("/(tabs)/(main)/homes")}
              theme={theme}
            />
          ) : null}

          {deviceDataError ? (
            <DashboardNotice
              actionLabel="Revisar dispositivos"
              icon="alert-circle-outline"
              message="No se pudo cargar la información de todos tus dispositivos."
              onAction={() => router.push("/(tabs)/devices")}
              theme={theme}
              tone="danger"
            />
          ) : deviceDataLoading ? (
            <DashboardNotice
              icon="hardware-chip-outline"
              loading
              message="Cargando tus dispositivos..."
              theme={theme}
            />
          ) : homesReady &&
            accessibleHomes.length > 0 &&
            deviceDataReady &&
            homeDevices.length === 0 ? (
            <DashboardNotice
              actionLabel="Agregar dispositivo"
              icon="hardware-chip-outline"
              message="Todavía no hay dispositivos en tus hogares."
              onAction={() => router.push("/(tabs)/add-device")}
              theme={theme}
            />
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
