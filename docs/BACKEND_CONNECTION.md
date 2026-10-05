# Conexión con backend

La app queda preparada para trabajar en dos modos:

- Sin `EXPO_PUBLIC_API_URL`: usa datos mock locales para desarrollo visual; la interfaz debe identificarlos como demo.
- Con `EXPO_PUBLIC_API_URL`: usa HTTP mediante `lib/api/api-client.ts`.

## Configuracion

Crear un archivo `.env` en la raiz del proyecto:

```env
EXPO_PUBLIC_API_URL=http://<HOST_ACCESIBLE_DESDE_EL_TELEFONO>:3000/api/v1
```

La URL puede terminar en `/api/v1` (como en el ejemplo) o ser solo el origen. El cliente HTTP evita duplicar el prefijo `/api/v1`; Socket.IO conecta al namespace `/realtime` desde el origen. En un teléfono físico, `localhost` apunta al propio dispositivo. Usa una dirección LAN, staging o producción accesible desde el teléfono. Reinicia Expo después de cambiar variables.

El esquema Expo `smarthome` permite abrir rutas de la app con enlaces `smarthome://...`. Para que los enlaces de activación y recuperación enviados por correo abran la app en producción, el dominio de `FRONTEND_URL` debe tener App Links/Universal Links asociados con el identificador de la aplicación, o redirigir a su esquema móvil. El backend construye estos enlaces como `/activate-account?token=...` y `/reset-password?token=...`; el dominio debe conservar la ruta y el parámetro `token`.

## Servicios frontend

La conexion con backend no debe hacerse desde las pantallas.
Cada pantalla debe consumir funciones de servicios:

- `lib/services/auth-service.ts`: autenticacion.
- `lib/services/smart-home-service.ts`: hogares y dispositivos.
- `lib/services/consumption-service.ts`: consumo por hogar y dispositivo.
- `lib/services/notifications-service.ts`: notificaciones.
- `lib/services/realtime-service.ts`: Socket.IO.
- `lib/services/pairing-service.ts`: pairing móvil todavía no integrado con el flujo Shelly del backend.
- `lib/api/api-client.ts`: cliente HTTP comun.

## Endpoints esperados

| Funcion                              | Metodo         | Endpoint                                                                                              |
| ------------------------------------ | -------------- | ----------------------------------------------------------------------------------------------------- | -------- |
| Iniciar sesión                       | `POST`         | `/api/v1/auth/login`                                                                                  |
| Registrar usuario                    | `POST`         | `/api/v1/auth/register`                                                                               |
| Activar cuenta                       | `POST`         | `/api/v1/auth/activate`                                                                               |
| Recuperar/restablecer contraseña     | `POST`         | `/api/v1/auth/forgot-password`, `/api/v1/auth/reset-password`                                         |
| Cambiar contraseña                   | `PATCH`        | `/api/v1/auth/change-password`                                                                        |
| Renovar sesión                       | `POST`         | `/api/v1/auth/refresh`                                                                                |
| Cerrar sesión / todas                | `POST`         | `/api/v1/auth/logout`, `/api/v1/auth/logout-all`                                                      |
| Usuario autenticado                  | `GET`          | `/api/v1/auth/me`                                                                                     |
| Listar/crear hogares                 | `GET`, `POST`  | `/api/v1/homes`                                                                                       |
| Listar miembros/invitar              | `GET`, `POST`  | `/api/v1/homes/:homeId/members`, `/api/v1/homes/:homeId/invitations`                                  |
| Listar/aceptar/rechazar invitaciones | `GET`, `PATCH` | `/api/v1/invitations`, `/api/v1/invitations/:memberId/accept`, `/api/v1/invitations/:memberId/reject` |
| Cambiar rol/revocar miembro          | `PATCH`        | `/api/v1/homes/:homeId/members/:memberId/role`, `/api/v1/homes/:homeId/members/:memberId/revoke`     |
| Salir del hogar                     | `POST`         | `/api/v1/homes/:homeId/leave`                                                                         |
| Listar dispositivos por hogar        | `GET`          | `/api/v1/homes/:homeId/devices`                                                                       |
| Controlar dispositivo                | `PATCH`        | `/api/v1/homes/:homeId/devices/:deviceId/control`                                                     |
| Consumo hogar                        | `GET`          | `/api/v1/homes/:homeId/consumption[/(summary                                                          | daily)]` |
| Consumo dispositivo                  | `GET`          | `/api/v1/homes/:homeId/devices/:deviceId/consumption[/(summary                                        | daily)]` |
| Notificaciones                       | `GET`, `PATCH` | `/api/v1/notifications`                                                                               |

