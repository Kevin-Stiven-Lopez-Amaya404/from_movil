import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import { Platform, Pressable, StyleSheet, Text } from "react-native";

type BackButtonProps = {
  color?: string;
  fallbackHref: Href;
  label?: string;
};

export function BackButton({ color = "#0864C8", fallbackHref, label = "Volver" }: BackButtonProps) {
  const router = useRouter();

  function handlePress() {
    if (Platform.OS !== "web" && router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(fallbackHref);
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={handlePress}
      style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
    >
      <Ionicons name="chevron-back" size={22} color={color} />
      <Text style={[styles.label, { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    alignSelf: "flex-start",
    flexDirection: "row",
    gap: 4,
    minHeight: 36,
    paddingRight: 10,
  },
  buttonPressed: {
    opacity: 0.65,
  },
  label: {
    fontSize: 15,
    fontWeight: "800",
  },
});
