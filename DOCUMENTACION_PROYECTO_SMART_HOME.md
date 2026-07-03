# Documentación académica del proyecto Smart Home

## Diagnóstico inicial del proyecto

### 1. Qué tipo de proyecto es

Smart Home es un proyecto frontend móvil desarrollado con React Native y Expo. Su objetivo es simular una aplicación de administración de hogares inteligentes, donde el usuario puede iniciar sesión, registrar hogares, gestionar dispositivos, visualizar consumo energético, consultar reportes y configurar preferencias de la aplicación.

El proyecto está orientado a dispositivos móviles Android y iPhone. También puede ejecutarse en navegador mediante Expo Web para pruebas rápidas.

### 2. Qué tecnologías identifica

| Tecnología | Uso en el proyecto |
|---|---|
| React | Construcción de interfaces mediante componentes reutilizables. |
| React Native | Desarrollo de pantallas móviles nativas para Android/iOS. |
| Expo | Entorno de desarrollo, ejecución y compilación del proyecto móvil. |
| Expo Router | Manejo de navegación por archivos y rutas. |
| TypeScript | Tipado del código para reducir errores. |
| React Context | Estado global de hogares, dispositivos, sesión, tema e idioma. |
| React Native Safe Area Context | Adaptación a márgenes seguros de Android/iPhone. |
| React Native SVG | Soporte para gráficos e iconos personalizados. |
| Expo Vector Icons | Iconografía visual en botones, tabs y módulos. |

### 3. Qué funcionalidades principales tiene

- Pantalla de bienvenida.
- Inicio de sesión.
- Registro de usuarios en memoria.
- Recuperación de contraseña mediante flujo de correo, OTP y nueva contraseña.
- Dashboard con consumo actual y hogares favoritos.
- Módulo de hogares.
- Registro de hogares.
- Visualización de dispositivos dentro de cada hogar.
- Registro de dispositivos dentro de un hogar.
- Encendido y apagado de dispositivos.
- Apagado general de dispositivos de un hogar.
- Reportes energéticos por rango y categoría.
- Perfil con módulos organizados.
- Configuración de tema claro/oscuro.
- Configuración de idioma base.
- Modo sin conexión.
- Desactivación de cuenta.
- Diseño adaptable a pantallas móviles mediante safe area y layout responsive.

### 4. Qué partes están claras

- La aplicación es principalmente frontend.
- No existe backend real conectado.
- No existe base de datos externa.
- Los usuarios, hogares, dispositivos y reportes se manejan en memoria.
- La lógica central del sistema está en `lib/smart-home-context.tsx`.
- La lógica de autenticación simulada está en `lib/auth-store.ts`.
- La navegación principal se organiza con Expo Router.
- Las pantallas principales están en la carpeta `app`.

### 5. Qué información falta

Para una versión productiva faltaría definir:

- Backend real.
- Base de datos persistente.
- API REST o GraphQL.
- Autenticación real con tokens.
- Integración real con dispositivos IoT.
- Persistencia local con almacenamiento seguro.
- Pruebas unitarias y pruebas de interfaz.

### 6. Qué posibles preguntas difíciles podría hacer el docente

- ¿Por qué no tiene backend?
- ¿Dónde se guardan los datos?
- ¿Qué pasa si cierro la aplicación?
- ¿La app controla dispositivos reales?
- ¿Cómo se relacionan hogares y dispositivos?
- ¿Qué parte del código evita que se mezclen todas las responsabilidades?
- ¿Cómo se adapta a Android y iPhone?
- ¿Qué limitaciones tiene esta versión?

### 7. Cómo debería defender el proyecto de forma segura

La defensa debe enfocarse en que el proyecto es una aplicación frontend funcional y demostrativa. La versión actual simula el comportamiento de una app Smart Home usando datos en memoria. Esto permite demostrar flujos, navegación, validaciones, estado global, diseño responsive y organización de módulos, dejando preparado el proyecto para conectarse posteriormente a un backend real.

Frase recomendada:

> Este proyecto está planteado como una primera versión funcional del frontend de una aplicación Smart Home. Aunque todavía no se conecta a un backend real, la estructura ya separa pantallas, componentes, lógica global, validaciones y utilidades, lo que permite escalarlo en una siguiente fase.

---

# 1. Nombre del proyecto

**Smart Home**

Aplicación móvil para gestión de hogares inteligentes, dispositivos y consumo energético.

