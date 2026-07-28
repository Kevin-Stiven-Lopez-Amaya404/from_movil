# Documentación del proyecto Smart Home

Resumen breve
- Proyecto móvil/web usando Expo + Expo Router; interfaz en React Native + TypeScript.

Cómo ejecutar (desarrollo)
- Instalar dependencias: `npm install` o `yarn`.
- Iniciar Metro/Expo: `npm run start`.
- Comandos útiles: `npm run android`, `npm run ios`, `npm run web`.

Dependencias principales
- Expo: versión especificada en [package.json](package.json)
- React: 19.x
- React Native: 0.81.x
- Navegación: `@react-navigation/native`, `@react-navigation/bottom-tabs`
- Utilidades Expo: `expo-constants`, `expo-font`, `expo-haptics`, `expo-image`, `expo-router`, `expo-splash-screen`, etc.
- Otras: `react-native-reanimated`, `react-native-gesture-handler`, `react-native-svg`.

Estructura clave del repositorio
- `app/` : pantallas y rutas (Expo Router). Ejemplos: [app/login.tsx](app/login.tsx), [app/_layout.tsx](app/_layout.tsx)
- `components/` : componentes reutilizables por dominio (dashboard, homes, profile, common, icons, settings)
- `hooks/` : hooks personalizados (p. ej. `use-color-scheme.ts`)
- `lib/` : lógica de app (auth, i18n, theme, responsive, utils)
- `assets/` : imágenes y recursos estáticos
- `scripts/` : utilidades de mantenimiento (p. ej. `scripts/reset-project.js`)

Páginas / Pantallas (carpeta `app/`)
- login.tsx : inicio de sesión
- register.tsx : registro de usuario
- welcome.tsx : pantalla de bienvenida
- forgot-password.tsx, new-password.tsx, otp-verification.tsx : flujo de recuperación/OTP
- `app/(tabs)/` : área principal con pestañas: homes, index, profile, reports, settings

Componentes (resumen por carpeta `components/`)
- `docs/components/README.md` : índice de documentación por carpeta
- common/
  - BackButton.tsx : control de navegación hacia atrás
  - SmartHomeLogo.tsx, SplashAnimation.tsx : branding / animación de splash
- dashboard/
  - DashboardHeader.tsx, DashboardTabs.tsx, DashboardToolbar.tsx
  - HomeWidgetCard.tsx, EnergySummaryCard.tsx, EmptyDashboard.tsx
- homes/
  - HomeHeroCard.tsx, HomeListItem.tsx, DeviceListItem.tsx, AddNameRow.tsx
- profile/
  - ProfileModule.tsx, ProfileMenuItem.tsx, ProfileSectionHeader.tsx
- settings/
  - SettingsActionRow.tsx, SettingsSectionCard.tsx, ThemeModeSelector.tsx
- navigation/
  - HapticTab.tsx : pestañas con feedback háptico
- icons/
  - GoogleIcon.tsx, CheckIcon.tsx

Hooks
- `hooks/use-color-scheme.ts`, `hooks/use-color-scheme.web.ts` : detectar esquema de color
- `hooks/use-theme-color.ts` : integrar colores del tema

Lógica y utilidades internas (`lib/`)
- `lib/auth/auth-store.ts` : estado / persistencia de autenticación
- `lib/i18n/i18n.ts` : configuración de internacionalización
- `lib/theme/app-theme.ts`, `lib/theme/appearance.ts` : temas y apariencia
- `lib/responsive/responsive.ts` : helpers de diseño responsivo
- `lib/utils/formatters.ts`, `lib/utils/validators.ts` : formateo y validaciones

Scripts
- `scripts/reset-project.js` : script de limpieza/reset del proyecto (revisar si usar con cuidado)

Notas importantes
- El router principal está en `app/_layout.tsx` y `app/(tabs)/_layout.tsx` — revisar para entender navegación global.
- Las dependencias y versiones están en [package.json](package.json). Actualizar ahí y ejecutar `npm install`.

Siguientes pasos sugeridos (puedo hacerlos)
- Documentar las props y ejemplos de uso de cada componente (`components/`) en fichas individuales.
- Añadir diagramas de navegación y flujo de pantallas.
- Generar un `README` más detallado con pasos de despliegue y testing.

Guías nuevas:
- [Documentación de componentes](docs/components/README.md)
- [Flujo de navegación](docs/PROJECT_FLOW.md)

Si quieres, ahora puedo:
- Generar documentación detallada por componente.
- Añadir comentarios JSDoc/TSdoc en los componentes más importantes.

---
Documento generado automáticamente: lista de archivos escaneados para resumen.
