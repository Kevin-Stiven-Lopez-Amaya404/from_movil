import { StyleSheet, Text, View } from "react-native";

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
  return (
    <View style={[styles.heroCard, { backgroundColor }]}> 
      {/* Titulo principal del hero card. */}
      <Text style={[styles.heroTitle, { color: textColor }]}>{title}</Text>

      {/* Valor destacado, con opcion para reducir tamaño cuando es muy largo. */}
      <Text style={[styles.heroAmount, compactValue && styles.heroAmountTiny]}>{value}</Text>

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
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.24,
    shadowRadius: 5,
    width: "100%",
  },
  heroTitle: {
    fontFamily: appFont,
    fontSize: 17,
    fontWeight: "800",
  },
  heroAmount: {
    color: "#FFFFFF",
    fontFamily: appFont,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 0,
    marginTop: 13,
  },
  heroAmountTiny: {
    fontSize: 24,
  },
  heroText: {
    fontFamily: appFont,
    fontSize: 16,
    fontWeight: "800",
    marginTop: 20,
  },
});
