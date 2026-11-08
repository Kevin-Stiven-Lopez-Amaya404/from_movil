/**
 * Tab navigation layout.
 *
 * Configures the bottom tab bar and applies the global theme, icons and
 * haptic behavior. Screens inside `(tabs)` are rendered here.
 */
import { LiquidNavigation } from "@/components/LiquidNavigation";
import { Tabs } from "expo-router";

/**
 * Bottom navigation layout.
 *
 * Every screen inside `(tabs)` shares this bar. Icons, titles, theme,
 * haptics and the device's safe bottom margin are configured here.
 */
export default function TabLayout() {
  return (
    <Tabs
      backBehavior="history"
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: "none" },
      }}
      tabBar={(props) => <LiquidNavigation {...props} />}
    >
      <Tabs.Screen name="index" options={{ title: "Inicio" }} />
      <Tabs.Screen name="homes" options={{ title: "Hogares" }} />
      <Tabs.Screen name="reports" options={{ title: "Energía" }} />
      <Tabs.Screen name="notifications" options={{ title: "Avisos" }} />
      <Tabs.Screen name="profile" options={{ title: "Perfil" }} />
    </Tabs>
  );
}
