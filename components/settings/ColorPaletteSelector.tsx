import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { ColorPaletteName } from "@/lib/domain/preferences";
import { typography } from "@/lib/theme/typography";

type ColorPaletteSelectorProps = {
  activePalette: ColorPaletteName;
  borderColor: string;
  labels: Record<ColorPaletteName, string>;
  onChange: (palette: ColorPaletteName) => void;
  onPrimaryColor: string;
  primaryColor: string;
  rowColor: string;
  textColor: string;
  title: string;
};

const PALETTES: ColorPaletteName[] = ["classic", "emerald"];

export function ColorPaletteSelector({
  activePalette,
  borderColor,
  labels,
  onChange,
  onPrimaryColor,
  primaryColor,
  rowColor,
  textColor,
  title,
}: ColorPaletteSelectorProps) {
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: textColor }]}>{title}</Text>
      <View style={styles.options}>
        {PALETTES.map((palette) => {
          const active = activePalette === palette;

          return (
            <Pressable
              key={palette}
              accessibilityRole="radio"
              accessibilityState={{ checked: active }}
              accessibilityLabel={labels[palette]}
              onPress={() => onChange(palette)}
              style={[
                styles.option,
                {
                  backgroundColor: active ? primaryColor : rowColor,
                  borderColor: active ? primaryColor : borderColor,
                },
              ]}
            >
              <Ionicons
                name={active ? "checkmark-circle" : "ellipse-outline"}
                size={17}
                color={active ? onPrimaryColor : textColor}
              />
              <Text
                style={[
                  styles.optionText,
                  { color: active ? onPrimaryColor : textColor },
                ]}
              >
                {labels[palette]}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
    marginTop: 16,
  },
  title: {
    fontFamily: typography.fontFamily.emphasis,
    fontSize: 12,
    fontWeight: "800",
  },
  options: {
    flexDirection: "row",
    gap: 8,
  },
  option: {
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: 8,
  },
  optionText: {
    flexShrink: 1,
    fontFamily: typography.fontFamily.emphasis,
    fontSize: 11,
    fontWeight: "800",
  },
});
