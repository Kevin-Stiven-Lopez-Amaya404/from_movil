# Estructura del Proyecto Smart Home

## 📋 Descripción General

Aplicación móvil desarrollada con **Expo Router** y **React Native** para gestionar hogares inteligentes, dispositivos asociados, reportes energéticos, perfil y configuración.

**Versión:** 1.0.0  
**Framework:** React Native 0.81.5  
**Expo:** ~54.0.36  
**TypeScript:** ~5.9.2

---

## 📁 Estructura del Proyecto

```
from_movil/
├── app/                                  # Pantallas y routing (Expo Router)
│   ├── _layout.tsx                      # Layout raíz de la aplicación
│   ├── index.tsx                        # Pantalla de bienvenida/inicio
│   ├── login.tsx                        # Pantalla de login
│   ├── register.tsx                     # Pantalla de registro
│   ├── welcome.tsx                      # Pantalla de bienvenida
│   ├── forgot-password.tsx              # Pantalla de recuperar contraseña
│   ├── new-password.tsx                 # Pantalla de nueva contraseña
│   ├── otp-verification.tsx             # Pantalla de verificación OTP
│   ├── README_PANTALLAS.md              # Documentación de pantallas
│   └── (tabs)/                          # Grupo de pantallas con pestañas
│       ├── _layout.tsx                  # Layout de pestañas
│       ├── index.tsx                    # Pantalla principal de pestañas
│       ├── homes.tsx                    # Pantalla de hogares
│       ├── profile.tsx                  # Pantalla de perfil
│       ├── reports.tsx                  # Pantalla de reportes
│       ├── settings.tsx                 # Pantalla de configuración
│       └── README_PANTALLAS.md          # Documentación de pantallas tabuladas
│
├── components/                           # Componentes reutilizables
│   ├── auth/                            # Componentes de autenticación
│   │   ├── AuthCheckboxRow.tsx          # Fila de checkbox personalizada
│   │   ├── AuthScreenLayout.tsx         # Layout base para pantallas de auth
│   │   ├── AuthTextField.tsx            # Campo de texto de autenticación
│   │   ├── FormErrorText.tsx            # Componente de error de formulario
│   │   └── PrimaryButton.tsx            # Botón primario
│   │
│   ├── common/                          # Componentes comunes
│   │   ├── BackButton.tsx               # Botón de retroceso
│   │   ├── SmartHomeLogo.tsx            # Logo de la aplicación
│   │   └── SplashAnimation.tsx          # Animación de splash screen
│   │
│   ├── dashboard/                       # Componentes del dashboard
│   │   ├── DashboardHeader.tsx          # Encabezado del dashboard
│   │   ├── DashboardTabs.tsx            # Pestañas del dashboard
│   │   ├── DashboardToolbar.tsx         # Barra de herramientas
│   │   ├── EmptyDashboard.tsx           # Estado vacío del dashboard
│   │   ├── EnergySummaryCard.tsx        # Tarjeta de resumen energético
│   │   ├── HomeWidgetCard.tsx           # Tarjeta de widget del hogar
│   │   └── .gitkeep
│   │
│   ├── homes/                           # Componentes de gestión de hogares
│   │   ├── AddNameRow.tsx               # Fila para agregar nombre
│   │   ├── DeviceListItem.tsx           # Item de dispositivo en lista
│   │   ├── HomeHeroCard.tsx             # Tarjeta hero del hogar
│   │   └── HomeListItem.tsx             # Item de hogar en lista
│   │
│   ├── icons/                           # Componentes de iconos personalizados
│   │   ├── CheckIcon.tsx                # Icono de verificación
│   │   └── GoogleIcon.tsx               # Icono de Google
│   │
│   ├── navigation/                      # Componentes de navegación
│   │   └── HapticTab.tsx                # Tab con feedback háptico
│   │
│   ├── profile/                         # Componentes de perfil
│   │   ├── ProfileMenuItem.tsx          # Item de menú del perfil
│   │   ├── ProfileModule.tsx            # Módulo de perfil
│   │   ├── ProfileSectionHeader.tsx     # Encabezado de sección
│   │   └── profileTheme.ts              # Tema específico del perfil
│   │
│   ├── reports/                         # Componentes de reportes
│   │   └── (vacío - componentes a agregar)
│   │
│   ├── settings/                        # Componentes de configuración
│   │   ├── SettingsActionRow.tsx        # Fila de acción en configuración
│   │   ├── SettingsSectionCard.tsx      # Tarjeta de sección
│   │   └── ThemeModeSelector.tsx        # Selector de modo de tema
│   │
│   └── ui/                              # Componentes UI genéricos
│       ├── FilterChip.tsx               # Chip filtrable
│       ├── HorizontalFilterTabs.tsx     # Pestañas filtros horizontales
│       └── SegmentedControl.tsx         # Control segmentado
│
├── lib/                                  # Lógica de negocio y utilidades
│   ├── api/                             # Cliente API y manejo de errores
│   │   ├── api-client.ts                # Cliente HTTP configurado
│   │   └── api-error.ts                 # Manejo de errores de API
│   │
│   ├── auth/                            # Autenticación
│   │   └── auth-store.ts                # Store/estado de autenticación
│   │
│   ├── config/                          # Configuración
│   │   └── api-config.ts                # Configuración de endpoints API
│   │
│   ├── context/                         # Context API
│   │   └── smart-home-context.tsx       # Contexto global de Smart Home
│   │
│   ├── i18n/                            # Internacionalización
│   │   └── i18n.ts                      # Configuración de idiomas
│   │
│   ├── responsive/                      # Utilidades responsivas
│   │   └── responsive.ts                # Helpers para diseño responsivo
│   │
│   ├── services/                        # Servicios de negocio
│   │   ├── auth-service.ts              # Servicio de autenticación
│   │   └── smart-home-service.ts        # Servicio de Smart Home
│   │
│   ├── theme/                           # Temas y estilos globales
│   │   ├── app-theme.ts                 # Tema principal
│   │   ├── appearance.ts                # Configuración de apariencia
│   │   └── typography.ts                # Estilos tipográficos
│   │
│   └── utils/                           # Funciones utilitarias
│       ├── formatters.ts                # Formatters de datos
│       └── validators.ts                # Validadores de formularios
│
├── assets/                               # Recursos estáticos
│   └── images/                          # Imágenes de la aplicación
│
├── constants/                            # Constantes globales
│   └── theme.ts                         # Constantes de tema
│
├── hooks/                                # Custom Hooks de React
│   ├── use-color-scheme.ts              # Hook para esquema de colores
│   ├── use-color-scheme.web.ts          # Versión web del hook
│   └── use-theme-color.ts               # Hook para color de tema
│
├── styles/                               # Estilos globales/específicos
│   └── login.styles.ts                  # Estilos de pantalla de login
│
├── scripts/                              # Scripts de utilidad
│   └── reset-project.js                 # Script para resetear el proyecto
│
├── docs/                                 # Documentación del proyecto
│   ├── README.md                        # Índice de documentación
│   ├── DOCUMENTACION_PROYECTO_SMART_HOME.md
│   ├── DOCUMENTACION_CODIGO_PANTALLAS_SMART_HOME.md
│   ├── FLUJO_USUARIO.md                 # Flujo del usuario
│   ├── FLUJO_FINAL.md                   # Flujo final del proyecto
│   ├── GUIA_RAPIDA.md                   # Guía rápida
│   ├── PROJECT_DOCUMENTATION.md
│   ├── PROJECT_FLOW.md
│   ├── BACKEND_CONNECTION.md            # Conexión con backend
│   ├── RESUMEN.md                       # Resumen del proyecto
│   └── components/                      # Documentación de componentes
│       ├── common.md
│       ├── dashboard.md
│       ├── homes.md
│       ├── icons.md
│       ├── navigation.md
│       ├── profile.md
│       ├── settings.md
│       └── README.md
│
├── .env.example                         # Ejemplo de variables de entorno
├── .expo/                               # Configuración de Expo
├── .git/                                # Control de versiones Git
├── .gitignore                           # Archivos ignorados por Git
├── .vscode/                             # Configuración de VS Code
├── node_modules/                        # Dependencias instaladas
├── app.json                             # Configuración de la aplicación
├── babel.config.js                      # Configuración de Babel
├── eslint.config.js                     # Configuración de ESLint
├── package.json                         # Dependencias y scripts
├── package-lock.json                    # Lock file de dependencias
├── tsconfig.json                        # Configuración de TypeScript
└── README.md                            # Readme principal del proyecto
```

