# Conexion con backend

La app queda preparada para trabajar en dos modos:

- Sin `EXPO_PUBLIC_API_URL`: usa datos mock locales para poder probar la interfaz.
- Con `EXPO_PUBLIC_API_URL`: usa HTTP mediante `lib/api/api-client.ts`.

## Configuracion

Crear un archivo `.env` en la raiz del proyecto:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

Reiniciar Expo despues de cambiar variables de entorno.

## Servicios frontend

La conexion con backend no debe hacerse desde las pantallas.
Cada pantalla debe consumir funciones de servicios:

- `lib/services/auth-service.ts`: autenticacion.
- `lib/services/smart-home-service.ts`: hogares, dispositivos y reportes.
- `lib/api/api-client.ts`: cliente HTTP comun.

## Endpoints esperados

| Funcion | Metodo | Endpoint |
| --- | --- | --- |
| Iniciar sesion | `POST` | `/auth/login` |
| Registrar usuario | `POST` | `/auth/register` |
| Actualizar contrasena | `POST` | `/auth/password` |
| Listar hogares | `GET` | `/homes` |
| Crear hogar | `POST` | `/homes` |
| Marcar favorito | `PATCH` | `/homes/:homeId/favorite` |
| Listar dispositivos de un hogar | `GET` | `/homes/:homeId/devices` |
| Crear dispositivo en un hogar | `POST` | `/homes/:homeId/devices` |
| Actualizar estado de dispositivo | `PATCH` | `/devices/:deviceId/status` |
| Consultar reportes | `GET` | `/reports?range=Diario` |

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
  room: string;
  icon: string;
  consumption: number;
  yesterday: number;
  online: boolean;
};
```

## Respuesta sugerida de login

```json
{
  "token": "jwt-token",
  "user": {
    "email": "usuario@correo.com",
    "name": "Usuario"
  }
}
```

## Reglas de integracion

- Mantener las pantallas sin `fetch` directo.
- Centralizar errores en `ApiError`.
- Usar `homeId` para consultar dispositivos por hogar.
- Conservar el modo mock hasta que el backend este listo.
