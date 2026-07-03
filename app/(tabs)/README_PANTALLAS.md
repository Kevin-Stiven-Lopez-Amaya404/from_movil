# Documentación de pantallas - Carpeta `app/(tabs)`

Esta carpeta contiene las pantallas principales que el usuario ve después de iniciar sesión. Se manejan mediante una navegación inferior tipo tabs.

Pantallas incluidas:

1. Dashboard.
2. Hogares.
3. Reportes.
4. Perfil.
5. Configuración.
6. Layout de tabs.

---

## `app/(tabs)/_layout.tsx`

### Objetivo del archivo

Configurar la navegación inferior de la aplicación después del login.

### Qué hace

- Define las pestañas principales.
- Muestra iconos por pantalla.
- Cambia títulos según idioma.
- Cambia colores según tema claro/oscuro.
- Ajusta la altura del tabbar según el margen seguro inferior del dispositivo.
- Oculta la pantalla `settings` del tabbar.

### Bloques importantes

#### Estado global

```tsx
const { colorMode } = useSmartHome();
const theme = useAppTheme();
const { t } = useTranslation();
const insets = useSafeAreaInsets();
```

Estos hooks permiten que el tabbar sea dinámico:

- `colorMode`: sabe si está claro u oscuro.
- `theme`: obtiene colores actuales.
- `t`: traduce títulos.
- `insets`: respeta barra inferior de Android/iPhone.

#### Tabs

Cada `Tabs.Screen` representa una pestaña. Por ejemplo:

- `index`: Dashboard.
- `devices`: Hogares.
- `reports`: Reportes.
- `profile`: Perfil.
- `settings`: oculta con `href: null`.

### Buenas prácticas

- Centraliza navegación de pestañas.
- Usa safe area para evitar que el tabbar choque con la barra inferior.
- Usa traducciones.
- Usa tema global.

### Cómo explicarlo en examen

> Este archivo configura la navegación principal después del login. Define las pestañas, sus iconos y estilos. También adapta la altura de la barra inferior usando `useSafeAreaInsets`, lo cual permite que se vea bien en Android y iPhone.

---

## `app/(tabs)/index.tsx`

### Nombre de la pantalla

Dashboard.

### Objetivo

Mostrar una vista rápida del consumo actual, dispositivos activos y hogares favoritos.

### Flujo de funcionamiento

1. El usuario entra después del login.
2. La pantalla lee hogares y dispositivos desde el contexto.
3. Filtra los dispositivos encendidos.
4. Calcula consumo total actual.
5. Busca hogares favoritos.
6. Muestra tarjetas de hogares.
7. Al tocar un hogar, lo selecciona y navega a Hogares.

### Bloques importantes

#### Lectura de contexto

```tsx
const { devices, homes, sessionName, setActiveHomeId } = useSmartHome();
```

Esto permite que el dashboard use datos globales sin recibir props.

#### Cálculo de dispositivos activos

```tsx
const onlineDevices = devices.filter((device) => device.online);
```

Filtra solo dispositivos encendidos.

#### Consumo actual

```tsx
const currentConsumption = onlineDevices.reduce(
  (total, device) => total + device.consumption,
  0,
);
```

Suma el consumo de todos los dispositivos activos.

#### Hogares favoritos

```tsx
const favoriteHomes = homes.filter((home) => home.favorite);
const dashboardHomes = favoriteHomes.length ? favoriteHomes : homes.slice(0, 1);
```

Si hay favoritos, los muestra. Si no hay, muestra el primer hogar.

### Funciones

| Función | Explicación |
|---|---|
| `showNotifications` | Busca un dispositivo crítico y muestra alerta. |
| `router.push("/profile")` | Abre perfil. |
| `router.push("/devices")` | Abre hogares. |
| `router.push("/reports")` | Abre reportes. |

### Variables importantes

| Variable | Propósito |
|---|---|
| `onlineDevices` | Dispositivos encendidos. |
| `currentConsumption` | Consumo actual total. |
| `favoriteHomes` | Hogares favoritos. |
| `dashboardHomes` | Hogares visibles en dashboard. |

### Estados y lógica

