import { useWindowDimensions, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { FilterChip, type FilterItem, type FilterChipRole } from "@/components/ui/FilterChip";
import { HorizontalFilterTabs } from "@/components/ui/HorizontalFilterTabs";

export type SegmentedControlProps<T extends string | number> = {
  items: FilterItem<T>[];
  selectedValue: T;
  onValueChange: (value: T) => void;
  scrollable?: boolean;
  role?: FilterChipRole;
  testID?: string;
  accessibilityLabel?: string;
  containerStyle?: StyleProp<ViewStyle>;
};

/**
 * Control segmentado reutilizable.
 *
 * - En grupos cortos reparte los items con `flex: 1`.
 * - En grupos largos usa scroll horizontal con auto-posicionamiento.
 */
export function SegmentedControl<T extends string | number>({
  accessibilityLabel,
  containerStyle,
  items,
  onValueChange,
  role = "tab",
  scrollable = false,
  selectedValue,
  testID,
}: SegmentedControlProps<T>) {
  const { width } = useWindowDimensions();
  const shouldScroll = scrollable || width < 360;

  if (shouldScroll) {
    return (
      <HorizontalFilterTabs
        accessibilityLabel={accessibilityLabel}
        containerStyle={containerStyle}
        items={items}
        onValueChange={onValueChange}
        role={role}
        selectedValue={selectedValue}
        testID={testID}
      />
    );
  }

  return (
    <View
      style={[styles.segmentedRow, containerStyle]}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
    >
      {items.map((item) => (
        <FilterChip
          key={String(item.value)}
          equalWidth
          item={item}
          selected={item.value === selectedValue}
          onPress={() => onValueChange(item.value)}
          role={role}
          style={styles.equalItem}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  segmentedRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    width: "100%",
  },
  equalItem: {
    flex: 1,
    minWidth: 0,
  },
});
