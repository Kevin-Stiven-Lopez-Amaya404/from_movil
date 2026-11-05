# Auditoría de limpieza del repositorio móvil

**Fecha:** 2026-11-04  
**Fuente:** `Kevin-Stiven-Lopez-Amaya404/from_movil`, `dev` en `46845ffb908c11e250596368bc73651ba5ef56e7`  
**Estado:** revisión y cambios conservadores, pendientes de CI.

## Inventario y hallazgos

- 280 archivos versionados, incluidos 25 en `docs/` y un README dentro de `app/(tabs)/`.
- `docs/README.md` describía una versión simulada, `npm run web` y credenciales demo.
- Otros documentos de fases antiguas también contienen flujos anteriores o credenciales demostrativas.
- El workflow `mobile-ci.yml` comprobaba solo parte de los scripts existentes.
- La documentación canónica de arquitectura está en `smart-home-doc` (singular).

## Tratamiento

1. Modernizar README e índice documental sin alterar el código.
2. Separar el Markdown de las rutas Expo Router, conservando su texto en `docs/historico/`.
3. Redactar referencias conocidas a credenciales demo en guías antiguas y marcarlas no vigentes.
4. Ampliar CI a las suites existentes; confirmar resultado antes de fusionar.
5. Mantener el resto de los archivos históricos hasta que exista copia verificada y PR archivado en `smart-home-doc`.

## Exclusiones y pendientes

No se modifican código React Native, backend, BD, EAS, app.json, dependencias, Shelly, BLE, MQTT, configuraciones nativas, APK ni canales OTA. No se borra ninguna rama ni se fusiona el PR #36.

Pendiente: archivo central con hashes, validación documental y enlaces corregidos; auditoría de imports y recursos antes de eliminar código potencialmente sin uso; CI completo, pruebas reales Android y Shelly; investigación/revocación de cualquier credencial antigua que hubiera sido válida.

**Criterios de aceptación:** PR aislado a `dev`, diff restringido a docs/README/CI, pruebas completas en verde y sin merges automáticos.