---

# 2. Introducción

Smart Home es una aplicación móvil desarrollada con React Native y Expo. El proyecto permite simular la administración de hogares inteligentes, donde un usuario puede ingresar al sistema, registrar hogares, agregar dispositivos dentro de cada hogar, consultar consumos, revisar reportes energéticos y modificar configuraciones de perfil.

El proyecto busca representar una solución moderna para usuarios que desean tener una visión organizada del consumo eléctrico de sus hogares y de los dispositivos conectados.

---

# 3. Descripción del problema

En muchos hogares existen varios dispositivos eléctricos o inteligentes, pero los usuarios no siempre tienen una forma clara de organizarlos, saber en qué hogar se encuentran, controlar su estado o consultar su consumo energético.

El problema principal es la falta de una interfaz centralizada que permita:

- Organizar hogares.
- Asociar dispositivos a cada hogar.
- Ver qué dispositivos están activos.
- Consultar consumo energético.
- Identificar posibles alertas.
- Personalizar el uso de la aplicación.

---

# 4. Justificación del proyecto

Este proyecto se justifica porque permite aplicar conocimientos importantes del desarrollo frontend móvil, como navegación, componentes reutilizables, estado global, formularios, validaciones, diseño adaptable y organización de código.

Además, representa un caso de uso realista: una aplicación Smart Home. Aunque la versión actual utiliza datos simulados, la lógica base permite entender cómo se podría construir una aplicación conectada a dispositivos reales y servicios backend.

Frase para sustentación:

> El proyecto se justifica porque resuelve de forma inicial la necesidad de centralizar la información de hogares y dispositivos, y además me permitió aplicar conceptos de desarrollo móvil, arquitectura frontend y manejo de estado.

---

# 5. Objetivo general

Desarrollar una aplicación móvil frontend para la gestión de hogares inteligentes, permitiendo administrar hogares, dispositivos, consumo energético y preferencias del usuario mediante una interfaz funcional, responsive y organizada.

---

# 6. Objetivos específicos

- Crear una interfaz móvil adaptable a diferentes tamaños de pantalla.
- Implementar flujo de autenticación simulado.
- Permitir el registro de usuarios en memoria.
- Permitir el registro y administración de hogares.
- Permitir agregar dispositivos dentro de cada hogar.
- Visualizar consumo energético actual.
- Presentar reportes energéticos por periodos y categorías.
- Implementar configuración de tema claro y oscuro.
- Implementar selección de idioma base.
- Organizar el código en pantallas, componentes, utilidades y contexto global.

---

# 7. Alcance del proyecto

## Incluye

- Aplicación móvil frontend.
- Navegación entre pantallas.
- Formularios de inicio de sesión, registro y recuperación de contraseña.
- Gestión local de hogares y dispositivos.
- Dashboard con resumen de consumo.
- Reportes simulados.
- Perfil y configuración.
- Tema claro/oscuro.
- Adaptación responsive para Android/iPhone.

## No incluye en esta versión

- Backend real.
- Base de datos externa.
- Control real de dispositivos físicos.
- Login real con Google.
- Integración real con asistentes de voz.
- Persistencia permanente al cerrar la aplicación.

Frase para defender el alcance:

> El alcance de esta versión es frontend funcional. El proyecto no pretende todavía controlar dispositivos reales, sino demostrar la estructura, la navegación, la lógica de interacción y la experiencia de usuario de una aplicación Smart Home.

---

# 8. Tecnologías utilizadas

| Tecnología | Explicación sencilla |
|---|---|
| React | Permite construir la interfaz por medio de componentes reutilizables. |
| React Native | Permite crear aplicaciones móviles usando JavaScript y componentes nativos. |
| Expo | Facilita ejecutar, probar y construir la aplicación sin configurar todo el entorno nativo manualmente. |
| Expo Router | Organiza la navegación usando archivos y carpetas. |
| TypeScript | Ayuda a detectar errores antes de ejecutar el proyecto mediante tipos. |
| React Context | Permite compartir datos entre pantallas sin pasar props manualmente por todos los componentes. |
| React Native Safe Area Context | Evita que la interfaz choque con el notch, la barra superior o la barra inferior del celular. |
| Expo Vector Icons | Proporciona iconos para mejorar la experiencia visual. |
| React Native SVG | Permite usar elementos gráficos vectoriales. |

