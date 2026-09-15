import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import type { BottomTabBarProps } from "expo-router/build/react-navigation/bottom-tabs";
import { useEffect, useState } from "react";
import {
    Animated,
    Easing,
    Pressable,
    StyleSheet,
    View,
    useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppTheme } from "@/lib/theme/app-theme";

const ITEMS = [
  { route: "index", label: "Home", icon: "home-outline" as const },
  {
    route: "devices",
    label: "Dispositivos",
    icon: "hardware-chip-outline" as const,
  },
  { route: "favorites", label: "Favoritos", icon: "star-outline" as const },
  {
    route: "alerts",
    label: "Alertas",
    icon: "notifications-outline" as const,
  },
  { route: "profile", label: "Perfil", icon: "person-outline" as const },
];

const BAR_HORIZONTAL_PADDING = 6;
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
  const resolvedBarWidth = barWidth > 0 ? barWidth : windowWidth * 0.88;
  const itemWidth =
    (resolvedBarWidth - BAR_HORIZONTAL_PADDING * 2) / ITEMS.length;
  const inactiveColor = theme.tab.inactiveText;
  const activeColor = theme.tab.activeText;

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
          const route = state.routes.find(
            (current) => current.name === item.route,
          );
          const routeOptions = route
            ? descriptors[route.key]?.options
            : undefined;
          const itemIndex = state.routes.findIndex(
            (current) => current.name === item.route,
          );
          const selected = itemIndex === state.index;

          if (!route) return null;

          return (
            <Pressable
              accessibilityLabel={
                routeOptions?.tabBarAccessibilityLabel ?? item.label
              }
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              key={item.route}
              onPress={() => handlePress(item.route)}
              style={({ pressed }) => [styles.item, pressed && styles.pressed]}
            >
              {selected ? (
                <Ionicons name={item.icon} size={24} color={activeColor} />
              ) : (
                <Ionicons name={item.icon} size={24} color={inactiveColor} />
              )}
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
    paddingTop: 12,
    width: "100%",
  },
  bar: {
    alignItems: "stretch",
    borderRadius: 30,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    height: 58,
    maxWidth: 520,
    paddingHorizontal: 5,
    position: "relative",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    width: "90%",
  },
  blur: {
    ...StyleSheet.absoluteFill,
    borderRadius: 30,
  },
  glassOverlay: {
    ...StyleSheet.absoluteFill,
    borderRadius: 30,
  },
  item: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    minWidth: 56,
    paddingVertical: 3,
  },
  pressed: {
    opacity: 0.72,
  },
  activeIndicator: {
    borderRadius: 2,
    bottom: 6,
    height: 2,
    position: "absolute",
    width: 20,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 1,
    zIndex: 2,
  },
});
