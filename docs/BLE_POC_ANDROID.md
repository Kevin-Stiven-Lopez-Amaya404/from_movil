# POC BLE Android — descubrimiento Shelly

Estado: escaneo implementado localmente; falta build/instalación en Android y prueba con el Shelly real. Esto no implementa pairing de producto.

## Qué hace esta POC

La pantalla **Agregar dispositivo** busca anuncios BLE cuyo nombre empieza por `Shelly`, solicita los permisos Android requeridos, muestra nombre/RSSI y ordena candidatos por señal. La búsqueda termina a los 12 segundos y se puede cancelar.

La POC no conecta a GATT, no inicia bonding, no solicita ni envía credenciales Wi-Fi/MQTT y no llama al backend para crear sesiones. Un nombre Shelly o una señal fuerte no demuestra identidad ni posesión. El adaptador rechaza conexiones mientras no se complete la validación física.

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

Siguiente puerta: build e inspección del anuncio con Android físico; después, documentar y validar el perfil GATT/RPC del Shelly 1PM Gen4 antes de habilitar conexión o bonding.
