import { Image, StyleSheet, View } from "react-native";

interface SmartHomeLogoProps {
  /** Ancho base del logo. La altura se calcula automáticamente. */
  size?: number;

  /** Se conserva por compatibilidad con llamadas existentes. */
  showText?: boolean;

  /** Variante visual del logo. */
  variant?: "light" | "dark";
}

/*
 * Logo Smart Home con fondo transparente.
 *
 * Este asset contiene:
 * - Casa
 * - Rayo
 * - Texto SMART HOME
 *
 * El fondo es transparente, por lo que permite
 * colocar animaciones y halos detrás del logo
 * sin crear un cuadro visible.
 */
const smartHomeLogo = require("@/assets/images/logosmarthome-removebg-preview.png");

/*
 * Proporción real del PNG:
 *
 * ancho: 612
 * alto: 408
 */
const LOGO_WIDTH = 612;
const LOGO_HEIGHT = 408;

const LOGO_RATIO = LOGO_WIDTH / LOGO_HEIGHT;

export default function SmartHomeLogo({
  size = 220,
}: SmartHomeLogoProps) {
  const logoWidth = size;
  const logoHeight = Math.round(size / LOGO_RATIO);

  return (
    <View style={styles.wrapper}>
      <Image
        accessibilityLabel="Smart Home"
        source={smartHomeLogo}
        resizeMode="contain"
        style={{
          width: logoWidth,
          height: logoHeight,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
});