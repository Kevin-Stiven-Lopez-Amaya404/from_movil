import { typography } from "@/lib/theme/typography";

/** Spacing and proportion tokens that do not depend on the color palette. */
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
