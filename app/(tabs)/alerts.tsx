import { Redirect } from "expo-router";

/** Compatibility with the old /alerts route. */
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
