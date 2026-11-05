import {
  useFocusEffect,
  useRouter,
  type Href,
} from "expo-router";
import { useCallback } from "react";
import { BackHandler, Platform } from "react-native";

type Router = ReturnType<typeof useRouter>;

export function returnToParent(
  router: Router,
  from: string | undefined,
  expectedFrom: string,
  fallbackHref: Href,
) {
  if (from === expectedFrom && router.canGoBack()) {
    router.back();
    return;
  }

  router.replace(fallbackHref);
}

/** Redirect Android back to a screen's known parent for direct route entries. */
export function useAndroidBackFallback(
  enabled: boolean,
  fallbackHref: Href,
) {
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== "android" || !enabled) return;

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        () => {
          router.replace(fallbackHref);
          return true;
        },
      );

      return () => subscription.remove();
    }, [enabled, fallbackHref, router]),
  );
}