No usa estados locales. La pantalla muestra datos derivados del contexto. Esto es bueno porque evita duplicar información.

### Conexión con otras capas

- `smart-home-context`: datos.
- `formatters`: formatea kWh.
- `app-theme`: tema.
- `responsive`: márgenes y ancho.

### Posibles mejoras

- Corregir caracteres dañados en textos.
- Traducir textos restantes con `i18n`.
- Cambiar alertas por notificaciones reales.
- Crear componente para tarjeta de hogar.

### Cómo explicarlo en examen

> El dashboard no guarda datos propios. Toma hogares y dispositivos desde el contexto, calcula los dispositivos encendidos y suma su consumo. También muestra los hogares favoritos como accesos rápidos. Esto demuestra cómo una pantalla puede mostrar información derivada del estado global.

---

## `app/(tabs)/devices.tsx`

### Nombre de la pantalla

Hogares.

### Objetivo

Administrar hogares y dispositivos. La regla principal es que un hogar puede tener varios dispositivos, y cada dispositivo pertenece a un hogar.

### Flujo de funcionamiento

1. La pantalla inicia mostrando hogares.
2. El usuario puede registrar un hogar.
3. Puede marcar un hogar como favorito.
4. Al tocar un hogar, entra al detalle.
5. Dentro del hogar puede registrar dispositivos.
6. Puede encender o apagar dispositivos.
7. Puede apagar todos los dispositivos del hogar.
8. Puede volver a la lista de hogares.

### Bloques importantes

#### Contexto global

```tsx
const {
  activeHomeId,
  addDeviceToHome,
  addHome,
  devices,
  homes,
  setActiveHomeId,
  setDeviceOnline,
  toggleDevice,
  toggleHomeFavorite,
} = useSmartHome();
```

La pantalla usa acciones globales para crear hogares, crear dispositivos y cambiar estados.

#### Estados locales

```tsx
const [homeName, setHomeName] = useState("");
const [deviceName, setDeviceName] = useState("");
const [openedHomeId, setOpenedHomeId] = useState<string | null>(null);
const [selectedId, setSelectedId] = useState("");
```

Estos estados controlan:

- Texto del nuevo hogar.
- Texto del nuevo dispositivo.
- Hogar abierto.
- Dispositivo seleccionado.

#### Hogar activo

```tsx
const selectedHome = homes.find((home) => home.id === activeHomeId) ?? homes[0];
const openedHome = homes.find((home) => home.id === openedHomeId) ?? null;
const activeHome = openedHome ?? selectedHome;
```

Esta lógica decide qué hogar se está usando.

#### Dispositivos del hogar

```tsx
const homeDevices = useMemo(
  () => (activeHome ? devices.filter((device) => device.homeId === activeHome.id) : []),
  [activeHome, devices],
);
```

Filtra los dispositivos que pertenecen al hogar abierto. Esta es la parte más importante de la pantalla.

### Funciones

| Función | Explicación |
|---|---|
| `openHome(homeId)` | Selecciona un hogar y abre su detalle. |
| `handleAddHome()` | Valida y registra un hogar. |
| `handleAddDevice()` | Valida y registra dispositivo dentro del hogar activo. |
| `turnOffHome()` | Apaga todos los dispositivos del hogar actual. |
| `renderHomeList()` | Renderiza lista de hogares. |
| `renderHomeDetail()` | Renderiza detalle de un hogar y sus dispositivos. |

### Estados y lógica de negocio

La lógica principal está en la relación:

```text
Hogar 1 ---- N Dispositivos
```

Cada dispositivo tiene `homeId`, por eso no aparece de forma aislada.

### Componentes utilizados

- `TextInput`: entrada de nombres.
- `Switch`: encendido/apagado.
- `Pressable`: botones y tarjetas.
- `Ionicons` y `MaterialCommunityIcons`: iconos.
- `SafeAreaView`: margen seguro.

### Navegación

Es una pestaña principal. Puede abrirse desde dashboard, perfil o tabbar.

### Conexión con otras capas

- `smart-home-context`: datos y acciones.
- `formatters`: formato de dinero.
- `app-theme`: tema.
- `responsive`: adaptación móvil.

