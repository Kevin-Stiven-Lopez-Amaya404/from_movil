import { ColorMode } from "@/lib/context/smart-home-context";

/**
 * Paleta especifica para pantallas de autenticacion.
 *
 * Se mantiene separada de `app-theme` porque welcome/login/register tienen
 * una composicion visual distinta al resto de pantallas internas.
 */
export function getAuthPalette(mode: ColorMode) {
  const dark = mode === "dark";

  return {
    background: dark ? "#0B1220" : "#FFFFFF",
    button: dark ? "#3B82F6" : "#0864C8",
    buttonPressed: dark ? "#2563EB" : "#004FA5",
    card: dark ? "#151F33" : "#FBFBFD",
    divider: dark ? "#26344F" : "#DDE2F5",
    field: dark ? "#121A2C" : "#FBFBFD",
    fieldBorder: dark ? "#2D3B59" : "transparent",
    link: dark ? "#93C5FD" : "#0864C8",
    muted: dark ? "#A7B3C8" : "#6B7A99",
    primarySoft: dark ? "#172A47" : "#EEF4FF",
    text: dark ? "#F8FAFC" : "#3F3F3F",
    title: dark ? "#93C5FD" : "#0864C8",
  };
}
