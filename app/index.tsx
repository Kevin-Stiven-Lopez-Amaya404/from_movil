import { Redirect } from "expo-router";

/**
 * Ruta inicial de la aplicacion.
 *
 * Expo Router necesita una pantalla para `/`. Esta redireccion evita que la
 * app quede en una ruta vacia y garantiza que el flujo empiece en bienvenida.
 */
export default function IndexRoute() {
  return <Redirect href="/welcome" />;
}
