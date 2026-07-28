# Componentes - homes

## AddNameRow
- Ruta: `components/homes/AddNameRow.tsx`
- Descripción: Fila reutilizable para crear o renombrar hogares/dispositivos.
- Props:
  - `backgroundColor: string` — color de fondo del campo de texto.
  - `borderColor: string` — color del borde del texto.
  - `onChangeText: (value: string) => void` — callback al escribir.
  - `onSubmit: () => void` — callback para enviar el valor.
  - `placeholder: string` — texto de placeholder.
  - `placeholderTextColor: string` — color del placeholder.
  - `textColor: string` — color del texto ingresado.
  - `value: string` — texto actual del campo.
- Ejemplo:
```
<AddNameRow
  backgroundColor="#ffffff"
  borderColor="#D1D5DB"
  placeholder="Nuevo hogar"
  placeholderTextColor="#9CA3AF"
  textColor="#111827"
  value={homeName}
  onChangeText={setHomeName}
  onSubmit={createHome}
/>
```

## DeviceListItem
- Ruta: `components/homes/DeviceListItem.tsx`
- Descripción: Item de lista de dispositivo con icono, nombre, estado y switch de encendido.
- Props:
  - `consumption: number` — consumo en kWh usado en la subtítulo si el dispositivo está online.
  - `icon: string` — nombre del icono de `MaterialCommunityIcons`.
  - `name: string` — nombre del dispositivo.
  - `online: boolean` — estado del dispositivo.
  - `onPress: () => void` — callback al presionar el item.
  - `onToggle: () => void` — callback al cambiar el switch.
  - `room: string` — nombre de la habitación.
  - `rowAltColor: string` — color alterno para el ícono.
  - `rowColor: string` — fondo del item.
  - `selected: boolean` — indica si el item está seleccionado.
  - `textColor: string` — color del texto principal.
  - `mutedColor: string` — color del texto secundario.
- Ejemplo:
```
<DeviceListItem
  name="Lámpara Sala"
  room="Sala"
  icon="lamp"
  online={true}
  consumption={0.75}
  selected={false}
  rowColor="#FFFFFF"
  rowAltColor="#EEF4FF"
  textColor="#111827"
  mutedColor="#6B7280"
  onPress={() => openDevice(deviceId)}
  onToggle={() => toggleDevice(deviceId)}
/>
```

## HomeHeroCard
- Ruta: `components/homes/HomeHeroCard.tsx`
- Descripción: Tarjeta principal de resumen de hogar; se usa para mostrar métricas destacadas.
- Props:
  - `backgroundColor: string` — fondo de la tarjeta.
  - `description: string` — texto descriptivo secundario.
  - `mutedColor: string` — color del texto secundario.
  - `title: string` — título principal.
  - `value: string` — valor destacado.
  - `compactValue?: boolean` — reduce el tamaño del texto del valor si se requiere.
  - `textColor: string` — color del texto principal.
- Ejemplo:
```
<HomeHeroCard
  title="Consumo mensual"
  value="34.2 kWh"
  description="Hasta ahora este mes"
  backgroundColor="#0B3E8C"
  textColor="#FFFFFF"
  mutedColor="#D6E4FF"
/>
```

## HomeListItem
- Ruta: `components/homes/HomeListItem.tsx`
- Descripción: Item de la lista de hogares registrados; permite marcar como favorito.
- Props:
  - `count: number` — cantidad de dispositivos en el hogar.
  - `favorite: boolean` — indica si está en favoritos.
  - `location: string` — ubicación del hogar.
  - `name: string` — nombre del hogar.
  - `onFavoritePress: () => void` — callback para alternar favorito.
  - `onPress: () => void` — callback al presionar el hogar.
  - `rowAltColor: string` — color del icono y fondo alterno.
  - `rowColor: string` — color de fondo del card.
  - `textColor: string` — color del texto principal.
  - `mutedColor: string` — color del texto secundario.
- Ejemplo:
```
<HomeListItem
  name="Casa Centro"
  location="Centro"
  count={5}
  favorite={true}
  rowColor="#FFFFFF"
  rowAltColor="#EEF4FF"
  textColor="#111827"
  mutedColor="#6B7280"
  onPress={() => openHome(1)}
  onFavoritePress={() => toggleFavorite(1)}
/>
```
