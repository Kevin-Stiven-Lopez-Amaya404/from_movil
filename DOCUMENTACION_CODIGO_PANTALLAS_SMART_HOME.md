# Documentación del código por pantalla - Smart Home

Este documento explica el funcionamiento técnico de las pantallas principales del proyecto Smart Home. Está escrito para estudiar y defender el código en un examen, explicando qué hace cada pantalla, por qué se implementó así y qué mejoras se podrían aplicar.

---

## 1. Pantalla: Bienvenida

**Archivo:** `app/welcome.tsx`

### 1. Nombre de la pantalla

Pantalla de bienvenida o pantalla inicial.

### 2. Objetivo de la pantalla

Presentar la marca Smart Home y permitir al usuario elegir cómo entrar a la aplicación: iniciar sesión, registrarse o usar el flujo preparado de Google. También permite cambiar entre tema claro y oscuro desde el inicio.

### 3. Flujo de funcionamiento

1. El usuario abre la aplicación.
2. La pantalla obtiene el tema actual desde `useSmartHome`.
3. Calcula la paleta visual mediante `getAuthPalette`.
4. Muestra selector de modo claro/oscuro.
5. Muestra el logo `SmartHomeLogo`.
6. Muestra botones de navegación:
   - Iniciar sesión.
   - Registrarse.
   - Continuar con Google.
7. Si el usuario presiona Google, se muestra una alerta indicando que OAuth está preparado para producción y lo envía al login.

### 4. Análisis del código

- Importa componentes visuales como `GoogleIcon` y `SmartHomeLogo`.
- Usa `useRouter` para navegación.
- Usa `useResponsiveLayout` para ajustar ancho y márgenes según pantalla.
- Usa `useSmartHome` para leer y modificar `colorMode`.
- Usa `SafeAreaView` de `react-native-safe-area-context` para respetar márgenes seguros del dispositivo.
- El render se divide en tres zonas:
  - Selector de tema.
  - Logo.
  - Botones de acceso.

### 5. Funciones y métodos

| Función | Qué hace | Cuándo se ejecuta | Devuelve |
|---|---|---|---|
| `handleGoogleLogin()` | Muestra una alerta y redirige al login. | Al presionar “Continuar con Google”. | No devuelve valor. |
| `setColorMode(mode)` | Cambia tema claro/oscuro en estado global. | Al presionar botón Claro u Oscuro. | No devuelve valor. |
| `router.push("/login")` | Navega al login. | Al presionar “Iniciar sesión”. | No devuelve valor. |
| `router.push("/register")` | Navega al registro. | Al presionar “Registrarse”. | No devuelve valor. |

### 6. Variables importantes

| Variable | Propósito |
|---|---|
| `layout` | Contiene medidas responsive como ancho máximo, safe top y safe bottom. |
| `colorMode` | Indica si la app está en modo claro u oscuro. |
| `palette` | Paleta de colores para pantallas de autenticación. |
| `dark` | Booleano para saber si el modo oscuro está activo. |

### 7. Estados y lógica de negocio

Esta pantalla no tiene estados locales. La lógica principal está en el estado global `colorMode`, porque el usuario puede cambiar el tema antes de iniciar sesión.

### 8. Componentes utilizados

- `SmartHomeLogo`: muestra el logo principal.
- `GoogleIcon`: muestra el icono de Google.
- `SafeAreaView`: respeta márgenes del dispositivo.
- `Pressable`: botones interactivos.
- `Ionicons`: iconos para claro/oscuro.

### 9. Navegación

- Desde esta pantalla se navega a:
  - `/login`
  - `/register`
- También puede enviar al login desde el botón de Google.

### 10. Conexión con otras capas

Se conecta con:

- `lib/smart-home-context.tsx`: para tema global.
- `lib/appearance.ts`: para obtener paleta visual.
- `lib/responsive.ts`: para adaptar layout.

No consume backend ni base de datos.

### 11. Buenas prácticas utilizadas

- Separación de logo e iconos en componentes.
- Navegación centralizada con Expo Router.
- Uso de safe area para móviles.
- Estado de tema global reutilizable.

### 12. Posibles mejoras

- Implementar OAuth real para Google.
- Corregir textos con codificación dañada como `sesiÃ³n`.
- Extraer textos a `i18n`.
- Mejorar accesibilidad con `accessibilityLabel` en todos los botones.

### 13. Resumen final

La pantalla de bienvenida es la entrada principal de la app. Permite seleccionar tema, ver la marca y elegir cómo ingresar.

### 14. Cómo explicarlo en un examen

> Esta pantalla es el punto de entrada de la aplicación. Su función es presentar Smart Home y permitir que el usuario vaya al login o al registro. También permite cambiar el tema claro u oscuro usando el estado global del contexto. Utiliza `SafeAreaView` para adaptarse a Android y iPhone, y `useResponsiveLayout` para ajustar el ancho del contenido según el tamaño de pantalla.

---

## 2. Pantalla: Inicio de sesión

**Archivo:** `app/login.tsx`

### 1. Nombre de la pantalla

Pantalla de inicio de sesión.

### 2. Objetivo de la pantalla

Permitir que un usuario ingrese a la aplicación con correo y contraseña. También ofrece acceso demo, recuperación de contraseña y enlace a registro.

### 3. Flujo de funcionamiento

1. El usuario entra desde bienvenida o desde registro.
2. Puede llenar correo y contraseña manualmente.
3. Puede presionar “Usar acceso demo” para autocompletar credenciales.
4. El sistema valida formato de correo y longitud de contraseña.
5. Si la cuenta está desactivada, muestra alerta para reactivarla.
6. Si los datos son incorrectos, aumenta contador de intentos fallidos.
7. Si los datos son válidos, actualiza el nombre de sesión y navega a tabs.

### 4. Análisis del código

