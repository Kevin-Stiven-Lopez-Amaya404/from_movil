import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import type { BottomTabBarProps } from "expo-router/build/react-navigation/bottom-tabs";
import { useEffect, useRef, useState } from "react";
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
  { route: "alerts", label: "Alertas", icon: "notifications-outline" as const },
  { route: "profile", label: "Perfil", icon: "person-outline" as const },
];

const BAR_PADDING = 6;

// Create all Animated.Values outside component state using lazy initializers
function createScaleAnims() {
  return ITEMS.map(() => new Animated.Value(1));
}
function createOpacityAnims() {
  return ITEMS.map(() => new Animated.Value(1));
}

export function LiquidNavigation({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const theme = useAppTheme();

  const [barWidth, setBarWidth] = useState(0);
  const resolvedBarWidth = barWidth > 0 ? barWidth : windowWidth * 0.88;
  const itemWidth = (resolvedBarWidth - BAR_PADDING * 2) / ITEMS.length;

  const activeIndex = ITEMS.findIndex(
    (item) => item.route === state.routes[state.index]?.name,
  );
  const safeActiveIndex = activeIndex >= 0 ? activeIndex : 0;

  // ── Animated values (stable via useState lazy init) ─────────────────────
  const [pillAnim] = useState(() => new Animated.Value(safeActiveIndex));
  const [scaleAnims] = useState<Animated.Value[]>(createScaleAnims);
  const [opacityAnims] = useState<Animated.Value[]>(createOpacityAnims);

  // Track previous active index to animate out the old tab
  const prevIndexRef = useRef(safeActiveIndex);

  useEffect(() => {
    // Animate pill with spring for smooth follow-through
    Animated.spring(pillAnim, {
      toValue: safeActiveIndex,
      useNativeDriver: true,
      stiffness: 260,
      damping: 22,
      mass: 0.8,
    }).start();

    const prev = prevIndexRef.current;
    prevIndexRef.current = safeActiveIndex;

    // Bounce the newly active icon
    const activeScale = scaleAnims[safeActiveIndex];
    if (activeScale) {
      Animated.sequence([
        Animated.spring(activeScale, {
          toValue: 1.22,
          useNativeDriver: true,
          stiffness: 380,
          damping: 14,
        }),
        Animated.spring(activeScale, {
          toValue: 1,
          useNativeDriver: true,
          stiffness: 300,
          damping: 18,
        }),
      ]).start();
    }

    // Briefly dim the old icon
    const prevOpacity = opacityAnims[prev];
    if (prevOpacity && prev !== safeActiveIndex) {
      Animated.sequence([
        Animated.timing(prevOpacity, {
          toValue: 0.5,
          duration: 70,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(prevOpacity, {
          toValue: 1,
          duration: 160,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeActiveIndex]);

  // ── Pill geometry ────────────────────────────────────────────────────────
  const pillWidth = itemWidth * 0.62;
  const pillTranslateX = pillAnim.interpolate({
    inputRange: [0, Math.max(ITEMS.length - 1, 1)],
    outputRange: [
      BAR_PADDING + itemWidth / 2 - pillWidth / 2,
      BAR_PADDING +
        itemWidth * (ITEMS.length - 1) +
        itemWidth / 2 -
        pillWidth / 2,
    ],
  });

  function handlePress(routeName: string) {
    const route = state.routes.find((r) => r.name === routeName);
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

  const activeColor = theme.tab.activeText;
  const inactiveColor = theme.tab.inactiveText;

  return (
    <View
      style={[styles.safeArea, { paddingBottom: Math.max(insets.bottom, 8) }]}
      pointerEvents="box-none"
    >
      <View
        onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
        style={[
          styles.bar,
          {
            borderColor: theme.dark
              ? "rgba(255,255,255,0.08)"
              : "rgba(0,0,0,0.07)",
            shadowColor: theme.dark ? "#000" : "#0047AB",
          },
        ]}
      >
        {/* Glass background */}
        <BlurView
          intensity={theme.dark ? 24 : 30}
          tint={theme.dark ? "dark" : "light"}
          style={[StyleSheet.absoluteFill, { borderRadius: 32 }]}
        />
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: theme.dark
                ? "rgba(15, 23, 42, 0.85)"
                : "rgba(255, 255, 255, 0.92)",
              borderRadius: 32,
            },
          ]}
        />

        {/* Animated pill */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.pill,
            {
              width: pillWidth,
              backgroundColor: theme.dark
                ? "rgba(0, 71, 171, 0.28)"
                : "rgba(0, 71, 171, 0.10)",
              borderColor: theme.dark
                ? "rgba(96, 165, 250, 0.22)"
                : "rgba(0, 71, 171, 0.18)",
              transform: [{ translateX: pillTranslateX }],
            },
          ]}
        />

        {/* Tab items */}
        {ITEMS.map((item, idx) => {
          const route = state.routes.find((r) => r.name === item.route);
          const routeOptions = route
            ? descriptors[route.key]?.options
            : undefined;
          const itemIdx = state.routes.findIndex((r) => r.name === item.route);
          const selected = itemIdx === state.index;

          if (!route) return null;

          const scaleAnim = scaleAnims[idx] ?? new Animated.Value(1);
          const opacityAnim = opacityAnims[idx] ?? new Animated.Value(1);

          return (
            <Pressable
              key={item.route}
              accessibilityLabel={
                routeOptions?.tabBarAccessibilityLabel ?? item.label
              }
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              onPress={() => handlePress(item.route)}
              style={({ pressed }) => [styles.item, pressed && styles.pressed]}
            >
              <Animated.View
                style={[
                  styles.iconWrapper,
                  {
                    transform: [{ scale: scaleAnim }],
                    opacity: opacityAnim,
                  },
                ]}
              >
                <Ionicons
                  name={item.icon}
                  size={selected ? 22 : 21}
                  color={selected ? activeColor : inactiveColor}
                />
                {selected && (
                  <Text
                    numberOfLines={1}
                    style={[styles.label, { color: activeColor }]}
                  >
                    {item.label}
                  </Text>
                )}
              </Animated.View>
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
    borderRadius: 32,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    height: 64,
    maxWidth: 520,
    overflow: "hidden",
    paddingHorizontal: BAR_PADDING,
    position: "relative",
    // Shadow
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 12,
    width: "90%",
  },
  pill: {
    position: "absolute",
    top: 9,
    bottom: 9,
    borderRadius: 20,
    borderWidth: 1,
  },
  item: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    minWidth: 52,
    paddingVertical: 4,
  },
  pressed: {
    opacity: 0.65,
  },
  iconWrapper: {
    alignItems: "center",
    gap: 2,
  },
  label: {
    fontSize: 10,
    fontWeight: "700",
    fontFamily: typography.fontFamily.emphasis,
    letterSpacing: 0.3,
  },
});
