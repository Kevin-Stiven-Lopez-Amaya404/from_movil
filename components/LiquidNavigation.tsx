import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import type { BottomTabBarProps } from "expo-router/build/react-navigation/bottom-tabs";
import { useEffect, useState } from "react";
import {
    Animated,
    Easing,
    Pressable,
    StyleSheet,
    Text,
    View,
    useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppTheme } from "@/lib/theme/app-theme";
import { typography } from "@/lib/theme/typography";

const ITEMS = [
  { route: "index", label: "Dashboard", icon: "speedometer-outline" as const },
  { route: "homes", label: "Estancias", icon: "home-outline" as const },
  { route: "reports", label: "Energía", icon: "flash-outline" as const },
  { route: "profile", label: "Perfil", icon: "person" as const, central: true },
];

const BAR_HORIZONTAL_PADDING = 8;
const INDICATOR_WIDTH = 20;

export function LiquidNavigation({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const theme = useAppTheme();
  const [barWidth, setBarWidth] = useState(0);
  const activeIndex = ITEMS.findIndex(
    (item) => item.route === state.routes[state.index]?.name,
  );
  const safeActiveIndex = activeIndex >= 0 ? activeIndex : 0;
  const [indicatorPosition] = useState(
    () => new Animated.Value(safeActiveIndex),
  );
  const resolvedBarWidth = barWidth > 0 ? barWidth : windowWidth * 0.92;
  const itemWidth =
    (resolvedBarWidth - BAR_HORIZONTAL_PADDING * 2) / ITEMS.length;
  const activeRoute = state.routes[state.index]?.name;

  useEffect(() => {
    Animated.timing(indicatorPosition, {
      toValue: safeActiveIndex,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [indicatorPosition, safeActiveIndex]);

  const indicatorTranslateX = indicatorPosition.interpolate({
    inputRange: [0, Math.max(ITEMS.length - 1, 1)],
    outputRange: [
      BAR_HORIZONTAL_PADDING + itemWidth / 2 - INDICATOR_WIDTH / 2,
      BAR_HORIZONTAL_PADDING +
        itemWidth * (ITEMS.length - 1) +
        itemWidth / 2 -
        INDICATOR_WIDTH / 2,
    ],
  });

  function handlePress(routeName: string) {
    const route = state.routes.find((item) => item.name === routeName);
    if (!route) return;

    const event = navigation.emit({
      type: "tabPress",
      target: route.key,
      canPreventDefault: true,
    });

    if (
      !event.defaultPrevented &&
      state.index !== state.routes.indexOf(route)
    ) {
      navigation.navigate(route.name, route.params);
    }
  }

  return (
    <View
      style={[styles.safeArea, { paddingBottom: Math.max(insets.bottom, 8) }]}
      pointerEvents="box-none"
    >
      <View
        onLayout={(event) => setBarWidth(event.nativeEvent.layout.width)}
        style={[
          styles.bar,
          {
            borderColor: theme.dark ? theme.border : theme.borderLight,
            shadowColor: theme.shadow,
          },
        ]}
      >
        <BlurView
          intensity={theme.dark ? 18 : 22}
          tint={theme.dark ? "dark" : "light"}
          style={styles.blur}
        />
        <View
          pointerEvents="none"
          style={[
            styles.glassOverlay,
            {
              backgroundColor: theme.dark
                ? "rgba(17, 24, 39, 0.82)"
                : "rgba(255, 255, 255, 0.88)",
            },
          ]}
        />
        <Animated.View
          pointerEvents="none"
          style={[
            styles.activeIndicator,
            {
              backgroundColor: theme.tab.activeBorder,
              shadowColor: theme.tab.activeShadow,
              transform: [{ translateX: indicatorTranslateX }],
            },
          ]}
        />

        {ITEMS.map((item) => {
          const route = state.routes.find((entry) => entry.name === item.route);
          if (!route) return null;

          const options = descriptors[route.key]?.options;
          const selected = activeRoute === item.route;

          return (
            <Pressable
              key={item.route}
              accessibilityRole="tab"
              accessibilityLabel={
                options?.tabBarAccessibilityLabel ?? item.label
              }
              accessibilityState={{ selected }}
              onPress={() => handlePress(item.route)}
              style={({ pressed }) => [
                styles.item,
                item.central && styles.centralItem,
                pressed && styles.pressed,
              ]}
            >
              <View
                style={[
                  item.central && styles.centralIcon,
                  selected && !item.central && styles.selectedIcon,
                ]}
              >
                <Ionicons
                  name={item.icon}
                  size={item.central ? 24 : 21}
                  color={item.central || selected ? "#FFFFFF" : "#B8C2D2"}
                />
              </View>
              <Text
                style={[
                  styles.label,
                  {
                    color: selected && !item.central ? "#19B66A" : "#B8C2D2",
                  },
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    alignItems: "center",
    paddingTop: 10,
    width: "100%",
  },
  bar: {
    alignItems: "stretch",
    backgroundColor: "#101D33",
    borderRadius: 31,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    height: 70,
    maxWidth: 520,
    paddingHorizontal: BAR_HORIZONTAL_PADDING,
    position: "relative",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    width: "92%",
  },
  blur: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 30,
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 30,
  },
  item: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    minWidth: 52,
    paddingVertical: 4,
  },
  pressed: {
    opacity: 0.68,
  },
  centralItem: {
    marginTop: -20,
  },
  centralIcon: {
    alignItems: "center",
    backgroundColor: "#16B86A",
    borderColor: "#D7F9E8",
    borderRadius: 30,
    borderWidth: 3,
    height: 58,
    justifyContent: "center",
    shadowColor: "#16B86A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    width: 58,
  },
  activeIndicator: {
    borderRadius: 2,
    bottom: 6,
    height: 2,
    position: "absolute",
    width: INDICATOR_WIDTH,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 1,
    zIndex: 2,
  },
  selectedIcon: {
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontFamily: typography.fontFamily.emphasis,
    fontSize: 9,
    fontWeight: "800",
    marginTop: 4,
  },
});
