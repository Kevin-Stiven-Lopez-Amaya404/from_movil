import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';

/**
 * Boton personalizado para tabs con respuesta haptica en iOS.
 *
 * React Navigation permite reemplazar el boton de cada tab. Aqui se conserva
 * el comportamiento original (`PlatformPressable`) y se agrega una vibracion
 * ligera al presionar en dispositivos iOS.
 */
export function HapticTab(props: BottomTabBarButtonProps) {
  return (
    <PlatformPressable
      {...props}
      onPressIn={(ev) => {
        if (process.env.EXPO_OS === 'ios') {
          // Feedback tactil suave para que el cambio de pestaña se sienta nativo.
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }

        // Mantiene cualquier handler que React Navigation ya haya configurado.
        props.onPressIn?.(ev);
      }}
    />
  );
}