- Usa `authenticateUser` para validar credenciales contra usuarios en memoria.
- Usa `isValidEmail` para validar formato de correo.
- Usa `useMemo` para calcular `securityHint` según intentos fallidos.
- Usa `KeyboardAvoidingView` para que el teclado no tape campos.
- Usa `ScrollView` para que la pantalla sea desplazable en móviles pequeños.

### 5. Funciones y métodos

| Función | Qué hace | Cuándo se ejecuta | Devuelve |
|---|---|---|---|
| `fillDemoUser()` | Llena email y contraseña demo. | Al tocar “Usar acceso demo”. | Nada. |
| `handleLogin()` | Valida campos, autentica usuario y navega al dashboard. | Al presionar “Iniciar sesión”. | Nada. |
| `authenticateUser(email, password)` | Busca usuario en memoria y compara contraseña. | Dentro de `handleLogin`. | Usuario o `null`. |
| `setSessionName()` | Guarda nombre del usuario en contexto global. | Cuando login es correcto. | Nada. |

### 6. Variables importantes

| Variable | Propósito |
|---|---|
| `email` | Correo ingresado. |
| `password` | Contraseña ingresada. |
| `showPassword` | Controla si se muestra u oculta contraseña. |
| `rememberMe` | Estado visual del checkbox recordar. |
| `touched` | Indica si el usuario ya interactuó con los campos. |
| `failedAttempts` | Cuenta intentos fallidos para cambiar mensaje de ayuda. |
| `canSubmit` | Determina si el formulario es válido. |
| `securityHint` | Mensaje dinámico según intentos fallidos. |

### 7. Estados y lógica de negocio

La pantalla maneja estados locales para formulario y errores. La lógica de negocio más importante es:

- No autenticar si campos son inválidos.
- No dejar entrar si la cuenta está desactivada.
- Incrementar intentos fallidos si credenciales no coinciden.
- Guardar nombre de sesión si login es correcto.

### 8. Componentes utilizados

- `BackButton`: permite volver a bienvenida.
- `CheckIcon`: aparece cuando el checkbox está activo.
- `TextInput`: campos de email y contraseña.
- `KeyboardAvoidingView`: evita que teclado cubra campos.
- `SafeAreaView`: respeta márgenes seguros.

### 9. Navegación

- Llega desde `/welcome`.
- Puede ir a:
  - `/forgot-password`
  - `/register`
  - `/(tabs)` si login es exitoso.

### 10. Conexión con otras capas

- `lib/auth-store.ts`: autenticación simulada.
- `lib/validators.ts`: validación de email.
- `lib/smart-home-context.tsx`: sesión y cuenta activa.
- `lib/appearance.ts`: paleta por tema.

### 11. Buenas prácticas utilizadas

- Validación antes de autenticar.
- Separación de autenticación en `auth-store`.
- Uso de `useMemo` para no recalcular mensajes innecesariamente.
- Manejo de teclado para móviles.

### 12. Posibles mejoras

- El checkbox “recordar contraseña” es visual; debería conectarse a persistencia segura.
- Implementar autenticación real con backend.
- Evitar guardar contraseñas en memoria en producción.
- Corregir textos con caracteres dañados.

### 13. Resumen final

Esta pantalla valida credenciales, maneja errores, permite acceso demo y lleva al usuario al dashboard si el login es correcto.

### 14. Cómo explicarlo en un examen

> La pantalla de login se encarga de validar el acceso del usuario. Maneja estados para email, contraseña, visibilidad de contraseña, intentos fallidos y recordatorio. Antes de entrar, valida formato de correo y longitud mínima. La autenticación se hace con `authenticateUser`, que consulta usuarios simulados en memoria. Si el login es correcto, guarda el nombre del usuario en el contexto global y redirige a las pestañas principales.

---

## 3. Pantalla: Registro

**Archivo:** `app/register.tsx`

### 1. Nombre de la pantalla

Pantalla de registro de usuario.

### 2. Objetivo de la pantalla

Permitir crear una cuenta local simulada con nombre, correo, contraseña y aceptación de términos.

### 3. Flujo de funcionamiento

1. El usuario entra desde bienvenida o login.
2. Ingresa nombre, correo, contraseña y confirmación.
3. El sistema evalúa reglas de contraseña.
4. El usuario acepta términos.
5. Al presionar registrarse se validan campos.
6. Si hay errores, muestra alerta.
7. Si el correo ya existe, informa al usuario.
8. Si el registro es correcto, navega al login.

### 4. Análisis del código

- Usa `registerUser` para guardar usuario en memoria.
- Usa `getPasswordRules` para medir fortaleza de contraseña.
- Usa `isValidEmail` para validar correo.
- Usa `submitted` para mostrar errores solo después del intento de envío.
- Muestra indicadores visuales de reglas cumplidas con `CheckIcon`.

### 5. Funciones y métodos

| Función | Qué hace | Cuándo se ejecuta | Devuelve |
|---|---|---|---|
| `visibleError(key)` | Decide si un error debe mostrarse. | Al renderizar errores. | Texto de error o vacío. |
| `showTerms()` | Muestra alerta con términos. | Al presionar enlaces de términos. | Nada. |
| `handleRegister()` | Valida y registra usuario. | Al presionar “Registrarse”. | Nada. |
| `registerUser(user)` | Guarda usuario si el correo no existe. | Dentro de `handleRegister`. | Objeto con `ok`. |

### 6. Variables importantes

| Variable | Propósito |
|---|---|
| `firstName` | Nombre del usuario. |
| `email` | Correo ingresado. |
| `password` | Contraseña. |
| `confirmPassword` | Confirmación de contraseña. |
| `acceptTerms` | Indica si aceptó términos. |
| `submitted` | Controla cuándo mostrar errores. |
| `passwordRules` | Reglas de seguridad de contraseña. |
| `strength` | Cantidad de reglas cumplidas. |
| `canSubmit` | Indica si el formulario está completo y válido. |

