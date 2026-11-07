# SmartHome móvil — migración de seguridad a Expo SDK 58

**Estado:** propuesta experimental para revisión en `dev`, no liberación a producción.
**Motivo:** issue [#42](https://github.com/Kevin-Stiven-Lopez-Amaya404/from_movil/issues/42);
auditoría anterior: **5 altas / 8 moderadas / 1 baja** en Expo SDK 57.

## Cambios aplicados

- Se alinearon 34 versiones declaradas de dependencias con la matriz oficial de Expo SDK 58.
- `expo@58.0.23`, `expo-router@58.0.30`, React 19.3 y React Native 0.88.1.
- El `package-lock.json` se regeneró usando `npm install` de npm 10, no con edición manual ni `--force` ni `--legacy-peer-deps`.
- `components/LiquidNavigation.tsx` migra desde la ruta interna obsoleta a `expo-router/js-tabs` y usa `emitter.emit` / `navigateToTab` conforme al contrato público SDK 58.
- `components/ui/HorizontalFilterTabs.tsx` usa `ScrollViewInstance` según el tipo estricto de RN 0.88.
- `app.json` avanza `version` de 1.0.0 a 1.1.0 para separar `runtimeVersion` derivada por la política `appVersion` y **evitar entregar JS de SDK 58 a APK anteriores de SDK 57** mediante EAS Update.
- `.github/workflows/dependency-audit.yml` permite auditar también PRs que cambian dependencias: no ignora vulnerabilidades.

## Evidencia de seguridad

GitHub Actions [evaluación SDK58, ejecución 42143418001](https://github.com/Kevin-Stiven-Lopez-Amaya404/from_movil/actions/runs/42143418001)
ejecutó sobre el lockfile generado:

```text
npm audit --omit=dev --audit-level=high --json
critical: 0
high: 0
moderate: 5
low: 0
exit code: 0
```

Este resultado sí elimina **el bloqueo de altas/críticas de la auditoría del lockfile candidato**; las cinco moderadas siguen pendientes de revisión. La ejecución indicada falló después, en TypeScript, por cambios de API que se corrigieron en commits posteriores. No se debe confundir el resultado del audit con el resultado del job completo. La aprobación definitiva exige un nuevo CI completo exitoso.

## Seguridad del despliegue y aceptación QA

1. CI: `npm ci`, `npm audit --omit=dev --audit-level=high`, `npx expo install --check`,
   lint, TypeScript, pruebas existentes, `npx expo export --platform android`.
2. Build Android **nativo** con prebuild + Gradle en un APK de desarrollo; es distinto de exportación del bundle JS.
3. QA en teléfono real: inicio de sesión, navegación a 5 tabs, deep links, permisos Android, descubrimiento mDNS/IP Shelly, BLE/GATT, flujo MQTT, reconexión, telemetría, notificaciones y actualización OTA en entorno de pruebas.
4. Validar que la app anterior 1.0.0 no recibe OTA destinada a runtime 1.1.0. No ejecutar `eas update --branch production` ni publicar APK de producción antes del gate.
5. No modificar backend ni base de datos por esta migración; verificar contratos remotos desde la nueva APK.
6. Hacer PR a `dev`, revisar Android/QA, luego promover con controles existentes. No mezclar con PR de release `qa → main` sin aprobación.

## Referencias oficiales

- [Expo: cómo migrar a SDK 58](https://expo.dev/blog/how-to-upgrade-to-sdk-58)
- [Expo: changelog SDK 58](https://expo.dev/changelog/sdk-58)
- [Expo: compatibilidad runtime EAS Update](https://docs.expo.dev/eas-update/runtime-versions/)
- [Expo: actualización por SDK](https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/)
- [Expo: eliminación de Zod en CLI](https://github.com/expo/expo/pull/52599)

**Advertencia:** `npm audit` solo analiza dependencias registradas; un exit code 0 para altas/críticas no prueba que toda la app sea invulnerable ni sustituye la POC física.
