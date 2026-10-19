import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { styles, BLUE } from "./HomeWidgetCard.styles";



/**
 * Props del componente HomeWidgetCard.
 *
 * Este tipo describe cada valor que necesita el componente para renderizar una
 * tarjeta de hogar con estilo, datos y comportamiento interactivo.
 */
type HomeWidgetCardProps = {
  /**
   * Texto que representa el consumo del hogar.
   * Ejemplos: "1.2 kWh", "120 W" o "3.4 kWh".
   */
  consumption: string;
  /** Nombre del hogar que se muestra en el encabezado de la tarjeta. */
  name: string;
  /** Callback que se ejecuta cuando el usuario presiona la tarjeta. */
  onPress: () => void;
  /**
   * Color de fondo del chip de consumo.
   * Permite adaptar el diseño a temas claros/oscuro y a variaciones de color.
   */
  rowAltColor: string;
  /**
   * Color de fondo de la tarjeta completa.
   * Se usa para distinguir cada tarjeta según el tema o categoría.
   */
  rowColor: string;
  /**
   * Color del texto principal (`name` y `consumption`).
   * Se usa para asegurar contraste con el fondo de la tarjeta.
   */
  textColor: string;
};

/** Color base usado para iconos y acentos visuales en el componente. */

/** Fuente principal usada en los textos del widget para mantener consistencia. */


/**
 * Widget de acceso rapido a un hogar.
 *
 * Se utiliza en la pantalla de dashboard para mostrar los hogares favoritos
 * o el primer hogar disponible. La tarjeta es presionable y permite abrir
 * el detalle del hogar correspondiente.
 */
export function HomeWidgetCard({
  consumption,
  name,
  onPress,
  rowAltColor,
  rowColor,
  textColor,
}: HomeWidgetCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Abrir detalles del hogar ${name}`}
      style={({ pressed }) => [
        styles.homeCard,
        { backgroundColor: rowColor },
        pressed && styles.cardPressed,
      ]}
      onPress={onPress}
    >
      {/* Barra superior azul que sirve de cabecera visual para la tarjeta. */}
      <View style={styles.homeStrip}>
        <View style={styles.homeBadge}>
          {/* Icono fijo de puerta abierta para indicar que es un hogar. */}
          <MaterialCommunityIcons name="door-open" size={16} color={BLUE} />
          <Text style={styles.homeBadgeText}>Hogar</Text>
        </View>
      </View>

      {/* Contenido principal de la tarjeta: nombre del hogar y consumo. */}
      <View style={styles.homeBody}>
        <Text numberOfLines={1} style={[styles.homeName, { color: textColor }]}>
          {" "}
          {name}{" "}
        </Text>

        {/* Chip que muestra el consumo actual con icono y fondo destacado. */}
        <View style={[styles.wattsPill, { backgroundColor: rowAltColor }]}>
          <Ionicons name="flash" size={19} color={BLUE} />
          <Text style={[styles.wattsText, { color: textColor }]}>
            {consumption}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
