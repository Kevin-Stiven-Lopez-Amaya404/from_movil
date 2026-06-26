# 📱 Smart Home - Guía de Flujo de Usuario

## 🎯 Resumen Ejecutivo

Esta es una aplicación mobile de **control de hogar inteligente** con autenticación completa y panel de control intuitivo. El usuario sigue un flujo lógico desde la bienvenida hasta la gestión de dispositivos.

---

## 📋 Estructura del Proyecto Organizada

### **PARTE 1: AUTENTICACIÓN (Pantallas de entrada)**
Todas las pantallas están en `/app` (raíz)

```
app/
├── welcome.tsx              👈 INICIO - Pantalla de bienvenida
├── login.tsx                👈 ACCESO - Iniciar sesión
├── register.tsx             👈 REGISTRO - Crear nueva cuenta
├── forgot-password.tsx      👈 RECUPERACIÓN - Recuperar contraseña
├── otp-verification.tsx     👈 VALIDACIÓN - Verificar código OTP (6 dígitos)
└── new-password.tsx         👈 CAMBIO - Crear nueva contraseña
```

### **PARTE 2: APLICACIÓN PRINCIPAL (Pantallas con menú inferior)**
Todas están en `/app/(tabs)/` - Sistema de tabs/pestañas

```
app/(tabs)/
├── index.tsx                👈 🏠 DASHBOARD - Resumen energético personal
├── devices.tsx              👈 ⚡ DISPOSITIVOS - Control de dispositivos conectados
├── reports.tsx              👈 📊 REPORTES - Análisis y gráficas de consumo
├── settings.tsx             👈 ⚙️ AJUSTES - Sincronización y dispositivos activos
├── profile.tsx              👈 👤 PERFIL - Información del usuario (oculto)
├── explore.tsx              👈 🔍 EXPLORAR - Zona de exploración (oculto)
└── _layout.tsx              - Configuración de navegación por tabs
```

---

## 🚀 FLUJO PASO A PASO DEL USUARIO

### **PASO 1: BIENVENIDA**
```
📲 Pantalla: welcome.tsx
├─ Mostrará: Logo Smart Home + dos botones
├─ Botón 1: "Inicia sesión" → va a login.tsx
└─ Botón 2: "Registrarse" → va a register.tsx
```

### **PASO 2A: SI ELIGE INICIAR SESIÓN**
```
📲 Pantalla: login.tsx
├─ El usuario ingresa: correo + contraseña
├─ Botón demo: Llena automáticamente credenciales de prueba
│  • Email: pepe@smarthome.com
│  • Contraseña: Smart123!
├─ Opciones:
│  • ✅ Credenciales correctas → ENTRA a (tabs) dashboard
│  • ❌ Credenciales incorrectas → Muestra error
│  • 🔐 ¿Olvidó contraseña? → Va a forgot-password.tsx
│  └─ ¿Sin cuenta? → Va a register.tsx
```

### **PASO 2B: SI ELIGE REGISTRARSE**
```
📲 Pantalla: register.tsx
├─ Campos a llenar:
│  • Nombres
│  • Apellidos
│  • Tipo de documento (dropdown)
│  • Número de identificación
│  • Email
│  • Contraseña (con requisitos)
│  • Confirmar contraseña
│  • ☑️ Aceptar términos y privacidad
├─ Validaciones automáticas:
│  • Todos los campos requeridos
│  • Email formato válido
│  • Contraseña fuerte (8+ caracteres, mayúscula, minúscula, número, símbolo)
│  • Las contraseñas coinciden
│  • Términos aceptados
├─ Si TODO es válido:
│  ✅ Muestra "Cuenta creada"
│  └─ Botón: "Iniciar sesión" → Va a login.tsx
└─ Si hay errores: Muestra campos problemáticos
```

### **PASO 2C: SI ELIGIÓ "¿OLVIDÓ CONTRASEÑA?"**
```
📲 Pantalla: forgot-password.tsx
├─ El usuario ingresa:
│  • País (dropdown)
│  • Email
│  • ☑️ Acepta términos
├─ Si es válido:
│  ✅ Envía código OTP al email
│  └─ Redirige a → otp-verification.tsx
└─ Si falta algo: Muestra error
```

### **PASO 2D: VERIFICACIÓN OTP (6 DÍGITOS)**
```
📲 Pantalla: otp-verification.tsx
├─ Muestra: Email enmascarado (ej: **********@gmail.com)
├─ 6 campos para ingresar código de 6 dígitos
├─ El código válido es: 222222 (mock/prueba)
├─ Si código es válido:
│  ✅ Código verificado
│  └─ Redirige a → new-password.tsx
└─ Si es incorrecto: Intenta de nuevo
```

### **PASO 2E: CREAR NUEVA CONTRASEÑA**
```
📲 Pantalla: new-password.tsx
├─ El usuario ingresa:
│  • Nueva contraseña (con ícono ojo para ver/ocultar)
│  • Confirmar contraseña (con ícono ojo)
├─ Validaciones:
│  • Mínimo 8 caracteres
│  • Las contraseñas coinciden
├─ Si es válido:
│  ✅ Contraseña actualizada
│  └─ Botón: "Iniciar sesión" → Va a login.tsx
└─ Si falta algo: Muestra error
```

