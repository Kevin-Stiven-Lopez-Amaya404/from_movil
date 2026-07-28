/**
 * Layout de navegacion de tabs.
 *
 * Configura la barra inferior de pestañas y aplica el tema global, iconos y
 * comportamiento haptico. Las pantallas dentro de `(tabs)` se renderizan aqui.
 */
import { HapticTab } from "@/components/navigation/HapticTab";
import { useSmartHome } from "@/lib/context/smart-home-context";
import { useTranslation } from "@/lib/i18n/i18n";
import { useAppTheme } from "@/lib/theme/app-theme";
import { typography } from "@/lib/theme/typography";
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
        name="homes"
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
    fontFamily: typography.fontFamily.emphasis,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 0,
  },
});