### 7. Estados y lógica de negocio

La lógica de negocio se enfoca en validar antes de crear usuario:

- Nombre mínimo de 2 caracteres.
- Email válido.
- Contraseña fuerte.
- Confirmación igual.
- Términos aceptados.
- Correo no repetido.

### 8. Componentes utilizados

- `BackButton`: vuelve a bienvenida.
- `CheckIcon`: muestra reglas de contraseña cumplidas y checkbox.
- `TextInput`: campos del formulario.
- `KeyboardAvoidingView`: mejora experiencia con teclado.

### 9. Navegación

- Llega desde `/welcome` o `/login`.
- Navega a `/login` después de crear cuenta.

### 10. Conexión con otras capas

- `lib/auth-store.ts`: registro en memoria.
- `lib/validators.ts`: email y reglas de contraseña.
- `constants/theme.ts`: colores y medidas.
- `lib/responsive.ts`: adaptación de pantalla.

### 11. Buenas prácticas utilizadas

- Validación centralizada en objeto `errors`.
- Reglas de contraseña separadas en utilidad.
- Uso de `useMemo` para reglas.
- No muestra errores antes de intentar enviar.

### 12. Posibles mejoras

- Persistir usuarios en base de datos.
- Eliminar o ajustar términos si no son parte del alcance.
- Corregir textos con codificación dañada.
- Agregar confirmación visual más clara al crear cuenta.

### 13. Resumen final

Registro crea usuarios simulados en memoria después de validar datos básicos y contraseña segura.

### 14. Cómo explicarlo en un examen

> Esta pantalla permite registrar un nuevo usuario. El código maneja estados para cada campo y usa validaciones antes de guardar. Las reglas de contraseña se calculan con una utilidad externa, lo que mejora la organización. Si todos los datos son correctos, se llama a `registerUser`, que agrega el usuario al arreglo en memoria y luego redirige al login.

---

## 4. Pantalla: Recuperar contraseña

**Archivo:** `app/forgot-password.tsx`

### 1. Nombre de la pantalla

Pantalla de solicitud de recuperación de contraseña.

### 2. Objetivo de la pantalla

Solicitar país, correo y aceptación de condiciones para iniciar el flujo de recuperación de contraseña.

### 3. Flujo de funcionamiento

1. El usuario llega desde login.
2. Selecciona país desde una lista desplegable.
3. Ingresa correo.
4. Acepta condiciones.
5. Presiona enviar código.
6. El sistema valida país, correo y términos.
7. Si todo es correcto, navega a OTP enviando el email como parámetro.

### 4. Análisis del código

- Define `COUNTRIES` como arreglo local de países.
- Define `DownArrow` como icono SVG propio para el selector.
- Usa `showCountry` para abrir/cerrar la lista.
- Usa `router.push` con `params` para enviar email a la pantalla OTP.

### 5. Funciones y métodos

| Función | Qué hace | Cuándo se ejecuta | Devuelve |
|---|---|---|---|
| `DownArrow({ open })` | Renderiza flecha arriba/abajo. | En el selector de país. | SVG. |
| `handleSendCode()` | Valida datos y navega a OTP. | Al presionar “Enviar código”. | Nada. |
| `isValidEmail(cleanEmail)` | Valida formato de correo. | Dentro de `handleSendCode`. | Booleano. |

### 6. Variables importantes

| Variable | Propósito |
|---|---|
| `country` | País seleccionado. |
| `showCountry` | Controla lista de países. |
| `email` | Correo para recuperación. |
| `acceptTerms` | Valida aceptación de condiciones. |

### 7. Estados y lógica de negocio

La lógica exige que todos los datos estén completos. No verifica si el correo existe antes de enviar a OTP; esa validación se realiza más adelante al actualizar contraseña.

### 8. Componentes utilizados

- `BackButton`: vuelve al login.
- `CheckIcon`: checkbox de términos.
- `Svg` y `Path`: flecha personalizada.
- `TextInput`: correo.

### 9. Navegación

- Llega desde `/login`.
- Navega a `/otp-verification` con parámetro `email`.

### 10. Conexión con otras capas

- `lib/validators.ts`: validación de email.
- `lib/responsive.ts`: responsive.
- No consulta backend real.

### 11. Buenas prácticas utilizadas

- Validación paso a paso con mensajes claros.
- Envío de parámetros por ruta.
- Selector controlado con estado.

### 12. Posibles mejoras

- Validar si el correo existe antes de OTP.
- Quitar términos si no hacen parte del flujo real.
- Reemplazar lista local por catálogo externo si crece.
- Corregir codificación de textos.

### 13. Resumen final

Esta pantalla inicia el flujo de recuperación validando datos básicos y enviando el correo a la pantalla de verificación.

### 14. Cómo explicarlo en un examen

> Esta pantalla prepara la recuperación de contraseña. El usuario selecciona país, ingresa correo y acepta condiciones. La función `handleSendCode` valida cada dato y, si todo está correcto, navega a la pantalla OTP pasando el correo por parámetros. No envía un correo real porque no hay backend en esta versión.

---

## 5. Pantalla: Verificación OTP

**Archivo:** `app/otp-verification.tsx`

### 1. Nombre de la pantalla

Pantalla de verificación de código.

### 2. Objetivo de la pantalla

Validar un código de 6 dígitos antes de permitir crear una nueva contraseña.

### 3. Flujo de funcionamiento

1. Recibe el correo desde recuperación.
2. Muestra el correo enmascarado.
3. El usuario ingresa 6 dígitos.
4. Cada casilla avanza automáticamente.
5. Permite pegar el código completo.
6. Valida contra `MOCK_CODE`.
7. Si es correcto, navega a nueva contraseña.

### 4. Análisis del código