---

# 9. Descripción general del sistema

El sistema funciona como una aplicación móvil de gestión Smart Home. El usuario entra a la app, inicia sesión o se registra, y luego accede a una navegación por pestañas.

Las pestañas principales son:

- **Dashboard:** muestra consumo actual y hogares favoritos.
- **Hogares:** permite crear hogares y administrar dispositivos dentro de ellos.
- **Reportes:** muestra consumo energético simulado.
- **Perfil:** permite ver información del usuario, preferencias y opciones de cuenta.

La aplicación usa un contexto global llamado `SmartHomeProvider`, ubicado en `lib/smart-home-context.tsx`. Allí se almacenan hogares, dispositivos, reportes, tema, idioma y estado de sesión.

---

# 10. Funcionalidades principales

## Autenticación simulada

Permite iniciar sesión con usuarios guardados en memoria. También permite registrar nuevos usuarios y cambiar contraseñas dentro del arreglo local de usuarios.

Archivo principal:

- `lib/auth-store.ts`

Usuarios iniciales:

- `admin@smarthome.com` / `1234`
- `pepe@smarthome.com` / `Smart123!`

## Registro de hogares

El usuario puede escribir el nombre de un hogar y registrarlo. Cada hogar tiene:

- Identificador.
- Nombre.
- Ubicación.
- Estado de favorito.

## Gestión de dispositivos

Cada dispositivo pertenece a un hogar. Esta relación es importante:

> Un hogar puede tener varios dispositivos, y cada dispositivo pertenece a un solo hogar.

Cada dispositivo tiene:

- Nombre.
- Hogar asociado.
- Categoría.
- Habitación.
- Consumo.
- Estado encendido/apagado.

## Dashboard

Muestra:

- Consumo actual.
- Cantidad de dispositivos activos.
- Hogares favoritos.
- Acceso rápido a hogares.

## Reportes

Muestra reportes simulados por:

- Día.
- Semana.
- Mes.
- Rango.
- Categoría de dispositivo.

## Perfil

Incluye:

- Información del usuario.
- Administración de hogares.
- Centro de mensajes simulado.
- Centro de ayuda simulado.
- Idioma.
- Modo sin conexión.
- Auditoría.
- Restauración de datos.
- Desactivación de cuenta.
- Cerrar sesión.

## Configuración

Incluye:

- Cuenta.
- Apariencia.
- Tema claro/oscuro.
- Integraciones de voz simuladas.
- Desactivación de cuenta.

---

# 11. Módulos del proyecto

| Módulo | Archivo principal | Responsabilidad |
|---|---|---|
| Bienvenida | `app/welcome.tsx` | Entrada inicial a la aplicación. |
| Login | `app/login.tsx` | Inicio de sesión. |
| Registro | `app/register.tsx` | Creación de usuarios simulados. |
| Recuperación | `app/forgot-password.tsx`, `app/otp-verification.tsx`, `app/new-password.tsx` | Flujo de recuperación de contraseña. |
| Dashboard | `app/(tabs)/index.tsx` | Resumen de consumo y hogares favoritos. |
| Hogares | `app/(tabs)/devices.tsx` | Registro de hogares y dispositivos. |
| Reportes | `app/(tabs)/reports.tsx` | Visualización de consumos simulados. |
| Perfil | `app/(tabs)/profile.tsx` | Preferencias y cuenta del usuario. |
| Configuración | `app/(tabs)/settings.tsx` | Tema, cuenta e integraciones. |
| Estado global | `lib/smart-home-context.tsx` | Datos compartidos de la app. |
| Autenticación | `lib/auth-store.ts` | Usuarios y contraseñas simuladas. |
| Responsive | `lib/responsive.ts` | Adaptación a diferentes pantallas. |
| Tema | `lib/app-theme.ts` | Colores para claro/oscuro. |
| Idioma | `lib/i18n.ts` | Traducciones base de la app. |

---

# 12. Estructura de carpetas explicada

