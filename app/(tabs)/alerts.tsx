import { Redirect } from "expo-router";

/** Compatibilidad con la antigua ruta /alerts. */
export default function LegacyAlertsScreen() {
  return (
    <Redirect
      href={{
        pathname: "/(tabs)/(main)/notifications",
        params: { section: "alerts" },
      }}
    />
  );
}
