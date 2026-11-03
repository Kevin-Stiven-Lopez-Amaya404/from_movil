import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  ReduceMotion,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  ZoomIn,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { useResponsiveLayout } from "@/lib/responsive/responsive";
import { useAppTheme } from "@/lib/theme/app-theme";
import { useAuthPalette } from "@/lib/theme/appearance";
import { useAppReady } from "@/lib/ui/app-ready";
import { styles } from "../styles/welcome.styles";

// Ritmo de la entrada: casa → rayo (energía) → textos → botones.
const EASE_OUT = Easing.out(Easing.cubic);
const HOUSE_DELAY = 0;
const BOLT_DELAY = 420;
const TITLE_DELAY = 260;
const SUBTITLE_DELAY = 340;
const ACTIONS_DELAY = 460;
const PULSE_DELAY = 820;

function enter(delay: number) {
  return FadeInDown.delay(delay)
    .duration(480)
    .easing(EASE_OUT)
    .withInitialValues({ transform: [{ translateY: 12 }] })
    .reduceMotion(ReduceMotion.System);
}

export default function WelcomeScreen() {
  const router = useRouter();
  const layout = useResponsiveLayout();
  const palette = useAuthPalette();
  const theme = useAppTheme();
  const appReady = useAppReady();
  const reduceMotion = useReducedMotion();

  // Dos pulsos suaves alrededor del rayo: "la casa se enciende".
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (!appReady || reduceMotion) return;

    pulse.value = withDelay(
      PULSE_DELAY,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 900, easing: EASE_OUT }),
          withTiming(0, { duration: 0 }),
        ),
        2,
        false,
      ),
    );
  }, [appReady, pulse, reduceMotion]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulse.value === 0 ? 0 : 0.35 * (1 - pulse.value),
    transform: [{ scale: 1 + pulse.value * 0.9 }],
  }));

  const outline =
    palette.fieldBorder === "transparent" ? palette.border : palette.fieldBorder;

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: palette.background }]}
    >
      <ScrollView
        bounces={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: layout.gutter,
            paddingTop: layout.compact ? 16 : 32,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Mientras el splash cubre la pantalla no se monta nada animado */}
        {appReady ? (
          <View style={[styles.content, { maxWidth: layout.contentWidth }]}>
            <View style={styles.hero}>
              <Animated.View
                entering={FadeIn.delay(HOUSE_DELAY)
                  .duration(520)
                  .easing(EASE_OUT)
                  .reduceMotion(ReduceMotion.System)}
                style={[
                  styles.houseTile,
                  layout.compact && styles.houseTileCompact,
                  { backgroundColor: palette.primarySoft },
                ]}
              >
                <Ionicons
                  accessible={false}
                  color={palette.button}
                  name="home-outline"
                  size={layout.compact ? 48 : 56}
                />

                <View style={styles.boltAnchor}>
                  <Animated.View
                    pointerEvents="none"
                    style={[
                      styles.boltPulse,
                      { backgroundColor: palette.button },
                      pulseStyle,
                    ]}
                  />
                  <Animated.View
                    entering={ZoomIn.delay(BOLT_DELAY)
                      .springify()
                      .damping(14)
                      .stiffness(180)
                      .reduceMotion(ReduceMotion.System)}
                    style={[
                      styles.boltBadge,
                      {
                        backgroundColor: palette.button,
                        borderColor: palette.background,
                      },
                    ]}
                  >
                    <Ionicons
                      accessible={false}
                      color={palette.onPrimary}
                      name="flash"
                      size={16}
                    />
                  </Animated.View>
                </View>
              </Animated.View>

              <Animated.Text
                entering={enter(TITLE_DELAY)}
                style={[styles.brand, { color: palette.muted }]}
              >
                SMART HOME
              </Animated.Text>

              <Animated.Text
                accessibilityRole="header"
                entering={enter(TITLE_DELAY)}
                style={[
                  styles.title,
                  layout.tiny && styles.titleTiny,
                  { color: theme.textPrimary },
                ]}
              >
                Tu hogar, más inteligente
              </Animated.Text>

              <Animated.Text
                entering={enter(SUBTITLE_DELAY)}
                style={[styles.subtitle, { color: palette.muted }]}
              >
                Controla tus dispositivos y conoce tu consumo de energía desde
                un solo lugar.
              </Animated.Text>
            </View>

            <Animated.View entering={enter(ACTIONS_DELAY)} style={styles.actions}>
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push("/login")}
                style={({ pressed }) => [
                  styles.primaryButton,
                  {
                    backgroundColor: pressed
                      ? palette.welcomeButtonPressed
                      : palette.welcomeButton,
                  },
                ]}
              >
                <Text
                  style={[styles.primaryButtonText, { color: palette.onPrimary }]}
                >
                  Iniciar sesión
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={() => router.push("/register")}
                style={({ pressed }) => [
                  styles.secondaryButton,
                  { borderColor: outline },
                  pressed && { backgroundColor: palette.welcomeSoftPressed },
                ]}
              >
                <Text
                  style={[styles.secondaryButtonText, { color: theme.textPrimary }]}
                >
                  Crear cuenta
                </Text>
              </Pressable>
            </Animated.View>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}