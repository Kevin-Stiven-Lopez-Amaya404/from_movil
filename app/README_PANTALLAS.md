# Documentación de pantallas - Carpeta `app`

Esta carpeta contiene las pantallas de entrada, autenticación y recuperación de contraseña del proyecto Smart Home. En Expo Router, cada archivo dentro de `app` representa una ruta o pantalla de la aplicación.

La idea principal de esta carpeta es manejar el flujo previo al ingreso al sistema principal:

1. Bienvenida.
2. Inicio de sesión.
3. Registro.
4. Recuperación de contraseña.
5. Verificación de código.
6. Nueva contraseña.
7. Layout raíz de navegación.

---

## `app/_layout.tsx`

### Objetivo del archivo

Este archivo es el layout raíz de toda la aplicación. Su responsabilidad es configurar los proveedores globales y definir las rutas principales del proyecto.

### Qué hace

- Envuelve la aplicación con `SafeAreaProvider`.
- Configura el tema de navegación con `ThemeProvider`.
- Envuelve la aplicación con `SmartHomeProvider`, que contiene el estado global.
- Define las pantallas del `Stack`.
- Muestra la animación inicial `SplashAnimation`.
- Configura la barra de estado con `StatusBar`.

### Flujo de funcionamiento

1. La app inicia por este layout.
2. Se carga el esquema de color del sistema.
3. Se define si el splash ya terminó o no.
4. Se renderiza el stack de pantallas.
5. Si el splash no ha terminado, se muestra `SplashAnimation`.
6. Cuando termina la animación, se redirige a `/welcome` si el usuario está en `/`.

### Variables importantes

| Variable | Función |
|---|---|
| `colorScheme` | Detecta si el sistema está en modo claro u oscuro. |
| `splashDone` | Controla si la animación inicial ya terminó. |
| `router` | Permite redirigir al usuario. |
| `pathname` | Ruta actual de la aplicación. |

### Función principal

`finishSplash()`

- Cambia `splashDone` a `true`.
- Si la ruta actual es `/`, redirige a `/welcome`.
- Sirve para controlar que la app no quede en una ruta vacía.

### Conexión con otras capas

- `SmartHomeProvider`: estado global.
- `SplashAnimation`: componente visual inicial.
- `SafeAreaProvider`: márgenes seguros para Android/iPhone.
- `ThemeProvider`: tema de navegación.

### Cómo explicarlo en examen

> Este archivo es el punto de configuración global. Aquí se inicializan los proveedores que usa toda la aplicación, como el estado global, los márgenes seguros y la navegación principal. También se controla la animación de splash antes de entrar a la pantalla de bienvenida.

---

## `app/welcome.tsx`

### Nombre de la pantalla

Pantalla de bienvenida.

### Objetivo

Presentar la aplicación Smart Home y permitir que el usuario elija iniciar sesión, registrarse o continuar con Google. También permite cambiar entre tema claro y oscuro.

### Flujo de funcionamiento

1. El usuario abre la app.
2. Se muestra el selector de tema.
3. Se muestra el logo de Smart Home.
4. Se muestran botones de inicio de sesión, registro y Google.
5. El usuario navega a la pantalla correspondiente.

### Bloques importantes del código

#### Imports

Importa:

- `GoogleIcon` para el botón de Google.
- `SmartHomeLogo` para mostrar la marca.
- `theme` para colores y espaciados.
- `getAuthPalette` para colores según tema.
- `useResponsiveLayout` para adaptar la pantalla.
- `useSmartHome` para leer y cambiar el tema global.
- `useRouter` para navegación.

#### Estado global

```tsx
const { colorMode, setColorMode } = useSmartHome();
```

Este bloque obtiene el tema actual y la función para cambiarlo. No es estado local porque el tema debe afectar toda la aplicación.

#### Paleta visual

```tsx
const palette = getAuthPalette(colorMode);
const dark = colorMode === "dark";
```

Esto permite que la pantalla cambie colores según tema claro u oscuro.

#### Botón Google

`handleGoogleLogin()` no hace autenticación real. Muestra una alerta indicando que OAuth queda preparado para producción y redirige a login.

### Funciones

| Función | Explicación |
|---|---|
| `handleGoogleLogin` | Simula el flujo de Google y redirige a login. |
| `setColorMode` | Cambia el tema global. |
| `router.push("/login")` | Navega a login. |
| `router.push("/register")` | Navega a registro. |

### Posibles mejoras

- Implementar Google OAuth real.
- Mover textos a `i18n`.
- Corregir caracteres dañados por codificación.

### Cómo explicarlo en examen

> Esta pantalla es la entrada visual del sistema. Presenta la marca, permite seleccionar tema y ofrece las rutas principales de acceso. El tema se maneja desde el contexto global para que el cambio se refleje en otras pantallas.

