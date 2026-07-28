import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { ColorMode } from "@/lib/context/smart-home-context";
import { typography } from "@/lib/theme/typography";

type ThemeModeSelectorProps = {
  activeMode: ColorMode;
  borderColor: string;
  rowColor: string;
  blueColor: string;
  labels: Record<ColorMode, string>;
  onChange: (mode: ColorMode) => void;
};

const appFont = typography.fontFamily.emphasis;

/**
 * Selector claro/oscuro.
 *
 * Encapsula la logica visual de estado activo para que SettingsScreen solo
 * decida que modo aplicar.
 */
export function ThemeModeSelector({
  activeMode,
  blueColor,
  borderColor,
  labels,
  onChange,
  rowColor,
}: ThemeModeSelectorProps) {
  return (
    <View style={styles.themeRow}>
      {(["light", "dark"] as ColorMode[]).map((mode) => {
        const active = activeMode === mode;

        return (
          <Pressable
            key={mode}
            style={[
              styles.themeButton,
              { backgroundColor: rowColor, borderColor },
              active && { backgroundColor: blueColor, borderColor: blueColor },
            ]}
            onPress={() => onChange(mode)}
          >
            <Ionicons
              name={mode === "light" ? "sunny-outline" : "moon-outline"}
              size={19}
              color={active ? "#FFFFFF" : blueColor}
            />
            <Text style={[styles.themeText, { color: active ? "#FFFFFF" : blueColor }]}>
              {labels[mode]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  themeRow: {
    flexDirection: "row",
    gap: 10,
  },
  themeButton: {
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 46,
  },
  themeText: {
    fontFamily: appFont,
    fontSize: 15,
    fontWeight: "900",
  },
});
