# Documentación del frontend móvil

Esta carpeta mezcla guías operativas con materiales históricos. **La rama `dev` y sus pruebas son la referencia del comportamiento implementado**; no interpretes las guías antiguas como contratos vigentes.

## Guías operativas junto al código

- [Conexión con backend](BACKEND_CONNECTION.md): variables, HTTP, deep links y servicios. El texto sobre Shelly debe contrastarse con los contratos actuales.
- [POC BLE Android](BLE_POC_ANDROID.md): inspección GATT experimental de solo lectura.
- [Auditoría de limpieza](auditoria/limpieza-repositorio-2026-11-04.md): alcance y pendientes.

## Documentos históricos / no canónicos

- **Proyecto y diseño:** [documentación de proyecto](DOCUMENTACION_PROYECTO_SMART_HOME.md), [código por pantallas](DOCUMENTACION_CODIGO_PANTALLAS_SMART_HOME.md), [identidad visual](ACTIVIDAD_IDENTIDAD_VISUAL_SMART_HOME.md), [mejoras del instructor](MEJORAS_INSTRUCTOR.md).
- **Flujos anteriores:** [flujo final](FLUJO_FINAL.md), [flujo de usuario](FLUJO_USUARIO.md), [guía rápida](GUIA_RAPIDA.md), [resumen](RESUMEN.md), [project documentation](PROJECT_DOCUMENTATION.md), [project flow](PROJECT_FLOW.md).
- **Auditorías de fases:** [auditoría de frontend](auditoria/mobile-frontend-audit.md), [pantallas secundarias](auditoria/secondary-screens-review.md), [inventario de colores](auditoria/inventario-colores.md), [componentes candidatos](auditoria/auditoria-componentes-fase-2.md).
- **Inventario de componentes:** [docs/components](components/README.md).
- **Notas históricas de pantallas:** [README de pantallas](historico/README_PANTALLAS.md).

Varias guías antiguas describen un flujo OTP, login simulado, credenciales de demostración o versión web que no coincide con el código actual.

## Migración documental

El destino central correcto es [`smart-home-doc`](https://github.com/Kevin-Stiven-Lopez-Amaya404/smart-home-doc), **singular**. Los documentos históricos **permanecen aquí hasta confirmar su copia, manifiesto y enlaces en el repositorio central**. No se ha fusionado el PR documental.

Los cambios en el Markdown actual no borran el historial Git; si hubo credenciales reales expuestas, es necesario revocarlas.