- `CODE_LENGTH` define cantidad de dígitos.
- `MOCK_CODE` simula código válido.
- `useRef` guarda referencias a inputs para mover foco.
- `digits` guarda cada número del código.
- `useMemo` calcula correo enmascarado.
- El tamaño de casillas se calcula con `layout.contentWidth`.

### 5. Funciones y métodos

| Función | Qué hace | Cuándo se ejecuta | Devuelve |
|---|---|---|---|
| `maskEmail(email)` | Oculta parte del correo. | Al calcular `maskedEmail`. | String. |
| `updateDigit(value, index)` | Limpia y guarda un dígito. | Al escribir en una casilla. | Nada. |
| `handleKeyPress(event, index)` | Maneja retroceso. | Al presionar tecla. | Nada. |
| `handlePaste(value)` | Detecta pegado de varios dígitos. | En `onChangeText`. | Booleano. |
| `handleVerifyCode()` | Valida código y navega. | Al presionar “Siguiente”. | Nada. |
| `handleResendCode()` | Limpia código y muestra alerta. | Al reenviar código. | Nada. |

### 6. Variables importantes

| Variable | Propósito |
|---|---|
| `digits` | Arreglo de los 6 dígitos. |
| `code` | Unión de los dígitos. |
| `maskedEmail` | Email mostrado parcialmente oculto. |
| `inputRefs` | Referencias para mover foco entre inputs. |
| `codeSize` | Tamaño responsive de casillas. |

### 7. Estados y lógica de negocio

La lógica de negocio es comparar el código con `MOCK_CODE`. Como no hay backend, el código válido está fijo en frontend.

### 8. Componentes utilizados

- `BackButton`: vuelve a recuperación.
- `TextInput`: casillas del código.
- `SafeAreaView`: margen seguro.
- `KeyboardAvoidingView`: teclado móvil.

### 9. Navegación

- Llega desde `/forgot-password`.
- Navega a `/new-password` con email si código es correcto.

### 10. Conexión con otras capas

- Usa parámetros de Expo Router.
- Usa `responsive`.
- No consume API real.

### 11. Buenas prácticas utilizadas

- Manejo de foco con `useRef`.
- Código dividido en funciones pequeñas.
- Cálculo responsive de casillas.
- Soporte para pegar código completo.

### 12. Posibles mejoras

- Validar OTP contra backend.
- Agregar tiempo de expiración.
- Limitar intentos.
- Corregir codificación visual.

### 13. Resumen final

OTP verifica un código simulado de 6 dígitos y permite continuar al cambio de contraseña.

### 14. Cómo explicarlo en un examen

> Esta pantalla simula la verificación OTP. Maneja un arreglo de seis dígitos y usa referencias para cambiar automáticamente de casilla. También permite pegar el código completo. En esta versión el código válido es `222222`, porque no existe backend. Si el código coincide, se navega a nueva contraseña con el email recibido.

---

## 6. Pantalla: Nueva contraseña

**Archivo:** `app/new-password.tsx`

### 1. Nombre de la pantalla

Pantalla para establecer nueva contraseña.

### 2. Objetivo de la pantalla

Permitir actualizar la contraseña de un usuario después de superar el flujo OTP.

### 3. Flujo de funcionamiento

1. Recibe email por parámetro.
2. El usuario escribe nueva contraseña.
3. Puede limpiar el campo.
4. Puede mostrar u ocultar contraseña.
5. Puede marcar recordar contraseña.
6. Presiona finalizar.
7. Valida que no esté vacía y tenga mínimo 6 caracteres.
8. Llama `updateUserPassword`.
9. Si actualiza correctamente, vuelve al login.

### 4. Análisis del código

- Usa `useLocalSearchParams` para obtener email.
- Usa `updateUserPassword` para modificar usuario en memoria.
- Usa `showPassword` para visibilidad.
- Usa `rememberPassword` solo como estado visual.

### 5. Funciones y métodos

| Función | Qué hace | Cuándo se ejecuta | Devuelve |
|---|---|---|---|
| `handleFinish()` | Valida y actualiza contraseña. | Al presionar “Finalizado”. | Nada. |
| `updateUserPassword(email, password)` | Busca usuario y cambia contraseña. | Dentro de `handleFinish`. | Booleano. |

### 6. Variables importantes

| Variable | Propósito |
|---|---|
| `params.email` | Identifica usuario a actualizar. |
| `password` | Nueva contraseña. |
| `showPassword` | Visibilidad del campo. |
| `rememberPassword` | Estado visual del checkbox. |

### 7. Estados y lógica de negocio

La lógica valida contraseña y depende de que exista un usuario con el email recibido. Si no existe, muestra solicitud inválida.

### 8. Componentes utilizados

- `BackButton`
- `CheckIcon`
- `TextInput`
- `Ionicons`
- `KeyboardAvoidingView`

### 9. Navegación

- Llega desde `/otp-verification`.
- Vuelve a `/login` si la contraseña se actualiza.

### 10. Conexión con otras capas

- `lib/auth-store.ts`: actualiza contraseña.
- `expo-router`: lee parámetro email.
- No usa backend.

### 11. Buenas prácticas utilizadas

- Validación antes de actualizar.
- Separación de lógica de usuario en `auth-store`.
- Manejo de teclado en móvil.

### 12. Posibles mejoras

- Usar mismas reglas fuertes de registro.
- Persistir cambio en backend.
- El checkbox recordar debe conectarse a almacenamiento seguro.

### 13. Resumen final

Permite cambiar contraseña de un usuario existente en memoria luego del OTP.

### 14. Cómo explicarlo en un examen

> Esta pantalla finaliza la recuperación de contraseña. Recibe el correo por parámetro, valida la nueva contraseña y llama a `updateUserPassword`, que actualiza el usuario en memoria. Si el proceso es exitoso, muestra confirmación y regresa al login.

---

## 7. Pantalla: Dashboard

**Archivo:** `app/(tabs)/index.tsx`

### 1. Nombre de la pantalla

