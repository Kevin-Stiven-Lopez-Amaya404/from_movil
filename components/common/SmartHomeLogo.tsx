import { Image, StyleSheet, View } from "react-native";

interface SmartHomeLogoProps {
  /** Ancho base del logo. La altura se calcula para no deformar la imagen. */
  size?: number;
  /** Se conserva por compatibilidad con llamadas existentes; el asset ya incluye texto. */
  showText?: boolean;
  /** Variante visual del logo: azul para fondos claros o blanco para fondos oscuros. */
  variant?: "light" | "dark";
}

// Relacion ancho/alto del asset original. Mantenerla evita que el logo se estire.
const LOGO_RATIO = 640 / 820;

// Assets locales del logo. Se usa `require` porque React Native empaqueta imagenes estaticas asi.
const blueLogo = require("@/assets/images/logo-smart-home.png");
const whiteLogo = require("@/assets/images/logo-smart-home-white.png");

/**
 * Logo reutilizable de Smart Home.
 *
 * Centralizar el logo en este componente evita repetir `Image`, rutas de assets
 * y calculos de proporcion en cada pantalla donde se necesite mostrar la marca.
 */
export default function SmartHomeLogo({
  size = 220,
  variant = "light",
}: SmartHomeLogoProps) {
  // Selecciona el asset adecuado segun el fondo donde se renderice.
  const logoSource = variant === "dark" ? whiteLogo : blueLogo;

  // La altura se deriva del ancho para conservar la proporcion real del logo.
  const logoWidth = size;
  const logoHeight = Math.round(size / LOGO_RATIO);

  return (
    <View style={styles.wrapper}>
      <Image
        // Mejora accesibilidad: lectores de pantalla anuncian que la imagen es el logo.
        accessibilityLabel="Smart Home"
        // Evita recortes y conserva proporcion dentro del espacio asignado.
        resizeMode="contain"
        source={logoSource}
        style={{
          height: logoHeight,
          width: logoWidth,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    // Centra el logo dentro del espacio donde se use.
    alignItems: "center",
    justifyContent: "center",
  },
});