### Buenas prácticas

- Divide visualmente en `renderHomeList` y `renderHomeDetail`.
- Usa `useMemo` para filtrar dispositivos.
- Valida campos antes de crear.
- Respeta la relación hogar-dispositivo.

### Posibles mejoras

- Extraer tarjetas a componentes.
- Agregar editar/eliminar hogar.
- Agregar editar/eliminar dispositivo.
- Persistir datos.

### Cómo explicarlo en examen

> Esta pantalla representa la lógica principal del proyecto. Primero muestra hogares, y al entrar a uno filtra los dispositivos por `homeId`. Eso garantiza que cada dispositivo pertenezca a un hogar. Además permite crear hogares, agregar dispositivos, activar o apagar dispositivos y marcar hogares favoritos.

---

## `app/(tabs)/reports.tsx`

### Nombre de la pantalla

Reportes.

### Objetivo

Mostrar consumo energético simulado en diferentes vistas: tiempo real, historial, mensual y tarifa.

### Flujo de funcionamiento

1. Lee dispositivos y reportes desde contexto.
2. Muestra tabs internas.
3. Según la vista activa, muestra contenido distinto.
4. Permite cambiar rango.
5. Permite filtrar por categoría.
6. Calcula datos filtrados y total.
7. Muestra gráfica y resumen.

### Bloques importantes

#### Configuración de vistas

```tsx
const ranges: ReportRange[] = ["Diario", "Semana", "Mes", "Rango"];
const filters = ["Todos", "Iluminacion", "Climatizacion", "Electrodomesticos"];
const reportViews = ["Tiempo real", "Historial", "Mensual", "Tarifa"];
```

Define opciones disponibles.

#### Estados

```tsx
const [activeView, setActiveView] = useState<ReportView>("Tiempo real");
const [activeRange, setActiveRange] = useState<ReportRange>("Semana");
const [activeFilter, setActiveFilter] = useState<"Todos" | DeviceCategory>("Todos");
```

Controlan qué se está viendo y cómo se filtra.

#### Multiplicador por categoría

```tsx
const multiplier = useMemo(() => { ... }, [activeFilter, devices]);
```

Calcula cuánto representa una categoría frente al consumo total. Es una simulación para ajustar los datos del reporte.

#### Datos calculados

- `filteredPoints`: puntos de gráfico ajustados.
- `maxValue`: valor máximo para escalar gráfica.
- `total`: consumo total.
- `trend`: tendencia frente a periodo anterior.
- `realTimeConsumption`: consumo actual de dispositivos encendidos.

### Funciones

| Función | Explicación |
|---|---|
| `downloadReport()` | Simula descarga mostrando alerta. |
| `setActiveView` | Cambia vista. |
| `setActiveRange` | Cambia rango. |
| `setActiveFilter` | Cambia filtro. |

### Conexión con otras capas

- `smart-home-context`: obtiene `devices` y `reportData`.
- `app-theme`: tema.
- `responsive`: diseño responsive.

### Buenas prácticas

- Usa estados independientes para vista, rango y filtro.
- Usa `useMemo` para cálculos.
- No modifica datos globales, solo los interpreta.

### Posibles mejoras

- Usar una librería de gráficos.
- Implementar descarga real.
- Conectar reportes a backend.
- Corregir caracteres dañados.

### Cómo explicarlo en examen

> Reportes toma datos simulados del contexto y permite visualizarlos de diferentes formas. La pantalla maneja estados para saber qué vista, rango y filtro están activos. Luego calcula puntos, totales y tendencias para mostrar el análisis energético.

---

## `app/(tabs)/profile.tsx`

### Nombre de la pantalla

Perfil.

### Objetivo

Centralizar información del usuario, preferencias, módulos de cuenta, auditoría, restauración y cierre de sesión.

### Flujo de funcionamiento

1. Lee datos globales del usuario.
2. Muestra avatar, nombre y dispositivos activos.
3. Muestra módulos organizados.
4. Permite ir a hogares o configuración.
5. Permite cambiar idioma.
6. Permite activar modo sin conexión.
7. Permite ver auditoría.
8. Permite restaurar preferencias.
9. Permite desactivar cuenta o cerrar sesión.

