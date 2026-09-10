import { type ReactNode, useEffect, useState } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { useResponsiveLayout } from "@/lib/responsive/responsive";
import { useAppTheme } from "@/lib/theme/app-theme";

export type FilterItem<T extends string | number> = {
  label: string;
  value: T;
  icon?: ReactNode;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
};

export type FilterChipRole = "button" | "tab";

export type FilterChipProps<T extends string | number> = {
  item: FilterItem<T>;
  selected: boolean;
  onPress: () => void;
  role?: FilterChipRole;
  onLayout?: (event: { x: number; width: number }) => void;
  style?: StyleProp<ViewStyle>;
  equalWidth?: boolean;
};

/**
 * Boton base para tabs y filtros.
 *
 * Mantiene estados visuales y accesibilidad en un solo lugar, evitando que
 * cada pantalla repita estilos de activo, inactivo, presionado y deshabilitado.
 */
export function FilterChip<T extends string | number>({
  item,
  onLayout,
  onPress,
  role = "button",
  selected,
  style,
  equalWidth,
}: FilterChipProps<T>) {
  const theme = useAppTheme();
  const { compact, width } = useResponsiveLayout();
  const [focused, setFocused] = useState(false);
  const [scale] = useState(() => new Animated.Value(selected ? 1 : 0.98));

  const fontSize = compact ? 14 : width >= 768 ? 17 : 15;
  const height = compact ? 44 : width >= 768 ? 52 : 48;

  useEffect(() => {
    Animated.timing(scale, {
      duration: 140,
      toValue: selected ? 1 : 0.98,
      useNativeDriver: true,
    }).start();
  }, [scale, selected]);

  function handleLayout(event: LayoutChangeEvent) {
    onLayout?.({ x: event.nativeEvent.layout.x, width: event.nativeEvent.layout.width });
  }

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable
        style={({ pressed }) => [
          styles.chip,
          equalWidth && styles.equalWidthChip,
          {
            minHeight: height,
            backgroundColor: selected ? theme.tab.activeBackground : theme.tab.inactiveBackground,
            borderColor: focused ? theme.blue : selected ? theme.tab.activeBorder : theme.tab.inactiveBorder,
            opacity: item.disabled ? 0.56 : pressed ? theme.tab.pressedOpacity : 1,
            shadowColor: selected ? theme.tab.activeShadow : "transparent",
          },
          selected && styles.selectedChip,
          focused && styles.focusedChip,
        ]}
        onBlur={() => setFocused(false)}
        onFocus={() => setFocused(true)}
        onLayout={handleLayout}
        onPress={onPress}
        disabled={item.disabled}
        accessibilityRole={role}
        accessibilityState={{ selected, disabled: item.disabled }}
        accessibilityLabel={item.accessibilityLabel ?? item.label}
        accessibilityHint={item.accessibilityHint}
        testID={item.testID}
      >
        <View style={styles.content}>
          {item.icon ? <View style={styles.icon}>{item.icon}</View> : null}
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={[
              styles.label,
              {
                color: item.disabled
                  ? theme.tab.disabledText
                  : selected
                    ? theme.tab.activeText
                    : theme.tab.inactiveText,
                fontSize,
                fontWeight: selected ? "700" : "600",
              },
            ]}
          >
            {item.label}
          </Text>
        </View>
        <View
          style={[
            styles.selectionIndicator,
            { backgroundColor: selected ? theme.tab.activeText : "transparent" },
          ]}
        />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    elevation: 0,
    justifyContent: "center",
    minWidth: 92,
    paddingHorizontal: 14,
    position: "relative",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0,
    shadowRadius: 6,
  },
  equalWidthChip: {
    alignSelf: "stretch",
    minWidth: 0,
    width: "100%",
  },
  selectedChip: {
    elevation: 2,
    shadowOpacity: 0.12,
  },
  focusedChip: {
    borderWidth: 2,
  },
  content: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    maxWidth: "100%",
  },
  icon: {
    marginRight: 8,
  },
  label: {
    textAlign: "center",
  },
  selectionIndicator: {
    borderRadius: 2,
    bottom: 5,
    height: 3,
    position: "absolute",
    width: 22,
  },
});
