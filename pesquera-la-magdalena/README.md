# Pesquera La Magdalena — control interno

Ventas por peso, fiados, abonos, caja, usuarios con roles e historial de movimientos.
Next.js + Supabase (base de datos y usuarios) + Vercel (alojamiento). Gratis.

## Probar en su PC
1. Instalar Node.js 22 o superior.
2. Copiar `.env.example` a `.env.local`.
3. `npm install` y luego `npm run dev`. Abrir http://localhost:3000

## Roles
- **coordinador**: todo, incluye usuarios e historial. El primer usuario creado en Supabase queda así.
- **dueño**: solo ve (deudas, caja, ventas, historial, reportes).
- **contadora**: registra clientes, ventas, abonos, caja, precios; anula con motivo.
- **vendedor**: registra sus propias ventas y abonos.
- Quien no tiene rol queda «pendiente» y no ve nada.

## Seguridad
- RLS activo en todas las tablas: los permisos se validan en la base de datos, no solo en la pantalla.
- Nada se borra ni se edita: los registros se **anulan** con motivo y responsable (triggers en la base).
- Historial automático de cada cambio (tabla `auditoria`).
- La app no usa claves secretas; las variables solo viven en el servidor.
- Cabeceras HTTP: CSP, HSTS, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy.
- Entradas validadas con Zod en cada acción; mensajes de error por códigos (sin texto libre en la URL).

## Cambios a la base de datos
Están en la carpeta `supabase/migrations`.
