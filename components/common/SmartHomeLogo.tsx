import { Image } from "react-native";

interface SmartHomeLogoProps {
  /** Tamaño cuadrado del símbolo de marca. */
  size?: number;

  /** Se conserva por compatibilidad con llamadas existentes. */
  showText?: boolean;

  /** Variante visual conservada por compatibilidad. */
  variant?: "light" | "dark";
}

const smartHomeLogo = require("@/assets/images/smarthome-logo.png");

export default function SmartHomeLogo({ size = 220 }: SmartHomeLogoProps) {
  return (
    <Image
      accessibilityLabel="Logo de SmartHome"
      accessible
      resizeMode="cover"
      source={smartHomeLogo}
      style={{
        height: size,
        width: size,
      }}
    />
  );
}
