import { Ionicons } from "@expo/vector-icons";
import { typography } from "@/lib/theme/typography";
import { Pressable, StyleSheet, Text, View } from "react-native";

type DashboardHeaderProps = {
  onNotificationsPress: () => void;
  onProfilePress: () => void;
  sessionName: string;
  textColor: string;
  rowAltColor: string;
};

const GREEN = "#74D87C";
const appFont = typography.fontFamily.emphasis;

/**
 * Encabezado principal del dashboard.
 *
 * Agrupa la marca, el acceso a notificaciones y el avatar del usuario para que
 * la pantalla principal no mezcle estructura general con widgets de contenido.
 */
export function DashboardHeader({
  onNotificationsPress,
  onProfilePress,
  rowAltColor,
  sessionName,
  textColor,
}: DashboardHeaderProps) {
  return (
    <View style={styles.topBar}>
      {/* Marca de la aplicacion, en lugar visible del dashboard. */}
      <Text style={[styles.brand, { color: textColor }]}>Smart Home</Text>

      <View style={styles.topActions}>
        {/* Boton de notificaciones con estilo de tarjeta. */}
        <Pressable style={[styles.squareButton, { backgroundColor: rowAltColor }]} onPress={onNotificationsPress}>
          <Ionicons name="notifications-outline" size={22} color={textColor} />
        </Pressable>

        {/* Avatar del usuario que abre el perfil. */}
        <Pressable style={styles.userCircle} onPress={onProfilePress}>
          <Text style={styles.userInitial}>{sessionName.charAt(0).toUpperCase()}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  brand: {
    fontFamily: appFont,
    fontSize: 30,
    fontStyle: "italic",
    fontWeight: "900",
  },
  topActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  squareButton: {
    alignItems: "center",
    borderRadius: 14,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  userCircle: {
    alignItems: "center",
    backgroundColor: GREEN,
    borderRadius: 23,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  userInitial: {
    color: "#102314",
    fontFamily: appFont,
    fontSize: 20,
    fontWeight: "800",
  },
});
