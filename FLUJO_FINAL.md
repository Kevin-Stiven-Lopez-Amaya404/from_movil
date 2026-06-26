# 🚀 FLUJO FINAL - Smart Home App

## ✅ FLUJO USUARIO PASO A PASO

```
┌─────────────────────────────────────────────────────────────┐
│                    APP INICIA                                │
│              ↓↓↓ PANTALLA: REGISTER ↓↓↓                     │
│          (Usuario entra directamente al registro)            │
└─────────────────────────────────────────────────────────────┘

PASO 1️⃣: REGISTRO
┌─────────────────────────────────────────┐
│  📋 PANTALLA: REGISTER                  │
├─────────────────────────────────────────┤
│  ✏️  Campo: Nombres                      │
│  ✏️  Campo: Apellidos                    │
│  ✏️  Campo: Tipo de documento (dropdown) │
│  ✏️  Campo: Número de ID                 │
│  ✏️  Campo: Email                        │
│  🔐 Campo: Contraseña                   │
│  🔐 Campo: Confirmar contraseña         │
│  ☑️  Checkbox: Aceptar términos         │
│  ┌─────────────────────────────┐        │
│  │ [Botón] REGISTRARSE          │        │
│  └─────────────────────────────┘        │
│                                         │
│  ¿Ya tienes cuenta?                    │
│  → [Link] Inicia sesión                │
│     (va a LOGIN si ya se registró)     │
└─────────────────────────────────────────┘
        ↓ (Registro exitoso)
  ✅ Alert: "Cuenta creada"
        ↓
┌─────────────────────────────────────────────────────────┐
│  Button: "Iniciar sesión" → REDIRIGE A LOGIN            │
└─────────────────────────────────────────────────────────┘


PASO 2️⃣: LOGIN / CREDENCIALES
┌─────────────────────────────────────────┐
│  🔐 PANTALLA: LOGIN                     │
├─────────────────────────────────────────┤
│  ✏️  Campo: Email                        │
│  🔐 Campo: Contraseña (con ojo)         │
│  ☑️  Checkbox: Recordar contraseña      │
│  ┌─────────────────────────────┐        │
│  │ [Demo] Usar acceso demo      │        │
│  └─────────────────────────────┘        │
│     (auto-rellena: pepe@...)            │
│                                         │
│  [Link] ¿Olvidó contraseña?             │
│  → Forgot Password → OTP → New Password │
│                                         │
│  ┌─────────────────────────────┐        │
│  │ [Botón] INICIA SESIÓN        │        │
│  └─────────────────────────────┘        │
│                                         │
│  ¿No tienes cuenta?                    │
│  → [Link] Registrarse                  │
│     (vuelve a REGISTER)                │
└─────────────────────────────────────────┘
  ✅ Credenciales válidas:
     Email: pepe@smarthome.com
     Pass: Smart123!
        ↓
   REDIRIGE A: /(tabs)


PASO 3️⃣: DASHBOARD PRINCIPAL
┌──────────────────────────────────────────┐
│  🏠 PANTALLA: DASHBOARD (index.tsx)      │
├──────────────────────────────────────────┤
│  ┌──────────────────────────────────┐   │
│  │ MENÚ INFERIOR CON 4 TABS:        │   │
│  ├──────────────────────────────────┤   │
│  │ 🏠 [Dashboard] ← ACTIVO           │   │
│  │ ⚡ [Dispositivos]                 │   │
│  │ 📊 [Reportes]                    │   │
│  │ ⚙️  [Ajustes]                     │   │
│  └──────────────────────────────────┘   │
│                                          │
│  CONTENIDO:                              │
│  • Avatar + Saludo ("Hola, Pepe")       │
│  • Lista de dispositivos conectados     │
│  • Consumo de energía por dispositivo   │
│  • Tendencias (↑ / ↓)                   │
└──────────────────────────────────────────┘


PASO 4️⃣: EXPLORAR OTRAS SECCIONES
┌────────────────────────────────────────┐
│  ⚡ DISPOSITIVOS (Tab)                  │
├────────────────────────────────────────┤
│  • Ahorros mensuales                   │
│  • Segmentador: Electrodomésticos/etc. │
│  • Lista de dispositivos               │
│  • Botones: Encender/Apagar            │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│  📊 REPORTES (Tab)                     │
├────────────────────────────────────────┤
│  • Análisis energético                 │
│  • Tarjeta de resumen                  │
│  • Pestañas: Diario/Semana/Mes/Rango   │
│  • Gráfico de barras                   │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│  ⚙️  AJUSTES (Tab)                     │
├────────────────────────────────────────┤
│  • Sincronización de datos             │
│  • Tus dispositivos activos             │
│  ┌──────────────────────────────┐      │
│  │ [Botón] CERRAR SESIÓN        │      │
│  │ (Color rojo - #FF3B20)        │      │
│  └──────────────────────────────┘      │
│    ↓ Click                              │
└────────────────────────────────────────┘
        ↓
   REDIRIGE A: /register (reinicia el flujo)
```

