# Componentes - common

## BackButton
- Ruta: `components/common/BackButton.tsx`
- Descripción: Botón reutilizable para navegar atrás; usa `router.back()` cuando hay historial y `router.replace(fallbackHref)` como fallback en web o sin historial.
- Props:
  - `color?: string` — color del icono y texto (default `#0864C8`).
  - `fallbackHref: Href` — ruta segura para reemplazar si no hay historial.
  - `label?: string` — texto visible y accesible (default `Volver`).
- Ejemplo de uso:
```
<BackButton fallbackHref="/" />
```

## SmartHomeLogo
- Ruta: `components/common/SmartHomeLogo.tsx`
- Descripción: Componente centralizado del logo; selecciona asset según `variant` y mantiene la proporción original del logo.
- Props:
  - `size?: number` — ancho base del logo en px (default `220`).
  - `showText?: boolean` — (mantenido por compatibilidad, el asset ya incluye texto).
  - `variant?: "light" | "dark"` — variante visual (default `light`).
- Ejemplo de uso:
```
<SmartHomeLogo size={160} variant="dark" />
```

## SplashAnimation
- Ruta: `components/common/SplashAnimation.tsx`
- Descripción: Animación inicial usando `react-native-reanimated`. Anima dos bloques y llama a `onFinish` una vez terminado.
- Props:
  - `onFinish: () => void` — callback que se ejecuta cuando la animación termina.
- Notas de implementación:
  - Usa `useSharedValue`, `withTiming`, `withDelay` y `runOnJS(onFinish)`.
  - Ajusta tamaño relativo usando el ancho de la pantalla (`Dimensions.get("window").width`).
- Ejemplo de uso:
```
<SplashAnimation onFinish={() => setShowingSplash(false)} />
```