---

## `app/login.tsx`

### Nombre de la pantalla

Pantalla de inicio de sesión.

### Objetivo

Validar el acceso del usuario mediante correo y contraseña, usando autenticación simulada en memoria.

### Flujo de funcionamiento

1. El usuario entra desde bienvenida.
2. Ingresa correo y contraseña.
3. Puede usar el acceso demo.
4. Se validan formato de correo y longitud de contraseña.
5. Se consulta `authenticateUser`.
6. Si las credenciales son correctas, entra a `/(tabs)`.
7. Si son incorrectas, aumenta el contador de intentos.

### Bloques importantes

#### Estados del formulario

```tsx
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [showPassword, setShowPassword] = useState(false);
const [rememberMe, setRememberMe] = useState(false);
const [touched, setTouched] = useState({ email: false, password: false });
const [failedAttempts, setFailedAttempts] = useState(0);
```

Estos estados controlan lo que el usuario escribe, la visibilidad de la contraseña, el checkbox, los errores y los intentos fallidos.

#### Validaciones

```tsx
const cleanEmail = email.trim().toLowerCase();
const canSubmit = isValidEmail(cleanEmail) && password.length >= 4;
```

El correo se limpia antes de validarlo. Esto evita errores por espacios o mayúsculas.

#### Mensaje de seguridad

`securityHint` se calcula con `useMemo` dependiendo de los intentos fallidos. Es útil porque no se recalcula innecesariamente.

### Funciones

| Función | Explicación |
|---|---|
| `fillDemoUser` | Llena credenciales de prueba. |
| `handleLogin` | Valida, autentica y navega si todo es correcto. |

### Lógica de negocio

- Si la cuenta está desactivada, no permite entrar hasta reactivarla.
- Si los campos están mal, muestra alerta.
- Si las credenciales fallan, suma intentos.
- Si son correctas, guarda el nombre de sesión en contexto.

### Conexión con otras capas

- `auth-store.ts`: autentica usuario.
- `validators.ts`: valida email.
- `smart-home-context.tsx`: maneja cuenta activa y sesión.

### Posibles mejoras

- Reemplazar autenticación en memoria por backend real.
- Persistir “recordar contraseña” de forma segura.
- No almacenar contraseñas planas en producción.

### Cómo explicarlo en examen

> El login maneja estados locales del formulario y usa una capa separada llamada `auth-store` para validar usuarios. Si el usuario existe y la contraseña coincide, guarda el nombre en el contexto global y navega a las pestañas principales.

---

## `app/register.tsx`

### Nombre de la pantalla

Pantalla de registro.

### Objetivo

Crear un usuario nuevo en memoria validando nombre, correo, contraseña, confirmación y aceptación de términos.

### Flujo de funcionamiento

1. El usuario entra desde bienvenida o login.
2. Escribe sus datos.
3. El sistema valida reglas de contraseña.
4. El usuario confirma contraseña.
5. Acepta términos.
6. Presiona registrarse.
7. Si todo está correcto, se guarda el usuario y vuelve a login.

### Bloques importantes

#### Estados

```tsx
const [firstName, setFirstName] = useState("");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");
const [showPassword, setShowPassword] = useState(false);
const [acceptTerms, setAcceptTerms] = useState(false);
const [submitted, setSubmitted] = useState(false);
```

Cada estado corresponde a un campo o comportamiento del formulario.

#### Reglas de contraseña

```tsx
const passwordRules = useMemo(() => getPasswordRules(password), [password]);
```

Usa una utilidad externa para no mezclar reglas directamente en la pantalla.

#### Objeto de errores

```tsx
const errors = { ... };
```

Centraliza todos los errores. Esto mejora la lectura porque `canSubmit` depende de un solo objeto.

### Funciones

| Función | Explicación |
|---|---|
| `visibleError` | Muestra errores solo después de intentar enviar. |
| `showTerms` | Muestra alerta de términos. |
| `handleRegister` | Valida y registra usuario. |

### Conexión con otras capas

- `registerUser`: guarda usuario en memoria.
- `getPasswordRules`: reglas de seguridad.
- `isValidEmail`: validación de correo.

### Posibles mejoras

- Conectar registro a backend.
- Persistir usuario.
- Corregir textos con codificación.
- Revisar si términos deben mantenerse según alcance.

### Cómo explicarlo en examen

> Registro valida los datos antes de crear la cuenta. La contraseña se evalúa con reglas externas, lo cual separa lógica de validación de la interfaz. Si el formulario es válido, se llama `registerUser`, que guarda el usuario en memoria.

---

## `app/forgot-password.tsx`

### Nombre de la pantalla

Pantalla de recuperación de contraseña.

