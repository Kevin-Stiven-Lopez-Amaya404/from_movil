import { Image } from "react-native";

interface SmartHomeLogoProps {
  /** Square size of the brand symbol. */
  size?: number;

  /** Kept for compatibility with existing calls. */
  showText?: boolean;

  /** Visual variant kept for compatibility. */
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
