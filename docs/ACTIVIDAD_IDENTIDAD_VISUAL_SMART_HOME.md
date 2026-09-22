# Actividad: aplicación de identidad visual al proyecto Smart Home

## 1. Datos generales

| Campo                   | Información                                                                           |
| ----------------------- | ------------------------------------------------------------------------------------- |
| Proyecto                | Smart Home                                                                            |
| Tipo de producto        | Aplicación móvil para gestionar hogares inteligentes                                  |
| Tecnologías             | React Native, Expo, Expo Router y TypeScript                                          |
| Referencia visual       | Manual de Identidad Visual y Estilos Web de Ariza Websites                            |
| Alcance de la actividad | Definir y adaptar la identidad visual del manual a las pantallas móviles del proyecto |

## 2. Objetivo

Aplicar los principios visuales del manual de Ariza Websites al frontend móvil de Smart Home, manteniendo una interfaz clara, consistente y adaptable. La identidad se utilizará como referencia para organizar colores, tipografías, botones, campos de formulario, iconografía, navegación y espaciado.

La marca del producto continúa siendo **Smart Home**. Por tanto, el manual se toma como guía visual y no como sustitución del nombre, logo o funcionalidad de la aplicación.

## 3. Descripción del proyecto

Smart Home es una aplicación móvil frontend que permite simular la gestión de hogares inteligentes. El usuario puede:

- Registrarse e iniciar sesión.
- Recuperar su contraseña mediante correo y código OTP.
- Consultar un dashboard con consumo energético.
- Crear hogares y asociar dispositivos.
- Encender o apagar dispositivos.
- Consultar reportes de consumo.
- Revisar alertas, perfil y actividad de seguridad.
- Configurar idioma, tema y preferencias de la aplicación.

La navegación principal está implementada con Expo Router y se organiza mediante una barra inferior personalizada. La información de usuarios, hogares, dispositivos y reportes se maneja actualmente en memoria mediante contexto y servicios simulados.

## 4. Lectura del manual de identidad

El manual de Ariza Websites establece una identidad tecnológica y corporativa basada en los siguientes elementos:

- Logotipo con variantes para fondo claro y fondo oscuro.
- Uso de un azul corporativo como color primario.
- Cian y naranja como colores secundarios.
- Neutros claros y oscuros para fondos, textos y superficies.
- Verde, rojo y amarillo para estados semánticos.
- **Montserrat Bold** para titulares.
- **Poppins** para textos, botones y enlaces.
- Botones con estados normal, hover, presionado y deshabilitado.
- Campos de formulario con estados normal, enfocado y error.
- Iconografía lineal, simple y de trazo azul.
- Retícula y espaciado consistente para conservar orden visual.

En una aplicación móvil, el estado `hover` se interpreta como una respuesta de interacción equivalente, por ejemplo, `pressed`, `focused` o `selected`, ya que la pantalla táctil no tiene puntero.

## 5. Sistema de color adaptado

Los siguientes tokens se derivan de la paleta mostrada en el manual y se aplican al contexto de Smart Home:

| Token          | Color     | Aplicación en Smart Home                                             |
| -------------- | --------- | -------------------------------------------------------------------- |
| `primary`      | `#0066CC` | Acciones principales, enlaces, iconos activos y navegación           |
| `secondary`    | `#33CCFF` | Indicadores de energía, gráficos y elementos de apoyo                |
| `accent`       | `#FF8C00` | Destacados, consumo, llamados de atención y acciones complementarias |
| `neutralDark`  | `#333333` | Texto principal y títulos sobre fondos claros                        |
| `neutralLight` | `#EEEEEE` | Fondos secundarios, divisores y superficies suaves                   |
| `white`        | `#FFFFFF` | Fondo principal, texto sobre color y tarjetas claras                 |
| `success`      | `#28A745` | Hogar conectado, dispositivo activo y operación exitosa              |
| `error`        | `#DC3545` | Errores de formulario, alertas críticas y acciones destructivas      |
| `warning`      | `#FFC107` | Advertencias, consumo elevado y estados pendientes                   |

### Reglas de uso

1. El azul `#0066CC` debe concentrar las acciones principales para que el usuario identifique rápidamente qué puede hacer.
2. El cian y el naranja deben funcionar como acentos, no como fondos dominantes de toda la pantalla.
3. Verde, rojo y amarillo se reservarán para estados semánticos; no se usarán únicamente como decoración.
4. El texto principal debe conservar contraste suficiente con el fondo.
5. En modo oscuro, las superficies pueden oscurecerse, pero los colores semánticos deben seguir siendo reconocibles.

## 6. Tipografía

La jerarquía del manual se adapta a la información que aparece en las pantallas del proyecto:

