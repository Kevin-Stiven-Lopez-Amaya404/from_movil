import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Easing, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useActiveDeviceAlerts } from "@/lib/alerts/use-active-device-alerts";
import { useSmartHome } from "@/lib/context/smart-home-context";
import { useResponsiveLayout } from "@/lib/responsive/responsive";
import { useAppTheme } from "@/lib/theme/app-theme";
import { styles } from "../../../styles/(tabs)/(main)/index.styles";


type Theme = ReturnType<typeof useAppTheme>;
type IconName = React.ComponentProps<typeof Ionicons>["name"];

type SummaryTileProps = {
  icon: IconName;
  label: string;
  value: string;
  onPress: () => void;
  tint: "blue" | "green" | "red";
  statusMessage?: string;
  statusColor?: string;
  theme: Theme;
};

type EnergySavingsDemo = {
  savingsPercent: number;
  targetPercent: number;
};

// Demo reemplazable por el resumen de ahorro que entregue el backend.
const energySavingsDemo: EnergySavingsDemo = {
  savingsPercent: 20,
  targetPercent: 20,
};

function SummaryTile({
  icon,
  label,
  value,
  onPress,
  tint,
  statusMessage,
  statusColor,
  theme,
}: SummaryTileProps) {
  const accent = tint === "green"
    ? theme.dark ? "#86EFAC" : "#168044"
    : tint === "red"
      ? theme.dark ? "#FCA5A5" : theme.danger
      : theme.dark ? "#93C5FD" : theme.blue;
  const background = tint === "green"
    ? theme.dark ? "#1A332B" : "#EFF9F1"
    : tint === "red"
      ? theme.dangerSoft
      : theme.dark ? "#1C3048" : "#EAF3FF";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${value}. Abrir sección.`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.summaryTile,
        {
          backgroundColor: background,
          borderColor: theme.dark ? theme.border : background,
        },
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.summaryTop}>
        <View
          style={[
            styles.summaryIcon,
            { backgroundColor: theme.card },
          ]}
        >
          <Ionicons name={icon} size={24} color={accent} />
        </View>
        <Ionicons name="arrow-forward" size={17} color={accent} />
      </View>
      <Text style={[styles.summaryValue, { color: theme.text }]}>
        {value}
      </Text>
      <Text style={[styles.summaryLabel, { color: theme.muted }]}>
        {label}
      </Text>
      {statusMessage ? (
        <View style={styles.summaryStatus}>
          <View style={[styles.summaryDot, { backgroundColor: statusColor ?? accent }]} />
          <Text style={[styles.summaryStatusText, { color: statusColor ?? accent }]}>
            {statusMessage}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

type NavigationRowProps = {
  icon: IconName;
  title: string;
  subtitle: string;
  onPress: () => void;
  theme: Theme;
  tint: "orange" | "blue" | "purple";
};

function NavigationRow({
  icon,
  title,
  subtitle,
  onPress,
  theme,
  tint,
}: NavigationRowProps) {
  const accent =
    tint === "orange"
      ? theme.dark ? "#FDBA74" : "#C15A10"
      : tint === "purple"
        ? theme.dark ? "#C4B5FD" : "#6D45BF"
        : theme.dark ? "#93C5FD" : theme.blue;
  const iconBackground =
    tint === "orange"
      ? theme.dark ? "#39291E" : "#FFF2E7"
      : tint === "purple"
        ? theme.dark ? "#302640" : "#F1ECFF"
        : theme.dark ? "#1C3048" : "#EAF3FF";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${subtitle}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.navigationRow,
        {
          backgroundColor: theme.card,
          borderColor: theme.borderLight,
        },
        pressed && styles.pressed,
      ]}
    >
      <View
        style={[
          styles.navigationIcon,
          { backgroundColor: iconBackground },
        ]}
      >
        <Ionicons name={icon} size={24} color={accent} />
      </View>
      <View style={styles.navigationCopy}>
        <Text style={[styles.navigationTitle, { color: theme.text }]}>
          {title}
        </Text>
        <Text style={[styles.navigationSubtitle, { color: theme.muted }]}>
          {subtitle}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={theme.muted} />
    </Pressable>
  );
}

export default function DashboardScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const layout = useResponsiveLayout();
  const {
    accessibleHomes,
    homesLoadStatus,
    sessionName,
  } = useSmartHome();
  const {
    count: pendingAlerts,
    isLoading: alertsLoading,
    hasError: alertsError,
  } = useActiveDeviceAlerts();

  const homesReady = homesLoadStatus === "loaded";
  const favoriteHomes = accessibleHomes.filter(
    (home) => home.favorite,
  ).length;

  const homesDisplay = homesReady ? String(accessibleHomes.length) : "—";
  const meetsEnergySavingsGoal =
    energySavingsDemo.savingsPercent >= energySavingsDemo.targetPercent;
  const energySavingsMessage = meetsEnergySavingsGoal
    ? "¡Felicitaciones! Cumpliste tu meta de ahorro."
    : "Aún puedes alcanzarla: apaga equipos en espera y ajusta el aire acondicionado.";
  const energySavingsColor = meetsEnergySavingsGoal ? theme.success : theme.danger;

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
  const imageScale = useRef(new Animated.Value(1)).current;
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
              <Text style={[styles.brand, { color: theme.dark ? "#93C5FD" : theme.blue }]}>
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
            <View style={styles.heroMedia}>
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
              tint="blue"
              theme={theme}
              onPress={() => router.navigate("/(tabs)/(main)/homes")}
            />
            <SummaryTile
              icon="flash-outline"
              label="Ahorro de energía"
              value={`${energySavingsDemo.savingsPercent}%`}
              tint={meetsEnergySavingsGoal ? "green" : "red"}
              statusMessage={energySavingsMessage}
              statusColor={energySavingsColor}
              theme={theme}
              onPress={() => router.push("/(tabs)/(main)/reports")}
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
              tint="orange"
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
              tint="blue"
              theme={theme}
              onPress={() => router.push("/(tabs)/devices")}
            />
            <NavigationRow
              icon="star-outline"
              title="Mis favoritos"
              subtitle={favoritesSubtitle}
              tint="purple"
              theme={theme}
              onPress={() => router.push("/(tabs)/favorites")}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