## Contratos verificados en el backend entregado

- Registro recibe `name`, `email`, `password` y `passwordConfirmation`; responde con `id`, `name`, `email`, `status` y `emailVerified`. La cuenta queda pendiente de activación y se envía un enlace por correo.
- Activación y reenvío reciben `token` y `email`, respectivamente. El código de 6 dígitos del prototipo no corresponde al contrato del backend.
- Recuperación recibe `{ email }`; el enlace incluye un token. El restablecimiento recibe `{ token, password, passwordConfirmation }`.
- Cambio de contraseña usa `PATCH /api/v1/auth/change-password` con `currentPassword`, `newPassword` y `newPasswordConfirmation`.
- Login responde con `accessToken`, `tokenType` y `user` (`id`, `name`, `email`, `role`). El refresh token no viene en JSON: el backend lo administra en una cookie `HttpOnly`; `/auth/refresh` devuelve un nuevo access token. El cliente móvil envía cookies con `credentials: "include"`, pero ese comportamiento debe validarse en Android/iOS contra el entorno desplegado.
- Control de dispositivo usa `PATCH /api/v1/homes/:homeId/devices/:deviceId/control` con `command: "TURN_ON" | "TURN_OFF"`. Crear un dispositivo no usa `deviceTypeId`; el backend actual eliminó `device_type`.
- Invitaciones y membresía del hogar usan `GET /api/v1/invitations`, `PATCH /api/v1/invitations/:id/accept`, `PATCH /api/v1/invitations/:id/reject`, `PATCH /api/v1/homes/:homeId/members/:memberId/role`, `PATCH /api/v1/homes/:homeId/members/:memberId/revoke` y `POST /api/v1/homes/:homeId/leave`.
- Consumo real usa las rutas del servicio `consumption`; el backend no define `/reports`.
- Notificaciones incluyen `GET /notifications/unread-count`, `PATCH /notifications/read-all`, `PATCH /notifications/:notificationId/read` y `PATCH /notifications/:notificationId/dismiss`.

### Límite del pairing Shelly

El backend incluye `GET /api/v1/homes/:homeId/shelly/discover`, `POST .../identify` y `POST .../provision`. Identificación/provisionamiento reciben la IP local (`shellyIp`); provisionamiento también recibe `name`. `discover` busca desde la red donde se ejecuta el backend y no debe llamarse desde una app apuntando a un backend cloud para buscar en la LAN de la casa. Este contrato tampoco expone `DevicePairingSession`, BLE ni configuración Wi-Fi desde el móvil. Por tanto, el pairing móvil Shelly queda pendiente de un flujo que mantenga la comunicación local teléfono-dispositivo y de validar cómo se coordinará de forma segura el aprovisionamiento MQTT.

## Relacion principal de datos

Un hogar puede tener varios dispositivos.
Un dispositivo siempre pertenece a un hogar mediante `homeId`.

```ts
type SmartHomePlace = {
  id: string;
  name: string;
  location: string;
  favorite: boolean;
};

type SmartDevice = {
  id: string;
  homeId: string;
  name: string;
  category: string;
  icon: string;
  consumption: number;
  yesterday: number;
  online: boolean;
};
```

## Respuesta de login del backend

```json
{
  "accessToken": "jwt-token",
  "tokenType": "Bearer",
  "user": {
    "id": "uuid",
    "email": "usuario@correo.com",
    "name": "Usuario",
    "role": "USER"
  }
}
```

## Reglas de integracion

- Mantener las pantallas sin `fetch` directo.
- Centralizar errores en `ApiError`.
- Usar `homeId` para consultar dispositivos por hogar.
- Obtener `OWNER`, `MEMBER` o `GUEST` de la membresía de cada hogar; el rol global del usuario no autoriza operaciones del hogar.
- No guardar ni esperar el refresh token en el JSON de login: el contrato vigente lo entrega en una cookie `HttpOnly`.
- El contrato vigente de miembros devuelve `userId`, rol y estado, pero no nombre ni correo; la UI no debe inventarlos.
- No usar zonas/estancias como parte del modelo funcional.
- No crear un endpoint `/reports` ni endpoints de pairing sin contrato backend confirmado.
- Para consumo incremental, agregar `energyDeltaKwh`; no sumar `energyTotalKwh`.
- En dispositivos físicos, nunca configurar `localhost` como dirección backend.
- No usar descubrimiento Shelly ejecutado desde el backend cloud para encontrar dispositivos en la LAN de la casa.
- El backend entregado aún no expone `DevicePairingSession`; el flujo móvil no debe fingir éxito de pairing.