Dashboard principal.

### 2. Objetivo de la pantalla

Mostrar un resumen rápido del consumo actual y los hogares favoritos del usuario.

### 3. Flujo de funcionamiento

1. El usuario entra después de iniciar sesión.
2. Se leen dispositivos y hogares del contexto.
3. Se filtran dispositivos encendidos.
4. Se suma consumo actual.
5. Se muestran hogares favoritos o el primer hogar.
6. Al tocar un hogar, se activa y navega a Hogares.

### 4. Análisis del código

- Usa `useSmartHome` para leer `devices`, `homes`, `sessionName` y `setActiveHomeId`.
- Calcula `onlineDevices`.
- Calcula `currentConsumption` con `reduce`.
- Calcula `favoriteHomes`.
- Usa `useAppTheme` para colores claro/oscuro.

### 5. Funciones y métodos

| Función | Qué hace | Cuándo se ejecuta | Devuelve |
|---|---|---|---|
| `showNotifications()` | Muestra alerta según dispositivo crítico. | Al presionar campana. | Nada. |
| `setActiveHomeId(home.id)` | Selecciona hogar activo. | Al tocar una tarjeta de hogar. | Nada. |
| `router.push("/devices")` | Va a hogares. | Al tocar hogar o botón add. | Nada. |

### 6. Variables importantes

| Variable | Propósito |
|---|---|
| `onlineDevices` | Dispositivos encendidos. |
| `currentConsumption` | Suma de consumo actual. |
| `favoriteHomes` | Hogares marcados como favoritos. |
| `dashboardHomes` | Hogares que se muestran en dashboard. |

### 7. Estados y lógica de negocio

No tiene estado local complejo. Su lógica se basa en cálculos derivados del estado global.

### 8. Componentes utilizados

- `SafeAreaView`
- `ScrollView`
- `Pressable`
- `Ionicons`
- `MaterialCommunityIcons`

### 9. Navegación

- Llega desde login al entrar a `/(tabs)`.
- Navega a:
  - `/profile`
  - `/devices`
  - `/reports`

### 10. Conexión con otras capas

- `smart-home-context`: hogares y dispositivos.
- `formatters`: formato de kWh.
- `app-theme`: tema.
- `responsive`: layout.

### 11. Buenas prácticas utilizadas

- Cálculos derivados sin duplicar estado.
- Uso de contexto global.
- Navegación clara.
- UI responsive.

### 12. Posibles mejoras

- Traducir todos los textos con `i18n`.
- Corregir textos con codificación dañada.
- Reemplazar alertas por sistema real de notificaciones.

### 13. Resumen final

Dashboard resume datos importantes del hogar inteligente: consumo y accesos rápidos.

### 14. Cómo explicarlo en un examen

> El dashboard toma los dispositivos desde el contexto global, filtra los encendidos y calcula el consumo actual. También muestra hogares favoritos para acceso rápido. No guarda datos propios, sino que muestra información derivada del estado global, lo cual evita duplicar información.

---

## 8. Pantalla: Hogares y dispositivos

**Archivo:** `app/(tabs)/devices.tsx`

### 1. Nombre de la pantalla

Pantalla de Hogares.

### 2. Objetivo de la pantalla

Administrar hogares y los dispositivos pertenecientes a cada hogar.

### 3. Flujo de funcionamiento

1. Primero muestra lista de hogares.
2. El usuario puede crear un hogar.
3. Al tocar un hogar, entra al detalle.
4. Dentro del hogar, puede agregar dispositivos.
5. Puede encender/apagar dispositivos.
6. Puede apagar todos los dispositivos del hogar.
7. Puede marcar hogares como favoritos.

### 4. Análisis del código

- Usa `openedHomeId` para decidir si muestra lista o detalle.
- Usa `activeHomeId` del contexto para hogar seleccionado.
- Usa `homeDevices` con `useMemo` para filtrar dispositivos del hogar.
- Usa funciones globales `addHome`, `addDeviceToHome`, `toggleDevice`.

### 5. Funciones y métodos

| Función | Qué hace | Cuándo se ejecuta | Devuelve |
|---|---|---|---|
| `openHome(homeId)` | Selecciona y abre hogar. | Al tocar hogar. | Nada. |
| `handleAddHome()` | Valida y crea hogar. | Al presionar add hogar. | Nada. |
| `handleAddDevice()` | Valida y crea dispositivo en hogar activo. | Al presionar add dispositivo. | Nada. |
| `turnOffHome()` | Apaga todos los dispositivos del hogar. | Al presionar apagar hogar. | Nada. |

### 6. Variables importantes

| Variable | Propósito |
|---|---|
| `homeName` | Nombre del hogar a crear. |
| `deviceName` | Nombre del dispositivo a crear. |
| `openedHomeId` | Define si se ve detalle de hogar. |
| `selectedId` | Dispositivo seleccionado. |
| `activeHome` | Hogar actual. |
| `homeDevices` | Dispositivos del hogar actual. |
| `onlineCount` | Cantidad de dispositivos encendidos. |
| `monthlySavings` | Ahorro estimado simulado. |

### 7. Estados y lógica de negocio

La regla principal es:

> Un dispositivo siempre pertenece a un hogar.

Por eso `handleAddDevice` exige que exista `activeHome`, y llama `addDeviceToHome(activeHome.id, cleanName)`.

### 8. Componentes utilizados

- `TextInput` para nombres.
- `Switch` para encendido/apagado.
- `Pressable` para tarjetas y botones.
- `MaterialCommunityIcons` para iconos de dispositivos.

### 9. Navegación

Es una pestaña principal. Se llega desde el tabbar o desde dashboard/perfil/configuración.

### 10. Conexión con otras capas

- `smart-home-context`: crea hogares, dispositivos y cambia estados.
- `formatters`: muestra valores monetarios.
- `app-theme`: tema.
- `responsive`: adaptación móvil.