```text
smart-home/
├── app/
│   ├── welcome.tsx
│   ├── login.tsx
│   ├── register.tsx
│   ├── forgot-password.tsx
│   ├── otp-verification.tsx
│   ├── new-password.tsx
│   ├── _layout.tsx
│   └── (tabs)/
│       ├── index.tsx
│       ├── devices.tsx
│       ├── reports.tsx
│       ├── profile.tsx
│       ├── settings.tsx
│       └── _layout.tsx
├── components/
│   ├── icons/
│   ├── navigation/
│   └── profile/
├── constants/
│   └── theme.ts
├── lib/
│   ├── app-theme.ts
│   ├── appearance.ts
│   ├── auth-store.ts
│   ├── formatters.ts
│   ├── i18n.ts
│   ├── responsive.ts
│   ├── smart-home-context.tsx
│   └── validators.ts
├── package.json
└── tsconfig.json
```

## Explicación sencilla

- `app`: contiene las pantallas y rutas de la aplicación.
- `app/(tabs)`: contiene las pantallas principales después de iniciar sesión.
- `components`: contiene piezas reutilizables de interfaz.
- `components/profile`: componentes específicos para organizar el perfil.
- `constants`: valores globales de diseño.
- `lib`: lógica reutilizable, validaciones, formateadores, estado global y configuración.

---

# 13. Funcionamiento paso a paso

1. El usuario abre la aplicación.
2. Se muestra la pantalla de bienvenida.
3. El usuario puede ir a iniciar sesión o registrarse.
4. Si inicia sesión, se validan las credenciales contra usuarios en memoria.
5. Si se registra, el usuario se agrega al arreglo local de usuarios.
6. Al entrar, se muestra el dashboard.
7. En el dashboard se calcula el consumo sumando los dispositivos encendidos.
8. En hogares, el usuario puede crear un hogar.
9. Al entrar a un hogar, puede agregar dispositivos.
10. Cada dispositivo queda asociado al hogar mediante `homeId`.
11. El usuario puede encender o apagar dispositivos.
12. Los reportes muestran datos simulados de consumo.
13. En perfil puede cambiar idioma, modo sin conexión, cerrar sesión o desactivar cuenta.
14. En configuración puede cambiar tema claro/oscuro y revisar integraciones simuladas.

---

# 14. Base de datos, tablas y relaciones

## Estado actual

El proyecto no usa una base de datos real. Los datos se manejan en memoria dentro de archivos TypeScript.

Archivos relacionados:

- `lib/auth-store.ts`
- `lib/smart-home-context.tsx`

## Entidades simuladas

### Usuario

Campos:

- `email`
- `password`
- `name`
- `documentType`
- `documentNumber`

### Hogar

Campos:

- `id`
- `name`
- `location`
- `favorite`

### Dispositivo

Campos:

- `id`
- `homeId`
- `name`
- `category`
- `room`
- `icon`
- `consumption`
- `yesterday`
- `online`
- `critical`

### Relación principal

```text
Hogar 1 ──── N Dispositivos
```

Esto significa:

- Un hogar puede tener muchos dispositivos.
- Un dispositivo pertenece a un solo hogar.
- La relación se maneja mediante el campo `homeId`.

Frase para sustentación:

> En esta versión no hay una base de datos física. Sin embargo, el modelo de datos ya está representado en memoria. La relación más importante es hogar-dispositivo: cada dispositivo tiene un `homeId`, lo que permite saber a qué hogar pertenece.

---

# 15. Explicación del frontend

El frontend está construido con React Native. Cada pantalla es un componente. La navegación se maneja con Expo Router, donde cada archivo dentro de `app` representa una ruta.

El frontend se organiza así:

- Pantallas de autenticación.
- Pantallas principales dentro de tabs.
- Componentes reutilizables.
- Estado global compartido.
- Utilidades para validación, formato, tema e idioma.

El diseño está adaptado a móviles mediante:

- `useWindowDimensions`
- `react-native-safe-area-context`
- Márgenes dinámicos.
- Ancho máximo de contenido.
- ScrollViews para pantallas con mucho contenido.

---

# 16. Explicación del backend

El proyecto actualmente no tiene backend real.

La lógica que normalmente estaría en un backend se simula en el frontend:

- Registro de usuarios.
- Inicio de sesión.
- Recuperación de contraseña.
- Hogares.
- Dispositivos.
- Reportes.

Frase para defenderlo:

> El backend no está implementado en esta versión porque el objetivo principal fue construir y validar el frontend. La estructura deja claro qué datos se necesitarían enviar a una API en una versión futura.

---

# 17. Explicación de API o endpoints

No existen endpoints reales en esta versión.

En una versión futura se podrían crear endpoints como:

