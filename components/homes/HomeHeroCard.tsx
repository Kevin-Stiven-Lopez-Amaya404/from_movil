import { StyleSheet, Text, View } from "react-native";

import { useAppTheme } from "@/lib/theme/app-theme";
import { typography } from "@/lib/theme/typography";

type HomeHeroCardProps = {
  backgroundColor: string;
  description: string;
  mutedColor: string;
  title: string;
  value: string;
  compactValue?: boolean;
  textColor: string;
};

const appFont = typography.fontFamily.emphasis;

/**
 * Carta majestuosa para mostrar un resumen energetico o detalles de hogar.
 *
 * El componente se adapta a diferentes contextos activando `compactValue`
 * cuando el texto del valor es mas largo o se necesita ahorrar espacio.
 */
export function HomeHeroCard({
  backgroundColor,
  compactValue,
  description,
  mutedColor,
  textColor,
  title,
  value,
}: HomeHeroCardProps) {
  const theme = useAppTheme();

  return (
    <View style={[styles.heroCard, { backgroundColor, shadowColor: theme.shadowColor }]}>
      {/* Titulo principal del hero card. */}
      <Text style={[styles.heroTitle, { color: textColor }]}>{title}</Text>

      {/* Valor destacado, con opcion para reducir tamaño cuando es muy largo. */}
      <Text
        style={[
          styles.heroAmount,
          { color: theme.onPrimary },
          compactValue && styles.heroAmountTiny,
        ]}
      >
        {value}
      </Text>

      {/* Texto descriptivo de debajo del valor. */}
      <Text style={[styles.heroText, { color: mutedColor }]}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    borderRadius: 16,
    elevation: 8,
    paddingHorizontal: 18,
    paddingVertical: 17,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.24,
    shadowRadius: 5,
    width: "100%",
  },
  heroTitle: {
    fontFamily: appFont,
    fontSize: typography.size.bodyLarge,
    fontWeight: "800",
  },
  heroAmount: {
    fontFamily: appFont,
    fontSize: typography.size.title,
    fontWeight: "800",
    letterSpacing: 0,
    marginTop: 13,
  },
  heroAmountTiny: {
    fontSize: typography.size.title,
  },
  heroText: {
    fontFamily: appFont,
    fontSize: typography.size.body,
    fontWeight: "800",
    marginTop: 20,
  },
});
