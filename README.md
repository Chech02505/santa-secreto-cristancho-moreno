# Santa Secreto — Familia Cristancho Moreno

Página navideña privada para intercambio de regalos entre integrantes de una familia. Interfaz adaptable a celulares, inscripción individual con usuario y contraseña, lista de deseos privada, sorteo aleatorio sin autorregalos y panel organizador que muestra solamente cantidades.

## Instalación

Lee primero **[GUIA_INSTALACION_Y_USO.md](GUIA_INSTALACION_Y_USO.md)** para crear la base PostgreSQL en Neon, configurar tus variables locales, ejecutar la web y publicarla con GitHub/Vercel.

```bash
npm install
# Crear .env.local a partir de .env.example y ejecutar db/schema.sql en Neon
npm run dev
```

Web local: http://localhost:3000

## Tecnología

Next.js 15 (App Router), TypeScript, PostgreSQL (Neon), @neondatabase/serverless, bcryptjs y jose. Sin servicios de correo ni teléfono.

## Seguridad

Nunca publiques `.env.local` ni la conexión de Neon. Si el proyecto se despliega con la base real, no uses usuarios ficticios para pruebas del sorteo: es definitivo. La organizadora no puede acceder desde su panel a la lista de nombres, deseos o parejas, pero un propietario de la base con acceso SQL sí tiene capacidad administrativa sobre los datos.
