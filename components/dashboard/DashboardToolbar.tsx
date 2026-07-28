import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { typography } from "@/lib/theme/typography";

type DashboardToolbarProps = {
  borderColor: string;
  cardColor: string;
  onAddPress: () => void;
  onCustomizePress: () => void;
  onInfoPress: () => void;
  textColor: string;
};

const BLUE = "#0864C8";
const appFont = typography.fontFamily.emphasis;

/**
 * Barra de acciones del dashboard.
 *
 * Mantiene juntos los botones de personalizar, agregar e información sin que
 * el archivo de pantalla tenga que conocer cada detalle visual.
 */
export function DashboardToolbar({
  borderColor,
  cardColor,
  onAddPress,
  onCustomizePress,
  onInfoPress,
  textColor,
}: DashboardToolbarProps) {
  return (
    <View style={[styles.toolbar, { backgroundColor: cardColor, borderColor }]}>
      {/* Titulo principal de la barra de acciones. */}
      <Text numberOfLines={1} style={[styles.toolbarTitle, { color: textColor }]}>Mi dashboard</Text>

      {/* Boton para abrir opciones de personalizacion. */}
      <Pressable style={styles.customizeButton} onPress={onCustomizePress}>
        <Ionicons name="options-outline" size={21} color={textColor} />
        <Text style={[styles.customizeText, { color: textColor }]}>Personalizar</Text>
      </Pressable>

      {/* Boton para agregar un nuevo elemento rapido. */}
      <Pressable style={styles.blueIconButton} onPress={onAddPress}>
        <Ionicons name="add" size={26} color="#FFFFFF" />
      </Pressable>

      {/* Boton de informacion adicional sobre el dashboard. */}
      <Pressable style={styles.infoButton} onPress={onInfoPress}>
        <Ionicons name="information-circle" size={24} color={textColor} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    marginTop: 28,
    minHeight: 58,
    paddingHorizontal: 12,
  },
  toolbarTitle: {
    flex: 1,
    fontFamily: appFont,
    fontSize: 18,
    fontWeight: "900",
    minWidth: 0,
  },
  customizeButton: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },
  customizeText: {
    fontFamily: appFont,
    fontSize: 14,
    fontWeight: "800",
    textDecorationLine: "underline",
  },
  blueIconButton: {
    alignItems: "center",
    backgroundColor: BLUE,
    borderRadius: 12,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  infoButton: {
    alignItems: "center",
    height: 38,
    justifyContent: "center",
    width: 32,
  },
});
