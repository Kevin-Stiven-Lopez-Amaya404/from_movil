import { StyleSheet } from "react-native";

/**
 * Debe coincidir con `backgroundColor` del plugin expo-splash-screen en
 * app.json para que el paso del splash nativo a la animación no tenga salto.
 */
export const SPLASH_BACKGROUND = "#047857";

export const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    bottom: 0,
    justifyContent: "center",
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 999,
  },
  logo: {
    height: 330,
    width: 220,
  },
});
