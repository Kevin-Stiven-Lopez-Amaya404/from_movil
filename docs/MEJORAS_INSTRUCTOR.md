# Mejoras implementadas según retroalimentación del instructor

## Roles
- **Administrador:** puede gestionar hogares, dispositivos, metas de consumo y accesos.
- **Miembro:** solo ve los hogares que tiene asignados y puede controlar dispositivos.
- **Invitado:** solo ve los hogares asignados y queda en modo consulta; no puede modificar dispositivos ni accesos.

## Dashboard y consumo
- El dashboard calcula el consumo del hogar sumando la energía (`energy`) de todos sus dispositivos mediante `getHouseConsumption`.
- La meta mensual es editable desde el dashboard.
- Al llegar al 80% se genera alerta preventiva; al llegar al 100% la meta queda superada.
- Las alertas se calculan por hogar y respetan los permisos de acceso.
- No se agregaron tarifas, porque el frontend no dispone de todas las variables necesarias para calcularlas de forma confiable.

## Accesos
- Se agregó **Gestionar miembros e invitados**.
- El administrador puede asignar una persona a uno o varios hogares.
- Las pantallas Dashboard, Hogares, Dispositivos, Alertas y Reportes filtran los datos según los hogares permitidos.

## Control de dispositivos
- Se separó correctamente `online` (conectividad) de `state` (encendido/apagado).
- **Apagar todos** y **Encender todos** ahora modifican el estado real de todos los dispositivos del hogar activo.
- La acción rápida muestra si se ejecutará **ahora** y la hora del último cambio registrado.

## Responsive
- Los controles de reportes se vuelven desplazables horizontalmente en pantallas estrechas.
- Se conservan tarjetas apiladas y contenido flexible para móvil.
- Las vistas **Semana, Mes y Año** se mantienen accesibles sin desbordamientos horizontales.

## Credenciales demo
- Administrador: `admin@smarthome.com` / `1234`
- Miembro: `miembro@smarthome.com` / `1234`
- Invitado: `invitado@smarthome.com` / `1234`
- Miembro alternativo: `pepe@smarthome.com` / `Smart123!`

> Estas asignaciones son de demostración local. En una versión conectada a backend deben persistirse en la base de datos y validarse en servidor, no solamente en el cliente.
