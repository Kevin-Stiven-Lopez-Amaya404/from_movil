import { useEffect, useRef } from "react";
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

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
 * Grupo horizontal para opciones que pueden superar el ancho disponible.
 *
 * Mide cada chip y desplaza el ScrollView hacia la opcion activa para evitar
 * botones cortados sin pista visual.
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
  const scrollRef = useRef<ScrollView>(null);
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
      <View pointerEvents="none" style={styles.fadeLeft} />
      <View pointerEvents="none" style={styles.fadeRight} />
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
    backgroundColor: "rgba(16, 24, 39, 0.18)",
    bottom: 0,
    left: 0,
    position: "absolute",
    top: 0,
    width: 14,
  },
  fadeRight: {
    backgroundColor: "rgba(16, 24, 39, 0.18)",
    bottom: 0,
    position: "absolute",
    right: 0,
    top: 0,
    width: 14,
  },
});
