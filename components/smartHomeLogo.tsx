import { Image, StyleSheet, View } from "react-native";

interface SmartHomeLogoProps {
  size?: number;
  showText?: boolean;
  variant?: "light" | "dark";
}

const LOGO_RATIO = 640 / 820;
const blueLogo = require("@/assets/images/logo-smart-home.png");
const whiteLogo = require("@/assets/images/logo-smart-home-white.png");

export default function SmartHomeLogo({
  size = 220,
  variant = "light",
}: SmartHomeLogoProps) {
  const logoSource = variant === "dark" ? whiteLogo : blueLogo;
  const logoWidth = size;
  const logoHeight = Math.round(size / LOGO_RATIO);

  return (
    <View style={styles.wrapper}>
      <Image
        accessibilityLabel="Smart Home"
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
    alignItems: "center",
    justifyContent: "center",
  },
});
