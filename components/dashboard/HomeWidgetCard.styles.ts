import { StyleSheet } from "react-native";
import { typography } from "@/lib/theme/typography";

export const BLUE = "#0864C8";
export const appFont = typography.fontFamily.emphasis;

export const styles = StyleSheet.create({
  /**
   * Estilo base de la tarjeta.
   * Incluye borde redondeado, ancho completo y límite de anchura.
   */
  homeCard: {
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
  homeStrip: {
    backgroundColor: BLUE,
    height: 82,
    justifyContent: "flex-start",
  },
  /**
   * Insignia que muestra el texto "Hogar" dentro de la barra superior.
   * Se usa un fondo claro y bordes redondeados para resaltarlo.
   */
  homeBadge: {
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
  homeBadgeText: {
    color: BLUE,
    fontFamily: appFont,
    fontSize: 12,
    fontWeight: "800",
  },
  /**
   * Contenedor del cuerpo principal de la tarjeta.
   * Centra su contenido y aplica relleno interno.
   */
  homeBody: {
    alignItems: "center",
    minHeight: 120,
    padding: 18,
  },
  /**
   * Estilo del nombre del hogar.
   * Se limita a una sola línea para evitar desbordes largos.
   */
  homeName: {
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