| Nivel              | Fuente propuesta |    Peso | Uso                                                 |
| ------------------ | ---------------- | ------: | --------------------------------------------------- |
| Display            | Montserrat       |     700 | Nombre de la aplicación o encabezado excepcional    |
| Título de pantalla | Montserrat       |     700 | Dashboard, Hogares, Reportes, Perfil y Ajustes      |
| Título de sección  | Montserrat       |     700 | Consumo actual, Mis hogares, Dispositivos activos   |
| Texto general      | Poppins          |     400 | Descripciones, filas, datos y contenido de tarjetas |
| Botón              | Poppins          |     600 | Acciones primarias y secundarias                    |
| Enlace             | Poppins          | 400/600 | Recuperar contraseña, ayuda y navegación secundaria |
| Texto auxiliar     | Poppins          |     400 | Mensajes de validación, fechas y metadatos          |

En la implementación actual, `lib/theme/typography.ts` usa fuentes nativas del sistema para asegurar compatibilidad. La alineación completa con el manual requeriría cargar Montserrat y Poppins mediante `expo-font`; mientras tanto, se conservará la jerarquía de pesos y tamaños para evitar cambios visuales inconsistentes.

## 7. Componentes e interacciones

### 7.1 Botones

| Estado        | Aplicación móvil                                                      |
| ------------- | --------------------------------------------------------------------- |
| Normal        | Fondo `#0066CC`, texto blanco y radio moderado                        |
| Presionado    | Azul más oscuro y ligera reducción de opacidad                        |
| Enfocado      | Borde o indicador visible para navegación con teclado o accesibilidad |
| Deshabilitado | Fondo neutro, texto atenuado y sin interacción                        |
| Secundario    | Fondo transparente o blanco con borde azul                            |
| Destructivo   | Color `#DC3545`, especialmente para cerrar sesiones o eliminar datos  |

El componente `PrimaryButton` ya centraliza la acción principal del flujo de autenticación. Su estilo debe alinearse con el token `primary`, conservar una altura táctil cómoda y mostrar estados de carga y deshabilitado.

### 7.2 Campos de formulario

Los formularios de login, registro, recuperación y nueva contraseña deben conservar tres estados visibles:

- **Normal:** borde neutro y texto auxiliar en gris.
- **Enfocado:** borde azul `#0066CC` y etiqueta claramente legible.
- **Error:** borde rojo `#DC3545` y mensaje de error debajo del campo.

Estos estados se aplican a `AuthTextField`, `AuthCheckboxRow` y `FormErrorText` sin cambiar las reglas de validación existentes.

### 7.3 Tarjetas y superficies

Las tarjetas de dashboard, hogares y reportes deben usar fondos blancos o neutros claros, bordes suaves y jerarquía interna clara. El color no debe ocultar los datos de consumo ni competir con el valor principal de la tarjeta.

En modo oscuro, las tarjetas deben usar una superficie oscura diferenciada del fondo y conservar el azul como color de acción, respetando el tema ya existente en `lib/theme/app-theme.ts`.

### 7.4 Iconografía

La iconografía seguirá un estilo lineal y reconocible para representar:

- Dashboard y hogares.
- Energía y reportes.
- Alertas.
- Perfil y configuración.
- Dispositivos, habitaciones y estados de conexión.

Los iconos activos pueden usar `#0066CC`; los inactivos deben usar neutros. Los iconos de estado deben combinar color y texto o una etiqueta accesible, para no depender únicamente del color.

## 8. Navegación móvil

El proyecto cuenta con `components/LiquidNavigation.tsx`, una barra inferior personalizada para las rutas de `(tabs)`. Esta solución es compatible con la referencia de navegación definida para el proyecto: barra oscura, flotante, horizontal, con iconos distribuidos y acceso destacado al perfil.

La navegación principal debe conservar estas secciones:

| Ruta      | Función                                  | Tratamiento visual                           |
| --------- | ---------------------------------------- | -------------------------------------------- |
| Dashboard | Resumen de consumo y hogares favoritos   | Icono activo en azul o blanco según el fondo |
| Hogares   | Gestión de hogares y dispositivos        | Acceso a tarjetas y habitaciones             |
| Energía   | Reportes y tendencias de consumo         | Uso de cian y naranja como acentos           |
| Alertas   | Eventos y estados que requieren atención | Indicadores amarillo, rojo o verde           |
| Perfil    | Información y seguridad de la cuenta     | Botón elevado o acceso visual destacado      |

La barra debe respetar el área segura inferior del dispositivo y conservar un tamaño estable para evitar desplazamientos cuando cambien los títulos o estados.

## 9. Aplicación por pantalla

