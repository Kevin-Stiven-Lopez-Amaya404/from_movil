import { Ionicons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "expo-router/build/react-navigation/bottom-tabs";
import { useEffect, useState } from "react";
import { Animated, Easing, Pressable, Text, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useSmartHome } from "@/lib/context/smart-home-context";
import { useAppTheme } from "@/lib/theme/app-theme";
import { styles, BAR_HORIZONTAL_PADDING } from "./LiquidNavigation.styles";


const ITEMS = [
  { route: "index", label: "Inicio", icon: "home" as const },
  { route: "homes", label: "Hogares", icon: "home-outline" as const },
  { route: "reports", label: "Energía", icon: "flash-outline" as const },
  { route: "notifications", label: "Avisos", icon: "notifications-outline" as const },
  { route: "profile", label: "Perfil", icon: "person-outline" as const },
];


const BAR_BOTTOM_GAP = 12;

const ACTIVE_PILL_WIDTH_RATIO = 0.84;
const ACTIVE_PILL_HEIGHT = 60;

export function LiquidNavigation({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const theme = useAppTheme();
  const { unreadNotificationCount } = useSmartHome();
  const [barWidth, setBarWidth] = useState(0);
  const activeIndex = ITEMS.findIndex(
    (item) => item.route === state.routes[state.index]?.name,
  );
  const safeActiveIndex = activeIndex >= 0 ? activeIndex : 0;
  const [indicatorPosition] = useState(
    () => new Animated.Value(safeActiveIndex),
  );
  const resolvedBarWidth = barWidth > 0 ? barWidth : windowWidth * 0.92;
  const itemWidth = Math.max(
    (resolvedBarWidth - BAR_HORIZONTAL_PADDING * 2) / ITEMS.length,
    0,
  );
  const activePillWidth = Math.min(
    itemWidth * ACTIVE_PILL_WIDTH_RATIO,
    72,
  );
  const activePillInset = (itemWidth - activePillWidth) / 2;
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
      BAR_HORIZONTAL_PADDING + activePillInset,
      BAR_HORIZONTAL_PADDING +
        activePillInset +
        itemWidth * (ITEMS.length - 1),
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
      style={[
        styles.safeArea,
        {
          backgroundColor: theme.background,
          paddingBottom: Math.max(insets.bottom, 0) + BAR_BOTTOM_GAP,
        },
      ]}
      pointerEvents="box-none"
    >
      <View
        onLayout={(event) => setBarWidth(event.nativeEvent.layout.width)}
        style={[
          styles.bar,
          {
            backgroundColor: theme.tabBar,
            borderColor: theme.borderLight,
            shadowColor: "#0A192F",
          },
        ]}
      >
        <Animated.View
          pointerEvents="none"
          style={[
            styles.activeIndicator,
            {
              backgroundColor: theme.tab.activeBackground,
              transform: [{ translateX: indicatorTranslateX }],
              height: ACTIVE_PILL_HEIGHT,
              opacity: activeIndex >= 0 ? 1 : 0,
              width: activePillWidth,
            },
          ]}
        />

        {ITEMS.map((item) => {
          const route = state.routes.find((entry) => entry.name === item.route);
          if (!route) return null;

          const options = descriptors[route.key]?.options;
          const selected = activeRoute === item.route;
          const showBadge =
            item.route === "notifications" && unreadNotificationCount > 0;

          return (
            <Pressable
              key={item.route}
              accessibilityRole="tab"
              accessibilityLabel={
                options?.tabBarAccessibilityLabel ?? item.label
              }
              accessibilityState={{ selected }}
              onPress={() => handlePress(item.route)}
              style={({ pressed }) => [styles.item, pressed && styles.pressed]}
            >
              <View style={styles.iconWrap}>
                <Ionicons
                  name={item.icon}
                  size={25}
                  color={selected ? theme.tab.activeText : theme.muted}
                />
                {showBadge ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {unreadNotificationCount > 9
                        ? "9+"
                        : String(unreadNotificationCount)}
                    </Text>
                  </View>
                ) : null}
              </View>
              <Text
                style={[
                  styles.label,
                  {
                    color: selected ? theme.tab.activeText : theme.muted,
                    fontWeight: selected ? "600" : "500",
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
