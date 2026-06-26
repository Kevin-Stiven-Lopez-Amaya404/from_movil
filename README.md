# Smart Home

Aplicación móvil hecha con Expo Router y React Native para gestionar una experiencia básica de hogar inteligente: bienvenida, registro, inicio de sesión, recuperación de contraseña, dashboard, dispositivos, reportes, perfil y ajustes.

## Requisitos

- Node.js LTS
- npm
- Expo CLI vía `npx expo`

## Comandos

Instalar dependencias:

```bash
npm install
```

Iniciar el proyecto:

```bash
npm run start
```

Ejecutar en web:

```bash
npm run web
```

Validar código:

```bash
npm run lint
npx tsc --noEmit
```

## Estructura

- `app/`: rutas y pantallas de Expo Router.
- `app/(tabs)/`: navegación principal después del login.
- `components/`: componentes reutilizables de UI.
- `constants/`: tokens visuales compartidos.
- `hooks/`: hooks multiplataforma.
- `lib/`: lógica de dominio simple, como el store local de autenticación.

## Flujo

1. `welcome`: entrada inicial.
2. `register` o `login`: autenticación.
3. `(tabs)`: dashboard, dispositivos, reportes y perfil.
4. `forgot-password` -> `otp-verification` -> `new-password`: recuperación.

## Acceso demo

- Correo: `pepe@smarthome.com`
- Contraseña: `Smart123!`

El store de usuarios es local y en memoria para facilitar la demo. Para producción, reemplazar `lib/auth-store.ts` por una integración real con backend seguro.
