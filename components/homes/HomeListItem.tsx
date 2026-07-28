import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { typography } from "@/lib/theme/typography";

type HomeListItemProps = {
  count: number;
  favorite: boolean;
  location: string;
  name: string;
  onFavoritePress: () => void;
  onPress: () => void;
  rowAltColor: string;
  rowColor: string;
  textColor: string;
  mutedColor: string;
};

const BLUE = "#0864C8";
const MUTED = "#6B7280";
const appFont = typography.fontFamily.emphasis;

/**
 * Elemento de la lista de hogares.
 *
 * Muestra la informacion basica de un hogar y un boton de favorito.
 */
export function HomeListItem({
  count,
  favorite,
  location,
  mutedColor,
  name,
  onFavoritePress,
  onPress,
  rowAltColor,
  rowColor,
  textColor,
}: HomeListItemProps) {
  return (
    <Pressable style={[styles.homeCard, { backgroundColor: rowColor }]} onPress={onPress}>
      {/* Icono identificador del hogar. */}
      <View style={[styles.itemIcon, { backgroundColor: rowAltColor }]}> 
        <MaterialCommunityIcons name="home-city-outline" size={31} color={BLUE} />
      </View>

      {/* Texto principal y secundario del hogar. */}
      <View style={styles.itemCopy}>
        <Text style={[styles.itemTitle, { color: textColor }]}>{name}</Text>
        <Text style={[styles.itemSubtitle, { color: mutedColor }]}>{count} dispositivos · {location}</Text>
      </View>

      {/* Boton de favorito, independiente del press general de la fila. */}
      <Pressable
        accessibilityLabel={favorite ? "Quitar de favoritos" : "Agregar a favoritos"}
        onPress={onFavoritePress}
        style={styles.favoriteButton}
      >
        <Ionicons name={favorite ? "star" : "star-outline"} size={25} color={favorite ? "#F5B400" : MUTED} />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  homeCard: {
    alignItems: "center",
    borderRadius: 12,
    flexDirection: "row",
    minHeight: 74,
    paddingHorizontal: 14,
  },
  itemIcon: {
    alignItems: "center",
    borderRadius: 24,
    height: 48,
    justifyContent: "center",
    width: 48,
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
  favoriteButton: {
    alignItems: "center",
    height: 42,
    justifyContent: "center",
    width: 42,
  },
});
