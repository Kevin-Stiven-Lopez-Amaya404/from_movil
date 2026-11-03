# Auditoría de componentes candidatos — Fase 2

**Rama:** `fix/audit-ui-phase`
**Revisión del código:** `5a5d0e3` (`refactor(ui): add shared components`)
**Alcance:** auditoría del punto 4. No se eliminó ni modificó ningún componente.

## Método

- Se comprobó cada nombre en `app/`, `components/` y `scripts/`, distinguiendo la definición del componente de sus consumidores.
- Se comprobó si existe un archivo compañero `<Componente>.styles.ts` en la misma carpeta.
- Se buscaron menciones en Markdown bajo `docs/` y `scripts/`. Se excluyó `docs/auditoria/inventario-colores.md`, que contiene rutas del inventario, no documentación funcional de estos componentes.
- No se encontraron referencias a estos nombres en `scripts/`.

## Dashboard

| Archivo | Qué hace | Uso actual / utilidad | Compañero de estilos | Menciones en docs |
| --- | --- | --- | --- | --- |
| `components/dashboard/ActiveDevicesCard.tsx` | Muestra hasta cuatro dispositivos en línea, encendidos y con consumo; permite abrir uno o verlos todos. | Sin consumidor de pantalla. No participa en el dashboard actual; candidato a reutilización o retiro futuro. | Sí | — |
| `components/dashboard/ConsumptionChartCard.tsx` | Presenta el título de consumo reciente y un marcador provisional de gráfico. | Sin consumidor. El contenido indica que el gráfico todavía no está implementado; candidato a retirar o completar si se retoma. | No; estilos internos | — |
| `components/dashboard/CurrentConsumptionCard.tsx` | Presenta potencia actual y estado activo/apagado. | Sin consumidor; candidato a reutilización o retiro futuro. | Sí | — |
| `components/dashboard/DashboardHeader.tsx` | Encabezado de marca y saludo, con accesos a notificaciones y perfil. | Sin consumidor; el dashboard actual compone su encabezado directamente. | Sí | `components/dashboard.md`, `PROJECT_DOCUMENTATION.md`, `PROJECT_FLOW.md` |
| `components/dashboard/EmptyDashboard.tsx` | Mensaje de estado vacío y acción para agregar un hogar. | Sin consumidor; el dashboard actual no usa este componente. | No; estilos internos | `components/dashboard.md`, `PROJECT_DOCUMENTATION.md`, `PROJECT_FLOW.md` |
| `components/dashboard/EnergyAccumulatedCard.tsx` | Muestra energía acumulada y comparación con el día anterior. | Sin consumidor; candidato a reutilización o retiro futuro. | Sí | — |
| `components/dashboard/EnergySummaryCard.tsx` | Resume consumo actual y cantidad de dispositivos activos. | Sin consumidor; candidato a reutilización o retiro futuro. | No; estilos internos | `components/dashboard.md`, `PROJECT_DOCUMENTATION.md`, `PROJECT_FLOW.md` |
| `components/dashboard/HomeConsumptionGoalCard.tsx` | Visualiza avance frente a una meta mensual y ofrece editarla. | Sin consumidor; candidato a reutilización o retiro futuro. | No; estilos internos | — |
| `components/dashboard/HomeWidgetCard.tsx` | Tarjeta navegable de hogar con consumo. | Sin consumidor; el dashboard actual usa `SummaryTile` y `NavigationRow`. | Sí | `components/dashboard.md`, `PROJECT_DOCUMENTATION.md`, `PROJECT_FLOW.md` |
| `components/dashboard/HommeSummaryCard.tsx` | Alias con el nombre mal escrito que reexporta `HomeSummaryCard` como export nombrado y predeterminado. | Nadie importa el alias. Su único efecto actual es exponer el otro archivo bajo una ruta alternativa; candidato a retiro si no existe compatibilidad externa. | No | — |
| `components/dashboard/HomeSummaryCard.tsx` | Tarjeta navegable con nombre del hogar, potencia y número de dispositivos. | No tiene consumidor de pantalla; solo lo reexporta el alias `HommeSummaryCard.tsx`. Candidato a reutilización o retiro futuro. | Sí | — |

## Hogares

| Archivo | Qué hace | Uso actual / utilidad | Compañero de estilos | Menciones en docs |
| --- | --- | --- | --- | --- |
| `components/homes/AddNameRow.tsx` | Campo de texto compacto con acción para confirmar un nombre. | Sin consumidor; candidato a reutilización o retiro futuro. | No; estilos internos | `components/homes.md`, `PROJECT_DOCUMENTATION.md` |
| `components/homes/DeviceListItem.tsx` | Fila de dispositivo con icono, información y controles de selección/estado. | Sin consumidor; la lista actual implementa las filas directamente. | Sí | `components/homes.md`, `PROJECT_DOCUMENTATION.md` |
| `components/homes/HomeHeroCard.tsx` | Tarjeta destacada genérica con título, valor, icono y contenido opcional. | Sin consumidor; candidato a reutilización o retiro futuro. | No; estilos internos | `components/homes.md`, `PROJECT_DOCUMENTATION.md` |
| `components/homes/HomeListItem.tsx` | Fila de hogar con ubicación, cantidad de dispositivos y acción de favorito. | Sin consumidor; la pantalla actual construye las filas directamente. | No; estilos internos | `components/homes.md`, `PROJECT_DOCUMENTATION.md` |