### Bloques importantes

#### Idiomas

```tsx
const languages = [
  { code: "es", label: "Español" },
  { code: "en", label: "English" },
  { code: "pt", label: "Português" },
];
```

Define idiomas disponibles.

#### Contexto global

```tsx
const {
  activeDevices,
  deactivateAccount,
  devices,
  homes,
  language,
  offlineMode,
  sessionName,
  setLanguage,
  setOfflineMode,
} = useSmartHome();
```

Perfil modifica preferencias globales, por eso usa contexto.

#### Cálculos

```tsx
const alerts = activeDevices.filter((device) => !device.verified).length;
const onlineDevices = devices.filter((device) => device.online).length;
```

Calcula alertas y dispositivos activos.

### Funciones

| Función | Explicación |
|---|---|
| `showComingSoon` | Muestra alerta para módulos preparados. |
| `confirmLogout` | Confirma cierre de sesión. |
| `confirmDeactivation` | Confirma desactivación de cuenta. |
| `showAuditDetail` | Muestra auditoría simulada. |
| `confirmRestoreData` | Restaura idioma y modo offline. |

### Componentes utilizados

- `ProfileModule`: cápsula visual de módulo.
- `ProfileMenuItem`: fila de acción.
- `ProfileSectionHeader`: encabezado de sección.
- `Switch`: modo sin conexión.

### Conexión con otras capas

- `smart-home-context`: datos y acciones.
- `i18n`: traducción.
- `app-theme`: tema.
- `responsive`: layout.

### Buenas prácticas

- Componentes de perfil separados.
- Acciones destructivas con confirmación.
- Preferencias globales en contexto.
- Traducciones centralizadas.

### Posibles mejoras

- Crear pantalla real de auditoría.
- Crear pantalla real de ayuda.
- Persistir idioma/modo offline.

### Cómo explicarlo en examen

> Perfil agrupa las opciones del usuario. Está separado en módulos reutilizables para que no sea una pantalla desordenada. Usa contexto para cambiar idioma, modo offline, desactivar cuenta y cerrar sesión.

---

## `app/(tabs)/settings.tsx`

### Nombre de la pantalla

Configuración.

### Objetivo

Permitir configurar cuenta, tema visual, integraciones de voz simuladas y desactivación de cuenta.

### Flujo de funcionamiento

1. El usuario entra desde perfil.
2. Puede volver atrás.
3. Ve datos de cuenta.
4. Puede cambiar tema claro/oscuro.
5. Puede revisar integraciones de voz.
6. Puede desactivar cuenta.

### Bloques importantes

#### Integraciones

```tsx
const voiceIntegrations = [
  {
    descriptionKey: "settings.voiceAssistantDescription",
    icon: "mic-outline",
    titleKey: "settings.voiceAssistant",
  },
  ...
];
```

Permite renderizar integraciones desde un arreglo. Esto evita repetir JSX.

#### Hooks principales

```tsx
const theme = useAppTheme();
const { t } = useTranslation();
const { colorMode, deactivateAccount, sessionName, setColorMode } = useSmartHome();
```

La pantalla depende de:

- Tema.
- Traducción.
- Estado global.

### Funciones

| Función | Explicación |
|---|---|
| `showPending` | Muestra que una integración está preparada. |
| `confirmDeactivation` | Desactiva cuenta después de confirmar. |
| `setColorMode` | Cambia el tema global. |

### Conexión con otras capas

- `smart-home-context`: tema, sesión y cuenta.
- `i18n`: textos.
- `app-theme`: colores.
- `responsive`: márgenes.

### Buenas prácticas

- Usa arreglo para integraciones.
- No ejecuta desactivación sin confirmación.
- Usa tema e idioma global.

### Posibles mejoras

- Crear integración real con Alexa o asistentes.
- Persistir tema.
- Separar cards en componentes si crece.

### Cómo explicarlo en examen

> Configuración permite cambiar valores globales de la app, especialmente el tema claro u oscuro. No usa estado local porque esas opciones afectan a toda la aplicación. También muestra integraciones preparadas y permite desactivar la cuenta con confirmación.

