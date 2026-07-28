# Flujo de navegación del proyecto Smart Home

## Rutas principales

### RootLayout (`app/_layout.tsx`)
- Punto de entrada global de la app.
- Envuelve la app con:
  - `SafeAreaProvider`
  - `ThemeProvider`
  - `SmartHomeProvider`
- Define un stack de pantallas claves:
  - `welcome`
  - `login`
  - `register`
  - `forgot-password`
  - `otp-verification`
  - `new-password`
  - `(tabs)` (navegación de pestañas)
- Usa `initialRouteName: 'welcome'` para comenzar siempre en la pantalla de bienvenida.
- Muestra `SplashAnimation` hasta que `onFinish` llama `finishSplash()`.

### Pantallas de autenticación

- `welcome.tsx`
  - Pantalla de bienvenida.
  - Botones para `login`, `register` y `Continuar con Google`.
  - Permite cambiar `colorMode` antes de iniciar sesión.
- `login.tsx`
  - Formulario de inicio de sesión con validación de correo y contraseña.
  - Usa `authenticateUser` de `lib/auth/auth-store.ts`.
  - En caso de éxito, `router.replace('/(tabs)')`.
  - Enlaces a `forgot-password` y `register`.
- `register.tsx`
  - Formulario de registro.
  - Usa `registerUser` para crear un usuario en memoria.
  - Al completar, redirige a `/login`.

### Flujo de recuperación de contraseña

- `forgot-password.tsx`
  - Solicita país, correo y aceptación de términos.
  - Si los datos son válidos, navega a `/otp-verification` con `email` como parámetro.
- `otp-verification.tsx`
  - Verifica un código OTP simulado (`222222`).
  - Al validar, empuja a `/new-password` con el mismo `email`.
- `new-password.tsx`
  - Actualiza la contraseña usando `updateUserPassword`.
  - Si tiene éxito, vuelve a `/login`.

## Navegación por pestañas

### TabLayout (`app/(tabs)/_layout.tsx`)
- Configura la barra de pestañas inferior usando `Tabs` de Expo Router.
- Pantallas visibles en tab bar:
  - `index` (Dashboard)
  - `homes` (Hogares)
  - `reports` (Reportes)
  - `profile` (Perfil)
- Ruta oculta en la barra:
  - `settings`
- Usa `HapticTab` como `tabBarButton` para feedback táctil en iOS.
- Aplica colores y estilos con `useAppTheme()` y `useSmartHome()`.

### Flujo de tabs

- `index.tsx` (Dashboard)
  - Muestra resumen de consumo y hogares favoritos.
  - Usa `DashboardHeader`, `DashboardTabs`, `DashboardToolbar`, `EnergySummaryCard`, `HomeWidgetCard`, `EmptyDashboard`.
  - La pestaña `Hogares` y botones de acción navegan a `/ (tabs)/homes`.
  - `onProfilePress` va a `/profile`.
- `homes.tsx` (Hogares)
  - Administra hogares y dispositivos con estado global de `SmartHomeProvider`.
  - Permite crear hogares y dispositivos.
  - Ofrece vista de lista de hogares y detalle del hogar activo.
  - Usa `setActiveHomeId`, `toggleDevice`, `toggleHomeFavorite`.
- `reports.tsx` (Reportes)
  - Presenta análisis de consumo y filtros.
  - No navega fuera del tab, pero puede mostrar alertas de descarga.
- `profile.tsx` (Perfil)
  - Muestra información del usuario, idioma y modo offline.
  - Navega a `settings` y `homes`.
  - Llama a `router.replace('/welcome')` al cerrar sesión o desactivar cuenta.
- `settings.tsx` (Configuración)
  - Ajusta tema, cuenta e integraciones.
  - Usa `SettingsSectionCard`, `SettingsActionRow`, `ThemeModeSelector`.
  - Permite volver con `router.back()`.

## Resumen del flujo de pantalla

1. `app/_layout.tsx` arranca en `welcome`.
2. Desde `welcome` el usuario puede ir a `login`, `register` o iniciar demo social.
3. `login` lleva a `(tabs)` en caso de éxito.
4. `register` regresa a `login` tras registro.
5. `forgot-password` → `otp-verification` → `new-password` → `login`.
6. `(tabs)` expone `index`, `homes`, `reports`, `profile`; `settings` existe como ruta auxiliar.
7. `Dashboard` y `Profile` pueden abrir `homes` y `settings`.

## Conceptos clave

- `router.replace('/(tabs)')` asegura que la pantalla de login no quede en el historial tras entrar.
- `HapticTab` añade feedback táctil sin afectar la navegación.
- El contexto global de la app vive en `lib/context/smart-home-context.tsx`.
- Los `Stack.Screen` en `app/_layout.tsx` controlan el orden y visibilidad de las pantallas fuera de tabs.

## Archivo recomendado
- `docs/PROJECT_DOCUMENTATION.md` ahora referencia este archivo como guía de navegación.
