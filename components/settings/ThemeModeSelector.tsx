import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { ColorMode } from "@/lib/domain/preferences";
import { typography } from "@/lib/theme/typography";

type ThemeModeSelectorProps = {
  activeMode: ColorMode;
  borderColor: string;
  onPrimaryColor: string;
  rowColor: string;
  blueColor: string;
  labels: Record<ColorMode, string>;
  onChange: (mode: ColorMode) => void;
};

const appFont = typography.fontFamily.emphasis;

/** Selector del modo de apariencia preferido por el usuario. */
export function ThemeModeSelector({
  activeMode,
  blueColor,
  borderColor,
  labels,
  onPrimaryColor,
  onChange,
  rowColor,
}: ThemeModeSelectorProps) {
  return (
    <View style={styles.themeRow}>
      {(["system", "light", "dark"] as ColorMode[]).map((mode) => {
        const active = activeMode === mode;
        const icon =
          mode === "system"
            ? "phone-portrait-outline"
            : mode === "light"
              ? "sunny-outline"
              : "moon-outline";

        return (
          <Pressable
            key={mode}
            accessibilityRole="radio"
            accessibilityState={{ checked: active }}
            style={[
              styles.themeButton,
              { backgroundColor: rowColor, borderColor },
              active && { backgroundColor: blueColor, borderColor: blueColor },
            ]}
            onPress={() => onChange(mode)}
          >
            <Ionicons name={icon} size={16} color={active ? onPrimaryColor : blueColor} />
            <Text style={[styles.themeText, { color: active ? onPrimaryColor : blueColor }]}>
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
    gap: 6,
  },
  themeButton: {
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: 5,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: 4,
  },
  themeText: {
    fontFamily: appFont,
    fontSize: 12,
    fontWeight: "900",
  },
});
