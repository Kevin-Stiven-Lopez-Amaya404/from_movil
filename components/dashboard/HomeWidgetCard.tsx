import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { typography } from "@/lib/theme/typography";

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
const BLUE = "#0864C8";
/** Fuente principal usada en los textos del widget para mantener consistencia. */
const appFont = typography.fontFamily.emphasis;

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
        styles.roomCard,
        { backgroundColor: rowColor },
        pressed && styles.cardPressed,
      ]}
      onPress={onPress}
    >
      {/* Barra superior azul que sirve de cabecera visual para la tarjeta. */}
      <View style={styles.roomStrip}>
        <View style={styles.roomBadge}>
          {/* Icono fijo de puerta abierta para indicar que es un hogar. */}
          <MaterialCommunityIcons name="door-open" size={16} color={BLUE} />
          <Text style={styles.roomBadgeText}>Hogar</Text>
        </View>
      </View>

      {/* Contenido principal de la tarjeta: nombre del hogar y consumo. */}
      <View style={styles.roomBody}>
        <Text numberOfLines={1} style={[styles.roomName, { color: textColor }]}> {name} </Text>

        {/* Chip que muestra el consumo actual con icono y fondo destacado. */}
        <View style={[styles.wattsPill, { backgroundColor: rowAltColor }]}> 
          <Ionicons name="flash" size={19} color={BLUE} />
          <Text style={[styles.wattsText, { color: textColor }]}>{consumption}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  /**
   * Estilo base de la tarjeta.
   * Incluye borde redondeado, ancho completo y límite de anchura.
   */
  roomCard: {
    borderRadius: 16,
    maxWidth: 332,
    overflow: "hidden",
    width: "100%",
  },
  /**
   * Estilo aplicado cuando el usuario presiona la tarjeta.
   * Reduce la opacidad para dar retroalimentación táctil.
   */
  cardPressed: {
    opacity: 0.75,
  },
  /**
   * Barra superior del card que crea contraste con la sección de contenido.
   */
  roomStrip: {
    backgroundColor: BLUE,
    height: 82,
    justifyContent: "flex-start",
  },
  /**
   * Insignia que muestra el texto "Hogar" dentro de la barra superior.
   * Se usa un fondo claro y bordes redondeados para resaltarlo.
   */
  roomBadge: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#EEF4FF",
    borderBottomRightRadius: 14,
    flexDirection: "row",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  /**
   * Texto dentro de la insignia "Hogar".
   * Usa el color azul del tema para armonizar con el diseño.
   */
  roomBadgeText: {
    color: BLUE,
    fontFamily: appFont,
    fontSize: 12,
    fontWeight: "800",
  },
  /**
   * Contenedor del cuerpo principal de la tarjeta.
   * Centra su contenido y aplica relleno interno.
   */
  roomBody: {
    alignItems: "center",
    minHeight: 120,
    padding: 18,
  },
  /**
   * Estilo del nombre del hogar.
   * Se limita a una sola línea para evitar desbordes largos.
   */
  roomName: {
    fontFamily: appFont,
    fontSize: 18,
    fontWeight: "900",
  },
  /**
   * Contenedor del chip de consumo.
   * Presenta su contenido en fila con un icono y texto.
   */
  wattsPill: {
    alignItems: "center",
    borderRadius: 14,
    flexDirection: "row",
    gap: 8,
    marginTop: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  /**
   * Estilo del texto de consumo dentro del chip.
   * Usa peso alto para hacerlo visible y legible.
   */
  wattsText: {
    fontFamily: appFont,
    fontSize: 16,
    fontWeight: "900",
  },
});
