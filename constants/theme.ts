/**
 * Colores base generados para compatibilidad con hooks/componentes que consumen
 * un esquema claro/oscuro simple.
 */
export const Colors = {
  light: {
    tint: "#0057B8",
    icon: "#1A1A2E",
    background: "#FFFFFF",
    text: "#1A1A2E",
  },
  dark: {
    tint: "#FFFFFF",
    icon: "#FFFFFF",
    background: "#0057B8",
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
    primary: "#0057B8",
    primaryDark: "#004494",
    backgroundBlue: "#0057B8",
    backgroundWhite: "#FFFFFF",
    inputBg: "#F0F4FF",
    inputBorder: "#C5D3E8",
    inputText: "#1A1A2E",
    placeholder: "#9AABC2",
    textDark: "#1A1A2E",
    textLight: "#FFFFFF",
    textLink: "#0057B8",
    textMuted: "#6B7A99",
    buttonPrimary: "#0057B8",
    buttonOutline: "transparent",
    buttonBorder: "#FFFFFF",
    buttonBorderBlue: "#0057B8",
    buttonText: "#FFFFFF",
    buttonTextOutline: "#FFFFFF",
    checkboxActive: "#0057B8",
    checkboxBorder: "#C5D3E8",
    divider: "#E0E8F5",
    error: "#D32F2F",
  },
  fontSize: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 26,
    xxl: 32,
    logo: 28,
  },
  rounded: "System",
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
