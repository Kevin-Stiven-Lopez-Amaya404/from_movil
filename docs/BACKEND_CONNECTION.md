# Integración de SmartHome móvil con el backend

**Repositorio:** `Kevin-Stiven-Lopez-Amaya404/from_movil`.  
**Referencia de implementación:** rama `dev`, commit de auditoría `46845ffb908c11e250596368bc73651ba5ef56e7`.  
**Alcance:** configuración y consumo de servicios desde la aplicación; la autoridad de los contratos REST/MQTT pertenece al backend y debe contrastarse antes de cambiarlos.

## Configuración del entorno

La aplicación utiliza el backend real. `lib/config/api-config.ts` **no habilita un modo demo sin backend**. Para desarrollo crea `.env.local` a partir de `.env.example` e introduce una URL accesible desde el teléfono:

```powershell
Copy-Item .env.example .env.local
# Editar EXPO_PUBLIC_API_URL con la URL accesible real (sin publicar secretos)
npm ci
npx expo start --clear --lan
```

La variable `EXPO_PUBLIC_API_URL` acepta un origen o una URL acabada en `/api/v1`; `lib/api/api-client.ts` resuelve el prefijo para evitar duplicarlo. Si el backend es local, el teléfono debe alcanzar la IP del computador: `localhost` en el dispositivo significa el propio teléfono.

En el entorno de producción la configuración exige **HTTPS público válido** y bloquea dominios de ejemplo, localhost e IP locales. Además, `app.config.js` exige `APP_LINK_DOMAIN`, `ANDROID_PACKAGE` e `IOS_BUNDLE_IDENTIFIER` al compilar con perfil de producción.

### Enlaces de activación y restablecimiento

Expo Router maneja `/activate-account` y `/reset-password` con token. Los enlaces verificados requieren publicar archivos de asociación Android App Links y Apple Universal Links en `APP_LINK_DOMAIN`; compilar el cliente no demuestra que ese dominio y su asociación funcionen.

- Android: `/.well-known/assetlinks.json`, con paquete y huella SHA-256 de la firma que se utilice.
- iOS: `/.well-known/apple-app-site-association`, con Apple Team ID y Bundle ID.

## Separación de responsabilidades

- `lib/api/api-client.ts`: peticiones HTTP autenticadas y normalización de rutas.
- `lib/services/auth-service.ts` y `lib/auth/auth-store.ts`: registro, sesión, activación y recuperación, usando servicios reales.
- `lib/session/session-store.ts`: almacenamiento y renovación de la sesión.
- `lib/services/smart-home-service.ts`: hogares, dispositivos, membresías.
- `lib/services/consumption-service.ts` y `lib/services/energy-service.ts`: consumo y reglas SQL034 de tarifas y metas.
- `lib/services/notifications-service.ts` y `lib/services/realtime-service.ts`: notificaciones y Socket.IO.
- `lib/services/pairing-service.ts` y `lib/pairing/`: sesiones Shelly, identidad local, preparación/provisión MQTT y exploración BLE/LAN.

**Las pantallas no deben gestionar directamente el contrato HTTP.** Utiliza los servicios y conserva validaciones de acceso y estados de conectividad.

## Contratos consumidos por el frontend

Estas rutas se describen desde el **cliente móvil** y no constituyen una especificación OpenAPI del backend:

| Función | Rutas HTTP consumidas |
| --- | --- |
| Registro e inicio de sesión | `POST /api/v1/auth/register`, `POST /api/v1/auth/login` |
| Activación y contraseñas | `/api/v1/auth/activate`, `/api/v1/auth/forgot-password`, `/api/v1/auth/reset-password`, `PATCH /api/v1/auth/change-password` |
| Sesiones | `POST /api/v1/auth/refresh`, `/api/v1/auth/logout`, `/api/v1/auth/logout-all` |
| Hogares y dispositivos | `/api/v1/homes`, `/api/v1/homes/:homeId/devices`, `PATCH /api/v1/homes/:homeId/devices/:deviceId/control` |
| Invitaciones y miembros | `/api/v1/invitations`, `/api/v1/homes/:homeId/members` y rutas relacionadas |
| Energía SQL034 | `/api/v1/homes/:homeId/energy/tariffs`, `/energy/goals`, `/energy/summary` bajo el mismo hogar |
| Shelly | `/api/v1/homes/:homeId/shelly/setup-sessions` y operaciones de identificación/completado y MQTT |

El backend maneja la renovación de sesiones a través de cookie `HttpOnly`, mientras el cliente envía `credentials: include`. Verificar en Android y iOS la persistencia real de cookies al relanzar la APK; una prueba unitaria no certifica este comportamiento.

## Shelly: LAN, BLE y MQTT

El flujo de pairing **sí tiene implementación móvil** en `lib/services/pairing-service.ts`: crea sesiones `setup-sessions`, consulta su estado y realiza identificación, preparación MQTT, bootstrap de configuración local y confirmación de conectividad. La función `prepareAndEnableShellyMqtt` coordina las etapas y valida sus resultados. Su presencia en código **no certifica** vinculación exitosa con un Shelly real ni compatibilidad con todas las versiones de firmware.

La búsqueda por **LAN** se realiza desde el teléfono usando descubrimiento local. El descubrimiento ejecutado en un backend remoto no puede buscar automáticamente los equipos de la red Wi-Fi doméstica. **BLE/GATT** es experimental y su inspección de `Shelly.GetDeviceInfo` es de solo lectura; no equivale a pairing Bluetooth productivo.

No emitir credenciales por logs, URLs o documentación. Las operaciones MQTT requieren TLS, identidad y autorización por sesión y comprobación del estado autenticado, no solo un resultado de configuración local.

## Despliegue Android y actualización

`eas.json` define una APK Android interna con perfil y canal `preview`. La configuración habilita Expo Updates y versión runtime basada en `appVersion`. Las actualizaciones JS/estilos compatibles pueden entregarse OTA:

```powershell
npx --yes eas-cli@latest update --channel preview --platform android --environment preview --message "SmartHome: actualización validada"
```

No publicar este comando por cambios solo documentales ni sin pasar CI. Si cambian módulos nativos, permisos, plugins, identificadores o runtime, evaluar una nueva APK mediante `eas build --platform android --profile preview`.

## Verificación antes de aprobar un cambio de contrato

1. Contrastar rutas, métodos, permisos y cuerpos con los controladores del backend en su commit concreto.
2. Ejecutar lint, typecheck, `test:mobile-config`, `test:navigation-auth`, `test:energy-sql034`, `test:shelly-mqtt-pairing` y `test:shelly-ble-rpc`.
3. Probar en APK física: inicio/cierre/refresh, reconexión, LAN, BLE read-only y sesión MQTT con Shelly real.
4. No marcar como completado ningún pairing si la sesión sigue en `WAITING_FOR_MQTT` o si falta conexión autenticada.
5. Registrar diferencias de contrato como solicitud al backend; no modificar backend ni BD desde esta limpieza móvil.

**Documentación central:** [smart-home-doc](https://github.com/Kevin-Stiven-Lopez-Amaya404/smart-home-doc). Archivos previos preservados en `docs/99-archivo/movil`.
