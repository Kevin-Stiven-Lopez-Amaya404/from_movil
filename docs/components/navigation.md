# Componentes - navigation

## HapticTab
- Ruta: `components/navigation/HapticTab.tsx`
- Descripción: Botón personalizado para el tab bar inferior que agrega feedback háptico en iOS.
- Props:
  - Recibe todas las props de `BottomTabBarButtonProps` de `@react-navigation/bottom-tabs`.
- Notas:
  - Usa `PlatformPressable` de `@react-navigation/elements`.
  - Ejecuta `Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)` en `onPressIn` solo en iOS.
  - Reenvía `props.onPressIn` para mantener la lógica de navegación original.
- Ejemplo:
```
<BottomTab.Screen
  name="Home"
  component={HomeScreen}
  options={{
    tabBarButton: (props) => <HapticTab {...props} />,
  }}
/>
```