### **PASO 3: DENTRO DE LA APLICACIÓN (DASHBOARD)**
```
📲 Pantalla: index.tsx (dentro de tabs)
├─ Menú inferior con 4 opciones (tabs):
│  1. 🏠 Dashboard (actual)
│  2. ⚡ Dispositivos
│  3. 📊 Reportes
│  4. ⚙️ Ajustes
├─ Contenido mostrado:
│  • Avatar del usuario + saludo ("Hola, Pepe")
│  • Botones de acción rápida (corazón, notificaciones)
│  • Lista de dispositivos conectados
│  • Consumo de energía por dispositivo
│  • Tendencias (↑ aumentando, ↓ disminuyendo)
└─ El usuario puede:
    • Tapping en tabs → Cambia entre secciones
    • Interactuar con dispositivos
```

### **PASO 4: DISPOSITIVOS**
```
📲 Pantalla: devices.tsx
├─ Tarjeta de "Ahorros Mensuales"
├─ Segmentador: Electrodomésticos / Iluminación
├─ Lista de dispositivos conectados:
│  • Cargador
│  • Aire acondicionado
│  • TV
│  • etc.
└─ Botón: Apagar dispositivo
```

### **PASO 5: REPORTES**
```
📲 Pantalla: reports.tsx
├─ Título: "Análisis energético"
├─ Tarjeta resumen:
│  • Consumo total: 1.25 kWh
│  • Cambio: ↑ 15%
│  • Período: Últimos 7 días
├─ Pestañas de filtrado:
│  • Diario (seleccionado por defecto)
│  • Semana
│  • Mes
│  • Rango personalizado
└─ Gráfico de barras con datos por día
```

### **PASO 6: AJUSTES**
```
📲 Pantalla: settings.tsx
├─ Sección "Sincronización de Datos":
│  • Estado: ✅ Sincronizado
│  • Última sincronización: hoy, 10:45
│  • Botón: Comprobar de nuevo
├─ Sección "Tus dispositivos activos":
│  • Móvil (Este dispositivo) - Último acceso: ahora
│  • Tablet de Ana - Último acceso: ayer, 18:27
└─ Opciones de verificación y seguridad
```

---

## 🔄 RUTAS DE NAVEGACIÓN RESUMIDAS

```
Welcome
  ├─→ [Inicia sesión] → Login
  │                      ├─→ ✅ Correcto → (tabs) Dashboard
  │                      ├─→ ❌ Incorrecto → Error + reintenta
  │                      ├─→ ¿Olvidó? → Forgot Password
  │                      └─→ No tiene cuenta → Register
  │
  └─→ [Registrarse] → Register
                       ├─→ ✅ Válido → Cuenta creada → Login
                       └─→ ❌ Errores → Muestra campos problemáticos

Forgot Password
  ├─→ ✅ Válido → OTP Verification
  │              ├─→ ✅ Código correcto (222222) → New Password
  │              │                                  ├─→ ✅ Válido → Login
  │              │                                  └─→ ❌ Errores → Reintenta
  │              └─→ ❌ Código incorrecto → Reintenta
  └─→ ❌ Errores → Muestra errores

(tabs) Dashboard
  ├─→ Tab: Dashboard (🏠)
  ├─→ Tab: Dispositivos (⚡)
  ├─→ Tab: Reportes (📊)
  └─→ Tab: Ajustes (⚙️)
```

---

## 🎨 TEMAS Y ESTILOS

### **Colores Principales**
- 🔵 Primario: `#0864C8` (Azul)
- ⚪ Fondo: `#FFFFFF` o `#F5F5F5`
- 🔤 Texto: `#454545` o `#3F3F3F`
- 💜 Acento: `#DDDDFB` (Lila suave)

### **Tipografía**
- Títulos: Georgia/Serif - **Bold 700**
- Contenido: Sans-serif - Regular 400
- Botones: Sans-serif - **Bold 700**

---

## ✅ DATOS DE PRUEBA (Mock)

### **Credenciales para Login:**
```
Email: pepe@smarthome.com
Contraseña: Smart123!
Nombre: Pepe
```

O usar el botón "Usar acceso demo" que auto-rellena estos datos.

### **Código OTP (para recuperación):**
```
Código: 222222
```

---

## 📝 RESUMEN DE CAMBIOS REALIZADOS

✅ **Limpieza:**
- Eliminado archivo duplicado `dashboard.tsx`
- Reorganizado el archivo `_layout.tsx` con documentación clara

✅ **Navegación:**
- Flujo de login ahora redirige a `/(tabs)` correctamente
- Flujo de registro → login → (tabs)
- Flujo de recuperación: forgot-password → otp → new-password → login

✅ **Organización:**
- Pantallas de autenticación en `/app` (raíz)
- Pantallas de aplicación en `/app/(tabs)/`
- Cada pantalla tiene su propósito claro

✅ **Estilos:**
- Todos los archivos usan el tema centralizado de `/constants/theme.ts`
- Colores y espaciado consistentes

---

## 🎯 PRÓXIMAS MEJORAS SUGERIDAS

1. **Autenticación Real**: Conectar con API del backend
2. **Persistencia**: Guardar token en AsyncStorage
3. **Estado Global**: Usar Context API o Redux para usuario autenticado
4. **Validaciones**: Mejorar UX con validaciones en tiempo real
5. **Notificaciones**: Push notifications para alertas
6. **Gráficos**: Integrar biblioteca de gráficos real

---

## 📞 CONTACTO Y SOPORTE

Para problemas o preguntas sobre el flujo, contactar al equipo de desarrollo.

**Última actualización**: Mayo 2026
**Versión**: 1.0
