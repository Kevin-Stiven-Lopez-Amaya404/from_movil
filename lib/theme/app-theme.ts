import { useMemo } from "react";

import { ColorMode, useSmartHome } from "@/lib/context/smart-home-context";

export type AppTheme = ReturnType<typeof getAppTheme>;

/**
 * Devuelve la paleta visual de la app segun el modo seleccionado.
 *
 * Centralizar colores aqui evita que cada pantalla invente sus propios tonos y
 * permite que el cambio claro/oscuro sea consistente.
 */
export function getAppTheme(mode: ColorMode) {
  const dark = mode === "dark";

  return {
    dark,
    blue1: "#e8f1ff",          // Azul profundo para títulos y botones destacados
    blue: "#0047AB",          // Azul cobalto intenso de la cabecera e íconos principales
    primary: "#003380",       // Tono para textos destacados y títulos de sección
    background: dark ? "#101827" : "#F8FAFC", // Fondo claro casi blanco
    card: dark ? "#172033" : "#FFFFFF",       // Tarjetas en fondo blanco puro
    row: dark ? "#111827" : "#FFFFFF",
    rowAlt: dark ? "#1F2937" : "#EBF2FA",     // Fondo suave para insignias / pills
    text: dark ? "#F8FAFC" : "#0A192F",       // Texto azul muy oscuro / marino
    muted: dark ? "#CBD5E1" : "#64748B",      // Texto secundario gris azulado
    border: dark ? "#334155" : "#0047AB",     // Borde azul destacado
    borderLight: dark ? "#334155" : "#E2E8F0",// Borde neutro para tarjetas inactivas
    danger: "#FF3B20",
    dangerSoft: dark ? "#3A1D1A" : "#FFF1EF",
    success: "#22C55E",
    successSoft: dark ? "#123521" : "#DCFCE7",
    tabBar: dark ? "#111827" : "#FFFFFF",
    shadow: dark ? "#000000" : "#00000010",
    // ... resto de propiedades de tab si aplica
  };
}

/**
 * Hook para consumir el tema actual desde cualquier componente.
 *
 * Lee `colorMode` del contexto global y memoriza la paleta para evitar
 * recalculos innecesarios en cada render.
 */
export function useAppTheme() {
  const { colorMode } = useSmartHome();

  return useMemo(() => getAppTheme(colorMode), [colorMode]);
}
