# Limpieza del repositorio — SmartHome móvil

**Fecha de revisión:** 2026-11-04  
**Origen:** `Kevin-Stiven-Lopez-Amaya404/from_movil` rama `dev`, commit base `46845ffb908c11e250596368bc73651ba5ef56e7`  
**Fuente documental:** `Kevin-Stiven-Lopez-Amaya404/smart-home-doc`, PR #9 fusionado en `main`, commit `ff6776141d79074bae1ff0c738195bb56ab8c0d5`.

## 1. Inventario original

- 280 archivos versionados, de ellos 25 dentro de `docs/` y un README histórico ubicado dentro de `app/(tabs)/`.
- El README documental contenía afirmaciones obsoletas sobre autenticación local simulada, rutas OTP y comandos web.
- Las pruebas automáticas existentes no estaban completamente incorporadas en el CI.
- Se encontraron 22 archivos documentales redundantes respecto al repositorio central, más el README histórico de pantallas.

## 2. Limpieza aplicada en esta rama

- README técnico actualizado con la estructura, comando de validación y operación de APK Preview/OTA.
- Índice `docs/README.md` reducido a tres documentos operativos: backend, BLE POC y esta auditoría.
- Los 22 documentos históricos se retiran del árbol activo **después** de comprobar su archivo en `smart-home-doc`.
- El README histórico ubicado dentro de las rutas de la aplicación se retira; su copia está conservada en el manifiesto central.
- Mobile CI cubre lint, TypeScript y las suites existentes de configuración, autenticación, alertas, realtime, energía SQL034, MQTT, BLE RPC, perfil, presentación de dispositivos e idioma.

## 3. Comprobación de trazabilidad documental

- PR #9 integrado: https://github.com/Kevin-Stiven-Lopez-Amaya404/smart-home-doc/pull/9
- Índice histórico: https://github.com/Kevin-Stiven-Lopez-Amaya404/smart-home-doc/tree/main/docs/99-archivo/movil
- Manifiesto: https://github.com/Kevin-Stiven-Lopez-Amaya404/smart-home-doc/blob/main/docs/99-archivo/movil/manifiesto-migracion.json
- Las fuentes están asociadas a sus Git blob SHA originales. En las copias con credenciales de demostración, el contenido fue **sanitizado** y por tanto no tiene igualdad byte a byte.

## 4. Auditoría de ramas

Comparación realizada respecto de `dev` en el commit base. Una rama **behind con 0 ahead** no contiene commits exclusivos comparada con `dev`; es candidata técnica a limpieza de referencias tras confirmar responsables, trabajos externos y PR abiertos.

- Ramas numéricas `04-dev` hasta `21-dev`: 18 ramas **behind / 0 ahead**. No se eliminan hasta revisar sus responsables.
- Ramas numéricas `01-dev`, `02-dev`, `03-dev`: **divergidas** (2, 4 y 6 commits exclusivos); conservar. `03-dev` tiene el PR #1 abierto.
- `feat/shelly-pairing-backend-alignment`: 3 commits exclusivos; conservar.
- `feature/mobile-production-qa`: 1 commit exclusivo; conservar y **no fusionar** el PR #36.
- `fix/mobile-screen-styles` y `test/flujo-usuario-mobile`: 1 commit exclusivo cada una; conservar.
- Ramas `feature/mobile-auth-ui`, `feature/mobile-design-system`, `feature/mobile-devices-ui`, `feature/mobile-energy-ui`, `feature/mobile-profile-settings` y `feature/mobile-secondary-screens`: behind / 0 ahead; asociadas a fases integradas.
- Otras `fix/`, `test/`, `feat/` y `chore/mobile-repository-cleanup` revisadas: behind / 0 ahead, candidatas a limpieza tras verificación.

**Ninguna rama fue eliminada.** Los commits exclusivos, el PR #36 y las ramas de trabajo abiertas deben conservarse.

## 5. Candidatos de código y recursos para evaluación posterior

Búsquedas de referencias en GitHub detectaron archivos sin consumidores obvios fuera de sí mismos o de la documentación histórica: componentes antiguos de Dashboard/Perfil, `HapticTab`, algunos hooks y recursos gráficos. Una búsqueda textual no demuestra ausencia de imports dinámicos ni de uso nativo.

No se elimina código o assets en este PR documental. El retiro requiere revisar imports, rutas, recursos de Expo y pruebas, seguido por CI. **`app.json`, `app.config.js`, `eas.json`, `package.json`, `package-lock.json`, Shelly, MQTT y BLE se mantienen intactos**.

## 6. Riesgos técnicos detectados y diferidos

- `lib/services/pairing-service.ts` conserva un host MQTT fijado en el código. Revisar externalización controlada por entorno y compatibilidad con el backend antes de producción; no cambiarlo durante un PR exclusivamente documental.
- La auditoría de imports encontró componentes antiguos sin consumidores evidentes fuera de su propio archivo o documentos. Deben validarse con análisis estático y CI en un PR separado.
- Los paquetes nativos de Expo, la integración BLE y el sistema de actualización deben verificarse juntos; **no se eliminan dependencias** en esta etapa sin regenerar lockfile y ejecutar tests.
- Corroborar en Android físico el flujo de BLE/RPC y sesiones MQTT; las pruebas automatizadas utilizan simulaciones.

## 7. Puertas de validación

- Antes de fusionar el PR móvil: `git diff --check`, lint, typecheck y Mobile CI completos en verde.
- Después del merge: pruebas manuales con APK Android existente, autenticación, enlaces, energía, LAN/BLE Shelly y backend.
- No publicar una OTA de documentación ni reconstruir APK por eliminación de Markdown.
- Ninguna acción sobre el PR #36 sin decisión específica del equipo.
