import { useCallback, useEffect, useRef } from "react";
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

import { styles, SPLASH_BACKGROUND } from "./SplashAnimation.styles";

const ANIMATION_DURATION_MS = 950;
const SMART_HOME_LOGO = require("@/assets/images/logo-smart-home-white.png");

interface Props {
  /** Callback que avisa al layout raíz que terminó la animación. */
  onFinish: () => void;
}

/**
 * Animación de bienvenida (solo la primera vez por instalación).
 *
 * Arranca sobre el mismo color del splash nativo para que no haya salto:
 * el logo aparece con un fundido y un leve crecimiento, se sostiene un
 * instante y la capa completa se desvanece sobre la primera pantalla.
 */
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
        easing: Easing.out(Easing.cubic),
      },
      (finished) => {
        if (finished) runOnJS(finishOnce)();
      },
    );

    return () => cancelAnimation(progress);
  }, [finishOnce, progress, reduceMotion]);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      progress.value,
      [0, 0.45],
      [0, 1],
      Extrapolation.CLAMP,
    ),
    transform: [
      {
        scale: interpolate(
          progress.value,
          [0, 0.45],
          [0.94, 1],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  const screenStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      progress.value,
      [0, 0.72, 1],
      [1, 1, 0],
      Extrapolation.CLAMP,
    ),
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.container,
        { backgroundColor: SPLASH_BACKGROUND },
        screenStyle,
      ]}
    >
      <Animated.Image
        accessible
        accessibilityLabel="Smart Home"
        resizeMode="contain"
        source={SMART_HOME_LOGO}
        style={[styles.logo, logoStyle]}
      />
    </Animated.View>
  );
}