---

## 📱 FLUJO COMPLETO EN LÍNEA

```
APP INICIA
    ↓
📋 REGISTER (Pantalla inicial)
    ↓
[Formulario completo y válido]
    ↓
✅ Alerta: "Cuenta creada"
    ↓
[Click en "Iniciar sesión"]
    ↓
🔐 LOGIN
    ↓
[Email + Contraseña válidos]
    ↓
✅ Alerta: "Bienvenido"
    ↓
🏠 DASHBOARD /(tabs)/index
    ↓
[Usuario puede navegar entre tabs]
    ↓
⚙️  SETTINGS
    ↓
[Click "Cerrar Sesión"]
    ↓
📋 REGISTER (Vuelve al inicio)
```

---

## 🔑 CREDENCIALES TEST

**Email**: `pepe@smarthome.com`  
**Contraseña**: `Smart123!`  
**Código OTP** (si olvida): `222222`

**Atajo**: Botón "Usar acceso demo" en Login

---

## 🔄 OPCIONES ALTERNATIVAS

### Si el usuario olvida su contraseña (en Login):
```
🔐 LOGIN
  ↓ [¿Olvidó contraseña?]
  ↓
🔑 FORGOT PASSWORD
  ↓ [Ingresa email + país]
  ↓
📧 OTP VERIFICATION
  ↓ [Código: 222222]
  ↓
🆕 NEW PASSWORD
  ↓ [Nueva contraseña]
  ↓
[Click "Iniciar sesión"]
  ↓
🔐 LOGIN
  ↓ [Nuevas credenciales]
  ↓
🏠 DASHBOARD
```

### Si el usuario ya tiene cuenta pero está en Register:
```
📋 REGISTER
  ↓ [Link "¿Ya tienes cuenta? Inicia sesión"]
  ↓
🔐 LOGIN
  ↓ [Ingresa credenciales]
  ↓
🏠 DASHBOARD
```

### Si el usuario no tiene cuenta pero está en Login:
```
🔐 LOGIN
  ↓ [Link "¿No tienes cuenta? Registrarse"]
  ↓
📋 REGISTER
  ↓ [Completa formulario]
  ↓
[Rest del flujo...]
```

---

## ✨ CAMBIOS REALIZADOS

✅ **Pantalla inicial**: Cambió de `welcome` a `register`  
✅ **Flujo obligatorio**: Registro → Login → Dashboard  
✅ **Links disponibles**: Navegar entre Register ↔ Login según sea necesario  
✅ **Logout funcional**: Desde Settings → Vuelve a Register  
✅ **Validaciones**: En cada paso del formulario  
✅ **Credenciales de prueba**: Disponibles siempre  

---

## 🎯 USUARIO PROMEDIO

1. **Abre app** → Ve formulario de registro
2. **Completa datos** → Nombres, email, contraseña, etc.
3. **Click "Registrarse"** → Se crea cuenta
4. **Alerta** → "Cuenta creada"
5. **Click "Iniciar sesión"** → Va al login
6. **Ingresa credenciales** → pepe@smarthome.com / Smart123!
7. **Click "Inicia sesión"** → Entra al dashboard
8. **Navega** → 4 tabs principales
9. **Cierra sesión** → En Ajustes (⚙️)
10. **Vuelve a inicio** → Back to Register

---

**Última actualización**: Mayo 2026  
**Estado**: ✅ FLUJO CONECTADO Y FUNCIONAL