| Pantalla o módulo         | Aplicación de la identidad                                                             |
| ------------------------- | -------------------------------------------------------------------------------------- |
| `welcome.tsx`             | Logo Smart Home, fondo limpio, título Montserrat, CTA azul y acción secundaria outline |
| `login.tsx`               | Campos con estados del manual, botón primario, enlace azul para recuperación           |
| `register.tsx`            | Formulario estructurado por secciones, checkbox visible y errores semánticos           |
| `forgot-password.tsx`     | Campos de país y correo, explicación breve y CTA primario                              |
| `otp-verification.tsx`    | Seis campos de código con foco visible y mensaje de validación                         |
| `new-password.tsx`        | Campos de contraseña, indicadores de error y confirmación de éxito                     |
| `app/(tabs)/index.tsx`    | Dashboard con consumo actual, hogares favoritos y estados de dispositivos              |
| `app/(tabs)/homes.tsx`    | Lista de hogares, habitaciones y dispositivos con acciones claras                      |
| `app/(tabs)/reports.tsx`  | Gráficos con azul, cian y naranja; filtros con control segmentado                      |
| `app/(tabs)/alerts.tsx`   | Estados semanticamente diferenciados y mensajes priorizados                            |
| `app/(tabs)/profile.tsx`  | Datos de usuario, accesos rápidos y secciones de seguridad                             |
| `app/(tabs)/settings.tsx` | Preferencias, idioma, tema, sesiones y cierre de sesión                                |

## 10. Espaciado y adaptación responsive

Se propone una unidad base de **8 px** para construir márgenes, separación entre elementos y tamaños de control. En React Native, esta unidad se traduce a valores de diseño adaptados a densidad y tamaño de pantalla.

Reglas principales:

- Mantener márgenes laterales constantes y suficientes para lectura.
- Separar título, contenido y acción dentro de cada pantalla.
- Usar alturas estables en botones, tabs, campos e indicadores.
- Respetar `SafeAreaView` y las áreas seguras del dispositivo.
- Evitar que textos largos oculten botones o información crítica.
- Usar `ScrollView` cuando el contenido del formulario no quepa en una pantalla pequeña.
- Mantener el área táctil de controles en un tamaño cómodo y accesible.

## 11. Diagnóstico del estado actual

| Aspecto     | Estado actual                                                                 | Acción de alineación                                                                |
| ----------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Colores     | El proyecto usa varios azules cercanos, como `#0057B8`, `#0047AB` y `#003380` | Centralizar el azul principal en `#0066CC` y documentar excepciones del modo oscuro |
| Tipografía  | Se usan fuentes nativas del sistema                                           | Mantener fallback compatible o cargar Montserrat/Poppins con `expo-font`            |
| Botones     | Existe `PrimaryButton` con estados de carga, presión y deshabilitado          | Homologar colores, radio, peso y estados con el manual                              |
| Formularios | Existen campos, checkbox y mensajes de error reutilizables                    | Aplicar estados normal, enfocado y error de forma consistente                       |
| Navegación  | Existe `LiquidNavigation` con tabs personalizados                             | Mantener la barra flotante y revisar contraste e iconos activos                     |
| Tema oscuro | Está contemplado en `getAppTheme`                                             | Crear equivalentes de la paleta sin perder contraste ni semántica                   |
| Logo        | Existe `SmartHomeLogo` para la marca del proyecto                             | Conservar el logo Smart Home; no reemplazarlo por el logo Ariza del manual          |
| Iconos      | Se usan iconos de navegación y componentes propios                            | Unificar estilo lineal y etiquetas de accesibilidad                                 |

## 12. Criterios de aceptación

La actividad se considera cumplida cuando:

- Todas las pantallas principales usan una paleta documentada y consistente.
- Los botones distinguen normal, presionado, enfocado y deshabilitado.
- Los campos distinguen normal, enfocado y error.
- Los colores verde, rojo y amarillo representan estados comprensibles.
- La jerarquía tipográfica diferencia títulos, cuerpo, enlaces y textos auxiliares.
- La navegación inferior se adapta al área segura y mantiene sus dimensiones.
- La identidad de Smart Home se conserva sin confundirla con la marca del manual.
- El modo claro y oscuro mantienen legibilidad y contraste.
- Los componentes reutilizables reciben los tokens desde el tema centralizado.
- La propuesta coincide con las funcionalidades reales descritas en la documentación del proyecto.

## 13. Conclusión

El manual de Ariza Websites aporta una base visual clara para profesionalizar Smart Home: azul corporativo para acciones, colores semánticos para estados, tipografía jerarquizada, componentes con estados y una retícula consistente. La adaptación propuesta respeta la naturaleza móvil del proyecto y conserva sus funcionalidades reales de autenticación, hogares, dispositivos, energía, alertas, perfil y configuración.

La siguiente etapa recomendada es consolidar los tokens en `constants/theme.ts`, revisar los componentes reutilizables y validar cada pantalla en Android, iOS y Expo Web.