---

## 🛠️ Tech Stack

### Dependencias Principales

| Librería | Versión | Propósito |
|----------|---------|----------|
| **React** | 19.1.0 | Framework UI |
| **React Native** | 0.81.5 | Framework móvil |
| **Expo** | ~54.0.36 | Plataforma para React Native |
| **Expo Router** | ~6.0.24 | Routing y navegación |
| **TypeScript** | ~5.9.2 | Tipado estático |
| **React Navigation** | ^7.1.8 | Navegación |
| **React Native Reanimated** | ~4.1.1 | Animaciones |
| **React Native Gesture Handler** | ~2.28.0 | Manejo de gestos |

### DevDependencies

- ESLint (~9.25.0) - Linting
- Babel (~54.0.10) - Transpilación
- TypeScript (~5.9.2) - Tipado

---

## 📱 Pantallas Principales

### Flujo de Autenticación
1. **Welcome** - Pantalla de bienvenida
2. **Login** - Inicio de sesión
3. **Register** - Registro de nuevo usuario
4. **Forgot Password** - Recuperación de contraseña
5. **OTP Verification** - Verificación de código OTP
6. **New Password** - Establecer nueva contraseña

### Pantallas Principales (Con Pestañas)
1. **Homes** - Gestión de hogares y dispositivos
2. **Reports** - Reportes energéticos
3. **Profile** - Perfil del usuario
4. **Settings** - Configuración de la aplicación

