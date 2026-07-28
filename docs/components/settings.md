# Componentes - settings

## SettingsActionRow
- Ruta: `components/settings/SettingsActionRow.tsx`
- Descripción: Fila de acción para la pantalla de configuración; incluye icono, título y descripción.
- Props:
  - `backgroundColor: string` — color de fondo de la fila.
  - `borderColor: string` — color del borde.
  - `description?: string` — texto secundario opcional.
  - `iconName: keyof typeof Ionicons.glyphMap` — icono de Ionicons.
  - `iconColor: string` — color del icono.
  - `onPress: () => void` — callback al presionar.
  - `textColor: string` — color del texto principal.
  - `title: string` — título de la fila.
  - `mutedColor?: string` — color del texto secundario.
- Ejemplo:
```
<SettingsActionRow
  title="Notificaciones"
  description="Configura alertas y sonidos"
  iconName="notifications-outline"
  iconColor="#0864C8"
  textColor="#111827"
  mutedColor="#6B7280"
  backgroundColor="#FFFFFF"
  borderColor="#E5E7EB"
  onPress={openNotificationsSettings}
/>
```

## SettingsSectionCard
- Ruta: `components/settings/SettingsSectionCard.tsx`
- Descripción: Contenedor de sección para grupos de configuración con icono y descripción.
- Props:
  - `backgroundColor: string` — fondo de la tarjeta.
  - `description: string` — texto de descripción.
  - `descriptionColor: string` — color del texto descriptivo.
  - `iconColor: string` — color del icono.
  - `iconName: keyof typeof Ionicons.glyphMap` — icono de Ionicons.
  - `danger?: boolean` — marca la sección como de advertencia.
  - `title: string` — título principal.
  - `titleColor: string` — color del título.
  - `children` — contenido interno de la sección.
- Ejemplo:
```
<SettingsSectionCard
  iconName="shield-checkmark-outline"
  iconColor="#0864C8"
  title="Seguridad"
  titleColor="#111827"
  description="Ajusta opciones de acceso"
  descriptionColor="#6B7280"
  backgroundColor="#FFFFFF"
>
  <SettingsActionRow ... />
</SettingsSectionCard>
```
