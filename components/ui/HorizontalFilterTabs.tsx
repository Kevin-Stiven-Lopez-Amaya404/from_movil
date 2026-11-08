import { useEffect, useRef } from "react";
import { ScrollView, StyleSheet, View, type ScrollViewInstance, type StyleProp, type ViewStyle } from "react-native";

import { useAppTheme } from "@/lib/theme/app-theme";
import { FilterChip, type FilterItem, type FilterChipRole } from "@/components/ui/FilterChip";

type ItemLayout = {
  x: number;
  width: number;
};

export type HorizontalFilterTabsProps<T extends string | number> = {
  items: FilterItem<T>[];
  selectedValue: T;
  onValueChange: (value: T) => void;
  role?: FilterChipRole;
  containerStyle?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
};

/**
 * Horizontal group for options that may exceed the available width.
 *
 * Measures each chip and scrolls the ScrollView to the active option to avoid
 * cut-off buttons without a visual hint.
 */
export function HorizontalFilterTabs<T extends string | number>({
  accessibilityLabel,
  containerStyle,
  items,
  onValueChange,
  role = "button",
  selectedValue,
  testID,
}: HorizontalFilterTabsProps<T>) {
  const theme = useAppTheme();
  const scrollRef = useRef<ScrollViewInstance | null>(null);
  const itemLayouts = useRef<Record<string, ItemLayout>>({});

  useEffect(() => {
    const selectedKey = String(selectedValue);
    const layout = itemLayouts.current[selectedKey];

    if (!layout) return;

    scrollRef.current?.scrollTo({
      x: Math.max(layout.x - 18, 0),
      animated: true,
    });
  }, [selectedValue]);

  return (
    <View
      style={[styles.wrapper, containerStyle]}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
    >
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        keyboardShouldPersistTaps="always"
        bounces={false}
      >
        {items.map((item) => (
          <FilterChip
            key={String(item.value)}
            item={item}
            selected={item.value === selectedValue}
            onPress={() => onValueChange(item.value)}
            role={role}
            onLayout={(event) => {
              itemLayouts.current[String(item.value)] = event;
            }}
          />
        ))}
      </ScrollView>
      <View
        pointerEvents="none"
        style={[styles.fadeLeft, { backgroundColor: theme.overlaySubtle }]}
      />
      <View
        pointerEvents="none"
        style={[styles.fadeRight, { backgroundColor: theme.overlaySubtle }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 14,
  },
  fadeLeft: {
    bottom: 0,
    left: 0,
    position: "absolute",
    top: 0,
    width: 14,
  },
  fadeRight: {
    bottom: 0,
    position: "absolute",
    right: 0,
    top: 0,
    width: 14,
  },
});
