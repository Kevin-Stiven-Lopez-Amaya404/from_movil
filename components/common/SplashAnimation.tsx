import { useCallback, useEffect, useRef } from "react";
import { View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { styles } from "./SplashAnimation.styles";

const ANIMATION_DURATION_MS = 1680;
const SMART_HOME_LOGO = require("@/assets/images/logo-smart-home-white.png");

interface Props {
  /** Callback que avisa al layout raíz que terminó el splash. */
  onFinish: () => void;
}

export default function SplashAnimation({ onFinish }: Props) {
  const progress = useSharedValue(0);
  const reduceMotion = useReducedMotion();
  const hasFinished = useRef(false);
  const onFinishRef = useRef(onFinish);

  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  const finishOnce = useCallback(() => {
    if (hasFinished.current) return;

    hasFinished.current = true;
    onFinishRef.current();
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      finishOnce();
      return;
    }

    progress.value = 0;
    progress.value = withTiming(
      1,
      {
        duration: ANIMATION_DURATION_MS,
        easing: Easing.linear,
      },
      (finished) => {
        if (finished) runOnJS(finishOnce)();
      },
    );

    return () => cancelAnimation(progress);
  }, [finishOnce, progress, reduceMotion]);

  const leftShapeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      progress.value,
      [0, 0.1, 0.28, 0.48],
      [0, 0.24, 0.2, 0],
      Extrapolation.CLAMP,
    ),
    transform: [
      {
        translateX: interpolate(
          progress.value,
          [0, 0.28, 0.48],
          [-32, 0, -10],
          Extrapolation.CLAMP,
        ),
      },
      {
        translateY: interpolate(
          progress.value,
          [0, 0.28, 0.48],
          [-18, 0, -12],
          Extrapolation.CLAMP,
        ),
      },
      {
        scale: interpolate(
          progress.value,
          [0, 0.28, 0.48],
          [0.78, 1, 1.04],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  const rightShapeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      progress.value,
      [0, 0.1, 0.28, 0.48],
      [0, 0.24, 0.2, 0],
      Extrapolation.CLAMP,
    ),
    transform: [
      {
        translateX: interpolate(
          progress.value,
          [0, 0.28, 0.48],
          [32, 0, 10],
          Extrapolation.CLAMP,
        ),
      },
      {
        translateY: interpolate(
          progress.value,
          [0, 0.28, 0.48],
          [18, 0, 12],
          Extrapolation.CLAMP,
        ),
      },
      {
        scale: interpolate(
          progress.value,
          [0, 0.28, 0.48],
          [0.78, 1, 1.04],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  const haloStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      progress.value,
      [0.16, 0.4, 0.78, 1],
      [0, 0.14, 0.14, 0],
      Extrapolation.CLAMP,
    ),
    transform: [
      {
        scale: interpolate(
          progress.value,
          [0.16, 0.4],
          [0.92, 1],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  const logoStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      progress.value,
      [0.16, 0.43, 0.79, 1],
      [0, 1, 1, 0],
      Extrapolation.CLAMP,
    ),
    transform: [
      {
        scale: interpolate(
          progress.value,
          [0.16, 0.43],
          [0.975, 1],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  const screenStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      progress.value,
      [0, 0.8, 1],
      [1, 1, 0],
      Extrapolation.CLAMP,
    ),
  }));

  return (
    <Animated.View style={[styles.container, screenStyle]}>
      <Animated.View pointerEvents="none" style={[styles.halo, haloStyle]} />
      <View style={styles.markStage}>
        <Animated.View style={[styles.geometryLeft, leftShapeStyle]} />
        <Animated.View style={[styles.geometryRight, rightShapeStyle]} />
        <Animated.Image
          accessible
          accessibilityLabel="SmartHome"
          resizeMode="contain"
          source={SMART_HOME_LOGO}
          style={[styles.logo, logoStyle]}
        />
      </View>
    </Animated.View>
  );
}
