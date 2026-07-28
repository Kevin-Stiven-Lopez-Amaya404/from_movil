import { Pressable, StyleSheet, Text, View } from "react-native";

import { typography } from "@/lib/theme/typography";

type EmptyDashboardProps = {
  cardColor: string;
  mutedColor: string;
  onAddPress: () => void;
  textColor: string;
};

const BLUE = "#0864C8";
const appFont = typography.fontFamily.emphasis;

/**
 * Vista de estado vacio para el dashboard.
 *
 * Esta tarjeta se muestra cuando no hay hogares configurados o favoritos.
 * Representa un estado invitando al usuario a crear su primer hogar.
 */
export function EmptyDashboard({ cardColor, mutedColor, onAddPress, textColor }: EmptyDashboardProps) {
  return (
    <View style={[styles.emptyState, { backgroundColor: cardColor }]}> 
      {/* Titulo principal del estado vacio */}
      <Text style={[styles.emptyTitle, { color: textColor }]}>Dashboard vacio</Text>

      {/* Explicacion breve para que el usuario agregue un hogar */}
      <Text style={[styles.emptyText, { color: mutedColor }]}>Agrega un hogar favorito para tener acceso rapido.</Text>

      {/* Boton para iniciar el flujo de agregar un hogar */}
      <Pressable style={styles.addWidgetButton} onPress={onAddPress}>
        <Text style={styles.addWidgetText}>Agregar hogar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyState: {
    alignItems: "center",
    marginTop: 80,
    paddingHorizontal: 18,
  },
  emptyTitle: {
    fontFamily: appFont,
    fontSize: 26,
    fontWeight: "900",
    textAlign: "center",
  },
  emptyText: {
    fontFamily: appFont,
    fontSize: 17,
    fontWeight: "700",
    lineHeight: 24,
    marginTop: 14,
    textAlign: "center",
  },
  addWidgetButton: {
    alignItems: "center",
    backgroundColor: BLUE,
    borderRadius: 15,
    height: 56,
    justifyContent: "center",
    marginTop: 28,
    paddingHorizontal: 28,
  },
  addWidgetText: {
    color: "#FFFFFF",
    fontFamily: appFont,
    fontSize: 18,
    fontWeight: "900",
  },
});