---

## 🔄 Scripts Disponibles

```bash
# Instalar dependencias
npm install

# Iniciar desarrollo
npm run start

# Desarrollo con LAN
npm run start:lan

# Desarrollo con tunnel
npm run start:tunnel

# Iniciar en Android
npm run android

# Iniciar en iOS
npm run ios

# Iniciar versión web
npm run web

# Linting
npm run lint

# Reset del proyecto
npm run reset-project

# Verificar tipos TypeScript
npx tsc --noEmit
```

---

## 📚 Estructura de Componentes

### Patrones de Componentes

#### Componentes de Autenticación
- Reutilizables en múltiples pantallas de auth
- Incluyen validación integrada
- Manejo de errores consistente

#### Componentes del Dashboard
- Tarjetas y widgets reutilizables
- Soporte para estado vacío
- Responsivos a diferentes tamaños

#### Componentes de Perfil
- Sistema modular
- Tema personalizado
- Estructurado en secciones

#### Componentes UI
- Controles reutilizables
- Filtros y chips
- Controles segmentados

---

## 🔐 Autenticación

- **AuthService** - Manejo de login/registro
- **AuthStore** - Estado de autenticación
- **API Client** - Cliente HTTP configurado
- **Validadores** - Validación de formularios

---

## 🎨 Tema y Estilos

- **App Theme** - Tema principal de la aplicación
- **Appearance** - Configuración de apariencia (claro/oscuro)
- **Typography** - Sistema tipográfico
- **Color Scheme Hook** - Hook para esquema de colores dinámico

---

## 📋 Documentación Disponible

La documentación completa se encuentra en la carpeta `docs/`:

- `DOCUMENTACION_PROYECTO_SMART_HOME.md` - Documentación técnica completa
- `DOCUMENTACION_CODIGO_PANTALLAS_SMART_HOME.md` - Documentación de código de pantallas
- `FLUJO_USUARIO.md` - Flujo de usuario
- `FLUJO_FINAL.md` - Flujo final del sistema
- `GUIA_RAPIDA.md` - Guía de inicio rápido
- `RESUMEN.md` - Resumen del proyecto
- `BACKEND_CONNECTION.md` - Guía de conexión con backend

---

## 🚀 Primeros Pasos

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar variables de entorno:**
   - Copiar `.env.example` a `.env`
   - Actualizar con tus valores

3. **Ejecutar en desarrollo:**
   ```bash
   npm run start
   ```

4. **Seleccionar plataforma:**
   - `a` para Android
   - `i` para iOS
   - `w` para Web

---

## 📖 Notas Importantes

- El proyecto utiliza **Expo Router** para navegación basada en archivos
- TypeScript está configurado para máxima seguridad de tipos
- Componentes organizados por funcionalidad
- Servicios centralizados para API y autenticación
- Sistema de temas soporta modo oscuro
- Soporte para internacionalización (i18n)

---

**Última actualización:** 2024


Archivos a modificar:
components/dashboard/DashboardHeader.tsx (reescribir con tema)

components/dashboard/EmptyDashboard.tsx (reescribir con tema y nuevo mensaje)

app/(tabs)/index.tsx (reescribir completamente)

lib/context/smart-home-context.tsx (actualizar tipo SmartDevice y datos iniciales)

Archivos a eliminar:
components/dashboard/DashboardTabs.tsx

components/dashboard/DashboardToolbar.tsx

Archivos a crear:
components/dashboard/CurrentConsumptionCard.tsx

components/dashboard/EnergyAccumulatedCard.tsx

components/dashboard/ActiveDevicesCard.tsx

components/dashboard/ConsumptionChartCard.tsx

components/dashboard/HomeSummaryCard.tsx