| Método | Endpoint sugerido | Función |
|---|---|---|
| POST | `/auth/login` | Iniciar sesión. |
| POST | `/auth/register` | Registrar usuario. |
| GET | `/homes` | Listar hogares. |
| POST | `/homes` | Crear hogar. |
| GET | `/homes/:id/devices` | Listar dispositivos de un hogar. |
| POST | `/homes/:id/devices` | Crear dispositivo en un hogar. |
| PATCH | `/devices/:id/status` | Cambiar estado de un dispositivo. |
| GET | `/reports/energy` | Consultar reportes energéticos. |

---

# 18. Instalación y ejecución del proyecto

## Requisitos

- Node.js instalado.
- npm instalado.
- Expo CLI mediante `npx`.
- Android Studio o Expo Go si se desea probar en móvil.

## Instalar dependencias

```bash
npm install
```

## Ejecutar en navegador

```bash
npm run web
```

## Ejecutar en Android

```bash
npm run android
```

## Ejecutar en iOS

```bash
npm run ios
```

## Validar código

```bash
npx tsc --noEmit
npm run lint
```

---

# 19. Manual básico de uso

1. Abrir la aplicación.
2. Entrar desde la pantalla de bienvenida.
3. Iniciar sesión con un usuario existente o crear una cuenta.
4. En el dashboard, revisar consumo actual y hogares favoritos.
5. Entrar a **Hogares**.
6. Crear un hogar.
7. Entrar al hogar creado.
8. Registrar dispositivos.
9. Encender o apagar dispositivos.
10. Ir a **Reportes** para revisar consumo simulado.
11. Ir a **Perfil** para cambiar idioma, activar modo sin conexión o cerrar sesión.
12. Ir a **Configuración** para cambiar tema claro/oscuro.

---

# 20. Posibles errores y cómo solucionarlos

| Error | Posible causa | Solución |
|---|---|---|
| La app no inicia | Dependencias no instaladas | Ejecutar `npm install`. |
| Expo muestra error de puerto | Puerto ocupado | Ejecutar Expo en otro puerto. |
| Pantalla se ve cortada en Android | Falta margen seguro | Usar `react-native-safe-area-context`, ya integrado en el proyecto. |
| Login falla | Credenciales incorrectas | Usar usuario registrado o credenciales iniciales. |
| Datos desaparecen al reiniciar | Datos en memoria | Implementar almacenamiento local o backend. |
| Google no inicia sesión | OAuth no implementado | Explicar que está fuera del alcance actual. |
| Reportes no descargan archivo real | Backend no conectado | La alerta simula la acción; falta endpoint real. |

---

# 21. Recomendaciones de mejora

- Implementar backend real.
- Crear base de datos con usuarios, hogares y dispositivos.
- Agregar autenticación con JWT.
- Persistir datos con AsyncStorage o base de datos remota.
- Integrar dispositivos reales mediante IoT.
- Implementar login real con Google.
- Agregar pruebas unitarias.
- Agregar pruebas de navegación.
- Completar traducción de todos los textos visibles.
- Mejorar reportes con gráficos reales.
- Crear roles de usuario.

---

# 22. Conclusiones

Smart Home es una aplicación móvil frontend funcional que demuestra la gestión de hogares inteligentes y dispositivos asociados. El proyecto integra navegación, estado global, validaciones, formularios, diseño responsive, tema claro/oscuro, idioma base y reportes simulados.

Aunque no cuenta con backend ni base de datos real, la estructura del proyecto permite escalarlo en el futuro. La aplicación cumple su objetivo como prototipo funcional de frontend y como base para una solución Smart Home más completa.

---

# Preparación para defender el proyecto en el examen

## 1. Resumen corto para explicar el proyecto en menos de 1 minuto

> Mi proyecto se llama Smart Home. Es una aplicación móvil desarrollada con React Native y Expo que permite gestionar hogares inteligentes. El usuario puede iniciar sesión, registrar hogares, agregar dispositivos dentro de cada hogar, encenderlos o apagarlos, revisar consumo energético y consultar reportes. En esta versión los datos se manejan en memoria, porque el enfoque principal fue construir un frontend funcional, organizado y adaptable a dispositivos Android y iPhone.

## 2. Resumen para explicar el proyecto en 3 minutos