### 11. Buenas prácticas utilizadas

- Separación entre lista de hogares y detalle mediante funciones `renderHomeList` y `renderHomeDetail`.
- Uso de `useMemo` para filtrar dispositivos.
- Validación antes de crear datos.

### 12. Posibles mejoras

- Separar tarjetas en componentes propios.
- Persistir datos.
- Agregar edición y eliminación de hogares/dispositivos.
- Traducir textos restantes.

### 13. Resumen final

Esta pantalla implementa la relación central del sistema: hogares que contienen dispositivos.

### 14. Cómo explicarlo en un examen

> Esta pantalla es clave porque representa la relación hogar-dispositivo. Primero muestra hogares registrados. Cuando se entra a uno, se filtran los dispositivos cuyo `homeId` coincide con ese hogar. Así se garantiza que los dispositivos no estén sueltos, sino organizados dentro de un hogar.

---

## 9. Pantalla: Reportes

**Archivo:** `app/(tabs)/reports.tsx`

### 1. Nombre de la pantalla

Pantalla de reportes energéticos.

### 2. Objetivo de la pantalla

Mostrar análisis de consumo energético simulado en diferentes vistas: tiempo real, historial, mensual y tarifa.

### 3. Flujo de funcionamiento

1. Lee dispositivos y datos de reportes del contexto.
2. Muestra pestañas internas.
3. Calcula consumo en tiempo real.
4. Permite filtrar por rango y categoría.
5. Calcula puntos filtrados.
6. Muestra resumen, gráfica e insights.

### 4. Análisis del código

- `ranges` define periodos.
- `filters` define categorías.
- `reportViews` define vistas internas.
- Usa `useMemo` para calcular `multiplier`.
- Calcula `filteredPoints`, `maxValue`, `total`, `trend`.

### 5. Funciones y métodos

| Función | Qué hace | Cuándo se ejecuta | Devuelve |
|---|---|---|---|
| `downloadReport()` | Muestra alerta de reporte preparado. | Al presionar descarga. | Nada. |
| `setActiveView()` | Cambia vista. | Al tocar pestaña. | Nada. |
| `setActiveRange()` | Cambia periodo. | Al tocar rango. | Nada. |
| `setActiveFilter()` | Cambia categoría. | Al tocar filtro. | Nada. |

### 6. Variables importantes

| Variable | Propósito |
|---|---|
| `activeView` | Vista actual. |
| `activeRange` | Periodo seleccionado. |
| `activeFilter` | Categoría seleccionada. |
| `multiplier` | Ajuste simulado por categoría. |
| `filteredPoints` | Datos finales del gráfico. |
| `total` | Consumo total calculado. |
| `trend` | Comparación simulada con periodo anterior. |

### 7. Estados y lógica de negocio

La pantalla simula análisis energético. No descarga archivos reales, pero calcula datos visuales desde `reportData` y dispositivos activos.

### 8. Componentes utilizados

- `ScrollView` horizontal para tabs.
- `Pressable` para filtros.
- `View` para construir gráfico de barras.
- `Ionicons` para acciones.

### 9. Navegación

Es pestaña principal. Se accede desde tabbar o dashboard.

### 10. Conexión con otras capas

- `smart-home-context`: reportData y devices.
- `app-theme`: tema.
- `responsive`: layout.

### 11. Buenas prácticas utilizadas

- Cálculos con `useMemo`.
- Estados separados por vista, rango y filtro.
- No duplica datos globales.

### 12. Posibles mejoras

- Usar librería de gráficos.
- Descargar PDF/CSV real con backend.
- Corregir codificación de algunos textos.
- Traducir todo con `i18n`.

### 13. Resumen final

Reportes muestra consumo energético simulado y permite analizarlo por vista, periodo y categoría.

### 14. Cómo explicarlo en un examen

> Esta pantalla toma datos simulados de consumo desde el contexto y permite visualizarlos por diferentes rangos y filtros. Usa estados para saber qué vista, periodo y categoría están activos. Luego calcula los puntos que se muestran en la gráfica y el total de consumo.

---

## 10. Pantalla: Perfil

**Archivo:** `app/(tabs)/profile.tsx`

### 1. Nombre de la pantalla

Pantalla de perfil.

### 2. Objetivo de la pantalla

Mostrar información del usuario y agrupar opciones de cuenta, hogares, idioma, modo sin conexión, auditoría, restauración, desactivación y cierre de sesión.

### 3. Flujo de funcionamiento

1. Lee datos globales: usuario, hogares, dispositivos, idioma y modo offline.
2. Muestra cabecera del usuario.
3. Muestra módulos agrupados.
4. Permite navegar a configuración y hogares.
5. Permite cambiar idioma.
6. Permite activar/desactivar modo sin conexión.
7. Permite ver auditoría simulada.
8. Permite restaurar preferencias.
9. Permite desactivar cuenta o cerrar sesión.

### 4. Análisis del código

- Usa componentes de perfil para evitar duplicación.
- Usa `useTranslation` para textos traducibles.
- Usa `useAppTheme` para tema.
- Usa `useSmartHome` para datos y acciones globales.
- Agrupa UI en `ProfileModule`.

### 5. Funciones y métodos

| Función | Qué hace | Cuándo se ejecuta | Devuelve |
|---|---|---|---|
| `showComingSoon(title)` | Muestra alerta de módulo preparado. | Centro de mensajes/ayuda. | Nada. |
| `confirmLogout()` | Confirma cierre de sesión. | Al presionar cerrar sesión. | Nada. |
| `confirmDeactivation()` | Confirma desactivación de cuenta. | Al presionar desactivar. | Nada. |
| `showAuditDetail()` | Muestra datos de auditoría. | Al presionar ver auditoría. | Nada. |
| `confirmRestoreData()` | Restaura idioma y modo offline. | Al presionar restaurar datos. | Nada. |

