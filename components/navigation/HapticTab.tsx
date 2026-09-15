import * as Haptics from "expo-haptics";
import type { BottomTabBarButtonProps } from "expo-router/build/react-navigation/bottom-tabs";
import type { ComponentProps } from "react";
import { Pressable } from "react-native";

/**
 * Boton personalizado para las pestañas inferiores.
 *
 * Funcion que cumple:
 * - Mantiene el boton normal que usa React Navigation.
 * - Agrega una vibracion suave en iOS cuando el usuario presiona una pestaña.
 *
 * Para que sirve:
 * - Mejora la experiencia de usuario porque el cambio de tab se siente mas nativo.
 * - Evita repetir esta logica en cada pantalla del tabbar.
 */
export function HapticTab(props: BottomTabBarButtonProps) {
  const pressableProps = props as ComponentProps<typeof Pressable>;

  return (
    <Pressable
      // Se pasan todas las props originales para no romper navegacion, estilos ni accesibilidad.
      {...pressableProps}
      onPressIn={(ev) => {
        if (process.env.EXPO_OS === "ios") {
          // Feedback tactil suave para que el cambio de pestaña se sienta nativo.
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }

        // Mantiene cualquier handler que React Navigation ya haya configurado.
        pressableProps.onPressIn?.(ev);
      }}
    />
  );
}
