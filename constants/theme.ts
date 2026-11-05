import { typography } from "@/lib/theme/typography";

/** Tokens de espaciado y proporciones que no dependen de la paleta visual. */
export const theme = {
  fontSize: {
    xs: typography.size.caption,
    sm: typography.size.helper,
    base: typography.size.body,
    md: typography.size.bodyLarge,
    lg: typography.size.section,
    xl: typography.size.title,
    xxl: typography.size.screenTitle,
    logo: typography.size.brand,
  },

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
