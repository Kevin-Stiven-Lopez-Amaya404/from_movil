import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { typography } from "@/lib/theme/typography";

type EnergySummaryCardProps = {
  activeDevices: number;
  cardColor: string;
  formattedConsumption: string;
  mutedColor: string;
  rowColor: string;
  textColor: string;
};

const BLUE = "#0864C8";
const appFont = typography.fontFamily.emphasis;

/**
 * Tarjeta de consumo actual.
 *
 * Recibe valores ya calculados para no duplicar reglas de negocio dentro del
 * componente visual.
 */
export function EnergySummaryCard({
  activeDevices,
  cardColor,
  formattedConsumption,
  mutedColor,
  rowColor,
  textColor,
}: EnergySummaryCardProps) {
  return (
    <View style={[styles.energyCard, { backgroundColor: cardColor }]}>
      {/* Seccion principal con etiqueta y valor de consumo. */}
      <View>
        <Text style={[styles.energyLabel, { color: mutedColor }]}>Consumo actual</Text>
        <Text style={[styles.energyValue, { color: textColor }]}>{formattedConsumption}</Text>
      </View>

      {/* Indicador rapido de dispositivos activos. */}
      <View style={[styles.energyPill, { backgroundColor: rowColor }]}> 
        <Ionicons name="flash" size={18} color={textColor} />
        <Text style={[styles.energyPillText, { color: textColor }]}>{activeDevices} activos</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  energyCard: {
    alignItems: "center",
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
    padding: 16,
  },
  energyLabel: {
    fontFamily: appFont,
    fontSize: 14,
    fontWeight: "700",
  },
  energyValue: {
    fontFamily: appFont,
    fontSize: 28,
    fontWeight: "900",
    marginTop: 4,
  },
  energyPill: {
    alignItems: "center",
    borderRadius: 14,    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  energyPillText: {
    color: BLUE,
    fontFamily: appFont,
    fontSize: 13,
    fontWeight: "800",
  },
});