> Smart Home es una aplicación móvil enfocada en la administración de hogares inteligentes. El problema que aborda es que un usuario puede tener varios hogares o dispositivos y necesita una forma organizada de verlos y controlar su estado.
>
> El sistema inicia con pantallas de bienvenida, login, registro y recuperación de contraseña. Después de iniciar sesión, el usuario entra a una navegación por pestañas. En el dashboard puede ver el consumo actual y hogares favoritos. En el módulo de hogares puede registrar hogares y, dentro de cada hogar, registrar dispositivos. Esta relación es importante porque cada dispositivo pertenece a un hogar mediante un identificador llamado `homeId`.
>
> El proyecto también tiene un módulo de reportes energéticos simulados, un perfil con preferencias como idioma y modo sin conexión, y una configuración para tema claro/oscuro e integraciones de voz simuladas.
>
> Técnicamente, está hecho con React Native, Expo, TypeScript y Expo Router. El estado global se maneja con React Context en `smart-home-context.tsx`. No tiene backend real ni base de datos externa, pero los datos están modelados en memoria para demostrar el funcionamiento. La aplicación también usa `react-native-safe-area-context` para adaptarse a Android y iPhone.

## 3. Qué debo decir al iniciar la sustentación

> Buenos días. Voy a presentar mi proyecto Smart Home, una aplicación móvil frontend para la gestión de hogares inteligentes, dispositivos y consumo energético. El objetivo principal fue construir una interfaz funcional, organizada y adaptable, dejando una base preparada para conectarse posteriormente a un backend real.

## 4. Qué debo decir para explicar el problema

> El problema identificado es que los usuarios pueden tener varios dispositivos inteligentes, pero necesitan una forma clara de organizarlos por hogar, consultar su estado y revisar el consumo energético. Sin una aplicación centralizada, esta información queda dispersa o difícil de controlar.

## 5. Qué debo decir para explicar la solución

> La solución propuesta es una aplicación móvil que permite registrar hogares, asociar dispositivos a cada hogar, ver consumos, consultar reportes y administrar preferencias del usuario desde una misma interfaz.

## 6. Qué debo decir para explicar las tecnologías usadas

> Utilicé React Native porque permite crear aplicaciones móviles con componentes reutilizables. Expo facilita la ejecución del proyecto. TypeScript ayuda a evitar errores. Expo Router organiza la navegación por archivos. React Context permite compartir los datos principales entre pantallas. También usé safe area context para que la interfaz se adapte correctamente a Android y iPhone.

## 7. Qué debo decir para explicar cómo funciona el sistema

> El sistema funciona con un estado global. Allí se guardan hogares, dispositivos, reportes, tema, idioma y datos de sesión. Cuando el usuario agrega un hogar o un dispositivo, se actualiza ese estado. Las pantallas leen esa información y la muestran de forma dinámica.

## 8. Qué debo decir para explicar la base de datos

> En esta versión no implementé una base de datos real. Los datos se manejan en memoria para simular el comportamiento del sistema. Sin embargo, las entidades principales ya están definidas: usuarios, hogares y dispositivos. La relación más importante es que un hogar tiene muchos dispositivos y cada dispositivo pertenece a un hogar.

## 9. Qué debo decir para explicar el código o estructura

> El proyecto está organizado por responsabilidades. La carpeta `app` contiene las pantallas, `components` contiene componentes reutilizables, `lib` contiene lógica y utilidades, y `constants` contiene valores de diseño. La lógica global está separada en `smart-home-context.tsx`, y la autenticación simulada está en `auth-store.ts`.

## 10. Qué debo decir para cerrar la sustentación

> En conclusión, Smart Home cumple con el objetivo de presentar un frontend móvil funcional para gestionar hogares y dispositivos. Aunque todavía no tiene backend real, la estructura permite escalar el proyecto, conectar una API y agregar persistencia de datos en una siguiente versión.

---

# Preguntas que me puede hacer el docente y respuestas sugeridas

## ¿Cuál es el objetivo principal del proyecto?

El objetivo principal es desarrollar una aplicación móvil frontend para gestionar hogares inteligentes, dispositivos y consumo energético desde una interfaz organizada y adaptable.

## ¿Qué problema soluciona?

Soluciona la necesidad de organizar dispositivos inteligentes por hogar y consultar su estado o consumo desde una aplicación centralizada.

## ¿Por qué eligió esas tecnologías?

Elegí React Native y Expo porque permiten desarrollar aplicaciones móviles de forma rápida y multiplataforma. TypeScript ayuda a reducir errores, Expo Router organiza la navegación y React Context facilita el manejo del estado global.

