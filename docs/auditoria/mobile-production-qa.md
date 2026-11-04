# Auditoría final del frontend móvil

**Fecha de revisión:** 2026-11-03 (America/Bogota)
**Repositorio:** `Kevin-Stiven-Lopez-Amaya404/from_movil`
**Alcance:** frontend móvil Expo / React Native. No se modificaron backend, base de datos ni servicios de Shelly, LAN, BLE o MQTT.

## Estado de salida

La revisión estática y las suites locales cubiertas en esta auditoría pasan, y `expo export` completó bundles Android e iOS. Esto no constituye una aprobación de producción: faltan la revisión visual en dispositivos, el build nativo/EAS y la repetición de validaciones sobre el código una vez integrados los PR de las fases 1–6.

Los PR de las fases 1–6 siguen abiertos y sin merge. La fase 7 documenta resultados y riesgos; no integra esos cambios en `dev`.

## Estado de Git y ramas

- `origin/dev` al actualizar referencias: `42628313faa48e0fdfa2c62a7de7e5930b1f3808`.
- La rama local `dev` está 6 commits detrás de `origin/dev` y no tiene commits exclusivos.
- `20-dev` está 88 commits detrás de `origin/dev`, sin commits exclusivos.
- `fix/ui-devices` está 11 commits detrás de `origin/dev`, sin commits exclusivos.
- Las ramas de esta intervención mantienen sus historiales; no se renombraron ni eliminaron ramas.
- Rama de esta documentación: `feature/mobile-production-qa`, creada desde el `origin/dev` actualizado.
- `.agents/` y `.easignore` siguen locales, sin seguimiento y fuera de los commits. `dist/` ya existía y no se modificó.

## Fases y Pull Requests

Los seis PR fueron creados por `nataliachala1`. La API de GitHub reportó los seis abiertos, sin merge y sin conflictos al momento de esta auditoría.

