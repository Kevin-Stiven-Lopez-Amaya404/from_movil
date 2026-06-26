import { useEffect } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");
const BLOCK_SIZE = width * 0.24;

interface Props {
  onFinish: () => void;
}

export default function SplashAnimation({ onFinish }: Props) {
  const leftOpacity = useSharedValue(0);
  const leftScale = useSharedValue(0.4);
  const leftX = useSharedValue(-30);

  const rightOpacity = useSharedValue(0);
  const rightScale = useSharedValue(0.4);
  const rightX = useSharedValue(30);

  const screenOpacity = useSharedValue(1);

  useEffect(() => {
    const easeOut = Easing.out(Easing.cubic);
    const easeIn = Easing.in(Easing.cubic);

    // Bloque izquierdo entra
    leftOpacity.value = withDelay(
      200,
      withTiming(1, { duration: 400, easing: easeOut }),
    );
    leftScale.value = withDelay(
      200,
      withTiming(1, { duration: 450, easing: easeOut }),
    );
    leftX.value = withDelay(
      200,
      withTiming(0, { duration: 450, easing: easeOut }),
    );

    // Bloque derecho entra
    rightOpacity.value = withDelay(
      450,
      withTiming(1, { duration: 400, easing: easeOut }),
    );
    rightScale.value = withDelay(
      450,
      withTiming(1, { duration: 450, easing: easeOut }),
    );
    rightX.value = withDelay(
      450,
      withTiming(0, { duration: 450, easing: easeOut }),
    );

    // Fade out final → navegar a la app
    screenOpacity.value = withDelay(
      1600,
      withTiming(0, { duration: 500, easing: easeIn }, (finished?: boolean) => {
        if (finished) runOnJS(onFinish)();
      }),
    );
  }, [
    leftOpacity,
    leftScale,
    leftX,
    rightOpacity,
    rightScale,
    rightX,
    screenOpacity,
    onFinish,
  ]);

  const leftStyle = useAnimatedStyle(() => ({
    opacity: leftOpacity.value,
    transform: [{ scale: leftScale.value }, { translateX: leftX.value }],
  }));

  const rightStyle = useAnimatedStyle(() => ({
    opacity: rightOpacity.value,
    transform: [{ scale: rightScale.value }, { translateX: rightX.value }],
  }));

  const screenStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, screenStyle]}>
      <View style={styles.logoWrapper}>
        <Animated.View style={[styles.blockLeft, leftStyle]} />
        <Animated.View style={[styles.blockRight, rightStyle]} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#005CC1",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  logoWrapper: {
    width: BLOCK_SIZE * 2,
    height: BLOCK_SIZE * 2,
    position: "relative",
  },
  blockLeft: {
    position: "absolute",
    top: 0,
    left: 0,
    width: BLOCK_SIZE,
    height: BLOCK_SIZE,
    backgroundColor: "white",
  },
  blockRight: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: BLOCK_SIZE,
    height: BLOCK_SIZE,
    backgroundColor: "white",
  },
});
