/**
 * Layout de navegacion de tabs.
 *
 * Configura la barra inferior de pestañas y aplica el tema global, iconos y
 * comportamiento haptico. Las pantallas dentro de `(tabs)` se renderizan aqui.
 */
import { LiquidNavigation } from "@/components/LiquidNavigation";
import { Tabs } from "expo-router";

/**
 * Layout de navegacion inferior.
 *
 * Todas las pantallas dentro de `(tabs)` comparten esta barra. Aqui se configuran
 * iconos, titulos, tema, haptics y margen inferior seguro del dispositivo.
 */
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: "none" },
      }}
      tabBar={(props) => <LiquidNavigation {...props} />}
    >
      <Tabs.Screen name="index" options={{ title: "Dashboard" }} />
      <Tabs.Screen name="homes" options={{ title: "Estancias" }} />
      <Tabs.Screen name="reports" options={{ title: "Energía" }} />
      <Tabs.Screen name="alerts" options={{ title: "Alertas" }} />
      <Tabs.Screen name="profile" options={{ title: "Perfil" }} />
      <Tabs.Screen name="devices" options={{ href: null }} />
      <Tabs.Screen name="favorites" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
      <Tabs.Screen name="access" options={{ href: null }} />
      <Tabs.Screen name="help" options={{ href: null }} />
    </Tabs>
  );
}