| Fase | Rama y commit | Base del PR | PR / CI |
|---|---|---|---|
| 1 — Sistema de diseño | `feature/mobile-design-system` — `a00e582d31c479c57348fdc91af68f02cffa03ad` | `dev` | [#30](https://github.com/Kevin-Stiven-Lopez-Amaya404/from_movil/pull/30), Mobile CI #143: éxito |
| 2 — Autenticación | `feature/mobile-auth-ui` — `332adbd9b3b6bf127f6b9dedbc1f8c2b80d6db5f` | `feature/mobile-design-system` | [#31](https://github.com/Kevin-Stiven-Lopez-Amaya404/from_movil/pull/31), Mobile CI #145: éxito |
| 3 — Dispositivos | `feature/mobile-devices-ui` — `2befe20b0973ac095c6b8eccaf403bafec2c4cdf` | `feature/mobile-design-system` | [#32](https://github.com/Kevin-Stiven-Lopez-Amaya404/from_movil/pull/32), Mobile CI #147: éxito |
| 4 — Energía | `feature/mobile-energy-ui` — `682455835da179a369d019450fc43f12419c1cd4` | `feature/mobile-design-system` | [#33](https://github.com/Kevin-Stiven-Lopez-Amaya404/from_movil/pull/33), Mobile CI #149: éxito |
| 5 — Perfil y Configuración | `feature/mobile-profile-settings` — `a2f2731fd3027de36ad4fc72734ac84bd23f7c93` | `feature/mobile-design-system` | [#34](https://github.com/Kevin-Stiven-Lopez-Amaya404/from_movil/pull/34), Mobile CI #151: éxito |
| 6 — Pantallas secundarias | `feature/mobile-secondary-screens` — `2d27a650eb7a1e674cbfb6a15b7a3f3bca2700bd` | `feature/mobile-profile-settings` | [#35](https://github.com/Kevin-Stiven-Lopez-Amaya404/from_movil/pull/35), Mobile CI #153: éxito |

Orden recomendado: integrar primero #30; después #31–#34, que dependen del sistema de diseño; luego #35, que depende de #34. No se realizó ningún merge.

## Inventario de rutas

Las rutas siguientes están presentes en `app/`. Las rutas entre grupos de Expo Router conservan sus grupos internos, aunque estos no formen parte de la URL pública.

| Grupo | Rutas | Función / resultado de la auditoría |
|---|---|---|
| Acceso | `/welcome`, `/login`, `/register`, `/activate-account`, `/forgot-password`, `/reset-password`, `/new-password`, `/reactivate-account`, `/request-reactivation` | Bienvenida, autenticación, alta, activación y recuperación/reactivación. PR #31 mejora formularios, estados de envío, navegación y mensajes que no confirman si existe una cuenta. Los enlaces legales reales siguen pendientes porque no se han aprobado URLs. |
| Recuperación | `/(tabs)/(main)/_layout`, `/(tabs)/(main)/index`, `/(tabs)/(main)/homes`, `/(tabs)/home-detail`, `/(tabs)/access` | Navegación autenticada, inicio, hogares, detalle y acceso a hogar. PR #32 mejora estado de dispositivos y presentación de detalle; conserva roles y navegación existente. |
| Dispositivos | `/(tabs)/devices`, `/(tabs)/add-device`, `/(tabs)/shelly-setup`, `/(tabs)/prepare-shelly` | Lista, incorporación y preparación Shelly. PR #32 diferencia ONLINE/OFFLINE/UNKNOWN, mejora descubrimiento y aclara que BLE es experimental y de solo lectura. No se cambió el contrato de pairing. La operación física con hardware queda pendiente. |
| Energía | `/(tabs)/(main)/reports`, `/(tabs)/energy-tariffs`, `/(tabs)/energy-tariff-new`, `/(tabs)/energy-goals` | Reportes conserva consumo, gráficos, ranking y exportación. Tarifas e ingreso de tarifa son rutas separadas; metas/presupuesto es una pantalla propia, según la decisión confirmada por la usuaria. PR #33 conserva SQL034, permisos y navegación secundaria. |
| Avisos | `/(tabs)/(main)/notifications`, `/(tabs)/alerts` | Notificaciones y alertas. La corrección UTF-8 previa está integrada en `dev`; PR #32 mejora la presentación de estados y alertas de dispositivos. |
| Cuenta | `/(tabs)/(main)/profile`, `/(tabs)/settings`, `/(tabs)/personal-info`, `/(tabs)/language`, `/(tabs)/change-password`, `/(tabs)/account-security`, `/(tabs)/close-sessions` | Perfil, preferencias, idioma, datos personales, contraseña y seguridad. PR #34 enlaza las pantallas existentes y reduce duplicaciones; #35 mejora datos visibles, mensajes, controles y protección contra acciones duplicadas. |
| Ayuda y utilidades | `/(tabs)/help`, `/(tabs)/about-smart-home`, `/(tabs)/favorites`, `/(tabs)/invitations`, `/+not-found` | Ayuda, información de la app, favoritos, invitaciones y recuperación de rutas. PR #35 localiza estos estados y elimina la acción falsa de contacto; aún no existe canal de soporte conectado. |

No se encontraron rutas adicionales de habitaciones ni un flujo de pairing BLE completo. No se agregó ninguna interfaz que prometa esas capacidades.

`app/(tabs)/README_PANTALLAS.md` conserva notas históricas que describen varias capacidades como simuladas o pendientes y no representa el estado actual de todas las rutas. Este inventario refleja los archivos de ruta actuales y la evidencia de los PR revisados.

## Cambios por área

- **Sistema de diseño:** Emerald es el valor inicial para instalaciones nuevas; Classic guardado y los modos claro/oscuro se conservan. Se alinean tokens compartidos, tipografía, elementos de navegación y splash.
- **Autenticación:** enlaces de login y registro quedan próximos a la acción primaria, los campos de contraseña tienen controles independientes y las respuestas evitan filtrar existencia de cuentas. Términos/Privacidad permanecen pendientes de URLs aprobadas.
- **Dispositivos:** estado de conectividad se distingue del estado del interruptor; listas, filtros y controles respetan hogares accesibles y permisos. BLE se presenta como lectura experimental.
- **Energía:** Reports, Tarifas, Nueva tarifa y Metas permanecen separados. No se inventan datos y se conservan contratos SQL034.
- **Perfil y configuración:** se muestran datos de rol de sesión y navegación a pantallas reales, con menos accesos duplicados.
- **Pantallas secundarias:** FAQ alineadas al comportamiento real, versión/plataforma obtenidas de Expo/OS, respuestas de invitaciones con el nombre del hogar y estados de error/carga más explícitos. Acciones sensibles mantienen confirmación y evitan solicitudes concurrentes.

## Validación ejecutada

La pasada local se ejecutó en `feature/mobile-secondary-screens` (`2d27a65`), rama apilada sobre Perfil/Configuración y Sistema de diseño. Los resultados no deben interpretarse como una única compilación que incluya los cambios de todos los PR, porque los PR de las fases 2–4 continúan separados.

| Comando | Resultado local |
|---|---|
| `npm.cmd run lint` | Aprobado |
| `npm.cmd run typecheck` | Aprobado |
| `npm.cmd run test:mobile-config` | 6 aprobadas |
| `npm.cmd run test:navigation-auth` | 6 aprobadas |
| `npm.cmd run test:alerts` | 10 aprobadas |
| `npm.cmd run test:realtime-device-status` | 9 aprobadas |
| `npm.cmd run test:energy-sql034` | 11 aprobadas |
| `npm.cmd run test:shelly-mqtt-pairing` | 18 aprobadas |
| `node scripts/device-presentation.test.js` | 3 aprobadas |
| `node scripts/profile-settings-actions.test.mjs` | 2 aprobadas |
| `node scripts/language-preferences.test.mjs` | 3 aprobadas |
| `git diff --check` | Aprobado |
| `npx.cmd expo export --platform all` | Aprobado en reintento fuera del sandbox; generó bundles iOS y Android en una carpeta temporal. El `dist/` existente quedó intacto. |
| `npm.cmd run test:shelly-ble-rpc` | Falló en este árbol de fases 1, 5 y 6: el mock de `scripts/shelly-gatt-rpc.test.js` no implementa `manager.onDeviceDisconnected`. No se modificaron BLE ni su mock en esta fase. Repetir después de integrar la fase 3, cuyo PR #32 tiene CI exitoso. |

Las suites exitosas sumaron 68 pruebas. Además, la ejecución registrada de CI Mobile #143, #145, #147, #149, #151 y #153 terminó con éxito en los respectivos commits de fase.

## Pendientes y riesgos

- Hacer revisión visual real en Android y iOS: teléfonos pequeños/medianos/grandes, zonas seguras, teclado, texto ampliado, lector de pantalla, temas Classic/Emerald en claro/oscuro y navegación por roles.
- Revisar registro tras recibir y aprobar destinos reales para Términos y Política de Privacidad. No inventar documentos ni URLs.
- Conectar un canal real de soporte antes de ofrecer contacto desde Ayuda.
- Repetir lint, TypeScript, todas las suites —incluida BLE— y exportación/build sobre la rama resultante una vez integrados los PR en el orden indicado.
- `expo export` valida el empaquetado JS para Android/iOS, pero no sustituye un build nativo/EAS ni pruebas de instalación, permisos, hardware, backend o broker MQTT.
- Las suites de MQTT son automatizadas; no se hizo pairing físico Shelly ni prueba de red local/BLE en hardware real.
- No se generaron capturas comparativas porque no había emulador o dispositivo conectado durante esta revisión.

## Checklist de salida a producción

- [x] Lint y TypeScript en la rama validada.
- [x] Suites locales de configuración, navegación/auth, alertas, tiempo real, SQL034, MQTT, dispositivos y perfil/idioma.
- [x] Exportación JavaScript Android/iOS.
- [x] CI de los PR #30–#35 exitoso al momento de consultar.
- [ ] Integrar y probar conjuntamente los PR #30–#35; ninguno fue mergeado por esta intervención.
- [ ] Revisar BLE RPC en la revisión integrada y resolver/confirmar el fixture de prueba.
- [ ] Revisiones visuales y funcionales en dispositivos Android/iOS.
- [ ] Build nativo/EAS e instalación.
- [ ] Aprobación y navegación a documentos reales de Términos y Privacidad.
- [ ] Incorporar canal de soporte real o mantener explícita su ausencia.
- [ ] Ejecutar pruebas de integración con backend, hardware Shelly, LAN, BLE y MQTT en entorno autorizado.

No se declara la aplicación certificada ni lista para producción mientras permanezcan pendientes los puntos anteriores.
