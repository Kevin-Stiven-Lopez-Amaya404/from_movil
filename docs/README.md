# Documentación técnica del frontend móvil

Este repositorio mantiene **únicamente documentación operativa cercana al código**. La arquitectura, manuales de proyecto y auditorías históricas ya se preservaron en el [archivo central del móvil](https://github.com/Kevin-Stiven-Lopez-Amaya404/smart-home-doc/tree/main/docs/99-archivo/movil) de `smart-home-doc` (singular).

## Documentos locales vigentes

- [Conexión con backend y configuración EAS](BACKEND_CONNECTION.md): API HTTP, entorno y contratos que consume el frontend; el backend es la autoridad de los endpoints.
- [POC BLE Android](BLE_POC_ANDROID.md): ensayo experimental de Shelly GATT de solo lectura. No equivale al pairing completo certificado.
- [Auditoría de limpieza de repositorio](auditoria/limpieza-repositorio-2026-11-04.md): manifiesto de cambios, validación CI y asuntos pendientes.

## Jerarquía de fuentes

1. Implementación, tests y configuración de la rama `dev` de `from_movil`.
2. Contratos de REST, MQTT y realtime contrastados con el backend; no se reemplazan por documentos históricos.
3. Documentación central en `smart-home-doc`, incluidas referencias de arquitectura, diseño, componentes y archivo.
4. Documentación operativa local para instalación y compilación, mantenida en el mismo PR que cambie su comportamiento.

## Traslado completado

El [PR documental #9](https://github.com/Kevin-Stiven-Lopez-Amaya404/smart-home-doc/pull/9) conservó 26 archivos de origen con manifiesto, identificadores Git de procedencia y redacción de referencias a credenciales demostrativas. Los documentos históricos retirados de esta rama siguen disponibles allí. Los archivos de operación backend y BLE permanecen aquí; también se archivaron copias de trazabilidad.

La eliminación de archivos en una rama Git **no elimina el historial anterior**. Si una contraseña demostrativa hubiera sido real, debe revocarse por separado.
