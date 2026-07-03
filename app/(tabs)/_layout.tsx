import { HapticTab } from "@/components/haptic-tab";
import { useAppTheme } from "@/lib/app-theme";
import { useTranslation } from "@/lib/i18n";
import { useSmartHome } from "@/lib/smart-home-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BLUE = "#0864C8";
const DARK = "#454545";

/**
 * Layout de navegacion inferior.
 *
 * Todas las pantallas dentro de `(tabs)` comparten esta barra. Aqui se configuran
 * iconos, titulos, tema, haptics y margen inferior seguro del dispositivo.
 */
export default function TabLayout() {
  // Datos globales para pintar tabbar segun tema e idioma.
  const { colorMode } = useSmartHome();
  const theme = useAppTheme();
  const { t } = useTranslation();

  // Inset inferior real para no chocar con home indicator o barra de Android.
  const insets = useSafeAreaInsets();
  const dark = colorMode === "dark";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: BLUE,
        tabBarInactiveTintColor: dark ? theme.muted : DARK,
        tabBarButton: HapticTab,
        tabBarLabelStyle: styles.tabLabel,
        tabBarStyle: [
          styles.tabBar,
          // Altura dinamica para Android/iPhone con distintas barras inferiores.
          {
            height: 68 + Math.max(insets.bottom, 10),
            paddingBottom: Math.max(insets.bottom, Platform.OS === "ios" ? 16 : 10),
          },
          dark && {
            backgroundColor: theme.tabBar,
            borderTopColor: theme.border,
          },
        ],
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("tab.dashboard"),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={34}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="devices"
        options={{
          title: t("tab.homes"),
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="home-city-outline" size={34} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: t("tab.reports"),
          tabBarIcon: ({ color }) => (
            <Ionicons name="stats-chart" size={31} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t("tab.profile"),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={34}
              color={color}
            />
          ),
        }}
      />
      {/* Settings existe como ruta, pero no debe aparecer como tab principal. */}
      <Tabs.Screen name="settings" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 86,
    backgroundColor: "#FFFFFF",
    borderTopColor: "#DDE2F5",
    borderTopWidth: 1,
    paddingTop: 8,
    paddingBottom: Platform.select({ ios: 18, default: 8 }),
  },
  tabLabel: {
    fontFamily: Platform.select({
      ios: "Avenir Next",
      android: "sans-serif-medium",
      default: "Arial",
    }),
    fontSize: 12,
    fontWeight: "700",
    marginTop: 0,
  },
});
