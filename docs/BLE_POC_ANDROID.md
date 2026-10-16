# POC BLE Android — descubrimiento Shelly

Estado: escaneo BLE implementado; protocolo GATT/RPC de Shelly identificado en documentación oficial. Falta implementar la conexión nativa, construir/instalar en Android y probar con el Shelly real. Esto no implementa pairing de producto.

## Qué hace esta POC

La pantalla **Agregar dispositivo** busca anuncios BLE cuyo nombre empieza por `Shelly`, solicita los permisos Android requeridos, muestra nombre/RSSI y ordena candidatos por señal. La búsqueda termina a los 12 segundos y se puede cancelar.

La POC todavía no conecta a GATT, no inicia bonding, no solicita ni envía credenciales Wi-Fi/MQTT y no llama al backend para crear sesiones. Un nombre Shelly o una señal fuerte no demuestra identidad ni posesión. El adaptador rechaza conexiones mientras no se complete la validación física.

## Perfil GATT documentado

La documentación técnica y la base de conocimiento de Shelly describen RPC JSON sobre el servicio GATT `5f6d4f53-5f52-5043-5f53-56435f49445f`, con tres características: datos (`...5f64-6174615f5f5f`), longitud de solicitud/TX (`...5f74-785f63746c5f`) y longitud de respuesta/RX (`...5f72-785f63746c5f`). La solicitud se codifica como UTF-8 JSON y su longitud se escribe como entero unsigned de cuatro bytes big-endian antes de los datos. El dispositivo notifica la longitud de respuesta por RX; el cliente lee la respuesta desde la característica de datos y valida el ID JSON-RPC.

En firmware 2.0+, Shelly exige bonding BLE para RPC fuera de la ventana inicial de provisión. El estado de provisión se obtiene mediante `Shelly.GetDeviceInfo`: `pending` permite RPC durante la ventana inicial de 15 minutos; `confirmed` permite una gracia temporal; `complete` desactiva BLE RPC salvo que exista bonding, y `locked` conserva el anuncio pero deja solo GAP accesible. Por eso, ver el dispositivo en el escaneo no garantiza que la app pueda abrir RPC. No se debe reiniciar, restablecer ni cambiar configuración para intentar abrir esa ventana sin coordinar la prueba.

La documentación describe el protocolo, pero no acredita que el Shelly 1PM Gen4 concreto y el build `20260819-101735/2.0.1-beta1-g8a88c73` permitan el flujo requerido desde Android. El firmware reportado por la app debe confirmarse en su interfaz web. El bonding Just Works proporciona cifrado del enlace, pero no autenticación MITM; no se debe tratar como prueba criptográfica de propiedad ni como sustituto de una sesión backend.

Fuentes primarias consultadas el 15/10/2026:

- [Shelly BLE RPC sobre GATT](https://kb.shelly.cloud/knowledge-base/kbsa-communicating-with-shelly-devices-via-bluetoo)
- [Documentación técnica BLE, bonding y BLE RPC](https://shelly-api-docs.shelly.cloud/gen2/ComponentsAndServices/BLE/)
- [Sys: provisión segura y estados de `Shelly.GetDeviceInfo`](https://shelly-api-docs.shelly.cloud/gen2/ComponentsAndServices/Sys/)

## Preparar un APK local

Requisitos: Node.js `20.19.4+`, Android SDK con Android SDK Platform 36, JDK compatible, `adb` en PATH y un Android conectado con depuración USB habilitada. Expo Go no incluye el módulo BLE nativo; se requiere un development build.

En PowerShell, desde la raíz del proyecto:

```powershell
npm install
$env:ANDROID_PACKAGE = 'com.smarthome.poc'
npx expo prebuild --platform android --no-install
npx expo run:android
Remove-Item Env:ANDROID_PACKAGE
```

`ANDROID_PACKAGE` solo satisface el identificador que exige Expo en una compilación local; se mantiene fuera de los archivos. Para publicar, el equipo debe definir su identificador definitivo en el entorno EAS.

## Ejecutar y registrar resultados

1. Confirma versión y build del firmware desde la interfaz web local del Shelly.
2. Activa Bluetooth y concede a Smart Home los permisos del diálogo Android.
3. Abre **Agregar dispositivo** y pulsa **Buscar dispositivos Shelly**.
4. Comprueba que los anuncios cercanos aparecen una sola vez, ordenados por RSSI, y cancela o espera el timeout.
5. Registra versión Android/API, APK/commit, permisos, nombre anunciado, RSSI aproximado, duración y resultado. No registres la dirección BLE, contraseñas, tokens o capturas con secretos.

No selecciones **vincular** basándote en el resultado de esta pantalla: la UI no ofrece esa acción. No reinicies ni cambies Wi-Fi, MQTT, BLE o firmware durante esta prueba.

## Dependencia y verificación local

Se fijó `@sfourdrinier/react-native-ble-plx` `3.9.3` porque declara soporte para Expo SDK 57 y React Native 0.86; es un fork MIT cuyo README solicita mantenedores. Revisión de mantenimiento y compatibilidad de release sigue pendiente antes de producción.

Validación en el entorno de desarrollo: TypeScript, ESLint, cinco pruebas de `test:mobile-config` y `expo prebuild --platform android --no-install` pasaron. El prebuild se generó con el identificador POC anterior. Este entorno no tiene Android SDK ni `adb`, así que aún no se construyó/instaló el APK y no se comprobó BLE con hardware.

Siguiente puerta: implementar el transporte GATT detrás de una POC aislada, compilar e inspeccionar el anuncio con Android físico, leer `Shelly.GetDeviceInfo` sin alterar la configuración y registrar el estado de provisión y firmware. La carga de credenciales y la integración backend se mantienen deshabilitadas hasta validar acceso GATT, límites de bonding, provisión segura y contrato EMQX soportado.