## Perfil

| Archivo | Qué hace | Uso actual / utilidad | Compañero de estilos | Menciones en docs |
| --- | --- | --- | --- | --- |
| `components/profile/ProfileMenuItem.tsx` | Fila de perfil con variantes simple, enmarcada y de menú; admite descripción, intención de peligro y chevron. | **Sí.** `profile.tsx` la usa para las filas del menú. Conservar. | Sí | `DOCUMENTACION_CODIGO_PANTALLAS_SMART_HOME.md`, `components/profile.md`, `PROJECT_DOCUMENTATION.md` |
| `components/profile/ProfileModule.tsx` | Agrupa contenido del perfil en una tarjeta con título y subtítulo opcional. | Sin consumidor; `profile.tsx` estructura sus secciones con `SettingsSectionCard`. Candidato a reutilización o retiro futuro. | No; estilos internos | `DOCUMENTACION_CODIGO_PANTALLAS_SMART_HOME.md`, `components/profile.md`, `PROJECT_DOCUMENTATION.md` |
| `components/profile/ProfileSectionHeader.tsx` | Encabezado de sección del perfil con icono, título, descripción y estado de peligro opcional. | Sin consumidor; candidato a reutilización o retiro futuro. | No; estilos internos | `DOCUMENTACION_CODIGO_PANTALLAS_SMART_HOME.md`, `components/profile.md`, `PROJECT_DOCUMENTATION.md` |
| `components/profile/ProfileShortcutCard.tsx` | Acceso rápido en forma de tarjeta con icono, título y descripción. | Sin consumidor ni menciones en documentación; candidato a reutilización o retiro futuro. | No; estilos internos | — |

## Otros

| Archivo | Qué hace | Uso actual / utilidad | Compañero de estilos | Menciones en docs |
| --- | --- | --- | --- | --- |
| `components/auth/FormErrorText.tsx` | Renderiza texto de error con el color de formulario del tema de acceso. | Sin consumidor; los formularios actuales muestran sus errores de otra manera. Candidato a reutilización o retiro futuro. | No; estilos internos | `ACTIVIDAD_IDENTIDAD_VISUAL_SMART_HOME.md` |
| `components/common/SmartHomeLogo.tsx` | Renderiza el PNG del logotipo en tamaño configurable. Sus props `showText` y `variant` están declaradas, pero no se usan en el render. | Sin consumidor. Puede servir si se centraliza el uso del logotipo; la API actual contiene props sin efecto. | No; estilos inline | `ACTIVIDAD_IDENTIDAD_VISUAL_SMART_HOME.md`, `DOCUMENTACION_CODIGO_PANTALLAS_SMART_HOME.md`, `components/common.md`, `PROJECT_DOCUMENTATION.md` |
| `components/devices/ConnectionMethodCard.tsx` | Tarjeta expandible para elegir un método de conexión, con estado deshabilitado y contenido opcional. | Sin consumidor; candidata a reutilización si vuelve a usarse un selector de conexión. | No; estilos internos | — |
| `components/navigation/HapticTab.tsx` | Envuelve el botón de pestaña de React Navigation y añade respuesta háptica en iOS. | Sin consumidor; la navegación actual usa `LiquidNavigation`. Solo sería útil si se configura este botón alternativo. | No | `components/navigation.md`, `PROJECT_DOCUMENTATION.md`, `PROJECT_FLOW.md` |
| `components/settings/SettingsActionRow.tsx` | Fila genérica de configuración con icono, textos y chevron opcional. | Sin consumidor; candidata a reutilización o retiro futuro. | No; estilos internos | `components/settings.md`, `PROJECT_DOCUMENTATION.md`, `PROJECT_FLOW.md` |
| `components/settings/SettingsSectionCard.tsx` | Agrupa filas bajo encabezado con icono y título, usando la paleta actual. | **Sí.** `profile.tsx` la usa para sus grupos. Conservar. | Sí | `components/settings.md`, `PROJECT_DOCUMENTATION.md`, `PROJECT_FLOW.md` |
| `components/ui/SegmentedControl.tsx` | Distribuye opciones con `FilterChip` o delega a `HorizontalFilterTabs` en pantallas estrechas. | Sin consumidor; útil como adaptador si se migra una pantalla a este control. No eliminar sin revisar si habrá reutilización en fases posteriores. | No; estilos internos | — |

## Resultado

- Hay **2 componentes con uso actual**: `ProfileMenuItem` y `SettingsSectionCard`; ambos se reutilizaron en el punto 3 y se conservan.
- Los demás componentes auditados no tienen consumidores actuales dentro de `app/`, `components/` o `scripts/`. Los que tienen menciones en documentación aparecen descritos allí pese a no estar conectados a una pantalla; revisar esas descripciones si más adelante se decide retirarlos.
- `HommeSummaryCard` solo reexporta `HomeSummaryCard`; no hay consumidor del alias ni de la tarjeta por pantalla.
- No se borraron `.styles.ts`, `.gitkeep` ni documentación. En esta fase se entrega la evaluación para que la limpieza se decida después.