### Objetivo

Iniciar el flujo de recuperación solicitando país, correo y aceptación de condiciones.

### Flujo de funcionamiento

1. El usuario entra desde login.
2. Selecciona país.
3. Escribe correo.
4. Acepta condiciones.
5. Presiona enviar código.
6. Si todo es válido, navega a OTP con el email.

### Bloques importantes

#### Lista de países

```tsx
const COUNTRIES = [ ... ];
```

Es una lista local usada para el selector.

#### Componente `DownArrow`

Renderiza una flecha SVG que cambia según el selector esté abierto o cerrado.

#### Estados

```tsx
const [country, setCountry] = useState("");
const [showCountry, setShowCountry] = useState(false);
const [email, setEmail] = useState("");
const [acceptTerms, setAcceptTerms] = useState(false);
```

Controlan el formulario y el selector.

### Función principal

`handleSendCode()`

- Valida país.
- Valida correo vacío.
- Valida formato de correo.
- Valida términos.
- Navega a `/otp-verification`.

### Conexión con otras capas

- `isValidEmail`: validación.
- `router.push`: navegación con parámetros.

### Posibles mejoras

- Validar si el correo existe antes de OTP.
- Enviar código real desde backend.
- Reemplazar países por catálogo externo.

### Cómo explicarlo en examen

> Esta pantalla prepara la recuperación de contraseña. Valida datos básicos y luego envía el correo como parámetro a la pantalla OTP. Como no hay backend, todavía no envía un correo real.

---

## `app/otp-verification.tsx`

### Nombre de la pantalla

Pantalla de verificación OTP.

### Objetivo

Validar un código de seis dígitos antes de permitir cambiar la contraseña.

### Flujo de funcionamiento

1. Recibe email por parámetros.
2. Enmascara el correo.
3. Muestra seis casillas.
4. El usuario escribe o pega código.
5. Si el código es `222222`, navega a nueva contraseña.

### Bloques importantes

#### Constantes

```tsx
const CODE_LENGTH = 6;
const MOCK_CODE = "222222";
```

Definen la longitud del código y el valor válido simulado.

#### Referencias

```tsx
const inputRefs = useRef<(TextInput | null)[]>([]);
```

Permiten mover el foco automáticamente entre casillas.

#### Estado de dígitos

```tsx
const [digits, setDigits] = useState(Array(CODE_LENGTH).fill(""));
```

Guarda cada dígito por separado.

### Funciones

| Función | Explicación |
|---|---|
| `maskEmail` | Oculta parte del correo. |
| `updateDigit` | Guarda un dígito y avanza foco. |
| `handleKeyPress` | Maneja retroceso. |
| `handlePaste` | Permite pegar código completo. |
| `handleVerifyCode` | Valida código. |
| `handleResendCode` | Limpia y simula reenvío. |

### Posibles mejoras

- Validar OTP con backend.
- Agregar expiración del código.
- Agregar límite de intentos.

### Cómo explicarlo en examen

> OTP está diseñado con seis inputs controlados. Cada dígito se guarda en un arreglo y se usa `useRef` para mover el foco entre casillas. El código válido es simulado porque todavía no existe backend.

---

## `app/new-password.tsx`

### Nombre de la pantalla

Pantalla de nueva contraseña.

### Objetivo

Actualizar la contraseña del usuario después de verificar el código OTP.

### Flujo de funcionamiento

1. Recibe el email desde OTP.
2. El usuario escribe nueva contraseña.
3. Puede limpiar o mostrar/ocultar contraseña.
4. Presiona finalizar.
5. Se valida la contraseña.
6. Se actualiza en memoria.
7. Vuelve al login.

### Bloques importantes

#### Parámetros

```tsx
const params = useLocalSearchParams<{ email?: string }>();
```

Obtiene el correo del usuario que está recuperando contraseña.

#### Estados

```tsx
const [password, setPassword] = useState("");
const [showPassword, setShowPassword] = useState(false);
const [rememberPassword, setRememberPassword] = useState(false);
```

Controlan el campo y la visualización.

### Función principal

`handleFinish()`

- Valida contraseña vacía.
- Valida mínimo 6 caracteres.
- Llama `updateUserPassword`.
- Si actualiza, navega al login.

### Conexión con otras capas

- `auth-store.ts`: actualización de contraseña en memoria.
- `expo-router`: lectura de parámetros.

### Posibles mejoras

- Usar las mismas reglas fuertes del registro.
- Enviar actualización a backend.
- Persistir cambio.

### Cómo explicarlo en examen

> Esta pantalla finaliza el proceso de recuperación. Recibe el correo por parámetro, valida la nueva contraseña y usa `updateUserPassword` para modificar el usuario en memoria. Después redirige al login.

