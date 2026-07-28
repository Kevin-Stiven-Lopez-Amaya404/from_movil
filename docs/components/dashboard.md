# Componentes - dashboard

## DashboardHeader
- Ruta: `components/dashboard/DashboardHeader.tsx`
- Descripción: Encabezado de la pantalla principal; muestra la marca, acceso a notificaciones y avatar del usuario.
- Props:
  - `onNotificationsPress: () => void` — callback al presionar notificaciones.
  - `onProfilePress: () => void` — callback al presionar avatar/perfil.
  - `sessionName: string` — nombre de sesión para mostrar inicial.
  - `textColor: string` — color del texto.
  - `rowAltColor: string` — color alterno para botones cuadrados.
- Ejemplo:
```
<DashboardHeader
  sessionName="María"
  textColor="#102314"
  rowAltColor="#EEF4FF"
  onNotificationsPress={() => {}}
  onProfilePress={() => {}}
/>
```

## DashboardTabs
- Ruta: `components/dashboard/DashboardTabs.tsx`
- Descripción: Pestañas horizontales; solo la pestaña "Hogares" dispara navegación.
- Props:
  - `mutedColor: string` — color de texto apagado para las pestañas inactivas.
  - `onHomesPress: () => void` — callback al presionar "Hogares".
- Ejemplo:
```
<DashboardTabs mutedColor="#999" onHomesPress={() => navigateToHomes()} />
```

## DashboardToolbar
- Ruta: `components/dashboard/DashboardToolbar.tsx`
- Descripción: Barra de acciones con título, botón de personalizar, agregar e información.
- Props:
  - `borderColor: string` — color del borde del toolbar.
  - `cardColor: string` — fondo del toolbar.
  - `onAddPress: () => void` — callback para agregar widget.
  - `onCustomizePress: () => void` — callback para personalizar.
  - `onInfoPress: () => void` — callback para información.
  - `textColor: string` — color del texto.
- Ejemplo:
```
<DashboardToolbar
  borderColor="#E6E6E6"
  cardColor="#FFFFFF"
  textColor="#102314"
  onAddPress={() => {}}
  onCustomizePress={() => {}}
  onInfoPress={() => {}}
/>
```

## HomeWidgetCard
- Ruta: `components/dashboard/HomeWidgetCard.tsx`
- Descripción: Card de acceso rápido a un hogar; muestra nombre y consumo.
- Props:
  - `consumption: string` — texto del consumo formateado.
  - `name: string` — nombre del hogar.
  - `onPress: () => void` — callback al presionar la card.
  - `rowAltColor: string` — color alterno para el pill de consumo.
  - `rowColor: string` — fondo de la card.
  - `textColor: string` — color del texto.
- Ejemplo:
```
<HomeWidgetCard
  name="Casa Centro"
  consumption="120 W"
  rowColor="#FFF"
  rowAltColor="#EEF4FF"
  textColor="#102314"
  onPress={() => openHome(1)}
/>
```

## EnergySummaryCard
- Ruta: `components/dashboard/EnergySummaryCard.tsx`
- Descripción: Resumen de consumo actual; recibe valores ya calculados.
- Props:
  - `activeDevices: number` — dispositivos activos.
  - `cardColor: string` — fondo de la tarjeta.
  - `formattedConsumption: string` — consumo formateado listo para mostrar.
  - `mutedColor: string` — color de etiqueta secundaria.
  - `rowColor: string` — color del pill derecho.
  - `textColor: string` — color principal del texto.
- Ejemplo:
```
<EnergySummaryCard
  activeDevices={3}
  formattedConsumption="1.2 kWh"
  cardColor="#FFF"
  mutedColor="#999"
  rowColor="#EEF4FF"
  textColor="#102314"
/>
```

## EmptyDashboard
- Ruta: `components/dashboard/EmptyDashboard.tsx`
- Descripción: Vista para estado vacío del dashboard; invita a agregar un hogar.
- Props:
  - `cardColor: string` — fondo de la vista vacía.
  - `mutedColor: string` — color del texto secundario.
  - `onAddPress: () => void` — callback al presionar "Agregar hogar".
  - `textColor: string` — color del título.
- Ejemplo:
```
<EmptyDashboard
  cardColor="#FFF"
  mutedColor="#999"
  textColor="#102314"
  onAddPress={() => openAddHomeModal()}
/>
```
