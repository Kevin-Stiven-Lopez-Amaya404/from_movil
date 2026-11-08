# SmartHome — frontend móvil

Aplicación nativa Android/iOS para gestionar hogares, dispositivos Shelly, energía, alertas y preferencias. Implementada con **Expo SDK 58**, **React Native 0.88**, **TypeScript** y **Expo Router**.

La rama de integración es `dev`. No hay despliegue web de este frontend. Los servicios y pruebas del código prevalecen frente a la documentación histórica.

## Organización

| Ruta | Responsabilidad |
| --- | --- |
| `app/` | Pantallas y navegación Expo Router. |
| `components/`, `styles/`, `assets/`, `constants/` | UI, estilos y recursos. |
| `lib/api/`, `lib/services/` | API, autenticación, consumo y realtime. |
| `lib/pairing/` | Descubrimiento LAN, BLE experimental y MQTT. |
| `lib/context/`, `lib/hooks/` | Contexto y sincronización. |
| `lib/legal/` | Texto legal que usa la aplicación. |
| `scripts/` | Pruebas automatizadas. |
| `.github/workflows/` | CI y compilación de POC Android. |

## Desarrollo

Requisitos: Node.js 22 para reproducir CI, npm y un dispositivo/emulador Android cuando se pruebe funcionalidad nativa.

```powershell
git fetch origin
git switch dev
git pull --ff-only origin dev
npm ci
Copy-Item .env.example .env.local
npx expo start --clear --lan
```

Edita `.env.local` y define `EXPO_PUBLIC_API_URL` con la URL del backend accesible desde el teléfono. No publiques secretos ni archivos `.env.local`. En un teléfono físico, `localhost` no es el computador.

**Expo Go no incluye necesariamente los módulos BLE nativos** de la aplicación; usa Development Build o APK compatible para esas funciones.

## Pruebas

```powershell
npm run lint
npm run typecheck
npm run test:mobile-config
npm run test:navigation-auth
npm run test:alerts
npm run test:realtime-device-status
npm run test:device-presentation
npm run test:energy-sql034
npm run test:shelly-mqtt-pairing
npm run test:shelly-ble-rpc
node scripts/profile-settings-actions.test.mjs
node scripts/language-preferences.test.mjs
```

Las pruebas simuladas no reemplazan la verificación de Shelly físico, backend y compilación nativa.

## APK Preview y actualizaciones OTA

`eas.json` define el perfil y canal `preview` para la APK Android instalada. `app.json` habilita Expo Updates con runtime `appVersion`. Tras integrar y validar un cambio compatible en `dev`:

```powershell
npx --yes eas-cli@latest update --channel preview --platform android --environment preview --message "SmartHome: frontend móvil validado"
```

Esta orden **publica una OTA**. No ejecutarla por cambios documentales solamente. Plugins, permisos, código nativo, splash nativo y cambios incompatibles de runtime pueden requerir una nueva APK:

```powershell
npx --yes eas-cli@latest build --platform android --profile preview
```

## Documentación

- [Índice de documentos y vigencia](docs/README.md).
- [Integración con backend](docs/BACKEND_CONNECTION.md).
- [POC BLE Shelly Android](docs/BLE_POC_ANDROID.md) — lectura experimental, no pairing completo.
- [Estado de la limpieza](docs/auditoria/limpieza-repositorio-2026-11-04.md).
- [Repositorio documental central](https://github.com/Kevin-Stiven-Lopez-Amaya404/smart-home-doc) (singular).

El [archivo histórico central](https://github.com/Kevin-Stiven-Lopez-Amaya404/smart-home-doc/tree/main/docs/99-archivo/movil) conserva 26 documentos con manifiesto de trazabilidad, integrado en el PR documental #9. Solo permanecen aquí las guías operativas y esta auditoría.
