import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";

import { typography } from "@/lib/theme/typography";

type DeviceListItemProps = {
  consumption: number;
  icon: string;
  name: string;
  online: boolean;
  onPress: () => void;
  onToggle: () => void;
  room: string;
  rowAltColor: string;
  rowColor: string;
  selected: boolean;
  textColor: string;
  mutedColor: string;
};

const BLUE = "#0864C8";
const GREEN = "#2AAF5D";
const MUTED = "#6B7280";
const appFont = typography.fontFamily.emphasis;

/**
 * Item de dispositivo dentro de un hogar.
 *
 * La pantalla decide que dispositivo esta seleccionado; este componente solo
 * muestra datos y dispara acciones.
 */
export function DeviceListItem({
  consumption,
  icon,
  mutedColor,
  name,
  online,
  onPress,
  onToggle,
  room,
  rowAltColor,
  rowColor,
  selected,
  textColor,
}: DeviceListItemProps) {
  return (
    <Pressable
      style={[
        styles.deviceCard,
        { backgroundColor: rowColor },
        selected && styles.selectedCard,
      ]}
      onPress={onPress}
    >
      {/* Icono del dispositivo que cambia de color segun si esta online. */}
      <View style={[styles.itemIcon, { backgroundColor: rowAltColor }, !online && styles.itemIconOff]}>
        <MaterialCommunityIcons name={icon as never} size={35} color={online ? BLUE : MUTED} />
      </View>

      {/* Nombre del dispositivo y estado de consumo/actividad. */}
      <View style={styles.itemCopy}>
        <Text style={[styles.itemTitle, { color: textColor }]}>{name}</Text>
        <Text style={[styles.itemSubtitle, { color: mutedColor }]}> 
          {room} · {online ? `${consumption.toFixed(2)} kWh` : "Apagado"}
        </Text>
      </View>

      {/* Switch para encender/apagar el dispositivo. */}
      <Switch
        value={online}
        onValueChange={onToggle}
        thumbColor={online ? GREEN : "#FFFFFF"}
        trackColor={{ false: "#CDD2E4", true: "#BDE8CB" }}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  deviceCard: {
    alignItems: "center",
    borderRadius: 12,
    elevation: 5,
    flexDirection: "row",
    minHeight: 76,
    paddingHorizontal: 14,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 5,
  },
  selectedCard: {
    borderColor: BLUE,
    borderWidth: 1.5,
  },
  itemIcon: {
    alignItems: "center",
    borderRadius: 24,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  itemIconOff: {
    backgroundColor: "#ECEFF5",
  },
  itemCopy: {
    flex: 1,
    marginLeft: 14,
    minWidth: 0,
  },
  itemTitle: {
    fontFamily: appFont,
    fontSize: 17,
    fontWeight: "800",
  },
  itemSubtitle: {
    fontFamily: appFont,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 4,
  },
});
