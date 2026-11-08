import { StyleSheet } from "react-native";

/**
 * Must match the `backgroundColor` of the expo-splash-screen plugin in
 * app.json so the switch from the native splash to the animation does not jump.
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
