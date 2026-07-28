import { useAppTheme } from "@/lib/theme/app-theme";
import { type Href, useRouter } from "expo-router";
import { type ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

export type DashboardTabItem = {
  key: string;
  label: string;
  route?: Href;
  onPress?: () => void;
  icon?: ReactNode;
  disabled?: boolean;
  accessibilityLabel?: string;
};

export type DashboardTabsProps = {
  items: DashboardTabItem[];
  activeKey: string;
  onTabPress?: (item: DashboardTabItem) => void;
  containerStyle?: StyleProp<ViewStyle>;
};

/**
 * Barra de pestañas del dashboard.
 *
 * Un componente adaptable, accesible y reusable para rutas superiores.
 * Cada pestaña mantiene el mismo ancho, altura y alineación.
 */
export function DashboardTabs({ items, activeKey, onTabPress, containerStyle }: DashboardTabsProps) {
  const router = useRouter();
  const theme = useAppTheme();

  const handleTabPress = (item: DashboardTabItem) => {
    if (item.disabled || item.key === activeKey) {
      return;
    }

    if (item.onPress) {
      item.onPress();
    } else if (item.route) {
      router.push(item.route);
    }

    onTabPress?.(item);
  };

  return (
    <ScrollView
      horizontal
      contentContainerStyle={[styles.tabs, containerStyle]}
      showsHorizontalScrollIndicator={false}
      directionalLockEnabled
      keyboardShouldPersistTaps="always"
    >
      {items.map((item) => {
        const selected = item.key === activeKey;

        return (
          <Pressable
            key={item.key}
            onPress={() => handleTabPress(item)}
            disabled={item.disabled}
            accessibilityRole="tab"
            accessibilityState={{ selected, disabled: item.disabled }}
            accessibilityLabel={item.accessibilityLabel ?? item.label}
            style={({ pressed }) => [
              styles.tab,
              {
                borderColor: selected ? theme.tab.activeBorder : "transparent",
                backgroundColor: selected ? theme.tab.activeBackground : "transparent",
              },
              pressed && !item.disabled && styles.tabPressed,
            ]}
            android_ripple={{ color: theme.tab.hoverBackground, radius: 220 }}
          >
            <View style={styles.tabInner}>
              {item.icon ? <View style={styles.icon}>{item.icon}</View> : null}
              <Text
                numberOfLines={1}
                style={[
                  styles.tabLabel,
                  {
                    color: item.disabled ? theme.tab.disabledText : selected ? theme.tab.activeText : theme.tab.inactiveText,
                    fontWeight: selected ? "700" : "600",
                  },
                ]}
              >
                {item.label}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tabs: {
    gap: 10,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  tab: {
    borderWidth: 1,
    borderRadius: 16,
    minHeight: 52,
    minWidth: 108,
    flexBasis: "33%",
    flexGrow: 1,
    justifyContent: "center",
    marginHorizontal: 4,
    paddingHorizontal: 14,
  },
  tabPressed: {
    opacity: 0.92,
  },
  tabFocus: {
    borderWidth: 1.5,
    borderColor: "#93C5FD",
  },
  tabInner: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    minHeight: 44,
  },
  icon: {
    marginRight: 8,
  },
  tabLabel: {
    fontSize: 17,
    lineHeight: 22,
    textAlign: "center",
  },
});
