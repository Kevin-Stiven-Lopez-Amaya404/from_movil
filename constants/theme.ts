import { typography } from "@/lib/theme/typography";

/**
 * Colores base generados para compatibilidad con hooks/componentes que consumen
 * un esquema claro/oscuro simple.
 */
export const Colors = {
  light: {
    tint: "#0047AB",
    icon: "#1A1A2E",
    background: "#FFFFFF",
    text: "#1A1A2E",
  },
  dark: {
    tint: "#FFFFFF",
    icon: "#FFFFFF",
    background: "#0047AB",
    text: "#FFFFFF",
  },
} as const;

/**
 * Design tokens principales de la app.
 *
 * Centraliza colores, tamanos, espaciados y radios usados sobre todo en las
 * pantallas de autenticacion. Tenerlos aqui evita repetir numeros magicos.
 */
export const theme = {
  colors: {
    primary: "#0047AB",
    primaryDark: "#003380",
    backgroundBlue: "#0047AB",
    backgroundWhite: "#FFFFFF",
    inputBg: "#F0F4FF",
    inputBorder: "#C5D3E8",
    inputText: "#1A1A2E",
    placeholder: "#5F6F8C",
    textDark: "#1A1A2E",
    textLight: "#FFFFFF",
    textLink: "#0047AB",
    textMuted: "#5F6F8C",
    buttonPrimary: "#0047AB",
    buttonOutline: "transparent",
    buttonBorder: "#FFFFFF",
    buttonBorderBlue: "#0047AB",
    buttonText: "#FFFFFF",
    buttonTextOutline: "#FFFFFF",
    checkboxActive: "#0047AB",
    checkboxBorder: "#C5D3E8",
    divider: "#E0E8F5",
    error: "#D32F2F",
  },

  fontSize: {
    xs: 11,
    sm: typography.size.helper,
    base: typography.size.body,
    md: typography.size.bodyLarge,
    lg: typography.size.section,
    xl: typography.size.title,
    xxl: typography.size.screenTitle,
    logo: 28,
  },

  fontFamily: typography.fontFamily,
  fontWeight: typography.weight,

  // Radio general conservado para compatibilidad con posibles consumidores.
  rounded: 10,

  mono: "monospace",

  spacing: {
    xs: 4,
    sm: 8,
    md: 14,
    lg: 20,
    xl: 28,
    xxl: 40,
  },

  radius: {
    input: 10,
    button: 10,
    card: 16,
  },
};
