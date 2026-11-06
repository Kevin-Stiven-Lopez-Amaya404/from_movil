# Seguridad de dependencias móviles — diagnóstico y ruta de remediación

Fecha: 2026-11-05. Alcance: `from_movil/dev`, Expo SDK 57, compilación Android.
**Estado: NO RESUELTO — producción bloqueada.** No es una exención de `npm audit`.
Seguimiento: [issue #42](https://github.com/Kevin-Stiven-Lopez-Amaya404/from_movil/issues/42).

## Evidencia reproducible

Ejecutar `npm ci` sobre Node 22 y luego `npm audit --omit=dev --audit-level=high --json`.
La auditoría de referencia sobre `dev` commit
`6b5fe36655eb9048aa4054a914ec245810d58893` (run
[42026688999](https://github.com/Kevin-Stiven-Lopez-Amaya404/from_movil/actions/runs/42026688999))
encontró **0 críticas / 5 altas / 8 moderadas / 1 baja**.
El workflow `.github/workflows/dependency-audit.yml` debe **seguir fallando**
mientras existan hallazgos altos o críticos. El artefacto JSON contiene detalles
por advisory; no confundir cinco entradas npm con cinco fallos independientes.

| Cadena instalada | Versión y decisión |
| --- | --- |
| `expo-router@57.0.29 → query-string@7.1.3 → decode-uri-component@0.2.2` | Afectado por [GHSA-qr28-fpjm-wq7f](https://github.com/advisories/GHSA-qr28-fpjm-wq7f), corregido en decoder **0.5.1**. Las versiones 0.5.x son ESM; `query-string@7` espera una función CommonJS. No hacer override directo. |
| `expo@57.0.31 → @expo/cli@57.0.32 → zod@3.25.76` | Afectado por [GHSA-mrhx-c7xc-m3w5](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5), corregido en Zod **4.6.6**. Expo CLI pide Zod 3. No forzar Zod 4 sin soporte upstream y pruebas. |

La presencia en el árbol de dependencias de producción de npm **no demuestra**
que el código vulnerable se ejecute dentro del APK. Aun así, no se debe afirmar
que el APK es inmune sin analizar el bundle y las entradas externas.

## Cambios de este PR

- `scripts/dependency-compatibility.mjs` inspecciona manifiesto/lockfile y
  detecta sustituciones peligrosas de módulos o saltos incompatibles.
- Seis pruebas unitarias comprueban los escenarios de compatibilidad.
- `mobile-ci.yml` ejecuta estas pruebas y el diagnóstico antes del resto de
  lint, TypeScript, regresiones Shelly y exportación Android.
- **No se modifica `package.json`, `package-lock.json`, BLE, MQTT, ni el código de pairing**.
- Este guard **no sustituye** `npm audit`, el guard de regresiones ni la aceptación física.

## Ruta de corrección pendiente

1. **Resolver el decoder**: preferir publicación oficial de Expo Router compatible
   con un parser actualizado. Si no existe, evaluar un fork de `query-string@7`
   o decoder CommonJS con el código del upstream corregido y licencia preservada.
   Requiere tests de URL/deep links y una actualización del lockfile mediante npm.
   No declarar corregido por cambiar números de versión sin cambiar el código vulnerable.
2. **Resolver Zod**: obtener actualización compatible de `@expo/cli` o backport
   del proveedor. Confirmar que config, export, prebuild y EAS continúan operando.
   Distinguir una vulnerabilidad de CLI/build de una alcanzable en el runtime.
3. **Repetir auditoría de verdad**: no cerrar el issue por un cambio en el formato
   del reporte ni editar el analizador para marcar un PASS falso.
4. **Validar integración**: `npm ci`, `npx expo install --check`,
   `npx expo-doctor`, `npm run lint`, `npm run typecheck`,
   pruebas unitarias/navegación/auth/Shelly, `npx expo export --platform android`
   y APK de prueba física Android para deep links, BLE, MQTT y control Shelly.
5. **Aprobar despliegue** únicamente con hallazgos corregidos o con una
   aceptación de riesgo explícita y documentada por el responsable de seguridad
   (con alcance, expiración y mitigaciones); no cambiar la política del gate
   sin aprobación. No publicar OTA ni APK por el solo hecho de abrir este PR.

### Comandos del desarrollador

```powershell
git switch dev
git pull --ff-only origin dev
git switch fix/mobile-dependency-security-guard
npm ci
node --test scripts/dependency-compatibility.test.mjs
node scripts/dependency-compatibility.mjs
npm audit --omit=dev --audit-level=high
npm run lint
npm run typecheck
npm run test:navigation-auth
npm run test:shelly-mqtt-pairing
npm run test:shelly-ble-rpc
npx expo export --platform android --output-dir dist-ci
```

Los fallos de `npm audit` que se deban a las vulnerabilidades abiertas siguen
siendo **fallos reales del criterio de liberación**, no errores del workflow.
