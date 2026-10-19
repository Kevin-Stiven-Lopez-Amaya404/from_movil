import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: "#005CC1",
    bottom: 0,
    justifyContent: "center",
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 999,
  },
  halo: {
    backgroundColor: "rgba(116, 190, 255, 0.42)",
    borderRadius: 132,
    height: 264,
    position: "absolute",
    width: 264,
  },
  markStage: {
    alignItems: "center",
    height: 350,
    justifyContent: "center",
    position: "relative",
    width: 250,
    zIndex: 1,
  },
  geometryLeft: {
    backgroundColor: "rgba(255, 255, 255, 0.82)",
    borderRadius: 12,
    height: 42,
    left: 18,
    position: "absolute",
    top: 48,
    width: 42,
  },
  geometryRight: {
    backgroundColor: "rgba(255, 255, 255, 0.82)",
    borderRadius: 12,
    bottom: 48,
    height: 42,
    position: "absolute",
    right: 18,
    width: 42,
  },
  logo: {
    height: 330,
    width: 220,
    zIndex: 2,
  },
});
