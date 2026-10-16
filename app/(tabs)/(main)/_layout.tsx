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
      <Tabs.Screen name="notifications" options={{ title: "Notificaciones" }} />
      <Tabs.Screen name="profile" options={{ title: "Perfil" }} />
    </Tabs>
  );
}