### 6. Variables importantes

| Variable | Propósito |
|---|---|
| `alerts` | Dispositivos activos no verificados. |
| `onlineDevices` | Cantidad de dispositivos encendidos. |
| `language` | Idioma actual. |
| `offlineMode` | Modo sin conexión. |
| `sessionName` | Nombre mostrado del usuario. |

### 7. Estados y lógica de negocio

No maneja estados locales importantes; casi todo viene del contexto. Esto es correcto porque perfil modifica preferencias globales.

### 8. Componentes utilizados

- `ProfileModule`
- `ProfileMenuItem`
- `ProfileSectionHeader`
- `Switch`
- `Ionicons`
- `MaterialCommunityIcons`

### 9. Navegación

- Desde perfil puede ir a:
  - `/devices`
  - `/settings`
  - `/welcome` al cerrar sesión o desactivar cuenta.

### 10. Conexión con otras capas

- `smart-home-context`: idioma, modo offline, sesión, hogares, dispositivos.
- `i18n`: traducciones.
- `app-theme`: tema.
- Componentes modulares de perfil.

### 11. Buenas prácticas utilizadas

- Separación de componentes.
- Uso de módulos visuales reutilizables.
- Uso de traducción centralizada.
- Confirmaciones antes de acciones destructivas.

### 12. Posibles mejoras

- Crear pantallas reales para ayuda, mensajes y auditoría.
- Persistir idioma y tema.
- Corregir codificación en labels de idiomas si aparece dañada.

### 13. Resumen final

Perfil centraliza preferencias y acciones de cuenta, usando componentes reutilizables.

### 14. Cómo explicarlo en un examen

> Perfil es una pantalla de administración del usuario. No solo muestra datos, sino que permite modificar preferencias globales como idioma y modo sin conexión. Está organizada por módulos reutilizables, lo que mejora mantenimiento y evita repetir código visual.

---

## 11. Pantalla: Configuración

**Archivo:** `app/(tabs)/settings.tsx`

### 1. Nombre de la pantalla

Pantalla de configuración.

### 2. Objetivo de la pantalla

Permitir configurar cuenta, apariencia, integraciones de voz simuladas y desactivación de cuenta.

### 3. Flujo de funcionamiento

1. El usuario entra desde perfil.
2. Puede volver con botón superior.
3. Puede abrir edición de perfil.
4. Puede cambiar modo claro/oscuro.
5. Puede presionar integraciones de voz y ver alerta informativa.
6. Puede desactivar cuenta con confirmación.

### 4. Análisis del código

- `voiceIntegrations` define integraciones disponibles.
- Usa `useTranslation` para textos.
- Usa `useAppTheme` para colores.
- Usa `setColorMode` para cambiar tema global.
- Usa `deactivateAccount` para desactivar cuenta.

### 5. Funciones y métodos

| Función | Qué hace | Cuándo se ejecuta | Devuelve |
|---|---|---|---|
| `showPending(title)` | Muestra que integración está preparada. | Al tocar integración. | Nada. |
| `confirmDeactivation()` | Confirma y desactiva cuenta. | Al tocar desactivar cuenta. | Nada. |
| `setColorMode(mode)` | Cambia tema global. | Al elegir claro/oscuro. | Nada. |

### 6. Variables importantes

| Variable | Propósito |
|---|---|
| `voiceIntegrations` | Configuración de integraciones visibles. |
| `colorMode` | Tema actual. |
| `sessionName` | Usuario mostrado. |
| `theme` | Colores calculados. |
| `t` | Función de traducción. |

### 7. Estados y lógica de negocio

No tiene estado local. Ejecuta acciones globales: cambiar tema y desactivar cuenta.

### 8. Componentes utilizados

- `SafeAreaView`
- `ScrollView`
- `Ionicons`
- `Pressable`

### 9. Navegación

- Llega desde perfil.
- Puede volver atrás con `router.back`.
- Puede ir a `/profile`.
- Puede volver a `/welcome` al desactivar cuenta.

### 10. Conexión con otras capas

- `smart-home-context`: tema, cuenta, sesión.
- `i18n`: textos.
- `app-theme`: colores.
- `responsive`: márgenes.

### 11. Buenas prácticas utilizadas

- No deja acciones destructivas sin confirmación.
- Integra tema global.
- Usa datos de configuración en arreglo `voiceIntegrations`.

### 12. Posibles mejoras

- Crear flujo real de integración con Alexa/asistente.
- Persistir colorMode.
- Separar cada bloque en componentes si crece.

### 13. Resumen final

Configuración permite modificar tema, revisar cuenta e iniciar acciones globales de configuración.

### 14. Cómo explicarlo en un examen

> Configuración utiliza el contexto global para cambiar el modo visual de toda la aplicación y para desactivar la cuenta. También muestra integraciones de voz como módulos preparados. La pantalla no mantiene estado local porque las decisiones afectan a toda la app.

---

## 12. Layout principal de la aplicación

**Archivo:** `app/_layout.tsx`

### Objetivo

Configurar proveedores globales y rutas principales.

### Funcionamiento

- Envuelve la app con `SafeAreaProvider`.
- Usa `ThemeProvider` de navegación.
- Envuelve pantallas con `SmartHomeProvider`.
- Define rutas principales del Stack.
- Muestra `SplashAnimation` hasta finalizar.
- Configura `StatusBar`.

### Cómo explicarlo

> Este archivo es la raíz de la aplicación. Aquí se cargan los proveedores globales, como safe area y contexto Smart Home. También se define la navegación principal con Stack y se controla la animación inicial.

### Mejora recomendada

Separar la lógica del splash si crece o si requiere persistencia de sesión.

---

## 13. Layout de pestañas

**Archivo:** `app/(tabs)/_layout.tsx`

### Objetivo

Definir navegación inferior entre Dashboard, Hogares, Reportes y Perfil.

### Funcionamiento

