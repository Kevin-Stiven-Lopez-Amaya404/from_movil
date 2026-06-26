# 🚀 GUÍA RÁPIDA - Smart Home App

## 🎯 En 30 segundos

- **¿Qué es?** App mobile para controlar hogar inteligente
- **¿Dónde empiezo?** En `welcome.tsx`
- **¿Cómo entro?** Login con `pepe@smarthome.com` / `Smart123!`
- **¿Qué puedo hacer?** Ver dispositivos, reportes, ajustes
- **¿Cómo salgo?** Botón Cerrar Sesión en Ajustes (⚙️)

---

## 📁 ESTRUCTURA RÁPIDA

```
Autenticación (raíz de /app)
├─ welcome     → Inicio
├─ login       → Entrar (redirige a /(tabs))
├─ register    → Crear cuenta
├─ forgot-password → Recuperar
├─ otp-verification → Verificar código
└─ new-password → Nueva contraseña

App (dentro de /app/(tabs))
├─ index (🏠)  → Dashboard principal
├─ devices (⚡) → Dispositivos
├─ reports (📊) → Gráficas
└─ settings (⚙️) → Configuración + LOGOUT
```

---

## 💻 COMANDOS ÚTILES

```bash
# Arrancar proyecto
npm start

# Ver errores (linter)
npm run lint

# Instalar paquete nuevo
npm install nombre-paquete

# Borrar caché
npm cache clean --force
```

---

## 🔐 CREDENCIALES TEST

| Campo | Valor |
|-------|-------|
| Email | `pepe@smarthome.com` |
| Pass | `Smart123!` |
| OTP | `222222` |

---

## 🎨 COLORES PRINCIPALES

```
Primario:   #0864C8 (Azul)
Fondo:      #FFFFFF (Blanco)
Texto:      #454545 (Gris oscuro)
Acento:     #DDDDFB (Lila)
Error:      #FF3B20 (Rojo)
Éxito:      #2AAF5D (Verde)
```

---

## 📍 NAVEGACIÓN FLUJOS

```
REGISTRO NUEVO:
Welcome → Registrarse → Register → (validar) → Login → /(tabs)

ACCESO EXISTENTE:
Welcome → Inicia sesión → Login → (validar) → /(tabs)

RECUPERAR:
Login → ¿Olvidó? → Forgot → Email → OTP → New Pass → Login

SALIR:
/(tabs)/settings → Cerrar Sesión → Welcome
```

---

## ⚡ FUNCIONALIDADES

✅ Autenticación completa (login/registro/recuperar)  
✅ 4 tabs principales funcionales  
✅ Mock data para todas las pantallas  
✅ Validación de formularios  
✅ Tema centralizado  
✅ Navegación clara  
✅ Logout disponible  

---

## 🔍 DÓNDE BUSCAR COSAS

| Necesito... | Está en... |
|------------|-----------|
| Colores y fuentes | `/constants/theme.ts` |
| Rutas principales | `/app/_layout.tsx` |
| Rutas de tabs | `/app/(tabs)/_layout.tsx` |
| Pantalla login | `/app/login.tsx` |
| Dashboard | `/app/(tabs)/index.tsx` |
| Logica de logout | `/app/(tabs)/settings.tsx` |

---

## 🧪 TESTING RÁPIDO

1. **Ver bienvenida**: Acceder a `npm start`
2. **Probar registro**: Click "Registrarse" → Llenar → Crear → Login
3. **Probar login**: Click "Inicia sesión" → Usar demo → Entrar
4. **Ver tabs**: Dentro → Cambiar entre 🏠⚡📊⚙️
5. **Probar logout**: Ir a ⚙️ → Cerrar Sesión → Volver a Welcome

---

## ⚠️ ERRORES COMUNES

| Error | Solución |
|-------|----------|
| "Cannot find module" | `npm install` |
| Error en compilación | Revisar `npm run lint` |
| VS Code muestra errores fantasma | Reinicia editor + `npm cache clean` |

---

## 📞 ARCHIVOS IMPORTANTES PARA EDITAR

- **Agregar pantalla**: Crear en `/app` o `/app/(tabs)` + agregar a `_layout.tsx`
- **Cambiar colores**: Editar `/constants/theme.ts`
- **Agregar validación**: Editar en la pantalla (ej: `login.tsx`)
- **Cambiar flujo**: Editar `_layout.tsx` y las funciones de `router.push/replace`

---

## 🎓 TIPS PRO

💡 Usa el botón "demo" en login para no escribir credenciales  
💡 El código OTP es `222222` en todos lados  
💡 Todos los datos están en constants o mock arrays  
💡 Los estilos usan el tema centralizado (no hardcodear colores)  
💡 Usa `router.replace()` para no volver atrás  
💡 Usa `router.push()` para permitir volver atrás

---

## 🚀 PARA PRODUCTIVO

Reemplazar:
- ✏️ `MOCK_USERS` → API de login
- ✏️ Mock arrays → Datos reales
- ✏️ Tokens en memoria → AsyncStorage
- ✏️ OTP demo → OTP real
- ✏️ Validación mock → Validación servidor

---

**Última actualización**: Mayo 2026