## ¿Cómo funciona el sistema?

Funciona mediante pantallas conectadas a un estado global. El usuario inicia sesión, entra al dashboard, administra hogares, agrega dispositivos y consulta reportes. Cada acción actualiza los datos en memoria.

## ¿Qué parte fue la más difícil?

Una parte compleja fue organizar la relación entre hogares y dispositivos, porque era importante que los dispositivos no aparecieran aislados, sino dentro del hogar correspondiente. También fue importante adaptar la interfaz a diferentes tamaños de pantalla.

## ¿Qué aprendió realizando este proyecto?

Aprendí a organizar un frontend móvil por módulos, manejar estado global, crear navegación con Expo Router, validar formularios, adaptar pantallas a Android/iPhone y separar responsabilidades en el código.

## ¿Qué mejoraría en una próxima versión?

Implementaría backend real, base de datos, autenticación con tokens, persistencia de datos, integración con dispositivos reales y pruebas automatizadas.

## ¿Cómo se organiza el código?

El código se organiza en pantallas dentro de `app`, componentes reutilizables dentro de `components`, lógica compartida dentro de `lib` y constantes de diseño dentro de `constants`.

## ¿Cómo se conecta el frontend con el backend?

Actualmente no se conecta a un backend. La app usa datos simulados en memoria. En una versión futura, las funciones de registro, login, hogares, dispositivos y reportes se conectarían a endpoints reales.

## ¿Cómo funciona la base de datos?

No existe base de datos real en esta versión. Los datos se simulan en memoria. La estructura ya representa entidades como usuarios, hogares y dispositivos, lo cual facilita migrar a una base de datos real.

## ¿Qué errores tuvo y cómo los solucionó?

Se trabajó en problemas de organización, responsive y adaptación visual. Se solucionó usando componentes separados, contexto global, `react-native-safe-area-context` para márgenes seguros y una estructura más clara de pantallas.

## ¿Por qué considera que el proyecto cumple con el objetivo?

Porque permite ejecutar los flujos principales: autenticación simulada, dashboard, creación de hogares, creación de dispositivos, control de estado, reportes, perfil y configuración. Además, está organizado para poder crecer.

## ¿La aplicación controla dispositivos reales?

No en esta versión. Actualmente simula dispositivos. La idea es que en una versión futura se conecte con servicios IoT o APIs de dispositivos inteligentes.

## ¿Qué pasa si cierro la aplicación?

Como los datos están en memoria, algunos cambios pueden perderse al reiniciar. Esta es una limitación conocida de la versión actual y se solucionaría con persistencia local o backend.

## ¿Por qué no implementó backend?

Porque el alcance de esta etapa fue construir el frontend funcional y validar los flujos principales. El backend queda como mejora futura.

## ¿Cómo se adapta a Android y iPhone?

Se usa `react-native-safe-area-context` para respetar márgenes seguros y `useWindowDimensions` para calcular tamaños según la pantalla. Así se evita que el contenido quede fuera de la pantalla o debajo de barras del sistema.

---

# Puntos débiles del proyecto y cómo defenderlos

| Punto débil | Cómo defenderlo |
|---|---|
| No tiene backend | El objetivo actual fue construir el frontend funcional; la estructura ya está preparada para conectar APIs. |
| No tiene base de datos real | Los datos están modelados en memoria para demostrar lógica y relaciones. |
| No controla dispositivos reales | Es una simulación funcional; la integración IoT sería una fase posterior. |
| Datos no persistentes | Se reconoce como limitación; se puede resolver con AsyncStorage o backend. |
| Algunas integraciones son simuladas | Se dejaron como módulos preparados para conexión futura. |

---

# Guion corto recomendado para estudiar

> Smart Home es una aplicación móvil frontend desarrollada con React Native y Expo. Su propósito es gestionar hogares inteligentes, permitiendo registrar hogares, asociar dispositivos, controlar su estado y consultar consumo energético. La aplicación maneja sus datos en memoria mediante React Context, lo cual permite simular el funcionamiento sin backend real. El proyecto está organizado por pantallas, componentes y utilidades, y usa TypeScript para mejorar la calidad del código. Aunque no cuenta todavía con base de datos ni dispositivos reales, cumple como prototipo funcional y deja una base clara para futuras mejoras.

