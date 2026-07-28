# Componentes - profile

## ProfileMenuItem
- Ruta: `components/profile/ProfileMenuItem.tsx`
- Descripción: Fila reutilizable para opciones del perfil con icono y estado visual por intención.
- Props:
  - `description?: string` — texto secundario opcional.
  - `icon: keyof typeof Ionicons.glyphMap` — icono de Ionicons.
  - `intent?: "default" | "danger" | "primary"` — define el color semántico.
  - `onPress: () => void` — callback al tocar la fila.
  - `title: string` — texto principal.
  - `variant?: "plain" | "boxed"` — si la fila aparece como tarjeta o simple.
- Ejemplo:
```
<ProfileMenuItem
  title="Editar perfil"
  description="Cambia tu nombre y foto"
  icon="person-outline"
  intent="primary"
  variant="boxed"
  onPress={openEditProfile}
/>
```

## ProfileModule
- Ruta: `components/profile/ProfileModule.tsx`
- Descripción: Contenedor de sección para agrupar contenido de perfil con estilo coherente.
- Props:
  - `title: string` — título visible de la sección.
  - `subtitle?: string` — texto secundario descriptivo.
  - `children` — contenido interno del módulo.
- Ejemplo:
```
<ProfileModule title="Cuenta" subtitle="Administrar datos y privacidad">
  <ProfileMenuItem ... />
</ProfileModule>
```

## ProfileSectionHeader
- Ruta: `components/profile/ProfileSectionHeader.tsx`
- Descripción: Encabezado de sección con icono, título y descripción.
- Props:
  - `danger?: boolean` — aplica estilo de advertencia en rojo.
  - `description: string` — texto explicativo.
  - `icon: keyof typeof Ionicons.glyphMap` — icono de Ionicons.
  - `title: string` — título de la sección.
- Ejemplo:
```
<ProfileSectionHeader
  title="Seguridad"
  description="Configura tus opciones de acceso"
  icon="shield-checkmark-outline"
/>
```