- Usa `Tabs` de Expo Router.
- Lee tema desde contexto.
- Lee traducciones desde `useTranslation`.
- Ajusta altura del tabbar con `useSafeAreaInsets`.
- Oculta `settings` del tabbar con `href: null`.

### Cómo explicarlo

> Este layout define las pestañas principales después del login. Además adapta la barra inferior al margen seguro del dispositivo para que no choque con la navegación de Android o iPhone.

---

## 14. Componente: CheckIcon

**Archivo:** `components/icons/CheckIcon.tsx`

### 1. Nombre del componente

CheckIcon.

### 2. Objetivo

Mostrar un icono de check reutilizable en checkboxes y reglas cumplidas.

### 3. Flujo de funcionamiento

1. Recibe propiedades opcionales `color` y `size`.
2. Renderiza un SVG de tamaño configurable.
3. Dibuja una línea tipo check con `Polyline`.

### 4. Análisis del código

- Usa `react-native-svg`.
- Define `Props` para tipar propiedades.
- Usa valores por defecto:
  - `color = "#FFFFFF"`
  - `size = 14`

### 5. Funciones y métodos

| Función | Qué hace |
|---|---|
| `CheckIcon({ color, size })` | Renderiza el SVG del check. |

### 6. Variables importantes

| Variable | Propósito |
|---|---|
| `color` | Color del trazo. |
| `size` | Alto y ancho del SVG. |

### 7. Estados y lógica

No usa estados. Es un componente presentacional puro.

### 8. Componentes utilizados

- `Svg`
- `Polyline`

### 9. Navegación

No navega. Solo se renderiza dentro de otras pantallas.

### 10. Conexión con otras capas

No se conecta con servicios ni contexto.

### 11. Buenas prácticas

- Componente pequeño y reutilizable.
- Tipado de props.
- Valores por defecto.
- No mezcla lógica con presentación innecesaria.

### 12. Posibles mejoras

- Agregar `accessibilityLabel` si se usa como icono informativo.
- Centralizar tamaño/color con tema si se requiere consistencia total.

### 13. Resumen final

Es un icono reutilizable usado para indicar selección o validación correcta.

### 14. Cómo explicarlo en un examen

> `CheckIcon` es un componente presentacional reutilizable. No maneja estado ni lógica de negocio. Solo recibe color y tamaño, y dibuja un check con SVG. Se usa en checkboxes y reglas de validación para evitar repetir el mismo dibujo en varias pantallas.

---

## 15. Capas compartidas importantes

### `lib/smart-home-context.tsx`

Centraliza el estado global del proyecto:

- Hogares.
- Dispositivos.
- Sesión.
- Tema.
- Idioma.
- Modo sin conexión.
- Reportes.
- Acciones para crear hogares/dispositivos.
- Acciones para cambiar tema, idioma y cuenta.

Cómo explicarlo:

> Este contexto funciona como una capa de estado global. Evita pasar datos manualmente entre pantallas y permite que Dashboard, Hogares, Perfil y Configuración compartan la misma información.

### `lib/auth-store.ts`

Simula autenticación:

- Guarda usuarios en un arreglo.
- Permite buscar usuario.
- Permite registrar.
- Permite autenticar.
- Permite actualizar contraseña.

Cómo explicarlo:

> En esta versión no hay backend, por eso `auth-store` simula una base de usuarios en memoria. Sirve para demostrar el flujo completo de autenticación.

### `lib/responsive.ts`

Calcula medidas responsive:

- Ancho.
- Alto.
- Márgenes.
- Safe area.
- Tamaño máximo de contenido.

Cómo explicarlo:

> Este hook permite que las pantallas se adapten a celulares pequeños, Android, iPhone y pantallas con notch o barra inferior.

### `lib/app-theme.ts`

Define colores para tema claro y oscuro.

Cómo explicarlo:

> Esta capa evita repetir colores en cada pantalla y permite que el cambio de tema sea consistente.

### `lib/i18n.ts`

Contiene traducciones base.

Cómo explicarlo:

> Esta capa permite centralizar textos por idioma. Así, cuando el usuario cambia idioma, las pantallas conectadas pueden mostrar textos traducidos.

---

## Problemas generales detectados y cómo defenderlos

| Problema | Explicación | Defensa en examen | Mejora |
|---|---|---|---|
| Textos con codificación dañada | Aparecen caracteres como `Ã³`. | Es un problema de codificación de archivo, no de lógica. | Guardar archivos en UTF-8 y corregir textos. |
| No hay backend real | Datos simulados en memoria. | El alcance actual es frontend funcional. | Crear API y base de datos. |
| Algunas acciones son alertas | Integraciones o descarga no reales. | Están preparadas como puntos de extensión. | Implementar servicios reales. |
| Algunos estilos siguen dentro de pantallas | React Native usa StyleSheet local por patrón común. | Está organizado, pero puede modularizarse más. | Extraer estilos compartidos. |
| Persistencia limitada | Al reiniciar se pierden datos creados. | Es una limitación conocida de datos en memoria. | Usar AsyncStorage o backend. |

---

## Guion general para explicar el código en examen

> El proyecto está organizado por pantallas dentro de la carpeta `app`. Cada pantalla tiene una responsabilidad clara: bienvenida, login, registro, recuperación, dashboard, hogares, reportes, perfil y configuración. La lógica compartida se encuentra en `lib`, especialmente en `smart-home-context`, que funciona como estado global. Los datos como hogares y dispositivos se guardan en memoria para simular el comportamiento del sistema. La relación principal es que un hogar tiene varios dispositivos y cada dispositivo pertenece a un hogar mediante `homeId`. Además, la app usa hooks como `useResponsiveLayout` para adaptarse a diferentes pantallas y `useAppTheme` para manejar tema claro y oscuro. En esta versión el proyecto es un frontend funcional preparado para conectarse a backend en una fase posterior.

